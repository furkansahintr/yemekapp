/* ═══ COMMUNITY COMPONENT ═══ */

let commActiveFilter = 'all';

function formatCount(n){
  if(n>=1000) return (n/1000).toFixed(n%1000===0?0:1)+'K';
  return String(n);
}

function renderCommunity(){
  renderCommStories();
  renderCommFeed();
  renderCommChefsBanner();
}

function renderCommStories(){
  const container=document.getElementById('commStoriesContainer');
  if(!container||typeof STORIES==='undefined')return;
  container.innerHTML=`<div class="stories-scroll" style="padding:12px var(--app-px) 0">${STORIES.map((s,i)=>`
    <div class="story-item" onclick="viewStory(${i})">
      <div class="story-ring${s.hasNew?' story-ring-new':''}${s.isOwn?' story-ring-own':''}">
        <img src="${s.avatar}" alt="${s.name}">
        ${s.isOwn?'<div class="story-add-btn"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon></div>':''}
      </div>
      <span class="story-name">${s.name}</span>
    </div>
  `).join('')}</div>`;
}

function renderCommFeed(){
  const feed=document.getElementById('communityFeed');
  if(!feed||typeof COMMUNITY_FEED==='undefined')return;

  let posts = COMMUNITY_FEED;
  if(commActiveFilter!=='all'){
    posts = posts.filter(p=>p.filter===commActiveFilter);
  }

  if(!posts.length){
    feed.innerHTML='<div style="text-align:center;padding:40px var(--app-px)"><iconify-icon icon="solar:ghost-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Bu filtrede henüz gönderi yok</div></div>';
    return;
  }

  feed.innerHTML=posts.map(post=>{
    const verified = post.user.verified ? '<iconify-icon icon="solar:verified-check-bold" class="feed-verified"></iconify-icon>' : '';
    const chefBadge = post.user.isChef ? '<span class="feed-chef-badge"><iconify-icon icon="solar:chef-hat-bold" style="font-size:10px"></iconify-icon> Şef</span>' : '';

    let typeBadge = '';
    if(post.postType==='ask'){
      const statusCls = post.askStatus==='solved'?'solved':'open';
      const statusIcon = post.askStatus==='solved'?'solar:check-circle-bold':'solar:question-circle-bold';
      const statusText = post.askStatus==='solved'?'Çözüldü':'Yardım Bekleniyor';
      typeBadge = '<div class="feed-ask-badge '+statusCls+'"><iconify-icon icon="'+statusIcon+'"></iconify-icon> '+statusText+'</div>';
    } else if(post.postType==='chef_tip'){
      typeBadge = '<div class="feed-chef-tip-badge"><iconify-icon icon="solar:lightbulb-bolt-bold" style="font-size:12px"></iconify-icon> Şef İpucu</div>';
    }

    let recipeLink = '';
    if(post.postType==='recipe' && post.recipe){
      const r = post.recipe;
      const img = menuItems[r.menuIdx] ? menuItems[r.menuIdx].img : '';
      recipeLink = `<div class="feed-recipe-link" onclick="event.stopPropagation();showDetail(${r.menuIdx})">
        <img src="${img}" alt="${r.name}">
        <div class="feed-recipe-link-info">
          <div class="feed-recipe-link-name">${r.name}</div>
          <div class="feed-recipe-link-meta">
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:clock-circle-linear"></iconify-icon>${r.cookTime}</span>
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:fire-linear"></iconify-icon>${r.kalori} kcal</span>
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:chef-hat-linear"></iconify-icon>${r.difficulty}</span>
          </div>
        </div>
        <iconify-icon icon="solar:arrow-right-linear" class="feed-recipe-link-arrow" style="font-size:16px"></iconify-icon>
      </div>`;
    }

    let askReply = '';
    if(post.postType==='ask'){
      askReply = `<div class="feed-ask-reply-bar">
        <iconify-icon icon="solar:chat-round-dots-bold"></iconify-icon>
        <span>Yardım Et</span>
        <span class="feed-ask-reply-count">${post.askReplies||0} yanıt</span>
      </div>`;
    }

    return `<div class="feed-post">
      <div class="feed-header">
        <img class="feed-avatar" src="${post.user.avatar}" alt="${post.user.name}">
        <div class="feed-user-info">
          <span class="feed-username">${post.user.name}${verified}${chefBadge}</span>
          <span class="feed-handle">${post.user.handle} · ${post.time}</span>
        </div>
        <div class="btn-icon feed-more"><iconify-icon icon="solar:menu-dots-bold" style="font-size:18px"></iconify-icon></div>
      </div>
      ${typeBadge}
      <div class="feed-text">${post.text.replace(/\n/g,'<br>')}</div>
      ${post.img?`<div class="feed-img"><img src="${post.img}" alt=""></div>`:''}
      ${recipeLink}
      ${askReply}
      <div class="feed-tags">${post.tags.map(t=>`<span class="feed-tag">#${t}</span>`).join('')}</div>
      <div class="feed-actions">
        <div class="feed-action${post.liked?' feed-action-liked':''}" onclick="toggleLike(${post.id})">
          <iconify-icon icon="${post.liked?'solar:heart-bold':'solar:heart-linear'}" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.likes)}</span>
        </div>
        <div class="feed-action">
          <iconify-icon icon="solar:chat-round-dots-linear" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.comments)}</span>
        </div>
        <div class="feed-action">
          <iconify-icon icon="solar:share-linear" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.shares)}</span>
        </div>
        <div class="feed-action${post.saved?' feed-action-saved':''}" onclick="toggleSave(${post.id})">
          <iconify-icon icon="${post.saved?'solar:bookmark-bold':'solar:bookmark-linear'}" class="feed-action-icon"></iconify-icon>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleLike(postId){
  const post=COMMUNITY_FEED.find(p=>p.id===postId);
  if(!post)return;
  post.liked=!post.liked;
  post.likes+=post.liked?1:-1;
  renderCommFeed();
}

function toggleSave(postId){
  const post=COMMUNITY_FEED.find(p=>p.id===postId);
  if(!post)return;
  post.saved=!post.saved;
  renderCommFeed();
}

function setCommFilter(filter){
  commActiveFilter = filter;
  document.querySelectorAll('.comm-filter-tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.filter===filter);
  });
  const banner = document.getElementById('commChefsBanner');
  if(banner) banner.style.display = filter==='chefs' ? 'flex' : 'none';
  renderCommFeed();
}

function renderCommChefsBanner(){
  const banner = document.getElementById('commChefsBanner');
  if(!banner||typeof TOP_CHEFS==='undefined')return;
  banner.innerHTML = TOP_CHEFS.map(chef=>`
    <div class="comm-chef-card">
      <img src="${chef.avatar}" alt="${chef.name}">
      <div class="comm-chef-card-name">${chef.name}</div>
      <div class="comm-chef-card-spec">${chef.specialty}</div>
      <div class="comm-chef-card-stats">${chef.followers} takipçi · ${chef.recipes} tarif</div>
      <button class="comm-chef-follow-btn">Takip Et</button>
    </div>
  `).join('');
}
