/* ═══════════════════════════════════════════════════════════
   ADMIN TOKEN OPS — Token İşlemleri
   (Global kur • Paketler • Otomatik kampanya • Analitik paneli
    • İşlem log)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _top = {
  tab: 'settings',               // 'settings' | 'analytics'
  pkgModalOpen: false,
  editingPkgId: null,
  pkgForm: { minTL:'', tokens:'' },
  trendsRange: '7d',             // '24h' | '7d' | '30d'
  txTypeFilter: '',              // '' | 'package' | 'gift' | 'commission' | 'ad' | 'refund'
  txStatusFilter: '',            // '' | 'success' | 'pending' | 'cancelled'
  rateInput: null,               // yeni kur giriş değeri (henüz kaydedilmemiş)
  rateConfirmOpen: false
};

/* ═══ Overlay Aç ═══ */
function _admOpenTokenOps() {
  _admInjectStyles();
  _topInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'topOverlay';
  adminPhone.appendChild(overlay);

  _top.tab = 'settings';
  _top.rateInput = ADMIN_TOKEN_CONFIG.exchangeRate;
  _topRender();
}

function _topCloseOverlay() {
  var o = document.getElementById('topOverlay');
  if (o) o.remove();
  _topClosePkgModal();
  _topCloseRateConfirm();
}

/* ═══ Ana Render ═══ */
function _topRender() {
  var o = document.getElementById('topOverlay');
  if (!o) return;

  var h = '<div class="top-header">'
    + '<div class="top-back" onclick="_topCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:round-transfer-horizontal-bold" style="font-size:18px;color:#14B8A6"></iconify-icon>'
    + '<div class="top-title">Token İşlemleri</div>'
    + '</div>'
    + '<div class="top-sub">Global ayarlar, paketler ve analitik</div>'
    + '</div>'
    + '</div>'
    // Tab switcher
    + '<div class="top-tabs">'
    + '<button class="top-tab-btn' + (_top.tab === 'settings' ? ' active' : '') + '" onclick="_topSetTab(\'settings\')">'
    + '<iconify-icon icon="solar:settings-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Ayarlar & Paketler</span></button>'
    + '<button class="top-tab-btn' + (_top.tab === 'analytics' ? ' active' : '') + '" onclick="_topSetTab(\'analytics\')">'
    + '<iconify-icon icon="solar:chart-2-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Analitik & Log</span></button>'
    + '</div>'
    + '<div id="topBody" style="flex:1"></div>';

  o.innerHTML = h;
  _topRenderBody();
}

function _topRenderBody() {
  var body = document.getElementById('topBody');
  if (!body) return;
  if (_top.tab === 'settings') body.innerHTML = _topRenderSettings();
  else {
    body.innerHTML = _topRenderAnalytics();
    setTimeout(_topDrawTrendChart, 30);
  }
}

function _topSetTab(t) {
  _top.tab = t;
  _topRender();
}

/* ═══ Helpers ═══ */
function _topEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _topFmt(n) {
  if (n === null || n === undefined) return '0';
  var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? '-' + s : s;
}

function _topDate(iso) {
  if (typeof _admDate === 'function') return _admDate(iso);
  return new Date(iso).toLocaleString('tr-TR');
}

function _topRelative(iso) {
  if (typeof _admRelative === 'function') return _admRelative(iso);
  return iso;
}

/* ═══════════════════════════════════════
   P2+P3+P4 — Ayarlar Sekmesi
   ═══════════════════════════════════════ */
function _topRenderSettings() {
  var h = '<div class="adm-fadeIn top-wrap">';

  // Global kur
  h += _topRenderRateSection();

  // Paketler
  h += _topRenderPackages();

  // Otomatik kampanya
  h += _topRenderCampaign();

  h += '</div>';
  return h;
}

/* ── P2: Global Kur ── */
function _topRenderRateSection() {
  var curr = ADMIN_TOKEN_CONFIG.exchangeRate;
  var pending = _top.rateInput;
  var changed = parseFloat(pending) !== curr && !isNaN(parseFloat(pending));

  var h = '<div class="top-sect top-sect--rate">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:15px;color:#EAB308"></iconify-icon><span>Global Kur Ayarı</span></div>'
    + '<div class="top-rate-info">'
    + '<div class="top-rate-formula"><b>1 Token</b> = <input type="number" step="0.01" min="0.01" class="top-rate-input" value="' + (pending || curr) + '" oninput="_top.rateInput=this.value;_topRenderBody()" /> <b>' + ADMIN_TOKEN_CONFIG.currency + '</b></div>'
    + '<div class="top-rate-hint">' + (changed
        ? '<span class="top-rate-changed">⚠ Değişiklik sistem genelini etkileyecek</span>'
        : '<span>Varsayılan: 1.00 ' + ADMIN_TOKEN_CONFIG.currency + ' · Sistem geneli hesaplamalar (sipariş, komisyon, iade) anlık güncellenir</span>')
    + '</div>'
    + (changed
        ? '<button class="top-rate-apply" onclick="_topOpenRateConfirm()"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px"></iconify-icon>Uygula</button>'
        : '')
    + '</div>'
    + '</div>';

  return h;
}

