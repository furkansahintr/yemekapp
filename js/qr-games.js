/* ═══════════════════════════════════════════════════════════
   QR MASA OYUNLARI — Game Hub
   Çarkıfelek + oyuncu sayısına göre mini oyunlar
   ═══════════════════════════════════════════════════════════ */

var _QR_GAMES = [
  // Tek kişilik
  { id:'trivia',     title:'Yemek Trivia',     desc:'Mutfak bilgini kanıtla',    icon:'solar:question-circle-bold',  color:'#8B5CF6', minP:1, maxP:1, time:'3-5 dk' },
  { id:'puzzle',     title:'Bulmaca Tabağı',    desc:'Yemek fotoğrafı bulmaca',   icon:'solar:pie-chart-bold',         color:'#10B981', minP:1, maxP:1, time:'2-3 dk' },
  { id:'wordchain',  title:'Kelime Zinciri',    desc:'Son harften yemek adı',     icon:'solar:text-bold',              color:'#F59E0B', minP:1, maxP:1, time:'hızlı' },
  // 2 kişilik
  { id:'duel',       title:'Lezzet Düellosu',   desc:'Hızlı soru kapışması',      icon:'solar:cup-star-bold',          color:'#EF4444', minP:2, maxP:2, time:'3 dk' },
  { id:'tictactoe',  title:'Çengel Taktak',     desc:'Klasik xox modern sürümü',  icon:'solar:hashtag-square-bold',    color:'#3B82F6', minP:2, maxP:2, time:'hızlı' },
  // 3-4 kişilik
  { id:'guessdish',  title:'Yemeği Bil',        desc:'Tabaktaki ipuçlarından bul',icon:'solar:dish-bold',              color:'#EC4899', minP:2, maxP:4, time:'5 dk' },
  { id:'truthdare',  title:'Yemek veya Cezasi', desc:'Hafif ve eğlenceli',        icon:'solar:emoji-funny-circle-bold',color:'#F97316', minP:3, maxP:6, time:'10 dk' },
  // 5-10 kişilik
  { id:'mafia',      title:'Mutfak Mafyası',    desc:'Hangi şef suçlu?',          icon:'solar:shield-warning-bold',    color:'#DC2626', minP:5, maxP:10, time:'10-15 dk' },
  { id:'groupquiz',  title:'Grup Quiz Atışması',desc:'Takımlara ayrıl, yarış',   icon:'solar:users-group-rounded-bold',color:'#0EA5E9', minP:4, maxP:10, time:'8 dk' },
  { id:'mimes',      title:'Yemek Sessiz Sinema',desc:'Anlat, tahmin ettir',      icon:'solar:mask-happy-bold',        color:'#A855F7', minP:4, maxP:10, time:'10 dk' }
];

/* Çark seçenekleri — eğlence odaklı */
var _QR_WHEEL_OPTIONS = [
  { text:'Hesabı Öde',       color:'#EF4444', icon:'💳' },
  { text:'Tatlı Ismarla',    color:'#F59E0B', icon:'🍰' },
  { text:'İçecek Sunar',     color:'#3B82F6', icon:'🥤' },
  { text:'Şarkı Söyle',      color:'#A855F7', icon:'🎤' },
  { text:'Selfie Ödülü',     color:'#EC4899', icon:'📸' },
  { text:'1 El Kurtuldu',    color:'#22C55E', icon:'🎁' },
  { text:'Hesabı Öde',       color:'#EF4444', icon:'💳' },
  { text:'Garson Çağır',     color:'#F97316', icon:'🛎️' }
];

var _qrWheelRot = 0;
var _qrWheelSpinning = false;

/* ─ CTA button (masa menüsüne) ─ */
function _renderQrGamesCta() {
  var el = document.getElementById('qrGamesCta');
  if (!el) return;
  el.innerHTML = '<div onclick="openQrGameHub()" style="position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-xl);background:linear-gradient(135deg,#8B5CF6 0%,#EC4899 55%,#F97316 100%);color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(139,92,246,.3);overflow:hidden">'
    + '<div style="position:absolute;top:-14px;right:-14px;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 70%)"></div>'
    + '<div style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(6px)">'
    +   '<iconify-icon icon="solar:gamepad-bold" style="font-size:20px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;position:relative;min-width:0">'
    +   '<div style="font:var(--fw-bold) 13.5px/1.2 var(--font);display:flex;align-items:center;gap:5px">Oyunlar '
    +     '<span style="font:var(--fw-bold) 9px/1.4 var(--font);background:#FACC15;color:#78350F;padding:2px 6px;border-radius:var(--r-full);letter-spacing:.3px">YENİ</span>'
    +   '</div>'
    +   '<div style="font:var(--fw-regular) 11px/1.4 var(--font);opacity:.92;margin-top:3px">Çarkıfelek + mini oyunlar · masadakilerle birlikte oyna</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:rgba(255,255,255,.7);flex-shrink:0;position:relative"></iconify-icon>'
    + '</div>';
}

