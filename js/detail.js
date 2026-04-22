/* ═══ DETAIL & COOKING COMPONENT ═══ */

let currentItem=null, currentSource='menu', detailServing=1;

function getListBySource(source){
  if(source==='kesfet')return kesfetItems;
  if(source==='restoran')return restaurantItems;
  return menuItems;
}

function showDetail(i,source){
  const list=getListBySource(source);
  const item=list[i];
  currentItem=i;
  currentSource=source||'menu';
  detailServing=item.servings||1;

  if(item.type==='restoran'||source==='restoran') addToRecent(i,'restoran');
  else addToRecent(i,'tarif');

  const isRestoran = item.type==='restoran';
  const rest = item.restaurant||{};

  document.getElementById('detailName').textContent=item.name;
  const priceEl=document.getElementById('detailPrice');
  if(isRestoran){priceEl.textContent='₺'+item.price;priceEl.style.display='block';}
  else{priceEl.style.display='none';}

  document.getElementById('detailRating').textContent=item.rating+' ('+item.reviews+' değerlendirme)';
  // Bookmark — tarif defterine ekle (sadece tarif için göster)
  var _bmBtn=document.getElementById('detailBookmarkBtn');
  if(isRestoran){_bmBtn.style.display='none';}
  else{
    _bmBtn.style.display='flex';
    var _saved=(USER_PROFILE.savedRecipes||[]).indexOf(i)!==-1;
    document.getElementById('detailBookmarkIcon').setAttribute('icon', _saved?'solar:bookmark-bold':'solar:bookmark-linear');
    document.getElementById('detailBookmarkLabel').textContent=_saved?'Tarif Defterinde':'Tarif Defterine Ekle';
  }

  document.getElementById('detailDesc').textContent=item.desc||'';
  document.getElementById('detailImg').src=item.img;
  document.getElementById('detailImg').alt=item.name;

  /* ── Alerjen Uyarı Badge ── */
  _renderDetailAllergenBadge(item);

  const prepTimeEl=document.getElementById('detailPrepTime');
  const cookTimeEl=document.getElementById('detailCookTime');
  const difficultyEl=document.getElementById('detailDifficulty');
  const prepLabel=prepTimeEl.nextElementSibling;
  const cookLabel=cookTimeEl.nextElementSibling;
  const diffLabel=difficultyEl.nextElementSibling;
  const prepIcon=prepTimeEl.previousElementSibling;
  const cookIcon=cookTimeEl.previousElementSibling;
  const diffIcon=difficultyEl.previousElementSibling;

  if(isRestoran){
    prepIcon.setAttribute('icon','solar:delivery-linear');
    prepTimeEl.textContent='~'+rest.deliveryTime.replace(/(\d+)-(\d+)dk/,(_,a,b)=>b+'dk');
    prepLabel.textContent='Teslimat';
    cookIcon.setAttribute('icon','solar:tag-price-linear');
    cookTimeEl.textContent=rest.deliveryFee||'—';
    cookLabel.textContent='Teslimat Ücreti';
    diffIcon.setAttribute('icon','solar:wallet-linear');
    difficultyEl.textContent='₺'+rest.minOrder;
    diffLabel.textContent='Min. Sipariş';
  }else{
    prepIcon.setAttribute('icon','solar:clock-circle-linear');
    prepTimeEl.textContent=item.prepTime||'—';
    prepLabel.textContent='Hazırlık';
    cookIcon.setAttribute('icon','solar:fire-linear');
    cookTimeEl.textContent=item.cookTime||'—';
    cookLabel.textContent='Pişirme';
    diffIcon.setAttribute('icon','solar:chef-hat-linear');
    difficultyEl.textContent=item.difficulty||'—';
    diffLabel.textContent='Zorluk';
  }

  const ingEl=document.getElementById('detailIngredients');
  ingEl.innerHTML=(item.ing||[]).map(x=>{
    const name=typeof x==='string'?x:x.name;
    const amount=typeof x==='string'?'':x.amount;
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-subtle)"><div style="display:flex;align-items:center;gap:10px"><div style="width:6px;height:6px;border-radius:50%;background:var(--primary);flex-shrink:0"></div><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">'+name+'</span></div>'+(amount?'<span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">'+amount+'</span>':'')+'</div>';
  }).join('');

  const tipsEl=document.getElementById('detailTips');
  const tipsTitle=tipsEl.previousElementSibling;
  if(item.tips&&item.tips.length){
    tipsTitle.style.display='';tipsEl.style.display='';
    tipsEl.innerHTML=item.tips.map((t,i)=>'<div style="display:flex;gap:10px;align-items:flex-start"><div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--primary)">'+(i+1)+'</span></div><span style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">'+t+'</span></div>').join('');
  }else{
    tipsTitle.style.display='none';tipsEl.style.display='none';
  }

  const authorSection=document.getElementById('detailAuthorSection');
  if(isRestoran && rest.name){
    authorSection.style.display='flex';
    document.getElementById('detailAuthorAvatar').src=item.author?item.author.avatar:'';
    document.getElementById('detailAuthorName').textContent=rest.name;
    document.getElementById('detailAuthorFollowers').textContent=rest.address||'';
    document.getElementById('detailAuthorRecipes').textContent=rest.rating?'★ '+rest.rating:'';
    const followBtn=document.getElementById('detailFollowBtn');
    followBtn.textContent='Mekanı Gör';
    followBtn.style.background='var(--bg-btn)';
    followBtn.style.color='var(--text-primary)';
    followBtn.style.borderColor='var(--border-subtle)';
  }else if(item.author){
    authorSection.style.display='flex';
    document.getElementById('detailAuthorAvatar').src=item.author.avatar;
    document.getElementById('detailAuthorName').textContent=item.author.name;
    document.getElementById('detailAuthorFollowers').textContent=item.author.followers+' takipçi';
    document.getElementById('detailAuthorRecipes').textContent=item.author.recipes+' tarif';
    const followBtn=document.getElementById('detailFollowBtn');
    if(item.author.following){
      followBtn.textContent='Takip Ediyorsun';
      followBtn.style.background='var(--primary)';
      followBtn.style.color='var(--text-inverse)';
      followBtn.style.borderColor='var(--primary)';
    }else{
      followBtn.textContent='Takip Et';
      followBtn.style.background='var(--bg-btn)';
      followBtn.style.color='var(--text-primary)';
      followBtn.style.borderColor='var(--border-subtle)';
    }
  }else{
    authorSection.style.display='none';
  }

  const servingArea=document.getElementById('detailServing').parentElement;
  const startBtn=document.getElementById('detailStartBtn');
  const calendarBtn=document.getElementById('detailPlanBtn') || startBtn.nextElementSibling;
  if(isRestoran){
    document.getElementById('detailServing').textContent='1 Adet';
    detailServing=1;
    startBtn.textContent='Sepete Ekle — ₺'+item.price;
    startBtn.onclick=function(){
      if (typeof buttonTick === 'function') {
        buttonTick(startBtn, { hold: 520, done: function() {
          addToCart(currentItem, currentSource);
          closeDetail();
        }});
      } else {
        addToCart(currentItem, currentSource);
        closeDetail();
      }
    };
    /* Restaurants da Plana Ekle butonu görür (Tarife Başla ile birebir aynı davranış) */
    calendarBtn.style.display='flex';
  }else{
    document.getElementById('detailServing').textContent=detailServing+' Kişi';
    startBtn.textContent='Tarife Başla';
    startBtn.onclick=function(){startCooking();};
    calendarBtn.style.display='flex';
  }

  renderNutrition();
  if (typeof renderRecipeNativeAd === 'function') renderRecipeNativeAd(item);
  document.getElementById('detailOverlay').classList.add('open');
  document.getElementById('detailOverlay').scrollTop=0;
}