function _topOpenRateConfirm() {
  _topCloseRateConfirm();
  _top.rateConfirmOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var curr = ADMIN_TOKEN_CONFIG.exchangeRate;
  var newRate = parseFloat(_top.rateInput);

  var m = document.createElement('div');
  m.id = 'topRateConfirm';
  m.className = 'top-modal-backdrop top-modal-backdrop--crit';
  m.onclick = function(e) { if (e.target === m) _topCloseRateConfirm(); };
  m.innerHTML = '<div class="top-modal top-modal--crit">'
    + '<div class="top-conf-head" style="background:linear-gradient(135deg,#EAB308,#F59E0B)">'
    + '<div class="top-conf-ico"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:28px;color:#fff"></iconify-icon></div>'
    + '<div class="top-conf-title">Kur Değişikliği Onayı</div>'
    + '<div class="top-conf-sub">Bu değişiklik tüm sistemi etkileyecektir</div>'
    + '</div>'
    + '<div class="top-conf-body">'
    + '<div class="top-conf-q">1 Token kuru değişiyor:</div>'
    + '<div class="top-conf-change">'
    + '<div class="top-conf-side"><span>Mevcut</span><b>₺' + curr.toFixed(2) + '</b></div>'
    + '<iconify-icon icon="solar:arrow-right-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon>'
    + '<div class="top-conf-side"><span>Yeni</span><b style="color:#EAB308">₺' + newRate.toFixed(2) + '</b></div>'
    + '</div>'
    + '<div class="top-conf-warn">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span>Tüm sipariş komisyonları, reklam ödemeleri, iade ve paketler <b>anında</b> bu kurla hesaplanacak.</span>'
    + '</div>'
    + '<div class="top-conf-ask">Bu değişikliği onaylıyor musunuz?</div>'
    + '</div>'
    + '<div class="top-conf-btns">'
    + '<button class="top-conf-cancel" onclick="_topCloseRateConfirm()">Vazgeç</button>'
    + '<button class="top-conf-apply" onclick="_topApplyRate()"><iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Evet, Uygula</button>'
    + '</div>'
    + '</div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _topCloseRateConfirm() {
  var m = document.getElementById('topRateConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _top.rateConfirmOpen = false;
}

function _topApplyRate() {
  var n = parseFloat(_top.rateInput);
  if (isNaN(n) || n <= 0) { _admToast('Geçersiz kur', 'err'); return; }
  var old = ADMIN_TOKEN_CONFIG.exchangeRate;
  ADMIN_TOKEN_CONFIG.exchangeRate = n;
  _admToast('Kur güncellendi: ₺' + old.toFixed(2) + ' → ₺' + n.toFixed(2), 'ok');
  _topCloseRateConfirm();
  _top.rateInput = n;
  _topRenderBody();
}

/* ── P3: Paketler ── */
function _topRenderPackages() {
  var list = ADMIN_TOKEN_PACKAGES.slice();
  // Aktifleri üstte, sonra TL artan
  list.sort(function(a, b) {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.minTL - b.minTL;
  });

  var h = '<div class="top-sect">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:tag-price-bold" style="font-size:15px;color:#22C55E"></iconify-icon>'
    + '<span>Token Paketleri</span>'
    + '<button class="top-add-btn" onclick="_topOpenAddPkg()"><iconify-icon icon="solar:add-circle-bold" style="font-size:13px"></iconify-icon>Yeni Paket</button>'
    + '</div>'
    + '<div class="top-sect-desc">Alım limitine göre hediye token tanımları. Otomatik hesaplanan bonus aşağıda gösterilir.</div>'
    + '<div class="top-pkg-list">';

  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var bonus = p.tokens - p.minTL;
    h += '<div class="top-pkg-row' + (p.active ? '' : ' top-pkg-row--off') + '">'
      + '<div class="top-pkg-ico"><iconify-icon icon="solar:wallet-money-bold" style="font-size:16px"></iconify-icon></div>'
      + '<div class="top-pkg-main">'
      + '<div class="top-pkg-head">'
      + '<span class="top-pkg-tl">₺' + _topFmt(p.minTL) + '</span>'
      + '<iconify-icon icon="solar:arrow-right-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
      + '<span class="top-pkg-token">' + _topFmt(p.tokens) + ' Tkn</span>'
      + (bonus > 0 ? '<span class="top-pkg-bonus">+' + _topFmt(bonus) + ' Hediye</span>' : '')
      + '</div>'
      + '<div class="top-pkg-meta">Oran: %' + Math.round((bonus / p.minTL) * 100) + ' bonus · ID: ' + _topEsc(p.id) + '</div>'
      + '</div>'
      + '<div class="top-pkg-actions">'
      + '<div class="top-toggle' + (p.active ? ' on' : '') + '" onclick="_topTogglePkg(\'' + p.id + '\')"><div class="top-toggle-dot"></div></div>'
      + '<button class="top-ico-btn top-ico-btn--danger" onclick="_topDeletePkg(\'' + p.id + '\')" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon></button>'
      + '</div>'
      + '</div>';
  }
  h += '</div></div>';
  return h;
}

function _topOpenAddPkg() {
  _topClosePkgModal();
  _top.editingPkgId = null;
  _top.pkgForm = { minTL: '', tokens: '' };
  _topMountPkgModal();
}

function _topMountPkgModal() {
  _top.pkgModalOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'topPkgModal';
  m.className = 'top-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _topClosePkgModal(); };
  m.innerHTML = '<div class="top-modal"><div id="topPkgBody" class="top-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _topRenderPkgModal();
}

