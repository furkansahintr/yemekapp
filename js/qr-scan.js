/* ═══════════════════════════════════════════════════════════════════
   QR OKUT — Masaya bağlanma & dijital menü akışı
   1) Hesabım > "QR ile Masaya Bağlan" tile'ı openQrScanner() çağırır.
   2) Uygulama içi simüle edilmiş kamera/QR scanner overlay'i açılır.
   3) Okutulan QR doğrulanır (BIZ_BUSINESS + BIZ_BRANCHES + BIZ_TABLES).
   4) Başarıyla doğrulandığında dijital menü sayfasına yönlendirilir.
   5) Menü ekranının üstünde "X Restoranı — Şube — Masa N" bilgi barı
      kullanıcının seçimlerini o masayla ilişkilendirir.
   ─────────────────────────────────────────────────────────────────── */

/* ── Aktif Masa Oturumu (state) ── */
let _activeTableSession = null;
/*
  Şekil:
  {
    sessionId: 'sess_...',
    businessId, businessName,
    branchId,   branchName, branchAddress,
    tableId,    tableNumber,
    cart: [ { menuItemId, name, price, qty } ],
    startedAt: ISO,
    geoVerified: true | false | null
  }
*/

/* ── Demo QR örnekleri (gerçek hayatta masaya yapışan QR'lar) ──
   Format: yemekapp://table?b=bus_001&br=b1&t=t12&sig=abcd
   Smart Link: https://yemekapp.app/t/<token> → uygulamaya derin bağlantı.
   Aşağıdaki demo veriler gerçek BIZ_TABLES ile eşleşir.
*/
const _QR_DEMO_SAMPLES = [
  { label: 'Lezzet Mutfak — Kadıköy / Masa 5',  payload: { biz: 'bus_001', branch: 'b1', table: 't5'  }, valid: true  },
  { label: 'Lezzet Mutfak — Kadıköy / Masa 8',  payload: { biz: 'bus_001', branch: 'b1', table: 't8'  }, valid: true  },
  { label: 'Lezzet Mutfak — Kadıköy / Masa 12', payload: { biz: 'bus_001', branch: 'b1', table: 't12' }, valid: true  },
  { label: 'Geçersiz QR (test)',                payload: { biz: 'bus_001', branch: 'b1', table: 't99' }, valid: false }
];

/* ── İŞLETME GÖRÜNTÜLEME MODLARI (4 mod) ──
   Gerçek uygulamada işletme paneli "Masa QR Ayarları" altında bu modu seçer.
   Şu an demo amaçlı 'full' modu sabitlenmiştir; alttaki seçici ile değiştirilebilir.
   - menu_only      : Sadece menüyü göster (sipariş & garson kapalı)
   - waiter_only    : Garson çağırma açık, online sipariş kapalı
   - order_waiter   : Sipariş & garson açık, ödeme kapalı
   - full           : Sipariş + garson + dijital ödeme açık
*/
const _QR_DISPLAY_MODES = [
  { id: 'menu_only',    label: 'Sadece Menü',        desc: 'Yalnızca menü incelenir, sipariş kapalı' },
  { id: 'waiter_only',  label: 'Menü + Garson',      desc: 'Garson çağrılabilir, online sipariş kapalı' },
  { id: 'order_waiter', label: 'Sipariş + Garson',   desc: 'Hem online sipariş hem garson çağırma' },
  { id: 'full',         label: 'Sipariş + Ödeme',    desc: 'Sipariş, garson çağırma ve QR ile ödeme' }
];
let _qrBusinessDisplayMode = 'full'; /* default: tüm özellikler açık */

