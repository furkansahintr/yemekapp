/* ═══════════════════════════════════════════════════════════
   BIZ ACCOUNT DELETE — Genel İşletme Silme
   Yasal bilgilendirme · token tasfiye · ikna · 3-step · 30g askı
   ═══════════════════════════════════════════════════════════ */

var _bad = {
  view: 'main',                // 'main' | 'suspended'
  step: 1,                     // 1=reason, 2=password, 3=otp, 4=success
  selectedReasons: {},
  note: '',
  password: '',
  otp: ''
};

function openBizBusinessDeletePage() {
  _badInjectStyles();
  var host = document.getElementById('bizPhone') || document.getElementById('phone');
  if (!host) return;
  var existing = host.querySelector('.bad-overlay');
  if (existing) existing.remove();

  _bad.view = (typeof BIZ_ACCOUNT_DELETION_STATE !== 'undefined' && BIZ_ACCOUNT_DELETION_STATE) ? 'suspended' : 'main';
  _bad.step = 1;
  _bad.selectedReasons = {};
  _bad.note = '';
  _bad.password = '';
  _bad.otp = '';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open bad-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:80;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'badOverlay';
  host.appendChild(overlay);

  _badRender();
}

function _badClose() {
  var o = document.getElementById('badOverlay');
  if (o) o.remove();
}

function _badEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _badFmtTL(n) {
  return '₺' + Math.round(n).toLocaleString('tr-TR');
}

function _badRender() {
  var o = document.getElementById('badOverlay');
  if (!o) return;

  var h = '<div class="bad-header">'
    + '<div class="bad-back" onclick="_badClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="bad-title"><iconify-icon icon="solar:shield-cross-bold" style="font-size:17px;color:#EF4444"></iconify-icon>İşletme Hesabını Sil</div>'
    + '<div class="bad-sub">Tüm şubeler ve veriler dahil</div>'
    + '</div>'
    + '</div>'
    + '<div id="badBody" style="flex:1"></div>';

  o.innerHTML = h;
  _badRenderBody();
}

function _badRenderBody() {
  var body = document.getElementById('badBody');
  if (!body) return;
  if (_bad.view === 'suspended') body.innerHTML = _badRenderSuspended();
  else if (_bad.step === 4) _badRenderSuccess();
  else body.innerHTML = _badRenderMain();
}

function _badRenderMain() {
  var stats = (typeof BIZ_ACCOUNT_STATS !== 'undefined') ? BIZ_ACCOUNT_STATS : { totalOrders:0, totalRevenue:0, avgRating:0, followers:0, yearsActive:0, topBadge:'', walletTokens:0, branchCount:0 };

  var h = '<div class="bad-wrap">';

  // İkna katmanı — başarı kartı
  h += '<div class="bad-pride-card">'
    + '<div class="bad-pride-shine"></div>'
    + '<div class="bad-pride-top">'
    + '<iconify-icon icon="solar:cup-star-bold" style="font-size:22px;color:#FCD34D"></iconify-icon>'
    + '<span>' + _badEsc(stats.topBadge || 'Başarılı İşletme') + '</span>'
    + '</div>'
    + '<div class="bad-pride-q">Bu başarıyı silmek istediğine <b>emin misin?</b></div>'
    + '<div class="bad-pride-grid">'
    + '<div><div class="bad-pride-val">' + (stats.totalOrders / 1000).toFixed(1).replace('.0','') + 'K</div><div class="bad-pride-lbl">Toplam sipariş</div></div>'
    + '<div><div class="bad-pride-val">' + _badFmtTL(stats.totalRevenue / 1000000).slice(0,-1) + 'M</div><div class="bad-pride-lbl">Ciro</div></div>'
    + '<div><div class="bad-pride-val">' + stats.avgRating + '</div><div class="bad-pride-lbl">Ortalama puan</div></div>'
    + '<div><div class="bad-pride-val">' + (stats.followers / 1000).toFixed(1).replace('.0','') + 'K</div><div class="bad-pride-lbl">Takipçi</div></div>'
    + '<div><div class="bad-pride-val">' + stats.yearsActive + '</div><div class="bad-pride-lbl">Yıl aktif</div></div>'
    + '<div><div class="bad-pride-val">' + stats.branchCount + '</div><div class="bad-pride-lbl">Şube</div></div>'
    + '</div></div>';

  // Yasal bilgilendirme
  h += '<div class="bad-legal">'
    + '<div class="bad-legal-head">'
    + '<iconify-icon icon="solar:document-text-bold" style="font-size:16px;color:#64748B"></iconify-icon>'
    + '<span>Yasal Bilgilendirme</span>'
    + '</div>'
    + '<div class="bad-legal-body">'
    + '<b>Vergi Usul Kanunu ve TTK</b> uyarınca ticari kayıtlarınız <b>10 yıl boyunca arşivlenecektir</b>. '
    + 'Bu süre zarfında sisteme erişiminiz olmayacaktır. '
    + 'Arşiv verileri için <b>destek@yemekapp.com</b> ile iletişime geçebilirsiniz.'
    + '</div></div>';

  // Token tasfiyesi
  if (stats.walletTokens > 0) {
    h += '<div class="bad-token-warn">'
      + '<div class="bad-token-ico"><iconify-icon icon="solar:wallet-money-bold" style="font-size:22px"></iconify-icon></div>'
      + '<div style="flex:1">'
      + '<div class="bad-token-title">İşletme cüzdanında <b>' + stats.walletTokens + ' token</b></div>'
      + '<div class="bad-token-body">Bu tokenlar <b>geri iade edilemez</b>. Silmeden önce kullanıcılarına hediye etmeni veya kampanya olarak kullanmanı öneririz.</div>'
      + '<div class="bad-token-actions">'
      + '<button class="bad-btn-mini" onclick="_badClose();if(typeof _admToast===\'function\')_admToast(\'Kampanya kurgu sayfasına yönlendiriliyor\',\'ok\')">'
      + '<iconify-icon icon="solar:gift-bold" style="font-size:13px"></iconify-icon>Kampanyaya Dönüştür</button>'
      + '<button class="bad-btn-mini bad-btn-mini--violet" onclick="_badClose();if(typeof _admToast===\'function\')_admToast(\'Kullanıcı hediye akışı\',\'ok\')">'
      + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:13px"></iconify-icon>Kullanıcılara Hediye</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // 30 gün uyarısı
  h += '<div class="bad-info-30">'
    + '<iconify-icon icon="solar:calendar-date-bold" style="font-size:15px;color:#3B82F6"></iconify-icon>'
    + '<span>Silme onayı sonrası <b>30 gün geri alma süresi</b> tanımlanacaktır. Bu süre içinde giriş yaparsan işlem iptal olur.</span>'
    + '</div>';

  // Final CTA
  h += '<div class="bad-final">'
    + '<button class="bad-btn-danger" onclick="_bad.step=1;_badRenderBody();_badOpenFlow()">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:16px"></iconify-icon>'
    + 'Hesabı ve Tüm Şubeleri Sil</button>'
    + '<button class="bad-btn-ghost" onclick="_badClose()">Vazgeç, Kalıyorum</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _badOpenFlow() {
  if (typeof _admToast === 'function') _admToast('3-step akışı (P7) yakında...', 'ok');
}

function _badRenderSuspended() {
  return '<div class="bad-wrap"><div class="bad-empty">Askıya alma ekranı (P7)</div></div>';
}

function _badRenderSuccess() {
  // P7'de doldurulacak
}