function _topClosePkgModal() {
  var m = document.getElementById('topPkgModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _top.pkgModalOpen = false;
}

function _topRenderPkgModal() {
  var body = document.getElementById('topPkgBody');
  if (!body) return;
  var f = _top.pkgForm;
  var minTL = parseFloat(f.minTL);
  var tokens = parseFloat(f.tokens);
  var valid = !isNaN(minTL) && !isNaN(tokens) && minTL > 0 && tokens >= minTL;
  var bonus = valid ? tokens - minTL : 0;
  var bonusPct = valid && minTL > 0 ? Math.round((bonus / minTL) * 100) : 0;

  var h = '<div class="top-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="top-mhead-ico" style="background:linear-gradient(135deg,#22C55E,#16A34A)"><iconify-icon icon="solar:tag-price-bold" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '<div><div class="top-mtitle">Yeni Paket Ekle</div>'
    + '<div class="top-msub">Alt limit ve yüklenecek token</div></div>'
    + '</div>'
    + '<div class="top-close" onclick="_topClosePkgModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Alt Limit (TL)
  h += '<div class="top-field">'
    + '<label><iconify-icon icon="solar:dollar-minimalistic-linear" style="font-size:11px"></iconify-icon>Alt Limit (TL)</label>'
    + '<div class="top-amt-wrap"><span class="top-amt-prefix">₺</span>'
    + '<input type="number" class="top-amt-input" placeholder="5000" min="1" step="100" value="' + _topEsc(f.minTL) + '" oninput="_top.pkgForm.minTL=this.value;_topRenderPkgModal();this.focus();this.setSelectionRange(this.value.length,this.value.length)" />'
    + '<span class="top-amt-unit">TL</span></div>'
    + '</div>';

  // Yüklenecek Token
  h += '<div class="top-field">'
    + '<label><iconify-icon icon="solar:coin-linear" style="font-size:11px"></iconify-icon>Yüklenecek Token</label>'
    + '<div class="top-amt-wrap"><span class="top-amt-prefix" style="color:#EAB308">◆</span>'
    + '<input type="number" class="top-amt-input" placeholder="6000" min="1" step="100" value="' + _topEsc(f.tokens) + '" oninput="_top.pkgForm.tokens=this.value;_topRenderPkgModal();this.focus();this.setSelectionRange(this.value.length,this.value.length)" />'
    + '<span class="top-amt-unit">Token</span></div>'
    + '</div>';

  // Otomatik hediye hesabı
  if (valid) {
    h += '<div class="top-bonus-box' + (bonus > 0 ? '' : ' top-bonus-box--zero') + '">'
      + (bonus > 0
          ? '<iconify-icon icon="solar:gift-bold" style="font-size:18px;color:#22C55E"></iconify-icon>'
            + '<div><div class="top-bonus-big">+' + _topFmt(bonus) + ' Token Hediye</div>'
            + '<div class="top-bonus-sub">%' + bonusPct + ' bonus oranı</div></div>'
          : '<iconify-icon icon="solar:info-circle-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon>'
            + '<span>Bu pakette hediye yok (birebir eşleşme)</span>')
      + '</div>';
  }

  // CTA
  h += '<button class="top-cta' + (valid ? '' : ' disabled') + '" ' + (valid ? '' : 'disabled ') + 'onclick="_topSavePkg()">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:15px"></iconify-icon>Paketi Kaydet</button>';

  body.innerHTML = h;
}

function _topSavePkg() {
  var f = _top.pkgForm;
  var minTL = parseFloat(f.minTL);
  var tokens = parseFloat(f.tokens);
  if (isNaN(minTL) || isNaN(tokens) || minTL <= 0 || tokens < minTL) {
    _admToast('Geçersiz değerler', 'err'); return;
  }
  if (!confirm('Yeni paket ekleniyor: ₺' + _topFmt(minTL) + ' → ' + _topFmt(tokens) + ' Token. Devam edilsin mi?')) return;

  ADMIN_TOKEN_PACKAGES.push({
    id: 'pkg_' + Date.now().toString(36),
    minTL: minTL,
    tokens: tokens,
    active: true,
    createdAt: new Date().toISOString()
  });
  _admToast('Paket eklendi', 'ok');
  _topClosePkgModal();
  _topRenderBody();
}

function _topTogglePkg(id) {
  var p = ADMIN_TOKEN_PACKAGES.find(function(x) { return x.id === id; });
  if (!p) return;
  p.active = !p.active;
  _admToast('Paket ' + (p.active ? 'aktifleştirildi' : 'pasifleştirildi'), 'ok');
  _topRenderBody();
}

function _topDeletePkg(id) {
  var idx = ADMIN_TOKEN_PACKAGES.findIndex(function(x) { return x.id === id; });
  if (idx === -1) return;
  var p = ADMIN_TOKEN_PACKAGES[idx];
  if (!confirm('₺' + _topFmt(p.minTL) + ' paketi silinecek. Emin misiniz?')) return;
  ADMIN_TOKEN_PACKAGES.splice(idx, 1);
  _admToast('Paket silindi', 'ok');
  _topRenderBody();
}

/* ── P4: Otomatik Kampanya ── */
function _topRenderCampaign() {
  var c = ADMIN_TOKEN_AUTO_CAMPAIGN;

  var h = '<div class="top-sect">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:15px;color:#EC4899"></iconify-icon>'
    + '<span>Otomatik Kampanya</span>'
    + '<div class="top-toggle' + (c.enabled ? ' on' : '') + '" style="--toggle-c:#EC4899" onclick="_topToggleCampaign()"><div class="top-toggle-dot"></div></div>'
    + '</div>'
    + '<div class="top-camp-box' + (c.enabled ? ' active' : '') + '">'
    + '<div class="top-camp-title">' + _topEsc(c.label) + '</div>'
    + '<div class="top-camp-desc">' + _topEsc(c.description) + '</div>'
    + '<div class="top-camp-rules">'
    + '<div class="top-camp-rule"><span>Bonus oranı</span><b>+%' + c.bonusPercent + '</b></div>'
    + '<div class="top-camp-rule"><span>Min. yükleme</span><b>₺' + _topFmt(c.minAmount) + '</b></div>'
    + '<div class="top-camp-rule"><span>Maks. bonus</span><b>' + _topFmt(c.maxBonus) + ' Tkn</b></div>'
    + '</div>'
    + (c.enabled
        ? '<div class="top-camp-status"><span class="top-live-dot"></span>Kampanya aktif — yeni işletmelere otomatik uygulanıyor</div>'
        : '<div class="top-camp-status top-camp-status--off">Kampanya pasif</div>')
    + '</div>'
    + '</div>';

  return h;
}

function _topToggleCampaign() {
  var c = ADMIN_TOKEN_AUTO_CAMPAIGN;
  c.enabled = !c.enabled;
  c.updatedAt = new Date().toISOString();
  _admToast('Otomatik kampanya ' + (c.enabled ? 'aktifleştirildi' : 'durduruldu'), 'ok');
  _topRenderBody();
}

/* ═══════════════════════════════════════
   P5+P6+P7 — Analitik Sekmesi
   ═══════════════════════════════════════ */
function _topRenderAnalytics() {
  var h = '<div class="adm-fadeIn top-wrap">';

  h += _topRenderKPIs();
  h += _topRenderReserve();
  h += _topRenderTrendSection();
  h += _topRenderTxLog();

  h += '</div>';
  return h;
}

/* ── P5: KPI + TL Rezervi ── */
function _topRenderKPIs() {
  var S = ADMIN_TOKEN_DAILY_SUMMARY;

  var h = '<div class="top-kpis">'
    // Satılan
    + '<div class="top-kpi top-kpi--in">'
    + '<div class="top-kpi-head"><iconify-icon icon="solar:wallet-money-bold" style="font-size:14px;color:#22C55E"></iconify-icon><span>Satılan Token</span></div>'
    + '<div class="top-kpi-val">' + _topFmt(S.soldToken) + '</div>'
    + '<div class="top-kpi-sub">+₺' + _topFmt(S.soldToken * ADMIN_TOKEN_CONFIG.exchangeRate) + ' gelir</div>'
    + '</div>'
    // Hediye
    + '<div class="top-kpi top-kpi--gift">'
    + '<div class="top-kpi-head"><iconify-icon icon="solar:gift-bold" style="font-size:14px;color:#EC4899"></iconify-icon><span>Hediye Edilen</span></div>'
    + '<div class="top-kpi-val">' + _topFmt(S.giftToken) + '</div>'
    + '<div class="top-kpi-sub">bedelsiz sisteme giren</div>'
    + '</div>'
    // Harcanan
    + '<div class="top-kpi top-kpi--out">'
    + '<div class="top-kpi-head"><iconify-icon icon="solar:arrow-up-bold" style="font-size:14px;color:#F97316"></iconify-icon><span>Harcanan</span></div>'
    + '<div class="top-kpi-val">' + _topFmt(S.spentToken) + '</div>'
    + '<div class="top-kpi-sub">sipariş & reklam</div>'
    + '</div>'
    // Net
    + '<div class="top-kpi top-kpi--net">'
    + '<div class="top-kpi-head"><iconify-icon icon="solar:chart-2-bold" style="font-size:14px;color:#3B82F6"></iconify-icon><span>Net Hacim</span></div>'
    + '<div class="top-kpi-val" style="color:' + (S.netVolume >= 0 ? '#22C55E' : '#EF4444') + '">' + (S.netVolume >= 0 ? '+' : '') + _topFmt(S.netVolume) + '</div>'
    + '<div class="top-kpi-sub">satılan − harcanan</div>'
    + '</div>'
    + '</div>';

  return h;
}

/* ── P5b: TL Rezerv Göstergesi ── */
function _topRenderReserve() {
  var S = ADMIN_TOKEN_DAILY_SUMMARY;
  var ratio = S.reserveTL / S.circulationToken; // 1.0 = sağlıklı
  var healthColor = ratio >= 1.0 ? '#22C55E' : ratio >= 0.8 ? '#F59E0B' : '#EF4444';
  var healthLabel = ratio >= 1.0 ? 'Sağlıklı' : ratio >= 0.8 ? 'Uyarı' : 'Kritik';
  var pctDisplay = Math.round(ratio * 100);

  var h = '<div class="top-reserve">'
    + '<div class="top-reserve-head">'
    + '<div class="top-reserve-title"><iconify-icon icon="solar:safe-2-bold" style="font-size:16px;color:#EAB308"></iconify-icon>Token Karşılığı TL Rezervi</div>'
    + '<span class="top-reserve-badge" style="background:' + healthColor + '18;color:' + healthColor + '">'
    + '<span class="top-live-dot" style="background:' + healthColor + '"></span>' + healthLabel + '</span>'
    + '</div>'
    + '<div class="top-reserve-body">'
    + '<div class="top-reserve-pair">'
    + '<div><div class="top-reserve-lbl">Sistemde Token</div><div class="top-reserve-val">' + _topFmt(S.circulationToken) + ' <span>Tkn</span></div></div>'
    + '<iconify-icon icon="solar:transfer-horizontal-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon>'
    + '<div style="text-align:right"><div class="top-reserve-lbl">Banka Rezervi</div><div class="top-reserve-val" style="color:' + healthColor + '">₺' + _topFmt(S.reserveTL) + '</div></div>'
    + '</div>'
    + '<div class="top-reserve-bar-wrap">'
    + '<div class="top-reserve-bar"><div class="top-reserve-bar-fill" style="width:' + Math.min(100, pctDisplay) + '%;background:' + healthColor + '"></div></div>'
    + '<div class="top-reserve-pct">%' + pctDisplay + ' karşılıklı</div>'
    + '</div>'
    + (ratio < 1.0
        ? '<div class="top-reserve-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:12px"></iconify-icon>Dolaşımdaki token\'ın karşılığı tam değil. Rezerv eklenmeli.</div>'
        : '<div class="top-reserve-ok"><iconify-icon icon="solar:check-circle-bold" style="font-size:12px"></iconify-icon>Her Token\'ın karşılığında ≥₺1 rezerv mevcut.</div>')
    + '</div>'
    + '</div>';

  return h;
}

/* ── P6: Trend grafiği + tarih chip'leri ── */
function _topRenderTrendSection() {
  var h = '<div class="top-sect">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:graph-up-bold" style="font-size:15px;color:#3B82F6"></iconify-icon>'
    + '<span>Yükleme Trendi</span>'
    + '</div>'
    // Tarih chip'leri
    + '<div class="top-trend-range">'
    + _topRangeChip('24h', 'Bugün (24s)')
    + _topRangeChip('7d',  'Son 7 gün')
    + _topRangeChip('30d', 'Bu ay')
    + '</div>'
    + '<canvas id="topTrendCanvas" width="340" height="180" class="top-canvas"></canvas>'
    + '</div>';

  // Hediye verimliliği
  var gc = ADMIN_TOKEN_TRENDS.giftConversion;
  h += '<div class="top-sect">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:stars-bold" style="font-size:15px;color:#EC4899"></iconify-icon><span>Hediye Verimliliği</span></div>'
    + '<div class="top-sect-desc">Hediye edilen tokenların harcamaya dönüşme süresi</div>'
    + '<div class="top-gift-conv">';
  var total = 0;
  for (var i = 0; i < gc.length; i++) total += gc[i].value;
  for (var j = 0; j < gc.length; j++) {
    var item = gc[j];
    var pct = Math.round((item.value / total) * 100);
    h += '<div class="top-gc-row">'
      + '<div class="top-gc-label">' + _topEsc(item.label) + '</div>'
      + '<div class="top-gc-bar"><div class="top-gc-bar-fill" style="width:' + pct + '%;background:' + item.color + '"></div></div>'
      + '<div class="top-gc-val" style="color:' + item.color + '">%' + pct + '</div>'
      + '</div>';
  }
  h += '</div></div>';
  return h;
}

function _topRangeChip(id, label) {
  var sel = _top.trendsRange === id;
  return '<button class="top-chip' + (sel ? ' active' : '') + '" onclick="_topSetTrendRange(\'' + id + '\')">' + label + '</button>';
}

function _topSetTrendRange(r) {
  _top.trendsRange = r;
  _topRenderBody();
}

function _topDrawTrendChart() {
  var canvas = document.getElementById('topTrendCanvas');
  if (!canvas || !canvas.getContext) return;

  var dpr = window.devicePixelRatio || 1;
  var cw = canvas.clientWidth || 340;
  var ch = canvas.clientHeight || 180;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  var data = _top.trendsRange === '24h' ? ADMIN_TOKEN_TRENDS.hourly24
    : _top.trendsRange === '30d' ? ADMIN_TOKEN_TRENDS.daily30
    : ADMIN_TOKEN_TRENDS.weekly7;

  var pad = { l:44, r:12, t:12, b:22 };
  var W = cw - pad.l - pad.r;
  var H = ch - pad.t - pad.b;

  var max = Math.max.apply(null, data);
  max = Math.ceil(max * 1.1);
  if (max === 0) max = 1;

  // Y grid
  ctx.font = '9px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (var g = 0; g <= 4; g++) {
    var yv = pad.t + (H / 4) * g;
    ctx.beginPath();
    ctx.strokeStyle = g === 4 ? '#CBD5E1' : '#F1F5F9';
    ctx.moveTo(pad.l, yv);
    ctx.lineTo(pad.l + W, yv);
    ctx.stroke();
    ctx.fillText(_topFmt(Math.round(max - (max/4) * g)), pad.l - 4, yv);
  }

  // Bars
  var n = data.length;
  var barW = (W / n) * 0.72;
  var gap = (W / n) * 0.28;

  for (var i = 0; i < n; i++) {
    var val = data[i];
    var bh = (val / max) * H;
    var bx = pad.l + i * (W / n) + gap / 2;
    var by = pad.t + H - bh;

    var grd = ctx.createLinearGradient(bx, by, bx, pad.t + H);
    grd.addColorStop(0, '#14B8A6');
    grd.addColorStop(1, '#06B6D4aa');
    ctx.fillStyle = grd;
    var r = Math.min(3, barW / 2);
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + barW - r, by);
    ctx.arcTo(bx + barW, by, bx + barW, by + r, r);
    ctx.lineTo(bx + barW, pad.t + H);
    ctx.lineTo(bx, pad.t + H);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
    ctx.closePath();
    ctx.fill();
  }

  // X labels
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  var labels;
  if (_top.trendsRange === '24h') labels = ['00:00','06:00','12:00','18:00'];
  else if (_top.trendsRange === '7d') labels = ['7 gün önce','bugün'];
  else labels = ['30 gün önce','bugün'];

  if (labels.length === 2) {
    ctx.fillText(labels[0], pad.l + 10, pad.t + H + 6);
    ctx.fillText(labels[1], pad.l + W - 20, pad.t + H + 6);
  } else {
    for (var k = 0; k < labels.length; k++) {
      var px = pad.l + (W / 4) * k + (W / 8);
      ctx.fillText(labels[k], px, pad.t + H + 6);
    }
  }
}

