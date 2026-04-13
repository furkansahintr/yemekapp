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
  const bookmarkBtn=document.getElementById('detailBookmarkBtn');
  if(isRestoran){bookmarkBtn.style.display='none';}
  else{bookmarkBtn.style.display='flex';document.getElementById('detailBookmarks').textContent='('+(item.bookmarks||'0')+')';}

  document.getElementById('detailDesc').textContent=item.desc||'';
  document.getElementById('detailImg').src=item.img;
  document.getElementById('detailImg').alt=item.name;

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
  const calendarBtn=startBtn.nextElementSibling;
  if(isRestoran){
    document.getElementById('detailServing').textContent='1 Adet';
    detailServing=1;
    startBtn.textContent='Sepete Ekle — ₺'+item.price;
    startBtn.onclick=function(){addToCart(currentItem,currentSource);closeDetail();};
    calendarBtn.style.display='none';
  }else{
    document.getElementById('detailServing').textContent=detailServing+' Kişi';
    startBtn.textContent='Tarife Başla';
    startBtn.onclick=function(){startCooking();};
    calendarBtn.style.display='flex';
  }

  renderNutrition();
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
  document.getElementById('cookingOverlay').classList.remove('open');
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
  const card = document.getElementById('cookingStepCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'stepCardIn .45s cubic-bezier(.4,0,.2,1)';
  card.classList.add('completion');

  document.getElementById('cookingStepIcon').setAttribute('icon', 'solar:check-circle-bold');
  document.getElementById('cookingStepNumber').textContent = 'TAMAMLANDI';
  document.getElementById('cookingStepTitle').textContent = 'Afiyet Olsun!';
  document.getElementById('cookingStepDesc').textContent = cookingItem.name + ' tarifini başarıyla tamamladınız. Harika iş çıkardınız!';
  document.getElementById('cookingStepDuration').textContent = 'Toplam ' + cookingItem.cookTime;
  document.getElementById('cookingProgressFill').style.width = '100%';

  const nextBtn = document.getElementById('cookingNextBtn');
  nextBtn.innerHTML = '<iconify-icon icon="solar:home-2-linear" style="font-size:20px"></iconify-icon><span>Ana Sayfa</span>';
  nextBtn.classList.add('finish');
  nextBtn.onclick = function () { closeCookingSteps(); closeDetail(); nextBtn.onclick = function () { nextStep(); }; };
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
