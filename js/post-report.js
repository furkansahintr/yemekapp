/* ═══════════════════════════════════════════════════════
   POST MENU + REPORT FLOW (UI-only)
   Gönderi kebap menüsü → Takip Et/Bırak + Şikayet Et
   Şikayet akışı: hedef → sebep → açıklama → bilgilendirme → aksiyon
   ═══════════════════════════════════════════════════════ */

/* ── State (in-memory only) ───────────────────────────── */
var _commFollowedHandles = [];                 // takip edilenler
var _commBlockedHandles  = [];                 // Senaryo A: tamamen gizlenen kullanıcılar
var _commBlurredPosts    = [];                 // Senaryo B: blurlanan post id'leri
var _postReport = {                            // aktif şikayet oturumu
  postId: null,
  handle: null,
  userName: null,
  target: null,       // 'user' | 'content'
  reason: null,       // key from _REPORT_REASONS
  note: ''
};

var _REPORT_REASONS = [
  { id: 'rules',       label: 'Süperresto topluluk kurallarına aykırı davranma', icon: 'solar:shield-cross-bold',       color: '#F59E0B' },
  { id: 'sexual',      label: 'Cinsel içerikli paylaşım yapma',                   icon: 'solar:eye-closed-bold',         color: '#DB2777' },
  { id: 'hate',        label: 'Halkı kin ve nefrete sürükleme',                   icon: 'solar:fire-bold',                color: '#DC2626' },
  { id: 'racism',      label: 'Irkçılık veya ayrımcılık yapmak',                  icon: 'solar:users-group-rounded-bold', color: '#7C3AED' },
  { id: 'harassment',  label: 'Sözlü veya fiziksel taciz',                        icon: 'solar:danger-triangle-bold',     color: '#E11D48' }
];

/* ── helpers ──────────────────────────────────────────── */
function _postReportFindPost(postId) {
  if (typeof COMMUNITY_FEED === 'undefined') return null;
  return COMMUNITY_FEED.find(function(p) { return p.id === postId; });
}

function _postReportToast(msg, icon) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.95);color:#fff;padding:10px 18px;border-radius:999px;font:500 13px/1.2 var(--font);z-index:9999;display:flex;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(0,0,0,.3);animation:toastIn .2s ease-out';
  t.innerHTML = '<iconify-icon icon="' + (icon || 'solar:info-circle-bold') + '" style="font-size:16px"></iconify-icon>' + msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2000);
  setTimeout(function() { t.remove(); }, 2400);
}

/* ══════════════════════════════════════════════════════
   1. POST KEBAP MENÜSÜ (popover)
   ══════════════════════════════════════════════════════ */
function openPostMenu(ev, postId) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  closePostMenu();

  var post = _postReportFindPost(postId);
  if (!post) return;

  var handle = post.user.handle;
  var isFollowing = _commFollowedHandles.indexOf(handle) !== -1;

  /* backdrop — tıklanınca kapatır */
  var bd = document.createElement('div');
  bd.id = 'postMenuBackdrop';
  bd.style.cssText = 'position:fixed;inset:0;z-index:80;background:transparent';
  bd.onclick = closePostMenu;
  document.body.appendChild(bd);

  /* popover konumlandırma */
  var anchor = ev && ev.currentTarget ? ev.currentTarget : null;
  var rect = anchor ? anchor.getBoundingClientRect() : { right: window.innerWidth - 20, bottom: 80 };

  var pop = document.createElement('div');
  pop.id = 'postMenuPopover';
  var top = rect.bottom + 6;
  var right = Math.max(12, window.innerWidth - rect.right);
  pop.style.cssText = 'position:fixed;top:' + top + 'px;right:' + right + 'px;z-index:81;' +
    'background:var(--bg-elevated,#fff);border:1px solid var(--border-subtle);border-radius:14px;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.18);min-width:220px;overflow:hidden;' +
    'animation:postMenuIn .15s ease-out;transform-origin:top right';

  var followIcon = isFollowing ? 'solar:user-minus-bold' : 'solar:user-plus-bold';
  var followLabel = isFollowing ? 'Takibi Bırak' : 'Takip Et';
  var followColor = isFollowing ? 'var(--text-primary)' : 'var(--primary)';

  /* kullanıcı başlığı */
  var h = '<div style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle)">' +
    '<img src="' + post.user.avatar + '" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover">' +
    '<div style="flex:1;min-width:0">' +
      '<div style="font:600 13px/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + post.user.name + '</div>' +
      '<div style="font:400 11px/1 var(--font);color:var(--text-muted);margin-top:2px">' + handle + '</div>' +
    '</div></div>';

  /* Takip Et / Bırak */
  h += '<div onclick="togglePostFollow(\'' + handle + '\')" class="pm-item" ' +
    'style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;color:' + followColor + '">' +
    '<iconify-icon icon="' + followIcon + '" style="font-size:18px"></iconify-icon>' +
    '<span style="font:500 13px/1 var(--font)">' + followLabel + '</span>' +
    '</div>';

  /* Yorum kapatma vs — sadece ikon UI */
  h += '<div class="pm-item" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;color:var(--text-primary);border-top:1px solid var(--border-subtle)" onclick="_postReportToast(\'Bağlantı kopyalandı\',\'solar:link-bold\');closePostMenu()">' +
    '<iconify-icon icon="solar:link-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon>' +
    '<span style="font:500 13px/1 var(--font)">Bağlantıyı Kopyala</span>' +
    '</div>';

  /* Şikayet Et */
  h += '<div onclick="openReportFlow(' + postId + ')" class="pm-item" ' +
    'style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;color:#DC2626;border-top:1px solid var(--border-subtle)">' +
    '<iconify-icon icon="solar:flag-bold" style="font-size:18px"></iconify-icon>' +
    '<span style="font:600 13px/1 var(--font)">Şikayet Et</span>' +
    '</div>';

  pop.innerHTML = h;
  document.body.appendChild(pop);
}