/* ── P7: Tüm Token Hareketleri Listesi ── */
function _topRenderTxLog() {
  var list = ADMIN_TOKEN_TRANSACTIONS.slice();
  if (_top.txTypeFilter) list = list.filter(function(t) { return t.type === _top.txTypeFilter; });
  if (_top.txStatusFilter) list = list.filter(function(t) { return t.status === _top.txStatusFilter; });
  list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  var h = '<div class="top-sect">'
    + '<div class="top-sect-head"><iconify-icon icon="solar:clock-square-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Tüm Token Hareketleri</span>'
    + '<span class="top-sect-badge">' + list.length + '</span>'
    + '</div>'
    + '<div class="top-tx-filters">'
    + '<span class="top-chip-label">Tür:</span>'
    + _topTxChip('', 'Tümü', '', '')
    + _topTxChip('package', 'Paket', 'solar:wallet-money-linear', '#22C55E')
    + _topTxChip('gift', 'Hediye', 'solar:gift-linear', '#8B5CF6')
    + _topTxChip('commission', 'Komisyon', 'solar:pie-chart-2-linear', '#F97316')
    + _topTxChip('ad', 'Reklam', 'solar:gallery-wide-linear', '#EC4899')
    + _topTxChip('refund', 'İade', 'solar:refresh-linear', '#06B6D4')
    + '</div>'
    + '<div class="top-tx-filters">'
    + '<span class="top-chip-label">Durum:</span>'
    + _topStatusChip('', 'Tümü')
    + _topStatusChip('success', 'Başarılı')
    + _topStatusChip('pending', 'Bekleyen')
    + _topStatusChip('cancelled', 'İptal')
    + '</div>';

  if (list.length === 0) {
    h += '<div class="top-empty"><iconify-icon icon="solar:inbox-linear" style="font-size:36px;opacity:0.3"></iconify-icon><div>İşlem yok</div></div>';
  } else {
    h += '<div class="top-tx-list">';
    for (var i = 0; i < list.length; i++) h += _topTxRow(list[i]);
    h += '</div>';
  }
  h += '</div>';

  return h;
}

