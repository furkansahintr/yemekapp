/* ═══════════════════════════════════════════════════════════
   ACHIEVEMENTS — Başarılar Koleksiyonu
   (14 rozet • haftalık reset • kilitli/kazanılmış görünüm)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _ach = {
  tab: 'weekly',                // 'weekly' | 'monthly' | 'permanent' | 'collection'
  detailId: null
};

function openAchievementsPage() {
  _achInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.ach-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open ach-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'achOverlay';
  phone.appendChild(overlay);

  _ach.tab = 'weekly';
  _achRender();
}

function _achCloseOverlay() {
  var o = document.getElementById('achOverlay');
  if (o) o.remove();
  _achCloseDetail();
}

function _achRender() {
  var o = document.getElementById('achOverlay');
  if (!o) return;

  var h = '<div class="ach-header">'
    + '<div class="ach-back" onclick="_achCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="ach-title"><iconify-icon icon="solar:cup-star-bold" style="font-size:17px;color:#F59E0B"></iconify-icon>Başarılar Koleksiyonu</div>'
    + '<div class="ach-sub">Rozetler, ödüller ve prestij</div>'
    + '</div>'
    + '</div>'
    + '<div id="achBody" style="flex:1"></div>';

  o.innerHTML = h;
  _achRenderBody();
}

function _achRenderBody() {
  var body = document.getElementById('achBody');
  if (!body) return;
  body.innerHTML = _achRenderMain();
}

/* ═══ Helpers ═══ */
function _achEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _achCat(id) {
  for (var i = 0; i < USER_ACHIEVEMENT_CATEGORIES.length; i++) {
    if (USER_ACHIEVEMENT_CATEGORIES[i].id === id) return USER_ACHIEVEMENT_CATEGORIES[i];
  }
  return null;
}

function _achBadge(id) {
  for (var i = 0; i < USER_ACHIEVEMENTS_CATALOG.length; i++) {
    if (USER_ACHIEVEMENTS_CATALOG[i].id === id) return USER_ACHIEVEMENTS_CATALOG[i];
  }
  return null;
}

function _achIsEarned(id) {
  return USER_ACHIEVEMENT_PROGRESS.earnedIds.indexOf(id) > -1;
}

function _achProgress(badge) {
  var curr = USER_ACHIEVEMENT_PROGRESS[badge.metric] || 0;
  var pct = Math.min(100, Math.round((curr / badge.target) * 100));
  return { current: curr, target: badge.target, pct: pct, remaining: Math.max(0, badge.target - curr) };
}

function _achTierColor(tier) {
  return tier === 'bronze'  ? '#CD7F32'
    : tier === 'silver'  ? '#C0C0C0'
    : tier === 'gold'    ? '#F59E0B'
    : tier === 'diamond' ? '#3FCFF6'
    : tier === 'prestige'? '#8B5CF6'
    : '#6B7280';
}

function _achTierGradient(tier) {
  return tier === 'bronze'  ? 'linear-gradient(135deg,#CD7F32,#A0522D)'
    : tier === 'silver'  ? 'linear-gradient(135deg,#E5E7EB,#9CA3AF)'
    : tier === 'gold'    ? 'linear-gradient(135deg,#FCD34D,#F59E0B)'
    : tier === 'diamond' ? 'linear-gradient(135deg,#A7F3FF,#3FCFF6 60%,#0EA5E9)'
    : tier === 'prestige'? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
    : 'linear-gradient(135deg,#9CA3AF,#6B7280)';
}

function _achTierLabel(tier) {
  return tier === 'bronze'  ? 'BRONZ'
    : tier === 'silver'  ? 'GÜMÜŞ'
    : tier === 'gold'    ? 'ALTIN'
    : tier === 'diamond' ? 'ELMAS'
    : tier === 'prestige'? 'PRESTİJ'
    : '—';
}