function closeDetail(){
  document.getElementById('detailOverlay').classList.remove('open');
  if(activeHomeTab==='tarifler') renderMenu();
  else renderRestoranlar();
}

function changeServing(d){
  detailServing=Math.max(1,detailServing+d);
  document.getElementById('detailServing').textContent=detailServing+' Kişi';
  renderNutrition();
}

const NUT_META={
  lif:{label:'Lif',unit:'g',icon:'solar:leaf-linear'},
  seker:{label:'Şeker',unit:'g',icon:'solar:waterdrop-linear'},
  demir:{label:'Demir',unit:'mg',icon:'solar:magnet-linear'},
  kalsiyum:{label:'Kalsiyum',unit:'mg',icon:'solar:bone-linear'},
  cvitamini:{label:'C Vitamini',unit:'mg',icon:'solar:vitamin-linear'},
  avitamini:{label:'A Vitamini',unit:'µg',icon:'solar:eye-linear'},
  sodyum:{label:'Sodyum',unit:'mg',icon:'solar:danger-triangle-linear'}
};

function renderNutrition(){
  const list=getListBySource(currentSource);
  const item=list[currentItem];
  const section=document.getElementById('detailNutritionSection');
  if(!item.nutrition){section.style.display='none';return;}
  section.style.display='';
  const n=item.nutrition;
  const s=detailServing;
  const base=item.servings||1;
  const m=s/base;
  document.getElementById('detailNutritionLabel').textContent=s+' kişilik';
  document.getElementById('detailNutKalori').textContent=Math.round(n.kalori*m)+' kcal';
  document.getElementById('detailNutProtein').textContent=Math.round(n.protein*m)+'g';
  document.getElementById('detailNutYag').textContent=Math.round(n.yag*m)+'g';
  document.getElementById('detailNutKarb').textContent=Math.round(n.karbonhidrat*m)+'g';
  const listEl=document.getElementById('detailNutritionList');
  listEl.innerHTML=Object.keys(NUT_META).map(k=>{
    if(n[k]===undefined)return '';
    const meta=NUT_META[k];
    const val=k==='demir'?(n[k]*m).toFixed(1):Math.round(n[k]*m);
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle)"><div style="display:flex;align-items:center;gap:8px"><iconify-icon icon="'+meta.icon+'" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">'+meta.label+'</span></div><span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">'+val+' '+meta.unit+'</span></div>';
  }).join('');
}

/* ═══════════════════════════════════════ */
/*  COOKING STEPS (Tarife Başla)          */
/* ═══════════════════════════════════════ */

let cookingItem = null;
let cookingSource = 'menu';
let cookingStepIndex = 0;
let cookingSteps = [];
let ttsActive = false;
let ttsSpeaking = false;
let micActive = false;
let handsfreeOpen = false;

function openCookingSteps() {
  const list = getListBySource(currentSource);
  const item = list[currentItem];
  if (!item || !item.steps || !item.steps.length) return;

  cookingItem = item;
  cookingSource = currentSource;
  cookingSteps = item.steps;
  cookingStepIndex = 0;

  document.getElementById('cookingRecipeName').textContent = item.name;
  renderCookingIngredients(item);
  renderCookingStep();
  document.getElementById('cookingOverlay').classList.add('open');
}

function closeCookingSteps() {
  var overlay = document.getElementById('cookingOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.classList.remove('is-completed');
  }
  var actions = document.querySelector('.cooking-completion-actions');
  if (actions) actions.remove();
  var conf = document.getElementById('cookingConfetti');
  if (conf) conf.remove();
  stopTTS();
  closeHandsfreeMode();
  cookingItem = null;
  cookingSteps = [];
  cookingStepIndex = 0;
}

function startCooking() {
  openCookingSteps();
}

