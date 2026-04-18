/* ═══════════════════════════════════════════════════════════
   DELETE ACCOUNT — Hesap Silme / Veda Akışı
   Kayıp önleme + anket + 30 gün askıya alma
   ═══════════════════════════════════════════════════════════ */

var _dac = {
  selectedReasons: {},       // { 'slow': true }
  surveyNote: '',
  otp: '',
  view: 'main'               // 'main' | 'suspended'
};

function openDeleteAccountPage() {
  _dacInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.dac-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open dac-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:79;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'dacOverlay';
  phone.appendChild(overlay);

  _dac.view = (typeof ACCOUNT_DELETION_STATE !== 'undefined' && ACCOUNT_DELETION_STATE) ? 'suspended' : 'main';
  _dac.selectedReasons = {};
  _dac.surveyNote = '';
  _dacRender();
}

function _dacClose() {
  var o = document.getElementById('dacOverlay');
  if (o) o.remove();
  _dacCloseAllModals();
}

function _dacCloseAllModals() {
  ['dacConfirmModal','dacOtpModal','dacSuccessModal','dacSupportModal'].forEach(function(id) {
    var m = document.getElementById(id);
    if (m) m.remove();
  });
}

/* ── Helpers ── */
function _dacEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Render ── */
function _dacRender() {
  var o = document.getElementById('dacOverlay');
  if (!o) return;

  var h = '<div class="dac-header">'
    + '<div class="dac-back" onclick="_dacClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="dac-title"><iconify-icon icon="solar:heart-angle-bold" style="font-size:17px;color:#EC4899"></iconify-icon>Hesabımı Sil</div>'
    + '<div class="dac-sub">Gitmeden önce son bir söz...</div>'
    + '</div>'
    + '</div>'
    + '<div id="dacBody" style="flex:1"></div>';

  o.innerHTML = h;
  _dacRenderBody();
}

function _dacRenderBody() {
  var body = document.getElementById('dacBody');
  if (!body) return;
  if (_dac.view === 'suspended') body.innerHTML = _dacRenderSuspended();
  else body.innerHTML = _dacRenderMain();
}

