/* ═══ MENU COMPONENT ═══ */

let recentlyVisitedTarif = [];
let recentlyVisitedRestoran = [];

function addToRecent(idx, source) {
  const list = source === 'restoran' ? recentlyVisitedRestoran : recentlyVisitedTarif;
  const existing = list.indexOf(idx);
  if (existing > -1) list.splice(existing, 1);
  list.unshift(idx);
  if (list.length > 8) list.pop();
}

function renderScrollCard(item, idx, source) {
  const allergen = (typeof _cardAllergenBadge === 'function') ? _cardAllergenBadge(item) : '';
  if (item.type === 'restoran' || source === 'restoran') {
    return `<div class="kesfet-item scroll-card" onclick="showDetail(${idx},'${source}')">
      <div class="img-wrap" style="position:relative">${allergen}<img src="${item.img}" alt="${item.name}"></div>
      <div class="ki-content">
        <div class="ki-title">${item.name}</div>
        <div class="ki-meta">
          <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating}</span></div>
          <span class="ki-dot">·</span>
          <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">~${item.restaurant.deliveryTime.replace(/(\d+)-(\d+)dk/,(_,a,b)=>b+'dk')}</span></div>
          <span class="ki-dot">·</span>
          <span class="ki-meta-text" style="font-weight:var(--fw-bold);color:var(--primary)">₺${item.price}</span>
        </div>
      </div>
    </div>`;
  }
  return `<div class="kesfet-item scroll-card" onclick="showDetail(${idx},'${source}')">
    <div class="img-wrap" style="position:relative">${allergen}<img src="${item.img}" alt="${item.name}"></div>
    <div class="ki-content">
      <div class="ki-title">${item.name}</div>
      <div class="ki-meta">
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating}</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">${item.cookTime}</span></div>
      </div>
    </div>
  </div>`;
}

function renderSection(title, items, indices, source, opts) {
  if (!items.length) return '';
  const badge = opts && opts.badge ? `<span class="section-badge"><iconify-icon icon="solar:crown-bold" style="font-size:10px"></iconify-icon> ${opts.badge}</span>` : '';
  return `<div class="home-section">
    <div class="home-section-header">
      <span class="home-section-title">${title}${badge}</span>
      <div class="home-section-link"><i class="ti ti-arrow-narrow-right" style="font-size:18px;color:var(--text-primary)"></i></div>
    </div>
    <div class="home-scroll">${items.map((item, i) => renderScrollCard(item, indices[i], source)).join('')}</div>
  </div>`;
}

function renderCTACard(type) {
  if (type === 'premium') {
    return `<div class="cta-card cta-premium" onclick="switchTab('profile')">
      <img class="cta-img" src="assets/premium_left.png" alt="Premium">
      <div class="cta-content">
        <div class="cta-title">Premium'a Geç</div>
        <div class="cta-desc">Reklamsız deneyim, özel tarifler ve ücretsiz teslimat ayrıcalıkları</div>
      </div>
    </div>`;
  }
  if (type === 'ai') {
    return `<div class="cta-card cta-ai" onclick="switchTab('ai')">
      <img class="cta-img" src="assets/ai_chef_left.png" alt="AI Chef">
      <div class="cta-content">
        <div class="cta-title">AI'ya Sor</div>
        <div class="cta-desc">Ne yiyeceğine karar veremedin mi? AI asistan sana özel öneriler sunsun</div>
      </div>
    </div>`;
  }
  return '';
}

function renderSections(container, allItems, source, recentList, sectionsConfig) {
  let html = '';
  const all = allItems.map((item, idx) => ({ item, idx }));

  sectionsConfig.forEach(sec => {
    if (sec.type === 'cta') {
      html += renderCTACard(sec.cta);
      return;
    }

    if (sec.type === 'recent') {
      if (recentList.length > 0) {
        const recentItems = recentList.map(idx => allItems[idx]).filter(Boolean);
        html += renderSection(sec.title, recentItems, recentList, source, { icon: sec.icon });
      }
      return;
    }

    if (sec.type === 'newest') {
      const newest = all.slice(-1 * (sec.limit || 5)).reverse();
      html += renderSection(sec.title, newest.map(s => s.item), newest.map(s => s.idx), source, { icon: sec.icon });
      return;
    }

    if (sec.type === 'filter') {
      let filtered = sec.filter ? all.filter(s => sec.filter(s.item)) : [...all];
      if (sec.sort === 'rating') filtered.sort((a, b) => parseFloat(b.item.rating) - parseFloat(a.item.rating));
      filtered = filtered.slice(0, sec.limit || 6);
      if (filtered.length > 0) {
        html += renderSection(sec.title, filtered.map(s => s.item), filtered.map(s => s.idx), source, { icon: sec.icon, badge: sec.badge });
      }
    }
  });

  container.innerHTML = html;
}

