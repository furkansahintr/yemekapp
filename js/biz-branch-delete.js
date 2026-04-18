/* ═══════════════════════════════════════════════════════════
   BIZ BRANCH DELETE — Şube Kapatma Akışı
   Ön denetim · 3-step (sebep/şifre/OTP) · 30g askıya alma
   ═══════════════════════════════════════════════════════════ */

var _bbd = {
  branchId: null,
  step: 1,                     // 1=reason, 2=password, 3=otp, 4=success
  selectedReasons: {},
  note: '',
  password: '',
  otp: ''
};

function openBizBranchDeletePage(branchId) {
  _bbdInjectStyles();
  var host = document.getElementById('bizPhone') || document.getElementById('phone');
  if (!host) return;
  var existing = host.querySelector('.bbd-overlay');
  if (existing) existing.remove();

  _bbd.branchId = branchId;
  _bbd.step = 1;
  _bbd.selectedReasons = {};
  _bbd.note = '';
  _bbd.password = '';
  _bbd.otp = '';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open bbd-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:80;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'bbdOverlay';
  host.appendChild(overlay);

  _bbdRender();
}

function _bbdClose() {
  var o = document.getElementById('bbdOverlay');
  if (o) o.remove();
}

/* ── Helpers ── */
function _bbdEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _bbdBranch(id) {
  if (typeof BIZ_BRANCHES === 'undefined') return null;
  for (var i = 0; i < BIZ_BRANCHES.length; i++) {
    if (BIZ_BRANCHES[i].id === id) return BIZ_BRANCHES[i];
  }
  return null;
}

function _bbdGate(id) {
  return (BIZ_BRANCH_DELETION_GATE && BIZ_BRANCH_DELETION_GATE[id]) || { activeOrders:0, pendingReservations:0, undelivered:0, staff:0 };
}

/* ── Render ── */
function _bbdRender() {
  var o = document.getElementById('bbdOverlay');
  if (!o) return;
  var br = _bbdBranch(_bbd.branchId);

  var h = '<div class="bbd-header">'
    + '<div class="bbd-back" onclick="_bbdClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="bbd-title"><iconify-icon icon="solar:shop-minus-bold" style="font-size:17px;color:#EF4444"></iconify-icon>Şubeyi Kapat</div>'
    + '<div class="bbd-sub">' + (br ? _bbdEsc(br.name) : 'Şube') + '</div>'
    + '</div>'
    + '</div>'
    + '<div id="bbdBody" style="flex:1"></div>';

  o.innerHTML = h;

  _bbdRenderBody();
}

function _bbdRenderBody() {
  var body = document.getElementById('bbdBody');
  if (!body) return;
  var br = _bbdBranch(_bbd.branchId);
  var g = _bbdGate(_bbd.branchId);

  // Aktif operasyon varsa blocker ekran
  var blocked = g.activeOrders > 0 || g.pendingReservations > 0 || g.undelivered > 0;

  if (blocked) {
    body.innerHTML = _bbdRenderBlocker(br, g);
    return;
  }

  body.innerHTML = _bbdRenderFlow();
}

/* ═══ P3 — 3-Step Flow ═══ */
function _bbdRenderFlow() {
  var br = _bbdBranch(_bbd.branchId);
  var titles = ['Kapatma Sebebi', 'Şifre Doğrulama', 'SMS Doğrulama', 'Tamamlandı'];

  var h = '<div class="bbd-wrap">';

  // Şube özet kartı
  if (br) {
    h += '<div class="bbd-br-summary">'
      + '<iconify-icon icon="solar:shop-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
      + '<div style="flex:1"><div class="bbd-br-name">' + _bbdEsc(br.name) + '</div>'
      + '<div class="bbd-br-addr">' + _bbdEsc(br.address || '') + '</div></div>'
      + '</div>';
  }

  // Step dots
  h += '<div class="bbd-steps">';
  for (var i = 1; i <= 3; i++) {
    h += '<div class="bbd-step' + (i < _bbd.step ? ' done' : i === _bbd.step ? ' active' : '') + '">'
      + '<div class="bbd-step-num">' + (i < _bbd.step ? '<iconify-icon icon="solar:check-bold" style="font-size:12px"></iconify-icon>' : i) + '</div>'
      + '<div class="bbd-step-lbl">' + titles[i-1] + '</div>'
      + '</div>';
  }
  h += '</div>';

  if (_bbd.step === 1) h += _bbdStep1();
  else if (_bbd.step === 2) h += _bbdStep2();
  else if (_bbd.step === 3) h += _bbdStep3();

  h += '</div>';
  return h;
}