function _topTxChip(id, label, icon, color) {
  var sel = _top.txTypeFilter === id;
  return '<button class="top-chip' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel && color ? 'border-color:' + color + ';background:' + color + '18;color:' + color : '') + '" '
    + 'onclick="_top.txTypeFilter=\'' + id + '\';_topRenderBody()">'
    + (icon ? '<iconify-icon icon="' + icon + '" style="font-size:10px"></iconify-icon>' : '')
    + label + '</button>';
}

function _topStatusChip(id, label) {
  var sel = _top.txStatusFilter === id;
  return '<button class="top-chip' + (sel ? ' active' : '') + '" onclick="_top.txStatusFilter=\'' + id + '\';_topRenderBody()">' + label + '</button>';
}

function _topTxRow(t) {
  var meta = ADMIN_TOKEN_TX_TYPES[t.type] || { label:t.type, color:'#6B7280', icon:'solar:document-bold', direction:'out' };
  var isIn = (t.amount || 0) > 0;
  var amountColor = isIn ? '#22C55E' : '#EF4444';

  var statusMeta = {
    success:   { label:'Başarılı', color:'#22C55E' },
    pending:   { label:'Beklemede', color:'#F59E0B' },
    cancelled: { label:'İptal', color:'#EF4444' }
  };
  var st = statusMeta[t.status] || { label:t.status, color:'#6B7280' };

  return '<div class="top-tx-row">'
    + '<div class="top-tx-ico" style="background:' + meta.color + '18;color:' + meta.color + '">'
    + '<iconify-icon icon="' + meta.icon + '" style="font-size:14px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="top-tx-head">'
    + '<span class="top-tx-type" style="color:' + meta.color + '">' + meta.label + '</span>'
    + '<span class="top-tx-biz">' + _topEsc(t.bizName) + '</span>'
    + '</div>'
    + '<div class="top-tx-desc">' + _topEsc(t.desc || '') + '</div>'
    + '<div class="top-tx-meta">'
    + '<span>' + _topRelative(t.date) + '</span>'
    + '<span class="top-tx-status" style="color:' + st.color + ';background:' + st.color + '15">' + st.label + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="top-tx-amount" style="color:' + amountColor + '">' + (isIn ? '+' : '') + _topFmt(t.amount) + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P8 — Stiller (.top-*)
   ═══════════════════════════════════════ */
function _topInjectStyles() {
  if (document.getElementById('topStyles')) return;
  var css = ''
    + '.top-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Header */
    + '.top-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.top-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.top-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.top-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.top-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:6px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-subtle);position:sticky;top:57px;z-index:9}'
    + '.top-tab-btn{padding:10px;border:none;border-radius:var(--r-md);background:var(--bg-phone-secondary);color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .15s}'
    + '.top-tab-btn.active{background:linear-gradient(135deg,#14B8A6,#06B6D4);color:#fff;box-shadow:0 3px 10px rgba(20,184,166,0.3)}'
    /* Sect */
    + '.top-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.top-sect--rate{border-color:rgba(234,179,8,0.3);background:linear-gradient(135deg,rgba(234,179,8,0.04),transparent)}'
    + '.top-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.top-sect-head span:first-of-type{flex:1}'
    + '.top-sect-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);margin-top:-3px}'
    + '.top-sect-badge{font:var(--fw-bold) 10px/1 var(--font);padding:4px 9px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    + '.top-add-btn{padding:5px 10px;border-radius:var(--r-full);border:1px solid #22C55E;background:rgba(34,197,94,0.08);color:#22C55E;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.top-add-btn:hover{background:#22C55E;color:#fff}'
    /* Rate */
    + '.top-rate-info{display:flex;flex-direction:column;gap:8px}'
    + '.top-rate-formula{font:var(--fw-bold) 20px/1.1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.top-rate-input{width:80px;padding:6px 8px;border:2px solid #EAB308;border-radius:var(--r-sm);background:var(--bg-phone);font:var(--fw-bold) 16px/1 var(--font);color:#EAB308;outline:none;text-align:center;font-family:inherit}'
    + '.top-rate-input:focus{box-shadow:0 0 0 3px rgba(234,179,8,0.15)}'
    + '.top-rate-hint{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted)}'
    + '.top-rate-changed{color:#EAB308;font-weight:600}'
    + '.top-rate-apply{align-self:flex-start;padding:8px 14px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#EAB308,#F59E0B);color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 3px 10px rgba(234,179,8,0.3)}'
    /* Packages */
    + '.top-pkg-list{display:flex;flex-direction:column;gap:6px}'
    + '.top-pkg-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);transition:all .15s}'
    + '.top-pkg-row:hover{border-color:#22C55E}'
    + '.top-pkg-row--off{opacity:0.5}'
    + '.top-pkg-ico{width:32px;height:32px;border-radius:var(--r-md);background:rgba(34,197,94,0.12);color:#22C55E;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.top-pkg-main{flex:1;min-width:0}'
    + '.top-pkg-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-pkg-tl{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);font-family:inherit}'
    + '.top-pkg-token{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);font-family:inherit}'
    + '.top-pkg-bonus{font:var(--fw-bold) 11px/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.12);padding:3px 7px;border-radius:var(--r-full);font-family:inherit}'
    + '.top-pkg-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.top-pkg-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}'
    /* Toggle */
    + '.top-toggle{width:36px;height:20px;border-radius:var(--r-full);background:var(--border-subtle);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;--toggle-c:#22C55E}'
    + '.top-toggle.on{background:var(--toggle-c)}'
    + '.top-toggle-dot{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}'
    + '.top-toggle.on .top-toggle-dot{transform:translateX(16px)}'
    + '.top-ico-btn{width:28px;height:28px;border:1px solid var(--border-subtle);border-radius:var(--r-sm);background:var(--bg-phone);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.top-ico-btn--danger:hover{border-color:#EF4444;color:#EF4444}'
    /* Campaign */
    + '.top-camp-box{padding:12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid var(--border-subtle);display:flex;flex-direction:column;gap:8px}'
    + '.top-camp-box.active{border-left-color:#EC4899;background:linear-gradient(135deg,rgba(236,72,153,0.05),transparent 60%)}'
    + '.top-camp-title{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.top-camp-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted)}'
    + '.top-camp-rules{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}'
    + '.top-camp-rule{padding:8px;border-radius:var(--r-sm);background:var(--bg-phone);text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-camp-rule span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);display:block;text-transform:uppercase;letter-spacing:.3px;font-family:inherit}'
    + '.top-camp-rule b{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#EC4899;display:block;margin-top:4px;font-family:inherit}'
    + '.top-camp-status{display:inline-flex;align-items:center;gap:5px;font:var(--fw-medium) 11px/1 var(--font);color:#22C55E;padding:6px 10px;border-radius:var(--r-full);background:rgba(34,197,94,0.1);align-self:flex-start}'
    + '.top-camp-status--off{color:var(--text-muted);background:var(--bg-phone)}'
    + '.top-live-dot{width:6px;height:6px;border-radius:50%;background:#22C55E;animation:topPulse 1.5s ease-in-out infinite}'
    + '@keyframes topPulse{0%,100%{opacity:1}50%{opacity:0.4}}'
    + '.top-chip-label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.top-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:4px}'
    + '.top-chip:hover{background:var(--bg-phone-secondary)}'
    + '.top-chip.active{border-color:#14B8A6;background:rgba(20,184,166,0.1);color:#14B8A6}';
  var s = document.createElement('style');
  s.id = 'topStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _topInjectStylesPart2();
}

function _topInjectStylesPart2() {
  if (document.getElementById('topStyles2')) return;
  var css = ''
    /* Analytics KPIs */
    + '.top-kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.top-kpi{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:4px}'
    + '.top-kpi--in{border-top:3px solid #22C55E}'
    + '.top-kpi--gift{border-top:3px solid #EC4899}'
    + '.top-kpi--out{border-top:3px solid #F97316}'
    + '.top-kpi--net{border-top:3px solid #3B82F6}'
    + '.top-kpi-head{display:flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.top-kpi-val{font:var(--fw-bold) 20px/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;margin-top:4px}'
    + '.top-kpi-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    /* Reserve card */
    + '.top-reserve{background:linear-gradient(135deg,#F8FAFC,transparent);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.top-reserve-head{display:flex;align-items:center;justify-content:space-between;gap:8px}'
    + '.top-reserve-title{display:inline-flex;align-items:center;gap:5px;font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.top-reserve-badge{display:inline-flex;align-items:center;gap:5px;font:var(--fw-bold) 10px/1 var(--font);padding:4px 9px;border-radius:var(--r-full)}'
    + '.top-reserve-pair{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-reserve-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;font-family:inherit}'
    + '.top-reserve-val{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:5px;font-family:inherit}'
    + '.top-reserve-val span{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-left:2px}'
    + '.top-reserve-bar-wrap{display:flex;flex-direction:column;gap:6px}'
    + '.top-reserve-bar{height:10px;border-radius:var(--r-full);background:var(--bg-phone-secondary);overflow:hidden}'
    + '.top-reserve-bar-fill{height:100%;border-radius:var(--r-full);transition:width .4s}'
    + '.top-reserve-pct{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-primary);text-align:right}'
    + '.top-reserve-warn{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:var(--r-md);background:rgba(239,68,68,0.08);color:#B91C1C;font:var(--fw-medium) 11px/1.4 var(--font)}'
    + '.top-reserve-ok{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:var(--r-md);background:rgba(34,197,94,0.08);color:#15803D;font:var(--fw-medium) 11px/1.4 var(--font)}'
    /* Trend chart */
    + '.top-canvas{width:100%;height:180px;display:block}'
    + '.top-trend-range{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}'
    /* Gift conversion */
    + '.top-gift-conv{display:flex;flex-direction:column;gap:6px}'
    + '.top-gc-row{display:grid;grid-template-columns:70px 1fr 40px;gap:8px;align-items:center}'
    + '.top-gc-label{font:var(--fw-medium) 10px/1.2 var(--font);color:var(--text-secondary)}'
    + '.top-gc-bar{height:8px;border-radius:var(--r-full);background:var(--bg-phone-secondary);overflow:hidden}'
    + '.top-gc-bar-fill{height:100%;border-radius:var(--r-full);transition:width .4s}'
    + '.top-gc-val{font:var(--fw-bold) 11px/1 var(--font);text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    /* Tx list */
    + '.top-tx-filters{display:flex;flex-wrap:wrap;gap:4px;align-items:center}'
    + '.top-tx-list{display:flex;flex-direction:column;gap:4px}'
    + '.top-tx-row{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);transition:background .15s}'
    + '.top-tx-row:hover{background:rgba(20,184,166,0.05)}'
    + '.top-tx-ico{width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.top-tx-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.top-tx-type{font:var(--fw-semibold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.3px}'
    + '.top-tx-biz{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.top-tx-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:4px}'
    + '.top-tx-meta{display:flex;align-items:center;gap:8px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.top-tx-status{font:var(--fw-bold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);text-transform:uppercase;letter-spacing:.3px}'
    + '.top-tx-amount{font:var(--fw-bold) 14px/1 var(--font);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;flex-shrink:0}'
    + '.top-empty{padding:36px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--text-muted);font:var(--fw-regular) 11px/1.3 var(--font)}'
    /* Package modal */
    + '.top-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.top-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.top-modal-backdrop--crit.open{background:rgba(15,23,42,0.75)}'
    + '.top-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.top-modal--crit{max-width:420px;border-radius:var(--r-xl);margin-bottom:16px}'
    + '.top-modal-backdrop.open .top-modal{transform:translateY(0)}'
    + '.top-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.top-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.top-mhead-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}'
    + '.top-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.top-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.top-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.top-field{display:flex;flex-direction:column;gap:5px}'
    + '.top-field label{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.top-amt-wrap{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);transition:border-color .15s}'
    + '.top-amt-wrap:focus-within{border-color:#22C55E}'
    + '.top-amt-prefix{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#22C55E}'
    + '.top-amt-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-amt-unit{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted)}'
    + '.top-bonus-box{display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(34,197,94,0.08),transparent);border:1px dashed rgba(34,197,94,0.4)}'
    + '.top-bonus-box--zero{background:var(--bg-phone-secondary);border-style:solid;border-color:var(--border-subtle);font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}'
    + '.top-bonus-big{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#22C55E;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-bonus-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.top-cta{width:100%;padding:13px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#14B8A6,#06B6D4);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(20,184,166,0.3)}'
    + '.top-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.75}'
    /* Rate confirm */
    + '.top-conf-head{padding:22px 16px;color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.top-conf-ico{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center}'
    + '.top-conf-title{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.top-conf-sub{font:var(--fw-regular) 11px/1.3 var(--font);opacity:0.9}'
    + '.top-conf-body{padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.top-conf-q{font:var(--fw-semibold) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);text-align:center}'
    + '.top-conf-change{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.top-conf-side{flex:1;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.top-conf-side span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);display:block;text-transform:uppercase;letter-spacing:.3px;font-family:inherit}'
    + '.top-conf-side b{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);display:block;margin-top:4px;font-family:inherit}'
    + '.top-conf-warn{display:flex;align-items:flex-start;gap:6px;padding:10px;border-radius:var(--r-md);background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);font:var(--fw-medium) 11px/1.4 var(--font);color:#92400E}'
    + '.top-conf-ask{text-align:center;font:var(--fw-semibold) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);margin-top:4px}'
    + '.top-conf-btns{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;padding:10px 16px 16px}'
    + '.top-conf-cancel{padding:13px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer}'
    + '.top-conf-apply{padding:13px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#EAB308,#F59E0B);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 4px 14px rgba(234,179,8,0.35)}';
  var s = document.createElement('style');
  s.id = 'topStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}