function _achDaysUntilReset(kind) {
  var now = new Date();
  var next = new Date(now);
  if (kind === 'monthly') {
    // Ayın 1'i 00:00
    next.setMonth(now.getMonth() + 1, 1);
    next.setHours(0, 0, 0, 0);
  } else if (kind === 'yearly' || kind === 'permanent') {
    // Kalıcı için: yıl başı 00:00
    next.setFullYear(now.getFullYear() + 1, 0, 1);
    next.setHours(0, 0, 0, 0);
  } else {
    // weekly: sonraki Pazartesi 00:00
    var day = now.getDay();
    var daysUntil = (day === 0) ? 1 : (8 - day);
    next.setDate(now.getDate() + daysUntil);
    next.setHours(0, 0, 0, 0);
  }
  var diff = next - now;
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  return { days: d, hours: h };
}

/* ═══ Main Render ═══ */
function _achRenderMain() {
  var earned = USER_ACHIEVEMENT_PROGRESS.earnedIds.length;
  var total = USER_ACHIEVEMENTS_CATALOG.length;

  // Kullanıcı top badge
  var topBadge = _achTopBadge();

  // Aktif tab'a göre reset
  var resetKind = (_ach.tab === 'monthly') ? 'monthly'
    : (_ach.tab === 'permanent') ? 'yearly'
    : 'weekly';
  var reset = _achDaysUntilReset(resetKind);
  var resetLbl = (_ach.tab === 'monthly') ? 'Ay sonu' : (_ach.tab === 'permanent') ? 'Yıl sonu' : 'Hafta sonu';

  var h = '<div class="adm-fadeIn ach-wrap">';

  // Hero
  h += '<div class="ach-hero">'
    + '<div class="ach-hero-shine"></div>'
    + '<div class="ach-hero-content">'
    + '<div class="ach-hero-avatar-wrap">'
    + '<div class="ach-hero-avatar">' + (topBadge ? '<iconify-icon icon="' + topBadge.icon + '" style="font-size:28px;color:#fff"></iconify-icon>' : '<iconify-icon icon="solar:user-bold" style="font-size:28px;color:#fff"></iconify-icon>') + '</div>'
    + (topBadge ? '<div class="ach-hero-badge-ring" style="border-color:' + _achTierColor(topBadge.tier) + '"></div>' : '')
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="ach-hero-greet">Merhaba, ' + _achEsc((AUTH && AUTH.user && AUTH.user.name) || 'Gezgin') + '</div>'
    + (topBadge ? '<div class="ach-hero-top-badge"><iconify-icon icon="' + topBadge.icon + '" style="font-size:13px;color:' + _achTierColor(topBadge.tier) + '"></iconify-icon>' + _achEsc(topBadge.label) + '</div>' : '<div class="ach-hero-top-badge">Henüz rozet yok</div>')
    + '<div class="ach-hero-stats">'
    + '<span><b>' + earned + '</b>/' + total + ' rozet</span>'
    + '<span>·</span>'
    + '<span>' + resetLbl + ': <b>' + reset.days + 'g ' + reset.hours + 's</b></span>'
    + '</div>'
    + '</div>'
    + '</div></div>';

  // Tabs (4: Haftalık / Aylık / Kalıcı / Koleksiyon)
  h += '<div class="ach-tabs">'
    + '<button class="ach-tab-btn' + (_ach.tab === 'weekly' ? ' active' : '') + '" onclick="_ach.tab=\'weekly\';_achRender()">'
    +   '<iconify-icon icon="solar:calendar-minimalistic-bold" style="font-size:14px"></iconify-icon>Haftalık</button>'
    + '<button class="ach-tab-btn' + (_ach.tab === 'monthly' ? ' active' : '') + '" onclick="_ach.tab=\'monthly\';_achRender()">'
    +   '<iconify-icon icon="solar:calendar-date-bold" style="font-size:14px"></iconify-icon>Aylık</button>'
    + '<button class="ach-tab-btn' + (_ach.tab === 'permanent' ? ' active' : '') + '" onclick="_ach.tab=\'permanent\';_achRender()">'
    +   '<iconify-icon icon="solar:infinity-bold" style="font-size:14px"></iconify-icon>Kalıcı</button>'
    + '<button class="ach-tab-btn' + (_ach.tab === 'collection' ? ' active' : '') + '" onclick="_ach.tab=\'collection\';_achRender()">'
    +   '<iconify-icon icon="solar:cup-bold" style="font-size:14px"></iconify-icon>Koleksiyon (' + earned + ')</button>'
    + '</div>';

  // Açıklama kuralı (tab'a göre)
  var rulesByTab = {
    weekly:    'Her Pazartesi 00:00\'da sayaç sıfırlanır. Hedefe ulaşan rozet Pazar 23:59\'a kadar aktif kalır.',
    monthly:   'Her ayın 1\'inde sayaç sıfırlanır. Ay boyu hedefe ulaşınca rozet kazanılır.',
    permanent: 'Kazanıldığı an ömür boyu kalır (yıllık rozetler her yıl yenilenir).',
    collection: 'Kazandığın tüm rozetler burada listelenir.'
  };
  h += '<div class="ach-rule"><iconify-icon icon="solar:info-circle-bold" style="font-size:13px;color:#3B82F6;flex-shrink:0"></iconify-icon><span>' + rulesByTab[_ach.tab] + '</span></div>';

  if (_ach.tab === 'collection') {
    h += _achRenderCollection();
  } else {
    h += _achRenderByDuration(_ach.tab);
  }

  h += '</div>';
  return h;
}