function _bbdStep1() {
  var h = '<div class="bbd-step-body">';
  h += '<div class="bbd-step-intro"><b>Neden kapatıyorsun?</b> Cevabın gelişim için bize ışık tutar.</div>';
  h += '<div class="bbd-reason-grid">';
  for (var i = 0; i < BIZ_DELETE_REASONS.length; i++) {
    var r = BIZ_DELETE_REASONS[i];
    var sel = !!_bbd.selectedReasons[r.id];
    h += '<div class="bbd-chip' + (sel ? ' selected' : '') + '" onclick="_bbdToggleReason(\'' + r.id + '\')">'
      + '<iconify-icon icon="' + r.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + _bbdEsc(r.label) + '</span>'
      + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#10B981"></iconify-icon>' : '')
      + '</div>';
  }
  h += '</div>';

  h += '<textarea class="bbd-note" maxlength="200" placeholder="(Opsiyonel) Daha fazla detay..." '
    + 'oninput="_bbd.note=this.value">' + _bbdEsc(_bbd.note) + '</textarea>';

  // Onay modal metni
  h += '<div class="bbd-info-box">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#3B82F6"></iconify-icon>'
    + '<span>Bu şube kapatıldığında <b>şubeye bağlı menüler, garsonlar ve çalışma saatleri</b> yayından kaldırılacaktır. <b>30 gün</b> içinde geri alabilirsiniz.</span>'
    + '</div>';

  var valid = Object.keys(_bbd.selectedReasons).filter(function(k){ return _bbd.selectedReasons[k]; }).length > 0;
  h += '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbdClose()">Vazgeç</button>'
    + '<button class="bbd-btn-danger' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_bbd.step=2;_bbdRenderBody()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>';
  h += '</div>';
  return h;
}

function _bbdToggleReason(id) {
  _bbd.selectedReasons[id] = !_bbd.selectedReasons[id];
  _bbdRenderBody();
}

function _bbdStep2() {
  var h = '<div class="bbd-step-body bbd-step-body--center">'
    + '<div class="bbd-verify-ico"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:38px;color:#8B5CF6"></iconify-icon></div>'
    + '<div class="bbd-verify-title">Şifre Doğrulama</div>'
    + '<div class="bbd-verify-sub">Hesap sahibi olduğunu doğrulamak için işletme şifreni gir.</div>'
    + '<input type="password" class="bbd-input" placeholder="İşletme şifresi" value="' + _bbdEsc(_bbd.password) + '" '
    + 'oninput="_bbd.password=this.value" id="bbdPwd">'
    + '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbd.step=1;_bbdRenderBody()">Geri</button>'
    + '<button class="bbd-btn-danger" onclick="if(_bbd.password.length>=4){_bbd.step=3;_bbdRenderBody()}else if(typeof _admToast===\'function\')_admToast(\'Şifre en az 4 karakter\',\'err\')">'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div></div>';
  return h;
}

