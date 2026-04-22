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
    platform: 'app',
    displayMode: _qrBusinessDisplayMode,
    /* Masadaki katılımcılar (mock) — kendiniz ilk sıradasınız */
    participants: [
      { id:'me',  name:(AUTH && AUTH.user && AUTH.user.name) || 'Furkan Şahin', avatar:'https://i.pravatar.cc/100?img=11', isOwn:true,  status:'browsing', joinedAt:Date.now() },
      { id:'u1',  name:'Muhammed Solak',  avatar:'https://i.pravatar.cc/100?img=20', status:'ordering', joinedAt:Date.now() - 4 * 60000 },
      { id:'u2',  name:'Zeynep Arslan',   avatar:'https://i.pravatar.cc/100?img=21', status:'idle',     joinedAt:Date.now() - 12 * 60000 },
      { id:'u3',  name:'Ece Kaya',         avatar:'https://i.pravatar.cc/100?img=22', status:'browsing', joinedAt:Date.now() - 2 * 60000 }
    ],
    joinRequests: [
      { id:'r1', name:'Barış Öztürk', avatar:'https://i.pravatar.cc/100?img=25', requestedAt:Date.now() - 30 * 1000 }
    ]
  };
  _qrSsidState = 'idle';
  setTimeout(_qrUpdatePartCount, 0);
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
    + '    <div onclick="_qrOpenTableParticipants()" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--r-full);background:var(--primary-light);border:1px solid var(--primary-soft);cursor:pointer;transition:transform .15s" title="Masadakileri gör">'
    + '      <iconify-icon icon="solar:users-group-rounded-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>'
    + '      <span style="font:var(--fw-bold) 11.5px/1 var(--font);color:var(--primary);letter-spacing:.2px">Masa ' + s.tableNumber + '</span>'
    + '      <span id="qrPartCountBadge" style="min-width:16px;height:16px;padding:0 5px;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-bold) 9.5px/16px var(--font);text-align:center"></span>'
    + '    </div>'
    + '  </div>'
    /* 3'lü hızlı aksiyon sekmesi — WiFi · Oyunlar · Anı Paylaş */
    + '  <div id="qrQuickTabs" style="padding:12px var(--app-px) 0"></div>'
    /* SSID güvenlik durumu */
    + '  <div id="qrSsidStatus" style="margin:12px var(--app-px) 0"></div>'
    /* İşletme hikayeleri (Instagram stili) */
    + '  <div id="qrStoriesRow" style="padding:12px var(--app-px) 0;margin-bottom:14px"></div>'
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
  _qrRenderQuickTabs();
  _renderStoriesRow();
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

function _qrItemIsServable(m) {
  if (m.status !== 'active') return false;
  if (typeof bmsIsActiveNow === 'function' && !bmsIsActiveNow(m)) return false;
  return true;
}

function _renderTableMenuCategories() {
  var s = _activeTableSession;
  if (!s) return;
  var items = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : [])
    .filter(function(m){ return m.branchId === s.branchId && _qrItemIsServable(m); });
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
    .filter(function(m){ return m.branchId === s.branchId && _qrItemIsServable(m) && m.category === _menuActiveCategory; });

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

/* ═══════════════════════════════════════════════════════════
   MASADAKİLER PANELİ — Tıklanabilir Masa No ile açılır
   ═══════════════════════════════════════════════════════════ */

function _qrMaskName(full) {
  if (!full) return '—';
  var parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  var last = parts[parts.length - 1];
  return parts.slice(0, -1).concat(last.charAt(0) + '*****').join(' ');
}

function _qrStatusChip(status) {
  var map = {
    ordering: { label:'Sipariş veriyor', color:'#F97316', dot:'#F97316', ic:'solar:basket-bold' },
    browsing: { label:'Menüye bakıyor',   color:'#22C55E', dot:'#22C55E', ic:'solar:eye-bold' },
    idle:     { label:'Beklemede',         color:'#6B7280', dot:'#9CA3AF', ic:'solar:clock-circle-linear' }
  };
  var s = map[status] || map.idle;
  return '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:var(--r-full);background:' + s.color + '14;color:' + s.color + ';font:var(--fw-bold) 10px/1.4 var(--font)"><span style="width:6px;height:6px;border-radius:50%;background:' + s.dot + ';' + (status === 'ordering' || status === 'browsing' ? 'animation:qrPulse 1.4s infinite;' : '') + '"></span>' + s.label + '</span>';
}