/* ─ Game Hub overlay ─ */
function openQrGameHub() {
  _qrGamesInjectStyles();
  var existing = document.getElementById('qrGameHub');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'qrGameHub';
  overlay.className = 'qrg-overlay';
  overlay.innerHTML = _qrGamesBody();
  document.getElementById('phone').appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('open'); });
}

function closeQrGameHub() {
  var el = document.getElementById('qrGameHub');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(function(){ if (el.parentNode) el.remove(); }, 240);
}

function _qrGamesBody() {
  var groups = [
    { key:'solo',   label:'Tek Kişilik',      icon:'👤',     items: _QR_GAMES.filter(function(g){ return g.minP === 1; }) },
    { key:'duo',    label:'2 Kişilik',        icon:'👥',     items: _QR_GAMES.filter(function(g){ return g.minP === 2 && g.maxP === 2; }) },
    { key:'small',  label:'3-4 Kişilik',      icon:'👥',     items: _QR_GAMES.filter(function(g){ return g.minP >= 2 && g.maxP >= 3 && g.maxP <= 4; }) },
    { key:'group',  label:'5-10 Kişilik Grup',icon:'🎉',     items: _QR_GAMES.filter(function(g){ return g.maxP >= 5; }) }
  ];

  var sections = groups.filter(function(g){ return g.items.length; }).map(function(g){
    var cards = g.items.map(_qrGameCard).join('');
    return '<div class="qrg-section">'
      + '<div class="qrg-sec-head">'
      +   '<span class="qrg-sec-icon">' + g.icon + '</span>'
      +   '<span class="qrg-sec-label">' + g.label + '</span>'
      +   '<span class="qrg-sec-count">' + g.items.length + ' oyun</span>'
      + '</div>'
      + '<div class="qrg-grid">' + cards + '</div>'
      + '</div>';
  }).join('');

  return '<div class="qrg-head">'
    + '<div class="qrg-close" onclick="closeQrGameHub()"><iconify-icon icon="solar:close-circle-bold" style="font-size:24px;color:#fff"></iconify-icon></div>'
    + '<div class="qrg-title"><iconify-icon icon="solar:gamepad-bold" style="font-size:20px"></iconify-icon>Oyunlar</div>'
    + '<div class="qrg-back-to-menu" onclick="closeQrGameHub()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:14px"></iconify-icon>Menüye Dön</div>'
    + '</div>'
    + '<div class="qrg-body">'
    +   _qrWheelSection()
    +   sections
    + '</div>';
}

/* ─ Çarkıfelek ─ */
function _qrWheelSection() {
  return '<div class="qrg-wheel-card">'
    + '<div class="qrg-wheel-head">'
    +   '<div><div class="qrg-wheel-title">Çarkıfelek</div>'
    +   '<div class="qrg-wheel-sub">Hesabı kim öder? Tatlıyı kim ısmarlar? Döndür ve eğlen.</div></div>'
    +   '<button class="qrg-wheel-btn" id="qrWheelBtn" onclick="spinQrWheel()">Çevir</button>'
    + '</div>'
    + '<div class="qrg-wheel-wrap">'
    +   _qrWheelSvg()
    +   '<div class="qrg-wheel-pointer"></div>'
    +   '<div class="qrg-wheel-center"><iconify-icon icon="solar:refresh-bold" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<div class="qrg-wheel-result" id="qrWheelResult"></div>'
    + '</div>';
}