function _bbdStep3() {
  var h = '<div class="bbd-step-body bbd-step-body--center">'
    + '<div class="bbd-verify-ico"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:38px;color:#EF4444"></iconify-icon></div>'
    + '<div class="bbd-verify-title">SMS Doğrulama</div>'
    + '<div class="bbd-verify-sub">+90 *** *** ** 42 numaralı telefona gönderilen 6 haneli kodu gir.</div>'
    + '<input type="text" class="bbd-input bbd-otp-input" maxlength="6" placeholder="• • • • • •" value="' + _bbdEsc(_bbd.otp) + '" '
    + 'oninput="_bbd.otp=this.value.replace(/\\D/g,\'\');this.value=_bbd.otp" id="bbdOtp">'
    + '<button class="bbd-btn-link" onclick="if(typeof _admToast===\'function\')_admToast(\'Kod yeniden gönderildi\',\'ok\')">Kodu Yeniden Gönder</button>'
    + '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbd.step=2;_bbdRenderBody()">Geri</button>'
    + '<button class="bbd-btn-danger" onclick="if(_bbd.otp.length===6){_bbdCompleteBranchDeletion()}else if(typeof _admToast===\'function\')_admToast(\'6 haneli kodu tam gir\',\'err\')">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:13px"></iconify-icon>Şubeyi Kapat</button>'
    + '</div></div>';
  return h;
}

/* ═══ P4 — Başarı + Personel Bildirim + Askıya Alma ═══ */
function _bbdCompleteBranchDeletion() {
  var g = _bbdGate(_bbd.branchId);
  var now = new Date();
  var deleteAt = new Date(now.getTime() + 30 * 86400000);

  BIZ_BRANCH_DELETION_STATE = {
    branchId: _bbd.branchId,
    scheduledAt: now.toISOString(),
    deleteAt: deleteAt.toISOString(),
    reasons: Object.keys(_bbd.selectedReasons).filter(function(k){ return _bbd.selectedReasons[k]; }),
    note: _bbd.note || '',
    staffNotified: g.staff || 0
  };

  // Şube statüsünü 'closing' yap (yayından kalksın, canlı gözüksün)
  var br = _bbdBranch(_bbd.branchId);
  if (br) br.status = 'closing';

  _bbd.step = 4;
  _bbdRenderSuccess();
}

function _bbdRenderSuccess() {
  var body = document.getElementById('bbdBody');
  if (!body) return;
  var br = _bbdBranch(_bbd.branchId);
  var s = BIZ_BRANCH_DELETION_STATE;
  var deleteAt = new Date(s.deleteAt);
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var dateStr = deleteAt.getDate() + ' ' + months[deleteAt.getMonth()] + ' ' + deleteAt.getFullYear();

  var h = '<div class="bbd-wrap">';
  h += '<div class="bbd-success">'
    + '<div class="bbd-succ-ico"><iconify-icon icon="solar:shield-check-bold" style="font-size:52px;color:#3B82F6"></iconify-icon></div>'
    + '<div class="bbd-succ-title">Şube askıya alındı</div>'
    + '<div class="bbd-succ-sub"><b>' + _bbdEsc(br ? br.name : 'Şube') + '</b> artık yayında değil. '
    + '<b>' + dateStr + '</b> tarihinde kalıcı olarak silinecek.</div>'
    + '<div class="bbd-succ-box">'
    + '<div class="bbd-sr"><span>Menüler</span><b>Yayından kaldırıldı</b></div>'
    + '<div class="bbd-sr"><span>Çalışma saatleri</span><b>Kapalı</b></div>'
    + '<div class="bbd-sr"><span>Rezervasyon alımı</span><b>Durduruldu</b></div>'
    + '<div class="bbd-sr bbd-sr--hl"><span>Personel bildirimi</span><b>' + s.staffNotified + ' kişiye gönderildi ✓</b></div>'
    + '</div>';

  // Personel bildirim mesajı örneği
  if (s.staffNotified > 0) {
    h += '<div class="bbd-staff-notice">'
      + '<iconify-icon icon="solar:letter-opened-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
      + '<div><div class="bbd-staff-lbl">Personele gönderilen bildirim:</div>'
      + '<div class="bbd-staff-msg">"Çalıştığınız şube kapatılmıştır. Profiliniz <b>genel kullanıcıya</b> dönüştürülmüştür. Yeni bir işletmede çalışmaya devam edebilirsiniz."</div>'
      + '</div></div>';
  }

  h += '<button class="bbd-btn-primary bbd-btn-wide" onclick="_bbdCancelBranchDeletion()">'
    + '<iconify-icon icon="solar:restart-bold" style="font-size:15px"></iconify-icon>İşlemi İptal Et & Geri Al</button>';

  h += '<button class="bbd-btn-ghost bbd-btn-wide" onclick="_bbdClose()">Kapat</button>';
  h += '</div>';
  h += '</div>';
  body.innerHTML = h;
}