function _achTopBadge() {
  var earned = USER_ACHIEVEMENT_PROGRESS.earnedIds;
  if (earned.length === 0) return null;
  // Prestige > gold > silver > bronze
  var tierRank = { prestige:4, gold:3, silver:2, bronze:1 };
  var best = null;
  for (var i = 0; i < earned.length; i++) {
    var b = _achBadge(earned[i]);
    if (!b) continue;
    if (!best || tierRank[b.tier] > tierRank[best.tier]) best = b;
  }
  return best;
}

/* ═══ Duration bazlı kategori render (weekly/monthly/permanent) ═══ */
function _achRenderByDuration(duration) {
  // 'permanent' sekmesi hem permanent hem yearly'i kapsasın
  var cats = USER_ACHIEVEMENT_CATEGORIES.filter(function(c){
    if (duration === 'permanent') return c.duration === 'permanent' || c.duration === 'yearly';
    return c.duration === duration;
  });
  if (!cats.length) return '<div class="ach-empty"><iconify-icon icon="solar:box-linear" style="font-size:48px;opacity:.3"></iconify-icon><div>Bu bölümde henüz rozet yok</div></div>';

  var h = '';
  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    var badges = USER_ACHIEVEMENTS_CATALOG.filter(function(b) { return b.category === cat.id; });
    if (!badges.length) continue;

    h += '<div class="ach-cat-sect">'
      + '<div class="ach-cat-head">'
      + '<div class="ach-cat-ico" style="background:' + cat.color + '18;color:' + cat.color + '">'
      + '<iconify-icon icon="' + cat.icon + '" style="font-size:16px"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1"><div class="ach-cat-lbl">' + _achEsc(cat.label) + '</div>'
      + '<div class="ach-cat-sub">' + _achEsc(cat.sub) + '</div></div>'
      + (cat.duration === 'yearly' ? '<span class="ach-cat-chip">Yıllık</span>' : '')
      + (cat.duration === 'permanent' ? '<span class="ach-cat-chip ach-cat-chip--perm">Kalıcı</span>' : '')
      + '</div>'
      + '<div class="ach-badge-grid">';

    for (var j = 0; j < badges.length; j++) h += _achBadgeCard(badges[j]);
    h += '</div></div>';
  }
  return h;
}