function _qrWheelSvg() {
  var n = _QR_WHEEL_OPTIONS.length;
  var segAngle = 360 / n;
  var cx = 120, cy = 120, r = 108;
  var slices = '';
  var labels = '';
  for (var i = 0; i < n; i++) {
    var a1 = (i * segAngle - 90) * Math.PI / 180;
    var a2 = ((i + 1) * segAngle - 90) * Math.PI / 180;
    var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    var largeArc = segAngle > 180 ? 1 : 0;
    slices += '<path d="M' + cx + ',' + cy + ' L' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + ' Z" fill="' + _QR_WHEEL_OPTIONS[i].color + '" stroke="#fff" stroke-width="2"/>';
    // Label (emoji only for space)
    var lx = cx + (r * 0.62) * Math.cos((a1 + a2) / 2);
    var ly = cy + (r * 0.62) * Math.sin((a1 + a2) / 2);
    var rot = (i * segAngle) + (segAngle / 2);
    labels += '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" dominant-baseline="middle" font-size="18" transform="rotate(' + rot + ' ' + lx + ' ' + ly + ')">' + _QR_WHEEL_OPTIONS[i].icon + '</text>';
  }
  return '<svg id="qrWheelSvg" viewBox="0 0 240 240" width="240" height="240" style="transform:rotate(0deg);transition:transform 4s cubic-bezier(.22,.9,.18,1)">'
    + slices
    + labels
    + '</svg>';
}

function spinQrWheel() {
  if (_qrWheelSpinning) return;
  var svg = document.getElementById('qrWheelSvg');
  var result = document.getElementById('qrWheelResult');
  var btn = document.getElementById('qrWheelBtn');
  if (!svg) return;
  _qrWheelSpinning = true;
  if (btn) btn.disabled = true;
  if (result) result.innerHTML = '';

  var n = _QR_WHEEL_OPTIONS.length;
  var segAngle = 360 / n;
  var winner = Math.floor(Math.random() * n);
  // Çark saat yönünün tersine döner, pointer üstte (12:00) → ters hesaplama
  var landingAngle = 360 - (winner * segAngle + segAngle / 2);
  var spins = 5 + Math.floor(Math.random() * 3);
  _qrWheelRot += spins * 360 + landingAngle - (_qrWheelRot % 360);
  svg.style.transform = 'rotate(' + _qrWheelRot + 'deg)';
  setTimeout(function(){
    _qrWheelSpinning = false;
    if (btn) btn.disabled = false;
    if (result) {
      var opt = _QR_WHEEL_OPTIONS[winner];
      result.innerHTML = '<div class="qrg-result-inner" style="background:' + opt.color + '18;color:' + opt.color + '"><span style="font-size:20px">' + opt.icon + '</span><span>' + opt.text + '</span></div>';
    }
  }, 4100);
}

