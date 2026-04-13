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