function _bbdCancelBranchDeletion() {
  BIZ_BRANCH_DELETION_STATE = null;
  var br = _bbdBranch(_bbd.branchId);
  if (br) br.status = 'open';
  if (typeof _admToast === 'function') _admToast('Şube geri açıldı · Personel bilgilendirildi', 'ok');
  _bbdClose();
}

function _bbdRenderBlocker(br, g) {
  var h = '<div class="bbd-wrap">';

  h += '<div class="bbd-blocker-hero">'
    + '<div class="bbd-blocker-ico"><iconify-icon icon="solar:shield-cross-bold" style="font-size:44px;color:#EF4444"></iconify-icon></div>'
    + '<div class="bbd-blocker-title">Kapatma Engellendi</div>'
    + '<div class="bbd-blocker-sub">Bu şubede devam eden operasyonlar var. Önce bunları tamamla veya iptal et.</div>'
    + '</div>';

  h += '<div class="bbd-gate-list">';
  if (g.activeOrders > 0) {
    h += _bbdGateRow('solar:bag-check-bold', '#F97316', g.activeOrders + ' aktif sipariş', 'Hazırlanıyor veya yola çıktı', 'Siparişlere Git', "if(typeof openBizLiveOrders==='function')openBizLiveOrders()");
  }
  if (g.pendingReservations > 0) {
    h += _bbdGateRow('solar:calendar-mark-bold', '#3B82F6', g.pendingReservations + ' bekleyen rezervasyon', 'Onaylanmamış masa randevusu', 'Rezervasyonlara Git', "if(typeof openBizReservations==='function')openBizReservations()");
  }
  if (g.undelivered > 0) {
    h += _bbdGateRow('solar:delivery-bold', '#8B5CF6', g.undelivered + ' teslim edilmemiş paket', 'Kuryede bekliyor', 'Kuryelere Git', "if(typeof _admToast==='function')_admToast('Kurye yönetimine yönlendiriliyor','ok')");
  }
  h += '</div>';

  // Personel bilgi kartı
  if (g.staff > 0) {
    h += '<div class="bbd-staff-info">'
      + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
      + '<span>Bu şubede <b>' + g.staff + ' personel</b> çalışıyor. Silme işlemi sonrası otomatik bilgilendirme gönderilecektir.</span>'
      + '</div>';
  }

  // Retry + vazgeç
  h += '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbdClose()">Vazgeç</button>'
    + '<button class="bbd-btn-secondary" onclick="_bbdRender()">'
    + '<iconify-icon icon="solar:refresh-linear" style="font-size:13px"></iconify-icon>Tekrar Dene</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _bbdGateRow(icon, color, title, sub, btnLbl, btnAction) {
  return '<div class="bbd-gate-row">'
    + '<div class="bbd-gate-ico" style="background:' + color + '15;color:' + color + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="bbd-gate-title">' + _bbdEsc(title) + '</div>'
    + '<div class="bbd-gate-sub">' + _bbdEsc(sub) + '</div>'
    + '</div>'
    + '<button class="bbd-gate-btn" style="color:' + color + '" onclick="_bbdClose();' + btnAction + '">'
    + _bbdEsc(btnLbl) + ' <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>';
}