function closePostMenu() {
  var bd = document.getElementById('postMenuBackdrop');
  var pop = document.getElementById('postMenuPopover');
  if (bd) bd.remove();
  if (pop) pop.remove();
}

function togglePostFollow(handle) {
  var idx = _commFollowedHandles.indexOf(handle);
  if (idx === -1) {
    _commFollowedHandles.push(handle);
    _postReportToast(handle + ' takip ediliyor', 'solar:user-plus-bold');
  } else {
    _commFollowedHandles.splice(idx, 1);
    _postReportToast(handle + ' takipten çıkarıldı', 'solar:user-minus-bold');
  }
  closePostMenu();
}

/* ══════════════════════════════════════════════════════
   2. ŞİKAYET — ADIM 1: HEDEF SEÇİMİ
   ══════════════════════════════════════════════════════ */
function openReportFlow(postId) {
  closePostMenu();
  var post = _postReportFindPost(postId);
  if (!post) return;

  _postReport = {
    postId: postId,
    handle: post.user.handle,
    userName: post.user.name,
    target: null,
    reason: null,
    note: ''
  };

  _renderReportOverlay(_reportStepTarget);
}

function _renderReportOverlay(stepRenderer) {
  var existing = document.getElementById('reportOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'reportOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';
  overlay.innerHTML = '<div class="prof-container" id="reportContainer" style="background:var(--bg-phone,#fff)"></div>';

  var host = document.getElementById('phone') || document.body;
  host.appendChild(overlay);
  stepRenderer();
}

function closeReportFlow() {
  var el = document.getElementById('reportOverlay');
  if (el) el.remove();
}

function _reportTopbar(title, onBack) {
  return '<div class="prof-topbar" style="position:sticky;top:0;z-index:2;background:var(--bg-phone,#fff)">' +
    '<div class="btn-icon" onclick="' + onBack + '"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>' +
    '<span class="prof-topbar-name">' + title + '</span>' +
    '<div style="width:32px"></div>' +
    '</div>';
}

function _reportStepTarget() {
  var c = document.getElementById('reportContainer');
  if (!c) return;

  var h = _reportTopbar('Şikayet Et', 'closeReportFlow()');

  h += '<div style="padding:24px 20px 16px">' +
    '<div style="width:56px;height:56px;border-radius:16px;background:rgba(220,38,38,.12);display:flex;align-items:center;justify-content:center;margin-bottom:14px">' +
      '<iconify-icon icon="solar:flag-bold" style="font-size:28px;color:#DC2626"></iconify-icon>' +
    '</div>' +
    '<div style="font:700 20px/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">Neyi şikayet etmek istiyorsun?</div>' +
    '<div style="font:400 13px/1.45 var(--font);color:var(--text-secondary)">Hangi seçeneğin daha uygun olduğunu belirle. Şikayetini inceleyip gerekli aksiyonları alacağız.</div>' +
    '</div>';

  /* Target cards */
  h += '<div style="padding:8px 16px;display:flex;flex-direction:column;gap:10px">';

  h += '<div onclick="_reportPickTarget(\'user\')" class="rt-card" style="border:1.5px solid var(--border-subtle);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;background:var(--glass-card);transition:all .15s">' +
    '<div style="width:44px;height:44px;border-radius:12px;background:rgba(220,38,38,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
      '<iconify-icon icon="solar:user-cross-rounded-bold" style="font-size:24px;color:#DC2626"></iconify-icon>' +
    '</div>' +
    '<div style="flex:1;min-width:0">' +
      '<div style="font:600 15px/1.2 var(--font);color:var(--text-primary)">Kullanıcıyı Şikayet Et</div>' +
      '<div style="font:400 12px/1.35 var(--font);color:var(--text-muted);margin-top:3px">' + _postReport.userName + ' hakkında şikayette bulun</div>' +
    '</div>' +
    '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>' +
    '</div>';

  h += '<div onclick="_reportPickTarget(\'content\')" class="rt-card" style="border:1.5px solid var(--border-subtle);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;background:var(--glass-card);transition:all .15s">' +
    '<div style="width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
      '<iconify-icon icon="solar:document-text-bold" style="font-size:24px;color:#F59E0B"></iconify-icon>' +
    '</div>' +
    '<div style="flex:1;min-width:0">' +
      '<div style="font:600 15px/1.2 var(--font);color:var(--text-primary)">İçeriği Şikayet Et</div>' +
      '<div style="font:400 12px/1.35 var(--font);color:var(--text-muted);margin-top:3px">Sadece bu gönderi hakkında şikayet oluştur</div>' +
    '</div>' +
    '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>' +
    '</div>';

  h += '</div>';

  /* info note */
  h += '<div style="margin:20px 16px 24px;padding:12px 14px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);border-radius:12px;display:flex;gap:10px;align-items:flex-start">' +
    '<iconify-icon icon="solar:shield-check-bold" style="font-size:18px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>' +
    '<div style="font:400 11px/1.45 var(--font);color:var(--text-secondary)">Şikayetin gizli tutulur. Süperresto ekibi durumu inceleyip gerekli aksiyonu alır.</div>' +
    '</div>';

  c.innerHTML = h;
}

function _reportPickTarget(target) {
  _postReport.target = target;
  _postReport.reason = null;
  _postReport.note = '';
  _renderReportOverlay(_reportStepReason);
}

/* ══════════════════════════════════════════════════════
   3. ŞİKAYET — ADIM 2: SEBEP SEÇİMİ
   ══════════════════════════════════════════════════════ */
function _reportStepReason() {
  var c = document.getElementById('reportContainer');
  if (!c) return;

  var title = _postReport.target === 'user' ? 'Kullanıcı Şikayeti' : 'İçerik Şikayeti';
  var subtitle = _postReport.target === 'user'
    ? _postReport.userName + ' adlı kullanıcıyı hangi sebeple şikayet ediyorsun?'
    : 'Bu gönderiyi hangi sebeple şikayet ediyorsun?';

  var h = _reportTopbar(title, '_renderReportOverlay(_reportStepTarget)');

  h += '<div style="padding:20px 20px 14px">' +
    '<div style="font:700 18px/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">Şikayet Sebebi</div>' +
    '<div style="font:400 13px/1.45 var(--font);color:var(--text-secondary)">' + subtitle + '</div>' +
    '</div>';

  h += '<div style="padding:0 16px 80px">';
  _REPORT_REASONS.forEach(function(r) {
    var selected = _postReport.reason === r.id;
    h += '<div onclick="_reportPickReason(\'' + r.id + '\')" style="display:flex;align-items:center;gap:12px;padding:14px 14px;border:1.5px solid ' + (selected ? r.color : 'var(--border-subtle)') + ';border-radius:12px;background:' + (selected ? r.color + '14' : 'var(--glass-card)') + ';margin-bottom:8px;cursor:pointer;transition:all .15s">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:' + r.color + '1a;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
        '<iconify-icon icon="' + r.icon + '" style="font-size:20px;color:' + r.color + '"></iconify-icon>' +
      '</div>' +
      '<div style="flex:1;font:500 13px/1.35 var(--font);color:var(--text-primary)">' + r.label + '</div>' +
      '<div style="width:20px;height:20px;border-radius:50%;border:2px solid ' + (selected ? r.color : 'var(--border-subtle)') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + (selected ? r.color : 'transparent') + '">' +
        (selected ? '<iconify-icon icon="solar:check-read-linear" style="font-size:12px;color:#fff"></iconify-icon>' : '') +
      '</div>' +
      '</div>';
  });
  h += '</div>';

  c.innerHTML = h;
}

function _reportPickReason(id) {
  _postReport.reason = id;
  _renderReportOverlay(_reportStepNote);
}

/* ══════════════════════════════════════════════════════
   4. ŞİKAYET — ADIM 3: AÇIKLAMA (min. 20 karakter)
   ══════════════════════════════════════════════════════ */
function _reportStepNote() {
  var c = document.getElementById('reportContainer');
  if (!c) return;

  var reason = _REPORT_REASONS.find(function(r) { return r.id === _postReport.reason; });

  var h = _reportTopbar('Detay Ekle', '_renderReportOverlay(_reportStepReason)');

  h += '<div style="padding:20px 20px 14px">' +
    '<div style="font:700 18px/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">Açıklama Ekle</div>' +
    '<div style="font:400 13px/1.45 var(--font);color:var(--text-secondary)">Şikayetini daha iyi değerlendirebilmemiz için biraz detay ver. En az 20 karakter yazman gerekiyor.</div>' +
    '</div>';

  /* seçilen sebep kartı */
  if (reason) {
    h += '<div style="margin:0 16px 14px;padding:10px 12px;background:' + reason.color + '12;border:1px solid ' + reason.color + '33;border-radius:10px;display:flex;align-items:center;gap:10px">' +
      '<iconify-icon icon="' + reason.icon + '" style="font-size:18px;color:' + reason.color + '"></iconify-icon>' +
      '<div style="font:500 12px/1.3 var(--font);color:var(--text-primary);flex:1">' + reason.label + '</div>' +
      '<div onclick="_renderReportOverlay(_reportStepReason)" style="font:500 11px/1 var(--font);color:' + reason.color + ';cursor:pointer">Değiştir</div>' +
      '</div>';
  }

  /* textarea */
  h += '<div style="padding:0 16px">' +
    '<textarea id="reportNoteInput" oninput="_reportUpdateNote(this.value)" placeholder="Yaşadığın durumu kısaca anlat..." ' +
    'style="width:100%;min-height:140px;padding:14px;border:1.5px solid var(--border-subtle);border-radius:12px;font:400 13px/1.5 var(--font);color:var(--text-primary);background:var(--glass-card);resize:none;outline:none;box-sizing:border-box"></textarea>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">' +
      '<div id="reportNoteHint" style="font:400 11px/1.3 var(--font);color:var(--text-muted);display:flex;align-items:center;gap:4px">' +
        '<iconify-icon icon="solar:info-circle-linear" style="font-size:13px"></iconify-icon>' +
        '<span>En az 20 karakter gerekli</span>' +
      '</div>' +
      '<div id="reportNoteCount" style="font:500 11px/1 var(--font);color:var(--text-muted)">0 / 20</div>' +
    '</div>' +
    '</div>';

  /* submit */
  h += '<div style="padding:20px 16px">' +
    '<div id="reportSubmitBtn" onclick="_reportSubmit()" style="width:100%;padding:14px;border-radius:var(--r-full);background:var(--border-subtle);color:var(--text-muted);font:600 14px/1 var(--font);text-align:center;cursor:not-allowed;transition:all .2s;pointer-events:none;display:flex;align-items:center;justify-content:center;gap:6px">' +
      '<iconify-icon icon="solar:flag-bold" style="font-size:16px"></iconify-icon>' +
      '<span>Şikayet Et</span>' +
    '</div>' +
    '</div>';

  c.innerHTML = h;

  /* restore previous text */
  var ta = document.getElementById('reportNoteInput');
  if (ta && _postReport.note) { ta.value = _postReport.note; _reportUpdateNote(_postReport.note); }
  if (ta) setTimeout(function() { ta.focus(); }, 200);
}

function _reportUpdateNote(val) {
  _postReport.note = val || '';
  var len = _postReport.note.length;
  var count = document.getElementById('reportNoteCount');
  var btn = document.getElementById('reportSubmitBtn');
  var hint = document.getElementById('reportNoteHint');
  var valid = len >= 20;

  if (count) {
    count.textContent = Math.min(len, 999) + ' / 20';
    count.style.color = valid ? '#16A34A' : 'var(--text-muted)';
  }
  if (hint) {
    hint.innerHTML = valid
      ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:13px;color:#16A34A"></iconify-icon><span style="color:#16A34A">Gönderilmeye hazır</span>'
      : '<iconify-icon icon="solar:info-circle-linear" style="font-size:13px"></iconify-icon><span>En az 20 karakter gerekli (' + (20 - len) + ' daha)</span>';
  }
  if (btn) {
    if (valid) {
      btn.style.background = '#DC2626';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.style.background = 'var(--border-subtle)';
      btn.style.color = 'var(--text-muted)';
      btn.style.cursor = 'not-allowed';
      btn.style.pointerEvents = 'none';
    }
  }
}

function _reportSubmit() {
  if ((_postReport.note || '').length < 20) return;
  _renderReportOverlay(_reportStepConfirmation);
}

/* ══════════════════════════════════════════════════════
   5. ŞİKAYET — ADIM 4: BİLGİLENDİRME SAYFASI
   ══════════════════════════════════════════════════════ */
function _reportStepConfirmation() {
  var c = document.getElementById('reportContainer');
  if (!c) return;

  var h = '<div class="prof-topbar" style="position:sticky;top:0;z-index:2;background:var(--bg-phone,#fff)">' +
    '<div style="width:32px"></div>' +
    '<span class="prof-topbar-name">Şikayet Alındı</span>' +
    '<div class="btn-icon" onclick="_reportFinalize()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>' +
    '</div>';

  /* success hero */
  h += '<div style="padding:32px 24px 18px;text-align:center">' +
    '<div style="width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#16A34A 0%,#059669 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(22,163,74,.25)">' +
      '<iconify-icon icon="solar:check-read-bold" style="font-size:42px;color:#fff"></iconify-icon>' +
    '</div>' +
    '<div style="font:700 20px/1.3 var(--font);color:var(--text-primary);margin-bottom:8px">Teşekkürler, şikayetin bize ulaştı</div>' +
    '<div style="font:400 13px/1.5 var(--font);color:var(--text-secondary)">Topluluğumuzu güvenli tutmamıza yardımcı olduğun için teşekkür ederiz. Şikayetini 24 saat içinde inceleyip gerekli aksiyonu alacağız.</div>' +
    '</div>';

  /* info card — destek mesajı */
  h += '<div style="margin:16px 16px 12px;padding:16px;background:linear-gradient(135deg,rgba(59,130,246,.08) 0%,rgba(99,102,241,.05) 100%);border:1px solid rgba(59,130,246,.2);border-radius:14px">' +
    '<div style="display:flex;gap:12px;align-items:flex-start">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:#3B82F6;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
        '<iconify-icon icon="solar:heart-bold" style="font-size:18px;color:#fff"></iconify-icon>' +
      '</div>' +
      '<div style="flex:1">' +
        '<div style="font:600 14px/1.3 var(--font);color:var(--text-primary);margin-bottom:4px">İyi hissetmediğine üzgünüz</div>' +
        '<div style="font:400 12px/1.5 var(--font);color:var(--text-secondary)">Bu deneyim seni rahatsız ettiyse yalnız değilsin. Topluluğumuzda herkesin kendini güvende hissetmesini istiyoruz. İhtiyacın olursa destek almakta tereddüt etme.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* Daha fazla destek al */
  h += '<div style="padding:0 16px">' +
    '<div onclick="_postReportToast(\'Destek ekibine yönlendiriliyorsun...\',\'solar:headphones-round-sound-bold\')" style="width:100%;padding:14px;border:1.5px solid #3B82F6;border-radius:var(--r-full);color:#3B82F6;font:600 14px/1 var(--font);text-align:center;cursor:pointer;background:transparent;display:flex;align-items:center;justify-content:center;gap:8px">' +
      '<iconify-icon icon="solar:headphones-round-sound-bold" style="font-size:18px"></iconify-icon>' +
      '<span>Daha Fazla Destek Al</span>' +
    '</div>' +
    '</div>';

  /* Devam Et — asıl aksiyonu tetikler */
  h += '<div style="padding:10px 16px 24px">' +
    '<div onclick="_reportFinalize()" style="width:100%;padding:14px;background:var(--primary);color:#fff;border-radius:var(--r-full);font:600 14px/1 var(--font);text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
      '<span>Devam Et</span>' +
      '<iconify-icon icon="solar:arrow-right-bold" style="font-size:16px"></iconify-icon>' +
    '</div>' +
    '</div>';

  /* özet */
  h += '<div style="margin:0 16px 20px;padding:12px 14px;background:var(--glass-card);border:1px dashed var(--border-subtle);border-radius:10px">' +
    '<div style="font:600 11px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Şikayet Özeti</div>' +
    '<div style="font:400 12px/1.5 var(--font);color:var(--text-secondary)">' +
      '<b>Hedef:</b> ' + (_postReport.target === 'user' ? 'Kullanıcı (' + _postReport.userName + ')' : 'İçerik') + '<br>' +
      '<b>Sebep:</b> ' + ((_REPORT_REASONS.find(function(r){return r.id===_postReport.reason;}) || {}).label || '-') +
    '</div>' +
    '</div>';

  c.innerHTML = h;
}

/* ══════════════════════════════════════════════════════
   6. ŞİKAYET — AKSİYON UYGULAMA
   Senaryo A: kullanıcı ve tüm postları gizlenir
   Senaryo B: sadece şikayet edilen post blurlanır
   ══════════════════════════════════════════════════════ */
function _reportFinalize() {
  var target = _postReport.target;
  var handle = _postReport.handle;
  var userName = _postReport.userName;
  var postId = _postReport.postId;

  if (target === 'user') {
    /* Senaryo A — kalıcı engelleme mantığı */
    if (handle && _commBlockedHandles.indexOf(handle) === -1) {
      _commBlockedHandles.push(handle);
    }
    closeReportFlow();
    if (typeof renderCommFeed === 'function') renderCommFeed();
    _postReportToast(userName + ' ve içerikleri gizlendi', 'solar:user-block-bold');
  } else {
    /* Senaryo B — post blurlanır */
    if (postId != null && _commBlurredPosts.indexOf(postId) === -1) {
      _commBlurredPosts.push(postId);
    }
    closeReportFlow();
    if (typeof renderCommFeed === 'function') renderCommFeed();
    _postReportToast('Gönderi gizlendi. İstersen görüntüleyebilirsin.', 'solar:eye-closed-bold');
  }

  /* reset session */
  _postReport = { postId: null, handle: null, userName: null, target: null, reason: null, note: '' };
}

/* "Görüntüle" butonu — blur'u kaldırır ama post blurred listede kalır (sadece DOM overlay gizlenir) */
function _commUnblurPost(postId) {
  var overlay = document.querySelector('.post-blur-overlay[data-post-id="' + postId + '"]');
  if (overlay) {
    overlay.style.transition = 'opacity .25s';
    overlay.style.opacity = '0';
    setTimeout(function() { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 260);
  }
}

/* ══════════════════════════════════════════════════════
   CSS animasyonları (dinamik enjeksiyon, tek sefer)
   ══════════════════════════════════════════════════════ */
(function _injectPostReportStyles() {
  if (document.getElementById('postReportStyles')) return;
  var s = document.createElement('style');
  s.id = 'postReportStyles';
  s.textContent =
    '@keyframes postMenuIn{from{opacity:0;transform:scale(.9) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
    '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
    '.pm-item:active{background:var(--glass-card)}' +
    '.rt-card:active{transform:scale(.99);border-color:var(--primary)!important}';
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════════════
   Global export
   ══════════════════════════════════════════════════════ */
window.openPostMenu       = openPostMenu;
window.closePostMenu      = closePostMenu;
window.togglePostFollow   = togglePostFollow;
window.openReportFlow     = openReportFlow;
window.closeReportFlow    = closeReportFlow;
window._renderReportOverlay = _renderReportOverlay;
window._reportStepTarget   = _reportStepTarget;
window._reportStepReason   = _reportStepReason;
window._reportStepNote     = _reportStepNote;
window._reportStepConfirmation = _reportStepConfirmation;
window._reportPickTarget   = _reportPickTarget;
window._reportPickReason   = _reportPickReason;
window._reportUpdateNote   = _reportUpdateNote;
window._reportSubmit       = _reportSubmit;
window._reportFinalize     = _reportFinalize;
window._commUnblurPost     = _commUnblurPost;
window._postReportToast    = _postReportToast;