function _achBadgeCard(b) {
  var earned = _achIsEarned(b.id);
  var p = _achProgress(b);
  var tierColor = _achTierColor(b.tier);
  var grad = _achTierGradient(b.tier);

  var rewardBadge = '';
  if (b.reward) {
    if (b.reward.type === 'token') rewardBadge = '<span class="ach-reward">+' + b.reward.amount + ' 🪙</span>';
    else if (b.reward.type === 'frame') rewardBadge = '<span class="ach-reward">🖼 Çerçeve</span>';
  }

  return '<div class="ach-badge-card' + (earned ? ' earned' : ' locked') + '" onclick="_achOpenDetail(\'' + b.id + '\')">'
    + '<div class="ach-badge-ico" style="background:' + (earned ? grad : 'var(--bg-phone-secondary)') + '">'
    + '<iconify-icon icon="' + b.icon + '" style="font-size:26px;color:' + (earned ? '#fff' : '#9CA3AF') + '"></iconify-icon>'
    + (earned ? '<div class="ach-check-ribbon"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#fff"></iconify-icon></div>' : '')
    + '</div>'
    + '<div class="ach-badge-lbl" style="color:' + (earned ? tierColor : 'var(--text-muted)') + '">' + _achEsc(b.label) + '</div>'
    + (rewardBadge ? rewardBadge : '')
    + '<div class="ach-progress-wrap">'
    + '<div class="ach-progress-bar"><div class="ach-progress-fill" style="width:' + p.pct + '%;background:' + (earned ? grad : tierColor) + '"></div></div>'
    + '<div class="ach-progress-text">' + p.current + '/' + p.target + '</div>'
    + '</div>'
    + '</div>';
}

