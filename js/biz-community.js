/* ═══ BIZ COMMUNITY COMPONENT ═══ */

function renderBizCommunity() {
  const container = document.getElementById('bizCommunityContainer');
  if (!container) return;

  // If "Tüm İşletmeler" selected, show blur overlay prompting branch selection
  if (bizActiveBranch === 'all') {
    container.innerHTML = `
      <div style="position:relative;height:100%;overflow:hidden">
        <!-- Blurred community background -->
        <div style="filter:blur(6px);opacity:0.4;pointer-events:none;padding-top:12px">
          <div style="padding:0 var(--app-px)">
            <div class="comm-filter-bar" style="position:static;padding:0;margin-bottom:12px">
              <div class="comm-filter-tab active"><iconify-icon icon="solar:home-smile-linear" style="font-size:15px"></iconify-icon> Akış</div>
              <div class="comm-filter-tab"><iconify-icon icon="solar:fire-linear" style="font-size:15px"></iconify-icon> Popüler</div>
              <div class="comm-filter-tab"><iconify-icon icon="solar:compass-linear" style="font-size:15px"></iconify-icon> Keşfet</div>
            </div>
          </div>
          <div style="padding:0 var(--app-px);display:flex;flex-direction:column;gap:12px">
            ${[1,2,3].map(() => `
              <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle)">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-btn)"></div>
                  <div><div style="width:100px;height:10px;background:var(--bg-btn);border-radius:4px"></div><div style="width:60px;height:8px;background:var(--bg-btn);border-radius:4px;margin-top:4px"></div></div>
                </div>
                <div style="width:100%;height:10px;background:var(--bg-btn);border-radius:4px;margin-bottom:6px"></div>
                <div style="width:80%;height:10px;background:var(--bg-btn);border-radius:4px"></div>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Overlay prompt -->
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;z-index:10">
          <div style="width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px">
            <iconify-icon icon="solar:buildings-2-bold" style="font-size:36px;color:#8B5CF6"></iconify-icon>
          </div>
          <div style="font:var(--fw-bold) var(--fs-xl)/1.3 var(--font);color:var(--text-primary);text-align:center;margin-bottom:8px">Lütfen Bir İşletme Seçiniz</div>
          <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted);text-align:center;max-width:260px;margin-bottom:24px">Topluluk içerikleri seçili işletmeye göre gösterilir. Üst menüden bir şube seçin.</div>
          <div onclick="toggleBizBranchPicker()" style="background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);padding:14px 28px;border-radius:var(--r-full);cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(246,80,19,0.25)">
            <iconify-icon icon="solar:shop-2-bold" style="font-size:18px"></iconify-icon>
            İşletme Seç
          </div>
        </div>
      </div>
    `;
    return;
  }

  const branch = getBizBranch();

  container.innerHTML = `
    <div class="community-container">

      <!-- Filter Tabs -->
      <div class="comm-filter-bar" style="margin-top:8px">
        <div class="comm-filter-tab active" onclick="setBizCommFilter('all',this)">
          <iconify-icon icon="solar:home-smile-linear" style="font-size:15px"></iconify-icon> Akış
        </div>
        <div class="comm-filter-tab" onclick="setBizCommFilter('popular',this)">
          <iconify-icon icon="solar:fire-linear" style="font-size:15px"></iconify-icon> Popüler
        </div>
        <div class="comm-filter-tab" onclick="setBizCommFilter('discover',this)">
          <iconify-icon icon="solar:compass-linear" style="font-size:15px"></iconify-icon> Keşfet
        </div>
        <div class="comm-filter-tab" onclick="setBizCommFilter('chefs',this)">
          <iconify-icon icon="solar:chef-hat-linear" style="font-size:15px"></iconify-icon> Şefler
        </div>
      </div>

      <div class="community-feed" id="bizCommFeed"></div>

      <div class="comm-fab" onclick="openBizNewPost()">
        <iconify-icon icon="solar:pen-new-round-bold" style="font-size:22px;color:#fff"></iconify-icon>
      </div>
    </div>
  `;

  renderBizCommFeed('all');
}

let bizCommFilter = 'all';

function setBizCommFilter(filter, el) {
  bizCommFilter = filter;
  if (el) {
    el.parentElement.querySelectorAll('.comm-filter-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  renderBizCommFeed(filter);
}

function renderBizCommFeed(filter) {
  const feed = document.getElementById('bizCommFeed');
  if (!feed || typeof COMMUNITY_FEED === 'undefined') return;

  let posts = COMMUNITY_FEED;
  if (filter && filter !== 'all') {
    posts = posts.filter(p => p.filter === filter);
  }

  if (!posts.length) {
    feed.innerHTML = '<div style="text-align:center;padding:40px var(--app-px)"><iconify-icon icon="solar:ghost-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Bu filtrede henüz gönderi yok</div></div>';
    return;
  }

  // Use the same post structure as user side
  feed.innerHTML = posts.map(post => {
    const verified = post.user.verified ? '<iconify-icon icon="solar:verified-check-bold" class="feed-verified"></iconify-icon>' : '';
    const chefBadge = post.user.isChef ? '<span class="feed-chef-badge"><iconify-icon icon="solar:chef-hat-bold" style="font-size:10px"></iconify-icon> Şef</span>' : '';

    let typeBadge = '';
    if (post.postType === 'ask') {
      const statusCls = post.askStatus === 'solved' ? 'solved' : 'open';
      const statusIcon = post.askStatus === 'solved' ? 'solar:check-circle-bold' : 'solar:question-circle-bold';
      const statusText = post.askStatus === 'solved' ? 'Çözüldü' : 'Yardım Bekleniyor';
      typeBadge = '<div class="feed-ask-badge ' + statusCls + '"><iconify-icon icon="' + statusIcon + '"></iconify-icon> ' + statusText + '</div>';
    } else if (post.postType === 'chef_tip') {
      typeBadge = '<div class="feed-chef-tip-badge"><iconify-icon icon="solar:lightbulb-bolt-bold" style="font-size:12px"></iconify-icon> Şef İpucu</div>';
    }

    let recipeLink = '';
    if (post.postType === 'recipe' && post.recipe) {
      const r = post.recipe;
      const img = menuItems[r.menuIdx] ? menuItems[r.menuIdx].img : '';
      recipeLink = '<div class="feed-recipe-link"><img src="' + img + '" alt="' + r.name + '"><div class="feed-recipe-link-info"><div class="feed-recipe-link-name">' + r.name + '</div><div class="feed-recipe-link-meta"><span class="feed-recipe-link-tag"><iconify-icon icon="solar:clock-circle-linear"></iconify-icon>' + r.cookTime + '</span><span class="feed-recipe-link-tag"><iconify-icon icon="solar:fire-linear"></iconify-icon>' + r.kalori + ' kcal</span></div></div></div>';
    }

    let askReply = '';
    if (post.postType === 'ask') {
      askReply = '<div class="feed-ask-reply-bar"><iconify-icon icon="solar:chat-round-dots-bold"></iconify-icon><span>Yardım Et</span><span class="feed-ask-reply-count">' + (post.askReplies || 0) + ' yanıt</span></div>';
    }

    return '<div class="feed-post"><div class="feed-header"><img class="feed-avatar" src="' + post.user.avatar + '" alt="' + post.user.name + '"><div class="feed-user-info"><span class="feed-username">' + post.user.name + verified + chefBadge + '</span><span class="feed-handle">' + post.user.handle + ' · ' + post.time + '</span></div><div class="btn-icon feed-more"><iconify-icon icon="solar:menu-dots-bold" style="font-size:18px"></iconify-icon></div></div>' + typeBadge + '<div class="feed-text">' + post.text.replace(/\n/g, '<br>') + '</div>' + (post.img ? '<div class="feed-img"><img src="' + post.img + '" alt=""></div>' : '') + recipeLink + askReply + '<div class="feed-tags">' + post.tags.map(function(t) { return '<span class="feed-tag">#' + t + '</span>'; }).join('') + '</div><div class="feed-actions"><div class="feed-action' + (post.liked ? ' feed-action-liked' : '') + '"><iconify-icon icon="' + (post.liked ? 'solar:heart-bold' : 'solar:heart-linear') + '" class="feed-action-icon"></iconify-icon><span>' + formatCount(post.likes) + '</span></div><div class="feed-action"><iconify-icon icon="solar:chat-round-dots-linear" class="feed-action-icon"></iconify-icon><span>' + formatCount(post.comments) + '</span></div><div class="feed-action"><iconify-icon icon="solar:share-linear" class="feed-action-icon"></iconify-icon><span>' + formatCount(post.shares) + '</span></div><div class="feed-action' + (post.saved ? ' feed-action-saved' : '') + '"><iconify-icon icon="' + (post.saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear') + '" class="feed-action-icon"></iconify-icon></div></div></div>';
  }).join('');
}

// openBizNewPost() is defined in js/biz-new-post.js — aynı akış,
// kullanıcı tarafındaki openNewPost() ile birebir paralel.

