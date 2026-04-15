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

/* ═══ FAVORİLERİM SAYFASI (Hesabım > Favorilerim) ═══ */
let _favPageSub = 'tarif';

function openFavoritesPage() {
  var existing = document.getElementById('favoritesPageOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'favoritesPageOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';

  overlay.innerHTML = '<div class="prof-container">'
    + '<div class="prof-topbar">'
    + '<div class="btn-icon" onclick="closeFavoritesPage()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '<span class="prof-topbar-name">Favorilerim</span>'
    + '<div style="width:32px"></div>'
    + '</div>'
    + '<div id="favPageContent" style="flex:1;overflow-y:auto"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  renderFavoritesPageContent();
}

function closeFavoritesPage() {
  var el = document.getElementById('favoritesPageOverlay');
  if (el) el.remove();
}

/* Ana sayfadaki kalp ikonu eski çağrı uyumluluğu — Hesabım > Favorilerim ile aynı sayfayı açar */
function showFavorites() { openFavoritesPage(); }
window.showFavorites = showFavorites;
window.openFavoritesPage = openFavoritesPage;
window.closeFavoritesPage = closeFavoritesPage;

function renderFavoritesPageContent() {
  var container = document.getElementById('favPageContent');
  if (!container) return;
  var isTarif = _favPageSub === 'tarif';
  var activeStyle = 'background:#EF4444;color:#fff';
  var inactiveStyle = 'background:var(--bg-phone);color:var(--text-secondary)';

  var html = '<div style="display:flex;gap:8px;padding:14px 16px 10px">';
  html += '<div onclick="_setFavPageSub(\'tarif\')" style="padding:7px 18px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .2s;' + (isTarif ? activeStyle : inactiveStyle) + '">Tarifler</div>';
  html += '<div onclick="_setFavPageSub(\'restoran\')" style="padding:7px 18px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .2s;' + (!isTarif ? activeStyle : inactiveStyle) + '">Restoranlar</div>';
  html += '</div>';

  if (isTarif) {
    var idxs = USER_PROFILE.favoriteRecipes || [];
    if (!idxs.length) {
      html += '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><iconify-icon icon="solar:heart-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon><div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz favori tarif eklemediniz</div></div>';
    } else {
      html += '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px">';
      idxs.forEach(function(idx) {
        var item = menuItems[idx];
        if (!item) return;
        html += '<div onclick="closeFavoritesPage();showDetail(' + idx + ')" style="display:flex;gap:12px;padding:12px;background:var(--glass-card);border-radius:var(--r-xl);cursor:pointer">';
        html += '<img src="' + item.img + '" alt="" style="width:64px;height:64px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + item.name + '</div>';
        html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + (item.cookTime || '') + ' · ' + (item.difficulty || '') + '</div>';
        html += '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);margin-top:4px">' + item.price + ' ₺</div>';
        html += '</div>';
        html += '<div onclick="event.stopPropagation();removeFavorite(' + idx + ',\'tarif\')" style="align-self:center;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:heart-bold" style="font-size:20px;color:#EF4444"></iconify-icon></div>';
        html += '</div>';
      });
      html += '</div>';
    }
  } else {
    var idxs = USER_PROFILE.favoriteRestaurants || [];
    if (!idxs.length) {
      html += '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><iconify-icon icon="solar:shop-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon><div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz favori restoran eklemediniz</div></div>';
    } else {
      html += '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px">';
      idxs.forEach(function(idx) {
        var item = (typeof restaurantItems !== 'undefined') ? restaurantItems[idx] : null;
        if (!item) return;
        var rest = item.restaurant || {};
        html += '<div onclick="closeFavoritesPage();showDetail(' + idx + ',\'restoran\')" style="display:flex;gap:12px;padding:12px;background:var(--glass-card);border-radius:var(--r-xl);cursor:pointer">';
        html += '<img src="' + item.img + '" alt="" style="width:64px;height:64px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + item.name + '</div>';
        html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + (rest.name || '') + ' · ~' + (rest.deliveryTime || '') + '</div>';
        html += '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);margin-top:4px">₺' + item.price + '</div>';
        html += '</div>';
        html += '<div onclick="event.stopPropagation();removeFavorite(' + idx + ',\'restoran\')" style="align-self:center;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:heart-bold" style="font-size:20px;color:#EF4444"></iconify-icon></div>';
        html += '</div>';
      });
      html += '</div>';
    }
  }
  container.innerHTML = html;
}

function _setFavPageSub(sub) {
  _favPageSub = sub;
  renderFavoritesPageContent();
}

function removeFavorite(idx, type) {
  var key = type === 'restoran' ? 'favoriteRestaurants' : 'favoriteRecipes';
  var arr = USER_PROFILE[key] || [];
  var pos = arr.indexOf(idx);
  if (pos !== -1) arr.splice(pos, 1);
  renderFavoritesPageContent();
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

  const visible = USER_EMPLOYMENTS.filter(e => !e.transient);
  if (visible.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Henüz bir işletmeye bağlı değilsiniz</div>';
    return;
  }

  container.innerHTML = visible.map(emp => `
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

/* ═══ "BİR İŞLETMEDE ÇALIŞIYORUM" — EMPLOYEE LOGIN FLOW ═══
 * Settings → "Bir İşletmede Çalışıyorum" → modal asks for kullanıcı adı + şifre
 * (the credentials sent via SMS/E-posta when the owner/manager invited them).
 * If "Profilimi açık tut" is on, an entry is added to USER_EMPLOYMENTS so the
 * business is remembered under "Çalıştığım İşletmeler". After login, the app
 * switches to the business shell automatically.
 */
function openBizEmployeeLogin() {
  // Close settings panel if it is still open (visually cleaner)
  // (kept open intentionally so user can return after cancel)
  let modal = document.getElementById('bizEmployeeLoginModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'bizEmployeeLoginModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px 18px max(env(safe-area-inset-bottom),18px);max-height:92vh;overflow:auto;box-shadow:0 -8px 30px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:var(--r-lg);background:#06B6D415;display:flex;align-items:center;justify-content:center">
            <iconify-icon icon="solar:case-round-bold" style="font-size:20px;color:#06B6D4"></iconify-icon>
          </div>
          <div>
            <div style="font:var(--fw-semibold) var(--fs-lg)/1.1 var(--font);color:var(--text-primary)">İşletme Girişi</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:2px">SMS / e-posta ile gönderilen bilgilerle giriş yapın</div>
          </div>
        </div>
        <div class="btn-icon" onclick="document.getElementById('bizEmployeeLoginModal').remove()" style="width:32px;height:32px;flex-shrink:0">
          <iconify-icon icon="solar:close-circle-linear" style="font-size:18px"></iconify-icon>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Kullanıcı Adı</span>
          <input id="bizLoginUsername" type="text" autocomplete="off" placeholder="kullanici.adi" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none;font-family:monospace">
        </label>

        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Şifre</span>
          <input id="bizLoginPassword" type="password" autocomplete="off" placeholder="••••••••" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none;font-family:monospace">
        </label>

        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 4px">
          <input id="bizLoginRemember" type="checkbox" checked style="width:18px;height:18px;accent-color:var(--primary)">
          <span style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Profilimi açık tut</span>
          <span style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-left:auto">Çalıştığım İşletmeler'e kaydet</span>
        </label>

        <div id="bizLoginError" style="display:none;background:#EF444415;color:#EF4444;border-radius:var(--r-lg);padding:10px 12px;font:var(--fw-medium) var(--fs-xs)/1.3 var(--font)"></div>

        <div onclick="_bizSubmitEmployeeLogin()" style="margin-top:6px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          <iconify-icon icon="solar:login-3-bold" style="font-size:18px;color:#fff"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Giriş Yap</span>
        </div>

        <div style="font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-muted);text-align:center">
          Henüz davet almadınız mı? İşletme sahibinizden veya şube müdürünüzden personel daveti göndermesini isteyin.
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => { const f = document.getElementById('bizLoginUsername'); if (f) f.focus(); }, 60);
}

function _bizSubmitEmployeeLogin() {
  const u = (document.getElementById('bizLoginUsername').value || '').trim();
  const p = (document.getElementById('bizLoginPassword').value || '').trim();
  const remember = !!document.getElementById('bizLoginRemember').checked;
  const errEl = document.getElementById('bizLoginError');

  if (!u || !p) {
    errEl.textContent = 'Lütfen kullanıcı adı ve şifreyi giriniz.';
    errEl.style.display = '';
    return;
  }

  const inv = (typeof BIZ_INVITES !== 'undefined')
    ? BIZ_INVITES.find(i => i.username === u && i.password === p && i.status !== 'revoked')
    : null;

  if (!inv) {
    errEl.textContent = 'Kullanıcı adı veya şifre hatalı. Lütfen davet bilgilerini kontrol edin.';
    errEl.style.display = '';
    return;
  }

  // Mark invite accepted, mark linked staff active
  inv.status = 'accepted';
  if (typeof BIZ_STAFF !== 'undefined' && inv.staffId) {
    const st = BIZ_STAFF.find(s => s.id === inv.staffId);
    if (st) st.status = 'active';
  }

  // Build employment
  const roleColors = { owner:'#8B5CF6', manager:'#3B82F6', coordinator:'#A855F7', chef:'#F59E0B', waiter:'#10B981', cashier:'#EC4899', courier:'#F97316' };
  const employment = {
    id: 'emp_' + Date.now(),
    businessId: inv.businessId,
    businessName: inv.businessName,
    businessLogo: null,
    businessCuisine: '',
    branchId: inv.branchId,
    branchName: inv.branchName,
    role: inv.role,
    roleLabel: (typeof BIZ_ROLE_LABELS !== 'undefined' ? BIZ_ROLE_LABELS[inv.role] : inv.role) || inv.role,
    roleColor: roleColors[inv.role] || '#6B7280',
    status: 'active',
    assignedAt: new Date().toISOString().slice(0,10),
    isOwner: inv.role === 'owner',
    staffName: inv.name,
    staffId: inv.staffId || null
  };

  // Push to USER_EMPLOYMENTS so switchToBizAccount can resolve the id.
  // If "remember" is off, mark transient so we can hide it from the profile list.
  if (typeof USER_EMPLOYMENTS !== 'undefined') {
    const exists = USER_EMPLOYMENTS.find(e => e.businessId === employment.businessId && e.branchId === employment.branchId && e.role === employment.role && e.staffName === employment.staffName);
    if (exists) {
      employment.id = exists.id; // reuse so we don't duplicate the card
    } else {
      employment.transient = !remember;
      USER_EMPLOYMENTS.unshift(employment);
    }
    if (remember && typeof renderProfileEmployments === 'function') renderProfileEmployments();
  }

  // Close login + settings, switch to business
  const modal = document.getElementById('bizEmployeeLoginModal');
  if (modal) modal.remove();
  if (typeof closeSettingsPanel === 'function') closeSettingsPanel();

  if (typeof switchToBizAccount === 'function') {
    switchToBizAccount(employment.id);
  } else {
    alert('Giriş başarılı: ' + employment.businessName + ' / ' + employment.roleLabel);
  }
}

/* ═══════════════════════════════════════════════
 *  ALERJEN & İNTOLERANSLAR SAYFASI
 * ═══════════════════════════════════════════════ */

var ALLERGEN_LIST = [
  { id: 'gluten',     icon: 'solar:wheat-bold',            color: '#D97706', label: 'Gluten',                   desc: 'Buğday, arpa, çavdar, yulaf' },
  { id: 'laktoz',     icon: 'solar:cup-hot-bold',          color: '#3B82F6', label: 'Laktoz',                   desc: 'Süt ve süt ürünleri' },
  { id: 'fistik',     icon: 'solar:leaf-bold',             color: '#10B981', label: 'Fıstık / Yer Fıstığı',    desc: 'Yer fıstığı ve ürünleri' },
  { id: 'kabuklu',    icon: 'solar:leaf-bold',             color: '#8B5CF6', label: 'Sert Kabuklu Yemişler',    desc: 'Badem, ceviz, fındık, kaju' },
  { id: 'deniz',      icon: 'solar:swimming-bold',         color: '#06B6D4', label: 'Kabuklu Deniz Ürünleri',   desc: 'Karides, yengeç, istakoz, midye' },
  { id: 'yumurta',    icon: 'solar:donut-bold',            color: '#F59E0B', label: 'Yumurta',                  desc: 'Yumurta ve yumurta içeren ürünler' },
  { id: 'soya',       icon: 'solar:leaf-bold',             color: '#84CC16', label: 'Soya',                     desc: 'Soya fasulyesi ve türevleri' },
  { id: 'balık',      icon: 'solar:swimming-bold',         color: '#0EA5E9', label: 'Balık',                    desc: 'Tüm balık türleri' },
  { id: 'susam',      icon: 'solar:leaf-bold',             color: '#A3A3A3', label: 'Susam',                    desc: 'Susam tohumu ve yağı' },
  { id: 'kereviz',    icon: 'solar:leaf-bold',             color: '#22C55E', label: 'Kereviz',                  desc: 'Kereviz ve kereviz tozu' },
  { id: 'hardal',     icon: 'solar:fire-bold',             color: '#EAB308', label: 'Hardal',                   desc: 'Hardal tohumu ve sos' },
  { id: 'lupin',      icon: 'solar:leaf-bold',             color: '#A855F7', label: 'Lupin',                    desc: 'Lupin (baklagil) ürünleri' },
  { id: 'sulfit',     icon: 'solar:test-tube-bold',        color: '#EF4444', label: 'Sülfitler',                desc: 'Şarap, kuru meyve, sirke vb.' },
  { id: 'selenyum',   icon: 'solar:atom-bold',             color: '#F97316', label: 'Yumuşakçalar',             desc: 'Salyangoz, kalamar, ahtapot' }
];

function openAllergenPage() {
  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'allergenOverlay';
  overlay.style.display = 'flex';

  var userAllergens = USER_PROFILE.allergens || [];

  var html = '<div class="prof-container" style="background:var(--bg-page)">';
  /* Topbar */
  html += '<div class="prof-topbar">';
  html += '<div class="btn-icon" onclick="closeAllergenPage()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>';
  html += '<span class="prof-topbar-name">Alerjen & İntoleranslar</span>';
  html += '<div style="width:36px"></div>';
  html += '</div>';

  /* Info banner */
  html += '<div style="padding:0 16px">';
  html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:14px;background:#F59E0B12;border:1px solid #F59E0B25;border-radius:var(--r-xl);margin-bottom:16px">';
  html += '<iconify-icon icon="solar:info-circle-bold" style="font-size:20px;color:#F59E0B;flex-shrink:0;margin-top:1px"></iconify-icon>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">Seçtiğiniz alerjenler, tarif ve menü önerilerinde dikkate alınır. Alerjen içeren ürünler uyarı ile işaretlenir.</div>';
  html += '</div>';

  /* Allergen list */
  html += '<div style="display:flex;flex-direction:column;gap:6px" id="allergenListContainer">';

  ALLERGEN_LIST.forEach(function(a) {
    var active = userAllergens.indexOf(a.id) !== -1;
    html += '<div class="g-card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;border-radius:var(--r-lg);border:1.5px solid ' + (active ? 'var(--primary)' : 'transparent') + ';transition:border-color .2s" id="allergenRow_' + a.id + '">';
    html += '<div style="width:38px;height:38px;border-radius:50%;background:' + a.color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0">';
    html += '<iconify-icon icon="' + a.icon + '" style="font-size:18px;color:' + a.color + '"></iconify-icon></div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + a.label + '</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + a.desc + '</div>';
    html += '</div>';
    /* Toggle */
    html += '<div onclick="toggleAllergen(\'' + a.id + '\')" style="width:44px;height:24px;border-radius:12px;background:' + (active ? 'var(--primary)' : 'var(--border-subtle)') + ';position:relative;cursor:pointer;transition:background .2s;flex-shrink:0" id="allergenToggle_' + a.id + '">';
    html += '<div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;' + (active ? 'left:22px' : 'left:2px') + ';transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>';
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';

  /* Custom allergens section */
  html += '<div id="customAllergenSection" style="margin-top:18px">' + _renderCustomAllergensHtml() + '</div>';

  /* "Farklı Alerjim Var" button */
  html += '<div onclick="openCustomAllergenModal()" style="margin-top:14px;padding:14px;border-radius:var(--r-xl);border:1.5px dashed var(--border-subtle);background:transparent;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'var(--primary-soft)\'" onmouseout="this.style.borderColor=\'var(--border-subtle)\';this.style.background=\'transparent\'">';
  html += '<iconify-icon icon="solar:add-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--primary)">Farklı Alerjim Var</span>';
  html += '</div>';
  html += '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);text-align:center;margin-top:8px;padding:0 24px">Listede yer almayan nadir hassasiyetlerinizi manuel olarak ekleyin</div>';

  /* Active count */
  html += '<div style="text-align:center;padding:20px 0 24px;font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)" id="allergenActiveCount">' + _allergenTotalCount() + ' madde seçili</div>';
  html += '</div>';
  html += '</div>';

  overlay.innerHTML = html;
  document.getElementById('phone').appendChild(overlay);
}

/* ═══ CUSTOM ALLERGEN DATA ═══ */
function _ensureCustomAllergensArr() {
  if (!USER_PROFILE.customAllergens) USER_PROFILE.customAllergens = [];
  return USER_PROFILE.customAllergens;
}

function _allergenTotalCount() {
  var std = (USER_PROFILE.allergens || []).length;
  var cst = (USER_PROFILE.customAllergens || []).length;
  return std + cst;
}

var _CA_SEVERITY = [
  { id: 'low',      label: 'Düşük',           color: '#22C55E', desc: 'Hafif rahatsızlık' },
  { id: 'medium',   label: 'Orta',            color: '#F59E0B', desc: 'Belirgin semptomlar' },
  { id: 'high',     label: 'Yüksek',          color: '#EF4444', desc: 'Ciddi reaksiyon' },
  { id: 'critical', label: 'Hayati',          color: '#B91C1C', desc: 'Anafilaktik risk' }
];

function _renderCustomAllergensHtml() {
  var arr = USER_PROFILE.customAllergens || [];
  if (!arr.length) return '';

  var html = '';
  html += '<div style="display:flex;align-items:center;gap:8px;margin:0 4px 10px">';
  html += '<iconify-icon icon="solar:shield-user-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Kişisel Hassasiyetlerim</span>';
  html += '<span style="margin-left:auto;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);background:var(--bg-btn);padding:3px 8px;border-radius:var(--r-full)">' + arr.length + '</span>';
  html += '</div>';

  html += '<div style="display:flex;flex-direction:column;gap:6px">';
  arr.forEach(function(c, idx) {
    var sev = _CA_SEVERITY.find(function(s) { return s.id === c.severity; }) || _CA_SEVERITY[1];
    var typeLabel = c.type === 'alerji' ? 'Alerji' : 'İntolerans';
    var typeColor = c.type === 'alerji' ? '#EF4444' : '#8B5CF6';
    var typeIcon  = c.type === 'alerji' ? 'solar:danger-triangle-bold' : 'solar:info-circle-bold';

    html += '<div class="g-card" style="padding:14px;border-radius:var(--r-lg);border-left:4px solid ' + sev.color + ';display:flex;align-items:flex-start;gap:12px">';
    html += '<div style="width:38px;height:38px;border-radius:50%;background:' + typeColor + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0">';
    html += '<iconify-icon icon="' + typeIcon + '" style="font-size:18px;color:' + typeColor + '"></iconify-icon></div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">';
    html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _escHtmlCA(c.name) + '</span>';
    html += '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + typeColor + ';background:' + typeColor + '15;padding:3px 7px;border-radius:var(--r-full)">' + typeLabel + '</span>';
    html += '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#fff;background:' + sev.color + ';padding:3px 7px;border-radius:var(--r-full)">' + sev.label + '</span>';
    html += '</div>';
    if (c.note) {
      html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:6px">' + _escHtmlCA(c.note) + '</div>';
    }
    html += '</div>';
    html += '<div onclick="removeCustomAllergen(' + idx + ')" style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0" title="Sil"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _escHtmlCA(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function removeCustomAllergen(idx) {
  var arr = _ensureCustomAllergensArr();
  arr.splice(idx, 1);
  _refreshCustomAllergenSection();
  _updateAllergenSummary();
}

function _refreshCustomAllergenSection() {
  var section = document.getElementById('customAllergenSection');
  if (section) section.innerHTML = _renderCustomAllergensHtml();
  var countEl = document.getElementById('allergenActiveCount');
  if (countEl) countEl.textContent = _allergenTotalCount() + ' madde seçili';
}

/* ═══ CUSTOM ALLERGEN MODAL ═══ */
var _caDraft = { name: '', type: 'alerji', severity: 'medium', note: '' };

function openCustomAllergenModal() {
  _caDraft = { name: '', type: 'alerji', severity: 'medium', note: '' };

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'customAllergenOverlay';
  overlay.style.display = 'flex';
  overlay.style.zIndex = '200';

  overlay.innerHTML =
    '<div class="prof-container" style="background:var(--bg-page)">' +
      '<div class="prof-topbar">' +
        '<div class="btn-icon" onclick="closeCustomAllergenModal()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>' +
        '<span class="prof-topbar-name">Yeni Hassasiyet Ekle</span>' +
        '<div style="width:36px"></div>' +
      '</div>' +
      '<div id="caModalBody" style="padding:4px 16px 24px"></div>' +
    '</div>';

  document.getElementById('phone').appendChild(overlay);
  _caRenderModal();

  setTimeout(function() {
    var inp = document.getElementById('caNameInput');
    if (inp) inp.focus();
  }, 200);
}

function closeCustomAllergenModal() {
  var overlay = document.getElementById('customAllergenOverlay');
  if (overlay) overlay.remove();
}

function _caRenderModal() {
  var body = document.getElementById('caModalBody');
  if (!body) return;

  var sevIdx = _CA_SEVERITY.findIndex(function(s) { return s.id === _caDraft.severity; });
  if (sevIdx < 0) sevIdx = 1;
  var currentSev = _CA_SEVERITY[sevIdx];

  var html = '';

  /* Info banner */
  html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:#F59E0B12;border:1px solid #F59E0B25;border-radius:var(--r-xl);margin-bottom:20px">';
  html += '<iconify-icon icon="solar:info-circle-bold" style="font-size:18px;color:#F59E0B;flex-shrink:0;margin-top:1px"></iconify-icon>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">Listede yer almayan nadir veya spesifik bir hassasiyet ekleyin. Girdikleriniz tarif ve menü önerilerinizde dikkate alınacaktır.</div>';
  html += '</div>';

  /* 1. Madde Adı */
  html += '<div style="margin-bottom:20px">';
  html += '<label style="display:block;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Madde Adı <span style="color:var(--primary)">*</span></label>';
  html += '<input type="text" id="caNameInput" placeholder="Örn: Çilek, Kivi, Sarımsak" value="' + _escHtmlCA(_caDraft.name) + '" oninput="_caOnNameInput(this.value)" maxlength="40" ';
  html += 'style="width:100%;padding:14px 16px;border:1.5px solid var(--border-subtle);border-radius:var(--r-xl);background:var(--bg-phone);font:var(--fw-medium) var(--fs-md)/1.2 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box;transition:border-color .2s" onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border-subtle)\'">';
  html += '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:6px;text-align:right"><span id="caNameCount">' + _caDraft.name.length + '</span>/40</div>';
  html += '</div>';

  /* 2. Tür Seçimi */
  html += '<div style="margin-bottom:22px">';
  html += '<label style="display:block;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Tür</label>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  /* Alerji */
  var alerjiActive = _caDraft.type === 'alerji';
  html += '<div onclick="_caSetType(\'alerji\')" style="padding:14px;border-radius:var(--r-xl);border:2px solid ' + (alerjiActive ? '#EF4444' : 'var(--border-subtle)') + ';background:' + (alerjiActive ? '#EF444410' : 'var(--bg-phone)') + ';cursor:pointer;transition:all .2s;text-align:center">';
  html += '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:26px;color:#EF4444"></iconify-icon>';
  html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:' + (alerjiActive ? '#EF4444' : 'var(--text-primary)') + ';margin-top:6px">Alerji</div>';
  html += '<div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px">Bağışıklık reaksiyonu</div>';
  html += '</div>';
  /* İntolerans */
  var intAct = _caDraft.type === 'intolerans';
  html += '<div onclick="_caSetType(\'intolerans\')" style="padding:14px;border-radius:var(--r-xl);border:2px solid ' + (intAct ? '#8B5CF6' : 'var(--border-subtle)') + ';background:' + (intAct ? '#8B5CF610' : 'var(--bg-phone)') + ';cursor:pointer;transition:all .2s;text-align:center">';
  html += '<iconify-icon icon="solar:info-circle-bold" style="font-size:26px;color:#8B5CF6"></iconify-icon>';
  html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:' + (intAct ? '#8B5CF6' : 'var(--text-primary)') + ';margin-top:6px">İntolerans</div>';
  html += '<div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px">Sindirim güçlüğü</div>';
  html += '</div>';
  html += '</div>';
  if (alerjiActive) {
    html += '<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;background:#EF444410;border-radius:var(--r-lg)">';
    html += '<iconify-icon icon="solar:shield-warning-bold" style="font-size:14px;color:#EF4444"></iconify-icon>';
    html += '<span style="font:var(--fw-medium) 11px/1.3 var(--font);color:#EF4444">Alerji seçimi yüksek uyarı seviyesi etkinleştirir</span>';
    html += '</div>';
  }
  html += '</div>';

  /* 3. Kritiklik Seviyesi */
  html += '<div style="margin-bottom:22px">';
  html += '<label style="display:flex;align-items:center;justify-content:space-between;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:12px">';
  html += '<span>Kritiklik Seviyesi</span>';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:' + currentSev.color + '">' + currentSev.label + '</span>';
  html += '</label>';
  /* Step slider */
  html += '<div style="position:relative;padding:6px 0 0">';
  /* Track */
  html += '<div style="position:relative;height:6px;background:var(--bg-btn);border-radius:3px;margin:0 12px 14px">';
  /* Progress */
  var pct = (sevIdx / 3) * 100;
  html += '<div style="position:absolute;left:0;top:0;height:100%;width:' + pct + '%;background:linear-gradient(90deg,#22C55E 0%,#F59E0B 50%,#EF4444 80%,#B91C1C 100%);border-radius:3px;transition:width .25s"></div>';
  html += '</div>';
  /* Steps */
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
  _CA_SEVERITY.forEach(function(s, i) {
    var active = i === sevIdx;
    html += '<div onclick="_caSetSeverity(\'' + s.id + '\')" style="padding:10px 6px;border-radius:var(--r-lg);border:1.5px solid ' + (active ? s.color : 'var(--border-subtle)') + ';background:' + (active ? s.color + '12' : 'transparent') + ';cursor:pointer;transition:all .2s;text-align:center">';
    html += '<div style="width:10px;height:10px;border-radius:50%;background:' + s.color + ';margin:0 auto 6px;box-shadow:' + (active ? '0 0 0 3px ' + s.color + '30' : 'none') + '"></div>';
    html += '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:' + (active ? s.color : 'var(--text-primary)') + '">' + s.label + '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);text-align:center;margin-top:10px">' + currentSev.desc + '</div>';
  html += '</div>';
  html += '</div>';

  /* 4. Açıklama */
  html += '<div style="margin-bottom:24px">';
  html += '<label style="display:flex;align-items:center;justify-content:space-between;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:8px">';
  html += '<span>Açıklama</span>';
  html += '<span style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">Opsiyonel</span>';
  html += '</label>';
  html += '<textarea id="caNoteInput" placeholder="Örn: Eser miktarda bile olsa sorun yaratır" oninput="_caOnNoteInput(this.value)" maxlength="160" ';
  html += 'style="width:100%;min-height:80px;padding:14px 16px;border:1.5px solid var(--border-subtle);border-radius:var(--r-xl);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);outline:none;resize:none;box-sizing:border-box;font-family:var(--font);transition:border-color .2s" onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border-subtle)\'">' + _escHtmlCA(_caDraft.note) + '</textarea>';
  html += '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:6px;text-align:right"><span id="caNoteCount">' + _caDraft.note.length + '</span>/160</div>';
  html += '</div>';

  /* Submit button */
  var canSubmit = _caDraft.name.trim().length > 0;
  html += '<button onclick="_caSubmit()" ' + (canSubmit ? '' : 'disabled') + ' id="caSubmitBtn" ';
  html += 'style="width:100%;padding:16px;border:none;border-radius:var(--r-xl);background:' + (canSubmit ? 'var(--primary)' : 'var(--border-subtle)') + ';color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:' + (canSubmit ? 'pointer' : 'not-allowed') + ';transition:all .2s;box-shadow:' + (canSubmit ? '0 4px 12px rgba(246,80,19,0.25)' : 'none') + '">Kaydet</button>';

  body.innerHTML = html;
}

function _caOnNameInput(val) {
  _caDraft.name = val;
  var c = document.getElementById('caNameCount');
  if (c) c.textContent = val.length;
  /* Enable/disable submit without full re-render */
  var btn = document.getElementById('caSubmitBtn');
  if (btn) {
    var can = val.trim().length > 0;
    btn.disabled = !can;
    btn.style.background = can ? 'var(--primary)' : 'var(--border-subtle)';
    btn.style.cursor = can ? 'pointer' : 'not-allowed';
    btn.style.boxShadow = can ? '0 4px 12px rgba(246,80,19,0.25)' : 'none';
  }
}

function _caOnNoteInput(val) {
  _caDraft.note = val;
  var c = document.getElementById('caNoteCount');
  if (c) c.textContent = val.length;
}

function _caSetType(t) {
  _caDraft.type = t;
  _caRenderModal();
  /* Restore focus to name if needed */
  var inp = document.getElementById('caNameInput');
  if (inp && document.activeElement !== inp) {
    /* Don't auto-focus on type switch */
  }
}

function _caSetSeverity(s) {
  _caDraft.severity = s;
  _caRenderModal();
}

function _caSubmit() {
  var name = (_caDraft.name || '').trim();
  if (!name) return;

  var arr = _ensureCustomAllergensArr();
  arr.push({
    id: 'custom_' + Date.now(),
    name: name,
    type: _caDraft.type,
    severity: _caDraft.severity,
    note: (_caDraft.note || '').trim(),
    addedAt: Date.now()
  });

  closeCustomAllergenModal();
  _refreshCustomAllergenSection();
  _updateAllergenSummary();

  /* Toast */
  var msg = name + ' eklendi';
  if (typeof showToast === 'function') { showToast(msg); }
  else {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;transition:opacity .3s';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; }, 2000);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
  }
}

/* Window exports */
window.openCustomAllergenModal = openCustomAllergenModal;
window.closeCustomAllergenModal = closeCustomAllergenModal;
window.removeCustomAllergen = removeCustomAllergen;
window._caOnNameInput = _caOnNameInput;
window._caOnNoteInput = _caOnNoteInput;
window._caSetType = _caSetType;
window._caSetSeverity = _caSetSeverity;
window._caSubmit = _caSubmit;

function toggleAllergen(id) {
  if (!USER_PROFILE.allergens) USER_PROFILE.allergens = [];
  var arr = USER_PROFILE.allergens;
  var pos = arr.indexOf(id);
  if (pos !== -1) arr.splice(pos, 1); else arr.push(id);
  var active = pos === -1; // now active

  /* Update toggle */
  var toggle = document.getElementById('allergenToggle_' + id);
  if (toggle) {
    toggle.style.background = active ? 'var(--primary)' : 'var(--border-subtle)';
    toggle.firstChild.style.left = active ? '22px' : '2px';
  }

  /* Update row border */
  var row = document.getElementById('allergenRow_' + id);
  if (row) row.style.borderColor = active ? 'var(--primary)' : 'transparent';

  /* Update count */
  var countEl = document.getElementById('allergenActiveCount');
  if (countEl) countEl.textContent = arr.length + ' alerjen seçili';

  /* Update summary on profile page */
  _updateAllergenSummary();
}

function _updateAllergenSummary() {
  var el = document.getElementById('profAllergenSummary');
  if (!el) return;
  var arr = USER_PROFILE.allergens || [];
  var custom = USER_PROFILE.customAllergens || [];
  if (arr.length === 0 && custom.length === 0) { el.textContent = 'Belirtilmedi'; return; }
  var names = [];
  arr.forEach(function(id) {
    var found = ALLERGEN_LIST.find(function(a) { return a.id === id; });
    if (found) names.push(found.label);
  });
  custom.forEach(function(c) { if (c && c.name) names.push(c.name); });
  el.textContent = names.length <= 3 ? names.join(', ') : names.slice(0, 3).join(', ') + ' +' + (names.length - 3);
}

function closeAllergenPage() {
  var overlay = document.getElementById('allergenOverlay');
  if (overlay) overlay.remove();
  _updateAllergenSummary();
}

/* Sayfa yüklendiğinde özetleri güncelle */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(_updateAllergenSummary, 500);
  setTimeout(_updateMyRecipeCount, 500);
});

/* ═══════════════════════════════════════════════
 *  TARİFLERİM SAYFASI
 * ═══════════════════════════════════════════════ */

var _mrView = 'list'; // list | form
var _mrEditId = null;  // düzenleme modunda tarif id
var _mrForm = {};      // form state

function _updateMyRecipeCount() {
  var el = document.getElementById('profMyRecipeCount');
  if (!el) return;
  var count = (USER_PROFILE.myRecipes || []).length;
  el.textContent = count + ' tarif';
}

function openMyRecipesPage() {
  _mrView = 'list';
  _mrEditId = null;

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'myRecipesOverlay';
  overlay.style.display = 'flex';

  var html = '<div class="prof-container" style="background:var(--bg-page)">';
  html += '<div class="prof-topbar">';
  html += '<div class="btn-icon" onclick="closeMyRecipesPage()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>';
  html += '<span class="prof-topbar-name">Tariflerim</span>';
  html += '<div style="width:36px"></div>';
  html += '</div>';
  html += '<div id="mrContent" style="flex:1;overflow-y:auto;padding:0 16px 24px"></div>';
  html += '</div>';

  overlay.innerHTML = html;
  document.getElementById('phone').appendChild(overlay);
  _mrRenderList();
}

function closeMyRecipesPage() {
  var overlay = document.getElementById('myRecipesOverlay');
  if (overlay) overlay.remove();
  _updateMyRecipeCount();
}

/* ── Liste Görünümü ── */
function _mrRenderList() {
  var content = document.getElementById('mrContent');
  if (!content) return;
  var recipes = USER_PROFILE.myRecipes || [];

  var html = '';

  /* Tarif Oluştur butonu */
  html += '<div onclick="_mrOpenForm()" style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--primary);border-radius:var(--r-xl);cursor:pointer;margin-bottom:16px">';
  html += '<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">';
  html += '<iconify-icon icon="solar:add-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>';
  html += '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:#fff">Yeni Tarif Oluştur</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:rgba(255,255,255,.75);margin-top:2px">Kendi tarifini ekle</div></div>';
  html += '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:#fff"></iconify-icon>';
  html += '</div>';

  if (recipes.length === 0) {
    html += '<div style="text-align:center;padding:40px 0">';
    html += '<iconify-icon icon="solar:chef-hat-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon>';
    html += '<div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Henüz tarif eklemediniz</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px">İlk tarifinizi oluşturun!</div>';
    html += '</div>';
  } else {
    recipes.forEach(function(r) {
      html += '<div style="display:flex;gap:12px;padding:12px;background:var(--glass-card);border-radius:var(--r-xl);margin-bottom:8px;cursor:pointer;position:relative" onclick="_mrViewRecipe(' + r.id + ')">';
      html += '<img src="' + r.img + '" style="width:72px;height:72px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
      html += '<div style="flex:1;min-width:0">';
      html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + r.name + '</div>';
      html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + (r.category || '') + ' · ' + (r.difficulty || '') + '</div>';
      html += '<div style="display:flex;gap:10px;margin-top:6px">';
      html += '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:clock-circle-linear" style="font-size:12px"></iconify-icon>' + (r.prepTime || '') + '</span>';
      html += '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:fire-linear" style="font-size:12px"></iconify-icon>' + (r.cookTime || '') + '</span>';
      html += '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:users-group-rounded-linear" style="font-size:12px"></iconify-icon>' + (r.servings || 1) + ' kişi</span>';
      html += '</div></div>';
      /* Sil butonu */
      html += '<div onclick="event.stopPropagation();_mrDeleteRecipe(' + r.id + ')" style="position:absolute;top:12px;right:12px;cursor:pointer;color:var(--text-muted)"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:18px"></iconify-icon></div>';
      html += '</div>';
    });
  }

  content.innerHTML = html;
}

/* ── Tarif Detay (basit modal) ── */
function _mrViewRecipe(id) {
  var recipes = USER_PROFILE.myRecipes || [];
  var r = recipes.find(function(x) { return x.id === id; });
  if (!r) return;

  var content = document.getElementById('mrContent');
  if (!content) return;

  var html = '';
  html += '<div onclick="_mrRenderList()" style="display:inline-flex;align-items:center;gap:4px;padding:8px 0;cursor:pointer;color:var(--primary);font:var(--fw-medium) var(--fs-sm)/1 var(--font);margin-bottom:8px"><iconify-icon icon="solar:arrow-left-outline" style="font-size:16px"></iconify-icon>Geri</div>';
  html += '<img src="' + r.img + '" style="width:100%;height:180px;object-fit:cover;border-radius:var(--r-xl);margin-bottom:12px">';
  html += '<div style="font:var(--fw-bold) var(--fs-xl)/1.2 var(--font);color:var(--text-primary)">' + r.name + '</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);margin-top:6px">' + (r.desc || '') + '</div>';

  /* Meta bilgiler */
  html += '<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">';
  html += '<span style="padding:6px 12px;border-radius:var(--r-full);background:var(--glass-card);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">⏱ ' + (r.prepTime || '-') + ' hazırlık</span>';
  html += '<span style="padding:6px 12px;border-radius:var(--r-full);background:var(--glass-card);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">🔥 ' + (r.cookTime || '-') + ' pişirme</span>';
  html += '<span style="padding:6px 12px;border-radius:var(--r-full);background:var(--glass-card);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + (r.difficulty || '-') + '</span>';
  html += '<span style="padding:6px 12px;border-radius:var(--r-full);background:var(--glass-card);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + (r.servings || 1) + ' kişilik</span>';
  html += '</div>';

  /* Malzemeler */
  if (r.ingredients && r.ingredients.length > 0) {
    html += '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:20px;margin-bottom:8px">Malzemeler</div>';
    r.ingredients.forEach(function(ing) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-subtle)">';
      html += '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>';
      html += '<span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)">' + ing + '</span>';
      html += '</div>';
    });
  }

  /* Adımlar */
  if (r.steps && r.steps.length > 0) {
    html += '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:20px;margin-bottom:8px">Hazırlanışı</div>';
    r.steps.forEach(function(step, i) {
      html += '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">';
      html += '<div style="width:24px;height:24px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;font:var(--fw-bold) 11px/1 var(--font);color:#fff">' + (i + 1) + '</div>';
      html += '<span style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);flex:1">' + step + '</span>';
      html += '</div>';
    });
  }

  content.innerHTML = html;
}

/* ── Tarif Sil ── */
function _mrDeleteRecipe(id) {
  if (!USER_PROFILE.myRecipes) return;
  USER_PROFILE.myRecipes = USER_PROFILE.myRecipes.filter(function(r) { return r.id !== id; });
  _mrRenderList();
}

/* ── Tarif Oluştur Formu ── */
function _mrOpenForm() {
  _mrForm = {
    name: '', category: 'Ana Yemek', img: '', prepTime: '', cookTime: '',
    difficulty: 'Orta', servings: 2, desc: '',
    ingredients: [''], steps: ['']
  };
  _mrRenderForm();
}

function _mrRenderForm() {
  var content = document.getElementById('mrContent');
  if (!content) return;

  var f = _mrForm;
  var html = '';

  html += '<div onclick="_mrRenderList()" style="display:inline-flex;align-items:center;gap:4px;padding:8px 0;cursor:pointer;color:var(--primary);font:var(--fw-medium) var(--fs-sm)/1 var(--font);margin-bottom:8px"><iconify-icon icon="solar:arrow-left-outline" style="font-size:16px"></iconify-icon>Geri</div>';
  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:16px">Yeni Tarif Oluştur</div>';

  /* Tarif adı */
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Tarif Adı *</label>';
  html += '<input type="text" id="mrName" value="' + _escHtmlAttr(f.name) + '" placeholder="Ör: Ev Yapımı Lazanya" oninput="_mrForm.name=this.value" style="width:100%;padding:12px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box">';
  html += '</div>';

  /* Açıklama */
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Açıklama</label>';
  html += '<textarea id="mrDesc" placeholder="Tarifinizi kısaca tanımlayın..." oninput="_mrForm.desc=this.value" style="width:100%;padding:12px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);outline:none;resize:none;min-height:60px;box-sizing:border-box">' + _escHtmlAttr(f.desc) + '</textarea>';
  html += '</div>';

  /* Kategori + Zorluk */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">';
  var cats = ['Ana Yemek', 'Çorba', 'Salata', 'Tatlı', 'Aperatif', 'İçecek'];
  html += '<div><label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Kategori</label>';
  html += '<select onchange="_mrForm.category=this.value" style="width:100%;padding:12px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box">';
  cats.forEach(function(c) { html += '<option value="' + c + '"' + (f.category === c ? ' selected' : '') + '>' + c + '</option>'; });
  html += '</select></div>';

  var diffs = ['Kolay', 'Orta', 'Zor'];
  html += '<div><label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Zorluk</label>';
  html += '<select onchange="_mrForm.difficulty=this.value" style="width:100%;padding:12px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box">';
  diffs.forEach(function(d) { html += '<option value="' + d + '"' + (f.difficulty === d ? ' selected' : '') + '>' + d + '</option>'; });
  html += '</select></div></div>';

  /* Süreler + Kişi */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">';
  html += '<div><label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Hazırlık</label>';
  html += '<input type="text" value="' + _escHtmlAttr(f.prepTime) + '" placeholder="15dk" oninput="_mrForm.prepTime=this.value" style="width:100%;padding:12px 10px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box"></div>';

  html += '<div><label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Pişirme</label>';
  html += '<input type="text" value="' + _escHtmlAttr(f.cookTime) + '" placeholder="30dk" oninput="_mrForm.cookTime=this.value" style="width:100%;padding:12px 10px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box"></div>';

  html += '<div><label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Kişi</label>';
  html += '<input type="number" value="' + (f.servings || 2) + '" min="1" max="20" oninput="_mrForm.servings=parseInt(this.value)||1" style="width:100%;padding:12px 10px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box"></div>';
  html += '</div>';

  /* Malzemeler */
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Malzemeler</label>';
  f.ingredients.forEach(function(ing, i) {
    html += '<div style="display:flex;gap:6px;margin-bottom:6px">';
    html += '<input type="text" value="' + _escHtmlAttr(ing) + '" placeholder="Ör: Un 3 su bardağı" oninput="_mrForm.ingredients[' + i + ']=this.value" style="flex:1;padding:10px 12px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">';
    if (f.ingredients.length > 1) {
      html += '<div onclick="_mrRemoveIngredient(' + i + ')" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted)"><iconify-icon icon="solar:minus-circle-linear" style="font-size:18px"></iconify-icon></div>';
    }
    html += '</div>';
  });
  html += '<div onclick="_mrAddIngredient()" style="display:flex;align-items:center;gap:6px;padding:6px 0;color:var(--primary);cursor:pointer;font:var(--fw-medium) var(--fs-sm)/1 var(--font)"><iconify-icon icon="solar:add-circle-linear" style="font-size:18px"></iconify-icon>Malzeme Ekle</div>';
  html += '</div>';

  /* Adımlar */
  html += '<div style="margin-bottom:16px">';
  html += '<label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Hazırlanışı</label>';
  f.steps.forEach(function(step, i) {
    html += '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:flex-start">';
    html += '<div style="width:24px;height:24px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px;font:var(--fw-bold) 10px/1 var(--font);color:#fff">' + (i + 1) + '</div>';
    html += '<textarea placeholder="Adım ' + (i + 1) + '..." oninput="_mrForm.steps[' + i + ']=this.value" style="flex:1;padding:10px 12px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);outline:none;resize:none;min-height:44px">' + _escHtmlAttr(step) + '</textarea>';
    if (f.steps.length > 1) {
      html += '<div onclick="_mrRemoveStep(' + i + ')" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);margin-top:4px"><iconify-icon icon="solar:minus-circle-linear" style="font-size:18px"></iconify-icon></div>';
    }
    html += '</div>';
  });
  html += '<div onclick="_mrAddStep()" style="display:flex;align-items:center;gap:6px;padding:6px 0;color:var(--primary);cursor:pointer;font:var(--fw-medium) var(--fs-sm)/1 var(--font)"><iconify-icon icon="solar:add-circle-linear" style="font-size:18px"></iconify-icon>Adım Ekle</div>';
  html += '</div>';

  /* Kaydet butonu */
  html += '<button onclick="_mrSaveRecipe()" style="width:100%;padding:14px;border:none;border-radius:var(--r-xl);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;transition:opacity .15s">Tarifi Kaydet</button>';

  content.innerHTML = html;
}

function _escHtmlAttr(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _mrAddIngredient() { _mrForm.ingredients.push(''); _mrRenderForm(); }
function _mrRemoveIngredient(i) { _mrForm.ingredients.splice(i, 1); _mrRenderForm(); }
function _mrAddStep() { _mrForm.steps.push(''); _mrRenderForm(); }
function _mrRemoveStep(i) { _mrForm.steps.splice(i, 1); _mrRenderForm(); }

function _mrSaveRecipe() {
  if (!_mrForm.name.trim()) {
    if (typeof showToast === 'function') showToast('Tarif adı gerekli');
    else alert('Tarif adı gerekli');
    return;
  }

  if (!USER_PROFILE.myRecipes) USER_PROFILE.myRecipes = [];

  var dummyImgs = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop'
  ];

  var newRecipe = {
    id: Date.now(),
    name: _mrForm.name.trim(),
    category: _mrForm.category || 'Ana Yemek',
    img: dummyImgs[USER_PROFILE.myRecipes.length % dummyImgs.length],
    prepTime: _mrForm.prepTime || '',
    cookTime: _mrForm.cookTime || '',
    difficulty: _mrForm.difficulty || 'Orta',
    servings: _mrForm.servings || 2,
    desc: _mrForm.desc || '',
    ingredients: _mrForm.ingredients.filter(function(x) { return x.trim() !== ''; }),
    steps: _mrForm.steps.filter(function(x) { return x.trim() !== ''; }),
    date: new Date().toISOString().slice(0, 10)
  };

  USER_PROFILE.myRecipes.push(newRecipe);

  if (typeof showToast === 'function') showToast('Tarif kaydedildi!');
  _mrRenderList();
}
