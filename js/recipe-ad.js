/* ═══════════════════════════════════════════════════════════
   RECIPE NATIVE AD — Tarif detayında "Önerilen İşletme" kartı
   - Birincil: aynı/benzer isimdeki menü ürünü
   - İkincil: aynı veya tamamlayıcı kategori
   - Kullanıcıyı ilgili işletmenin menü sayfasına yönlendirir
   ═══════════════════════════════════════════════════════════ */

/* Kategori tamamlayıcılığı — recipe kategorisi → eşleşecek biz kategorileri */
var _RECIPE_AD_COMPLEMENTS = {
  'Burger':   ['Kebaplar','Pizzalar','İçecekler'],
  'Kebap':    ['İçecekler','Salatalar','Kebaplar'],
  'Kebaplar': ['İçecekler','Salatalar','Kebaplar'],
  'Pizza':    ['Salatalar','İçecekler','Pizzalar'],
  'Pizzalar': ['Salatalar','İçecekler','Pizzalar'],
  'Salata':   ['Kebaplar','Pizzalar'],
  'Salatalar':['Kebaplar','Pizzalar'],
  'Tatlı':    ['İçecekler','Kahvaltı'],
  'Kahvaltı': ['İçecekler','Kahvaltı'],
  'Çorba':    ['Kebaplar','Salatalar'],
  'İçecek':   ['Kebaplar','Pizzalar'],
  'İçecekler':['Kebaplar','Pizzalar']
};

/* Basit isim normalizasyonu — aksan / büyük-küçük / boşluk */
function _recipeAdNormalize(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ç/g,'c')
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

/* İki isim "benzer" mi — birbirini kapsıyor mu ya da en az bir uzun kelime ortak */
function _recipeAdNamesMatch(a, b) {
  var na = _recipeAdNormalize(a), nb = _recipeAdNormalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.indexOf(nb) > -1 || nb.indexOf(na) > -1) return true;
  var aw = na.split(' ').filter(function(w){ return w.length >= 4; });
  var bw = nb.split(' ').filter(function(w){ return w.length >= 4; });
  for (var i = 0; i < aw.length; i++) {
    if (bw.indexOf(aw[i]) > -1) return true;
  }
  return false;
}

