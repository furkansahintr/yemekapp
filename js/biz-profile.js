/* ═══ BIZ COMMUNITY PROFILE OVERLAY ═══ */

let bizProfActiveTab = 'posts';

function _bizProfileData() {
  const base = (typeof BIZ_PROFILE !== 'undefined') ? BIZ_PROFILE : {};
  const biz = (typeof BIZ_BUSINESS !== 'undefined') ? BIZ_BUSINESS : {};
  const reviews = (typeof BIZ_REVIEWS !== 'undefined') ? BIZ_REVIEWS : [];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : (base.rating || 0);
  return {
    name: biz.name || 'İşletmem',
    handle: base.handle || '@isletme',
    avatar: base.avatar || '',
    bio: biz.description || base.bio || '',
    postsCount: base.postsCount || 0,
    followersCount: base.followersCount || 0,
    followingCount: base.followingCount || 0,
    rating: avgRating,
    reviewCount: reviews.length,
    cuisine: biz.cuisine || '',
    socialLinks: biz.socialLinks || {},
    branches: (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.filter(b => b.businessId === biz.id) : []
  };
}

function openBizProfOverlay() {
  bizProfActiveTab = 'posts';
  const p = _bizProfileData();
  const ratingNum = p.rating.toFixed(1);

  const logoHtml = `
    <div onclick="openBizProfMore()" class="prof-avatar" style="padding:0;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 55%,#ffc75f 100%);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;box-shadow:0 4px 14px rgba(255,107,53,0.35);border-color:var(--primary)">
      <span style="font:800 26px/1 'Poppins',var(--font);color:#fff;letter-spacing:1px;text-shadow:0 2px 4px rgba(0,0,0,0.18)">LM</span>
      <iconify-icon icon="solar:chef-hat-minimalistic-bold" style="position:absolute;bottom:-2px;right:-2px;font-size:22px;color:#fff;background:#d94e1f;border-radius:50%;padding:2px;border:2px solid var(--bg-page)"></iconify-icon>
    </div>`;

  const overlayHtml = `
    <div class="prof-container">

      <div class="prof-topbar">
        <div class="btn-icon" onclick="closeBizProfOverlay()">
          <iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon>
        </div>
        <span class="prof-topbar-name">${escHtml(p.handle)}</span>
        <div class="prof-topbar-actions">
          <div class="btn-icon" onclick="bizProfShare()">
            <iconify-icon icon="solar:share-linear" style="font-size:22px"></iconify-icon>
          </div>
          <div class="btn-icon" onclick="openBizProfMore()">
            <iconify-icon icon="solar:hamburger-menu-linear" style="font-size:22px"></iconify-icon>
          </div>
        </div>
      </div>

      <div class="prof-header">
        <div class="prof-avatar-area">${logoHtml}</div>
        <div class="prof-stats">
          <div class="prof-stat" onclick="_bizProfScrollTo('posts')">
            <span class="prof-stat-num">${p.postsCount}</span>
            <span class="prof-stat-label">Paylaşım</span>
          </div>
          <div class="prof-stat" onclick="openBizFollowersList('followers')">
            <span class="prof-stat-num">${_bizFormatCount(p.followersCount)}</span>
            <span class="prof-stat-label">Takipçi</span>
          </div>
          <div class="prof-stat" onclick="openBizFollowersList('following')">
            <span class="prof-stat-num">${p.followingCount}</span>
            <span class="prof-stat-label">Takip</span>
          </div>
          <div class="prof-stat" onclick="openBizReviewsList()">
            <span class="prof-stat-num" style="display:inline-flex;align-items:center;gap:3px">
              <iconify-icon icon="solar:star-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>${ratingNum}
            </span>
            <span class="prof-stat-label">${p.reviewCount} Puan</span>
          </div>
        </div>
      </div>

      <div class="prof-info">
        <div class="prof-name">${escHtml(p.name)}</div>
        ${p.cuisine ? `<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-tertiary);margin-top:2px">${escHtml(p.cuisine)}</div>` : ''}
        ${p.bio ? `<div class="prof-bio">${escHtml(p.bio)}</div>` : ''}
      </div>

      <div class="prof-action-row">
        <button class="prof-edit-btn" onclick="openBizProfEdit()">
          <iconify-icon icon="solar:pen-2-linear" style="font-size:14px"></iconify-icon> Profili Düzenle
        </button>
        <button class="prof-share-btn" onclick="bizProfShare()">
          <iconify-icon icon="solar:share-linear" style="font-size:14px"></iconify-icon> Paylaş
        </button>
        <button class="prof-share-btn" onclick="openBizProfMore()" style="flex:0 0 auto;padding:8px 14px" title="Daha Fazla">
          <iconify-icon icon="solar:menu-dots-bold" style="font-size:14px"></iconify-icon>
        </button>
      </div>

      <div class="prof-tabs">
        <div class="prof-tab active" data-biztab="posts" onclick="setBizProfTab('posts')">
          <iconify-icon icon="solar:posts-carousel-horizontal-bold" style="font-size:22px"></iconify-icon>
        </div>
        <div class="prof-tab" data-biztab="menu" onclick="setBizProfTab('menu')">
          <iconify-icon icon="solar:notebook-bold" style="font-size:22px"></iconify-icon>
        </div>
        <div class="prof-tab" data-biztab="liked" onclick="setBizProfTab('liked')">
          <iconify-icon icon="solar:heart-bold" style="font-size:22px"></iconify-icon>
        </div>
      </div>

      <div class="prof-tab-content" id="bizProfTabContent"></div>
    </div>
  `;

  const existing = document.getElementById('bizProfOverlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'bizProfOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.zIndex = '70';
  overlay.innerHTML = overlayHtml;
  document.getElementById('bizPhone').appendChild(overlay);
  setBizProfTab('posts');
}

function closeBizProfOverlay() {
  const el = document.getElementById('bizProfOverlay');
  if (el) el.remove();
}

function _bizFormatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'B';
  return String(n);
}

function _bizProfScrollTo(tab) {
  setBizProfTab(tab);
  const c = document.getElementById('bizProfTabContent');
  if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setBizProfTab(tab) {
  bizProfActiveTab = tab;
  const scope = document.getElementById('bizProfOverlay');
  if (scope) scope.querySelectorAll('[data-biztab]').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-biztab') === tab);
  });
  const c = document.getElementById('bizProfTabContent');
  if (!c) return;
  if (tab === 'posts') c.innerHTML = _renderBizProfPosts();
  else if (tab === 'menu') c.innerHTML = _renderBizProfMenu();
  else if (tab === 'liked') c.innerHTML = _renderBizProfLiked();
}

function _renderBizProfPosts() {
  const feed = (typeof COMMUNITY_FEED !== 'undefined') ? COMMUNITY_FEED : [];
  const mine = feed.slice(0, 9); // mock: first N as own business posts
  if (!mine.length) {
    return `<div style="text-align:center;padding:40px 0;color:var(--text-muted)"><iconify-icon icon="solar:gallery-linear" style="font-size:40px"></iconify-icon><div style="margin-top:8px">Henüz paylaşım yok</div></div>`;
  }
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
    ${mine.map(p => `
      <div style="aspect-ratio:1;position:relative;background:var(--bg-btn);overflow:hidden;border-radius:2px;cursor:pointer">
        ${p.img ? `<img src="${p.img}" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : `<div style="padding:8px;font:var(--fw-medium) 10px/1.3 var(--font);color:var(--text-secondary);height:100%;display:flex;align-items:center">${escHtml((p.text||'').slice(0,60))}</div>`}
        <div style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.5);color:#fff;font:var(--fw-medium) 10px/1 var(--font);padding:3px 6px;border-radius:var(--r-sm);display:flex;align-items:center;gap:3px">
          <iconify-icon icon="solar:heart-bold" style="font-size:10px"></iconify-icon>${formatCount(p.likes||0)}
        </div>
      </div>
    `).join('')}
  </div>`;
}

function _renderBizProfMenu() {
  const items = (typeof BIZ_MENU_ITEMS !== 'undefined') ? BIZ_MENU_ITEMS : [];
  if (!items.length) {
    return `<div style="text-align:center;padding:40px 0;color:var(--text-muted)"><iconify-icon icon="solar:notebook-linear" style="font-size:40px"></iconify-icon><div style="margin-top:8px">Menü boş</div></div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:10px">
    ${items.slice(0, 20).map(m => `
      <div style="display:flex;align-items:center;gap:12px;background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px">
        ${m.img ? `<img src="${m.img}" alt="" style="width:54px;height:54px;border-radius:var(--r-md);object-fit:cover;flex-shrink:0">` : `<div style="width:54px;height:54px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:dish-bold" style="font-size:24px;color:var(--primary)"></iconify-icon></div>`}
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(m.name || 'Ürün')}</div>
          ${m.description ? `<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical">${escHtml(m.description)}</div>` : ''}
        </div>
        <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${m.price || 0}</div>
      </div>
    `).join('')}
  </div>`;
}

function _renderBizProfLiked() {
  const feed = (typeof COMMUNITY_FEED !== 'undefined') ? COMMUNITY_FEED : [];
  const liked = feed.filter(p => p.liked).slice(0, 9);
  if (!liked.length) {
    return `<div style="text-align:center;padding:40px 0;color:var(--text-muted)"><iconify-icon icon="solar:heart-linear" style="font-size:40px"></iconify-icon><div style="margin-top:8px">Beğenilen gönderi yok</div></div>`;
  }
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
    ${liked.map(p => `
      <div style="aspect-ratio:1;background:var(--bg-btn);overflow:hidden;border-radius:2px;cursor:pointer">
        ${p.img ? `<img src="${p.img}" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : `<div style="padding:8px;font:var(--fw-medium) 10px/1.3 var(--font);color:var(--text-secondary);height:100%;display:flex;align-items:center">${escHtml((p.text||'').slice(0,60))}</div>`}
      </div>
    `).join('')}
  </div>`;
}

/* ── Share / Edit / More ──────────────────────────────── */
function bizProfShare() {
  const p = _bizProfileData();
  const url = `https://yemekapp.example/${p.handle.replace(/^@/, '')}`;
  if (navigator.share) {
    navigator.share({ title: p.name, text: p.bio || '', url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert('Profil linki kopyalandı:\n' + url));
  } else {
    alert('Profil linki:\n' + url);
  }
}

function openBizProfEdit() {
  if (typeof openBizMyBusinessEdit === 'function') { openBizMyBusinessEdit(); return; }
  if (typeof openBizProfileEdit === 'function') { openBizProfileEdit(); return; }
  alert('Profil düzenleme — İşletmem sekmesinden yapabilirsiniz.');
}

function openBizProfMore() {
  const p = _bizProfileData();
  const social = p.socialLinks || {};
  const branches = p.branches || [];
  const items = [];
  branches.forEach(b => items.push({
    icon: 'solar:map-point-bold', color: '#EF4444',
    label: escHtml(b.name), sub: escHtml(b.address || ''),
    onclick: `bizOpenMap('${encodeURIComponent(b.address || '')}')`
  }));
  if (social.instagram) items.push({ icon: 'solar:posts-carousel-horizontal-bold', color: '#E1306C', label: 'Instagram', sub: social.instagram, onclick: `window.open('https://instagram.com/${social.instagram.replace(/^@/, '')}','_blank')` });
  if (social.facebook)  items.push({ icon: 'solar:users-group-rounded-bold',    color: '#1877F2', label: 'Facebook',  sub: social.facebook,  onclick: `window.open('https://facebook.com/${social.facebook}','_blank')` });
  if (social.twitter)   items.push({ icon: 'solar:chat-round-bold',              color: '#1DA1F2', label: 'Twitter / X', sub: social.twitter,   onclick: `window.open('https://twitter.com/${social.twitter.replace(/^@/, '')}','_blank')` });
  const phone = (typeof BIZ_BUSINESS !== 'undefined' && BIZ_BUSINESS.owner) ? BIZ_BUSINESS.owner.phone : '';
  if (phone) items.push({ icon: 'solar:phone-bold', color: '#22C55E', label: 'Telefon', sub: phone, onclick: `window.open('tel:${phone}')` });

  const itemsHtml = items.length
    ? items.map(it => `
        <div onclick="${it.onclick}" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-lg);background:var(--glass-card);cursor:pointer">
          <div style="width:36px;height:36px;border-radius:var(--r-md);background:${it.color}22;display:flex;align-items:center;justify-content:center">
            <iconify-icon icon="${it.icon}" style="font-size:18px;color:${it.color}"></iconify-icon>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${it.label}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.sub}</div>
          </div>
          <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
        </div>
      `).join('')
    : '<div style="text-align:center;color:var(--text-muted);padding:24px">Ek bilgi bulunmuyor.</div>';

  const existing = document.getElementById('bizProfMoreSheet');
  if (existing) existing.remove();
  const sheet = document.createElement('div');
  sheet.id = 'bizProfMoreSheet';
  sheet.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:75;display:flex;align-items:flex-end;justify-content:center';
  sheet.onclick = (e) => { if (e.target === sheet) sheet.remove(); };
  sheet.innerHTML = `
    <div style="width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;max-height:80vh;overflow-y:auto">
      <div style="padding:14px var(--app-px);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px">
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);flex:1">Daha Fazla</span>
        <div class="btn-icon" onclick="document.getElementById('bizProfMoreSheet').remove()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>
      </div>
      <div style="padding:14px var(--app-px);display:flex;flex-direction:column;gap:10px">${itemsHtml}</div>
    </div>
  `;
  document.body.appendChild(sheet);
}

function bizOpenMap(addr) {
  window.open('https://www.google.com/maps/search/?api=1&query=' + addr, '_blank');
}

/* ── Followers / Following overlay ─────────────────────── */
function openBizFollowersList(type) {
  const title = type === 'following' ? 'Takip Edilenler' : 'Takipçiler';
  const list = type === 'following'
    ? (typeof BIZ_FOLLOWING !== 'undefined' ? BIZ_FOLLOWING : [])
    : (typeof BIZ_FOLLOWERS !== 'undefined' ? BIZ_FOLLOWERS : []);

  const rowsHtml = list.length ? list.map(u => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--glass-card);border-radius:var(--r-lg)">
      <img src="${u.avatar}" alt="${escHtml(u.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:4px">
          <span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(u.name)}</span>
          ${u.verified ? `<iconify-icon icon="solar:verified-check-bold" style="font-size:13px;color:#3B82F6"></iconify-icon>` : ''}
        </div>
        <div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(u.handle || '')}</div>
      </div>
      <button style="padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:${u.follows ? 'var(--bg-btn)' : 'var(--primary)'};color:${u.follows ? 'var(--text-primary)' : '#fff'};font:var(--fw-medium) 11px/1 var(--font);cursor:pointer">
        ${type === 'following' ? 'Takibi Bırak' : (u.follows ? 'Takiptesin' : 'Takip Et')}
      </button>
    </div>
  `).join('') : '<div style="text-align:center;color:var(--text-muted);padding:40px 0">Liste boş</div>';

  _bizProfStackOverlay('bizFollowOverlay', title, `<div style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>`);
}

/* ── Reviews overlay with filter chips ─────────────────── */
let bizReviewFilter = 'all';

function openBizReviewsList() {
  bizReviewFilter = 'all';
  _bizProfStackOverlay('bizReviewsOverlay', 'Değerlendirmeler', _renderBizReviewsBody());
}

function setBizReviewFilter(key) {
  bizReviewFilter = key;
  const body = document.getElementById('bizReviewsBody');
  if (body) body.innerHTML = _renderBizReviewsBody(true);
  // re-highlight chips
  document.querySelectorAll('.biz-review-chip').forEach(ch => {
    const active = ch.dataset.filter === key;
    ch.style.background = active ? 'var(--primary)' : 'var(--bg-btn)';
    ch.style.color = active ? '#fff' : 'var(--text-primary)';
    ch.style.borderColor = active ? 'var(--primary)' : 'var(--border-subtle)';
  });
}

function _matchReviewFilter(r, filter) {
  const t = (r.text || '').toLowerCase();
  switch (filter) {
    case 'all':      return true;
    case 'top':      return r.rating >= 4;
    case 'worst':    return r.rating <= 2;
    case 'detailed': return (r.text || '').length >= 80;
    case 'hygiene':  return /hijyen|temiz|temizlik|kirli/.test(t);
    case 'speed':    return /hız|hızlı|yavaş|servis|bekleme|geç/.test(t);
    default:         return true;
  }
}

function _renderBizReviewsBody(bodyOnly) {
  const reviews = (typeof BIZ_REVIEWS !== 'undefined' ? BIZ_REVIEWS : []);
  const filtered = reviews.filter(r => _matchReviewFilter(r, bizReviewFilter));
  const chips = [
    { k: 'all',      l: 'Tümü' },
    { k: 'top',      l: 'En iyi puanlar',   i: 'solar:star-bold',        c: '#F59E0B' },
    { k: 'worst',    l: 'En kötü puanlar',  i: 'solar:sad-square-bold',  c: '#EF4444' },
    { k: 'detailed', l: 'Detaylı yorum',    i: 'solar:document-text-bold', c: '#8B5CF6' },
    { k: 'hygiene',  l: 'Hijyen içerikli',  i: 'solar:shield-check-bold', c: '#22C55E' },
    { k: 'speed',    l: 'Hız içerikli',     i: 'solar:rocket-bold',      c: '#3B82F6' }
  ];
  const chipsHtml = chips.map(ch => {
    const active = ch.k === bizReviewFilter;
    return `<div class="biz-review-chip" data-filter="${ch.k}" onclick="setBizReviewFilter('${ch.k}')"
      style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--r-full);border:1px solid ${active ? 'var(--primary)' : 'var(--border-subtle)'};background:${active ? 'var(--primary)' : 'var(--bg-btn)'};color:${active ? '#fff' : 'var(--text-primary)'};font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;white-space:nowrap">
      ${ch.i ? `<iconify-icon icon="${ch.i}" style="font-size:12px;color:${active ? '#fff' : ch.c}"></iconify-icon>` : ''}
      ${ch.l}
    </div>`;
  }).join('');

  const listHtml = filtered.length ? filtered.map(r => {
    const stars = Array.from({ length: 5 }, (_, i) => `<iconify-icon icon="${i < r.rating ? 'solar:star-bold' : 'solar:star-linear'}" style="font-size:14px;color:#F59E0B"></iconify-icon>`).join('');
    const date = new Date(r.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `
      <div style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <img src="${r.customerAvatar}" alt="${escHtml(r.customerName)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(r.customerName)}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
              <div style="display:flex;gap:1px">${stars}</div>
              <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">${date}</span>
            </div>
          </div>
        </div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">${escHtml(r.text || '')}</div>
        ${r.reply ? `
          <div style="margin-left:12px;padding:8px 10px;background:var(--primary-soft);border-radius:var(--r-md);border-left:3px solid var(--primary)">
            <div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--primary);margin-bottom:4px">İşletme yanıtı · ${escHtml(r.reply.author)}</div>
            <div style="font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-secondary)">${escHtml(r.reply.text)}</div>
          </div>` : ''}
      </div>
    `;
  }).join('') : `<div style="text-align:center;color:var(--text-muted);padding:40px 0">Bu filtre için yorum bulunamadı.</div>`;

  const body = `
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:12px;scrollbar-width:thin">${chipsHtml}</div>
    <div style="display:flex;flex-direction:column;gap:10px">${listHtml}</div>
  `;
  return bodyOnly ? listHtml : `<div id="bizReviewsBody">${body}</div>`;
}

/* ── Overlay stacking helper (stacks above bizProfOverlay) ── */
function _bizProfStackOverlay(id, title, content) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-page);z-index:72;display:flex;flex-direction:column;overflow:hidden';
  overlay.innerHTML = `
    <div style="padding:max(env(safe-area-inset-top),14px) var(--app-px) 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle);background:var(--glass-bg);backdrop-filter:var(--glass-blur);flex-shrink:0">
      <div class="btn-icon" onclick="document.getElementById('${id}').remove()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);flex:1">${title}</span>
    </div>
    <div style="flex:1;overflow-y:auto;padding:14px var(--app-px)">${content}</div>
  `;
  document.body.appendChild(overlay);
}