/* ═══ Styles ═══ */
function _bbdInjectStyles() {
  if (document.getElementById('bbdStyles')) return;
  var s = document.createElement('style');
  s.id = 'bbdStyles';
  s.textContent = [
    '.bbd-overlay{color:var(--text-primary);background:linear-gradient(180deg,#FEF2F2,#F8FAFC 40%,var(--bg-phone))}',
    '.bbd-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);border-bottom:1px solid rgba(239,68,68,.12);z-index:5}',
    '.bbd-back{width:34px;height:34px;border-radius:10px;background:rgba(239,68,68,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary)}',
    '.bbd-back:active{transform:scale(.94)}',
    '.bbd-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.bbd-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.bbd-wrap{padding:14px;display:flex;flex-direction:column;gap:12px;padding-bottom:28px}',
    '/* Blocker */',
    '.bbd-blocker-hero{text-align:center;padding:16px 14px;background:linear-gradient(180deg,#FEF2F2,#fff);border:1px solid #FECACA;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:6px}',
    '.bbd-blocker-ico{animation:bbdPulse 2s ease-in-out infinite}',
    '@keyframes bbdPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}',
    '.bbd-blocker-title{font-size:17px;font-weight:800;color:#B91C1C}',
    '.bbd-blocker-sub{font-size:12px;color:#991B1B;line-height:1.5;max-width:320px}',
    '.bbd-gate-list{display:flex;flex-direction:column;gap:7px}',
    '.bbd-gate-row{display:flex;align-items:center;gap:11px;padding:11px 13px;background:#fff;border:1px solid var(--border-soft);border-radius:12px}',
    '.bbd-gate-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.bbd-gate-title{font-size:12.5px;font-weight:700;color:var(--text-primary)}',
    '.bbd-gate-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.bbd-gate-btn{padding:6px 10px;border:1px solid var(--border-soft);background:#fff;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.bbd-gate-btn:active{transform:scale(.96)}',
    '.bbd-staff-info{display:flex;align-items:center;gap:7px;padding:10px 12px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.18);border-radius:10px;font-size:11.5px;color:var(--text-primary);line-height:1.45}',
    '.bbd-staff-info b{font-weight:700;color:#7C3AED}',
    '.bbd-footer{display:flex;gap:8px;margin-top:6px}',
    '.bbd-footer > button{flex:1}',
    '/* Branch summary */',
    '.bbd-br-summary{display:flex;align-items:center;gap:10px;padding:11px 13px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.22);border-radius:12px}',
    '.bbd-br-name{font-size:13px;font-weight:700;color:var(--text-primary)}',
    '.bbd-br-addr{font-size:10.5px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '/* Step dots */',
    '.bbd-steps{display:flex;gap:6px;padding:4px 0}',
    '.bbd-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:.5}',
    '.bbd-step.done,.bbd-step.active{opacity:1}',
    '.bbd-step-num{width:26px;height:26px;border-radius:50%;background:var(--bg-phone-secondary);color:var(--text-muted);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:1.5px solid var(--border-soft)}',
    '.bbd-step.active .bbd-step-num{background:#EF4444;color:#fff;border-color:#EF4444}',
    '.bbd-step.done .bbd-step-num{background:#10B981;color:#fff;border-color:#10B981}',
    '.bbd-step-lbl{font-size:9.5px;color:var(--text-muted);font-weight:600;text-align:center;line-height:1.2}',
    '.bbd-step.active .bbd-step-lbl,.bbd-step.done .bbd-step-lbl{color:var(--text-primary)}',
    '.bbd-step-body{display:flex;flex-direction:column;gap:10px}',
    '.bbd-step-body--center{align-items:center;text-align:center}',
    '.bbd-step-intro{font-size:12.5px;color:var(--text-primary);line-height:1.5;padding:0 2px}',
    '.bbd-step-intro b{font-weight:700;color:#DC2626}',
    '/* Reason chips */',
    '.bbd-reason-grid{display:flex;flex-direction:column;gap:5px}',
    '.bbd-chip{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#fff;border:1.5px solid var(--border-soft);border-radius:10px;font-size:12px;font-weight:600;color:var(--text-primary);cursor:pointer;transition:all .15s}',
    '.bbd-chip:active{transform:scale(.98)}',
    '.bbd-chip.selected{border-color:#EF4444;background:rgba(239,68,68,.04)}',
    '.bbd-chip span{flex:1}',
    '.bbd-note{width:100%;min-height:60px;padding:10px 12px;border:1.5px solid var(--border-soft);background:#fff;border-radius:10px;color:var(--text-primary);font-size:12px;outline:none;font-family:inherit;resize:vertical}',
    '.bbd-note:focus{border-color:#EF4444}',
    '.bbd-info-box{display:flex;align-items:flex-start;gap:7px;padding:10px 12px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.18);border-radius:10px;font-size:11.5px;color:var(--text-primary);line-height:1.5}',
    '.bbd-info-box b{font-weight:700}',
    '/* Verify steps */',
    '.bbd-verify-ico{width:72px;height:72px;border-radius:50%;background:rgba(139,92,246,.08);display:flex;align-items:center;justify-content:center;margin:8px auto 2px}',
    '.bbd-verify-title{font-size:16px;font-weight:800;color:var(--text-primary)}',
    '.bbd-verify-sub{font-size:12px;color:var(--text-muted);line-height:1.5;max-width:320px}',
    '.bbd-input{width:100%;max-width:280px;padding:12px 14px;border:1.5px solid var(--border-soft);background:#fff;color:var(--text-primary);border-radius:10px;font-size:14px;outline:none;text-align:center}',
    '.bbd-input:focus{border-color:#8B5CF6}',
    '.bbd-otp-input{font-size:22px;font-weight:800;letter-spacing:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '.bbd-btn-link{padding:6px 10px;border:none;background:transparent;color:#8B5CF6;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '/* Buttons */',
    '.bbd-btn-ghost{padding:12px;border:1px solid var(--border-soft);background:#fff;color:var(--text-muted);border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer}',
    '.bbd-btn-ghost:active{transform:scale(.97)}',
    '.bbd-btn-danger{padding:12px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(239,68,68,.25)}',
    '.bbd-btn-danger:active{transform:scale(.98)}',
    '.bbd-btn-danger.disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}',
    '.bbd-btn-secondary{padding:12px;border:1px solid #3B82F6;background:rgba(59,130,246,.06);color:#3B82F6;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px}',
    '.bbd-btn-primary{padding:12px;border:none;background:linear-gradient(135deg,#3B82F6,#2563EB);color:#fff;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(59,130,246,.25)}',
    '.bbd-btn-wide{width:100%}',
    '/* Success */',
    '.bbd-success{padding:24px 16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;background:linear-gradient(180deg,rgba(59,130,246,.06),#fff);border:1px solid rgba(59,130,246,.18);border-radius:18px}',
    '.bbd-succ-ico{animation:bbdPop .5s ease}',
    '@keyframes bbdPop{0%{transform:scale(0)}70%{transform:scale(1.18)}100%{transform:scale(1)}}',
    '.bbd-succ-title{font-size:18px;font-weight:800;color:#1E40AF}',
    '.bbd-succ-sub{font-size:12.5px;color:var(--text-primary);line-height:1.5;max-width:340px}',
    '.bbd-succ-box{width:100%;background:#fff;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:5px;text-align:left;border:1px solid var(--border-soft)}',
    '.bbd-sr{display:flex;justify-content:space-between;font-size:11.5px}',
    '.bbd-sr span{color:var(--text-muted);font-weight:600}',
    '.bbd-sr b{color:var(--text-primary);font-weight:700}',
    '.bbd-sr--hl{padding-top:6px;border-top:1px dashed var(--border-soft);margin-top:3px}',
    '.bbd-sr--hl b{color:#8B5CF6}',
    '.bbd-staff-notice{display:flex;align-items:flex-start;gap:8px;padding:11px 12px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:12px;width:100%;text-align:left}',
    '.bbd-staff-lbl{font-size:10px;font-weight:700;color:#7C3AED;letter-spacing:.4px;text-transform:uppercase;margin-bottom:4px}',
    '.bbd-staff-msg{font-size:11.5px;color:var(--text-primary);line-height:1.5;font-style:italic}',
    '.bbd-staff-msg b{font-weight:700;color:#7C3AED}',
    '.bbd-empty{text-align:center;padding:40px 16px;color:var(--text-muted)}'
  ].join('\n');
  document.head.appendChild(s);
}
