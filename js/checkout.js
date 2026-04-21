/* ═══════════════════════════════════════════════════════════
   CHECKOUT — Sepete Ekle Toast + Ödeme Popup (Hibrit)
   ═══════════════════════════════════════════════════════════ */

/* ═══ P1 — Toast + Badge Bump ═══ */

/* Global showToast (yoksa tanımla) — başka modüller de kullanıyor */
if (typeof window.showToast !== 'function') {
  window.showToast = function(message, opts) {
    _chkInjectStyles();
    var existing = document.getElementById('chkToast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'chkToast';
    t.className = 'chk-toast';
    var icon = (opts && opts.icon) || 'solar:check-circle-bold';
    var color = (opts && opts.color) || '#10B981';
    t.innerHTML = '<iconify-icon icon="' + icon + '" style="font-size:18px;color:' + color + '"></iconify-icon>'
      + '<span>' + String(message).replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ if (t.parentNode) t.remove(); }, 280);
    }, 2400);
  };
}

/* Sepet badge bump — addToCart sonrası ikon hafif zıplasın */
function bumpCartBadge() {
  ['headerCartBadge', 'stickyCartBadge'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('chk-badge-bump');
    // reflow
    void el.offsetWidth;
    el.classList.add('chk-badge-bump');
  });
  // Sepet ikonu wrapper'a da pulse
  var btn = document.getElementById('headerCartBtn');
  if (btn) {
    btn.classList.remove('chk-icon-pulse');
    void btn.offsetWidth;
    btn.classList.add('chk-icon-pulse');
  }
}

/* ═══ Styles ═══ */
function _chkInjectStyles() {
  if (document.getElementById('chkStyles')) return;
  var s = document.createElement('style');
  s.id = 'chkStyles';
  s.textContent = [
    /* Toast */
    '.chk-toast{position:fixed;left:50%;transform:translateX(-50%) translateY(-20px);bottom:calc(env(safe-area-inset-bottom,0) + 96px);z-index:999;display:inline-flex;align-items:center;gap:8px;padding:11px 16px;background:var(--bg-phone);color:var(--text-primary);border:1px solid var(--border-subtle);border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.18);font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);opacity:0;pointer-events:none;transition:opacity .24s ease, transform .28s cubic-bezier(.2,.9,.25,1);max-width:90%}',
    '.chk-toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}',
    /* Badge bump */
    '@keyframes chkBadgeBump{0%{transform:scale(1)}30%{transform:scale(1.35)}60%{transform:scale(.92)}100%{transform:scale(1)}}',
    '.chk-badge-bump{animation:chkBadgeBump .45s cubic-bezier(.2,.9,.25,1)}',
    /* Icon pulse */
    '@keyframes chkIconPulse{0%{box-shadow:0 0 0 0 rgba(246,80,19,.45)}100%{box-shadow:0 0 0 14px rgba(246,80,19,0)}}',
    '.chk-icon-pulse{animation:chkIconPulse .55s ease-out;border-radius:50%}'
  ].join('\n');
  document.head.appendChild(s);
}

/* Script yüklenince stil hemen hazırlansın */
_chkInjectStyles();
