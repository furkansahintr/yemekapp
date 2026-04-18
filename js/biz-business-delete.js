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

/* ═══ Styles ═══ */
function _badInjectStyles() {
  if (document.getElementById('badStyles')) return;
  var s = document.createElement('style');
  s.id = 'badStyles';
  s.textContent = [
    '.bad-overlay{color:var(--text-primary);background:linear-gradient(180deg,#F8FAFC 0%,#FEF2F2 50%,var(--bg-phone))}',
    '.bad-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);border-bottom:1px solid rgba(239,68,68,.15);z-index:5}',
    '.bad-back{width:34px;height:34px;border-radius:10px;background:rgba(239,68,68,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary)}',
    '.bad-back:active{transform:scale(.94)}',
    '.bad-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.bad-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.bad-wrap{padding:14px;display:flex;flex-direction:column;gap:12px;padding-bottom:28px}',
    '/* Pride card */',
    '.bad-pride-card{position:relative;border-radius:18px;padding:18px 16px;background:linear-gradient(135deg,#1E3A8A 0%,#6D28D9 50%,#BE185D 100%);color:#fff;overflow:hidden;box-shadow:0 6px 20px rgba(109,40,217,.25)}',
    '.bad-pride-shine{position:absolute;top:-40%;right:-10%;width:60%;height:180%;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);transform:rotate(22deg);pointer-events:none;animation:badShine 4.5s ease-in-out infinite}',
    '@keyframes badShine{0%,100%{opacity:.2}50%{opacity:.5}}',
    '.bad-pride-top{position:relative;display:inline-flex;align-items:center;gap:6px;padding:4px 11px;background:rgba(0,0,0,.25);border-radius:999px;font-size:11px;font-weight:700;margin-bottom:10px;backdrop-filter:blur(4px);z-index:1}',
    '.bad-pride-q{position:relative;font-size:16px;font-weight:800;line-height:1.35;margin-bottom:14px;z-index:1;text-shadow:0 1px 2px rgba(0,0,0,.15)}',
    '.bad-pride-q b{font-weight:800;color:#FCD34D}',
    '.bad-pride-grid{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;z-index:1}',
    '.bad-pride-val{font-size:18px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}',
    '.bad-pride-lbl{font-size:10px;opacity:.82;margin-top:3px;font-weight:600}',
    '/* Legal */',
    '.bad-legal{background:rgba(100,116,139,.08);border:1px solid rgba(100,116,139,.2);border-radius:12px;padding:12px 14px}',
    '.bad-legal-head{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#475569;letter-spacing:.3px;text-transform:uppercase;margin-bottom:7px}',
    '.bad-legal-body{font-size:12px;color:var(--text-primary);line-height:1.6}',
    '.bad-legal-body b{font-weight:700}',
    '/* Token warn */',
    '.bad-token-warn{display:flex;gap:11px;padding:13px;background:linear-gradient(135deg,#FEF3C7,#FEF9E7);border:1.5px solid #FDE68A;border-radius:14px}',
    '.bad-token-ico{width:38px;height:38px;border-radius:12px;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #FCD34D}',
    '.bad-token-title{font-size:13px;font-weight:700;color:#78350F;line-height:1.3}',
    '.bad-token-title b{color:#D97706}',
    '.bad-token-body{font-size:11.5px;color:#92400E;margin-top:3px;line-height:1.5}',
    '.bad-token-body b{font-weight:700}',
    '.bad-token-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}',
    '.bad-btn-mini{padding:6px 10px;border:none;background:#fff;color:#B45309;border:1px solid #FDE68A;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.bad-btn-mini:active{transform:scale(.96)}',
    '.bad-btn-mini--violet{background:#8B5CF6;color:#fff;border-color:#8B5CF6}',
    '/* 30g info */',
    '.bad-info-30{display:flex;align-items:center;gap:7px;padding:10px 12px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.18);border-radius:10px;font-size:11.5px;color:var(--text-primary);line-height:1.5}',
    '.bad-info-30 b{font-weight:700;color:#2563EB}',
    '/* Final */',
    '.bad-final{display:flex;flex-direction:column;gap:8px;padding-top:4px}',
    '.bad-btn-danger{padding:13px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:12px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 4px 14px rgba(239,68,68,.3)}',
    '.bad-btn-danger:active{transform:scale(.98)}',
    '.bad-btn-danger-small{padding:11px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:1;box-shadow:0 2px 8px rgba(239,68,68,.25)}',
    '.bad-btn-danger-small:active{transform:scale(.97)}',
    '.bad-btn-danger-small.disabled{opacity:.4;cursor:not-allowed;box-shadow:none}',
    '.bad-btn-ghost{padding:11px;border:1px solid var(--border-soft);background:#fff;color:var(--text-muted);border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;flex:1}',
    '.bad-btn-ghost:active{transform:scale(.97)}',
    '.bad-btn-link{padding:6px 10px;border:none;background:transparent;color:#8B5CF6;font-size:11.5px;font-weight:700;cursor:pointer}',
    '.bad-btn-primary{padding:12px;border:none;background:linear-gradient(135deg,#3B82F6,#2563EB);color:#fff;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(59,130,246,.25)}',
    '.bad-btn-primary:active{transform:scale(.97)}',
    '.bad-btn-wide{width:100%}',
    '.bad-btn-small{padding:8px 13px;font-size:11.5px}',
    '/* Flow modal */',
    '.bad-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);display:flex;align-items:flex-end;justify-content:center;z-index:97;opacity:0;transition:opacity .24s ease}',
    '.bad-modal-backdrop.open{opacity:1}',
    '.bad-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:20px 20px 0 0;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);max-height:92vh;overflow-y:auto}',
    '.bad-modal-backdrop.open .bad-modal{transform:translateY(0)}',
    '.bad-flow-head{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 16px 10px;background:var(--bg-phone);z-index:3}',
    '.bad-flow-close{width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
    '.bad-flow-title{font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.bad-flow-sub{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.bad-step-dots{display:flex;gap:5px;padding:0 16px 10px;align-items:center}',
    '.bad-dot{flex:1;height:4px;border-radius:999px;background:var(--bg-phone-secondary);transition:background .25s}',
    '.bad-dot.done{background:#EF4444}',
    '.bad-dot.active{background:linear-gradient(90deg,#EF4444,#DC2626)}',
    '.bad-flow-body{padding:4px 16px 18px;display:flex;flex-direction:column;gap:10px}',
    '.bad-flow-body--center{align-items:center;text-align:center}',
    '.bad-flow-intro{font-size:12.5px;color:var(--text-primary);line-height:1.5}',
    '.bad-reason-grid{display:flex;flex-direction:column;gap:5px}',
    '.bad-chip{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-phone);border:1.5px solid var(--border-soft);border-radius:10px;font-size:12px;font-weight:600;color:var(--text-primary);cursor:pointer;transition:all .15s}',
    '.bad-chip:active{transform:scale(.98)}',
    '.bad-chip.selected{border-color:#EF4444;background:rgba(239,68,68,.04)}',
    '.bad-chip span{flex:1}',
    '.bad-note{width:100%;min-height:70px;padding:10px 12px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);border-radius:10px;color:var(--text-primary);font-size:12px;outline:none;font-family:inherit;resize:vertical}',
    '.bad-note:focus{border-color:#EF4444}',
    '.bad-verify-ico{width:78px;height:78px;border-radius:50%;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;margin:10px auto 4px}',
    '.bad-verify-title{font-size:17px;font-weight:800;color:var(--text-primary)}',
    '.bad-verify-sub{font-size:12px;color:var(--text-muted);line-height:1.5;max-width:320px}',
    '.bad-input{width:100%;max-width:280px;padding:12px 14px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);color:var(--text-primary);border-radius:10px;font-size:14px;outline:none;text-align:center}',
    '.bad-input:focus{border-color:#8B5CF6}',
    '.bad-otp-input{font-size:22px;font-weight:800;letter-spacing:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '.bad-flow-footer{display:flex;gap:8px;margin-top:6px;width:100%}',
    '/* Suspended */',
    '.bad-susp-bar{position:sticky;top:62px;display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(135deg,#FEE2E2,#FECACA);border:1px solid #FCA5A5;border-radius:12px;z-index:4;animation:badSirenPulse 2.4s ease-in-out infinite}',
    '@keyframes badSirenPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.35)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}',
    '.bad-susp-bar-title{font-size:12.5px;font-weight:800;color:#991B1B;line-height:1.2}',
    '.bad-susp-bar-title b{color:#DC2626}',
    '.bad-susp-bar-sub{font-size:10.5px;color:#B91C1C;margin-top:2px}',
    '.bad-susp-card{padding:28px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;background:linear-gradient(180deg,rgba(100,116,139,.06),#fff);border:1.5px dashed rgba(100,116,139,.3);border-radius:18px}',
    '.bad-susp-title{font-size:18px;font-weight:800;color:var(--text-primary);margin-top:4px}',
    '.bad-susp-sub{font-size:12px;color:var(--text-muted);line-height:1.5;max-width:320px}',
    '.bad-susp-sub b{font-weight:800;color:#DC2626}',
    '.bad-countdown-num{font-size:56px;font-weight:800;color:#DC2626;line-height:1;font-variant-numeric:tabular-nums;margin-top:8px;text-shadow:0 2px 4px rgba(220,38,38,.15)}',
    '.bad-countdown-lbl{font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:2px;margin-top:4px}',
    '.bad-susp-hint{font-size:10.5px;color:var(--text-muted);margin-top:4px;font-style:italic;max-width:300px;line-height:1.45}',
    '.bad-susp-hint b{font-weight:700;color:var(--text-primary)}',
    '.bad-empty{text-align:center;padding:40px 16px;color:var(--text-muted)}'
  ].join('\n');
  document.head.appendChild(s);
}