function goToStep(idx) {
  cookingStepIndex = idx;
  renderCookingStep();
  if (handsfreeOpen) updateHandsfreeUI();
}

function prevStep() {
  if (cookingStepIndex > 0) {
    cookingStepIndex--;
    renderCookingStep();
    if (handsfreeOpen) updateHandsfreeUI();
  }
}

function nextStep() {
  if (cookingStepIndex < cookingSteps.length - 1) {
    cookingStepIndex++;
    renderCookingStep();
    if (handsfreeOpen) updateHandsfreeUI();
  } else {
    finishCooking();
  }
}

function finishCooking() {
  _cookInjectCompletionStyles();
  const card = document.getElementById('cookingStepCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'stepCardIn .45s cubic-bezier(.4,0,.2,1)';
  card.classList.add('completion');

  document.getElementById('cookingStepIcon').setAttribute('icon', 'solar:check-circle-bold');
  document.getElementById('cookingStepNumber').textContent = 'TAMAMLANDI';
  document.getElementById('cookingStepTitle').textContent = 'Tamamlandı, Afiyet Olsun!';
  document.getElementById('cookingStepDesc').textContent = cookingItem.name + ' tarifini başarıyla tamamladın. Harika iş çıkardın!';
  document.getElementById('cookingStepDuration').textContent = 'Toplam ' + cookingItem.cookTime;
  document.getElementById('cookingProgressFill').style.width = '100%';

  // Completion mode: bottom bar + TTS controls kendi state'ine geçer
  const overlay = document.getElementById('cookingOverlay');
  if (overlay) overlay.classList.add('is-completed');

  // Bottom bar: Değerlendir + Ana Sayfaya Dön butonları
  const bottom = document.querySelector('.cooking-bottom-bar');
  if (bottom) {
    let actions = bottom.querySelector('.cooking-completion-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'cooking-completion-actions';
      actions.innerHTML = ''
        + '<button type="button" class="cook-review-btn" onclick="_cookOpenReview()">'
        +   '<iconify-icon icon="solar:star-bold" style="font-size:18px"></iconify-icon>'
        +   '<span>Değerlendir</span>'
        + '</button>'
        + '<button type="button" class="cook-home-btn" onclick="_cookGoHome()">'
        +   '<iconify-icon icon="solar:home-2-linear" style="font-size:18px"></iconify-icon>'
        +   '<span>Ana Sayfaya Dön</span>'
        + '</button>';
      bottom.appendChild(actions);
    }
  }

  // Konfeti
  _cookLaunchConfetti();
}

/* ═══════════════════════════════════════════════
   COOKING COMPLETION — Değerlendirme + Konfeti + Ana Sayfa
   ═══════════════════════════════════════════════ */

function _cookLaunchConfetti() {
  var area = document.getElementById('cookingStepArea');
  if (!area) return;
  var host = document.getElementById('cookingConfetti');
  if (host) host.remove();
  host = document.createElement('div');
  host.id = 'cookingConfetti';
  host.className = 'cook-confetti';
  var colors = ['#F65013','#F59E0B','#10B981','#3B82F6','#EC4899','#8B5CF6','#EAB308'];
  var N = 36;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < N; i++) {
    var p = document.createElement('span');
    p.className = 'cook-confetti-p';
    var left = Math.random() * 100;
    var delay = Math.random() * 0.6;
    var dur = 2.4 + Math.random() * 1.6;
    var rot = Math.random() * 720 - 360;
    var size = 6 + Math.random() * 6;
    var c = colors[i % colors.length];
    p.style.cssText = 'left:' + left + '%;background:' + c + ';width:' + size + 'px;height:' + (size * 1.6) + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's;--r:' + rot + 'deg';
    frag.appendChild(p);
  }
  host.appendChild(frag);
  area.appendChild(host);
  setTimeout(function(){ if (host.parentNode) host.remove(); }, 5200);
}

function _cookGoHome() {
  closeCookingSteps();
  closeDetail();
  if (typeof switchTab === 'function') switchTab('menu');
}

/* ─── Değerlendirme sheet ─── */
var _cookReview = { rating: 0, comment: '', photo: null };

function _cookOpenReview() {
  _cookInjectCompletionStyles();
  _cookReview = { rating: 0, comment: '', photo: null };
  var phone = document.getElementById('phone') || document.body;
  var existing = document.getElementById('cookReviewBd');
  if (existing) existing.remove();

  var bd = document.createElement('div');
  bd.id = 'cookReviewBd';
  bd.className = 'cook-review-bd';
  bd.onclick = function(e){ if (e.target === bd) _cookCloseReview(); };
  bd.innerHTML = '<div class="cook-review-sheet" id="cookReviewSheet"><div id="cookReviewBody"></div></div>';
  phone.appendChild(bd);
  requestAnimationFrame(function(){
    bd.classList.add('open');
    var s = document.getElementById('cookReviewSheet');
    if (s) s.classList.add('open');
  });
  _cookRenderReview();
}

function _cookCloseReview() {
  var bd = document.getElementById('cookReviewBd');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(function(){ if (bd.parentNode) bd.remove(); }, 260);
}