function _qrRelTime(ts) {
  var diff = Math.max(0, Date.now() - ts);
  var m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return m + ' dk önce';
  return Math.floor(m / 60) + ' saat önce';
}

function _qrUpdatePartCount() {
  var el = document.getElementById('qrPartCountBadge');
  if (!el || !_activeTableSession) return;
  var total = (_activeTableSession.participants || []).length;
  var req = (_activeTableSession.joinRequests || []).length;
  el.textContent = req > 0 ? (total + '+' + req) : total;
}

function _qrOpenTableParticipants() {
  if (!_activeTableSession) return;
  _qrInjectPartStyles();
  var s = _activeTableSession;
  var phone = document.getElementById('phone');
  var existing = document.getElementById('qrPartPanel');
  if (existing) existing.remove();

  var m = document.createElement('div');
  m.id = 'qrPartPanel';
  m.className = 'qrp-backdrop';
  m.onclick = function(e){ if (e.target === m) _qrClosePartPanel(); };
  m.innerHTML = _qrPartBody();
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _qrClosePartPanel() {
  var m = document.getElementById('qrPartPanel');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _qrPartBody() {
  var s = _activeTableSession;
  var participants = s.participants || [];
  var requests = s.joinRequests || [];

  var requestsHtml = '';
  if (requests.length) {
    requestsHtml = '<div class="qrp-section-head"><iconify-icon icon="solar:user-plus-bold" style="font-size:14px;color:#F97316"></iconify-icon><span>Katılmak İsteyenler</span><span class="qrp-badge-orange">' + requests.length + '</span></div>'
      + '<div class="qrp-list">'
      + requests.map(function(r){
          return '<div class="qrp-row qrp-row--req">'
            + '<img class="qrp-avatar" src="' + r.avatar + '" alt="">'
            + '<div style="flex:1;min-width:0">'
            +   '<div class="qrp-name">' + _qrMaskName(r.name) + '</div>'
            +   '<div class="qrp-meta">Talep: ' + _qrRelTime(r.requestedAt) + '</div>'
            + '</div>'
            + '<button class="qrp-btn qrp-btn--approve" onclick="_qrApproveJoin(\'' + r.id + '\')"><iconify-icon icon="solar:check-circle-bold" style="font-size:13px"></iconify-icon>Onayla</button>'
            + '<button class="qrp-btn qrp-btn--reject" onclick="_qrRejectJoin(\'' + r.id + '\')"><iconify-icon icon="solar:close-circle-bold" style="font-size:13px"></iconify-icon></button>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  var mainList = '<div class="qrp-section-head"><iconify-icon icon="solar:users-group-rounded-bold" style="font-size:14px;color:var(--primary)"></iconify-icon><span>Masadakiler</span><span class="qrp-badge-primary">' + participants.length + '</span></div>'
    + '<div class="qrp-list">'
    + participants.map(function(p){
        return '<div class="qrp-row">'
          + '<img class="qrp-avatar" src="' + p.avatar + '" alt="">'
          + '<div style="flex:1;min-width:0">'
          +   '<div class="qrp-name">' + _qrMaskName(p.name) + (p.isOwn ? ' <span class="qrp-you">(sen)</span>' : '') + '</div>'
          +   '<div class="qrp-meta">' + _qrStatusChip(p.status) + '<span class="qrp-sep">·</span>' + _qrRelTime(p.joinedAt) + ' katıldı</div>'
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';

  return '<div class="qrp-sheet">'
    + '<div class="qrp-handle"></div>'
    + '<div class="qrp-head">'
    +   '<div class="qrp-head-ico"><iconify-icon icon="solar:chair-2-bold" style="font-size:20px;color:var(--primary)"></iconify-icon></div>'
    +   '<div style="flex:1">'
    +     '<div class="qrp-title">Masa ' + s.tableNumber + ' · ' + _qrEsc(s.businessName) + '</div>'
    +     '<div class="qrp-sub">' + participants.length + ' kişi bağlı' + (requests.length ? ' · ' + requests.length + ' istek' : '') + '</div>'
    +   '</div>'
    +   '<div class="qrp-close" onclick="_qrClosePartPanel()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>'
    + '<div class="qrp-body">' + requestsHtml + mainList + '</div>';
}

function _qrEsc(s) { return _esc ? _esc(s) : s; }

function _qrApproveJoin(id) {
  var s = _activeTableSession;
  if (!s) return;
  var idx = (s.joinRequests || []).findIndex(function(r){ return r.id === id; });
  if (idx < 0) return;
  var r = s.joinRequests[idx];
  s.joinRequests.splice(idx, 1);
  s.participants = s.participants || [];
  s.participants.push({ id:r.id, name:r.name, avatar:r.avatar, status:'browsing', joinedAt:Date.now() });
  if (typeof _qrToast === 'function') _qrToast('ok', r.name + ' masaya katıldı');
  _qrUpdatePartCount();
  // Panel'i yeniden render
  var m = document.getElementById('qrPartPanel');
  if (m) m.innerHTML = _qrPartBody();
}

function _qrRejectJoin(id) {
  var s = _activeTableSession;
  if (!s) return;
  var idx = (s.joinRequests || []).findIndex(function(r){ return r.id === id; });
  if (idx < 0) return;
  s.joinRequests.splice(idx, 1);
  if (typeof _qrToast === 'function') _qrToast('ok', 'İstek reddedildi');
  _qrUpdatePartCount();
  var m = document.getElementById('qrPartPanel');
  if (m) m.innerHTML = _qrPartBody();
}

/* ═══════════════════════════════════════════════════════════
   3'LÜ HIZLI AKSİYON — WiFi · Oyunlar · Anı Paylaş
   ═══════════════════════════════════════════════════════════ */

function _qrRenderQuickTabs() {
  var el = document.getElementById('qrQuickTabs');
  if (!el || !_activeTableSession) return;
  _qrInjectQuickStyles();
  var extra = _QR_BIZ_EXTRA[_activeTableSession.businessId] || {};
  var storiesCount = (extra.stories || []).length;
  var freshStories = (extra.stories || []).filter(function(x){ return x.isNew; }).length;

  el.innerHTML = '<div class="qr-qt-row">'
    + _qrQuickTab('wifi',   'solar:wifi-router-bold',  'Misafir Wi-Fi', '#3B82F6', (extra.wifi && extra.wifi.ssid) ? extra.wifi.ssid : 'Ücretsiz', '_qrOpenWifiModal()', false, 0)
    + _qrQuickTab('games',  'solar:gamepad-bold',      'Oyunlar',       '#8B5CF6', 'Çark + mini', 'openQrGameHub()', false, 0)
    + _qrQuickTab('memory', 'solar:camera-bold',       'Anı Paylaş',    '#F97316', (storiesCount > 0 ? storiesCount + ' anı' : 'Foto/Video'), '_qrOpenShareMemory()', freshStories > 0, freshStories)
    + '</div>';
}

function _qrQuickTab(key, icon, label, color, sub, onclick, ring, count) {
  var ringWrap = ring
    ? '<div class="qr-qt-ring"><div class="qr-qt-ico-inner" style="background:' + color + '14;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:22px"></iconify-icon></div></div>'
    : '<div class="qr-qt-ico" style="background:' + color + '14;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:22px"></iconify-icon></div>';
  return '<div class="qr-qt" onclick="' + onclick + '">'
    + ringWrap
    + (count > 0 ? '<span class="qr-qt-dot">' + count + '</span>' : '')
    + '<div class="qr-qt-label">' + label + '</div>'
    + '<div class="qr-qt-sub">' + sub + '</div>'
    + '</div>';
}

/* ─ WiFi Modal ─ */
function _qrOpenWifiModal() {
  var s = _activeTableSession;
  if (!s) return;
  var extra = _QR_BIZ_EXTRA[s.businessId] || {};
  var wifi = extra.wifi;
  if (!wifi) { if (typeof _qrToast === 'function') _qrToast('err', 'WiFi bilgisi yok'); return; }
  _qrInjectQuickStyles();
  var phone = document.getElementById('phone');
  var ex = document.getElementById('qrWifiModal');
  if (ex) ex.remove();
  var m = document.createElement('div');
  m.id = 'qrWifiModal';
  m.className = 'qr-qt-backdrop';
  m.onclick = function(e){ if (e.target === m) _qrCloseWifiModal(); };
  m.innerHTML = '<div class="qr-qt-sheet">'
    + '<div class="qr-qt-sheet-handle"></div>'
    + '<div class="qr-qt-sheet-head">'
    +   '<div class="qr-qt-ico" style="background:rgba(59,130,246,.14);color:#3B82F6;width:42px;height:42px"><iconify-icon icon="solar:wifi-router-bold" style="font-size:22px"></iconify-icon></div>'
    +   '<div style="flex:1"><div class="qr-qt-sheet-title">Misafir Wi-Fi</div>'
    +   '<div class="qr-qt-sheet-sub">' + _esc(s.businessName) + ' · Ücretsiz bağlantı</div></div>'
    +   '<div class="qrp-close" onclick="_qrCloseWifiModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>'
    + '<div class="qr-qt-sheet-body">'
    +   '<div class="qr-wifi-row" onclick="_qrCopyText(\'' + wifi.ssid + '\',this)">'
    +     '<iconify-icon icon="solar:wifi-router-linear" style="font-size:16px;color:#3B82F6"></iconify-icon>'
    +     '<div style="flex:1"><div class="qr-wifi-lbl">Ağ Adı (SSID)</div><div class="qr-wifi-val">' + _esc(wifi.ssid) + '</div></div>'
    +     '<iconify-icon icon="solar:copy-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>'
    +   '</div>'
    +   '<div class="qr-wifi-row" onclick="_qrCopyText(\'' + wifi.password + '\',this)">'
    +     '<iconify-icon icon="solar:lock-password-linear" style="font-size:16px;color:#8B5CF6"></iconify-icon>'
    +     '<div style="flex:1"><div class="qr-wifi-lbl">Şifre</div><div class="qr-wifi-val">' + _esc(wifi.password) + '</div></div>'
    +     '<iconify-icon icon="solar:copy-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>'
    +   '</div>'
    +   '<div style="display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22);border-radius:var(--r-md);font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary);margin-top:8px">'
    +   '<iconify-icon icon="solar:shield-check-bold" style="font-size:14px;color:#16A34A;flex-shrink:0;margin-top:1px"></iconify-icon>'
    +   '<span><b>' + (wifi.security || 'WPA2') + '</b> şifreli · tıkla, kopyala, ayarlardan bağlan</span>'
    +   '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}
function _qrCloseWifiModal() {
  var m = document.getElementById('qrWifiModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

/* ─ Anı Paylaş Flow ─ */
function _qrOpenShareMemory() {
  if (!_activeTableSession) return;
  _qrInjectQuickStyles();
  var phone = document.getElementById('phone');
  var ex = document.getElementById('qrMemModal');
  if (ex) ex.remove();
  var m = document.createElement('div');
  m.id = 'qrMemModal';
  m.className = 'qr-qt-backdrop';
  m.onclick = function(e){ if (e.target === m) _qrCloseMemModal(); };
  m.innerHTML = '<div class="qr-qt-sheet">'
    + '<div class="qr-qt-sheet-handle"></div>'
    + '<div class="qr-qt-sheet-head">'
    +   '<div class="qr-qt-ico" style="background:rgba(249,115,22,.14);color:#F97316;width:42px;height:42px"><iconify-icon icon="solar:camera-add-bold" style="font-size:22px"></iconify-icon></div>'
    +   '<div style="flex:1"><div class="qr-qt-sheet-title">Anı Paylaş</div>'
    +   '<div class="qr-qt-sheet-sub">Deneyimini işletmenin hikayelerine ekle</div></div>'
    +   '<div class="qrp-close" onclick="_qrCloseMemModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>'
    + '<div class="qr-qt-sheet-body" style="gap:10px">'
    +   '<label class="qr-mem-opt">'
    +     '<div class="qr-mem-opt-ico" style="background:#F97316"><iconify-icon icon="solar:camera-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    +     '<div style="flex:1"><div class="qr-mem-opt-title">Fotoğraf / Video Çek</div><div class="qr-mem-opt-sub">Anında hikayen olur</div></div>'
    +     '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>'
    +     '<input type="file" accept="image/*,video/*" capture="environment" style="display:none" onchange="_qrMemFilePicked(this)">'
    +   '</label>'
    +   '<label class="qr-mem-opt">'
    +     '<div class="qr-mem-opt-ico" style="background:#8B5CF6"><iconify-icon icon="solar:gallery-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    +     '<div style="flex:1"><div class="qr-mem-opt-title">Galeriden Seç</div><div class="qr-mem-opt-sub">Daha önce çektiklerinden</div></div>'
    +     '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>'
    +     '<input type="file" accept="image/*,video/*" style="display:none" onchange="_qrMemFilePicked(this)">'
    +   '</label>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}
function _qrCloseMemModal() {
  var m = document.getElementById('qrMemModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

function _qrMemFilePicked(input) {
  var f = input.files && input.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function(e){
    _qrMemShowConfirm(e.target.result, f.type.indexOf('video') === 0);
  };
  reader.readAsDataURL(f);
  input.value = '';
}

function _qrMemShowConfirm(dataUrl, isVideo) {
  _qrCloseMemModal();
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'qrMemConfirm';
  m.className = 'qr-qt-backdrop';
  m.onclick = function(e){ if (e.target === m) _qrCloseMemConfirm(false); };
  m.innerHTML = '<div class="qr-qt-sheet" style="max-width:400px">'
    + '<div class="qr-qt-sheet-handle"></div>'
    + '<div class="qr-qt-sheet-head">'
    +   '<div class="qr-qt-ico" style="background:rgba(249,115,22,.14);color:#F97316;width:42px;height:42px"><iconify-icon icon="solar:shield-warning-bold" style="font-size:22px"></iconify-icon></div>'
    +   '<div style="flex:1"><div class="qr-qt-sheet-title">Paylaşımı Onayla</div>'
    +   '<div class="qr-qt-sheet-sub">' + (isVideo ? 'Video' : 'Fotoğraf') + ' önizleme aşağıda</div></div>'
    + '</div>'
    + '<div class="qr-qt-sheet-body">'
    +   '<div class="qr-mem-preview">' + (isVideo
        ? '<video src="' + dataUrl + '" controls autoplay muted playsinline></video>'
        : '<img src="' + dataUrl + '" alt="">')
    +   '</div>'
    +   '<div class="qr-mem-legal">'
    +     '<iconify-icon icon="solar:info-circle-bold" style="font-size:15px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>'
    +     '<span>Değerli kullanıcımız; paylaşacağınız anı, <b>1 hafta</b> boyunca işletmenin anı hikayelerinde tüm kullanıcılara gösterilecektir. <b>Onaylıyor musunuz?</b></span>'
    +   '</div>'
    +   '<div style="display:flex;gap:8px;margin-top:4px">'
    +     '<button class="qr-mem-btn qr-mem-btn--ghost" onclick="_qrCloseMemConfirm(false)">Hayır, Vazgeç</button>'
    +     '<button class="qr-mem-btn qr-mem-btn--primary" onclick="_qrMemPublish()">Evet, Paylaş</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _qrMemPendingIsVideo = isVideo;
  _qrMemPendingData = dataUrl;
}
var _qrMemPendingData = null, _qrMemPendingIsVideo = false;

function _qrCloseMemConfirm(publish) {
  var m = document.getElementById('qrMemConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
  if (!publish) { _qrMemPendingData = null; _qrMemPendingIsVideo = false; }
}

function _qrMemPublish() {
  if (!_qrMemPendingData || !_activeTableSession) { _qrCloseMemConfirm(false); return; }
  var s = _activeTableSession;
  var extra = _QR_BIZ_EXTRA[s.businessId] || (_QR_BIZ_EXTRA[s.businessId] = {});
  extra.stories = extra.stories || [];
  extra.stories.unshift({
    id: 'my_' + Date.now(),
    title: 'Senin Anın',
    img: _qrMemPendingIsVideo ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' : _qrMemPendingData,
    isNew: true,
    isMine: true,
    publishedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
  });
  _qrCloseMemConfirm(true);
  _qrMemPendingData = null; _qrMemPendingIsVideo = false;
  if (typeof _qrToast === 'function') _qrToast('ok', 'Anı paylaşıldı · 1 hafta hikayelerde');
  _qrRenderQuickTabs();
  if (typeof _renderStoriesRow === 'function') _renderStoriesRow();
}

/* Styles */
function _qrInjectQuickStyles() {
  if (document.getElementById('qrQuickStyles')) return;
  var s = document.createElement('style');
  s.id = 'qrQuickStyles';
  s.textContent = [
    '.qr-qt-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}',
    '.qr-qt{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 10px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);cursor:pointer;box-shadow:var(--shadow-sm);transition:transform .15s, box-shadow .15s}',
    '.qr-qt:active{transform:scale(.97)}',
    '.qr-qt:hover{box-shadow:var(--shadow-md)}',
    '.qr-qt-ico{width:46px;height:46px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;margin-bottom:2px}',
    '.qr-qt-ring{padding:2.5px;border-radius:50%;background:linear-gradient(45deg,#F97316,#EF4444,#A855F7);margin-bottom:2px}',
    '.qr-qt-ico-inner{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg-phone)}',
    '.qr-qt-dot{position:absolute;top:10px;right:10px;min-width:18px;height:18px;padding:0 6px;border-radius:var(--r-full);background:#EF4444;color:#fff;font:var(--fw-bold) 10px/18px var(--font);text-align:center;border:2px solid var(--bg-phone)}',
    '.qr-qt-label{font:var(--fw-bold) 12px/1.2 var(--font);color:var(--text-primary);text-align:center}',
    '.qr-qt-sub{font:var(--fw-regular) 10.5px/1.2 var(--font);color:var(--text-muted);text-align:center}',
    /* Sheet base (WiFi + Anı) */
    '.qr-qt-backdrop{position:fixed;inset:0;z-index:118;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .22s}',
    '.qr-qt-backdrop.open{opacity:1}',
    '.qr-qt-sheet{width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:90vh;display:flex;flex-direction:column;transform:translateY(22px);transition:transform .28s ease}',
    '.qr-qt-backdrop.open .qr-qt-sheet{transform:translateY(0)}',
    '.qr-qt-sheet-handle{width:44px;height:4px;border-radius:2px;background:var(--border-subtle);margin:8px auto 0}',
    '.qr-qt-sheet-head{padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle)}',
    '.qr-qt-sheet-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.qr-qt-sheet-sub{font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.qr-qt-sheet-body{padding:14px 16px 24px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}',
    /* WiFi rows */
    '.qr-wifi-row{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-md);cursor:pointer;transition:background .15s}',
    '.qr-wifi-row:hover{background:var(--bg-btn)}',
    '.qr-wifi-lbl{font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted)}',
    '.qr-wifi-val{font:var(--fw-bold) 13.5px/1 var(--font);color:var(--text-primary);margin-top:4px;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px}',
    /* Memory options */
    '.qr-mem-opt{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);cursor:pointer;transition:all .15s}',
    '.qr-mem-opt:hover{border-color:var(--primary)}',
    '.qr-mem-opt-ico{width:42px;height:42px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.qr-mem-opt-title{font:var(--fw-bold) 13.5px/1.2 var(--font);color:var(--text-primary)}',
    '.qr-mem-opt-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.qr-mem-preview{width:100%;max-height:320px;background:#000;border-radius:var(--r-md);overflow:hidden;display:flex;align-items:center;justify-content:center}',
    '.qr-mem-preview img{max-width:100%;max-height:320px;object-fit:contain;display:block}',
    '.qr-mem-preview video{max-width:100%;max-height:320px}',
    '.qr-mem-legal{display:flex;gap:8px;padding:12px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.22);border-radius:var(--r-md);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.qr-mem-legal b{color:var(--text-primary);font-weight:700}',
    '.qr-mem-btn{flex:1;padding:12px;border-radius:var(--r-lg);border:none;font:var(--fw-bold) 13px/1 var(--font);cursor:pointer}',
    '.qr-mem-btn:active{transform:scale(.97)}',
    '.qr-mem-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.qr-mem-btn--primary{background:linear-gradient(135deg,#F97316,#EF4444);color:#fff}'
  ].join('\n');
  document.head.appendChild(s);
}

function _qrInjectPartStyles() {
  if (document.getElementById('qrPartStyles')) return;
  var s = document.createElement('style');
  s.id = 'qrPartStyles';
  s.textContent = [
    '@keyframes qrPulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '.qrp-backdrop{position:fixed;inset:0;z-index:118;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s}',
    '.qrp-backdrop.open{opacity:1}',
    '.qrp-sheet{width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:85vh;display:flex;flex-direction:column;transform:translateY(24px);transition:transform .28s ease}',
    '.qrp-backdrop.open .qrp-sheet{transform:translateY(0)}',
    '.qrp-handle{width:44px;height:4px;border-radius:2px;background:var(--border-subtle);margin:8px auto 0;flex-shrink:0}',
    '.qrp-head{padding:12px 16px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle)}',
    '.qrp-head-ico{width:36px;height:36px;border-radius:var(--r-lg);background:var(--primary-light);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.qrp-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.qrp-sub{font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.qrp-close{width:34px;height:34px;border-radius:50%;background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);flex-shrink:0}',
    '.qrp-body{flex:1;overflow-y:auto;padding:12px 16px 20px;display:flex;flex-direction:column;gap:14px}',
    '.qrp-section-head{display:flex;align-items:center;gap:6px;padding:4px 2px;font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.3px;text-transform:uppercase}',
    '.qrp-section-head span:nth-child(2){flex:1;color:var(--text-primary);text-transform:none;font-size:12px}',
    '.qrp-badge-primary{padding:2px 8px;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-bold) 10px/1.4 var(--font);text-transform:none}',
    '.qrp-badge-orange{padding:2px 8px;border-radius:var(--r-full);background:#F97316;color:#fff;font:var(--fw-bold) 10px/1.4 var(--font);text-transform:none}',
    '.qrp-list{display:flex;flex-direction:column;gap:6px}',
    '.qrp-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)}',
    '.qrp-row--req{background:rgba(249,115,22,.06);border-color:rgba(249,115,22,.25)}',
    '.qrp-avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--bg-phone)}',
    '.qrp-name{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);display:flex;align-items:center;gap:4px}',
    '.qrp-you{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}',
    '.qrp-meta{display:flex;align-items:center;gap:6px;margin-top:4px;font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted);flex-wrap:wrap}',
    '.qrp-sep{color:var(--text-tertiary)}',
    '.qrp-btn{padding:7px 10px;border:none;border-radius:var(--r-md);font:var(--fw-bold) 10.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px;flex-shrink:0}',
    '.qrp-btn:active{transform:scale(.96)}',
    '.qrp-btn--approve{background:#22C55E;color:#fff}',
    '.qrp-btn--reject{background:rgba(239,68,68,.12);color:#DC2626;padding:7px 9px}'
  ].join('\n');
  document.head.appendChild(s);
}