/* ── İŞLETME EK BİLGİLERİ (mock) ── */
const _QR_BIZ_EXTRA = {
  bus_001: {
    wifi: { ssid: 'LezzetMutfak_Misafir', password: 'Lezzet2026', security: 'WPA2' },
    stories: [
      { id: 'st1', title: 'Bugünün Şefi',     img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop', isNew: true },
      { id: 'st2', title: 'Yeni Menü',        img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',  isNew: true },
      { id: 'st3', title: 'Mevsim Tatlısı',   img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop',    isNew: true },
      { id: 'st4', title: 'Etkinlik',         img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',  isNew: false },
      { id: 'st5', title: 'Müşteri Anları',   img: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=200&h=200&fit=crop',    isNew: false }
    ]
  }
};

/* ── SSID DOĞRULAMA DURUMU ──
   - idle    : kontrol başlamadı
   - scanning: tarama yapılıyor
   - matched : işletmenin SSID'si menzilde bulundu (interaktif özellikler açılır)
   - missing : SSID bulunamadı (sadece menü görüntüleme)
*/
let _qrSsidState = 'idle';
/* Demo: kullanıcı manuel olarak değiştirebilir */
let _qrSsidVisibleOnDevice = true;

/* ─────────────────────────────────────────────────────────────────
   1. SCANNER OVERLAY
   ───────────────────────────────────────────────────────────────── */
function openQrScanner() {
  closeQrScanner();
  var overlay = document.createElement('div');
  overlay.id = 'qrScannerOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';
  overlay.style.background = '#000';

  overlay.innerHTML = ''
    + '<div style="position:relative;flex:1;display:flex;flex-direction:column;color:#fff">'
    /* Üst bar */
    + '  <div style="position:absolute;top:0;left:0;right:0;z-index:5;padding:max(env(safe-area-inset-top),16px) 16px 12px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 100%)">'
    + '    <div onclick="closeQrScanner()" style="width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer">'
    + '      <iconify-icon icon="solar:arrow-left-outline" style="font-size:20px;color:#fff"></iconify-icon>'
    + '    </div>'
    + '    <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">QR Menü Okut</div>'
    + '    <div onclick="_qrToggleTorch(this)" style="width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer">'
    + '      <iconify-icon icon="solar:flashlight-outline" style="font-size:20px;color:#fff"></iconify-icon>'
    + '    </div>'
    + '  </div>'
    /* Kamera arka planı (simülasyon: gradient + animasyonlu overlay) */
    + '  <div id="qrCameraStage" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#1e293b 0%,#020617 75%);overflow:hidden">'
    + '    <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 2px,transparent 2px,transparent 4px)"></div>'
    + '  </div>'
    /* QR çerçevesi */
    + '  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-58%);width:240px;height:240px;pointer-events:none">'
    + '    <div style="position:absolute;top:0;left:0;width:34px;height:34px;border-top:3px solid #22D3EE;border-left:3px solid #22D3EE;border-radius:6px 0 0 0"></div>'
    + '    <div style="position:absolute;top:0;right:0;width:34px;height:34px;border-top:3px solid #22D3EE;border-right:3px solid #22D3EE;border-radius:0 6px 0 0"></div>'
    + '    <div style="position:absolute;bottom:0;left:0;width:34px;height:34px;border-bottom:3px solid #22D3EE;border-left:3px solid #22D3EE;border-radius:0 0 0 6px"></div>'
    + '    <div style="position:absolute;bottom:0;right:0;width:34px;height:34px;border-bottom:3px solid #22D3EE;border-right:3px solid #22D3EE;border-radius:0 0 6px 0"></div>'
    + '    <div id="qrScanLine" style="position:absolute;left:8px;right:8px;top:0;height:2px;background:linear-gradient(90deg,transparent 0%,#22D3EE 50%,transparent 100%);box-shadow:0 0 12px #22D3EE;animation:qrScanLineAnim 2.4s ease-in-out infinite"></div>'
    + '  </div>'
    /* Bilgi metni */
    + '  <div style="position:absolute;left:0;right:0;top:calc(50% + 100px);text-align:center;padding:0 24px;color:rgba(255,255,255,.85)">'
    + '    <div style="font:var(--fw-semibold) var(--fs-md)/1.3 var(--font)">QR kodu çerçeve içine yerleştir</div>'
    + '    <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);margin-top:6px;color:rgba(255,255,255,.6)">Masaya yapışkanlı QR\'ı kameraya gösterdiğinde otomatik okunur</div>'
    + '  </div>'
    /* Demo paneli (prototip — gerçekte kamera çekecek) */
    + '  <div style="position:absolute;left:0;right:0;bottom:0;padding:16px 16px max(env(safe-area-inset-bottom),16px);background:linear-gradient(0deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,0) 100%)">'
    + '    <div style="background:rgba(15,23,42,.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:var(--r-xl);padding:14px">'
    + '      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    + '        <iconify-icon icon="solar:test-tube-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
    + '        <div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#F59E0B;letter-spacing:.4px;text-transform:uppercase">Demo • Test QR\'ları</div>'
    + '      </div>'
    + '      <div id="qrDemoList" style="display:flex;flex-direction:column;gap:6px"></div>'
    + '      <div style="font:var(--fw-regular) 11px/1.4 var(--font);color:rgba(255,255,255,.45);margin-top:10px;text-align:center">Gerçek uygulamada bu liste yerine cihaz kamerası çalışır.</div>'
    + '    </div>'
    + '  </div>'
    + '</div>';

  /* Animation keyframes (yalnızca bir kez ekle) */
  if (!document.getElementById('qrScanStyles')) {
    var st = document.createElement('style');
    st.id = 'qrScanStyles';
    st.textContent = '@keyframes qrScanLineAnim{0%{top:8px;opacity:.2}20%{opacity:1}50%{top:calc(100% - 10px);opacity:1}80%{opacity:1}100%{top:8px;opacity:.2}}'
      + '@keyframes qrPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.08);opacity:1}}';
    document.head.appendChild(st);
  }

  document.getElementById('phone').appendChild(overlay);

  /* Demo örneklerini doldur */
  var listEl = document.getElementById('qrDemoList');
  if (listEl) {
    listEl.innerHTML = _QR_DEMO_SAMPLES.map(function(s, i) {
      var color = s.valid ? '#22D3EE' : '#F87171';
      var icon  = s.valid ? 'solar:qr-code-linear' : 'solar:close-circle-linear';
      return '<div onclick="_qrSimulateScan(' + i + ')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:var(--r-lg);cursor:pointer">'
        + '<iconify-icon icon="' + icon + '" style="font-size:18px;color:' + color + '"></iconify-icon>'
        + '<span style="flex:1;font:var(--fw-medium) var(--fs-xs)/1.2 var(--font);color:#fff">' + s.label + '</span>'
        + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:rgba(255,255,255,.4)"></iconify-icon>'
        + '</div>';
    }).join('');
  }
}

function closeQrScanner() {
  var el = document.getElementById('qrScannerOverlay');
  if (el) el.remove();
}

function _qrToggleTorch(btn) {
  if (!btn) return;
  var on = btn.getAttribute('data-torch') === '1';
  btn.setAttribute('data-torch', on ? '0' : '1');
  btn.style.background = on ? 'rgba(0,0,0,.45)' : 'rgba(34,211,238,.25)';
  var stage = document.getElementById('qrCameraStage');
  if (stage) stage.style.background = on
    ? 'radial-gradient(circle at 50% 40%,#1e293b 0%,#020617 75%)'
    : 'radial-gradient(circle at 50% 40%,#475569 0%,#0f172a 75%)';
}

/* ─────────────────────────────────────────────────────────────────
   2. QR DOĞRULAMA & YÖNLENDİRME
   ───────────────────────────────────────────────────────────────── */
function _qrSimulateScan(idx) {
  var sample = _QR_DEMO_SAMPLES[idx];
  if (!sample) return;
  _qrShowFeedback('scanning');
  setTimeout(function() {
    var result = _validateTableQr(sample.payload);
    if (!result.ok) {
      _qrShowFeedback('error', result.error);
      return;
    }
    _qrShowFeedback('success', result);
    setTimeout(function() {
      closeQrScanner();
      _startTableSession(result);
      openTableMenuPage();
    }, 700);
  }, 650);
}

function _validateTableQr(payload) {
  if (!payload || !payload.biz || !payload.branch || !payload.table) {
    return { ok: false, error: 'QR formatı geçersiz' };
  }
  /* İşletme kontrolü */
  if (typeof BIZ_BUSINESS === 'undefined' || BIZ_BUSINESS.id !== payload.biz) {
    return { ok: false, error: 'İşletme bulunamadı' };
  }
  /* Şube kontrolü */
  var branch = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.find(function(b){ return b.id === payload.branch; }) : null;
  if (!branch) return { ok: false, error: 'Şube bulunamadı' };
  if (branch.status === 'closed') return { ok: false, error: branch.name + ' şu anda kapalı' };
  /* Masa kontrolü */
  var table = (typeof BIZ_TABLES !== 'undefined') ? BIZ_TABLES.find(function(t){ return t.id === payload.table && t.branchId === payload.branch; }) : null;
  if (!table) return { ok: false, error: 'Bu masa bulunamadı' };
  /* (Opsiyonel) konum kontrolü — şu an sembolik olarak true */
  var geoVerified = true;
  return {
    ok: true,
    business: BIZ_BUSINESS,
    branch: branch,
    table: table,
    geoVerified: geoVerified
  };
}

function _qrShowFeedback(type, data) {
  var stage = document.getElementById('qrCameraStage');
  if (!stage) return;
  if (type === 'scanning') {
    stage.style.background = 'radial-gradient(circle at 50% 40%,#0e7490 0%,#020617 75%)';
    return;
  }
  if (type === 'success') {
    stage.style.background = 'radial-gradient(circle at 50% 40%,#15803d 0%,#022c22 75%)';
    var existing = document.getElementById('qrToast'); if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'qrToast';
    toast.style.cssText = 'position:absolute;left:50%;top:calc(50% + 170px);transform:translateX(-50%);background:rgba(34,197,94,.95);color:#fff;padding:10px 16px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);display:flex;align-items:center;gap:8px;animation:qrPulse .6s ease-out';
    toast.innerHTML = '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon><span>' + (data && data.branch ? data.branch.name + ' • Masa ' + data.table.number : 'Bağlandı') + '</span>';
    stage.parentElement.appendChild(toast);
    return;
  }
  if (type === 'error') {
    stage.style.background = 'radial-gradient(circle at 50% 40%,#7f1d1d 0%,#0f172a 75%)';
    var existing2 = document.getElementById('qrToast'); if (existing2) existing2.remove();
    var t2 = document.createElement('div');
    t2.id = 'qrToast';
    t2.style.cssText = 'position:absolute;left:50%;top:calc(50% + 170px);transform:translateX(-50%);background:rgba(239,68,68,.95);color:#fff;padding:10px 16px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);display:flex;align-items:center;gap:8px';
    t2.innerHTML = '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon><span>' + (data || 'Geçersiz QR') + '</span>';
    stage.parentElement.appendChild(t2);
    setTimeout(function() {
      if (t2 && t2.parentElement) t2.remove();
      stage.style.background = 'radial-gradient(circle at 50% 40%,#1e293b 0%,#020617 75%)';
    }, 1800);
  }
}

/* ─────────────────────────────────────────────────────────────────
   3. AKTİF MASA OTURUMU
   ───────────────────────────────────────────────────────────────── */
function _startTableSession(res) {
  _activeTableSession = {
    sessionId: 'sess_' + Date.now(),
    businessId: res.business.id,
    businessName: res.business.name,
    branchId: res.branch.id,
    branchName: res.branch.name,
    branchAddress: res.branch.address,
    tableId: res.table.id,
    tableNumber: res.table.number,
    cart: [],
    startedAt: new Date().toISOString(),
    geoVerified: !!res.geoVerified,
    /* Cross-platform — gerçekte UA / installed app prob ile belirlenir.
       Demo amaçlı 'app' sabitlendi; aşağıdaki rozet 'Web Görünüm'e geçer. */
    platform: 'app',
    /* Hangi gösterim modunda olduğunu da masa oturumuna kopyala
       (işletme paneli sonradan değiştirse bu masa oturumu kendi modunda kalır). */
    displayMode: _qrBusinessDisplayMode
  };
  /* SSID kontrolü her oturum başında sıfırlanır */
  _qrSsidState = 'idle';
}

function endTableSession() {
  if (!_activeTableSession) { closeTableMenuPage(); return; }
  var ok = confirm('Masa oturumunuzu sonlandırmak istiyor musunuz? Sepetinizdeki seçimler silinecek.');
  if (!ok) return;
  _activeTableSession = null;
  closeTableMenuPage();
}

/* ─────────────────────────────────────────────────────────────────
   4. DİJİTAL MENÜ SAYFASI
   ───────────────────────────────────────────────────────────────── */
let _menuActiveCategory = null;

function openTableMenuPage() {
  if (!_activeTableSession) return;
  closeTableMenuPage();
  var s = _activeTableSession;
  var modeMeta = _QR_DISPLAY_MODES.find(function(m){ return m.id === s.displayMode; }) || _QR_DISPLAY_MODES[3];
  var platformBadge = s.platform === 'app'
    ? { label: 'Uygulama Görünümü', icon: 'solar:smartphone-bold', color: '#22D3EE' }
    : { label: 'Web Görünüm',       icon: 'solar:globe-bold',      color: '#A855F7' };

  var overlay = document.createElement('div');
  overlay.id = 'tableMenuOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';

  overlay.innerHTML = ''
    + '<div class="prof-container">'
    /* Sticky top bar — sayfa başlığı + platform rozeti */
    + '  <div class="prof-topbar" style="gap:10px">'
    + '    <div class="btn-icon" onclick="endTableSession()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">'
    + '      <span class="prof-topbar-name" style="font-size:var(--fs-lg)">Dijital Menü</span>'
    + '      <span style="display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10px/1 var(--font);color:' + platformBadge.color + '"><iconify-icon icon="' + platformBadge.icon + '" style="font-size:12px"></iconify-icon>' + platformBadge.label + '</span>'
    + '    </div>'
    + '    <div onclick="_qrOpenModeSelector()" class="btn-icon" title="Görüntüleme modu (demo)"><iconify-icon icon="solar:settings-linear" style="font-size:18px"></iconify-icon></div>'
    + '  </div>'
    /* Aktif Masa Bilgi Barı (header — büyük masa numarası) */
    + '  <div id="tableBanner" style="margin:0 var(--app-px) 12px;border-radius:var(--r-xl);padding:16px;background:linear-gradient(135deg,#0f766e 0%,#0d9488 55%,#22d3ee 100%);color:#fff;display:flex;align-items:center;gap:14px;box-shadow:0 6px 18px rgba(13,148,136,.28);position:relative;overflow:hidden">'
    + '    <div style="position:absolute;top:-22px;right:-22px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.08)"></div>'
    + '    <div style="position:absolute;bottom:-30px;left:-25px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.05)"></div>'
    /* Büyük masa numarası rozeti */
    + '    <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;position:relative">'
    + '      <span style="font:var(--fw-medium) 9px/1 var(--font);color:rgba(255,255,255,.8);letter-spacing:.5px">MASA</span>'
    + '      <span style="font:var(--fw-bold) 28px/1 var(--font);color:#fff;margin-top:3px">' + s.tableNumber + '</span>'
    + '    </div>'
    + '    <div style="flex:1;min-width:0;position:relative">'
    + '      <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:#fff">' + _esc(s.businessName) + '</div>'
    + '      <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:rgba(255,255,255,.9);margin-top:3px">' + _esc(s.branchName) + '</div>'
    + '      <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:rgba(255,255,255,.7);margin-top:5px;display:flex;align-items:center;gap:5px">'
    + '        <iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>Bağlandı: ' + _formatTime(s.startedAt)
    + '        <span style="opacity:.6">·</span>'
    + '        <iconify-icon icon="solar:tuning-square-2-linear" style="font-size:11px"></iconify-icon>' + _esc(modeMeta.label)
    + '      </div>'
    + '    </div>'
    + '    <div onclick="endTableSession()" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;position:relative" title="Oturumu sonlandır">'
    + '      <iconify-icon icon="solar:close-circle-linear" style="font-size:16px;color:#fff"></iconify-icon>'
    + '    </div>'
    + '  </div>'
    /* SSID güvenlik durumu */
    + '  <div id="qrSsidStatus" style="margin:0 var(--app-px) 12px"></div>'
    /* İşletme hikayeleri (Instagram stili) */
    + '  <div id="qrStoriesRow" style="padding:0 var(--app-px);margin-bottom:14px"></div>'
    /* WiFi bilgisi */
    + '  <div id="qrWifiCard" style="margin:0 var(--app-px) 14px"></div>'
    /* Kategori sekmeleri */
    + '  <div style="padding:0 var(--app-px);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">'
    + '    <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Menü</span>'
    + '    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)" id="qrMenuItemCount"></span>'
    + '  </div>'
    + '  <div id="menuCategoryTabs" style="padding:0 var(--app-px);display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:10px"></div>'
    /* Menü içerik alanı */
    + '  <div id="menuContent" style="flex:1;overflow-y:auto;padding:0 var(--app-px) 130px"></div>'
    /* Sticky alt bar — sepet özeti / garson çağırma */
    + '  <div id="menuCartBar" style="position:sticky;bottom:0;background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border-top:1px solid var(--border-subtle);padding:12px var(--app-px) max(env(safe-area-inset-bottom),14px);display:none"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  _renderSsidStatus();
  _renderStoriesRow();
  _renderWifiCard();
  _renderTableMenuCategories();
  _renderTableMenuContent();
  _renderCartBar();
  /* SSID kontrolünü otomatik başlat */
  if (_qrSsidState === 'idle') _qrStartSsidScan();
}

function closeTableMenuPage() {
  var el = document.getElementById('tableMenuOverlay');
  if (el) el.remove();
}

function _renderTableMenuCategories() {
  var s = _activeTableSession;
  if (!s) return;
  var items = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : [])
    .filter(function(m){ return m.branchId === s.branchId && m.status === 'active'; });
  var categories = [];
  items.forEach(function(it){ if (categories.indexOf(it.category) === -1) categories.push(it.category); });
  if (!_menuActiveCategory && categories.length) _menuActiveCategory = categories[0];

  var html = categories.map(function(cat){
    var active = cat === _menuActiveCategory;
    var bg = active ? 'background:var(--primary);color:#fff' : 'background:var(--glass-card);color:var(--text-secondary)';
    return '<div onclick="_setMenuCategory(\'' + cat.replace(/'/g, "\\'") + '\')" style="padding:8px 16px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;white-space:nowrap;flex-shrink:0;' + bg + '">' + _esc(cat) + '</div>';
  }).join('');
  var tabs = document.getElementById('menuCategoryTabs');
  if (tabs) tabs.innerHTML = html;
}

function _setMenuCategory(cat) {
  _menuActiveCategory = cat;
  _renderTableMenuCategories();
  _renderTableMenuContent();
}

function _renderTableMenuContent() {
  var s = _activeTableSession;
  if (!s) return;
  var container = document.getElementById('menuContent');
  if (!container) return;
  var items = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : [])
    .filter(function(m){ return m.branchId === s.branchId && m.status === 'active' && m.category === _menuActiveCategory; });

  if (!items.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)">'
      + '<iconify-icon icon="solar:dish-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon>'
      + '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Bu kategoride şu an seçenek yok</div>'
      + '</div>';
    return;
  }

  var html = '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">';
  items.forEach(function(it){
    var inCart = (s.cart || []).find(function(c){ return c.menuItemId === it.id; });
    var qty = inCart ? inCart.qty : 0;
    html += '<div style="display:flex;gap:12px;padding:12px;background:var(--glass-card);border-radius:var(--r-xl);align-items:center">'
      + '  <div style="width:54px;height:54px;border-radius:var(--r-lg);background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      + '    <iconify-icon icon="solar:dish-bold" style="font-size:26px;color:#fff"></iconify-icon>'
      + '  </div>'
      + '  <div style="flex:1;min-width:0">'
      + '    <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _esc(it.name) + '</div>'
      + '    <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + _esc(it.category) + '</div>'
      + '    <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);margin-top:6px">' + Number(it.price).toFixed(2) + ' ₺</div>'
      + '  </div>';
    if (qty > 0) {
      html += '  <div style="display:flex;align-items:center;gap:6px;background:var(--bg-page);border:1px solid var(--border-subtle);border-radius:var(--r-full);padding:4px">'
        + '    <div onclick="_changeMenuItemQty(\'' + it.id + '\',-1)" style="width:26px;height:26px;border-radius:50%;background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:minus-square-linear" style="font-size:14px"></iconify-icon></div>'
        + '    <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);min-width:18px;text-align:center">' + qty + '</span>'
        + '    <div onclick="_changeMenuItemQty(\'' + it.id + '\',1)" style="width:26px;height:26px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:add-square-linear" style="font-size:14px;color:#fff"></iconify-icon></div>'
        + '  </div>';
    } else {
      html += '  <div onclick="_changeMenuItemQty(\'' + it.id + '\',1)" style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer">'
        + '    <iconify-icon icon="solar:add-circle-linear" style="font-size:20px;color:#fff"></iconify-icon>'
        + '  </div>';
    }
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function _changeMenuItemQty(menuItemId, delta) {
  var s = _activeTableSession;
  if (!s) return;
  var items = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : []);
  var item = items.find(function(m){ return m.id === menuItemId; });
  if (!item) return;
  s.cart = s.cart || [];
  var existing = s.cart.find(function(c){ return c.menuItemId === menuItemId; });
  if (existing) {
    existing.qty += delta;
    if (existing.qty <= 0) s.cart = s.cart.filter(function(c){ return c.menuItemId !== menuItemId; });
  } else if (delta > 0) {
    s.cart.push({ menuItemId: item.id, name: item.name, price: item.price, qty: 1 });
  }
  _renderTableMenuContent();
  _renderCartBar();
}

function _renderCartBar() {
  var bar = document.getElementById('menuCartBar');
  var s = _activeTableSession;
  if (!bar || !s) return;
  var caps = _qrCurrentCapabilities();
  var totalQty = (s.cart || []).reduce(function(a,c){ return a + c.qty; }, 0);
  var totalPrice = (s.cart || []).reduce(function(a,c){ return a + c.qty * Number(c.price); }, 0);
  var locked = !caps.canOrder && !caps.canCallWaiter;

  /* Garson çağırma butonu, sepet boş olsa da modda izinliyse görünsün */
  if (!totalQty && !caps.canCallWaiter) { bar.style.display = 'none'; return; }
  if (!totalQty && caps.canCallWaiter) {
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.gap = '10px';
    bar.innerHTML = ''
      + '<div style="flex:1;font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">Yardıma mı ihtiyacınız var?</div>'
      + _renderWaiterButton(caps);
    return;
  }

  bar.style.display = 'flex';
  bar.style.flexDirection = 'column';
  bar.style.gap = '10px';
  var orderBtnHtml = '';
  if (caps.canOrder) {
    orderBtnHtml = '<button class="btn-primary" style="flex:1;padding:12px 16px;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);display:flex;align-items:center;justify-content:center;gap:6px" onclick="_sendTableOrder()"><iconify-icon icon="solar:chef-hat-bold" style="font-size:16px"></iconify-icon>Sipariş Ver</button>';
  } else {
    orderBtnHtml = '<button style="flex:1;padding:12px 16px;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);background:var(--glass-card);color:var(--text-muted);border:1px dashed var(--border-subtle);border-radius:var(--r-full);display:flex;align-items:center;justify-content:center;gap:6px;cursor:not-allowed" onclick="_qrShowLockedHint(\'order\')"><iconify-icon icon="solar:lock-keyhole-minimalistic-bold" style="font-size:14px"></iconify-icon>Sipariş Pasif</button>';
  }
  bar.innerHTML = ''
    + '<div style="display:flex;align-items:center;gap:12px">'
    + '  <div style="width:42px;height:42px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0">'
    + '    <iconify-icon icon="solar:cart-large-bold" style="font-size:22px;color:#fff"></iconify-icon>'
    + '    <span style="position:absolute;top:-4px;right:-4px;background:#0f172a;color:#fff;font:var(--fw-bold) 10px/1 var(--font);padding:3px 6px;border-radius:var(--r-full);min-width:18px;text-align:center">' + totalQty + '</span>'
    + '  </div>'
    + '  <div style="flex:1;min-width:0">'
    + '    <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Masa ' + s.tableNumber + ' sepeti</div>'
    + '    <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary);margin-top:3px">' + totalPrice.toFixed(2) + ' ₺</div>'
    + '  </div>'
    + '  ' + (caps.canCallWaiter ? _renderWaiterButton(caps) : '')
    + '</div>'
    + '<div style="display:flex;gap:8px">' + orderBtnHtml
    + (caps.canPay ? '<button onclick="_qrOpenPayment()" style="padding:12px 16px;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);background:#0f172a;color:#fff;border:none;border-radius:var(--r-full);display:flex;align-items:center;gap:6px;cursor:pointer"><iconify-icon icon="solar:wallet-money-bold" style="font-size:16px"></iconify-icon>Hesabı Kapat</button>' : '')
    + '</div>';
}

function _renderWaiterButton(caps) {
  if (!caps.canCallWaiter) return '';
  return '<button onclick="_qrCallWaiter()" style="padding:10px 14px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);background:#F59E0B;color:#fff;border:none;border-radius:var(--r-full);display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0">'
    + '<iconify-icon icon="solar:bell-bold" style="font-size:14px"></iconify-icon>Garson Çağır</button>';
}

function _sendTableOrder() {
  var s = _activeTableSession;
  if (!s || !s.cart || !s.cart.length) return;
  var caps = _qrCurrentCapabilities();
  if (!caps.canOrder) { _qrShowLockedHint('order'); return; }
  var lines = s.cart.map(function(c){ return c.qty + ' x ' + c.name; }).join('\n');
  alert('Siparişiniz mutfağa iletildi 🍽\n\nMasa: ' + s.tableNumber + ' (' + s.branchName + ')\n\n' + lines);
  s.cart = [];
  _renderTableMenuContent();
  _renderCartBar();
}

function _qrCallWaiter() {
  var s = _activeTableSession;
  if (!s) return;
  var caps = _qrCurrentCapabilities();
  if (!caps.canCallWaiter) { _qrShowLockedHint('waiter'); return; }
  _qrToast('Garson çağrıldı — Masa ' + s.tableNumber, '#F59E0B', 'solar:bell-bold');
}

/* ─────────────────────────────────────────────────────────────────
   5. GÖRÜNTÜLEME MODU YETENEKLERİ
   ───────────────────────────────────────────────────────────────── */
function _qrCurrentCapabilities() {
  var s = _activeTableSession || {};
  var mode = s.displayMode || 'full';
  /* SSID matched değilse interaktif özellikler kilitli */
  var ssidOk = (_qrSsidState === 'matched');
  var caps = { canOrder: false, canCallWaiter: false, canPay: false };
  if (mode === 'menu_only')      { /* hiçbiri açık değil */ }
  else if (mode === 'waiter_only')   caps.canCallWaiter = true;
  else if (mode === 'order_waiter')  { caps.canOrder = true; caps.canCallWaiter = true; }
  else if (mode === 'full')          { caps.canOrder = true; caps.canCallWaiter = true; caps.canPay = true; }
  /* SSID kontrolü uygulanır */
  if (!ssidOk) {
    caps.canOrder = false;
    caps.canCallWaiter = false;
    caps.canPay = false;
  }
  return caps;
}

function _qrShowLockedHint(which) {
  var msg = 'Bu özellik şu an kullanılamıyor.';
  if (_qrSsidState !== 'matched') {
    msg = 'Sipariş ve garson çağırma özellikleri sadece restoran içindeyken kullanılabilir.';
  } else {
    var s = _activeTableSession || {};
    var modeMeta = _QR_DISPLAY_MODES.find(function(m){ return m.id === s.displayMode; });
    msg = 'Bu işletme şu anda "' + (modeMeta ? modeMeta.label : s.displayMode) + '" modunu kullanıyor. ';
    if (which === 'order') msg += 'Online sipariş kapalıdır, garsondan yardım isteyebilirsiniz.';
    if (which === 'waiter') msg += 'Garson çağırma kapalıdır.';
  }
  _qrToast(msg, '#EF4444', 'solar:lock-keyhole-minimalistic-bold', 3200);
}

/* Mod seçici (demo amaçlı — gerçekte işletme panelinden ayarlanır) */
function _qrOpenModeSelector() {
  var s = _activeTableSession;
  if (!s) return;
  var existing = document.getElementById('qrModeSheet'); if (existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'qrModeSheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.45);display:flex;align-items:flex-end';
  var inner = '<div style="background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;width:100%;max-width:480px;margin:0 auto;padding:18px 18px max(env(safe-area-inset-bottom),18px)">'
    + '<div style="width:40px;height:4px;background:var(--text-muted);border-radius:2px;margin:0 auto 14px;opacity:.4"></div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">İşletme Görüntüleme Modu</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:14px">Demo: gerçek uygulamada işletme paneli "Masa QR Ayarları" altından seçer.</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px">';
  _QR_DISPLAY_MODES.forEach(function(m){
    var active = m.id === s.displayMode;
    inner += '<div onclick="_qrSetDisplayMode(\'' + m.id + '\')" style="padding:14px;border-radius:var(--r-xl);border:1.5px solid ' + (active ? 'var(--primary)' : 'var(--border-subtle)') + ';background:' + (active ? 'rgba(239,68,68,0.06)' : 'var(--glass-card)') + ';cursor:pointer;display:flex;align-items:center;gap:12px">'
      + '<iconify-icon icon="' + (active ? 'solar:check-circle-bold' : 'solar:radio-button-bold') + '" style="font-size:22px;color:' + (active ? 'var(--primary)' : 'var(--text-muted)') + '"></iconify-icon>'
      + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + m.label + '</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + m.desc + '</div></div>'
      + '</div>';
  });
  inner += '</div>'
    + '<button onclick="_qrCloseSheet(\'qrModeSheet\')" style="margin-top:14px;width:100%;padding:14px;background:var(--glass-card);color:var(--text-primary);border:none;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Kapat</button>'
    + '</div>';
  sheet.innerHTML = inner;
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}
function _qrCloseSheet(id) { var el = document.getElementById(id); if (el) el.remove(); }
function _qrSetDisplayMode(modeId) {
  var s = _activeTableSession;
  if (!s) return;
  s.displayMode = modeId;
  _qrBusinessDisplayMode = modeId;
  _qrCloseSheet('qrModeSheet');
  /* Headerdaki etiketi yenilemek için sayfayı tekrar aç */
  openTableMenuPage();
}

/* ─────────────────────────────────────────────────────────────────
   6. SSID GÜVENLİK KONTROLÜ (mock)
   ───────────────────────────────────────────────────────────────── */
function _renderSsidStatus() {
  var el = document.getElementById('qrSsidStatus');
  var s = _activeTableSession;
  if (!el || !s) return;
  var extra = _QR_BIZ_EXTRA[s.businessId] || {};
  var ssid = extra.wifi ? extra.wifi.ssid : 'Restoran WiFi';
  var st = _qrSsidState;
  var html = '';
  if (st === 'idle' || st === 'scanning') {
    html = '<div style="padding:12px 14px;border-radius:var(--r-xl);background:var(--glass-card);border:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px">'
      + '  <div style="width:32px;height:32px;border-radius:50%;background:rgba(168,85,247,.12);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:wi-fi-router-bold" style="font-size:18px;color:#A855F7"></iconify-icon></div>'
      + '  <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">Konum doğrulanıyor…</div>'
      + '  <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">"' + _esc(ssid) + '" ağı menzilde mi diye bakılıyor</div></div>'
      + '  <div style="width:18px;height:18px;border-radius:50%;border:2px solid #A855F7;border-top-color:transparent;animation:qrSpin .9s linear infinite"></div>'
      + '</div>';
  } else if (st === 'matched') {
    html = '<div style="padding:12px 14px;border-radius:var(--r-xl);background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);display:flex;align-items:center;gap:10px">'
      + '  <div style="width:32px;height:32px;border-radius:50%;background:rgba(34,197,94,.18);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:shield-check-bold" style="font-size:18px;color:#22C55E"></iconify-icon></div>'
      + '  <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:#15803D">Restoranda doğrulandı</div>'
      + '  <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Sipariş ve garson çağırma açık</div></div>'
      + '</div>';
  } else if (st === 'missing') {
    html = '<div style="padding:12px 14px;border-radius:var(--r-xl);background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.22);display:flex;align-items:center;gap:10px">'
      + '  <div style="width:32px;height:32px;border-radius:50%;background:rgba(239,68,68,.15);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:shield-cross-bold" style="font-size:18px;color:#EF4444"></iconify-icon></div>'
      + '  <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:#B91C1C">Restoran içinde değilsiniz</div>'
      + '  <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Sipariş ve garson çağırma yalnızca restoran WiFi menzilinde kullanılabilir</div></div>'
      + '  <div onclick="_qrStartSsidScan()" style="padding:6px 10px;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-full);font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);cursor:pointer">Tekrar Dene</div>'
      + '</div>';
  }
  el.innerHTML = html;
  if (!document.getElementById('qrSpinKf')) {
    var st2 = document.createElement('style'); st2.id = 'qrSpinKf';
    st2.textContent = '@keyframes qrSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
    document.head.appendChild(st2);
  }
}

function _qrStartSsidScan() {
  _qrSsidState = 'scanning';
  _renderSsidStatus();
  _renderCartBar();
  setTimeout(function(){
    _qrSsidState = _qrSsidVisibleOnDevice ? 'matched' : 'missing';
    _renderSsidStatus();
    _renderTableMenuContent();
    _renderCartBar();
  }, 1100);
}

/* Demo: kullanıcı SSID görünürlüğünü kapatabilsin (testler için). */
function _qrToggleSsidVisibility() {
  _qrSsidVisibleOnDevice = !_qrSsidVisibleOnDevice;
  _qrStartSsidScan();
}

/* ─────────────────────────────────────────────────────────────────
   7. İŞLETME HİKAYELERİ (Stories)
   ───────────────────────────────────────────────────────────────── */
function _renderStoriesRow() {
  var el = document.getElementById('qrStoriesRow');
  var s = _activeTableSession;
  if (!el || !s) return;
  var extra = _QR_BIZ_EXTRA[s.businessId] || {};
  var stories = extra.stories || [];
  if (!stories.length) { el.innerHTML = ''; return; }
  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    + '<iconify-icon icon="solar:gallery-bold" style="font-size:16px;color:#A855F7"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _esc(s.businessName) + ' Hikayeleri</span>'
    + '</div>'
    + '<div style="display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">';
  stories.forEach(function(st){
    var ringStyle = st.isNew
      ? 'background:linear-gradient(45deg,#F97316 0%,#EF4444 50%,#A855F7 100%);padding:2.5px'
      : 'background:var(--border-subtle);padding:2px';
    html += '<div onclick="_qrOpenStory(\'' + st.id + '\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex-shrink:0;width:64px">'
      + '<div style="width:64px;height:64px;border-radius:50%;' + ringStyle + '">'
      + '  <div style="width:100%;height:100%;border-radius:50%;background:var(--bg-page);padding:2px">'
      + '    <img src="' + st.img + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover" loading="lazy">'
      + '  </div>'
      + '</div>'
      + '<span style="font:var(--fw-medium) 10px/1.2 var(--font);color:var(--text-secondary);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(st.title) + '</span>'
      + '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
}
function _qrOpenStory(stId) {
  var s = _activeTableSession; if (!s) return;
  var extra = _QR_BIZ_EXTRA[s.businessId] || {}; var stories = extra.stories || [];
  var story = stories.find(function(x){ return x.id === stId; }); if (!story) return;
  /* Basit fullscreen story görüntüleyici */
  var v = document.createElement('div');
  v.id = 'qrStoryViewer';
  v.style.cssText = 'position:fixed;inset:0;z-index:130;background:#000;display:flex;flex-direction:column';
  v.innerHTML = ''
    + '<div style="position:absolute;top:0;left:0;right:0;z-index:5;padding:max(env(safe-area-inset-top),16px) 16px 12px;display:flex;align-items:center;gap:10px">'
    + '  <div style="height:3px;flex:1;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden"><div style="height:100%;width:0;background:#fff;animation:qrStoryProg 5s linear forwards"></div></div>'
    + '  <div onclick="_qrCloseSheet(\'qrStoryViewer\')" style="width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<img src="' + story.img + '" style="width:100%;height:100%;object-fit:cover">'
    + '<div style="position:absolute;left:0;right:0;bottom:0;padding:24px 18px max(env(safe-area-inset-bottom),18px);background:linear-gradient(0deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,0) 100%)">'
    + '  <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:#fff">' + _esc(story.title) + '</div>'
    + '  <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:rgba(255,255,255,.75);margin-top:4px">' + _esc(s.businessName) + ' • ' + _esc(s.branchName) + '</div>'
    + '</div>';
  if (!document.getElementById('qrStoryKf')) {
    var k = document.createElement('style'); k.id = 'qrStoryKf';
    k.textContent = '@keyframes qrStoryProg{from{width:0}to{width:100%}}';
    document.head.appendChild(k);
  }
  document.body.appendChild(v);
  setTimeout(function(){ var x = document.getElementById('qrStoryViewer'); if (x) x.remove(); }, 5200);
}

/* ─────────────────────────────────────────────────────────────────
   8. WIFI BİLGİ KARTI
   ───────────────────────────────────────────────────────────────── */
function _renderWifiCard() {
  var el = document.getElementById('qrWifiCard');
  var s = _activeTableSession;
  if (!el || !s) return;
  var extra = _QR_BIZ_EXTRA[s.businessId] || {};
  var wifi = extra.wifi;
  if (!wifi) { el.innerHTML = ''; return; }
  el.innerHTML = ''
    + '<div style="border-radius:var(--r-xl);padding:14px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);color:#fff;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden">'
    + '  <div style="position:absolute;top:-30px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.05)"></div>'
    + '  <div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '    <iconify-icon icon="solar:wi-fi-router-bold" style="font-size:22px;color:#22D3EE"></iconify-icon>'
    + '  </div>'
    + '  <div style="flex:1;min-width:0;position:relative">'
    + '    <div style="font:var(--fw-medium) 10px/1 var(--font);color:rgba(255,255,255,.6);letter-spacing:.5px;text-transform:uppercase">Misafir WiFi</div>'
    + '    <div style="font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:#fff;margin-top:4px">' + _esc(wifi.ssid) + '</div>'
    + '    <div onclick="_qrCopyText(\'' + wifi.password.replace(/\\/g,"\\\\").replace(/\'/g,"\\\'") + '\',this)" style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;background:rgba(0,0,0,.3);border:1px dashed rgba(255,255,255,.2);border-radius:var(--r-md);cursor:pointer">'
    + '      <iconify-icon icon="solar:lock-keyhole-minimalistic-linear" style="font-size:14px;color:rgba(255,255,255,.6)"></iconify-icon>'
    + '      <span style="flex:1;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#fff;letter-spacing:.5px;font-family:monospace">' + _esc(wifi.password) + '</span>'
    + '      <span data-copy-label style="font:var(--fw-medium) 10px/1 var(--font);color:#22D3EE">Kopyala</span>'
    + '    </div>'
    + '  </div>'
    + '</div>';
}
function _qrCopyText(text, el) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
  } catch (e) { /* sessizce yok say */ }
  if (el) {
    var lbl = el.querySelector('[data-copy-label]');
    if (lbl) {
      var prev = lbl.textContent;
      lbl.textContent = '✓ Kopyalandı';
      lbl.style.color = '#22C55E';
      setTimeout(function(){ lbl.textContent = prev; lbl.style.color = '#22D3EE'; }, 1400);
    }
  }
}

/* ─────────────────────────────────────────────────────────────────
   9. ÖDEME (mock)
   ───────────────────────────────────────────────────────────────── */
function _qrOpenPayment() {
  var s = _activeTableSession; if (!s) return;
  var caps = _qrCurrentCapabilities();
  if (!caps.canPay) { _qrShowLockedHint('order'); return; }
  var totalQty = (s.cart || []).reduce(function(a,c){ return a + c.qty; }, 0);
  var totalPrice = (s.cart || []).reduce(function(a,c){ return a + c.qty * Number(c.price); }, 0);
  /* Eğer sepet boşsa "açık hesabınız" varmış gibi sembolik bir tutar */
  var billItems = (s.cart && s.cart.length) ? s.cart : [
    { name: 'Adana Kebap',     qty: 1, price: 18.50 },
    { name: 'Çoban Salatası',  qty: 1, price: 7.50  },
    { name: 'Ayran',           qty: 2, price: 2.50  }
  ];
  var billTotal = (s.cart && s.cart.length) ? totalPrice : billItems.reduce(function(a,b){ return a + b.qty * b.price; }, 0);

  var sheet = document.createElement('div');
  sheet.id = 'qrPaymentSheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  var inner = '<div style="background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;width:100%;max-width:480px;margin:0 auto;padding:18px 18px max(env(safe-area-inset-bottom),18px);max-height:88%;overflow-y:auto">'
    + '<div style="width:40px;height:4px;background:var(--text-muted);border-radius:2px;margin:0 auto 14px;opacity:.4"></div>'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    + '  <div style="width:42px;height:42px;border-radius:12px;background:rgba(15,23,42,.08);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:wallet-money-bold" style="font-size:22px;color:#0f172a"></iconify-icon></div>'
    + '  <div style="flex:1"><div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font);color:var(--text-primary)">Hesabı Kapat</div>'
    + '  <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Masa ' + s.tableNumber + ' • ' + _esc(s.branchName) + '</div></div>'
    + '</div>'
    /* Bill list */
    + '<div style="background:var(--glass-card);border-radius:var(--r-xl);padding:12px;margin-bottom:12px">';
  billItems.forEach(function(b){
    inner += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0">'
      + '<span style="font:var(--fw-medium) var(--fs-xs)/1.2 var(--font);color:var(--text-secondary)">' + b.qty + ' × ' + _esc(b.name) + '</span>'
      + '<span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + (b.qty * Number(b.price)).toFixed(2) + ' ₺</span>'
      + '</div>';
  });
  inner += '<div style="height:1px;background:var(--border-subtle);margin:8px 0"></div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between"><span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Toplam</span>'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--primary)">' + billTotal.toFixed(2) + ' ₺</span></div>'
    + '</div>'
    /* Tip selector (mock) */
    + '<div style="margin-bottom:14px"><div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary);margin-bottom:8px">Bahşiş Ekle</div>'
    + '<div style="display:flex;gap:6px">'
    + '  <div onclick="_qrPickTip(this,0)" style="flex:1;text-align:center;padding:10px;background:var(--glass-card);border-radius:var(--r-md);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">Yok</div>'
    + '  <div onclick="_qrPickTip(this,5)" style="flex:1;text-align:center;padding:10px;background:var(--glass-card);border-radius:var(--r-md);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">%5</div>'
    + '  <div onclick="_qrPickTip(this,10)" style="flex:1;text-align:center;padding:10px;background:var(--glass-card);border-radius:var(--r-md);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">%10</div>'
    + '  <div onclick="_qrPickTip(this,15)" style="flex:1;text-align:center;padding:10px;background:var(--glass-card);border-radius:var(--r-md);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">%15</div>'
    + '</div></div>'
    /* Payment methods (mock) */
    + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary);margin-bottom:8px">Ödeme Yöntemi</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">'
    + '  <div onclick="_qrPickPay(this)" style="padding:14px;background:var(--glass-card);border:1.5px solid var(--primary);border-radius:var(--r-xl);display:flex;align-items:center;gap:12px;cursor:pointer">'
    + '    <iconify-icon icon="solar:card-bold" style="font-size:24px;color:var(--primary)"></iconify-icon>'
    + '    <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Kayıtlı Kart (Visa **34)</div>'
    + '    <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Tek tıkla öde</div></div>'
    + '    <iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '  </div>'
    + '  <div onclick="_qrPickPay(this)" style="padding:14px;background:var(--glass-card);border:1.5px solid var(--border-subtle);border-radius:var(--r-xl);display:flex;align-items:center;gap:12px;cursor:pointer">'
    + '    <iconify-icon icon="solar:wallet-2-bold" style="font-size:24px;color:#22D3EE"></iconify-icon>'
    + '    <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">YemekApp Cüzdan</div>'
    + '    <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Bakiye: 245,50 ₺</div></div>'
    + '  </div>'
    + '  <div onclick="_qrPickPay(this)" style="padding:14px;background:var(--glass-card);border:1.5px solid var(--border-subtle);border-radius:var(--r-xl);display:flex;align-items:center;gap:12px;cursor:pointer">'
    + '    <iconify-icon icon="solar:hand-money-bold" style="font-size:24px;color:#22C55E"></iconify-icon>'
    + '    <div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Garsona Nakit Öde</div>'
    + '    <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Hesabı garsona iletilir</div></div>'
    + '  </div>'
    + '</div>'
    /* Split bill (mock) */
    + '<div onclick="_qrToast(\'Bölüştürme yakında 🤝\',\'#A855F7\',\'solar:users-group-rounded-bold\')" style="text-align:center;padding:10px;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#A855F7;cursor:pointer;margin-bottom:14px">Hesabı Arkadaşlarımla Böl</div>'
    /* Pay button */
    + '<button class="btn-primary" style="width:100%;padding:14px;font:var(--fw-semibold) var(--fs-md)/1 var(--font);display:flex;align-items:center;justify-content:center;gap:8px" onclick="_qrConfirmPayment()">'
    + '  <iconify-icon icon="solar:lock-keyhole-bold" style="font-size:18px"></iconify-icon>Güvenli Öde — ' + billTotal.toFixed(2) + ' ₺</button>'
    + '<button onclick="_qrCloseSheet(\'qrPaymentSheet\')" style="margin-top:10px;width:100%;padding:12px;background:transparent;color:var(--text-muted);border:none;font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    + '</div>';
  sheet.innerHTML = inner;
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}
function _qrPickTip(el, pct) {
  if (!el || !el.parentElement) return;
  Array.prototype.forEach.call(el.parentElement.children, function(c){
    c.style.background = 'var(--glass-card)';
    c.style.color = 'var(--text-secondary)';
    c.style.border = 'none';
  });
  el.style.background = 'rgba(239,68,68,0.08)';
  el.style.color = 'var(--primary)';
  el.style.border = '1.5px solid var(--primary)';
}
function _qrPickPay(el) {
  if (!el || !el.parentElement) return;
  Array.prototype.forEach.call(el.parentElement.children, function(c){
    c.style.border = '1.5px solid var(--border-subtle)';
    var chk = c.querySelector('iconify-icon[icon="solar:check-circle-bold"]');
    if (chk) chk.remove();
  });
  el.style.border = '1.5px solid var(--primary)';
  if (!el.querySelector('iconify-icon[icon="solar:check-circle-bold"]')) {
    var chk = document.createElement('iconify-icon');
    chk.setAttribute('icon', 'solar:check-circle-bold');
    chk.style.cssText = 'font-size:20px;color:var(--primary)';
    el.appendChild(chk);
  }
}
function _qrConfirmPayment() {
  _qrCloseSheet('qrPaymentSheet');
  _qrToast('Ödemeniz alındı, afiyet olsun! 🎉', '#22C55E', 'solar:check-circle-bold', 2400);
  var s = _activeTableSession;
  if (s) { s.cart = []; _renderTableMenuContent(); _renderCartBar(); }
}

/* ─────────────────────────────────────────────────────────────────
   ORTAK TOAST
   ───────────────────────────────────────────────────────────────── */
function _qrToast(msg, color, icon, duration) {
  var existing = document.getElementById('qrAppToast'); if (existing) existing.remove();
  var t = document.createElement('div');
  t.id = 'qrAppToast';
  t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:140;background:' + (color || '#0f172a') + ';color:#fff;padding:12px 16px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);display:flex;align-items:center;gap:8px;max-width:88%;box-shadow:0 8px 20px rgba(0,0,0,.18)';
  t.innerHTML = '<iconify-icon icon="' + (icon || 'solar:info-circle-bold') + '" style="font-size:18px"></iconify-icon><span>' + _esc(msg) + '</span>';
  document.body.appendChild(t);
  setTimeout(function(){ if (t && t.parentElement) t.remove(); }, duration || 1800);
}

/* ─────────────────────────────────────────────────────────────────
   Yardımcı fonksiyonlar
   ───────────────────────────────────────────────────────────────── */
function _esc(str) {
  if (typeof escHtml === 'function') return escHtml(str);
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, function(ch){
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch];
  });
}
function _formatTime(iso) {
  try {
    var d = new Date(iso);
    var hh = String(d.getHours()).padStart(2,'0');
    var mm = String(d.getMinutes()).padStart(2,'0');
    return hh + ':' + mm;
  } catch (e) { return ''; }
}

/* Globale aç (HTML onclick'leri için) */
if (typeof window !== 'undefined') {
  window.openQrScanner = openQrScanner;
  window.closeQrScanner = closeQrScanner;
  window.openTableMenuPage = openTableMenuPage;
  window.closeTableMenuPage = closeTableMenuPage;
  window.endTableSession = endTableSession;
  window._qrSimulateScan = _qrSimulateScan;
  window._qrToggleTorch = _qrToggleTorch;
  window._setMenuCategory = _setMenuCategory;
  window._changeMenuItemQty = _changeMenuItemQty;
  window._sendTableOrder = _sendTableOrder;
  /* Genişletilmiş özellikler */
  window._qrCallWaiter = _qrCallWaiter;
  window._qrShowLockedHint = _qrShowLockedHint;
  window._qrOpenModeSelector = _qrOpenModeSelector;
  window._qrCloseSheet = _qrCloseSheet;
  window._qrSetDisplayMode = _qrSetDisplayMode;
  window._qrStartSsidScan = _qrStartSsidScan;
  window._qrToggleSsidVisibility = _qrToggleSsidVisibility;
  window._qrOpenStory = _qrOpenStory;
  window._qrCopyText = _qrCopyText;
  window._qrOpenPayment = _qrOpenPayment;
  window._qrPickTip = _qrPickTip;
  window._qrPickPay = _qrPickPay;
  window._qrConfirmPayment = _qrConfirmPayment;
  window._qrToast = _qrToast;
}