function _cookRenderReview() {
  var body = document.getElementById('cookReviewBody');
  if (!body) return;
  var r = _cookReview;
  var labels = ['', 'Çok kötü', 'Kötü', 'Fena değil', 'İyi', 'Harika!'];
  var colors = ['', '#DC2626', '#EA580C', '#EAB308', '#16A34A', '#15803D'];

  var h = ''
    + '<div class="cook-sheet-head">'
    +   '<div class="cook-sheet-close" onclick="_cookCloseReview()" title="Kapat"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    +   '<div class="cook-sheet-head-text">'
    +     '<div class="cook-sheet-title"><iconify-icon icon="solar:chef-hat-bold" style="font-size:17px;color:var(--primary)"></iconify-icon>Tarifi Değerlendir</div>'
    +     '<div class="cook-sheet-sub">' + _cookEsc(cookingItem && cookingItem.name || '') + '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="cook-stars">';
  for (var i = 1; i <= 5; i++) {
    var on = i <= r.rating;
    h += '<button type="button" class="cook-star' + (on ? ' on' : '') + '" onclick="_cookSetRating(' + i + ')">'
      +    '<iconify-icon icon="' + (on ? 'solar:star-bold' : 'solar:star-linear') + '" style="font-size:38px"></iconify-icon>'
      + '</button>';
  }
  h += '</div>';
  if (r.rating > 0) h += '<div class="cook-rating-lbl" style="color:' + colors[r.rating] + '">' + labels[r.rating] + '</div>';
  else h += '<div class="cook-rating-hint">Puan vermek için yıldızlara dokun</div>';

  h += '<div class="cook-field-label">Tarif hakkındaki düşüncelerin neler?</div>';
  h += '<textarea class="cook-note" placeholder="Deneyimini paylaş (opsiyonel)..." maxlength="400" oninput="_cookReview.comment=this.value">' + _cookEsc(r.comment) + '</textarea>';

  // Foto
  h += '<div class="cook-photo-slot">';
  if (r.photo) {
    h += '<div class="cook-photo-preview"><img src="' + _cookEsc(r.photo) + '" alt=""><button type="button" class="cook-photo-remove" onclick="_cookRemovePhoto()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></button></div>';
  } else {
    h += '<label class="cook-photo-pick">'
      +    '<iconify-icon icon="solar:camera-add-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>'
      +    '<div class="cook-photo-pick-text"><div class="cook-photo-pick-title">Bir Fotoğraf Yükle</div><div class="cook-photo-pick-desc">Yaptığın yemeği topluluğa göster · 1 foto</div></div>'
      +    '<input type="file" accept="image/*" capture="environment" onchange="_cookPickPhoto(event)" style="display:none">'
      +  '</label>';
  }
  h += '</div>';

  h += '<div class="cook-sheet-footer">'
    +    '<button type="button" class="cook-skip-btn" onclick="_cookCloseReview();_cookGoHome()">Atla</button>'
    +    '<button type="button" class="cook-submit-btn' + (r.rating > 0 ? '' : ' is-disabled') + '"' + (r.rating > 0 ? ' onclick="_cookSubmitReview()"' : '') + '>'
    +      '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>Onayla ve Yayınla'
    +    '</button>'
    +  '</div>';

  body.innerHTML = h;
}

function _cookSetRating(n) {
  _cookReview.rating = n;
  _cookRenderReview();
}

function _cookPickPhoto(e) {
  var f = e.target && e.target.files && e.target.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    _cookReview.photo = ev.target.result;
    _cookRenderReview();
  };
  reader.readAsDataURL(f);
}

function _cookRemovePhoto() {
  _cookReview.photo = null;
  _cookRenderReview();
}

function _cookSubmitReview() {
  var r = _cookReview;
  if (!r.rating || !cookingItem) return;

  // 1) Tarifin ana sayfasındaki "Tüm Değerlendirmeler" listesine ekle (prepend)
  try {
    if (typeof _RR_SEED !== 'undefined') {
      var userName = (typeof USER_PROFILE !== 'undefined' && USER_PROFILE.name) || 'Sen';
      var avatar = (typeof USER_PROFILE !== 'undefined' && USER_PROFILE.avatar) || 'https://i.pravatar.cc/80?img=11';
      // Aynı kullanıcının eski yorumu varsa çıkar (mükerrer önleme)
      for (var k = _RR_SEED.length - 1; k >= 0; k--) {
        if (_RR_SEED[k] && _RR_SEED[k].name === userName && _RR_SEED[k].__ownedBy === 'me') _RR_SEED.splice(k, 1);
      }
      _RR_SEED.unshift({
        name: userName,
        avatar: avatar,
        rating: r.rating,
        daysAgo: 0,
        text: r.comment || '',
        photo: r.photo || null,
        helpful: 0,
        __ownedBy: 'me'
      });
    }
  } catch (e) { /* noop */ }

  // 2) USER_RECIPE_REVIEWS'a yaz (Değerlendirmelerim > Tarifler sekmesinde görünür)
  try {
    if (typeof USER_RECIPE_REVIEWS === 'undefined') window.USER_RECIPE_REVIEWS = {};
    var rid = 'cook_' + (cookingItem.name || 'recipe').toLowerCase().replace(/\s+/g, '_');
    USER_RECIPE_REVIEWS[rid] = {
      recipeName: cookingItem.name,
      chef: (cookingItem.author && cookingItem.author.name) || '',
      rating: r.rating,
      comment: r.comment || '',
      photo: r.photo || null,
      createdAt: new Date().toISOString()
    };
  } catch (e2) { /* noop */ }

  _cookCloseReview();
  setTimeout(function() {
    _cookShowThanks();
  }, 260);
}