function renderMenu(){
  renderSections(document.getElementById('tabTarifler'), menuItems, 'menu', recentlyVisitedTarif, TARIF_SECTIONS);
}

function _cardAllergenBadge(item){
  if(typeof _getMatchingAllergens!=='function') return '';
  var m=_getMatchingAllergens(item);
  if(!m.length) return '';
  return '<div style="position:absolute;top:8px;left:8px;background:rgba(225,29,72,0.55);color:var(--text-primary);padding:3px 8px;border:1px solid var(--border-danger);border-radius:12px;display:flex;align-items:center;gap:4px;z-index:2;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)"><iconify-icon icon="solar:shield-warning-bold" style="font-size:12px;color:var(--text-primary)"></iconify-icon><span style="font:var(--fw-bold) 9px/1 var(--font);color:var(--text-primary)">Alerjen</span></div>';
}

function renderMenuCard(item,idx){
  return `<div class="kesfet-item" onclick="showDetail(${idx})" style="cursor:pointer">
    <div class="img-wrap" style="position:relative">${_cardAllergenBadge(item)}<img src="${item.img}" alt="${item.name}"></div>
    <div class="ki-content">
      <div class="ki-title">${item.name}</div>
      <div class="ki-meta">
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating} (${item.reviews})</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:book-bookmark-linear"></iconify-icon><span class="ki-meta-text">${item.bookmarks}</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">${item.cookTime}</span></div>
      </div>
    </div>
  </div>`;
}

function renderRestCard(item,idx){
  return `<div class="kesfet-item" onclick="showDetail(${idx},'restoran')" style="cursor:pointer">
    <div class="img-wrap" style="position:relative">${_cardAllergenBadge(item)}<img src="${item.img}" alt="${item.name}"></div>
    <div class="ki-content">
      <div class="ki-title">${item.name}</div>
      <div class="ki-meta">
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating} (${item.reviews})</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">~${item.restaurant.deliveryTime.replace(/(\d+)-(\d+)dk/,(_,a,b)=>b+'dk')}</span></div>
        <span class="ki-dot">·</span>
        <span class="ki-meta-text" style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${item.price}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:0 8px">
      <img src="${item.author?item.author.avatar:''}" alt="${item.restaurant.name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--border-subtle);flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.restaurant.name}</div>
        <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-tertiary);margin-top:1px">${item.restaurant.address||''} · ★ ${item.restaurant.rating}</div>
      </div>
      <div onclick="event.stopPropagation()" style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
        <iconify-icon icon="solar:add-circle-linear" style="font-size:16px;color:#fff"></iconify-icon>
      </div>
    </div>
  </div>`;
}

function renderRestoranlar(){
  renderSections(document.getElementById('tabRestoranlar'), restaurantItems, 'restoran', recentlyVisitedRestoran, RESTORAN_SECTIONS);
}

function renderKesfetItem(item,idx){
  const isRestoran = item.type === 'restoran';
  const orderBtn = isRestoran ? `<div style="padding:6px 8px 0"><button class="btn-primary" style="width:100%;padding:10px;font-size:var(--fs-sm);display:flex;align-items:center;justify-content:center" onclick="event.stopPropagation();showDetail(${idx},'kesfet')">Sipariş Ver</button></div>` : '';
  const metaContent = isRestoran
    ? `<div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating} (${item.reviews})</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">~${item.restaurant.deliveryTime.replace(/(\d+)-(\d+)dk/,(_,a,b)=>b+'dk')}</span></div>
        <span class="ki-dot">·</span>
        <span class="ki-meta-text" style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${item.price}</span>`
    : `<div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:star-linear"></iconify-icon><span class="ki-meta-text">${item.rating} (${item.reviews})</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:book-bookmark-linear"></iconify-icon><span class="ki-meta-text">${item.bookmarks}</span></div>
        <span class="ki-dot">·</span>
        <div class="ki-meta-group"><iconify-icon class="ki-meta-icon" icon="solar:alarm-linear"></iconify-icon><span class="ki-meta-text">${item.cookTime}</span></div>`;
  return `<div class="kesfet-item" onclick="showDetail(${idx},'kesfet')" style="${isRestoran?'padding-bottom:10px':''};cursor:pointer">
    <div class="img-wrap" style="position:relative">${_cardAllergenBadge(item)}<img src="${item.img}" alt="${item.name}"></div>
    <div class="ki-content">
      <div class="ki-title">${item.name}</div>
      <div class="ki-meta">${metaContent}</div>
    </div>
    ${orderBtn}
  </div>`;
}

function renderKesfet(){
  const col0=document.getElementById('kesfetCol0');
  const col1=document.getElementById('kesfetCol1');
  col0.innerHTML='';col1.innerHTML='';
  kesfetItems.forEach((item,i)=>{
    (i%2===0?col0:col1).innerHTML+=renderKesfetItem(item,i);
  });
}