/* Şube için deterministik pseudo-mesafe (m) — demo için stabil */
function _recipeAdBranchDistance(branch) {
  if (!branch) return null;
  var hash = 0, s = branch.id || branch.name || '';
  for (var i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  var meters = 350 + (Math.abs(hash) % 1650); // 350m - 2000m
  if (meters < 1000) return meters + 'm';
  return (meters / 1000).toFixed(1).replace('.', ',') + 'km';
}

/* Sadece açık ve aktif ürünler; schedule aktifse servis zamanı içinde olsun */
function _recipeAdIsServable(mi, branch) {
  if (!mi || mi.status !== 'active') return false;
  if (branch && branch.status === 'closed') return false;
  if (typeof bmsIsActiveNow === 'function' && !bmsIsActiveNow(mi)) return false;
  return true;
}

function _recipeAdPickMatch(recipe) {
  if (typeof BIZ_MENU_ITEMS === 'undefined' || typeof BIZ_BRANCHES === 'undefined') return null;
  var branchById = {};
  BIZ_BRANCHES.forEach(function(b){ branchById[b.id] = b; });

  var pool = BIZ_MENU_ITEMS.filter(function(mi){
    return _recipeAdIsServable(mi, branchById[mi.branchId]);
  });
  if (!pool.length) return null;

  /* 1) Tam / benzer isim eşleşmesi */
  var primary = pool.find(function(mi){ return _recipeAdNamesMatch(mi.name, recipe.name); });
  if (primary) return { item: primary, branch: branchById[primary.branchId], mode: 'exact' };

  /* 2) Aynı kategoride bir ürün */
  var cat = recipe.category || '';
  var sameCat = pool.find(function(mi){ return _recipeAdNormalize(mi.category) === _recipeAdNormalize(cat); });
  if (sameCat) return { item: sameCat, branch: branchById[sameCat.branchId], mode: 'category' };

  /* 3) Tamamlayıcı kategoriden bir ürün */
  var comps = _RECIPE_AD_COMPLEMENTS[cat] || _RECIPE_AD_COMPLEMENTS[_recipeAdNormalize(cat)] || [];
  for (var i = 0; i < comps.length; i++) {
    var target = comps[i];
    var hit = pool.find(function(mi){ return mi.category === target; });
    if (hit) return { item: hit, branch: branchById[hit.branchId], mode: 'complement' };
  }

  /* 4) Fallback — havuzdaki ilk açık ürün */
  var any = pool[0];
  return { item: any, branch: branchById[any.branchId], mode: 'fallback' };
}

/* Ana render — Tarif Analizi altına yerleştirilen native kart */
function renderRecipeNativeAd(recipe) {
  var slot = document.getElementById('detailRecipeAd');
  if (!slot) return;
  if (!recipe || recipe.type === 'restoran') { slot.innerHTML = ''; return; }

  var match = _recipeAdPickMatch(recipe);
  if (!match) { slot.innerHTML = ''; return; }

  var mi = match.item, branch = match.branch;
  var distance = _recipeAdBranchDistance(branch) || '—';
  var bizName = (typeof BIZ_BUSINESS !== 'undefined' && BIZ_BUSINESS.name) ? BIZ_BUSINESS.name : '';
  var branchName = branch ? branch.name : '';
  var labelText = match.mode === 'exact' ? 'Yakınında Var' : 'Önerilen İşletme';
  var labelIcon = match.mode === 'exact' ? 'solar:map-point-bold' : 'solar:verified-check-bold';
  var ctaText = match.mode === 'exact'
    ? 'İstersen hemen yakınındaki restorandan sipariş verebilirsin'
    : 'Yakınındaki restoran bu tarifin yanına şunu öneriyor';
  var rating = (branch && branch.rating) ? branch.rating : null;
  var priceText = Number(mi.price).toFixed(2).replace('.', ',') + ' ₺';
  var img = (recipe.img && match.mode !== 'complement') ? recipe.img : '';

  var adIndex = BIZ_MENU_ITEMS.indexOf(mi);

  slot.innerHTML = ''
    + '<div id="recipeAdCard" data-native-ad="1" onclick="openRecipeAdCTA(' + adIndex + ')" '
    +      'style="margin:6px 0 24px;background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-md);cursor:pointer;transition:transform .15s,box-shadow .15s">'
    /* Üst satır: küçük etiket */
    + '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '    <div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);background:var(--primary-soft);color:var(--primary)">'
    + '      <iconify-icon icon="' + labelIcon + '" style="font-size:11px"></iconify-icon>'
    + '      <span style="font:var(--fw-semibold) 10px/1 var(--font);letter-spacing:.2px">' + labelText + '</span>'
    + '    </div>'
    + '    <div style="display:inline-flex;align-items:center;gap:3px;font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted)">'
    + '      <iconify-icon icon="solar:map-point-wave-linear" style="font-size:12px"></iconify-icon>'
    +        distance + ' uzağında'
    + '    </div>'
    + '  </div>'
    /* İçerik: sol görsel + sağ meta */
    + '  <div style="display:flex;gap:12px;align-items:center">'
    + '    <div style="width:72px;height:72px;border-radius:var(--r-lg);flex-shrink:0;overflow:hidden;background:var(--bg-btn);display:flex;align-items:center;justify-content:center">'
    +        (img
              ? '<img src="' + img + '" alt="" style="width:100%;height:100%;object-fit:cover">'
              : '<iconify-icon icon="solar:dish-bold" style="font-size:34px;color:var(--primary)"></iconify-icon>')
    + '    </div>'
    + '    <div style="flex:1;min-width:0">'
    + '      <div style="font:var(--fw-semibold) var(--fs-sm)/1.25 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _recipeAdEsc(mi.name) + '</div>'
    + '      <div style="font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
    +          (bizName ? _recipeAdEsc(bizName) + ' · ' : '') + _recipeAdEsc(branchName)
    + '      </div>'
    + '      <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">'
    + '        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)">' + priceText + '</span>'
    +          (rating ? '<span style="display:inline-flex;align-items:center;gap:3px;font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-secondary)"><iconify-icon icon="solar:star-bold" style="font-size:11px;color:#F59E0B"></iconify-icon>' + rating + '</span>' : '')
    + '      </div>'
    + '    </div>'
    + '  </div>'
    /* CTA */
    + '  <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border-subtle);display:flex;align-items:center;gap:10px">'
    + '    <span style="flex:1;font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-secondary)">' + ctaText + '</span>'
    + '    <button onclick="event.stopPropagation();openRecipeAdCTA(' + adIndex + ')" '
    +           'style="padding:8px 14px;border:none;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-bold) 11.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px">'
    + '      Menüyü Gör'
    + '      <iconify-icon icon="solar:arrow-right-linear" style="font-size:12px"></iconify-icon>'
    + '    </button>'
    + '  </div>'
    + '</div>';
}

function _recipeAdEsc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* CTA — kullanıcıyı işletmenin menü sayfasına ışınla.
   Aktif masa oturumu yoksa QR menü akışını start'layıp açıyoruz;
   böylece kullanıcı tek tıkla o işletmenin dijital menüsüne düşer. */
function openRecipeAdCTA(biMiIdx) {
  var mi = (typeof BIZ_MENU_ITEMS !== 'undefined') ? BIZ_MENU_ITEMS[biMiIdx] : null;
  if (!mi) return;
  var branch = (typeof BIZ_BRANCHES !== 'undefined')
    ? BIZ_BRANCHES.find(function(b){ return b.id === mi.branchId; })
    : null;
  if (!branch) return;

  /* Detay overlay'i kapat */
  if (typeof closeDetail === 'function') { try { closeDetail(); } catch(e){} }

  /* Masa oturumu başlat — QR akışıyla tam uyumlu şekilde işletme menüsünü aç */
  if (typeof _startTableSession === 'function' && typeof openTableMenuPage === 'function') {
    var biz = (typeof BIZ_BUSINESS !== 'undefined') ? BIZ_BUSINESS : { id: branch.businessId, name: '' };
    /* Şubenin ilk masasını bul (demo için); gerçek hayatta kullanıcı oradayken QR okur */
    var table = (typeof BIZ_TABLES !== 'undefined')
      ? BIZ_TABLES.find(function(t){ return t.branchId === branch.id; })
      : null;
    var res = {
      business: biz,
      branch: branch,
      table: table || { id: 'preview', number: '—' },
      geoVerified: false
    };
    _startTableSession(res);
    openTableMenuPage();
  } else {
    /* Fallback — bildirim */
    if (typeof _qrToast === 'function') _qrToast('ok', branch.name + ' menüsüne yönlendiriliyorsun');
  }
}