function _cookShowThanks() {
  var phone = document.getElementById('phone') || document.body;
  var existing = document.getElementById('cookThanksBd');
  if (existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'cookThanksBd';
  m.className = 'cook-thanks-bd';
  m.onclick = function(e){ if (e.target === m) _cookCloseThanks(); };
  m.innerHTML = ''
    + '<div class="cook-thanks">'
    +   '<div class="cook-thanks-ico"><iconify-icon icon="solar:heart-angle-bold" style="font-size:52px;color:#F59E0B"></iconify-icon></div>'
    +   '<div class="cook-thanks-title">Teşekkürler!</div>'
    +   '<div class="cook-thanks-body">Değerlendirmeler topluluğa büyük katkı sunar, yapmış olduğun değerlendirmeler için teşekkür ederiz.</div>'
    +   '<button type="button" class="cook-thanks-btn" onclick="_cookCloseThanks()"><iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Harika</button>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  // Oto kapat + ana sayfaya yönlen
  setTimeout(_cookCloseThanks, 4500);
}

function _cookCloseThanks() {
  var m = document.getElementById('cookThanksBd');
  if (!m || m.dataset.closing === '1') return;
  m.dataset.closing = '1';
  m.classList.remove('open');
  setTimeout(function(){
    if (m.parentNode) m.remove();
    _cookGoHome();
  }, 260);
}

function _cookEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _cookInjectCompletionStyles() {
  if (document.getElementById('cookCompletionStyles')) return;
  var s = document.createElement('style');
  s.id = 'cookCompletionStyles';
  s.textContent = [
    /* Completion state — gizlemeler */
    '.cooking-step-card.completion .cooking-tts-controls{display:none}',
    '.cooking-overlay.is-completed .cooking-prev-btn,.cooking-overlay.is-completed .cooking-step-dots,.cooking-overlay.is-completed .cooking-next-btn{display:none}',
    '.cooking-bottom-bar{min-height:56px}',
    '.cooking-completion-actions{display:flex;gap:10px;flex:1;width:100%;animation:cookFadeUp .4s .1s ease both}',
    '.cook-review-btn,.cook-home-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:13px 10px;border:none;border-radius:var(--r-xl);font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;transition:all .2s}',
    '.cook-review-btn{flex:1.35;background:linear-gradient(135deg,#F65013,#F97316);color:#fff;box-shadow:0 8px 20px rgba(246,80,19,.35)}',
    '.cook-review-btn:active{transform:scale(.97)}',
    '.cook-home-btn{background:var(--bg-surface);color:var(--text-primary);border:1.5px solid var(--border-subtle)}',
    '.cook-home-btn:active{transform:scale(.97);background:var(--bg-phone)}',
    '@keyframes cookFadeUp{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}',
    /* Konfeti */
    '.cooking-step-area{position:relative}',
    '.cook-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}',
    '.cook-confetti-p{position:absolute;top:-20px;border-radius:2px;animation:cookConfetti linear forwards;opacity:.95;transform-origin:center}',
    '@keyframes cookConfetti{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(110vh) rotate(var(--r,360deg))}}',
    /* Review sheet */
    '.cook-review-bd{position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:flex-end;opacity:0;transition:opacity .22s}',
    '.cook-review-bd.open{opacity:1}',
    '.cook-review-sheet{width:100%;max-height:90vh;overflow-y:auto;background:var(--bg-page);border-radius:22px 22px 0 0;transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.61,.36,1);padding:14px 14px 22px;scrollbar-width:none}',
    '.cook-review-sheet.open{transform:translateY(0)}',
    '.cook-review-sheet::-webkit-scrollbar{display:none}',
    '.cook-sheet-head{display:flex;gap:10px;align-items:flex-start;padding:4px 0 6px}',
    '.cook-sheet-close{width:30px;height:30px;border-radius:50%;background:var(--bg-phone);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
    '.cook-sheet-head-text{flex:1;min-width:0}',
    '.cook-sheet-title{display:flex;align-items:center;gap:7px;font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.cook-sheet-sub{font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.cook-stars{display:flex;justify-content:center;gap:6px;padding:14px 0 6px}',
    '.cook-star{background:none;border:none;padding:2px;cursor:pointer;color:#CBD5E1}',
    '.cook-star.on{color:#F59E0B}',
    '.cook-star:active{transform:scale(.92)}',
    '.cook-rating-lbl{text-align:center;font:var(--fw-bold) var(--fs-sm)/1 var(--font);margin-bottom:10px}',
    '.cook-rating-hint{text-align:center;font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-bottom:10px}',
    '.cook-field-label{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);margin:6px 2px}',
    '.cook-note{width:100%;min-height:88px;padding:11px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.45 var(--font);color:var(--text-primary);outline:none;resize:vertical;margin-bottom:10px}',
    '.cook-note:focus{border-color:var(--primary)}',
    '.cook-photo-slot{margin-bottom:12px}',
    '.cook-photo-preview{position:relative;width:100%;max-height:200px;border-radius:var(--r-lg);overflow:hidden;background:var(--bg-phone)}',
    '.cook-photo-preview img{width:100%;max-height:200px;object-fit:cover;display:block}',
    '.cook-photo-remove{position:absolute;top:8px;right:8px;border:none;background:rgba(0,0,0,.55);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.cook-photo-pick{display:flex;align-items:center;gap:10px;padding:12px;border:1.5px dashed rgba(246,80,19,.35);background:rgba(246,80,19,.04);border-radius:var(--r-lg);cursor:pointer;transition:all .15s}',
    '.cook-photo-pick:hover{background:rgba(246,80,19,.08);border-color:rgba(246,80,19,.55)}',
    '.cook-photo-pick:active{transform:scale(.98)}',
    '.cook-photo-pick-text{flex:1;min-width:0}',
    '.cook-photo-pick-title{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.cook-photo-pick-desc{font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.cook-sheet-footer{display:flex;gap:8px;margin-top:4px}',
    '.cook-skip-btn{padding:13px 18px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-xl);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer}',
    '.cook-skip-btn:active{transform:scale(.97)}',
    '.cook-submit-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:13px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,#F65013,#F97316);color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;box-shadow:0 6px 16px rgba(246,80,19,.28)}',
    '.cook-submit-btn.is-disabled{opacity:.42;pointer-events:none;box-shadow:none}',
    '.cook-submit-btn:active{transform:scale(.97)}',
    /* Thanks popup */
    '.cook-thanks-bd{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:100;opacity:0;transition:opacity .24s;padding:20px}',
    '.cook-thanks-bd.open{opacity:1}',
    '.cook-thanks{width:100%;max-width:340px;background:linear-gradient(180deg,#FFFBEB,#FFFFFF 60%);border-radius:20px;padding:24px 20px 18px;text-align:center;transform:scale(.92);transition:transform .28s cubic-bezier(.2,.9,.25,1);border:1px solid rgba(245,158,11,.22);box-shadow:0 20px 50px rgba(0,0,0,.2)}',
    '.cook-thanks-bd.open .cook-thanks{transform:scale(1)}',
    '.cook-thanks-ico{animation:cookPop .5s ease;margin-bottom:6px}',
    '@keyframes cookPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}',
    '.cook-thanks-title{font:800 19px/1 var(--font);color:#B45309;margin-bottom:6px}',
    '.cook-thanks-body{font:var(--fw-regular) 12.5px/1.6 var(--font);color:var(--text-primary);max-width:300px;margin:0 auto 14px}',
    '.cook-thanks-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:12px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;box-shadow:0 6px 16px rgba(245,158,11,.28)}',
    '.cook-thanks-btn:active{transform:scale(.97)}'
  ].join('\n');
  document.head.appendChild(s);
}

function renderCookingStep() {
  const step = cookingSteps[cookingStepIndex];
  const total = cookingSteps.length;
  const isLast = cookingStepIndex === total - 1;
  const card = document.getElementById('cookingStepCard');

  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'stepCardIn .45s cubic-bezier(.4,0,.2,1)';
  card.classList.remove('completion');

  // Completion state temizliği (geri gelinirse)
  var overlay = document.getElementById('cookingOverlay');
  if (overlay) overlay.classList.remove('is-completed');
  var actions = document.querySelector('.cooking-completion-actions');
  if (actions) actions.remove();
  var conf = document.getElementById('cookingConfetti');
  if (conf) conf.remove();

  document.getElementById('cookingStepLabel').textContent = 'Adım ' + (cookingStepIndex + 1) + '/' + total;
  document.getElementById('cookingStepNumber').textContent = 'ADIM ' + (cookingStepIndex + 1);
  document.getElementById('cookingStepTitle').textContent = step.title;
  document.getElementById('cookingStepDesc').textContent = step.desc;
  document.getElementById('cookingStepDuration').textContent = step.duration;
  document.getElementById('cookingStepIcon').setAttribute('icon', step.icon || 'solar:chef-hat-heart-linear');

  const pct = ((cookingStepIndex + 1) / total) * 100;
  document.getElementById('cookingProgressFill').style.width = pct + '%';

  const dotsEl = document.getElementById('cookingStepDots');
  dotsEl.innerHTML = cookingSteps.map((_, i) => {
    let cls = 'dot';
    if (i === cookingStepIndex) cls += ' active';
    else if (i < cookingStepIndex) cls += ' done';
    return '<div class="' + cls + '"></div>';
  }).join('');

  document.getElementById('cookingPrevBtn').disabled = cookingStepIndex === 0;

  const nextBtn = document.getElementById('cookingNextBtn');
  if (isLast) {
    nextBtn.innerHTML = '<iconify-icon icon="solar:check-circle-linear" style="font-size:20px"></iconify-icon><span>Tamamla</span>';
    nextBtn.classList.add('finish');
  } else {
    nextBtn.innerHTML = '<span>Sonraki</span><iconify-icon icon="solar:arrow-right-linear" style="font-size:20px"></iconify-icon>';
    nextBtn.classList.remove('finish');
  }

  ttsActive = false;
  ttsSpeaking = false;
  updateTTSUI();
}

function toggleHandsFree() {
  if (handsfreeOpen) {
    closeHandsFree();
  } else {
    openHandsfreeMode();
  }
}

function closeHandsFree() {
  handsfreeOpen = false;
  document.getElementById('handsfreeOverlay').classList.remove('open');
  document.getElementById('handsfreeBtn').classList.remove('active');
  document.getElementById('handsfreeMicArea').classList.remove('listening');
  document.getElementById('handsfreeTtsAnim').classList.remove('speaking');
}

function hfNextStep() {
  nextStep();
}

function hfPrevStep() {
  prevStep();
}

function hfTogglePlay() {
  toggleTTS();
}

function handleGesture(dir) {
  if (dir === 'left') nextStep();
  else if (dir === 'right') prevStep();
}

function dismissGestureInfo() {
  document.getElementById('handsfreeGestureInfo').classList.remove('visible');
}

function renderCookingIngredients(item) {
  const list = document.getElementById('cookingIngredientsList');
  list.innerHTML = (item.ing || []).map(x => {
    const name = typeof x === 'string' ? x : x.name;
    const amount = typeof x === 'string' ? '' : x.amount;
    return '<div class="ing-item"><span class="ing-name">' + name + '</span>' + (amount ? '<span class="ing-amount">' + amount + '</span>' : '') + '</div>';
  }).join('');
}

function openHandsfreeMode() {
  handsfreeOpen = true;
  document.getElementById('handsfreeBtn').classList.add('active');
  updateHandsfreeUI();
  document.getElementById('handsfreeOverlay').classList.add('open');
  document.getElementById('handsfreeGestureInfo').classList.add('visible');
  document.getElementById('handsfreeMicArea').classList.add('listening');
  document.getElementById('handsfreeTtsAnim').classList.add('speaking');
  setTimeout(() => {
    document.getElementById('handsfreeTtsAnim').classList.remove('speaking');
    document.getElementById('handsfreeTtsStatus').textContent = 'Hazır';
  }, 4000);
}

function updateHandsfreeUI() {
  if (!cookingSteps.length) return;
  const step = cookingSteps[cookingStepIndex];
  const total = cookingSteps.length;
  document.getElementById('handsfreeRecipeName').textContent = cookingItem ? cookingItem.name : '';
  document.getElementById('handsfreeStepLabel').textContent = 'Adım ' + (cookingStepIndex + 1) + '/' + total;
  document.getElementById('handsfreeStepNumber').textContent = 'ADIM ' + (cookingStepIndex + 1);
  document.getElementById('handsfreeStepTitle').textContent = step.title;
  document.getElementById('handsfreeStepDesc').textContent = step.desc;
  const pct = ((cookingStepIndex + 1) / total) * 100;
  document.getElementById('handsfreeProgressFill').style.width = pct + '%';

  document.getElementById('handsfreeTtsAnim').classList.add('speaking');
  document.getElementById('handsfreeTtsStatus').textContent = 'Okunuyor...';
  setTimeout(() => {
    document.getElementById('handsfreeTtsAnim').classList.remove('speaking');
    document.getElementById('handsfreeTtsStatus').textContent = 'Hazır';
  }, 3000);
}

function updateTTSUI() {
  const btn = document.getElementById('cookingTtsBtn');
  const iconWrap = document.getElementById('ttsIconWrap');
  const icon = document.getElementById('ttsIcon');
  const label = document.getElementById('ttsLabel');

  if (ttsActive) {
    btn.classList.add('active');
    icon.setAttribute('icon', ttsSpeaking ? 'solar:volume-loud-bold' : 'solar:volume-loud-linear');
    label.textContent = ttsSpeaking ? 'Okunuyor...' : 'Sesli Oku';
    if (ttsSpeaking) iconWrap.classList.add('speaking');
    else iconWrap.classList.remove('speaking');
  } else {
    btn.classList.remove('active');
    icon.setAttribute('icon', 'solar:volume-loud-linear');
    label.textContent = 'Sesli Oku';
    iconWrap.classList.remove('speaking');
  }
}

function toggleTTS() {
  ttsActive = !ttsActive;
  if (ttsActive) {
    ttsSpeaking = true;
    setTimeout(() => { ttsSpeaking = false; updateTTSUI(); }, 3000);
  } else {
    ttsSpeaking = false;
  }
  updateTTSUI();
}

function stopTTS() {
  ttsActive = false;
  ttsSpeaking = false;
  updateTTSUI();
}

/* ═══════════════════════════════════════════════════════
   COOKING MODE — HTML uyumluluk için ek alias/wrapper'lar
   (cooking-steps.html + hands-free.html içindeki onclick'ler)
   ═══════════════════════════════════════════════════════ */

/* Sol üst geri — tarifin genel görünümüne döner (detay overlay açık kalır) */
function closeCooking() {
  closeCookingSteps();
}

/* Alt navigasyon */
function cookingPrev() { prevStep(); }
function cookingNext() { nextStep(); }

/* Eller Serbest Modu — mikrofon dinleme moduna geçer */
function toggleHandsfreeMode() { toggleHandsFree(); }
function closeHandsfreeMode()  { closeHandsFree(); }

/* Tekrarla — mevcut adımı yeniden sesli okur */
function repeatTTS() {
  if (!cookingSteps.length) return;
  /* sesli okuma animasyonunu yeniden başlat */
  ttsActive = true;
  ttsSpeaking = true;
  updateTTSUI();

  /* hands-free overlay açıksa TTS animasyonunu da tetikle */
  var anim = document.getElementById('handsfreeTtsAnim');
  var status = document.getElementById('handsfreeTtsStatus');
  if (anim) anim.classList.add('speaking');
  if (status) status.textContent = 'Tekrar okunuyor...';

  /* Repeat butonuna görsel feedback */
  var btn = document.getElementById('cookingRepeatBtn');
  if (btn) {
    btn.classList.add('active');
    setTimeout(function() { btn.classList.remove('active'); }, 600);
  }

  _cookingToast('Adım tekrar okunuyor', 'solar:repeat-bold');

  setTimeout(function() {
    ttsSpeaking = false;
    updateTTSUI();
    if (anim) anim.classList.remove('speaking');
    if (status) status.textContent = 'Hazır';
  }, 3200);
}

/* Mikrofon butonu — sesli komut dinleme aç/kapa (UI simülasyonu) */
function toggleVoiceCommand() {
  micActive = !micActive;
  var micArea  = document.getElementById('handsfreeMicArea');
  var micBtn   = document.getElementById('handsfreeMicBtn');
  var micIcon  = document.getElementById('handsfreeMicIcon');
  var micStat  = document.getElementById('handsfreeMicStatus');

  if (micActive) {
    if (micArea) micArea.classList.add('listening');
    if (micBtn)  micBtn.classList.add('active');
    if (micIcon) micIcon.setAttribute('icon', 'solar:microphone-3-bold');
    if (micStat) micStat.textContent = 'Dinleniyor...';
    _cookingToast('Sesli komut aktif — "Sonraki" veya "Tekrarla" diyebilirsin', 'solar:microphone-3-bold');

    /* Simülasyon: 3sn sonra örnek bir komut algılanmış gibi göster */
    clearTimeout(window._voiceSimTimer);
    window._voiceSimTimer = setTimeout(function() {
      if (!micActive) return;
      if (micStat) micStat.textContent = '"Sonraki" komutu algılandı';
    }, 3500);
  } else {
    if (micArea) micArea.classList.remove('listening');
    if (micBtn)  micBtn.classList.remove('active');
    if (micIcon) micIcon.setAttribute('icon', 'solar:microphone-3-linear');
    if (micStat) micStat.textContent = 'Mikrofon kapalı';
    clearTimeout(window._voiceSimTimer);
  }
}

/* Malzeme panelini aç/kapa (cooking-steps.html alt kısım) */
function toggleCookingIngredients() {
  var panel = document.getElementById('cookingIngredientsPanel');
  var arrow = document.getElementById('cookingIngArrow');
  if (!panel) return;
  var isOpen = panel.classList.toggle('open');
  if (arrow) arrow.setAttribute('icon', isOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear');
}

/* Küçük toast helper */
function _cookingToast(msg, icon) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:110px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.95);color:#fff;padding:10px 18px;border-radius:999px;font:500 13px/1.2 var(--font);z-index:9999;display:flex;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:90vw;text-align:center';
  t.innerHTML = '<iconify-icon icon="' + (icon || 'solar:info-circle-bold') + '" style="font-size:16px;flex-shrink:0"></iconify-icon><span>' + msg + '</span>';
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2400);
  setTimeout(function() { t.remove(); }, 2800);
}