/* ─ Game card ─ */
function _qrGameCard(g) {
  var range = g.minP === g.maxP ? (g.minP + ' kişi') : (g.minP + '-' + g.maxP + ' kişi');
  var playerDots = '';
  var n = Math.min(g.maxP, 5);
  for (var i = 0; i < n; i++) playerDots += '👤';
  if (g.maxP > 5) playerDots += '+';
  return '<div class="qrg-card" onclick="startQrGame(\'' + g.id + '\')">'
    + '<div class="qrg-card-ico" style="background:' + g.color + '18;color:' + g.color + '"><iconify-icon icon="' + g.icon + '" style="font-size:22px"></iconify-icon></div>'
    + '<div class="qrg-card-body">'
    +   '<div class="qrg-card-title">' + g.title + '</div>'
    +   '<div class="qrg-card-desc">' + g.desc + '</div>'
    +   '<div class="qrg-card-meta">'
    +     '<span class="qrg-meta-pill">' + playerDots + ' ' + range + '</span>'
    +     '<span class="qrg-meta-time"><iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>' + g.time + '</span>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

function startQrGame(id) {
  var g = _QR_GAMES.find(function(x){ return x.id === id; });
  if (!g) return;
  if (g.minP >= 2) {
    // Davet bildirimi simülasyonu
    var userName = (typeof AUTH !== 'undefined' && AUTH.user && AUTH.user.name) ? AUTH.user.name : 'Sen';
    if (typeof showToast === 'function') showToast(userName + ' masadakilere "' + g.title + '" davetini gönderdi · oyuncular bekleniyor...');
    else alert('Masadakilere davet gönderildi: ' + g.title);
    // Demo: 1 saniye sonra "oyun başlıyor" bilgisi
    setTimeout(function(){
      if (typeof showToast === 'function') showToast(g.title + ' başlıyor! (demo)');
    }, 1500);
    return;
  }
  if (typeof showToast === 'function') showToast(g.title + ' başlıyor! (demo)');
  else alert(g.title + ' başlıyor (demo)');
}

/* ─ Styles ─ */
function _qrGamesInjectStyles() {
  if (document.getElementById('qrGamesStyles')) return;
  var s = document.createElement('style');
  s.id = 'qrGamesStyles';
  s.textContent = [
    '.qrg-overlay{position:fixed;inset:0;z-index:120;background:var(--bg-page);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(24px);transition:opacity .3s ease, transform .3s ease}',
    '.qrg-overlay.open{opacity:1;transform:translateY(0)}',
    '.qrg-head{position:relative;padding:max(env(safe-area-inset-top),18px) 16px 14px;background:linear-gradient(135deg,#1a1033 0%,#4A1D96 55%,#9333EA 100%);color:#fff;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '.qrg-close{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px)}',
    '.qrg-title{flex:1;font:var(--fw-bold) 17px/1 var(--font);display:flex;align-items:center;gap:8px}',
    '.qrg-back-to-menu{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;background:rgba(255,255,255,.18);border-radius:var(--r-full);font:var(--fw-bold) 11.5px/1 var(--font);cursor:pointer;backdrop-filter:blur(6px);color:#fff}',
    '.qrg-body{flex:1;overflow-y:auto;padding:16px var(--app-px) 24px;display:flex;flex-direction:column;gap:18px}',
    /* Çarkıfelek */
    '.qrg-wheel-card{background:linear-gradient(135deg,#1a1033,#4A1D96);color:#fff;border-radius:var(--r-xl);padding:18px;box-shadow:0 8px 24px rgba(74,29,150,.35);position:relative;overflow:hidden}',
    '.qrg-wheel-card::before{content:"";position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(250,204,21,.25) 0%,transparent 70%)}',
    '.qrg-wheel-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;position:relative}',
    '.qrg-wheel-title{font:var(--fw-bold) 17px/1.2 var(--font)}',
    '.qrg-wheel-sub{font:var(--fw-regular) 11.5px/1.4 var(--font);opacity:.85;margin-top:4px;max-width:220px}',
    '.qrg-wheel-btn{margin-left:auto;padding:10px 18px;border:none;border-radius:var(--r-full);background:#FACC15;color:#78350F;font:var(--fw-bold) 12.5px/1 var(--font);cursor:pointer;box-shadow:0 4px 12px rgba(250,204,21,.4)}',
    '.qrg-wheel-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.qrg-wheel-wrap{position:relative;width:240px;height:240px;margin:0 auto;display:flex;align-items:center;justify-content:center}',
    '.qrg-wheel-pointer{position:absolute;top:-2px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:24px solid #FACC15;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4));z-index:2}',
    '.qrg-wheel-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4A1D96,#9333EA);border:3px solid #FACC15;display:flex;align-items:center;justify-content:center;z-index:1;box-shadow:0 2px 10px rgba(0,0,0,.35)}',
    '.qrg-wheel-result{margin-top:14px;min-height:44px;display:flex;align-items:center;justify-content:center}',
    '.qrg-result-inner{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--r-full);font:var(--fw-bold) 14px/1 var(--font);animation:qrgResultIn .4s ease}',
    '@keyframes qrgResultIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}',
    /* Section */
    '.qrg-section{display:flex;flex-direction:column;gap:10px}',
    '.qrg-sec-head{display:flex;align-items:center;gap:8px;padding:0 2px}',
    '.qrg-sec-icon{font-size:18px}',
    '.qrg-sec-label{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);flex:1}',
    '.qrg-sec-count{font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted);background:var(--bg-btn);padding:3px 8px;border-radius:var(--r-full)}',
    '.qrg-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.qrg-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:8px;cursor:pointer;box-shadow:var(--shadow-sm);transition:transform .15s, box-shadow .15s}',
    '.qrg-card:active{transform:scale(.98)}',
    '.qrg-card:hover{box-shadow:var(--shadow-md)}',
    '.qrg-card-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.qrg-card-body{display:flex;flex-direction:column;gap:4px}',
    '.qrg-card-title{font:var(--fw-bold) 12.5px/1.2 var(--font);color:var(--text-primary)}',
    '.qrg-card-desc{font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted)}',
    '.qrg-card-meta{display:flex;flex-direction:column;gap:3px;margin-top:2px}',
    '.qrg-meta-pill{font:var(--fw-bold) 9.5px/1.3 var(--font);color:var(--text-secondary);letter-spacing:.3px}',
    '.qrg-meta-time{display:inline-flex;align-items:center;gap:3px;font:var(--fw-medium) 9.5px/1 var(--font);color:var(--text-muted)}'
  ].join('\n');
  document.head.appendChild(s);
}