function _dacRenderMain() {
  var h = '<div class="dac-wrap">';

  // Empatik giriş mesajı
  h += '<div class="dac-intro">'
    + '<iconify-icon icon="solar:sad-square-bold" style="font-size:34px;color:#EC4899"></iconify-icon>'
    + '<div class="dac-intro-title">Gerçekten gidiyor musun?</div>'
    + '<div class="dac-intro-body">Sana özel hazırladığımız bu koleksiyondan ayrılmadan önce, birkaç şeyi hatırlatmak isteriz.</div>'
    + '</div>';

  // Token uyarısı (bakiye varsa)
  var tokens = (typeof USER_WALLET !== 'undefined' && USER_WALLET.tokens) ? USER_WALLET.tokens : 0;
  if (tokens > 0) {
    h += '<div class="dac-token-warn">'
      + '<div class="dac-token-icon"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:22px"></iconify-icon></div>'
      + '<div style="flex:1">'
      + '<div class="dac-token-title">Dikkat! <b>' + tokens + ' tokenin</b> yanacak</div>'
      + '<div class="dac-token-body">Silme işlemi tamamlanınca bu tokenlar <b>kalıcı olarak yok edilecektir</b>. Lütfen kullan ya da bir arkadaşınla paylaş.</div>'
      + '<div class="dac-token-actions">'
      + '<button class="dac-btn-mini" onclick="_dacClose();if(typeof openWalletPage==\'function\')openWalletPage()">'
      + '<iconify-icon icon="solar:wallet-bold" style="font-size:13px"></iconify-icon>Cüzdana Git</button>'
      + '<button class="dac-btn-mini dac-btn-mini--violet" onclick="_dacClose();if(typeof openWalletPage==\'function\'){openWalletPage();setTimeout(function(){if(typeof _wltOpenShare===\'function\')_wltOpenShare()},400)}">'
      + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:13px"></iconify-icon>Arkadaşa Gönder</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // Retention kartları
  h += '<div class="dac-retention">';
  for (var i = 0; i < DELETE_RETENTION_MESSAGES.length; i++) {
    var r = DELETE_RETENTION_MESSAGES[i];
    h += '<div class="dac-ret-card" style="border-left:3px solid ' + r.tone + '">'
      + '<div class="dac-ret-ico" style="background:' + r.tone + '15;color:' + r.tone + '">'
      + '<iconify-icon icon="' + r.icon + '" style="font-size:22px"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1">'
      + '<div class="dac-ret-title">' + _dacEsc(r.title) + '</div>'
      + '<div class="dac-ret-body">' + _dacEsc(r.body) + '</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';

  // Destek Al CTA
  h += '<div class="dac-support">'
    + '<div class="dac-support-ico"><iconify-icon icon="solar:chat-round-dots-bold" style="font-size:24px;color:#8B5CF6"></iconify-icon></div>'
    + '<div style="flex:1">'
    + '<div class="dac-support-title">Bir sorun mu var?</div>'
    + '<div class="dac-support-body">Silmeden önce yaşadığın sorunu çözmek için destek ekibimiz burada.</div>'
    + '</div>'
    + '<button class="dac-btn-support" onclick="_dacOpenSupport()">'
    + 'Destek Al <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>';

  // Anket (Neden gidiyorsun?)
  h += '<div class="dac-survey">'
    + '<div class="dac-survey-head">'
    + '<iconify-icon icon="solar:chat-square-call-bold" style="font-size:15px;color:#64748B"></iconify-icon>'
    + '<div><div class="dac-survey-title">Neden gidiyorsun?</div>'
    + '<div class="dac-survey-sub">Birden fazla seçebilirsin. Seni geri kazanmak için elimizden geleni yapalım.</div></div>'
    + '</div>'
    + '<div class="dac-survey-grid">';
  for (var s = 0; s < DELETE_SURVEY_OPTIONS.length; s++) {
    var opt = DELETE_SURVEY_OPTIONS[s];
    var sel = !!_dac.selectedReasons[opt.id];
    h += '<div class="dac-survey-chip' + (sel ? ' selected' : '') + '" onclick="_dacToggleReason(\'' + opt.id + '\')">'
      + '<iconify-icon icon="' + opt.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + _dacEsc(opt.label) + '</span>'
      + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#10B981"></iconify-icon>' : '')
      + '</div>';
  }
  h += '</div>';

  // Not alanı
  h += '<textarea class="dac-survey-note" maxlength="200" placeholder="(Opsiyonel) Kısaca anlatmak ister misin?" '
    + 'oninput="_dac.surveyNote=this.value" id="dacNoteInput">' + _dacEsc(_dac.surveyNote) + '</textarea>';
  h += '</div>';

  // Final veda CTA — kırmızımsı tehlike butonu
  h += '<div class="dac-final">'
    + '<div class="dac-final-note">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:14px;color:#EF4444"></iconify-icon>'
    + '<span>Silme onayının ardından hesabın <b>30 gün</b> askıya alınır, bu süre bitince <b>kalıcı silinir</b>.</span>'
    + '</div>'
    + '<button class="dac-btn-danger" onclick="_dacOpenConfirm()">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:16px"></iconify-icon>'
    + 'Hesabımı Kalıcı Olarak Sil</button>'
    + '<button class="dac-btn-ghost" onclick="_dacClose()">Vazgeç, Kalıyorum</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _dacToggleReason(id) {
  _dac.selectedReasons[id] = !_dac.selectedReasons[id];
  _dacRenderBody();
}

/* ═══ P4 — Onay Modal ═══ */
function _dacOpenConfirm() {
  _dacCloseAllModals();
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'dacConfirmModal';
  m.className = 'dac-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _dacCloseConfirm(); };

  var now = new Date();
  var deleteAt = new Date(now.getTime() + 30 * 86400000);
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var deleteDateStr = deleteAt.getDate() + ' ' + months[deleteAt.getMonth()] + ' ' + deleteAt.getFullYear();

  m.innerHTML = '<div class="dac-modal">'
    + '<div class="dac-confirm">'
    + '<div class="dac-confirm-emoji">👋</div>'
    + '<div class="dac-confirm-title">Seni çok özleyeceğiz...</div>'
    + '<div class="dac-confirm-body">'
    + 'Hesabın <b>30 gün boyunca dondurulacak</b> ve bu sürenin sonunda kalıcı olarak silinecektir. '
    + 'Bu süre zarfında dilediğin an giriş yaparak her şeye kaldığın yerden devam edebilirsin.'
    + '</div>'
    + '<div class="dac-confirm-dates">'
    + '<div class="dac-dr"><span>Askıya alınır</span><b>Bugün</b></div>'
    + '<div class="dac-dr-arrow"><iconify-icon icon="solar:arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div class="dac-dr"><span>Kalıcı silinir</span><b>' + deleteDateStr + '</b></div>'
    + '</div>'
    + '<div class="dac-confirm-hint">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:13px;color:#8B5CF6"></iconify-icon>'
    + '<span>30 gün içinde giriş yaparsan silme işlemi <b>otomatik iptal olur</b>.</span>'
    + '</div>'
    + '<div class="dac-confirm-btns">'
    + '<button class="dac-btn-ghost" onclick="_dacCloseConfirm()">Vazgeç</button>'
    + '<button class="dac-btn-danger dac-btn-danger--small" onclick="_dacOpenOtp()">'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _dacCloseConfirm() {
  var m = document.getElementById('dacConfirmModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

/* ═══ P5 — OTP Doğrulama ═══ */
function _dacOpenOtp() {
  _dacCloseConfirm();
  _dac.otp = '';
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'dacOtpModal';
  m.className = 'dac-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _dacCloseOtp(); };

  // Telefonun son 2 hanesi göster
  var masked = '+90 *** *** ** 42';

  m.innerHTML = '<div class="dac-modal">'
    + '<div class="dac-otp">'
    + '<div class="dac-otp-close" onclick="_dacCloseOtp()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div class="dac-otp-ico"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:36px;color:#8B5CF6"></iconify-icon></div>'
    + '<div class="dac-otp-title">Güvenlik Doğrulaması</div>'
    + '<div class="dac-otp-body">' + masked + ' numaralı telefonuna <b>6 haneli kod</b> gönderdik. Hesap sahibi olduğunu doğrulamak için kodu gir.</div>'
    + '<div class="dac-otp-input-wrap">'
    + '<input class="dac-otp-input" type="text" maxlength="6" placeholder="• • • • • •" '
    + 'oninput="_dac.otp=this.value.replace(/\\D/g,\'\');this.value=_dac.otp;_dacUpdateOtpBtn()" id="dacOtpInput">'
    + '</div>'
    + '<button class="dac-otp-resend" onclick="_dacResendOtp()">'
    + '<iconify-icon icon="solar:restart-linear" style="font-size:12px"></iconify-icon>Kodu Yeniden Gönder</button>'
    + '<div class="dac-otp-hint"><iconify-icon icon="solar:lock-keyhole-minimalistic-linear" style="font-size:12px"></iconify-icon>Alternatif: Şifreni girerek de doğrulayabilirsin.</div>'
    + '<div class="dac-confirm-btns">'
    + '<button class="dac-btn-ghost" onclick="_dacCloseOtp();_dacOpenConfirm()">Geri</button>'
    + '<button class="dac-btn-danger dac-btn-danger--small disabled" id="dacOtpSubmit" onclick="_dacSubmitOtp()">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:13px"></iconify-icon>Doğrula & Sil</button>'
    + '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){
    m.classList.add('open');
    var inp = document.getElementById('dacOtpInput');
    if (inp) inp.focus();
  });
}

function _dacCloseOtp() {
  var m = document.getElementById('dacOtpModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _dacUpdateOtpBtn() {
  var btn = document.getElementById('dacOtpSubmit');
  if (!btn) return;
  var valid = _dac.otp && _dac.otp.length === 6;
  btn.classList.toggle('disabled', !valid);
}

function _dacResendOtp() {
  if (typeof _admToast === 'function') _admToast('Yeni kod gönderildi', 'ok');
}

function _dacSubmitOtp() {
  if (!_dac.otp || _dac.otp.length !== 6) return;
  _dacCloseOtp();
  _dacCompleteDeletion();
}

/* ═══ P6 — Başarı & Askıya Alma ═══ */
function _dacCompleteDeletion() {
  var now = new Date();
  var deleteAt = new Date(now.getTime() + 30 * 86400000);

  ACCOUNT_DELETION_STATE = {
    scheduledAt: now.toISOString(),
    deleteAt: deleteAt.toISOString(),
    reasons: Object.keys(_dac.selectedReasons).filter(function(k){ return _dac.selectedReasons[k]; }),
    note: _dac.surveyNote || ''
  };

  // Admin-incident feed (lokal, prototip)
  if (typeof ADMIN_RETENTION_EVENTS !== 'undefined' && Array.isArray(ADMIN_RETENTION_EVENTS)) {
    ADMIN_RETENTION_EVENTS.unshift({
      id: 'evt_del_' + Date.now().toString(36),
      type: 'account_deletion',
      userId: (typeof AUTH !== 'undefined' && AUTH.user && AUTH.user.name) ? AUTH.user.name : 'Kullanıcı',
      reasons: ACCOUNT_DELETION_STATE.reasons,
      note: ACCOUNT_DELETION_STATE.note,
      status: 'open',
      createdAt: now.toISOString()
    });
  }

  _dacOpenSuccess();
}

function _dacOpenSuccess() {
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'dacSuccessModal';
  m.className = 'dac-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _dacCloseSuccess(); };

  var deleteAt = new Date(ACCOUNT_DELETION_STATE.deleteAt);
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var deleteDateStr = deleteAt.getDate() + ' ' + months[deleteAt.getMonth()] + ' ' + deleteAt.getFullYear();

  m.innerHTML = '<div class="dac-modal">'
    + '<div class="dac-success">'
    + '<div class="dac-success-ico"><iconify-icon icon="solar:hand-heart-bold" style="font-size:56px;color:#EC4899"></iconify-icon></div>'
    + '<div class="dac-success-title">Kendine iyi bak 💜</div>'
    + '<div class="dac-success-body">'
    + 'Hesabın <b>30 gün</b> boyunca askıda kalacak. '
    + '<b>' + deleteDateStr + '</b> tarihinde kalıcı olarak silinecek. '
    + 'Bu süre içinde giriş yaparsan her şey kaldığın yerden devam eder.'
    + '</div>'
    + '<div class="dac-success-tip">'
    + '<iconify-icon icon="solar:sparkles-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span>Seni bekliyor olacağız. Kapımız her zaman açık.</span>'
    + '</div>'
    + '<button class="dac-btn-primary dac-btn-wide" onclick="_dacCloseSuccess();_dac.view=\'suspended\';_dacRenderBody()">'
    + 'Anladım, Görüşürüz</button>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _dacCloseSuccess() {
  var m = document.getElementById('dacSuccessModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _dacOpenSupport() {
  _dacClose();
  if (typeof openSupportPage === 'function') openSupportPage();
  else if (typeof _admToast === 'function') _admToast('Destek ekibi yakında seninle iletişime geçecek', 'ok');
}

function _dacRenderSuspended() {
  var s = ACCOUNT_DELETION_STATE;
  var daysLeft = Math.max(0, Math.ceil((new Date(s.deleteAt) - new Date()) / 86400000));
  var deleteAt = new Date(s.deleteAt);
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var deleteDateStr = deleteAt.getDate() + ' ' + months[deleteAt.getMonth()] + ' ' + deleteAt.getFullYear();

  var h = '<div class="dac-wrap">';
  h += '<div class="dac-susp-card">'
    + '<iconify-icon icon="solar:moon-sleep-bold" style="font-size:56px;color:#8B5CF6"></iconify-icon>'
    + '<div class="dac-susp-title">Hesabın askıya alındı</div>'
    + '<div class="dac-susp-sub">Kalıcı silinmeye <b>' + daysLeft + ' gün</b> kaldı</div>'
    + '<div class="dac-susp-countdown">'
    + '<div class="dac-countdown-num">' + daysLeft + '</div>'
    + '<div class="dac-countdown-lbl">GÜN</div>'
    + '</div>'
    + '<div class="dac-susp-date">Silinme tarihi: <b>' + deleteDateStr + '</b></div>'
    + '<button class="dac-btn-primary dac-btn-wide" onclick="_dacCancelDeletion()">'
    + '<iconify-icon icon="solar:heart-bold" style="font-size:15px"></iconify-icon>Vazgeç & Geri Dön</button>'
    + '<div class="dac-susp-hint">Hoş geldin seni bekliyorduk, bu butona tıklaman yeterli.</div>'
    + '</div>';
  h += '</div>';
  return h;
}

function _dacCancelDeletion() {
  ACCOUNT_DELETION_STATE = null;
  if (typeof _admToast === 'function') _admToast('Tekrar hoş geldin! Hesabın tamamen aktif.', 'ok');
  _dac.view = 'main';
  _dacRenderBody();
}

/* ═══════════════════════════════════════════════════════════
   Styles — P7.1-P7.3 parça parça
   ═══════════════════════════════════════════════════════════ */
function _dacInjectStyles() {
  if (document.getElementById('dacStyles')) return;
  var s = document.createElement('style');
  s.id = 'dacStyles';
  var parts = [];

  // ── P7.1 Layout + header + pastel background ──
  parts.push(
    '.dac-overlay{color:var(--text-primary);background:linear-gradient(180deg,#FDF4FF 0%,#FEF3F2 40%,var(--bg-phone) 100%)}',
    '.dac-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,.78);backdrop-filter:blur(10px);border-bottom:1px solid rgba(236,72,153,.1);z-index:5}',
    '.dac-back{width:34px;height:34px;border-radius:10px;background:rgba(236,72,153,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.dac-back:active{transform:scale(.94)}',
    '.dac-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.dac-sub{font-size:11px;color:var(--text-muted);margin-top:1px;font-style:italic}',
    '.dac-wrap{padding:16px 14px 32px;display:flex;flex-direction:column;gap:14px}'
  );

  // ── P7.2 Intro + token + retention + support + survey + final ──
  parts.push(
    '/* Intro */',
    '.dac-intro{text-align:center;padding:10px 12px 6px;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.dac-intro-title{font-size:20px;font-weight:800;color:#BE185D;line-height:1.2}',
    '.dac-intro-body{font-size:12.5px;color:var(--text-muted);line-height:1.55;max-width:320px}',
    '/* Token warning */',
    '.dac-token-warn{display:flex;gap:12px;padding:14px;background:linear-gradient(135deg,#FEF2F2,#FFF1F2);border:1.5px solid #FECACA;border-radius:14px;box-shadow:0 2px 8px rgba(239,68,68,.08)}',
    '.dac-token-icon{width:38px;height:38px;border-radius:12px;background:#FEE2E2;color:#DC2626;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.dac-token-title{font-size:13px;font-weight:700;color:#991B1B;line-height:1.3}',
    '.dac-token-title b{color:#DC2626}',
    '.dac-token-body{font-size:11.5px;color:#7F1D1D;line-height:1.5;margin-top:4px}',
    '.dac-token-body b{font-weight:700}',
    '.dac-token-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}',
    '.dac-btn-mini{padding:6px 10px;border:none;background:#fff;color:#B91C1C;border:1px solid #FECACA;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.dac-btn-mini:active{transform:scale(.96)}',
    '.dac-btn-mini--violet{background:#8B5CF6;color:#fff;border-color:#8B5CF6}',
    '/* Retention cards */',
    '.dac-retention{display:flex;flex-direction:column;gap:8px}',
    '.dac-ret-card{display:flex;gap:11px;align-items:flex-start;padding:11px 13px;background:rgba(255,255,255,.7);backdrop-filter:blur(6px);border-radius:12px;border:1px solid rgba(0,0,0,.04)}',
    '.dac-ret-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.dac-ret-title{font-size:12.5px;font-weight:700;color:var(--text-primary);line-height:1.2}',
    '.dac-ret-body{font-size:11px;color:var(--text-muted);line-height:1.5;margin-top:3px}',
    '/* Support CTA */',
    '.dac-support{display:flex;align-items:center;gap:10px;padding:13px;background:linear-gradient(135deg,#F5F3FF,#EEF2FF);border:1px solid #DDD6FE;border-radius:14px}',
    '.dac-support-ico{width:40px;height:40px;border-radius:12px;background:#EDE9FE;color:#7C3AED;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.dac-support-title{font-size:13px;font-weight:700;color:#4C1D95}',
    '.dac-support-body{font-size:11px;color:#6D28D9;margin-top:2px;line-height:1.4}',
    '.dac-btn-support{padding:9px 13px;border:none;background:#7C3AED;color:#fff;border-radius:10px;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;flex-shrink:0;box-shadow:0 2px 6px rgba(124,58,237,.3)}',
    '.dac-btn-support:active{transform:scale(.96)}',
    '/* Survey */',
    '.dac-survey{padding:14px;background:rgba(255,255,255,.72);border:1px solid rgba(0,0,0,.05);border-radius:14px;display:flex;flex-direction:column;gap:10px}',
    '.dac-survey-head{display:flex;gap:8px;align-items:flex-start}',
    '.dac-survey-title{font-size:13px;font-weight:700;color:var(--text-primary)}',
    '.dac-survey-sub{font-size:11px;color:var(--text-muted);margin-top:2px;line-height:1.4}',
    '.dac-survey-grid{display:flex;flex-direction:column;gap:6px}',
    '.dac-survey-chip{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#fff;border:1.5px solid var(--border-soft);border-radius:10px;font-size:12px;font-weight:600;color:var(--text-primary);cursor:pointer;transition:all .15s}',
    '.dac-survey-chip:active{transform:scale(.98)}',
    '.dac-survey-chip.selected{border-color:#8B5CF6;background:#8B5CF608}',
    '.dac-survey-chip span{flex:1}',
    '.dac-survey-note{width:100%;min-height:70px;padding:10px 12px;border:1.5px solid var(--border-soft);background:#fff;border-radius:10px;color:var(--text-primary);font-size:12px;outline:none;font-family:inherit;resize:vertical;line-height:1.4}',
    '.dac-survey-note:focus{border-color:#8B5CF6}',
    '/* Final CTA */',
    '.dac-final{display:flex;flex-direction:column;gap:8px;padding-top:6px}',
    '.dac-final-note{display:flex;align-items:flex-start;gap:6px;padding:9px 11px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.16);border-radius:10px;font-size:11px;color:#991B1B;line-height:1.5}',
    '.dac-final-note b{font-weight:700;color:#7F1D1D}',
    '.dac-btn-danger{padding:13px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:12px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 4px 14px rgba(239,68,68,.3)}',
    '.dac-btn-danger:active{transform:scale(.98)}',
    '.dac-btn-danger--small{flex:1;padding:11px;font-size:12.5px}',
    '.dac-btn-ghost{padding:11px;border:1px solid var(--border-soft);background:transparent;color:var(--text-muted);border-radius:10px;font-size:12px;font-weight:600;cursor:pointer}',
    '.dac-btn-ghost:active{transform:scale(.98)}',
    '.dac-btn-primary{padding:12px;border:none;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(139,92,246,.3)}',
    '.dac-btn-primary:active{transform:scale(.97)}',
    '.dac-btn-wide{width:100%}'
  );

  s.textContent = parts.join('\n');
  document.head.appendChild(s);
}
