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

/* ═══ P7 — 3-step flow (flow modali) ═══ */
function _badOpenFlow() {
  _badCloseFlow();
  var host = document.getElementById('bizPhone') || document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'badFlowModal';
  m.className = 'bad-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _badCloseFlow(); };
  m.innerHTML = '<div class="bad-modal"><div id="badFlowBody"></div></div>';
  host.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _badRenderFlow();
}

function _badCloseFlow() {
  var m = document.getElementById('badFlowModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _badRenderFlow() {
  var body = document.getElementById('badFlowBody');
  if (!body) return;

  var titles = ['Silme Sebebi', 'Şifre Doğrulama', 'SMS Doğrulama'];
  var h = '<div class="bad-flow-head">'
    + '<div class="bad-flow-close" onclick="_badCloseFlow()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1"><div class="bad-flow-title">' + titles[_bad.step - 1] + '</div>'
    + '<div class="bad-flow-sub">Adım ' + _bad.step + '/3 · 3 aşamalı güvenlik</div></div>'
    + '</div>'
    + '<div class="bad-step-dots">'
    + [1,2,3].map(function(i){
        return '<div class="bad-dot' + (i < _bad.step ? ' done' : i === _bad.step ? ' active' : '') + '"></div>';
      }).join('')
    + '</div>';

  if (_bad.step === 1) h += _badFlowStep1();
  else if (_bad.step === 2) h += _badFlowStep2();
  else if (_bad.step === 3) h += _badFlowStep3();

  body.innerHTML = h;
}

function _badFlowStep1() {
  var h = '<div class="bad-flow-body">';
  h += '<div class="bad-flow-intro">İşletmeni silme sebebini paylaş. Bir veya birden fazla seçebilirsin.</div>';
  h += '<div class="bad-reason-grid">';
  for (var i = 0; i < BIZ_DELETE_REASONS.length; i++) {
    var r = BIZ_DELETE_REASONS[i];
    var sel = !!_bad.selectedReasons[r.id];
    h += '<div class="bad-chip' + (sel ? ' selected' : '') + '" onclick="_badToggleReason(\'' + r.id + '\')">'
      + '<iconify-icon icon="' + r.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + _badEsc(r.label) + '</span>'
      + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#10B981"></iconify-icon>' : '')
      + '</div>';
  }
  h += '</div>';
  h += '<textarea class="bad-note" maxlength="300" placeholder="(Opsiyonel) Geri bildirimin..." oninput="_bad.note=this.value">' + _badEsc(_bad.note) + '</textarea>';

  var valid = Object.keys(_bad.selectedReasons).filter(function(k){ return _bad.selectedReasons[k]; }).length > 0;
  h += '<div class="bad-flow-footer">'
    + '<button class="bad-btn-ghost" onclick="_badCloseFlow()">Vazgeç</button>'
    + '<button class="bad-btn-danger-small' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_bad.step=2;_badRenderFlow()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>';
  h += '</div>';
  return h;
}

function _badToggleReason(id) {
  _bad.selectedReasons[id] = !_bad.selectedReasons[id];
  _badRenderFlow();
}

function _badFlowStep2() {
  return '<div class="bad-flow-body bad-flow-body--center">'
    + '<div class="bad-verify-ico"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:40px;color:#8B5CF6"></iconify-icon></div>'
    + '<div class="bad-verify-title">Şifre Doğrulama</div>'
    + '<div class="bad-verify-sub">İşletme sahibi olduğunu doğrulamak için hesap şifreni gir.</div>'
    + '<input type="password" class="bad-input" placeholder="İşletme şifresi" value="' + _badEsc(_bad.password) + '" oninput="_bad.password=this.value">'
    + '<div class="bad-flow-footer">'
    + '<button class="bad-btn-ghost" onclick="_bad.step=1;_badRenderFlow()">Geri</button>'
    + '<button class="bad-btn-danger-small" onclick="if(_bad.password.length>=4){_bad.step=3;_badRenderFlow()}else if(typeof _admToast===\'function\')_admToast(\'Şifre en az 4 karakter\',\'err\')">'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div></div>';
}

function _badFlowStep3() {
  return '<div class="bad-flow-body bad-flow-body--center">'
    + '<div class="bad-verify-ico"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:40px;color:#EF4444"></iconify-icon></div>'
    + '<div class="bad-verify-title">SMS Doğrulama</div>'
    + '<div class="bad-verify-sub">Kayıtlı telefona gönderilen <b>6 haneli kodu</b> gir.</div>'
    + '<input type="text" class="bad-input bad-otp-input" maxlength="6" placeholder="• • • • • •" value="' + _badEsc(_bad.otp) + '" oninput="_bad.otp=this.value.replace(/\\D/g,\'\');this.value=_bad.otp">'
    + '<button class="bad-btn-link" onclick="if(typeof _admToast===\'function\')_admToast(\'Kod yeniden gönderildi\',\'ok\')">Kodu Yeniden Gönder</button>'
    + '<div class="bad-flow-footer">'
    + '<button class="bad-btn-ghost" onclick="_bad.step=2;_badRenderFlow()">Geri</button>'
    + '<button class="bad-btn-danger-small" onclick="if(_bad.otp.length===6){_badCompleteAccountDeletion()}else if(typeof _admToast===\'function\')_admToast(\'6 haneli kodu tam gir\',\'err\')">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:13px"></iconify-icon>Hesabı Sil</button>'
    + '</div></div>';
}

function _badCompleteAccountDeletion() {
  var stats = (typeof BIZ_ACCOUNT_STATS !== 'undefined') ? BIZ_ACCOUNT_STATS : { walletTokens:0, branchCount:0 };
  var now = new Date();
  var deleteAt = new Date(now.getTime() + 30 * 86400000);

  BIZ_ACCOUNT_DELETION_STATE = {
    scheduledAt: now.toISOString(),
    deleteAt: deleteAt.toISOString(),
    reasons: Object.keys(_bad.selectedReasons).filter(function(k){ return _bad.selectedReasons[k]; }),
    note: _bad.note || '',
    tokenAtStart: stats.walletTokens,
    branchCount: stats.branchCount
  };

  _badCloseFlow();
  _bad.view = 'suspended';
  _bad.step = 4;
  _badRenderBody();

  if (typeof _admToast === 'function') _admToast('Hesap askıya alındı · 30 gün içinde geri alabilirsin', 'ok');
}

function _badRenderSuspended() {
  var s = BIZ_ACCOUNT_DELETION_STATE;
  if (!s) return '<div class="bad-wrap"><div class="bad-empty">Askı bilgisi bulunamadı.</div></div>';

  var daysLeft = Math.max(0, Math.ceil((new Date(s.deleteAt) - new Date()) / 86400000));
  var deleteAt = new Date(s.deleteAt);
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var dateStr = deleteAt.getDate() + ' ' + months[deleteAt.getMonth()] + ' ' + deleteAt.getFullYear();

  var h = '<div class="bad-wrap">';
  h += '<div class="bad-susp-bar">'
    + '<iconify-icon icon="solar:siren-bold" style="font-size:17px;color:#EF4444"></iconify-icon>'
    + '<div style="flex:1"><div class="bad-susp-bar-title"><b>' + daysLeft + ' gün</b> kaldı · Hesap silinecek</div>'
    + '<div class="bad-susp-bar-sub">Silinme tarihi: ' + dateStr + '</div></div>'
    + '<button class="bad-btn-primary bad-btn-small" onclick="_badCancelAccountDeletion()">Geri Al</button>'
    + '</div>';

  h += '<div class="bad-susp-card">'
    + '<iconify-icon icon="solar:moon-sleep-bold" style="font-size:54px;color:#64748B"></iconify-icon>'
    + '<div class="bad-susp-title">İşletme hesabı askıda</div>'
    + '<div class="bad-susp-sub"><b>' + s.branchCount + ' şube</b>, tüm menüler ve <b>' + s.tokenAtStart + ' token</b> ' + dateStr + ' tarihinde silinecektir.</div>'
    + '<div class="bad-countdown-num">' + daysLeft + '</div>'
    + '<div class="bad-countdown-lbl">GÜN KALDI</div>'
    + '<button class="bad-btn-primary bad-btn-wide" onclick="_badCancelAccountDeletion()">'
    + '<iconify-icon icon="solar:restart-bold" style="font-size:15px"></iconify-icon>İşlemi İptal Et & Geri Dön</button>'
    + '<div class="bad-susp-hint">31. günden itibaren giriş yapılamaz. Arşiv için <b>destek@yemekapp.com</b>.</div>'
    + '</div>';
  h += '</div>';
  return h;
}

function _badCancelAccountDeletion() {
  BIZ_ACCOUNT_DELETION_STATE = null;
  if (typeof _admToast === 'function') _admToast('Hoş geldin! Hesabın ve tüm şubelerin tam aktif.', 'ok');
  _bad.view = 'main';
  _bad.step = 1;
  _badRenderBody();
}

function _badRenderSuccess() {
  // Başarı ekranı suspended view'a yönlendirildi; burası ileride modal eklenirse kullanılır
}
