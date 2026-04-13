/* ═══ AI ASSISTANT COMPONENT ═══ */

let aiChatHistory = [];
let aiActionMenuOpen = false;
let aiHasStarted = false;

const aiInput = document.getElementById('aiChatInput');
if (aiInput) {
  aiInput.addEventListener('input', function () {
    const btn = document.getElementById('aiSendBtn');
    if (this.value.trim()) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function aiSend() {
  const input = document.getElementById('aiChatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  document.getElementById('aiSendBtn').classList.remove('active');
  aiAddUserMsg(text);
  aiProcessMessage(text);
}

function aiSendQuick(text) {
  aiAddUserMsg(text);
  aiProcessMessage(text);
}

function aiAddUserMsg(text) {
  if (!aiHasStarted) {
    aiHasStarted = true;
    document.getElementById('aiWelcome').style.display = 'none';
    document.getElementById('aiInputChips').style.display = 'flex';
  }
  const now = new Date();
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const el = document.createElement('div');
  el.className = 'ai-msg user';
  el.innerHTML = '<div><div class="ai-msg-bubble">' + escHtml(text) + '</div><div class="ai-msg-time">' + time + '</div></div>';
  document.getElementById('aiChatMessages').appendChild(el);
  aiScrollBottom();
  aiChatHistory.push({ role: 'user', text: text });
}

function aiAddBotMsg(html) {
  const now = new Date();
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const el = document.createElement('div');
  el.className = 'ai-msg bot';
  el.innerHTML = '<div class="ai-msg-avatar"><iconify-icon icon="solar:chef-hat-bold" style="font-size:14px;color:#fff"></iconify-icon></div><div><div class="ai-msg-bubble">' + html + '</div><div class="ai-msg-time">' + time + '</div></div>';
  document.getElementById('aiChatMessages').appendChild(el);
  aiScrollBottom();
  aiChatHistory.push({ role: 'bot', text: html });
}

function aiShowTyping() {
  const el = document.createElement('div');
  el.className = 'ai-typing';
  el.id = 'aiTypingIndicator';
  el.innerHTML = '<div class="ai-msg-avatar"><iconify-icon icon="solar:chef-hat-bold" style="font-size:14px;color:#fff"></iconify-icon></div><div class="ai-typing-dots"><span></span><span></span><span></span></div>';
  document.getElementById('aiChatMessages').appendChild(el);
  aiScrollBottom();
}

function aiHideTyping() {
  const el = document.getElementById('aiTypingIndicator');
  if (el) el.remove();
}

function aiScrollBottom() {
  const c = document.getElementById('aiChatMessages');
  setTimeout(() => { c.scrollTop = c.scrollHeight; }, 50);
}

function aiProcessMessage(text) {
  aiShowTyping();
  const lower = text.toLowerCase();
  let delay = 1200 + Math.random() * 800;

  setTimeout(() => {
    aiHideTyping();

    if (lower.includes('haftalık plan') || lower.includes('7 günlük') || lower.includes('weekly')) {
      aiRespondWeeklyPlan();
    } else if (lower.includes('malzeme') || lower.includes('buzdolabı') || lower.includes('elimde')) {
      aiRespondIngredients();
    } else if (lower.includes('kişiselleştir') || lower.includes('diyet') || lower.includes('alerjen') || lower.includes('filtre')) {
      aiRespondPersonalize();
    } else if (lower.includes('şaşırt') || lower.includes('rastgele') || lower.includes('sürpriz')) {
      aiRespondSurprise();
    } else if (lower.includes('paylaş') || lower.includes('post')) {
      aiAddBotMsg('Tarif topluluk sayfasında paylaşıma hazırlandı! Profilinden görebilirsin.');
    } else if (lower.includes('plana ekle') || lower.includes('plan')) {
      aiAddBotMsg('Tarif bu haftanın menü planına eklendi! Haftalık planını görmek ister misin?');
    } else if (lower.includes('başka') || lower.includes('another')) {
      aiRespondSurprise();
    } else if (lower.includes('düşük kalori') || lower.includes('az kalori') || lower.includes('hafif') || lower.includes('sağlıklı')) {
      aiRespondLowCal();
    } else if (lower.includes('tatlı') || lower.includes('dessert')) {
      aiRespondDessert();
    } else if (lower.includes('15 dakika') || lower.includes('15dk') || lower.includes('hızlı') || lower.includes('kolay')) {
      aiRespondQuick();
    } else if (lower.includes('vejetaryen') || lower.includes('vegan')) {
      aiRespondVegetarian();
    } else if (lower.includes('ne yesem') || lower.includes('öner') || lower.includes('yemek')) {
      aiRespondGeneral();
    } else {
      aiRespondGeneral();
    }
  }, delay);
}

function aiRespondGeneral() {
  const recipes = menuItems.filter(m => m.type === 'tarif');
  const pick = recipes[Math.floor(Math.random() * recipes.length)];
  const idx = menuItems.indexOf(pick);
  aiAddBotMsg('Bugün sana <strong>' + pick.name + '</strong> öneriyorum! ' + pick.difficulty + ' zorlukta ve ' + pick.cookTime + ' pişirme süresiyle harika bir seçim.');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiRespondLowCal() {
  const recipes = menuItems.filter(m => m.type === 'tarif' && m.nutrition && m.nutrition.kalori < 250);
  const pick = recipes.length ? recipes[Math.floor(Math.random() * recipes.length)] : menuItems[4];
  const idx = menuItems.indexOf(pick);
  aiAddBotMsg('Düşük kalorili önerim: <strong>' + pick.name + '</strong> — sadece ' + pick.nutrition.kalori + ' kcal! Lif ve protein açısından da oldukça zengin.');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiRespondDessert() {
  const desserts = menuItems.filter(m => m.category === 'Tatlı');
  const pick = desserts[Math.floor(Math.random() * desserts.length)];
  const idx = menuItems.indexOf(pick);
  aiAddBotMsg('Tatlı önerim: <strong>' + pick.name + '</strong>! ' + pick.desc.substring(0, 80) + '...');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiRespondQuick() {
  const quick = menuItems.filter(m => m.type === 'tarif' && parseInt(m.cookTime) <= 15);
  const pick = quick.length ? quick[Math.floor(Math.random() * quick.length)] : menuItems[6];
  const idx = menuItems.indexOf(pick);
  aiAddBotMsg('Hızlıca hazırlayabileceğin bir tarif: <strong>' + pick.name + '</strong> — toplam ' + pick.prepTime + ' hazırlık + ' + pick.cookTime + ' pişirme!');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiRespondVegetarian() {
  const veg = menuItems.filter(m => ['Salata', 'Çorba', 'Tatlı'].includes(m.category));
  const pick = veg[Math.floor(Math.random() * veg.length)];
  const idx = menuItems.indexOf(pick);
  aiAddBotMsg('Vejetaryen dostu önerim: <strong>' + pick.name + '</strong>. Et içermiyor ve oldukça besleyici!');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiRespondSurprise() {
  const recipes = menuItems.filter(m => m.type === 'tarif');
  const pick = recipes[Math.floor(Math.random() * recipes.length)];
  const idx = menuItems.indexOf(pick);
  const emojis = ['🎲', '🎰', '✨', '🎯', '🎪'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  aiAddBotMsg(emoji + ' Sürpriz tarif: <strong>' + pick.name + '</strong>! ' + pick.category + ' kategorisinden, zorluk: ' + pick.difficulty + '. Denemeni tavsiye ederim!');
  setTimeout(() => aiAddRecipeCard(pick, idx), 400);
}

function aiAddRecipeCard(item, idx) {
  const el = document.createElement('div');
  el.className = 'ai-msg bot';
  el.innerHTML = `
    <div class="ai-msg-avatar"><iconify-icon icon="solar:chef-hat-bold" style="font-size:14px;color:#fff"></iconify-icon></div>
    <div>
      <div class="ai-recipe-card">
        <img class="ai-recipe-card-img" src="${item.img}" alt="${item.name}">
        <div class="ai-recipe-card-body">
          <div class="ai-recipe-card-name">${item.name}</div>
          <div class="ai-recipe-card-meta">
            <span class="ai-recipe-card-tag"><iconify-icon icon="solar:clock-circle-linear"></iconify-icon>${item.cookTime}</span>
            <span class="ai-recipe-card-tag"><iconify-icon icon="solar:fire-linear"></iconify-icon>${item.nutrition ? item.nutrition.kalori + ' kcal' : ''}</span>
            <span class="ai-recipe-card-tag"><iconify-icon icon="solar:chef-hat-linear"></iconify-icon>${item.difficulty}</span>
          </div>
          <div class="ai-recipe-card-desc">${item.desc}</div>
          <div class="ai-recipe-card-actions">
            <button class="ai-recipe-card-btn primary" onclick="aiRecipeAction('start',${idx})">
              <iconify-icon icon="solar:play-circle-bold"></iconify-icon> Tarife Başla
            </button>
            <button class="ai-recipe-card-btn secondary" onclick="aiRecipeAction('plan',${idx})">
              <iconify-icon icon="solar:calendar-add-linear"></iconify-icon> Plana Ekle
            </button>
            <button class="ai-recipe-card-btn ghost" onclick="aiRecipeAction('share',${idx})">
              <iconify-icon icon="solar:share-linear"></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById('aiChatMessages').appendChild(el);
  aiScrollBottom();
}

function aiRespondWeeklyPlan() {
  aiAddBotMsg('Senin için kişiselleştirilmiş bir haftalık plan hazırladım! İşte dengeli ve lezzetli menün:');

  setTimeout(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const recipes = menuItems.filter(m => m.type === 'tarif');
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);

    const el = document.createElement('div');
    el.className = 'ai-msg bot';
    let daysHtml = days.map((d, i) => {
      const r = shuffled[i % shuffled.length];
      return '<div class="ai-plan-day"><span class="ai-plan-day-label">' + d + '</span><span class="ai-plan-day-meal">' + r.name + '</span><span class="ai-plan-day-cal">' + r.nutrition.kalori + ' kcal</span></div>';
    }).join('');

    el.innerHTML = `
      <div class="ai-msg-avatar"><iconify-icon icon="solar:chef-hat-bold" style="font-size:14px;color:#fff"></iconify-icon></div>
      <div>
        <div class="ai-plan-card">
          <div class="ai-plan-header">
            <iconify-icon icon="solar:calendar-bold" style="color:#8B5CF6"></iconify-icon>
            <span>Bu Haftanın Menüsü</span>
          </div>
          <div class="ai-plan-days">${daysHtml}</div>
          <div class="ai-plan-actions">
            <button class="ai-recipe-card-btn primary" onclick="aiPlanAction('save')" style="flex:1">
              <iconify-icon icon="solar:bookmark-bold"></iconify-icon> Planı Kaydet
            </button>
            <button class="ai-recipe-card-btn secondary" onclick="aiPlanAction('refresh')" style="flex:1">
              <iconify-icon icon="solar:refresh-linear"></iconify-icon> Yenile
            </button>
          </div>
        </div>
      </div>`;
    document.getElementById('aiChatMessages').appendChild(el);
    aiScrollBottom();
  }, 500);
}

function aiRespondIngredients() {
  aiAddBotMsg('Buzdolabındaki malzemeleri söyle, sana ne yapabileceğini önereyim! Örneğin: "Yumurta, domates, biber ve peynir var"');
  const last = aiChatHistory.filter(m => m.role === 'user').pop();
  if (last && (last.text.includes(',') || last.text.split(' ').length > 3)) {
    setTimeout(() => {
      aiHideTyping();
      const recipes = menuItems.filter(m => m.type === 'tarif');
      const pick = recipes[Math.floor(Math.random() * recipes.length)];
      const idx = menuItems.indexOf(pick);
      aiAddBotMsg('Elindeki malzemelerle <strong>' + pick.name + '</strong> yapabilirsin! İşte tarif:');
      setTimeout(() => aiAddRecipeCard(pick, idx), 400);
    }, 1500);
  }
}

function aiRespondPersonalize() {
  const el = document.createElement('div');
  el.className = 'ai-msg bot';
  el.innerHTML = `
    <div class="ai-msg-avatar"><iconify-icon icon="solar:chef-hat-bold" style="font-size:14px;color:#fff"></iconify-icon></div>
    <div>
      <div class="ai-msg-bubble">Tercihlerini ayarlayalım! Aşağıdakilerden sana uygun olanları seç:</div>
      <div class="ai-personalize-card">
        <div class="ai-personalize-title"><iconify-icon icon="solar:shield-warning-bold"></iconify-icon> Alerjenler</div>
        <div class="ai-tag-group" id="aiAllergenTags">
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Gluten</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Laktoz</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Fıstık</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Yumurta</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Deniz Ürünü</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Soya</span>
        </div>
        <div class="ai-personalize-title"><iconify-icon icon="solar:heart-bold" style="color:#EF4444"></iconify-icon> Diyet Tercihi</div>
        <div class="ai-tag-group" id="aiDietTags">
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Vejetaryen</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Vegan</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Keto</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Düşük Karbonhidrat</span>
          <span class="ai-tag" onclick="this.classList.toggle('selected')">Akdeniz</span>
        </div>
        <div class="ai-personalize-title"><iconify-icon icon="solar:fire-bold" style="color:#F59E0B"></iconify-icon> Günlük Kalori</div>
        <div class="ai-tag-group" id="aiCalorieTags">
          <span class="ai-tag" onclick="aiSelectCalorie(this)">1200 kcal</span>
          <span class="ai-tag" onclick="aiSelectCalorie(this)">1500 kcal</span>
          <span class="ai-tag selected" onclick="aiSelectCalorie(this)">2000 kcal</span>
          <span class="ai-tag" onclick="aiSelectCalorie(this)">2500 kcal</span>
        </div>
        <button class="ai-recipe-card-btn primary" style="width:100%;margin-top:8px;padding:12px" onclick="aiSavePersonalize()">
          <iconify-icon icon="solar:check-circle-bold"></iconify-icon> Kaydet
        </button>
      </div>
    </div>`;
  document.getElementById('aiChatMessages').appendChild(el);
  aiScrollBottom();
}

function aiSelectCalorie(el) {
  el.parentElement.querySelectorAll('.ai-tag').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

function aiSavePersonalize() {
  aiAddBotMsg('Tercihlerini kaydettim! Artık tüm önerilerim senin diyet ve alerjen filtrelerine göre olacak. Hadi bir tarif önereyim mi?');
}

function aiRecipeAction(action, idx) {
  if (action === 'start') {
    currentItem = idx;
    currentSource = 'menu';
    showDetail(idx);
    setTimeout(() => startCooking(), 400);
  } else if (action === 'plan') {
    aiAddUserMsg('Plana ekle');
    aiShowTyping();
    setTimeout(() => {
      aiHideTyping();
      aiAddBotMsg('Tarif haftalık planına eklendi! Planını düzenlemek istersen "Haftalık Plan" butonuna tıklayabilirsin.');
    }, 800);
  } else if (action === 'share') {
    aiAddUserMsg('Tarifi paylaş');
    aiShowTyping();
    setTimeout(() => {
      aiHideTyping();
      aiAddBotMsg('Tarif topluluk sayfasında paylaşıma hazırlandı! Profilinden görebilir ve düzenleyebilirsin.');
    }, 800);
  }
}

function aiPlanAction(action) {
  if (action === 'save') {
    aiAddUserMsg('Planı kaydet');
    aiShowTyping();
    setTimeout(() => {
      aiHideTyping();
      aiAddBotMsg('Haftalık planın kaydedildi! Profil sayfandan erişebilir ve istediğin zaman düzenleyebilirsin.');
    }, 800);
  } else if (action === 'refresh') {
    aiAddUserMsg('Planı yenile');
    aiShowTyping();
    setTimeout(() => {
      aiHideTyping();
      aiRespondWeeklyPlan();
    }, 1000);
  }
}

function aiQuickAction(type) {
  const msgs = {
    weekly: 'Haftalık plan oluştur',
    ingredients: 'Malzemeden tarif öner',
    personalize: 'Diyet tercihlerimi ayarla',
    surprise: 'Beni şaşırt!',
    photo: 'Fotoğraftan tarif tanı'
  };
  const text = msgs[type] || type;
  aiAddUserMsg(text);
  aiProcessMessage(text);
}

function toggleAiActionMenu() {
  const menu = document.getElementById('aiActionMenu');
  const btn = document.getElementById('aiActionMenuBtn');
  aiActionMenuOpen = !aiActionMenuOpen;
  if (aiActionMenuOpen) {
    menu.classList.add('open');
    btn.classList.add('active');
  } else {
    menu.classList.remove('open');
    btn.classList.remove('active');
  }
}

document.addEventListener('click', function (e) {
  if (aiActionMenuOpen && !e.target.closest('.ai-action-menu') && !e.target.closest('#aiActionMenuBtn')) {
    toggleAiActionMenu();
  }
});

const _aiWelcomeHTML = (function(){ const w = document.getElementById('aiWelcome'); return w ? w.outerHTML : ''; })();

function resetAiChat() {
  aiChatHistory = [];
  aiHasStarted = false;
  const msgs = document.getElementById('aiChatMessages');
  if (!msgs) return;
  msgs.innerHTML = _aiWelcomeHTML;
  const chips = document.getElementById('aiInputChips');
  if (chips) chips.style.display = 'none';
  const input = document.getElementById('aiChatInput');
  if (input) input.value = '';
  document.getElementById('aiSendBtn').classList.remove('active');
}