/* Window exports — inline onclick'lerin görmesi için */
window.closeCooking             = closeCooking;
window.cookingPrev              = cookingPrev;
window.cookingNext              = cookingNext;
window.toggleHandsfreeMode      = toggleHandsfreeMode;
window.closeHandsfreeMode       = closeHandsfreeMode;
window.repeatTTS                = repeatTTS;
window.toggleVoiceCommand       = toggleVoiceCommand;
window.toggleCookingIngredients = toggleCookingIngredients;

/* ═══ TARİF DEFTERİ — Bookmark ═══ */
function toggleDetailBookmark() {
  var idx = currentItem;
  if (currentSource === 'restoran') return;
  if (!USER_PROFILE.savedRecipes) USER_PROFILE.savedRecipes = [];
  var arr = USER_PROFILE.savedRecipes;
  var pos = arr.indexOf(idx);
  if (pos !== -1) arr.splice(pos, 1); else arr.push(idx);
  var saved = pos === -1;
  document.getElementById('detailBookmarkIcon').setAttribute('icon', saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear');
  document.getElementById('detailBookmarkLabel').textContent = saved ? 'Tarif Defterinde' : 'Tarif Defterine Ekle';
}

/* ═══ ALERJEN UYARI SİSTEMİ ═══ */
function _getMatchingAllergens(item) {
  var itemAllergens = item.allergens || [];
  if (itemAllergens.length === 0) return [];
  var userAllergens = (USER_PROFILE && USER_PROFILE.allergens) || [];
  if (userAllergens.length === 0) return [];
  var matched = [];
  itemAllergens.forEach(function(a) {
    if (userAllergens.indexOf(a) !== -1) matched.push(a);
  });
  return matched;
}

function _allergenLabel(id) {
  if (typeof ALLERGEN_LIST !== 'undefined') {
    var found = ALLERGEN_LIST.find(function(a) { return a.id === id; });
    if (found) return found.label;
  }
  // Fallback
  var map = { gluten:'Gluten', laktoz:'Laktoz', fistik:'Fıstık', kabuklu:'Sert Kabuklu', deniz:'Deniz Ürünü', yumurta:'Yumurta', soya:'Soya', balik:'Balık', susam:'Susam', kereviz:'Kereviz', hardal:'Hardal', lupin:'Lupin', sulfit:'Sülfitler', selenyum:'Yumuşakçalar' };
  return map[id] || id;
}

function _renderDetailAllergenBadge(item) {
  var badge = document.getElementById('detailAllergenBadge');
  if (!badge) return;
  var matched = _getMatchingAllergens(item);
  if (matched.length === 0) {
    badge.style.display = 'none';
    return;
  }
  var names = matched.map(function(id) { return _allergenLabel(id); });
  var text = names.join(', ');
  document.getElementById('detailAllergenText').textContent = 'Alerjen: ' + text;
  badge.style.display = 'flex';
}

function _showAllergenDetail() {
  var list = getListBySource(currentSource);
  var item = list[currentItem];
  if (!item) return;
  var matched = _getMatchingAllergens(item);
  var allItemAllergens = (item.allergens || []);

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;align-items:flex-end;justify-content:center';

  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.45)';
  backdrop.onclick = function() { overlay.remove(); };
  overlay.appendChild(backdrop);

  var sheet = document.createElement('div');
  sheet.style.cssText = 'position:relative;z-index:1;background:var(--bg-page);border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:16px 20px 28px;max-height:60vh;overflow-y:auto';

  var html = '<div style="display:flex;justify-content:center;padding:0 0 12px"><div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle)"></div></div>';
  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">Alerjen Bilgisi</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-bottom:16px">' + item.name + ' içeriğindeki alerjenler</div>';

  allItemAllergens.forEach(function(id) {
    var isMatch = matched.indexOf(id) !== -1;
    var label = _allergenLabel(id);
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-lg);margin-bottom:6px;background:' + (isMatch ? 'rgba(239,68,68,.08)' : 'var(--glass-card)') + ';border:1.5px solid ' + (isMatch ? '#EF4444' : 'transparent') + '">';
    html += '<iconify-icon icon="solar:shield-warning-bold" style="font-size:20px;color:' + (isMatch ? '#EF4444' : 'var(--text-muted)') + '"></iconify-icon>';
    html += '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + label + '</div>';
    if (isMatch) {
      html += '<div style="font:var(--fw-medium) var(--fs-xs)/1.2 var(--font);color:#EF4444;margin-top:2px">Profilinizde eşleşme var</div>';
    }
    html += '</div>';
    if (isMatch) {
      html += '<div style="padding:4px 10px;border-radius:12px;background:#EF4444;color:#fff;font:var(--fw-semibold) 10px/1 var(--font)">Uyarı</div>';
    }
    html += '</div>';
  });

  sheet.innerHTML = html;
  overlay.appendChild(sheet);
  document.getElementById('phone').appendChild(overlay);
}