/* ═══ Koleksiyon ═══ */
function _achRenderCollection() {
  var earnedIds = USER_ACHIEVEMENT_PROGRESS.earnedIds;
  if (earnedIds.length === 0) {
    return '<div class="ach-empty">'
      + '<iconify-icon icon="solar:cup-linear" style="font-size:48px;opacity:0.3"></iconify-icon>'
      + '<div>Henüz rozet kazanılmadı</div>'
      + '<div class="ach-empty-sub">Aktif görevlere başla ve ilk rozetini topla!</div>'
      + '</div>';
  }

  var h = '<div class="ach-collection-intro">'
    + '<iconify-icon icon="solar:stars-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span>Kazandığın rozetler kalıcıdır ve profilinde sergilenir</span>'
    + '</div>'
    + '<div class="ach-collection-grid">';

  for (var i = 0; i < earnedIds.length; i++) {
    var b = _achBadge(earnedIds[i]);
    if (!b) continue;
    var tierColor = _achTierColor(b.tier);
    var grad = _achTierGradient(b.tier);
    h += '<div class="ach-coll-card" onclick="_achOpenDetail(\'' + b.id + '\')">'
      + '<div class="ach-coll-ico" style="background:' + grad + '">'
      + '<iconify-icon icon="' + b.icon + '" style="font-size:32px;color:#fff"></iconify-icon>'
      + '</div>'
      + '<div class="ach-coll-lbl" style="color:' + tierColor + '">' + _achEsc(b.label) + '</div>'
      + '<div class="ach-coll-tier">' + (b.tier === 'diamond' ? '💎 Elmas' : b.tier === 'prestige' ? '✨ Prestij' : b.tier === 'gold' ? '🥇 Altın' : b.tier === 'silver' ? '🥈 Gümüş' : '🥉 Bronz') + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══ Detay Modal ═══ */
function _achOpenDetail(id) {
  _achCloseDetail();
  var b = _achBadge(id);
  if (!b) return;
  _ach.detailId = id;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'achDetail';
  m.className = 'ach-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _achCloseDetail(); };
  m.innerHTML = '<div class="ach-modal"><div id="achDetailBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _achRenderDetail();
}

function _achCloseDetail() {
  var m = document.getElementById('achDetail');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _ach.detailId = null;
}

function _achRenderDetail() {
  var body = document.getElementById('achDetailBody');
  if (!body) return;
  var b = _achBadge(_ach.detailId);
  if (!b) return;
  var earned = _achIsEarned(b.id);
  var p = _achProgress(b);
  var grad = _achTierGradient(b.tier);

  var tierLabel = _achTierLabel(b.tier);

  var h = '<div class="ach-detail-head" style="background:' + (earned ? grad : 'linear-gradient(135deg,#64748B,#475569)') + '">'
    + '<div class="ach-close" onclick="_achCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '<div class="ach-detail-badge' + (earned ? ' earned-anim' : '') + '">'
    + '<iconify-icon icon="' + b.icon + '" style="font-size:44px;color:#fff"></iconify-icon>'
    + (!earned ? '<div class="ach-lock"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:20px;color:#fff"></iconify-icon></div>' : '')
    + '</div>'
    + '<div class="ach-detail-tier">' + tierLabel + ' · ' + (b.rarity || '').toUpperCase() + '</div>'
    + '<div class="ach-detail-label">' + _achEsc(b.label) + '</div>'
    + '</div>';

  h += '<div class="ach-detail-body">';

  h += '<div class="ach-detail-desc">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#8B5CF6;flex-shrink:0;margin-top:2px"></iconify-icon>'
    + '<span>' + _achEsc(b.desc) + '</span>'
    + '</div>';

  // Motivasyon / durum
  if (earned) {
    h += '<div class="ach-status earned-box">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:#22C55E"></iconify-icon>'
      + '<div><b>Tebrikler!</b><br><span>Bu rozeti kazandın ve koleksiyonuna eklendi.</span></div>'
      + '</div>';
  } else {
    var motivation = p.remaining <= 2
      ? 'Neredeyse başardın! Sadece <b>' + p.remaining + '</b> kaldı 🔥'
      : 'Bu rozeti kazanmak için <b>' + p.remaining + '</b> adımın kaldı. Haydi devam!';
    h += '<div class="ach-status locked-box">'
      + '<iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
      + '<div>' + motivation + '</div>'
      + '</div>';
  }

  // Progress
  h += '<div class="ach-detail-progress">'
    + '<div class="ach-dp-head">'
    + '<span>İlerleme</span>'
    + '<b>' + p.current + ' / ' + p.target + '</b>'
    + '</div>'
    + '<div class="ach-progress-bar ach-progress-bar--big">'
    + '<div class="ach-progress-fill" style="width:' + p.pct + '%;background:' + grad + '"></div>'
    + '</div>'
    + '<div class="ach-dp-pct">%' + p.pct + '</div>'
    + '</div>';

  // Ödül
  if (b.reward) {
    var rewardText = b.reward.type === 'token'
      ? '+' + b.reward.amount + ' Token Hediye'
      : b.reward.type === 'frame'
        ? 'Profiline özel "' + b.reward.value + '" çerçevesi'
        : 'Özel ödül';
    h += '<div class="ach-reward-box">'
      + '<iconify-icon icon="solar:gift-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
      + '<div><div class="ach-reward-lbl">ÖDÜL</div>'
      + '<div class="ach-reward-val">' + _achEsc(rewardText) + '</div></div>'
      + '</div>';
  }

  // Bilgi
  h += '<div class="ach-info-note">'
    + '<iconify-icon icon="solar:refresh-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + '<span>Haftalık sayaç her Pazartesi 00:00\'da sıfırlanır · Kazanılan rozetler kalıcıdır</span>'
    + '</div>';

  h += '</div>';

  body.innerHTML = h;
}

/* ═══ Styles ═══ */
function _achInjectStyles() {
  if (document.getElementById('achStyles')) return;
  var s = document.createElement('style');
  s.id = 'achStyles';
  s.textContent = [
    '.ach-overlay{color:var(--text-primary)}',
    '.ach-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);z-index:5}',
    '.ach-back{width:34px;height:34px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.ach-back:active{transform:scale(.94)}',
    '.ach-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.ach-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.ach-wrap{padding:14px 14px 28px}',
    '/* Hero */',
    '.ach-hero{position:relative;border-radius:18px;padding:18px;background:linear-gradient(135deg,#F59E0B 0%,#EA580C 55%,#8B5CF6 100%);overflow:hidden;color:#fff;box-shadow:0 8px 22px rgba(245,158,11,.25);margin-bottom:14px}',
    '.ach-hero-shine{position:absolute;top:-40%;right:-10%;width:60%;height:180%;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%);transform:rotate(22deg);pointer-events:none;animation:achShine 4.5s ease-in-out infinite}',
    '@keyframes achShine{0%,100%{opacity:.25}50%{opacity:.55}}',
    '.ach-hero-content{position:relative;display:flex;align-items:center;gap:14px;z-index:1}',
    '.ach-hero-avatar-wrap{position:relative;flex-shrink:0}',
    '.ach-hero-avatar{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.32)}',
    '.ach-hero-badge-ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px rgba(255,255,255,.35)}',
    '.ach-hero-greet{font-size:15px;font-weight:700;margin-bottom:4px;text-shadow:0 1px 2px rgba(0,0,0,.25)}',
    '.ach-hero-top-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.22);backdrop-filter:blur(6px);padding:4px 9px;border-radius:999px;font-size:11px;font-weight:600;margin-bottom:6px;border:1px solid rgba(255,255,255,.18)}',
    '.ach-hero-stats{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.95}',
    '.ach-hero-stats b{font-weight:700}',
    '/* Tabs */',
    '.ach-tabs{display:flex;gap:4px;background:var(--bg-phone-secondary);padding:4px;border-radius:12px;margin-bottom:10px;overflow-x:auto;scrollbar-width:none}',
    '.ach-tabs::-webkit-scrollbar{display:none}',
    '.ach-tab-btn{flex:1;padding:9px 8px;border:none;background:transparent;color:var(--text-muted);border-radius:9px;font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:all .18s;white-space:nowrap;min-width:fit-content}',
    '.ach-tab-btn.active{background:var(--bg-phone);color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.08)}',
    '/* Kural açıklama şeridi */',
    '.ach-rule{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;margin-bottom:14px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.18);border-radius:10px;font-size:11.5px;line-height:1.4;color:var(--text-secondary)}',
    '/* Category section */',
    '.ach-cat-sect{margin-bottom:18px}',
    '.ach-cat-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:0 2px}',
    '.ach-cat-ico{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.ach-cat-lbl{font-size:13px;font-weight:700;color:var(--text-primary)}',
    '.ach-cat-sub{font-size:10.5px;color:var(--text-muted);margin-top:1px}',
    '.ach-cat-chip{padding:3px 8px;border-radius:999px;font-size:9.5px;font-weight:700;letter-spacing:.3px;background:rgba(14,165,233,.12);color:#0EA5E9}',
    '.ach-cat-chip--perm{background:rgba(139,92,246,.14);color:#8B5CF6}',
    '/* Badge grid */',
    '.ach-badge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}',
    '.ach-badge-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;padding:11px 8px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;transition:transform .15s,box-shadow .18s;position:relative;overflow:hidden}',
    '.ach-badge-card:active{transform:scale(.96)}',
    '.ach-badge-card.earned{box-shadow:0 2px 10px rgba(245,158,11,.15)}',
    '.ach-badge-card.locked{opacity:.86}',
    '.ach-badge-card.locked .ach-badge-ico{filter:grayscale(.9)}',
    '.ach-badge-ico{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}',
    '.ach-check-ribbon{position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;background:#22C55E;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg-phone)}',
    '.ach-badge-lbl{font-size:11px;font-weight:700;text-align:center;line-height:1.2;min-height:26px;display:flex;align-items:center;justify-content:center}',
    '.ach-reward{font-size:9.5px;font-weight:600;color:var(--text-muted);background:var(--bg-phone-secondary);padding:2px 6px;border-radius:6px}',
    '.ach-progress-wrap{width:100%;margin-top:2px}',
    '.ach-progress-bar{height:5px;background:var(--bg-phone-secondary);border-radius:999px;overflow:hidden}',
    '.ach-progress-bar--big{height:8px}',
    '.ach-progress-fill{height:100%;transition:width .4s ease;border-radius:999px}',
    '.ach-progress-text{font-size:9.5px;color:var(--text-muted);text-align:center;margin-top:3px;font-weight:600}',
    '/* Collection */',
    '.ach-collection-intro{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted);padding:8px 10px;background:var(--bg-phone-secondary);border-radius:10px;margin-bottom:12px}',
    '.ach-collection-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}',
    '.ach-coll-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:transform .15s;box-shadow:0 2px 10px rgba(0,0,0,.05)}',
    '.ach-coll-card:active{transform:scale(.96)}',
    '.ach-coll-ico{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 3px rgba(255,255,255,.3),0 3px 10px rgba(0,0,0,.12)}',
    '.ach-coll-lbl{font-size:12px;font-weight:700;text-align:center;line-height:1.2}',
    '.ach-coll-tier{font-size:10px;color:var(--text-muted);font-weight:600}',
    '/* Empty */',
    '.ach-empty{padding:40px 20px;text-align:center;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.ach-empty-sub{font-size:11px;opacity:.75}',
    '/* Detail modal */',
    '.ach-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:94;opacity:0;transition:opacity .24s ease}',
    '.ach-modal-backdrop.open{opacity:1}',
    '.ach-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:20px 20px 0 0;overflow:hidden;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);max-height:92vh;overflow-y:auto}',
    '.ach-modal-backdrop.open .ach-modal{transform:translateY(0)}',
    '.ach-detail-head{position:relative;padding:26px 18px 22px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff}',
    '.ach-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.25);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.ach-detail-badge{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.35);position:relative;box-shadow:0 6px 20px rgba(0,0,0,.2)}',
    '.ach-detail-badge.earned-anim{animation:achPulse 2s ease-in-out infinite}',
    '@keyframes achPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.ach-lock{position:absolute;inset:0;background:rgba(0,0,0,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}',
    '.ach-detail-tier{font-size:10px;font-weight:700;letter-spacing:1.5px;opacity:.92;margin-top:4px}',
    '.ach-detail-label{font-size:18px;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.2)}',
    '.ach-detail-body{padding:16px 16px 24px;display:flex;flex-direction:column;gap:12px}',
    '.ach-detail-desc{display:flex;gap:8px;background:var(--bg-phone-secondary);padding:11px 13px;border-radius:12px;font-size:12.5px;color:var(--text-primary);line-height:1.5}',
    '.ach-status{display:flex;gap:10px;align-items:flex-start;padding:12px 13px;border-radius:12px;font-size:12px;line-height:1.45}',
    '.ach-status.earned-box{background:rgba(34,197,94,.1);color:#166534;border:1px solid rgba(34,197,94,.2)}',
    '.ach-status.locked-box{background:rgba(249,115,22,.1);color:#9A3412;border:1px solid rgba(249,115,22,.2)}',
    '.ach-status.locked-box b,.ach-status.earned-box b{font-weight:700}',
    '.ach-detail-progress{background:var(--bg-phone-secondary);padding:12px 13px;border-radius:12px}',
    '.ach-dp-head{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-muted);margin-bottom:7px}',
    '.ach-dp-head b{color:var(--text-primary);font-weight:700;font-size:13px}',
    '.ach-dp-pct{text-align:right;font-size:11px;color:var(--text-muted);font-weight:600;margin-top:5px}',
    '.ach-reward-box{display:flex;gap:11px;align-items:center;padding:12px 13px;background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(236,72,153,.08));border-radius:12px;border:1px solid rgba(245,158,11,.2)}',
    '.ach-reward-lbl{font-size:9.5px;font-weight:700;letter-spacing:1px;color:var(--text-muted)}',
    '.ach-reward-val{font-size:13px;font-weight:700;color:var(--text-primary);margin-top:2px}',
    '.ach-info-note{display:flex;align-items:flex-start;gap:6px;font-size:10.5px;color:var(--text-muted);padding:8px 10px;line-height:1.4}',
    '/* Profile badge next to posts */',
    '.ach-profile-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px 2px 4px;background:var(--bg-phone-secondary);border-radius:999px;font-size:10.5px;font-weight:600;color:var(--text-primary)}'
  ].join('\n');
  document.head.appendChild(s);
}
