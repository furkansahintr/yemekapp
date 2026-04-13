/* ═══ PROFILE COMPONENT ═══ */

let profActiveTab = 'posts';

function setProfTab(tab) {
  profActiveTab = tab;
  document.querySelectorAll('.prof-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-proftab') === tab);
  });
  const container = document.getElementById('profTabContent');
  if (!container) return;
  if (tab === 'posts') renderProfPosts(container);
  else if (tab === 'recipes') renderProfRecipes(container);
  else if (tab === 'liked') renderProfLiked(container);
}

function renderProfPosts(container) {
  const posts = USER_PROFILE.myPosts;
  if (!posts || !posts.length) {
    container.innerHTML = '<div class="prof-empty"><iconify-icon icon="solar:gallery-linear"></iconify-icon><span>Henüz paylaşım yok</span></div>';
    return;
  }
  let html = '<div class="prof-grid">';
  posts.forEach(p => {
    html += '<div class="prof-grid-item">';
    html += '<img src="' + p.img + '" alt="" loading="lazy">';
    html += '<div class="prof-grid-item-overlay"><span class="prof-grid-item-stat"><iconify-icon icon="solar:heart-bold" style="font-size:14px"></iconify-icon> ' + p.likes + '</span></div>';
    if (p.type === 'recipe') html += '<span class="prof-type-badge">Tarif</span>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderProfRecipes(container) {
  const indexes = USER_PROFILE.savedRecipes;
  if (!indexes || !indexes.length) {
    container.innerHTML = '<div class="prof-empty"><iconify-icon icon="solar:book-bookmark-linear"></iconify-icon><span>Kayıtlı tarif yok</span></div>';
    return;
  }
  let html = '<div class="prof-recipe-list">';
  indexes.forEach(idx => {
    const item = menuItems[idx];
    if (!item) return;
    html += '<div class="prof-recipe-card" onclick="showDetail(' + idx + ')">';
    html += '<img src="' + item.img + '" alt="' + item.name + '">';
    html += '<div class="prof-recipe-card-info">';
    html += '<div class="prof-recipe-card-name">' + item.name + '</div>';
    html += '<div class="prof-recipe-card-meta"><span>' + (item.cookTime || '') + '</span><span>' + (item.cal || '') + '</span></div>';
    html += '</div>';
    html += '<div class="prof-recipe-card-price">' + item.price + ' ₺</div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderProfLiked(container) {
  const ids = USER_PROFILE.likedPosts;
  if (!ids || !ids.length) {
    container.innerHTML = '<div class="prof-empty"><iconify-icon icon="solar:heart-linear"></iconify-icon><span>Beğenilen gönderi yok</span></div>';
    return;
  }
  let html = '<div class="prof-liked-list">';
  ids.forEach(id => {
    const post = COMMUNITY_FEED.find(p => p.id === id);
    if (!post) return;
    html += '<div class="prof-liked-card">';
    if (post.img) html += '<img src="' + post.img + '" alt="">';
    html += '<div class="prof-liked-card-body">';
    html += '<div class="prof-liked-card-user">' + post.user.name + '</div>';
    html += '<div class="prof-liked-card-text">' + post.text + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function openProfOverlay() {
  const el = document.getElementById('profOverlay');
  if (el) { el.classList.add('open'); el.style.display = 'flex'; }
  initProfile();
}

function closeProfOverlay() {
  const el = document.getElementById('profOverlay');
  if (el) { el.classList.remove('open'); el.style.display = 'none'; }
}

function initProfile() {
  profActiveTab = 'posts';
  document.querySelectorAll('.prof-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-proftab') === 'posts');
  });
  const container = document.getElementById('profTabContent');
  if (container) renderProfPosts(container);
}

function renderProfileEmployments() {
  const container = document.getElementById('profEmployments');
  if (!container || typeof USER_EMPLOYMENTS === 'undefined') return;

  if (USER_EMPLOYMENTS.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Henüz bir işletmeye bağlı değilsiniz</div>';
    return;
  }

  container.innerHTML = USER_EMPLOYMENTS.map(emp => `
    <div class="g-card" style="padding:14px;border-radius:var(--r-xl);display:flex;align-items:center;gap:12px">
      <div style="width:44px;height:44px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <iconify-icon icon="${emp.isOwner ? 'solar:shop-bold' : 'solar:buildings-2-bold'}" style="font-size:22px;color:${emp.roleColor}"></iconify-icon>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(emp.businessName)}</div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(emp.branchName)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
          <span style="font:var(--fw-medium) 10px/1 var(--font);color:${emp.roleColor};background:${emp.roleColor}12;padding:2px 8px;border-radius:var(--r-full)">${escHtml(emp.roleLabel)}</span>
          ${emp.status === 'active' ? '<span style="font:var(--fw-medium) 9px/1 var(--font);color:#22c55e">● Aktif</span>' : '<span style="font:var(--fw-medium) 9px/1 var(--font);color:var(--text-muted)">● Pasif</span>'}
        </div>
      </div>
      <div onclick="switchToBizAccount('${emp.id}')" style="display:flex;align-items:center;gap:4px;padding:8px 14px;border-radius:var(--r-full);background:var(--primary);cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff">Geçiş</span>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:#fff"></iconify-icon>
      </div>
    </div>
  `).join('');
}

function openSettingsPanel() {
  const el = document.getElementById('settingsOverlay');
  if (el) { el.classList.add('open'); el.style.display = 'flex'; }
}

function closeSettingsPanel() {
  const el = document.getElementById('settingsOverlay');
  if (el) { el.classList.remove('open'); el.style.display = 'none'; }
}

function openBMICalculator() {
  const el = document.getElementById('bmiOverlay');
  if (el) { el.classList.add('open'); el.style.display = 'flex'; }
  const res = document.getElementById('bmiResult');
  if (res) res.style.display = 'none';
}

function closeBMICalculator() {
  const el = document.getElementById('bmiOverlay');
  if (el) { el.classList.remove('open'); el.style.display = 'none'; }
}

function adjBMI(field, delta) {
  let input;
  if (field === 'height') input = document.getElementById('bmiHeight');
  else if (field === 'weight') input = document.getElementById('bmiWeight');
  else input = document.getElementById('bmiAge');
  if (!input) return;
  let val = parseInt(input.value) || 0;
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
}

function calculateBMI() {
  const h = parseFloat(document.getElementById('bmiHeight').value) / 100;
  const w = parseFloat(document.getElementById('bmiWeight').value);
  if (!h || !w || h <= 0) return;
  const bmi = w / (h * h);
  const bmiRounded = Math.round(bmi * 10) / 10;

  let label, color, info;
  if (bmi < 18.5) {
    label = 'Zayıf'; color = '#3B82F6';
    info = 'Vücut kitle endeksiniz normalin altında. Dengeli beslenmeye dikkat edin.';
  } else if (bmi < 25) {
    label = 'Normal'; color = '#10B981';
    info = 'Tebrikler! Vücut kitle endeksiniz ideal aralıkta.';
  } else if (bmi < 30) {
    label = 'Kilolu'; color = '#F59E0B';
    info = 'Vücut kitle endeksiniz normalin üstünde. Beslenme ve egzersiz programı önerilir.';
  } else {
    label = 'Obez'; color = '#EF4444';
    info = 'Vücut kitle endeksiniz obez aralığında. Bir uzmanla görüşmenizi öneririz.';
  }

  document.getElementById('bmiValue').textContent = bmiRounded;
  document.getElementById('bmiValue').style.color = color;
  document.getElementById('bmiLabel').textContent = label;
  document.getElementById('bmiLabel').style.background = color + '18';
  document.getElementById('bmiLabel').style.color = color;
  document.getElementById('bmiInfo').textContent = info;

  const pct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
  document.getElementById('bmiGaugeMarker').style.left = pct + '%';

  const res = document.getElementById('bmiResult');
  if (res) res.style.display = 'flex';
}

function bmiAskAI() {
  closeBMICalculator();
  closeSettingsPanel();
  const h = document.getElementById('bmiHeight').value;
  const w = document.getElementById('bmiWeight').value;
  switchTab('ai');
  setTimeout(function() {
    const input = document.getElementById('aiChatInput');
    if (input) {
      input.value = 'BMI sonucuma göre sağlıklı diyet önerisi ver. Boy: ' + h + 'cm, Kilo: ' + w + 'kg';
      aiSend();
    }
  }, 400);
}

function openOrderHistory() {
  const el = document.getElementById('orderHistoryOverlay');
  if (el) { el.classList.add('open'); el.style.display = 'flex'; }
  renderOrderHistory();
}

function closeOrderHistory() {
  const el = document.getElementById('orderHistoryOverlay');
  if (el) { el.classList.remove('open'); el.style.display = 'none'; }
}

function renderOrderHistory() {
  const container = document.getElementById('orderHistoryList');
  if (!container) return;
  const orders = USER_PROFILE.orders;
  if (!orders || !orders.length) {
    container.innerHTML = '<div class="prof-empty"><iconify-icon icon="solar:bag-check-linear"></iconify-icon><span>Henüz sipariş yok</span></div>';
    return;
  }
  let html = '';
  orders.forEach(o => {
    const isCancelled = o.status === 'İptal';
    const statusClass = isCancelled ? 'cancelled' : 'delivered';
    const iconBg = isCancelled ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)';
    const iconColor = isCancelled ? '#EF4444' : '#10B981';
    const icon = isCancelled ? 'solar:close-circle-bold' : 'solar:bag-check-bold';
    html += '<div class="order-item">';
    html += '<div class="order-item-icon" style="background:' + iconBg + '"><iconify-icon icon="' + icon + '" style="font-size:22px;color:' + iconColor + '"></iconify-icon></div>';
    html += '<div class="order-item-info"><div class="order-item-title">' + o.name + '</div><div class="order-item-meta">' + o.id + ' · ' + o.date + '</div></div>';
    html += '<div class="order-item-right"><div class="order-item-price">' + o.price + ' ₺</div><span class="order-item-status ' + statusClass + '">' + o.status + '</span></div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function openProfileEdit(){
  document.getElementById('profileEditOverlay').classList.add('open');
}

function closeProfileEdit(){
  document.getElementById('profileEditOverlay').classList.remove('open');
}

function saveProfile(){
  closeProfileEdit();
}
