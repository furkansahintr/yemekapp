/* ═══ BIZ MENU COMPONENT — Full Product Creation Module ═══ */

let bizMenuActiveCategory = 'all';
let bizMenuActiveTab = 'single'; // 'single' | 'combo'

/* ═══ ROLE-BASED MENU HELPERS ═══ */
function _menuCanEdit() {
  return bizCurrentRole === 'owner' || bizCurrentRole === 'manager' || bizCurrentRole === 'chef';
}

function _menuGetChefKitchenIds() {
  if (bizCurrentEmployment && bizCurrentEmployment.kitchenCategories) {
    return bizCurrentEmployment.kitchenCategories;
  }
  const staff = BIZ_STAFF.find(s =>
    s.branchId === bizActiveBranch && s.role === 'chef' && s.kitchenCategories
  );
  return staff ? staff.kitchenCategories : BIZ_KITCHEN_CATEGORIES.map(c => c.id);
}

function _menuGetFilteredItems() {
  let items = BIZ_MENU_ITEMS.filter(m => m.branchId === bizActiveBranch);
  if (bizCurrentRole === 'chef') {
    const myStations = _menuGetChefKitchenIds();
    items = items.filter(i => myStations.includes(i.kitchenCategory));
  }
  return items;
}

function _menuCanEditItem(item) {
  if (bizCurrentRole === 'owner' || bizCurrentRole === 'manager') return true;
  if (bizCurrentRole === 'chef') {
    const myStations = _menuGetChefKitchenIds();
    return myStations.includes(item.kitchenCategory);
  }
  return false;
}

/* ═══ OPEN MENU MANAGEMENT ═══ */
/* ═══ MENU VIEW MODE ═══
   'full' (default): tam yetki — Ürün/Grup oluştur, ayarlar, düzenle/sil aktif
   'home': sadece izleme + stok toggle. Şube Ayarları'nda tam moda geçilir. */
var bizMenuViewMode = 'full';

function openBizMenuMgmt(mode) {
  if (!bizRoleGuard('menu')) return;
  if (mode) bizMenuViewMode = mode;
  bizMenuActiveCategory = 'all';
  bizMenuActiveTab = 'single';
  const overlay = createBizOverlay('bizMenuOverlay', 'Menü Yönetimi', renderBizMenuContent());
  document.getElementById('bizPhone').appendChild(overlay);
  /* Topbar'a Ayarlar (çark) butonu enjekte et — sadece tam yetki (full) modunda.
     createBizOverlay varsayılan olarak sağ aksiyon butonu sunmuyor. */
  if (bizMenuViewMode === 'full') {
    const topbar = overlay.firstElementChild;
    if (topbar) {
      const gear = document.createElement('div');
      gear.className = 'btn-icon';
      gear.title = 'Menü Ayarları';
      gear.onclick = openBizMenuSettings;
      gear.innerHTML = '<iconify-icon icon="solar:settings-linear" style="font-size:20px"></iconify-icon>';
      topbar.appendChild(gear);
    }
  }
}

/* Home mode için wrapper — Navbar > Anasayfa tile'ından çağrılır */
function openBizMenuView() {
  openBizMenuMgmt('home');
}

/* Home mode helper */
function _menuIsHome() { return bizMenuViewMode === 'home'; }

/* ═══ SWITCH CATEGORY ═══ */
function switchBizMenuCategory(cat) {
  bizMenuActiveCategory = cat;
  const list = document.getElementById('bizMenuItemsList');
  if (list) list.innerHTML = bizMenuActiveTab === 'single' ? renderBizMenuItems() : renderBizComboItems();

  document.querySelectorAll('.biz-menu-cat-tab').forEach(el => {
    const isActive = el.dataset.cat === cat;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });
}

/* ═══ SWITCH SINGLE/COMBO TAB ═══ */
function switchBizMenuTab(tab) {
  bizMenuActiveTab = tab;
  bizMenuActiveCategory = 'all';
  const content = document.getElementById('bizMenuContentArea');
  if (content) content.innerHTML = renderBizMenuInnerContent();

  document.querySelectorAll('.biz-menu-type-tab').forEach(el => {
    const isActive = el.dataset.tab === tab;
    el.style.background = isActive ? 'var(--primary)' : 'transparent';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
  });
}

/* ═══ RENDER MENU CONTENT ═══ */
function renderBizMenuContent() {
  const canEdit = _menuCanEdit();

  let roleBanner = '';
  if (bizCurrentRole === 'chef') {
    const myStations = _menuGetChefKitchenIds();
    const stationNames = myStations.map(id => {
      const cat = BIZ_KITCHEN_CATEGORIES.find(c => c.id === id);
      return cat ? cat.name : id;
    }).join(', ');
    roleBanner = `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--r-lg);margin-bottom:12px">
      <iconify-icon icon="solar:chef-hat-linear" style="font-size:18px;color:#F59E0B;flex-shrink:0"></iconify-icon>
      <div>
        <div style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-primary)">Sadece kendi istasyonunuzdaki ürünler gösteriliyor</div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${stationNames}</div>
      </div>
    </div>`;
  } else if (bizCurrentRole === 'cashier') {
    roleBanner = `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:var(--r-lg);margin-bottom:12px">
      <iconify-icon icon="solar:eye-linear" style="font-size:18px;color:#06B6D4;flex-shrink:0"></iconify-icon>
      <div style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-primary)">Menüyü görüntülüyorsunuz (salt okunur)</div>
    </div>`;
  }

  return `
    ${roleBanner}
    <!-- Single / Combo Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:14px;background:var(--glass-card);border-radius:var(--r-full);padding:3px">
      <div class="biz-menu-type-tab" data-tab="single" onclick="switchBizMenuTab('single')" style="flex:1;text-align:center;padding:8px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;background:var(--primary);color:#fff;transition:all .2s">
        <iconify-icon icon="solar:box-minimalistic-bold" style="font-size:13px;vertical-align:-2px"></iconify-icon> Tekil Ürünler
      </div>
      <div class="biz-menu-type-tab" data-tab="combo" onclick="switchBizMenuTab('combo')" style="flex:1;text-align:center;padding:8px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;background:transparent;color:var(--text-secondary);transition:all .2s">
        <iconify-icon icon="solar:layers-bold" style="font-size:13px;vertical-align:-2px"></iconify-icon> Grup Ürünler
      </div>
    </div>

    <div id="bizMenuContentArea">
      ${renderBizMenuInnerContent()}
    </div>
  `;
}

function renderBizMenuInnerContent() {
  if (bizMenuActiveTab === 'single') return renderBizMenuSingleTab();
  return renderBizMenuComboTab();
}

/* ═══ SINGLE PRODUCTS TAB ═══ */
function renderBizMenuSingleTab() {
  const items = _menuGetFilteredItems();
  const categories = BIZ_MENU_CATEGORIES;
  const canEdit = _menuCanEdit();

  return `
    <!-- Category Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none">
      <div class="biz-menu-cat-tab" data-cat="all" onclick="switchBizMenuCategory('all')" style="padding:8px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);white-space:nowrap;cursor:pointer;background:var(--primary);color:#fff;border:1px solid var(--primary)">Tümü (${items.length})</div>
      ${categories.map(c => {
        const count = items.filter(i => i.category === c).length;
        return count > 0 ? `<div class="biz-menu-cat-tab" data-cat="${c}" onclick="switchBizMenuCategory('${c}')" style="padding:8px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);white-space:nowrap;cursor:pointer;background:var(--bg-phone);color:var(--text-secondary);border:1px solid var(--border-subtle)">${c} (${count})</div>` : '';
      }).join('')}
    </div>

    <!-- Menu Items -->
    <div id="bizMenuItemsList" style="display:flex;flex-direction:column;gap:10px">
      ${renderBizMenuItems()}
    </div>

    ${canEdit ? `
    <div onclick="openProductCreationWizard()" style="margin-top:16px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
      <iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:#fff"></iconify-icon>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Ürün Oluştur</span>
    </div>` : ''}
  `;
}

/* ═══ COMBO PRODUCTS TAB ═══ */
function renderBizMenuComboTab() {
  const canEdit = _menuCanEdit();
  const combos = BIZ_COMBO_PRODUCTS.filter(c => c.branchId === bizActiveBranch);
  const singleProducts = BIZ_PRODUCTS.filter(p => p.branchId === bizActiveBranch && p.type === 'single');

  if (singleProducts.length === 0 && canEdit) {
    return `
    <div style="padding:40px 16px;text-align:center">
      <iconify-icon icon="solar:danger-triangle-bold" style="font-size:40px;color:#F59E0B;display:block;margin:0 auto 12px"></iconify-icon>
      <div style="font:var(--fw-semibold) var(--fs-md)/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">Önce Tekil Ürün Oluşturun</div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted);max-width:260px;margin:0 auto">Grup ürün oluşturabilmek için en az bir tekil ürün tanımlanmış olmalıdır.</div>
      <div onclick="switchBizMenuTab('single')" style="margin-top:16px;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:var(--primary);color:#fff;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer">
        <iconify-icon icon="solar:arrow-left-linear" style="font-size:14px"></iconify-icon> Tekil Ürünlere Git
      </div>
    </div>`;
  }

  return `
    <div id="bizMenuItemsList" style="display:flex;flex-direction:column;gap:10px">
      ${renderBizComboItems()}
    </div>
    ${canEdit ? `
    <div onclick="openComboCreationWizard()" style="margin-top:16px;background:linear-gradient(135deg,#8B5CF6,#6366F1);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
      <iconify-icon icon="solar:layers-bold" style="font-size:18px;color:#fff"></iconify-icon>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Grup Ürün Oluştur</span>
    </div>` : ''}
  `;
}

/* ═══ RENDER SINGLE MENU ITEMS LIST ═══ */
function renderBizMenuItems() {
  let items = _menuGetFilteredItems();
  if (bizMenuActiveCategory !== 'all') {
    items = items.filter(i => i.category === bizMenuActiveCategory);
  }

  if (items.length === 0) {
    return `<div style="padding:32px 16px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Bu kategoride ürün yok</div>`;
  }

  const canEdit = _menuCanEdit();

  return items.map(item => {
    const kitchenCat = BIZ_KITCHEN_CATEGORIES.find(c => c.id === item.kitchenCategory);
    const product = BIZ_PRODUCTS.find(p => p.menuItemId === item.id);
    const itemEditable = canEdit && _menuCanEditItem(item);
    const hasDetail = !!product;

    return `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:12px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);display:flex;gap:12px;align-items:center" ${hasDetail ? `onclick="openProductDetail('${product.id}')"` : ''}>
      <div style="width:48px;height:48px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border-subtle)">
        <iconify-icon icon="${kitchenCat ? kitchenCat.icon : 'solar:dish-bold'}" style="font-size:22px;color:${kitchenCat ? kitchenCat.color : 'var(--text-muted)'}"></iconify-icon>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(item.name)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${item.category}</span>
          ${kitchenCat ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);color:${kitchenCat.color};background:${kitchenCat.color}12">→ ${kitchenCat.name}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
          <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${item.price.toFixed(2)}</span>
          ${hasDetail && product.prepTime ? `<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)"><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px;vertical-align:-1px"></iconify-icon> ${product.prepTime} dk</span>` : ''}
          ${hasDetail && product.allergens && product.allergens.length > 0 ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);color:#EF4444;background:rgba(239,68,68,0.1)"><iconify-icon icon="solar:danger-triangle-linear" style="font-size:9px;vertical-align:-1px"></iconify-icon> ${product.allergens.length} alerjen</span>` : ''}
        </div>
      </div>
      ${itemEditable ? `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px" onclick="event.stopPropagation()">
        <div onclick="bizToggleMenuItem('${item.id}')" style="width:36px;height:20px;border-radius:10px;background:${item.status === 'active' ? 'var(--primary)' : 'var(--glass-card-strong)'};position:relative;cursor:pointer">
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${item.status === 'active' ? 'right:2px' : 'left:2px'}"></div>
        </div>
        <iconify-icon icon="solar:pen-linear" onclick="openProductCreationWizard('${item.id}')" style="font-size:16px;color:var(--text-muted);cursor:pointer"></iconify-icon>
      </div>` : `
      <div style="display:flex;align-items:center">
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 8px;border-radius:var(--r-full);color:${item.status === 'active' ? '#22C55E' : '#EF4444'};background:${item.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}">${item.status === 'active' ? 'Aktif' : 'Pasif'}</span>
      </div>`}
    </div>`;
  }).join('');
}

/* ═══ RENDER COMBO ITEMS LIST ═══ */
function renderBizComboItems() {
  let combos = BIZ_COMBO_PRODUCTS.filter(c => c.branchId === bizActiveBranch);

  if (combos.length === 0) {
    return `<div style="padding:32px 16px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Henüz grup ürün oluşturulmadı</div>`;
  }

  return combos.map(combo => {
    const discount = combo.originalTotalPrice > 0 ? Math.round((1 - combo.comboPrice / combo.originalTotalPrice) * 100) : 0;
    const itemNames = _getComboItemNames(combo);

    return `
    <div onclick="openComboDetail('${combo.id}')" style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);cursor:pointer">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="width:42px;height:42px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.15))">
          <iconify-icon icon="solar:layers-bold" style="font-size:20px;color:#8B5CF6"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(combo.name)}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">${itemNames}</div>
        </div>
        <div style="text-align:right">
          ${discount > 0 ? `<div style="font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.1);padding:3px 8px;border-radius:var(--r-full);margin-bottom:4px">%${discount} İndirim</div>` : ''}
          <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)">₺${combo.comboPrice.toFixed(2)}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-decoration:line-through">₺${combo.originalTotalPrice.toFixed(2)}</div>
        </div>
      </div>
      ${combo.allergens && combo.allergens.length > 0 ? `
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
        ${combo.allergens.map(aId => {
          const al = BIZ_ALLERGEN_LIST.find(a => a.id === aId);
          return al ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);color:${al.color};background:${al.color}12"><iconify-icon icon="${al.icon}" style="font-size:9px;vertical-align:-1px"></iconify-icon> ${al.label}</span>` : '';
        }).join('')}
      </div>` : ''}
    </div>`;
  }).join('');
}

function _getComboItemNames(combo) {
  const names = [];
  if (combo.includedProductIds) {
    combo.includedProductIds.forEach(pid => {
      const p = BIZ_PRODUCTS.find(x => x.id === pid);
      if (p) names.push(p.name);
    });
  }
  if (combo.includedMenuItemIds) {
    combo.includedMenuItemIds.forEach(mid => {
      const m = BIZ_MENU_ITEMS.find(x => x.id === mid);
      if (m) names.push(m.name);
    });
  }
  return names.join(' + ') || 'Ürün yok';
}

/* ═══ TOGGLE MENU ITEM ═══ */
function bizToggleMenuItem(itemId) {
  if (!_menuCanEdit()) return;
  const item = BIZ_MENU_ITEMS.find(i => i.id === itemId);
  if (item && _menuCanEditItem(item)) {
    item.status = item.status === 'active' ? 'inactive' : 'active';
    // Sync combo stock
    _syncComboStock();
    const list = document.getElementById('bizMenuItemsList');
    if (list) list.innerHTML = renderBizMenuItems();
  }
}

/* ═══ STOCK SYNC: If a single product is out-of-stock, combos using it become unavailable ═══ */
function _syncComboStock() {
  BIZ_COMBO_PRODUCTS.forEach(combo => {
    if (!combo.includedProductIds) return;
    const anyInactive = combo.includedProductIds.some(pid => {
      const p = BIZ_PRODUCTS.find(x => x.id === pid);
      if (p && p.menuItemId) {
        const mi = BIZ_MENU_ITEMS.find(m => m.id === p.menuItemId);
        return mi && mi.status === 'inactive';
      }
      return p && p.status === 'inactive';
    });
    const anyMenuInactive = (combo.includedMenuItemIds || []).some(mid => {
      const mi = BIZ_MENU_ITEMS.find(m => m.id === mid);
      return mi && mi.status === 'inactive';
    });
    if (anyInactive || anyMenuInactive) {
      combo.status = 'inactive';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CREATION WIZARD — SINGLE ITEM
   ══════════════════════════════════════════════════════════════ */

let _wizardState = {};

function openProductCreationWizard(editMenuItemId) {
  if (!_menuCanEdit()) return;

  const isEdit = !!editMenuItemId;
  let existingMenuItem = null;
  let existingProduct = null;

  if (isEdit) {
    existingMenuItem = BIZ_MENU_ITEMS.find(i => i.id === editMenuItemId);
    existingProduct = BIZ_PRODUCTS.find(p => p.menuItemId === editMenuItemId);
  }

  _wizardState = {
    step: 1,
    isEdit: isEdit,
    editMenuItemId: editMenuItemId || null,
    editProductId: existingProduct ? existingProduct.id : null,
    // Step 1: Temel Bilgiler
    images: existingProduct && existingProduct.images ? existingProduct.images.slice() : [],
    name: existingMenuItem ? existingMenuItem.name : '',
    description: existingProduct ? existingProduct.description : '',
    prepTime: existingProduct ? existingProduct.prepTime : '',
    category: existingMenuItem ? existingMenuItem.category : '',
    kitchenCategory: existingMenuItem ? existingMenuItem.kitchenCategory : '',
    // Step 2: Malzeme & Modifikasyon
    ingredients: existingProduct ? JSON.parse(JSON.stringify(existingProduct.ingredients)) : [],
    variations: existingProduct ? JSON.parse(JSON.stringify(existingProduct.variations)) : [],
    // Step 3: AI Analiz & Fiyatlandırma
    basePrice: existingMenuItem ? existingMenuItem.price : '',
    allergens: existingProduct ? [...(existingProduct.allergens || [])] : [],
    aiAnalysis: existingProduct ? { ...existingProduct.aiAnalysis } : null,
    // Step 4: Yayınlama
    publishType: 'now', // 'now' | 'scheduled'
    publishDate: existingProduct ? existingProduct.publishDate : null
  };

  _renderWizard();
}

function _renderWizard() {
  const existing = document.getElementById('bizProductWizard');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'bizProductWizard';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-page);z-index:70;display:flex;flex-direction:column;overflow:hidden';

  const steps = [
    { num: 1, label: 'Temel Bilgiler', icon: 'solar:document-text-bold' },
    { num: 2, label: 'Malzeme', icon: 'solar:list-check-bold' },
    { num: 3, label: 'AI & Fiyat', icon: 'solar:star-circle-bold' },
    { num: 4, label: 'Yayınla', icon: 'solar:rocket-bold' }
  ];

  const title = _wizardState.isEdit ? 'Ürün Düzenle' : 'Ürün Oluştur';

  overlay.innerHTML = `
    <!-- Header -->
    <div style="padding:max(env(safe-area-inset-top),16px) var(--app-px) 10px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);flex-shrink:0">
      <div class="btn-icon" onclick="closeProductWizard()"><iconify-icon icon="solar:close-circle-linear" style="font-size:22px"></iconify-icon></div>
      <span style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary);flex:1">${title}</span>
      <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Adım ${_wizardState.step}/4</span>
    </div>

    <!-- Step Indicator -->
    <div style="display:flex;gap:4px;padding:12px var(--app-px) 0">
      ${steps.map(s => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="height:3px;width:100%;border-radius:2px;background:${s.num <= _wizardState.step ? 'var(--primary)' : 'var(--glass-card-strong)'};transition:background .3s"></div>
          <div style="display:flex;align-items:center;gap:3px">
            <iconify-icon icon="${s.icon}" style="font-size:10px;color:${s.num === _wizardState.step ? 'var(--primary)' : 'var(--text-muted)'}"></iconify-icon>
            <span style="font:var(--fw-medium) 9px/1 var(--font);color:${s.num === _wizardState.step ? 'var(--primary)' : 'var(--text-muted)'}">${s.label}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Body -->
    <div id="wizardBody" style="flex:1;overflow-y:auto;padding:16px var(--app-px) 100px">
      ${_renderWizardStep()}
    </div>

    <!-- Footer Actions -->
    <div style="position:fixed;bottom:0;left:0;right:0;padding:12px var(--app-px) max(env(safe-area-inset-bottom),16px);background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border-top:1px solid var(--border-subtle);display:flex;gap:10px">
      ${_wizardState.step > 1 ? `
      <div onclick="wizardPrevStep()" style="flex:1;padding:14px;text-align:center;border-radius:var(--r-xl);border:1px solid var(--border-subtle);cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-secondary)">
        <iconify-icon icon="solar:arrow-left-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon> Geri
      </div>` : ''}
      <div onclick="wizardNextStep()" style="flex:2;padding:14px;text-align:center;border-radius:var(--r-xl);background:${_wizardState.step === 4 ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'var(--primary)'};cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">
        ${_wizardState.step === 4 ? (_wizardState.publishType === 'now' ? '<iconify-icon icon="solar:rocket-bold" style="font-size:14px;vertical-align:-2px"></iconify-icon> Yayınla' : '<iconify-icon icon="solar:calendar-bold" style="font-size:14px;vertical-align:-2px"></iconify-icon> Planla') : 'Devam <iconify-icon icon="solar:arrow-right-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon>'}
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(overlay);
}

function closeProductWizard() {
  const el = document.getElementById('bizProductWizard');
  if (el) el.remove();
  _wizardState = {};
}

function wizardNextStep() {
  if (_wizardState.step === 1 && !_validateStep1()) return;
  if (_wizardState.step === 2) _collectStep2Data();
  if (_wizardState.step === 3 && !_validateStep3()) return;
  if (_wizardState.step === 4) { _saveProduct(); return; }
  _wizardState.step++;
  if (_wizardState.step === 3) _runAiAnalysis();
  _renderWizard();
}

function wizardPrevStep() {
  if (_wizardState.step > 1) {
    if (_wizardState.step === 2) _collectStep2Data();
    _wizardState.step--;
    _renderWizard();
  }
}

/* ═══ STEP 1: TEMEL BİLGİLER ═══ */
function _renderWizardStep() {
  switch (_wizardState.step) {
    case 1: return _renderStep1();
    case 2: return _renderStep2();
    case 3: return _renderStep3();
    case 4: return _renderStep4();
    default: return '';
  }
}

function _renderStep1() {
  const isChef = bizCurrentRole === 'chef';
  const chefStations = isChef ? _menuGetChefKitchenIds() : null;
  const availableKitchenCats = isChef
    ? BIZ_KITCHEN_CATEGORIES.filter(k => chefStations.includes(k.id))
    : BIZ_KITCHEN_CATEGORIES;

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Section Header -->
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(246,80,19,0.1)">
          <iconify-icon icon="solar:document-text-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Temel Bilgiler</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Ürün adı, açıklama ve kategori</div>
        </div>
      </div>

      <!-- Ürün Görselleri (zorunlu, en az 1 / en fazla 3) -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Ürün Görselleri *</label>
          <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">(en az 1, en fazla 3)</span>
          <button type="button" onclick="wizShowSampleImages()" style="margin-left:auto;padding:5px 10px;border:1px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-full);font:var(--fw-medium) 10px/1 var(--font);color:var(--text-secondary);cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <iconify-icon icon="solar:gallery-check-linear" style="font-size:12px"></iconify-icon>Örnek Fotoğraflar
          </button>
        </div>
        <div class="wiz-img-row">
          ${[0,1,2].map(idx => {
            const img = _wizardState.images[idx];
            if (img) {
              return `<div class="wiz-img-slot wiz-img-filled" draggable="true" ondragstart="wizImgDragStart(event,${idx})" ondragover="wizImgDragOver(event,${idx})" ondrop="wizImgDrop(event,${idx})" ondragend="wizImgDragEnd(event)">
                <img src="${img}" alt="">
                ${idx === 0 ? '<div class="wiz-img-cover">KAPAK</div>' : `<div class="wiz-img-idx">${idx + 1}</div>`}
                <div class="wiz-img-actions">
                  <div class="wiz-img-act" onclick="wizRemoveImage(${idx})" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon></div>
                </div>
              </div>`;
            } else if (idx === _wizardState.images.length) {
              return `<label class="wiz-img-slot wiz-img-add">
                <iconify-icon icon="solar:camera-add-bold" style="font-size:26px;color:var(--primary)"></iconify-icon>
                <span>${idx === 0 ? 'Kapak Ekle' : 'Görsel Ekle'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style="display:none" onchange="wizHandleImageUpload(this)">
              </label>`;
            }
            return `<div class="wiz-img-slot wiz-img-empty"><iconify-icon icon="solar:gallery-linear" style="font-size:20px;color:var(--text-tertiary)"></iconify-icon></div>`;
          }).join('')}
        </div>
        <div style="display:flex;align-items:flex-start;gap:6px;margin-top:8px;padding:8px 10px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.22);border-radius:var(--r-md)">
          <iconify-icon icon="solar:lightbulb-bold" style="font-size:14px;color:#16A34A;flex-shrink:0;margin-top:1px"></iconify-icon>
          <span style="font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-secondary)">Kaliteli ve iştah açıcı fotoğraflar sipariş oranını %40'a kadar artırır. Ürünün net göründüğü, iyi ışıklandırılmış fotoğraflar tercih edin.</span>
        </div>
      </div>

      <!-- Ürün Adı -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Ürün Adı *</label>
        <input id="wiz_name" type="text" value="${escHtml(_wizardState.name)}" placeholder="Menüde görünecek ürün adı" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
      </div>

      <!-- Açıklama -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Açıklama</label>
        <textarea id="wiz_desc" rows="3" placeholder="İştah kabartıcı kısa bir açıklama yazın..." style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;resize:none;box-sizing:border-box">${escHtml(_wizardState.description)}</textarea>
      </div>

      <!-- Teslimat Süresi -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Tahmini Hazırlanma Süresi (dk) *</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input id="wiz_prepTime" type="number" min="1" max="180" value="${_wizardState.prepTime}" placeholder="25" style="flex:1;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
          <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">dakika</span>
        </div>
        <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px">
          <iconify-icon icon="solar:info-circle-linear" style="font-size:10px;vertical-align:-1px"></iconify-icon> Teslimat ücreti mahalle bazlı ayarlarınızdan otomatik çekilir.
        </div>
      </div>

      <!-- Menü Kategorisi -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:8px">Menü Kategorisi *</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${BIZ_MENU_CATEGORIES.map(c => {
            const sel = _wizardState.category === c;
            return `<div onclick="wizSelectCat('${c}')" style="padding:8px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer;border:1px solid ${sel ? 'var(--primary)' : 'var(--border-subtle)'};background:${sel ? 'var(--primary)' : 'var(--bg-phone)'};color:${sel ? '#fff' : 'var(--text-secondary)'};transition:all .15s">${c}</div>`;
          }).join('')}
        </div>
      </div>

      <!-- Mutfak İstasyonu -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:4px">Mutfak İstasyonu *</label>
        <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-bottom:8px">Sipariş hangi mutfak istasyonuna düşsün?</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${availableKitchenCats.map(k => {
            const sel = _wizardState.kitchenCategory === k.id;
            return `<div onclick="wizSelectKitchen('${k.id}')" style="padding:8px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;gap:5px;border:1px solid ${sel ? k.color : 'var(--border-subtle)'};background:${sel ? k.color + '15' : 'var(--bg-phone)'};color:${sel ? k.color : 'var(--text-secondary)'};transition:all .15s">
              <iconify-icon icon="${k.icon}" style="font-size:13px;color:${k.color}"></iconify-icon>${k.name}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ═══ STEP 1 — ÜRÜN GÖRSELLERİ (zorunlu, 3 slot, drag-drop) ═══ */
const _WIZ_MAX_IMAGES = 3;
const _WIZ_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function _wizToast(msg) {
  if (typeof _admToast === 'function') _admToast(msg, 'err');
  else alert(msg);
}

function wizHandleImageUpload(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;

  const remaining = _WIZ_MAX_IMAGES - _wizardState.images.length;
  if (remaining <= 0) {
    _wizToast('En fazla ' + _WIZ_MAX_IMAGES + ' fotoğraf yükleyebilirsiniz.');
    input.value = '';
    return;
  }
  if (files.length > remaining) {
    _wizToast(remaining + ' slot kaldı. İlk ' + remaining + ' fotoğraf yüklendi.');
  }

  const accepted = files.slice(0, remaining).filter(f => {
    if (!_WIZ_ALLOWED_MIMES.includes(f.type)) {
      _wizToast('Desteklenmeyen format: ' + f.name + ' (yalnızca JPG/PNG)');
      return false;
    }
    return true;
  });

  let loaded = 0;
  const target = accepted.length;
  if (target === 0) { input.value = ''; return; }

  accepted.forEach(f => {
    const reader = new FileReader();
    reader.onload = (e) => {
      _wizardState.images.push(e.target.result);
      loaded++;
      if (loaded === target) {
        input.value = '';
        _wizRefreshStep1();
      }
    };
    reader.readAsDataURL(f);
  });
}

function wizRemoveImage(idx) {
  _wizardState.images.splice(idx, 1);
  _wizRefreshStep1();
}

/* Drag-drop sıralama — hangi fotoğraf kapak olacak */
let _wizDragIdx = null;
function wizImgDragStart(e, idx) {
  _wizDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', String(idx)); } catch(err) {}
  if (e.currentTarget && e.currentTarget.classList) e.currentTarget.classList.add('wiz-img-dragging');
}
function wizImgDragEnd(e) {
  if (e.currentTarget && e.currentTarget.classList) e.currentTarget.classList.remove('wiz-img-dragging');
  _wizDragIdx = null;
}
function wizImgDragOver(e, idx) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}
function wizImgDrop(e, toIdx) {
  e.preventDefault();
  if (_wizDragIdx === null || _wizDragIdx === toIdx) return;
  const moved = _wizardState.images.splice(_wizDragIdx, 1)[0];
  _wizardState.images.splice(toIdx, 0, moved);
  _wizDragIdx = null;
  _wizRefreshStep1();
}

function _wizRefreshStep1() {
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep1();
}

function wizShowSampleImages() {
  const overlay = document.createElement('div');
  overlay.id = 'wizSampleOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:85;display:flex;align-items:flex-end;justify-content:center;padding:16px';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  const samples = [
    { src:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', tip:'Yemek tam kadrajda, üstten çekim' },
    { src:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=400&fit=crop', tip:'Doğal ışık, net odak' },
    { src:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', tip:'Sade arka plan, renk kontrastı' },
    { src:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', tip:'Servis tabağıyla sunum' }
  ];
  overlay.innerHTML = `<div style="width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:18px;max-height:86vh;overflow-y:auto">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <iconify-icon icon="solar:gallery-check-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
      <div style="flex:1"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Örnek Fotoğraflar</div>
      <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Başarılı işletmelerden ilham al</div></div>
      <div onclick="document.getElementById('wizSampleOverlay').remove()" class="btn-icon" style="width:32px;height:32px"><iconify-icon icon="solar:close-circle-linear" style="font-size:18px"></iconify-icon></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${samples.map(s => `<div style="display:flex;flex-direction:column;gap:6px">
        <img src="${s.src}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r-lg);border:1px solid var(--border-subtle)">
        <span style="font:var(--fw-medium) 11px/1.3 var(--font);color:var(--text-secondary)">${s.tip}</span>
      </div>`).join('')}
    </div>
    <div style="margin-top:14px;padding:10px;background:rgba(246,80,19,0.06);border:1px solid rgba(246,80,19,0.2);border-radius:var(--r-md);font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-secondary)">
      <b style="color:var(--text-primary)">İpuçları:</b> üstten/45° açı · doğal veya yumuşak ışık · sade arka plan · gerçek porsiyon · markasız ve filtresiz.
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function _wizInjectImageStyles() {
  if (document.getElementById('wizImageStyles')) return;
  const s = document.createElement('style');
  s.id = 'wizImageStyles';
  s.textContent = [
    '.wiz-img-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}',
    '.wiz-img-slot{aspect-ratio:1;border-radius:var(--r-lg);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}',
    '.wiz-img-empty{background:var(--bg-phone);border:1.5px dashed var(--border-subtle)}',
    '.wiz-img-add{background:var(--bg-phone);border:1.5px dashed var(--primary);cursor:pointer;flex-direction:column;gap:4px;color:var(--primary);font:var(--fw-semibold) 11px/1 var(--font)}',
    '.wiz-img-add:hover{background:rgba(246,80,19,0.06)}',
    '.wiz-img-filled{background:var(--bg-phone);border:1px solid var(--border-subtle);cursor:grab}',
    '.wiz-img-filled:active{cursor:grabbing}',
    '.wiz-img-filled.wiz-img-dragging{opacity:.55}',
    '.wiz-img-filled img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}',
    '.wiz-img-cover{position:absolute;top:4px;left:4px;padding:2px 6px;border-radius:4px;background:var(--primary);color:#fff;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.4px}',
    '.wiz-img-idx{position:absolute;top:4px;left:4px;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.55);color:#fff;font:var(--fw-bold) 9px/1.4 var(--font)}',
    '.wiz-img-actions{position:absolute;top:4px;right:4px;display:flex;gap:4px}',
    '.wiz-img-act{width:24px;height:24px;border-radius:6px;background:rgba(0,0,0,0.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px)}'
  ].join('\n');
  document.head.appendChild(s);
}

// Styles'ı ilk wizard render'ında enjekte et
(function(){ if (typeof document !== 'undefined') _wizInjectImageStyles(); })();

function wizSelectCat(cat) {
  _wizardState.category = cat;
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep1();
}

function wizSelectKitchen(kid) {
  _wizardState.kitchenCategory = kid;
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep1();
}

function _validateStep1() {
  const name = document.getElementById('wiz_name');
  const prepTime = document.getElementById('wiz_prepTime');
  const desc = document.getElementById('wiz_desc');

  _wizardState.name = name ? name.value.trim() : _wizardState.name;
  _wizardState.description = desc ? desc.value.trim() : _wizardState.description;
  _wizardState.prepTime = prepTime ? parseInt(prepTime.value) : _wizardState.prepTime;

  if (!_wizardState.images || _wizardState.images.length < 1) { _wizToast('Lütfen en az bir ürün fotoğrafı ekleyin.'); return false; }
  if (!_wizardState.name) { alert('Ürün adı zorunludur.'); return false; }
  if (!_wizardState.prepTime || _wizardState.prepTime < 1) { alert('Hazırlanma süresi giriniz.'); return false; }
  if (!_wizardState.category) { alert('Menü kategorisi seçiniz.'); return false; }
  if (!_wizardState.kitchenCategory) { alert('Mutfak istasyonu seçiniz.'); return false; }
  return true;
}

/* ═══ STEP 2: MALZEME & MODİFİKASYON ═══ */
function _renderStep2() {
  const ings = _wizardState.ingredients;
  const vars = _wizardState.variations;

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Section Header -->
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,0.1)">
          <iconify-icon icon="solar:list-check-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Malzeme & Modifikasyon</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">İçerik listesi ve müşteri seçenekleri</div>
        </div>
      </div>

      <!-- Malzeme Listesi -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Malzeme Listesi</label>
          <div onclick="wizAddIngredient()" style="display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);background:rgba(34,197,94,0.1);color:#22C55E;font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer">
            <iconify-icon icon="solar:add-circle-linear" style="font-size:13px"></iconify-icon> Malzeme Ekle
          </div>
        </div>

        <div id="wizIngList" style="display:flex;flex-direction:column;gap:8px">
          ${ings.length === 0 ? `<div style="padding:20px;text-align:center;border:1px dashed var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted)">Henüz malzeme eklenmedi.<br>Malzeme ekleyerek başlayın.</div>` : ''}
          ${ings.map((ing, i) => `
            <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px 12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <input data-ing-name="${i}" type="text" value="${escHtml(ing.name)}" placeholder="Malzeme adı" style="flex:1;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none;box-sizing:border-box">
                <input data-ing-amount="${i}" type="text" value="${escHtml(ing.amount)}" placeholder="Miktar" style="width:60px;padding:8px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none;text-align:center;box-sizing:border-box">
                <select data-ing-unit="${i}" style="padding:8px 6px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none">
                  <option value="gr" ${ing.unit === 'gr' ? 'selected' : ''}>gr</option>
                  <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
                  <option value="adet" ${ing.unit === 'adet' ? 'selected' : ''}>adet</option>
                </select>
                <div onclick="wizRemoveIngredient(${i})" style="cursor:pointer;flex-shrink:0">
                  <iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:16px;color:#EF4444"></iconify-icon>
                </div>
              </div>
              <div style="display:flex;gap:12px;align-items:center">
                <label style="display:flex;align-items:center;gap:4px;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">
                  <input type="checkbox" data-ing-removable="${i}" ${ing.removable ? 'checked' : ''} style="accent-color:var(--primary)"> Çıkarılabilir
                </label>
                <label style="display:flex;align-items:center;gap:4px;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer">
                  <input type="checkbox" data-ing-customizable="${i}" ${ing.customizable ? 'checked' : ''} onchange="wizToggleCustomizable(${i}, this.checked)" style="accent-color:#8B5CF6"> Değiştirilebilir
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Varyasyonlar -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div>
            <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block">Varyasyonlar (Değişiklik Seçenekleri)</label>
            <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Müşterinin seçebileceği opsiyonlar ve ücret farkları</div>
          </div>
          <div onclick="wizAddVariation()" style="display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);background:rgba(139,92,246,0.1);color:#8B5CF6;font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer">
            <iconify-icon icon="solar:add-circle-linear" style="font-size:13px"></iconify-icon> Ekle
          </div>
        </div>

        <div id="wizVarList" style="display:flex;flex-direction:column;gap:8px">
          ${vars.length === 0 ? `<div style="padding:16px;text-align:center;border:1px dashed var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">Varyasyon eklenmedi</div>` : ''}
          ${vars.map((v, vi) => `
            <div style="background:var(--bg-phone);border:1px solid rgba(139,92,246,0.2);border-radius:var(--r-lg);padding:10px 12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <input data-var-label="${vi}" type="text" value="${escHtml(v.label)}" placeholder="Seçenek adı (Ekstra Et, Boyut...)" style="flex:1;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none;box-sizing:border-box">
                <select data-var-type="${vi}" style="padding:8px 6px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none">
                  ${BIZ_VARIATION_TYPES.map(vt => `<option value="${vt.id}" ${v.type === vt.id ? 'selected' : ''}>${vt.label}</option>`).join('')}
                </select>
                <div onclick="wizRemoveVariation(${vi})" style="cursor:pointer;flex-shrink:0">
                  <iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:16px;color:#EF4444"></iconify-icon>
                </div>
              </div>
              <!-- Variation Options -->
              <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
                ${(v.options || []).map((opt, oi) => `
                  <div style="display:flex;align-items:center;gap:6px">
                    <input data-varopt-value="${vi}-${oi}" type="text" value="${escHtml(opt.value)}" placeholder="Seçenek (Örn: +50 gr)" style="flex:1;padding:6px 8px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none;box-sizing:border-box">
                    <div style="display:flex;align-items:center;gap:2px">
                      <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">₺</span>
                      <input data-varopt-price="${vi}-${oi}" type="number" step="0.5" value="${opt.priceDiff}" placeholder="0" style="width:55px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);background:var(--bg-surface-alt);outline:none;text-align:center;box-sizing:border-box">
                    </div>
                    <div onclick="wizRemoveVarOption(${vi},${oi})" style="cursor:pointer"><iconify-icon icon="solar:close-circle-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></div>
                  </div>
                `).join('')}
                <div onclick="wizAddVarOption(${vi})" style="display:flex;align-items:center;gap:4px;padding:6px;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#8B5CF6;cursor:pointer">
                  <iconify-icon icon="solar:add-circle-linear" style="font-size:12px"></iconify-icon> Seçenek Ekle
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function wizAddIngredient() {
  _collectStep2Data();
  const newId = 'ing_new_' + Date.now();
  _wizardState.ingredients.push({ id: newId, name: '', amount: '', unit: 'gr', removable: false, customizable: false });
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function wizRemoveIngredient(idx) {
  _collectStep2Data();
  _wizardState.ingredients.splice(idx, 1);
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function wizToggleCustomizable(idx, checked) {
  // Auto-prompt for variation creation
}

function wizAddVariation() {
  _collectStep2Data();
  const newId = 'var_new_' + Date.now();
  _wizardState.variations.push({ id: newId, ingredientId: null, type: 'gr', label: '', options: [{ value: '', priceDiff: 0 }] });
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function wizRemoveVariation(idx) {
  _collectStep2Data();
  _wizardState.variations.splice(idx, 1);
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function wizAddVarOption(varIdx) {
  _collectStep2Data();
  if (!_wizardState.variations[varIdx].options) _wizardState.variations[varIdx].options = [];
  _wizardState.variations[varIdx].options.push({ value: '', priceDiff: 0 });
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function wizRemoveVarOption(varIdx, optIdx) {
  _collectStep2Data();
  _wizardState.variations[varIdx].options.splice(optIdx, 1);
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep2();
}

function _collectStep2Data() {
  // Collect ingredient data from DOM
  _wizardState.ingredients.forEach((ing, i) => {
    const nameEl = document.querySelector(`[data-ing-name="${i}"]`);
    const amountEl = document.querySelector(`[data-ing-amount="${i}"]`);
    const unitEl = document.querySelector(`[data-ing-unit="${i}"]`);
    const removableEl = document.querySelector(`[data-ing-removable="${i}"]`);
    const customEl = document.querySelector(`[data-ing-customizable="${i}"]`);
    if (nameEl) ing.name = nameEl.value.trim();
    if (amountEl) ing.amount = amountEl.value.trim();
    if (unitEl) ing.unit = unitEl.value;
    if (removableEl) ing.removable = removableEl.checked;
    if (customEl) ing.customizable = customEl.checked;
  });

  // Collect variation data from DOM
  _wizardState.variations.forEach((v, vi) => {
    const labelEl = document.querySelector(`[data-var-label="${vi}"]`);
    const typeEl = document.querySelector(`[data-var-type="${vi}"]`);
    if (labelEl) v.label = labelEl.value.trim();
    if (typeEl) v.type = typeEl.value;
    (v.options || []).forEach((opt, oi) => {
      const valEl = document.querySelector(`[data-varopt-value="${vi}-${oi}"]`);
      const priceEl = document.querySelector(`[data-varopt-price="${vi}-${oi}"]`);
      if (valEl) opt.value = valEl.value.trim();
      if (priceEl) opt.priceDiff = parseFloat(priceEl.value) || 0;
    });
  });
}

/* ═══ STEP 3: AI ANALİZ & FİYATLANDIRMA ═══ */
function _renderStep3() {
  const ai = _wizardState.aiAnalysis;
  const allergens = _wizardState.allergens;

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Section Header -->
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.1)">
          <iconify-icon icon="solar:star-circle-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">AI Analiz & Fiyatlandırma</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Otomatik analiz, alerjen ve fiyat</div>
        </div>
      </div>

      <!-- AI Analysis Card -->
      ${ai ? `
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05));border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:14px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          <iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#8B5CF6">AI Menü Analizi</span>
        </div>
        <!-- Nutrition -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${ai.calories}</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">kcal</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#22C55E">${ai.protein}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Protein</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#F59E0B">${ai.carbs}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Karbonhidrat</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#EF4444">${ai.fat}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Yağ</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#06B6D4">${ai.fiber}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Lif</div>
          </div>
        </div>
        <!-- Chef Note -->
        <div style="padding:10px 12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:var(--r-lg);margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
            <iconify-icon icon="solar:chef-hat-bold" style="font-size:12px;color:#F59E0B"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#F59E0B">Şefin Notu</span>
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">${escHtml(ai.chefNote)}</div>
        </div>
        <!-- Tags -->
        ${ai.tags && ai.tags.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${ai.tags.map(t => `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#8B5CF6;background:rgba(139,92,246,0.1)">${escHtml(t)}</span>`).join('')}
        </div>` : ''}
      </div>` : `
      <div style="padding:24px;text-align:center;background:var(--glass-card);border-radius:var(--r-xl)">
        <iconify-icon icon="solar:magic-stick-3-bold" style="font-size:32px;color:var(--text-muted);display:block;margin:0 auto 8px"></iconify-icon>
        <div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-muted)">Malzeme eklendikten sonra AI analiz otomatik oluşturulur</div>
      </div>`}

      <!-- Allergen Warning Check -->
      ${_wizardState._allergenWarning ? `
      <div style="padding:10px 12px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:var(--r-lg);display:flex;align-items:flex-start;gap:8px">
        <iconify-icon icon="solar:danger-triangle-bold" style="font-size:18px;color:#EF4444;flex-shrink:0;margin-top:1px"></iconify-icon>
        <div>
          <div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:#EF4444;margin-bottom:3px">AI Uyarısı: Tutarsızlık Tespit Edildi</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">${_wizardState._allergenWarning}</div>
        </div>
      </div>` : ''}

      <!-- Alerjen Seçimi -->
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>
          <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Alerjen & İntolerans Maddeleri *</label>
        </div>
        <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-bottom:10px">Ürünün içeriğinde bulunan maddeleri işaretleyin</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${BIZ_ALLERGEN_LIST.map(al => {
            const selected = allergens.includes(al.id);
            return `<div onclick="wizToggleAllergen('${al.id}')" style="padding:7px 12px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;display:flex;align-items:center;gap:5px;border:1px solid ${selected ? al.color : 'var(--border-subtle)'};background:${selected ? al.color + '15' : 'var(--bg-phone)'};color:${selected ? al.color : 'var(--text-secondary)'};transition:all .15s">
              <iconify-icon icon="${al.icon}" style="font-size:12px;color:${al.color}"></iconify-icon>${al.label}
              ${selected ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:12px"></iconify-icon>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Taban Fiyat -->
      <div>
        <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block;margin-bottom:6px">Taban Fiyat (₺) *</label>
        <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-bottom:8px">Değişiklikler hariç başlangıç fiyatı</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--primary)">₺</span>
          <input id="wiz_price" type="number" step="0.50" min="0" value="${_wizardState.basePrice}" placeholder="0.00" style="flex:1;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
      </div>
    </div>
  `;
}

function wizToggleAllergen(alId) {
  const idx = _wizardState.allergens.indexOf(alId);
  if (idx >= 0) _wizardState.allergens.splice(idx, 1);
  else _wizardState.allergens.push(alId);
  // Re-run AI allergen check
  _checkAllergenConsistency();
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep3();
}

function _runAiAnalysis() {
  const ings = _wizardState.ingredients.filter(i => i.name);
  if (ings.length === 0) {
    _wizardState.aiAnalysis = null;
    return;
  }

  // Simulated AI analysis based on ingredients
  let cal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
  const tags = [];
  const warnings = [];

  ings.forEach(ing => {
    const amt = parseFloat(ing.amount) || 50;
    const n = ing.name.toLowerCase();
    if (n.includes('et') || n.includes('kuzu') || n.includes('tavuk') || n.includes('köfte')) { cal += amt * 2.1; protein += amt * 0.2; fat += amt * 0.12; tags.push('Yüksek Protein'); }
    else if (n.includes('ekmek') || n.includes('lavaş') || n.includes('pirinç') || n.includes('un')) { cal += amt * 2.5; carbs += amt * 0.5; fiber += amt * 0.02; }
    else if (n.includes('yağ') || n.includes('tereyağ')) { cal += amt * 8; fat += amt * 0.8; }
    else if (n.includes('sebze') || n.includes('domates') || n.includes('biber') || n.includes('soğan') || n.includes('havuç') || n.includes('marul')) { cal += amt * 0.3; fiber += amt * 0.03; carbs += amt * 0.05; tags.push('Sebzeli'); }
    else if (n.includes('peynir') || n.includes('süt') || n.includes('yoğurt')) { cal += amt * 1.5; protein += amt * 0.1; fat += amt * 0.1; }
    else if (n.includes('mercimek') || n.includes('nohut') || n.includes('fasulye')) { cal += amt * 1.2; protein += amt * 0.08; carbs += amt * 0.2; fiber += amt * 0.05; tags.push('Baklagil'); }
    else { cal += amt * 1; carbs += amt * 0.1; }
  });

  // Chef note generation
  let chefNote = `${_wizardState.name} — `;
  if (protein > 20) chefNote += 'Protein açısından zengin bir seçim. ';
  if (fiber > 5) chefNote += 'Lifli içeriğiyle sağlıklı bir opsiyon. ';
  if (cal < 300) { chefNote += 'Hafif ve düşük kalorili. '; tags.push('Düşük Kalorili'); }
  if (cal > 500) { chefNote += 'Doyurucu bir porsiyon. '; tags.push('Doyurucu'); }
  chefNote += `${_wizardState.prepTime || 20} dakikada hazırlanır.`;

  // Allergen warnings from ingredients
  ings.forEach(ing => {
    const n = ing.name.toLowerCase();
    if ((n.includes('süt') || n.includes('peynir') || n.includes('yoğurt')) && !_wizardState.allergens.includes('laktoz')) {
      warnings.push('İçerikte süt ürünü var ancak Laktoz işaretlenmemiş.');
    }
    if ((n.includes('un') || n.includes('ekmek') || n.includes('lavaş') || n.includes('börek')) && !_wizardState.allergens.includes('gluten')) {
      warnings.push('İçerikte gluten kaynağı var ancak Gluten işaretlenmemiş.');
    }
    if ((n.includes('yumurta')) && !_wizardState.allergens.includes('yumurta')) {
      warnings.push('İçerikte yumurta var ancak Yumurta işaretlenmemiş.');
    }
    if ((n.includes('fıstık') || n.includes('fındık') || n.includes('ceviz') || n.includes('badem')) && !_wizardState.allergens.includes('fistik') && !_wizardState.allergens.includes('kabuklu')) {
      warnings.push('İçerikte kabuklu yemiş var ancak ilgili alerjen işaretlenmemiş.');
    }
    if ((n.includes('soya')) && !_wizardState.allergens.includes('soya')) {
      warnings.push('İçerikte soya var ancak Soya işaretlenmemiş.');
    }
    if ((n.includes('susam')) && !_wizardState.allergens.includes('susam')) {
      warnings.push('İçerikte susam var ancak Susam işaretlenmemiş.');
    }
  });

  _wizardState.aiAnalysis = {
    calories: Math.round(cal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    fiber: Math.round(fiber),
    chefNote: chefNote,
    allergenWarnings: [...new Set(warnings)],
    tags: [...new Set(tags)]
  };

  if (warnings.length > 0) {
    _wizardState._allergenWarning = warnings.join(' ');
  } else {
    _wizardState._allergenWarning = null;
  }
}

function _checkAllergenConsistency() {
  const ings = _wizardState.ingredients.filter(i => i.name);
  const warnings = [];

  ings.forEach(ing => {
    const n = ing.name.toLowerCase();
    if ((n.includes('süt') || n.includes('peynir') || n.includes('yoğurt')) && !_wizardState.allergens.includes('laktoz')) {
      warnings.push('İçerikte süt ürünü var ancak Laktoz işaretlenmemiş.');
    }
    if ((n.includes('un') || n.includes('ekmek') || n.includes('lavaş') || n.includes('börek')) && !_wizardState.allergens.includes('gluten')) {
      warnings.push('İçerikte gluten kaynağı var ancak Gluten işaretlenmemiş.');
    }
    if ((n.includes('yumurta')) && !_wizardState.allergens.includes('yumurta')) {
      warnings.push('İçerikte yumurta var ancak Yumurta işaretlenmemiş.');
    }
    if ((n.includes('fıstık') || n.includes('fındık') || n.includes('ceviz') || n.includes('badem')) && !_wizardState.allergens.includes('fistik') && !_wizardState.allergens.includes('kabuklu')) {
      warnings.push('İçerikte kabuklu yemiş var ancak ilgili alerjen işaretlenmemiş.');
    }
    if ((n.includes('soya')) && !_wizardState.allergens.includes('soya')) {
      warnings.push('İçerikte soya var ancak Soya işaretlenmemiş.');
    }
    if ((n.includes('susam')) && !_wizardState.allergens.includes('susam')) {
      warnings.push('İçerikte susam var ancak Susam işaretlenmemiş.');
    }
  });

  _wizardState._allergenWarning = warnings.length > 0 ? [...new Set(warnings)].join(' ') : null;
  if (_wizardState.aiAnalysis) {
    _wizardState.aiAnalysis.allergenWarnings = [...new Set(warnings)];
  }
}

function _validateStep3() {
  const priceEl = document.getElementById('wiz_price');
  _wizardState.basePrice = priceEl ? parseFloat(priceEl.value) : _wizardState.basePrice;
  if (!_wizardState.basePrice || _wizardState.basePrice <= 0) { alert('Taban fiyat giriniz.'); return false; }
  return true;
}

/* ═══ STEP 4: YAYINLAMA PLANI ═══ */
function _renderStep4() {
  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Section Header -->
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,0.1)">
          <iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Yayınlama Planı</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Ürünü hemen veya ileri tarihte yayınlayın</div>
        </div>
      </div>

      <!-- Product Preview Card -->
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;box-shadow:var(--shadow-md)">
        <div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Ürün Özeti</div>
        <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">${escHtml(_wizardState.name)}</div>
        ${_wizardState.description ? `<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);margin-bottom:10px">${escHtml(_wizardState.description)}</div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 10px;border-radius:var(--r-full);color:var(--primary);background:var(--primary-soft)">${_wizardState.category}</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 10px;border-radius:var(--r-full);color:var(--text-secondary);background:var(--glass-card)"><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px;vertical-align:-1px"></iconify-icon> ${_wizardState.prepTime} dk</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 10px;border-radius:var(--r-full);color:var(--text-secondary);background:var(--glass-card)">${_wizardState.ingredients.filter(i=>i.name).length} malzeme</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 10px;border-radius:var(--r-full);color:var(--text-secondary);background:var(--glass-card)">${_wizardState.variations.length} varyasyon</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border-subtle)">
          <div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Taban Fiyat</div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--primary);margin-top:2px">₺${parseFloat(_wizardState.basePrice).toFixed(2)}</div>
          </div>
          ${_wizardState.allergens.length > 0 ? `
          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;max-width:60%">
            ${_wizardState.allergens.map(aId => {
              const al = BIZ_ALLERGEN_LIST.find(a => a.id === aId);
              return al ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:3px 6px;border-radius:var(--r-full);color:${al.color};background:${al.color}12"><iconify-icon icon="${al.icon}" style="font-size:9px;vertical-align:-1px"></iconify-icon> ${al.label}</span>` : '';
            }).join('')}
          </div>` : ''}
        </div>
      </div>

      <!-- Publish Options -->
      <div>
        <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block;margin-bottom:10px">Yayın Zamanı</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div onclick="wizSetPublishType('now')" style="padding:14px 16px;border-radius:var(--r-xl);border:2px solid ${_wizardState.publishType === 'now' ? 'var(--primary)' : 'var(--border-subtle)'};background:${_wizardState.publishType === 'now' ? 'var(--primary-soft)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${_wizardState.publishType === 'now' ? 'var(--primary)' : 'var(--glass-card)'}">
              <iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:${_wizardState.publishType === 'now' ? '#fff' : 'var(--text-muted)'}"></iconify-icon>
            </div>
            <div>
              <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Hemen Yayınla</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Ürün anında menüde görünür</div>
            </div>
          </div>

          <div onclick="wizSetPublishType('scheduled')" style="padding:14px 16px;border-radius:var(--r-xl);border:2px solid ${_wizardState.publishType === 'scheduled' ? '#8B5CF6' : 'var(--border-subtle)'};background:${_wizardState.publishType === 'scheduled' ? 'rgba(139,92,246,0.05)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${_wizardState.publishType === 'scheduled' ? '#8B5CF6' : 'var(--glass-card)'}">
              <iconify-icon icon="solar:calendar-bold" style="font-size:18px;color:${_wizardState.publishType === 'scheduled' ? '#fff' : 'var(--text-muted)'}"></iconify-icon>
            </div>
            <div>
              <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Zamanlanmış Yayın</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Takvimden tarih ve saat seçin</div>
            </div>
          </div>
        </div>
      </div>

      ${_wizardState.publishType === 'scheduled' ? `
      <div style="display:flex;gap:10px">
        <div style="flex:1">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Tarih</label>
          <input id="wiz_pubDate" type="date" value="${_wizardState.publishDate ? _wizardState.publishDate.split('T')[0] : ''}" style="width:100%;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Saat</label>
          <input id="wiz_pubTime" type="time" value="${_wizardState.publishDate ? _wizardState.publishDate.split('T')[1] || '12:00' : '12:00'}" style="width:100%;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
      </div>` : ''}
    </div>
  `;
}

function wizSetPublishType(type) {
  _wizardState.publishType = type;
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = _renderStep4();
}

/* ═══ SAVE PRODUCT ═══ */
function _saveProduct() {
  // Collect scheduled date if applicable
  let publishDate = null;
  let status = 'active';
  if (_wizardState.publishType === 'scheduled') {
    const dateEl = document.getElementById('wiz_pubDate');
    const timeEl = document.getElementById('wiz_pubTime');
    if (dateEl && dateEl.value && timeEl && timeEl.value) {
      publishDate = dateEl.value + 'T' + timeEl.value + ':00Z';
      status = 'scheduled';
    } else {
      alert('Zamanlanmış yayın için tarih ve saat seçiniz.');
      return;
    }
  }

  const now = new Date().toISOString();

  if (_wizardState.isEdit && _wizardState.editMenuItemId) {
    // Update existing menu item
    const mi = BIZ_MENU_ITEMS.find(i => i.id === _wizardState.editMenuItemId);
    if (mi) {
      mi.name = _wizardState.name;
      mi.price = _wizardState.basePrice;
      mi.category = _wizardState.category;
      mi.kitchenCategory = _wizardState.kitchenCategory;
      mi.status = status;
    }
    // Update or create product record
    let prod = BIZ_PRODUCTS.find(p => p.menuItemId === _wizardState.editMenuItemId);
    if (prod) {
      Object.assign(prod, {
        name: _wizardState.name,
        description: _wizardState.description,
        prepTime: _wizardState.prepTime,
        basePrice: _wizardState.basePrice,
        category: _wizardState.category,
        kitchenCategory: _wizardState.kitchenCategory,
        status: status,
        publishDate: publishDate,
        images: _wizardState.images.slice(),
        image: _wizardState.images[0] || null,
        ingredients: _wizardState.ingredients.filter(i => i.name),
        variations: _wizardState.variations.filter(v => v.label),
        allergens: _wizardState.allergens,
        aiAnalysis: _wizardState.aiAnalysis,
        updatedAt: now
      });
    } else {
      BIZ_PRODUCTS.push(_buildProductObject(_wizardState.editMenuItemId, status, publishDate, now));
    }
  } else {
    // Create new menu item
    const newMenuId = 'mi_' + String(BIZ_MENU_ITEMS.length + 1).padStart(2, '0') + '_' + Date.now();
    BIZ_MENU_ITEMS.push({
      id: newMenuId,
      name: _wizardState.name,
      price: _wizardState.basePrice,
      category: _wizardState.category,
      kitchenCategory: _wizardState.kitchenCategory,
      status: status,
      branchId: bizActiveBranch
    });
    // Create product record
    BIZ_PRODUCTS.push(_buildProductObject(newMenuId, status, publishDate, now));
  }

  _syncComboStock();
  closeProductWizard();

  // Refresh menu list
  const overlay = document.getElementById('bizMenuOverlay');
  if (overlay) {
    overlay.remove();
    openBizMenuMgmt();
  }
}

function _buildProductObject(menuItemId, status, publishDate, now) {
  return {
    id: 'prod_' + Date.now(),
    branchId: bizActiveBranch,
    type: 'single',
    name: _wizardState.name,
    description: _wizardState.description,
    prepTime: _wizardState.prepTime,
    basePrice: _wizardState.basePrice,
    category: _wizardState.category,
    kitchenCategory: _wizardState.kitchenCategory,
    status: status,
    publishDate: publishDate,
    menuItemId: menuItemId,
    images: _wizardState.images.slice(),
    image: _wizardState.images[0] || null,
    ingredients: _wizardState.ingredients.filter(i => i.name),
    variations: _wizardState.variations.filter(v => v.label),
    allergens: _wizardState.allergens,
    aiAnalysis: _wizardState.aiAnalysis,
    createdAt: now,
    updatedAt: now
  };
}

/* ══════════════════════════════════════════════════════════════
   COMBO CREATION WIZARD
   ══════════════════════════════════════════════════════════════ */

let _comboState = {};

function openComboCreationWizard(editComboId) {
  if (!_menuCanEdit()) return;

  const singleProducts = BIZ_PRODUCTS.filter(p => p.branchId === bizActiveBranch && p.type === 'single');
  const activeMenuItems = BIZ_MENU_ITEMS.filter(m => m.branchId === bizActiveBranch && m.status === 'active');

  if (singleProducts.length === 0) {
    alert('Grup ürün oluşturabilmek için önce en az bir tekil ürün tanımlamalısınız.');
    return;
  }

  const isEdit = !!editComboId;
  let existingCombo = isEdit ? BIZ_COMBO_PRODUCTS.find(c => c.id === editComboId) : null;

  _comboState = {
    step: 1,
    isEdit: isEdit,
    editComboId: editComboId || null,
    images: existingCombo && existingCombo.images ? existingCombo.images.slice() : [],
    name: existingCombo ? existingCombo.name : '',
    description: existingCombo ? existingCombo.description : '',
    category: existingCombo ? existingCombo.category : '',
    selectedProductIds: existingCombo ? [...(existingCombo.includedProductIds || [])] : [],
    selectedMenuItemIds: existingCombo ? [...(existingCombo.includedMenuItemIds || [])] : [],
    comboPrice: existingCombo ? existingCombo.comboPrice : '',
    publishType: 'now',
    publishDate: existingCombo ? existingCombo.publishDate : null,
    aiAnalysis: existingCombo ? { ...existingCombo.aiAnalysis } : null,
    allergens: existingCombo ? [...(existingCombo.allergens || [])] : []
  };

  _renderComboWizard();
}

function _renderComboWizard() {
  const existing = document.getElementById('bizComboWizard');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'bizComboWizard';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-page);z-index:70;display:flex;flex-direction:column;overflow:hidden';

  const steps = [
    { num: 1, label: 'Ürün Seç', icon: 'solar:checklist-bold' },
    { num: 2, label: 'Fiyat & Analiz', icon: 'solar:tag-price-bold' },
    { num: 3, label: 'Yayınla', icon: 'solar:rocket-bold' }
  ];

  overlay.innerHTML = `
    <div style="padding:max(env(safe-area-inset-top),16px) var(--app-px) 10px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);flex-shrink:0">
      <div class="btn-icon" onclick="closeComboWizard()"><iconify-icon icon="solar:close-circle-linear" style="font-size:22px"></iconify-icon></div>
      <span style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary);flex:1">${_comboState.isEdit ? 'Grup Ürün Düzenle' : 'Grup Ürün Oluştur'}</span>
      <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Adım ${_comboState.step}/3</span>
    </div>

    <div style="display:flex;gap:4px;padding:12px var(--app-px) 0">
      ${steps.map(s => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="height:3px;width:100%;border-radius:2px;background:${s.num <= _comboState.step ? '#8B5CF6' : 'var(--glass-card-strong)'};transition:background .3s"></div>
          <div style="display:flex;align-items:center;gap:3px">
            <iconify-icon icon="${s.icon}" style="font-size:10px;color:${s.num === _comboState.step ? '#8B5CF6' : 'var(--text-muted)'}"></iconify-icon>
            <span style="font:var(--fw-medium) 9px/1 var(--font);color:${s.num === _comboState.step ? '#8B5CF6' : 'var(--text-muted)'}">${s.label}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div id="comboWizBody" style="flex:1;overflow-y:auto;padding:16px var(--app-px) 100px">
      ${_renderComboStep()}
    </div>

    <div style="position:fixed;bottom:0;left:0;right:0;padding:12px var(--app-px) max(env(safe-area-inset-bottom),16px);background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border-top:1px solid var(--border-subtle);display:flex;gap:10px">
      ${_comboState.step > 1 ? `
      <div onclick="comboWizPrev()" style="flex:1;padding:14px;text-align:center;border-radius:var(--r-xl);border:1px solid var(--border-subtle);cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-secondary)">
        <iconify-icon icon="solar:arrow-left-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon> Geri
      </div>` : ''}
      <div onclick="comboWizNext()" style="flex:2;padding:14px;text-align:center;border-radius:var(--r-xl);background:${_comboState.step === 3 ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'linear-gradient(135deg,#8B5CF6,#6366F1)'};cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">
        ${_comboState.step === 3 ? '<iconify-icon icon="solar:rocket-bold" style="font-size:14px;vertical-align:-2px"></iconify-icon> Yayınla' : 'Devam <iconify-icon icon="solar:arrow-right-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon>'}
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(overlay);
}

function closeComboWizard() {
  const el = document.getElementById('bizComboWizard');
  if (el) el.remove();
  _comboState = {};
}

function comboWizNext() {
  if (_comboState.step === 1) {
    _collectComboStep1();
    if (!_comboState.images || _comboState.images.length < 1) {
      _wizToast('Grubunuzun en az bir görseli olmalıdır');
      return;
    }
    if (_comboState.selectedProductIds.length + _comboState.selectedMenuItemIds.length < 2) {
      alert('En az 2 ürün seçmelisiniz.');
      return;
    }
    if (!_comboState.name.trim()) { alert('Paket adı giriniz.'); return; }
    _runComboAiAnalysis();
  }
  if (_comboState.step === 2) {
    _collectComboStep2();
    if (!_comboState.comboPrice || _comboState.comboPrice <= 0) { alert('Kampanyalı fiyat giriniz.'); return; }
  }
  if (_comboState.step === 3) { _saveCombo(); return; }
  _comboState.step++;
  _renderComboWizard();
}

function comboWizPrev() {
  if (_comboState.step === 2) _collectComboStep2();
  if (_comboState.step > 1) { _comboState.step--; _renderComboWizard(); }
}

function _renderComboStep() {
  switch (_comboState.step) {
    case 1: return _renderComboStep1();
    case 2: return _renderComboStep2();
    case 3: return _renderComboStep3();
    default: return '';
  }
}

/* ═══ COMBO STEP 1: ÜRÜN SEÇİMİ ═══ */
function _renderComboStep1() {
  const products = BIZ_PRODUCTS.filter(p => p.branchId === bizActiveBranch && p.type === 'single');
  const menuOnlyItems = BIZ_MENU_ITEMS.filter(m => {
    return m.branchId === bizActiveBranch && m.status === 'active' && !BIZ_PRODUCTS.some(p => p.menuItemId === m.id);
  });

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.1)">
          <iconify-icon icon="solar:checklist-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Ürün Seçimi & Gruplama</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Pakete dahil edilecek ürünleri seçin</div>
        </div>
      </div>

      <!-- Grup Ürün Görselleri (zorunlu, en az 1 / en fazla 3) -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Paket Görselleri *</label>
          <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">(en az 1, en fazla 3)</span>
        </div>
        <div class="wiz-img-row">
          ${[0,1,2].map(idx => {
            const img = _comboState.images[idx];
            if (img) {
              return `<div class="wiz-img-slot wiz-img-filled" draggable="true" ondragstart="comboImgDragStart(event,${idx})" ondragover="comboImgDragOver(event,${idx})" ondrop="comboImgDrop(event,${idx})" ondragend="comboImgDragEnd(event)">
                <img src="${img}" alt="">
                ${idx === 0 ? '<div class="wiz-img-cover">KAPAK</div>' : `<div class="wiz-img-idx">${idx + 1}</div>`}
                <div class="wiz-img-actions">
                  <div class="wiz-img-act" onclick="comboRemoveImage(${idx})" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon></div>
                </div>
              </div>`;
            } else if (idx === _comboState.images.length) {
              return `<label class="wiz-img-slot wiz-img-add" style="border-color:#8B5CF6;color:#8B5CF6">
                <iconify-icon icon="solar:camera-add-bold" style="font-size:26px"></iconify-icon>
                <span>${idx === 0 ? 'Kapak Ekle' : 'Görsel Ekle'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style="display:none" onchange="comboHandleImageUpload(this)">
              </label>`;
            }
            return `<div class="wiz-img-slot wiz-img-empty"><iconify-icon icon="solar:gallery-linear" style="font-size:20px;color:var(--text-tertiary)"></iconify-icon></div>`;
          }).join('')}
        </div>
        <div style="display:flex;align-items:flex-start;gap:6px;margin-top:8px;padding:8px 10px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.22);border-radius:var(--r-md)">
          <iconify-icon icon="solar:lightbulb-bold" style="font-size:14px;color:#8B5CF6;flex-shrink:0;margin-top:1px"></iconify-icon>
          <span style="font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-secondary)">Grup ürün fotoğraflarında paket içeriğindeki tüm ürünlerin bir arada göründüğü bir sunum tercih etmeniz, kullanıcı güvenini artırır.</span>
        </div>
        ${_comboState.images.length >= 2 ? `
        <div style="margin-top:10px;padding:10px;border:1px dashed var(--border-subtle);border-radius:var(--r-md);background:var(--bg-btn)">
          <div style="font:var(--fw-bold) 10px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-bottom:8px">Menüde nasıl görünecek</div>
          <div style="display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none" class="combo-preview-carousel">
            ${_comboState.images.map(src => `<img src="${src}" style="width:90px;height:90px;border-radius:var(--r-md);object-fit:cover;flex-shrink:0;scroll-snap-align:start">`).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- Combo Name -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Paket Adı *</label>
        <input id="combo_name" type="text" value="${escHtml(_comboState.name)}" placeholder="Örn: Kebap Menü, Aile Paketi..." style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
      </div>

      <!-- Combo Description -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Açıklama</label>
        <textarea id="combo_desc" rows="2" placeholder="Paket açıklaması..." style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;resize:none;box-sizing:border-box">${escHtml(_comboState.description)}</textarea>
      </div>

      <!-- Category -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:8px">Kategori *</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${BIZ_MENU_CATEGORIES.map(c => {
            const sel = _comboState.category === c;
            return `<div onclick="comboSelectCat('${c}')" style="padding:7px 12px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;border:1px solid ${sel ? '#8B5CF6' : 'var(--border-subtle)'};background:${sel ? 'rgba(139,92,246,0.1)' : 'var(--bg-phone)'};color:${sel ? '#8B5CF6' : 'var(--text-secondary)'}">${c}</div>`;
          }).join('')}
        </div>
      </div>

      <!-- Detailed Products (with full data) -->
      ${products.length > 0 ? `
      <div>
        <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block;margin-bottom:8px">Detaylı Ürünler</label>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${products.map(p => {
            const selected = _comboState.selectedProductIds.includes(p.id);
            return `<div onclick="comboToggleProduct('${p.id}')" style="padding:12px;border-radius:var(--r-lg);border:2px solid ${selected ? '#8B5CF6' : 'var(--border-subtle)'};background:${selected ? 'rgba(139,92,246,0.04)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:10px">
              <div style="width:22px;height:22px;border-radius:6px;border:2px solid ${selected ? '#8B5CF6' : 'var(--border-subtle)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${selected ? '#8B5CF6' : 'transparent'}">
                ${selected ? '<iconify-icon icon="solar:check-read-bold" style="font-size:12px;color:#fff"></iconify-icon>' : ''}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(p.name)}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${p.category} · ${p.prepTime} dk</div>
              </div>
              <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${p.basePrice.toFixed(2)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Menu-only items -->
      ${menuOnlyItems.length > 0 ? `
      <div>
        <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block;margin-bottom:8px">Diğer Menü Ürünleri</label>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${menuOnlyItems.map(m => {
            const selected = _comboState.selectedMenuItemIds.includes(m.id);
            return `<div onclick="comboToggleMenuItem('${m.id}')" style="padding:12px;border-radius:var(--r-lg);border:2px solid ${selected ? '#8B5CF6' : 'var(--border-subtle)'};background:${selected ? 'rgba(139,92,246,0.04)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:10px">
              <div style="width:22px;height:22px;border-radius:6px;border:2px solid ${selected ? '#8B5CF6' : 'var(--border-subtle)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${selected ? '#8B5CF6' : 'transparent'}">
                ${selected ? '<iconify-icon icon="solar:check-read-bold" style="font-size:12px;color:#fff"></iconify-icon>' : ''}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(m.name)}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${m.category}</div>
              </div>
              <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺${m.price.toFixed(2)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Selection Summary -->
      <div id="comboSelectionSummary" style="padding:10px 14px;background:var(--glass-card);border-radius:var(--r-lg)">
        ${_renderComboSelectionSummary()}
      </div>
    </div>
  `;
}

function comboSelectCat(cat) {
  _comboState.category = cat;
  const body = document.getElementById('comboWizBody');
  if (body) body.innerHTML = _renderComboStep1();
}

function comboToggleProduct(pid) {
  const idx = _comboState.selectedProductIds.indexOf(pid);
  if (idx >= 0) _comboState.selectedProductIds.splice(idx, 1);
  else _comboState.selectedProductIds.push(pid);
  const body = document.getElementById('comboWizBody');
  if (body) body.innerHTML = _renderComboStep1();
}

function comboToggleMenuItem(mid) {
  const idx = _comboState.selectedMenuItemIds.indexOf(mid);
  if (idx >= 0) _comboState.selectedMenuItemIds.splice(idx, 1);
  else _comboState.selectedMenuItemIds.push(mid);
  const body = document.getElementById('comboWizBody');
  if (body) body.innerHTML = _renderComboStep1();
}

function _getComboTotalPrice() {
  let total = 0;
  _comboState.selectedProductIds.forEach(pid => {
    const p = BIZ_PRODUCTS.find(x => x.id === pid);
    if (p) total += p.basePrice;
  });
  _comboState.selectedMenuItemIds.forEach(mid => {
    const m = BIZ_MENU_ITEMS.find(x => x.id === mid);
    if (m) total += m.price;
  });
  return total;
}

function _renderComboSelectionSummary() {
  const count = _comboState.selectedProductIds.length + _comboState.selectedMenuItemIds.length;
  const total = _getComboTotalPrice();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${count} ürün seçildi</span>
      </div>
      <div>
        <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Toplam:</span>
        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary);margin-left:4px">₺${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

function _collectComboStep1() {
  const nameEl = document.getElementById('combo_name');
  const descEl = document.getElementById('combo_desc');
  if (nameEl) _comboState.name = nameEl.value.trim();
  if (descEl) _comboState.description = descEl.value.trim();
}

/* ═══ COMBO — Görsel Yükleme (wizard ile aynı standart) ═══ */
function comboHandleImageUpload(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  _comboState.images = _comboState.images || [];
  const remaining = _WIZ_MAX_IMAGES - _comboState.images.length;
  if (remaining <= 0) { _wizToast('En fazla ' + _WIZ_MAX_IMAGES + ' fotoğraf yükleyebilirsiniz.'); input.value = ''; return; }
  if (files.length > remaining) _wizToast(remaining + ' slot kaldı. İlk ' + remaining + ' fotoğraf yüklendi.');

  const accepted = files.slice(0, remaining).filter(f => {
    if (!_WIZ_ALLOWED_MIMES.includes(f.type)) { _wizToast('Desteklenmeyen format: ' + f.name + ' (yalnızca JPG/PNG/WEBP)'); return false; }
    return true;
  });
  if (!accepted.length) { input.value = ''; return; }

  let loaded = 0;
  accepted.forEach(f => {
    const reader = new FileReader();
    reader.onload = (e) => {
      _comboState.images.push(e.target.result);
      loaded++;
      if (loaded === accepted.length) { input.value = ''; _comboRefreshStep1(); }
    };
    reader.readAsDataURL(f);
  });
}

function comboRemoveImage(idx) {
  _comboState.images.splice(idx, 1);
  _comboRefreshStep1();
}

let _comboDragIdx = null;
function comboImgDragStart(e, idx) {
  _comboDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', String(idx)); } catch(err) {}
  if (e.currentTarget && e.currentTarget.classList) e.currentTarget.classList.add('wiz-img-dragging');
}
function comboImgDragEnd(e) {
  if (e.currentTarget && e.currentTarget.classList) e.currentTarget.classList.remove('wiz-img-dragging');
  _comboDragIdx = null;
}
function comboImgDragOver(e, idx) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function comboImgDrop(e, toIdx) {
  e.preventDefault();
  if (_comboDragIdx === null || _comboDragIdx === toIdx) return;
  const moved = _comboState.images.splice(_comboDragIdx, 1)[0];
  _comboState.images.splice(toIdx, 0, moved);
  _comboDragIdx = null;
  _comboRefreshStep1();
}

function _comboRefreshStep1() {
  _collectComboStep1();
  const body = document.getElementById('comboWizBody');
  if (body) body.innerHTML = _renderComboStep1();
}

/* ═══ COMBO STEP 2: FİYAT & AI ANALİZ ═══ */
function _renderComboStep2() {
  const total = _getComboTotalPrice();
  const ai = _comboState.aiAnalysis;
  const allergens = _comboState.allergens;

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.1)">
          <iconify-icon icon="solar:tag-price-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Fiyatlandırma & Analiz</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Kampanyalı fiyat ve AI karma analizi</div>
        </div>
      </div>

      <!-- AI Combo Analysis -->
      ${ai ? `
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05));border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:14px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          <iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#8B5CF6">AI Paket Analizi</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px">
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${ai.calories}</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">kcal</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#22C55E">${ai.protein}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Protein</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#F59E0B">${ai.carbs}g</div>
            <div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Karbonhidrat</div>
          </div>
        </div>
        ${ai.chefNote ? `
        <div style="padding:8px 10px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:var(--r-lg)">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
            <iconify-icon icon="solar:chef-hat-bold" style="font-size:11px;color:#F59E0B"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#F59E0B">Şefin Notu</span>
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">${escHtml(ai.chefNote)}</div>
        </div>` : ''}
      </div>` : ''}

      <!-- Cumulative Allergens -->
      ${allergens.length > 0 ? `
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>
          <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Kümülatif Alerjen Tablosu</label>
        </div>
        <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-bottom:8px">Paketteki tüm ürünlerin alerjen verilerinden otomatik derlenmiştir</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${allergens.map(aId => {
            const al = BIZ_ALLERGEN_LIST.find(a => a.id === aId);
            return al ? `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:5px 10px;border-radius:var(--r-full);color:${al.color};background:${al.color}12;display:flex;align-items:center;gap:4px"><iconify-icon icon="${al.icon}" style="font-size:12px"></iconify-icon>${al.label}</span>` : '';
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Pricing -->
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:12px">Fiyatlandırma Stratejisi</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">Tekil Fiyatlar Toplamı</span>
          <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">₺${total.toFixed(2)}</span>
        </div>
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Kampanyalı Fiyat (₺) *</label>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:#8B5CF6">₺</span>
            <input id="combo_price" type="number" step="0.50" min="0" value="${_comboState.comboPrice}" placeholder="${(total * 0.85).toFixed(2)}" style="flex:1;padding:12px 14px;border:1px solid rgba(139,92,246,0.3);border-radius:var(--r-lg);font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
          </div>
          ${_comboState.comboPrice && _comboState.comboPrice < total ? `
          <div style="margin-top:8px;padding:8px 12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:var(--r-lg);display:flex;align-items:center;gap:6px">
            <iconify-icon icon="solar:tag-price-bold" style="font-size:14px;color:#22C55E"></iconify-icon>
            <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#22C55E">%${Math.round((1 - _comboState.comboPrice / total) * 100)} indirim uygulanacak</span>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function _collectComboStep2() {
  const priceEl = document.getElementById('combo_price');
  if (priceEl) _comboState.comboPrice = parseFloat(priceEl.value) || 0;
}

function _runComboAiAnalysis() {
  let cal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
  const allAllergens = new Set();
  const tags = [];

  _comboState.selectedProductIds.forEach(pid => {
    const p = BIZ_PRODUCTS.find(x => x.id === pid);
    if (p && p.aiAnalysis) {
      cal += p.aiAnalysis.calories || 0;
      protein += p.aiAnalysis.protein || 0;
      carbs += p.aiAnalysis.carbs || 0;
      fat += p.aiAnalysis.fat || 0;
      fiber += p.aiAnalysis.fiber || 0;
    }
    if (p && p.allergens) p.allergens.forEach(a => allAllergens.add(a));
  });

  _comboState.selectedMenuItemIds.forEach(mid => {
    const m = BIZ_MENU_ITEMS.find(x => x.id === mid);
    if (m) { cal += 120; carbs += 10; } // Rough estimate for menu-only items
  });

  _comboState.allergens = [...allAllergens];

  let chefNote = `${_comboState.name} — `;
  if (_comboState.selectedProductIds.length + _comboState.selectedMenuItemIds.length >= 3) {
    chefNote += 'Zengin içerikli bir paket. ';
    tags.push('Avantajlı Paket');
  }
  if (cal > 600) chefNote += 'Doyurucu bir öğün olarak idealdir.';
  else chefNote += 'Hafif bir öğün tercihi.';

  _comboState.aiAnalysis = {
    calories: Math.round(cal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    fiber: Math.round(fiber),
    chefNote: chefNote,
    allergenWarnings: [],
    tags: [...new Set(tags)]
  };
}

/* ═══ COMBO STEP 3: YAYINLA ═══ */
function _renderComboStep3() {
  const total = _getComboTotalPrice();
  const discount = total > 0 && _comboState.comboPrice < total ? Math.round((1 - _comboState.comboPrice / total) * 100) : 0;
  const names = [];
  _comboState.selectedProductIds.forEach(pid => { const p = BIZ_PRODUCTS.find(x => x.id === pid); if (p) names.push(p.name); });
  _comboState.selectedMenuItemIds.forEach(mid => { const m = BIZ_MENU_ITEMS.find(x => x.id === mid); if (m) names.push(m.name); });

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,0.1)">
          <iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Yayınlama Planı</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Paketinizi yayınlamaya hazır mısınız?</div>
        </div>
      </div>

      <!-- Summary Card -->
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.06));border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:16px">
        <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:6px">${escHtml(_comboState.name)}</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary);margin-bottom:10px">${names.join(' + ')}</div>
        <div style="display:flex;align-items:center;gap:12px;padding-top:10px;border-top:1px solid rgba(139,92,246,0.1)">
          <div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Kampanyalı Fiyat</div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:#8B5CF6;margin-top:2px">₺${parseFloat(_comboState.comboPrice).toFixed(2)}</div>
          </div>
          ${discount > 0 ? `<div style="padding:4px 10px;background:rgba(34,197,94,0.1);border-radius:var(--r-full);font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#22C55E">%${discount} İndirim</div>` : ''}
          <div style="margin-left:auto;text-align:right">
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Normal Fiyat</div>
            <div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted);text-decoration:line-through;margin-top:2px">₺${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- Publish Options -->
      <div>
        <label style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);display:block;margin-bottom:10px">Yayın Zamanı</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div onclick="comboSetPublishType('now')" style="padding:14px 16px;border-radius:var(--r-xl);border:2px solid ${_comboState.publishType === 'now' ? '#8B5CF6' : 'var(--border-subtle)'};background:${_comboState.publishType === 'now' ? 'rgba(139,92,246,0.05)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${_comboState.publishType === 'now' ? '#8B5CF6' : 'var(--glass-card)'}">
              <iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:${_comboState.publishType === 'now' ? '#fff' : 'var(--text-muted)'}"></iconify-icon>
            </div>
            <div>
              <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Hemen Yayınla</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Paket anında aktif olur</div>
            </div>
          </div>
          <div onclick="comboSetPublishType('scheduled')" style="padding:14px 16px;border-radius:var(--r-xl);border:2px solid ${_comboState.publishType === 'scheduled' ? '#8B5CF6' : 'var(--border-subtle)'};background:${_comboState.publishType === 'scheduled' ? 'rgba(139,92,246,0.05)' : 'var(--bg-phone)'};cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${_comboState.publishType === 'scheduled' ? '#8B5CF6' : 'var(--glass-card)'}">
              <iconify-icon icon="solar:calendar-bold" style="font-size:18px;color:${_comboState.publishType === 'scheduled' ? '#fff' : 'var(--text-muted)'}"></iconify-icon>
            </div>
            <div>
              <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Zamanlanmış Yayın</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Tarih ve saat belirleyin</div>
            </div>
          </div>
        </div>
      </div>

      ${_comboState.publishType === 'scheduled' ? `
      <div style="display:flex;gap:10px">
        <div style="flex:1">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Tarih</label>
          <input id="combo_pubDate" type="date" value="" style="width:100%;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Saat</label>
          <input id="combo_pubTime" type="time" value="12:00" style="width:100%;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
      </div>` : ''}
    </div>
  `;
}

function comboSetPublishType(type) {
  _comboState.publishType = type;
  const body = document.getElementById('comboWizBody');
  if (body) body.innerHTML = _renderComboStep3();
}

/* ═══ SAVE COMBO ═══ */
function _saveCombo() {
  let publishDate = null;
  let status = 'active';
  if (_comboState.publishType === 'scheduled') {
    const dateEl = document.getElementById('combo_pubDate');
    const timeEl = document.getElementById('combo_pubTime');
    if (dateEl && dateEl.value && timeEl && timeEl.value) {
      publishDate = dateEl.value + 'T' + timeEl.value + ':00Z';
      status = 'scheduled';
    } else {
      alert('Tarih ve saat seçiniz.');
      return;
    }
  }

  const total = _getComboTotalPrice();
  const now = new Date().toISOString();

  if (_comboState.isEdit && _comboState.editComboId) {
    const combo = BIZ_COMBO_PRODUCTS.find(c => c.id === _comboState.editComboId);
    if (combo) {
      Object.assign(combo, {
        name: _comboState.name,
        description: _comboState.description,
        category: _comboState.category,
        includedProductIds: _comboState.selectedProductIds,
        includedMenuItemIds: _comboState.selectedMenuItemIds,
        originalTotalPrice: total,
        comboPrice: _comboState.comboPrice,
        status: status,
        publishDate: publishDate,
        images: _comboState.images.slice(),
        image: _comboState.images[0] || null,
        allergens: _comboState.allergens,
        aiAnalysis: _comboState.aiAnalysis,
        updatedAt: now
      });
    }
  } else {
    BIZ_COMBO_PRODUCTS.push({
      id: 'combo_' + Date.now(),
      branchId: bizActiveBranch,
      type: 'combo',
      name: _comboState.name,
      description: _comboState.description,
      category: _comboState.category || 'Diğer',
      includedProductIds: _comboState.selectedProductIds,
      includedMenuItemIds: _comboState.selectedMenuItemIds,
      originalTotalPrice: total,
      comboPrice: _comboState.comboPrice,
      status: status,
      publishDate: publishDate,
      images: _comboState.images.slice(),
      image: _comboState.images[0] || null,
      allergens: _comboState.allergens,
      aiAnalysis: _comboState.aiAnalysis,
      createdAt: now,
      updatedAt: now
    });
  }

  closeComboWizard();

  // Refresh menu list on combo tab
  const overlay = document.getElementById('bizMenuOverlay');
  if (overlay) {
    overlay.remove();
    openBizMenuMgmt();
    setTimeout(() => switchBizMenuTab('combo'), 50);
  }
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT DETAIL VIEWER
   ══════════════════════════════════════════════════════════════ */

function openProductDetail(productId) {
  const product = BIZ_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const ai = product.aiAnalysis;
  const canEdit = _menuCanEdit();

  const content = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Product Header -->
      <div style="display:flex;align-items:center;gap:12px">
        <div style="flex:1">
          <div style="font:var(--fw-bold) var(--fs-xl)/1.2 var(--font);color:var(--text-primary)">${escHtml(product.name)}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 10px;border-radius:var(--r-full);color:var(--primary);background:var(--primary-soft)">${product.category}</span>
            <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)"><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px;vertical-align:-1px"></iconify-icon> ${product.prepTime} dk</span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font:var(--fw-bold) var(--fs-2xl)/1 var(--font);color:var(--primary)">₺${product.basePrice.toFixed(2)}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Taban Fiyat</div>
        </div>
      </div>

      ${product.description ? `<div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">${escHtml(product.description)}</div>` : ''}

      <!-- Ingredients -->
      ${product.ingredients && product.ingredients.length > 0 ? `
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px"><iconify-icon icon="solar:list-check-bold" style="font-size:14px;vertical-align:-2px;color:#22C55E"></iconify-icon> Malzemeler</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${product.ingredients.map(ing => `
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:5px 10px;border-radius:var(--r-full);color:var(--text-secondary);background:var(--glass-card);display:flex;align-items:center;gap:4px">
              ${escHtml(ing.name)} <span style="color:var(--text-muted)">${ing.amount} ${ing.unit}</span>
              ${ing.removable ? '<iconify-icon icon="solar:close-circle-linear" style="font-size:10px;color:#EF4444" title="Çıkarılabilir"></iconify-icon>' : ''}
              ${ing.customizable ? '<iconify-icon icon="solar:pen-linear" style="font-size:10px;color:#8B5CF6" title="Değiştirilebilir"></iconify-icon>' : ''}
            </span>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Variations -->
      ${product.variations && product.variations.length > 0 ? `
      <div style="background:var(--bg-phone);border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:14px">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px"><iconify-icon icon="solar:settings-bold" style="font-size:14px;vertical-align:-2px;color:#8B5CF6"></iconify-icon> Varyasyonlar</div>
        ${product.variations.map(v => `
          <div style="margin-bottom:8px">
            <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);margin-bottom:4px">${escHtml(v.label)} (${v.type})</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${(v.options || []).map(opt => `
                <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:rgba(139,92,246,0.06);color:var(--text-secondary)">${escHtml(opt.value)} ${opt.priceDiff > 0 ? '<span style="color:#22C55E">+₺' + opt.priceDiff + '</span>' : opt.priceDiff < 0 ? '<span style="color:#EF4444">-₺' + Math.abs(opt.priceDiff) + '</span>' : ''}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- AI Analysis -->
      ${ai ? `
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05));border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:14px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          <iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#8B5CF6">AI Besin Analizi</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:10px">
          <div style="text-align:center;padding:6px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${ai.calories}</div>
            <div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted);margin-top:2px">kcal</div>
          </div>
          <div style="text-align:center;padding:6px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#22C55E">${ai.protein}g</div>
            <div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted);margin-top:2px">Protein</div>
          </div>
          <div style="text-align:center;padding:6px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#F59E0B">${ai.carbs}g</div>
            <div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted);margin-top:2px">Karb</div>
          </div>
          <div style="text-align:center;padding:6px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#EF4444">${ai.fat}g</div>
            <div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted);margin-top:2px">Yağ</div>
          </div>
          <div style="text-align:center;padding:6px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#06B6D4">${ai.fiber}g</div>
            <div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted);margin-top:2px">Lif</div>
          </div>
        </div>
        ${ai.chefNote ? `
        <div style="padding:8px 10px;background:rgba(245,158,11,0.06);border-radius:var(--r-lg);margin-bottom:6px">
          <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#F59E0B"><iconify-icon icon="solar:chef-hat-bold" style="font-size:11px;vertical-align:-1px"></iconify-icon> Şefin Notu:</span>
          <span style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)"> ${escHtml(ai.chefNote)}</span>
        </div>` : ''}
        ${ai.tags && ai.tags.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${ai.tags.map(t => `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#8B5CF6;background:rgba(139,92,246,0.1)">${escHtml(t)}</span>`).join('')}
        </div>` : ''}
      </div>` : ''}

      <!-- Allergens -->
      ${product.allergens && product.allergens.length > 0 ? `
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Alerjen Bilgileri</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${product.allergens.map(aId => {
            const al = BIZ_ALLERGEN_LIST.find(a => a.id === aId);
            return al ? `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:5px 10px;border-radius:var(--r-full);color:${al.color};background:${al.color}12;display:flex;align-items:center;gap:4px"><iconify-icon icon="${al.icon}" style="font-size:12px"></iconify-icon>${al.label}</span>` : '';
          }).join('')}
        </div>
      </div>` : ''}

      ${canEdit ? `
      <div onclick="openProductCreationWizard('${product.menuItemId}')" style="margin-top:8px;padding:14px;background:var(--primary);border-radius:var(--r-xl);text-align:center;cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">
        <iconify-icon icon="solar:pen-bold" style="font-size:14px;vertical-align:-2px"></iconify-icon> Düzenle
      </div>` : ''}
    </div>
  `;

  const overlay = createBizOverlay('bizProductDetailOverlay', product.name, content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function openComboDetail(comboId) {
  const combo = BIZ_COMBO_PRODUCTS.find(c => c.id === comboId);
  if (!combo) return;

  const names = _getComboItemNames(combo);
  const discount = combo.originalTotalPrice > 0 ? Math.round((1 - combo.comboPrice / combo.originalTotalPrice) * 100) : 0;
  const ai = combo.aiAnalysis;
  const canEdit = _menuCanEdit();

  const content = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font:var(--fw-bold) var(--fs-xl)/1.2 var(--font);color:var(--text-primary)">${escHtml(combo.name)}</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);margin-top:4px">${escHtml(combo.description || '')}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
          <span style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:#8B5CF6">₺${combo.comboPrice.toFixed(2)}</span>
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted);text-decoration:line-through">₺${combo.originalTotalPrice.toFixed(2)}</span>
          ${discount > 0 ? `<span style="font:var(--fw-bold) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#22C55E;background:rgba(34,197,94,0.1)">%${discount} İndirim</span>` : ''}
        </div>
      </div>

      <!-- Included Items -->
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Paket İçeriği</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary)">${names}</div>
      </div>

      ${ai ? `
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05));border:1px solid rgba(139,92,246,0.15);border-radius:var(--r-xl);padding:14px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          <iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#8B5CF6">AI Paket Analizi</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${ai.calories} kcal</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#22C55E">${ai.protein}g P</div>
          </div>
          <div style="text-align:center;padding:8px;background:var(--bg-phone);border-radius:var(--r-lg)">
            <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#F59E0B">${ai.carbs}g K</div>
          </div>
        </div>
        ${ai.chefNote ? `<div style="margin-top:8px;font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)"><iconify-icon icon="solar:chef-hat-bold" style="font-size:11px;color:#F59E0B"></iconify-icon> ${escHtml(ai.chefNote)}</div>` : ''}
      </div>` : ''}

      ${combo.allergens && combo.allergens.length > 0 ? `
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Kümülatif Alerjenler</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${combo.allergens.map(aId => {
            const al = BIZ_ALLERGEN_LIST.find(a => a.id === aId);
            return al ? `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:5px 10px;border-radius:var(--r-full);color:${al.color};background:${al.color}12;display:flex;align-items:center;gap:4px"><iconify-icon icon="${al.icon}" style="font-size:12px"></iconify-icon>${al.label}</span>` : '';
          }).join('')}
        </div>
      </div>` : ''}

      ${canEdit ? `
      <div onclick="openComboCreationWizard('${combo.id}')" style="margin-top:8px;padding:14px;background:linear-gradient(135deg,#8B5CF6,#6366F1);border-radius:var(--r-xl);text-align:center;cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">
        <iconify-icon icon="solar:pen-bold" style="font-size:14px;vertical-align:-2px"></iconify-icon> Düzenle
      </div>` : ''}
    </div>
  `;

  const overlay = createBizOverlay('bizComboDetailOverlay', combo.name, content);
  document.getElementById('bizPhone').appendChild(overlay);
}

/* ═══ BACKWARD COMPATIBILITY — old function names ═══ */
function bizEditMenuItem(itemId) {
  if (!_menuCanEdit()) return;
  const item = BIZ_MENU_ITEMS.find(i => i.id === itemId);
  if (!item || !_menuCanEditItem(item)) return;
  openProductCreationWizard(itemId);
}

function bizOpenAddMenuItem() {
  openProductCreationWizard();
}

/* ═══════════════════════════════════════════════════════════════════
   MENÜ AYARLARI (Menu Settings)
   — Menü Yönetimi topbar'ındaki çark ikonundan açılır.
   — İki ana tile: Online Sipariş & Masa Siparişi.
   — Masa Siparişi 4 moddan birini seçtirir + koşullu online ödeme toggle.
   — Kalıcı state: _bizMenuSettings (aynı session içinde korunur).
   ─────────────────────────────────────────────────────────────────── */
let _bizMenuSettings = {
  tableOrderMode: 'full',      // 'menu_only' | 'waiter_only' | 'order_only' | 'full'
  tableOnlinePayment: true,    // Koşullu: mode !== 'menu_only' iken görünür/anlamlı
  onlineOrderingEnabled: true, // Online Sipariş modülü placeholder
  onlineDelivery: true,
  onlinePickup: true
};

const _BIZ_TABLE_ORDER_MODES = [
  {
    id: 'menu_only',
    label: 'Sadece QR Menü Görüntüle',
    desc: 'Müşteriler yalnızca ürünleri inceler, hiçbir etkileşim butonu görünmez.',
    icon: 'solar:eye-bold',
    color: '#6B7280'
  },
  {
    id: 'waiter_only',
    label: 'Sadece Garson Çağır',
    desc: 'Menü ile birlikte "Garson Çağır" butonu aktifleşir.',
    icon: 'solar:bell-bold',
    color: '#F59E0B'
  },
  {
    id: 'order_only',
    label: 'Sadece Sipariş Ver',
    desc: 'Menü ile birlikte sepete ekleme ve sipariş verme aktifleşir.',
    icon: 'solar:cart-large-bold',
    color: '#22C55E'
  },
  {
    id: 'full',
    label: 'Tam Hizmet (Sipariş + Garson)',
    desc: 'Hem sipariş verme hem garson çağırma aynı anda aktifleşir.',
    icon: 'solar:medal-ribbon-star-bold',
    color: '#8B5CF6'
  }
];

/* ─── Ana Menü Ayarları Sayfası ─── */
function openBizMenuSettings() {
  if (!bizRoleGuard('menu')) return;
  const content = _renderBizMenuSettingsHome();
  const overlay = createBizOverlay('bizMenuSettingsOverlay', 'Menü Ayarları', content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function _renderBizMenuSettingsHome() {
  const mode = _BIZ_TABLE_ORDER_MODES.find(m => m.id === _bizMenuSettings.tableOrderMode) || _BIZ_TABLE_ORDER_MODES[3];
  const onlineBadge = _bizMenuSettings.onlineOrderingEnabled
    ? '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.12);padding:4px 8px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><span style="width:5px;height:5px;border-radius:50%;background:#22C55E"></span>Aktif</span>'
    : '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);background:var(--glass-card);padding:4px 8px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><span style="width:5px;height:5px;border-radius:50%;background:var(--text-muted)"></span>Pasif</span>';

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <!-- Açıklama kartı -->
      <div style="background:linear-gradient(135deg,rgba(239,68,68,0.06) 0%,rgba(239,68,68,0) 100%);border:1px solid rgba(239,68,68,0.15);border-radius:var(--r-xl);padding:14px;display:flex;align-items:flex-start;gap:12px">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:info-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Menü Satış Kanallarını Yönet</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:4px">Restoranınızın hangi sipariş kanallarını açık tutacağını buradan yönetin.</div>
        </div>
      </div>

      <!-- Online Sipariş Tile -->
      <div onclick="openBizOnlineOrderSettings()" style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;position:relative;overflow:hidden">
        <div style="position:absolute;top:-18px;right:-18px;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,0.12) 0%,rgba(34,211,238,0) 70%)"></div>
        <div style="width:48px;height:48px;border-radius:14px;background:rgba(34,211,238,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative">
          <iconify-icon icon="solar:scooter-bold" style="font-size:26px;color:#0891B2"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0;position:relative">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Online Sipariş</span>
            ${onlineBadge}
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">Paket servis ve gel-al ayarları</div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-tertiary);flex-shrink:0;position:relative"></iconify-icon>
      </div>

      <!-- Masa Siparişi Tile -->
      <div onclick="openBizTableOrderSettings()" style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;position:relative;overflow:hidden">
        <div style="position:absolute;top:-18px;right:-18px;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.14) 0%,rgba(139,92,246,0) 70%)"></div>
        <div style="width:48px;height:48px;border-radius:14px;background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative">
          <iconify-icon icon="solar:qr-code-bold" style="font-size:26px;color:#7C3AED"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0;position:relative">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Masa Siparişi</span>
            <span style="font:var(--fw-semibold) 10px/1 var(--font);color:${mode.color};background:${mode.color}18;padding:4px 8px;border-radius:var(--r-full)">${mode.label.replace('Sadece ','').replace('Tam Hizmet (','').replace(')','')}</span>
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">QR menü, garson ve ödeme modu</div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-tertiary);flex-shrink:0;position:relative"></iconify-icon>
      </div>
    </div>
  `;
}

/* ─── Masa Siparişi Ayarları Sayfası ─── */
function openBizTableOrderSettings() {
  if (!bizRoleGuard('menu')) return;
  const overlay = createBizOverlay('bizTableOrderSettingsOverlay', 'Masa Siparişi Ayarları', _renderBizTableOrderSettings());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _renderBizTableOrderSettings() {
  const current = _bizMenuSettings.tableOrderMode;
  const showPayment = current !== 'menu_only';
  const payOn = !!_bizMenuSettings.tableOnlinePayment;

  /* Bilgilendirme notu */
  let html = `
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:var(--r-xl);padding:14px;display:flex;align-items:flex-start;gap:12px;margin-bottom:18px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-24px;right:-24px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,0.15) 0%,rgba(34,211,238,0) 70%)"></div>
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(34,211,238,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative">
        <iconify-icon icon="solar:notification-lines-remove-bold" style="font-size:20px;color:#22D3EE"></iconify-icon>
      </div>
      <div style="position:relative">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:#fff">Kullanıcılar yaptığınız seçimlere göre menüleri görüntüleyecektir.</div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:rgba(255,255,255,0.65);margin-top:4px">Her QR okutan müşteri bu modda hizmet alır. Değişiklik anında yansır.</div>
      </div>
    </div>
  `;

  /* Başlık */
  html += `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <iconify-icon icon="solar:widget-4-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
      <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Çalışma Modunu Seç</span>
    </div>
    <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:14px">Aynı anda yalnızca bir mod aktif olabilir.</div>
  `;

  /* Radio kartlar */
  html += '<div style="display:flex;flex-direction:column;gap:10px">';
  _BIZ_TABLE_ORDER_MODES.forEach(m => {
    const active = m.id === current;
    html += `
      <div onclick="_bizSetTableOrderMode('${m.id}')" style="background:${active ? 'rgba(239,68,68,0.05)' : 'var(--glass-card)'};border:1.5px solid ${active ? 'var(--primary)' : 'var(--border-subtle)'};border-radius:var(--r-xl);padding:14px;cursor:pointer;display:flex;align-items:flex-start;gap:12px;transition:all .2s">
        <!-- Radio -->
        <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${active ? 'var(--primary)' : 'var(--border-strong,#94a3b8)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
          ${active ? '<div style="width:10px;height:10px;border-radius:50%;background:var(--primary)"></div>' : ''}
        </div>
        <!-- Icon -->
        <div style="width:38px;height:38px;border-radius:10px;background:${m.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="${m.icon}" style="font-size:20px;color:${m.color}"></iconify-icon>
        </div>
        <!-- Text -->
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${m.label}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">${m.desc}</div>
          ${_bizRenderModeButtonPreview(m.id)}
        </div>
      </div>
    `;
  });
  html += '</div>';

  /* Koşullu Online Ödeme Alanı */
  html += `
    <div id="bizTableOnlinePayBlock" style="margin-top:20px;display:${showPayment ? 'block' : 'none'}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:wallet-money-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Ödeme Tercihleri</span>
      </div>
      <div style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:qr-code-bold" style="font-size:22px;color:#16A34A"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Masada Online Ödeme</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px" id="bizTableOnlinePayHint">${payOn
            ? 'Müşteri, hesabını uygulamadan (QR ödeme) kapatabilir.'
            : 'Ödeme sadece kasada veya masada fiziksel olarak alınır.'}</div>
        </div>
        <!-- Toggle -->
        <div id="bizTableOnlinePayToggle" onclick="_bizToggleTableOnlinePayment()" style="width:46px;height:26px;border-radius:13px;background:${payOn ? 'var(--primary)' : 'var(--border-strong,#94a3b8)'};position:relative;transition:background .2s;flex-shrink:0;cursor:pointer">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${payOn ? '23px' : '3px'};box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s"></div>
        </div>
      </div>
    </div>
  `;

  /* Müşteri Önizleme Kartı */
  html += _bizRenderCustomerPreview(current, showPayment && payOn);
  return html;
}

function _bizRenderModeButtonPreview(modeId) {
  /* Her mod kartının alt kısmında hangi butonların gözükeceğini chip olarak göster */
  const chips = [];
  if (modeId === 'menu_only') {
    chips.push({ label: 'Sadece Menü', color: '#6B7280', icon: 'solar:eye-linear' });
  }
  if (modeId === 'waiter_only' || modeId === 'full') {
    chips.push({ label: 'Garson Çağır', color: '#F59E0B', icon: 'solar:bell-linear' });
  }
  if (modeId === 'order_only' || modeId === 'full') {
    chips.push({ label: 'Sipariş Ver', color: '#22C55E', icon: 'solar:cart-large-linear' });
  }
  if (!chips.length) return '';
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">'
    + chips.map(c => `<span style="display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10px/1 var(--font);color:${c.color};background:${c.color}15;padding:5px 9px;border-radius:var(--r-full)"><iconify-icon icon="${c.icon}" style="font-size:11px"></iconify-icon>${c.label}</span>`).join('')
    + '</div>';
}

function _bizRenderCustomerPreview(modeId, payActive) {
  const showWaiter = (modeId === 'waiter_only' || modeId === 'full');
  const showOrder  = (modeId === 'order_only'  || modeId === 'full');
  const btns = [];
  if (!showWaiter && !showOrder) {
    btns.push('<div style="flex:1;padding:11px;text-align:center;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);background:var(--bg-phone);border-radius:var(--r-md);border:1px dashed var(--border-subtle)">Sadece Görüntüleme</div>');
  }
  if (showWaiter) btns.push('<div style="flex:1;padding:11px;text-align:center;font:var(--fw-semibold) 11px/1 var(--font);color:#fff;background:#F59E0B;border-radius:var(--r-md)"><iconify-icon icon="solar:bell-bold" style="font-size:12px;vertical-align:-2px"></iconify-icon> Garson</div>');
  if (showOrder)  btns.push('<div style="flex:1;padding:11px;text-align:center;font:var(--fw-semibold) 11px/1 var(--font);color:#fff;background:var(--primary);border-radius:var(--r-md)"><iconify-icon icon="solar:cart-large-bold" style="font-size:12px;vertical-align:-2px"></iconify-icon> Sipariş</div>');
  if (payActive)  btns.push('<div style="flex:1;padding:11px;text-align:center;font:var(--fw-semibold) 11px/1 var(--font);color:#fff;background:#0f172a;border-radius:var(--r-md)"><iconify-icon icon="solar:wallet-money-bold" style="font-size:12px;vertical-align:-2px"></iconify-icon> Öde</div>');

  return `
    <div style="margin-top:24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:smartphone-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Müşteri Önizlemesi</span>
      </div>
      <div style="background:linear-gradient(180deg,rgba(15,23,42,0.02) 0%,rgba(15,23,42,0) 100%);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px">
        <div style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 60%,#22d3ee 100%);border-radius:var(--r-lg);padding:10px 12px;display:flex;align-items:center;gap:10px;color:#fff;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center"><span style="font:var(--fw-bold) 13px/1 var(--font)">12</span></div>
          <div style="flex:1">
            <div style="font:var(--fw-bold) 12px/1.1 var(--font)">Lezzet Mutfak — Masa 12</div>
            <div style="font:var(--fw-regular) 10px/1.2 var(--font);opacity:.85">Kadıköy Şubesi • Canlı</div>
          </div>
        </div>
        <div style="display:flex;gap:6px">${btns.join('')}</div>
        <div style="margin-top:10px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);text-align:center">Müşterinin göreceği alt eylem çubuğu</div>
      </div>
    </div>
  `;
}

function _bizSetTableOrderMode(modeId) {
  _bizMenuSettings.tableOrderMode = modeId;
  /* Mod seçimi değiştiğinde, "menu_only"e geçerse ödeme bloğu gizlenir.
     Ödeme state'i korunur; tekrar açıldığında aynı değer yansır. */
  const content = document.querySelector('#bizTableOrderSettingsOverlay > div:nth-child(2)');
  if (content) content.innerHTML = _renderBizTableOrderSettings();
}

function _bizToggleTableOnlinePayment() {
  _bizMenuSettings.tableOnlinePayment = !_bizMenuSettings.tableOnlinePayment;
  const content = document.querySelector('#bizTableOrderSettingsOverlay > div:nth-child(2)');
  if (content) content.innerHTML = _renderBizTableOrderSettings();
}

/* ─── Online Sipariş Ayarları (placeholder) ─── */
function openBizOnlineOrderSettings() {
  if (!bizRoleGuard('menu')) return;
  const enabled = !!_bizMenuSettings.onlineOrderingEnabled;
  const delivery = !!_bizMenuSettings.onlineDelivery;
  const pickup = !!_bizMenuSettings.onlinePickup;

  const content = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Ana Toggle -->
      <div style="background:linear-gradient(135deg,rgba(8,145,178,0.08) 0%,rgba(8,145,178,0) 100%);border:1px solid rgba(8,145,178,0.2);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(8,145,178,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:scooter-bold" style="font-size:24px;color:#0891B2"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Online Sipariş</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">Restoranınız dijital sipariş almaya ${enabled ? 'açık' : 'kapalı'}</div>
        </div>
        <div onclick="_bizToggleOnlineOrdering()" style="width:46px;height:26px;border-radius:13px;background:${enabled ? '#0891B2' : 'var(--border-strong,#94a3b8)'};position:relative;transition:background .2s;flex-shrink:0;cursor:pointer">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${enabled ? '23px' : '3px'};box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s"></div>
        </div>
      </div>

      <!-- Alt seçenekler -->
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
        <iconify-icon icon="solar:tuning-2-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Teslimat Kanalları</span>
      </div>

      <div style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px;${enabled ? '' : 'opacity:0.5;pointer-events:none'}">
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:delivery-bold" style="font-size:22px;color:#F59E0B"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Paket Servis</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Kuryeyle müşteri adresine gönderim</div>
        </div>
        <div onclick="_bizToggleOnlineSub('onlineDelivery')" style="width:46px;height:26px;border-radius:13px;background:${delivery ? '#F59E0B' : 'var(--border-strong,#94a3b8)'};position:relative;transition:background .2s;flex-shrink:0;cursor:pointer">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${delivery ? '23px' : '3px'};box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s"></div>
        </div>
      </div>

      <div style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px;${enabled ? '' : 'opacity:0.5;pointer-events:none'}">
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(139,92,246,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:bag-4-bold" style="font-size:22px;color:#7C3AED"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Gel-Al</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Müşteri siparişini restoran üzerinden alır</div>
        </div>
        <div onclick="_bizToggleOnlineSub('onlinePickup')" style="width:46px;height:26px;border-radius:13px;background:${pickup ? '#7C3AED' : 'var(--border-strong,#94a3b8)'};position:relative;transition:background .2s;flex-shrink:0;cursor:pointer">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${pickup ? '23px' : '3px'};box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s"></div>
        </div>
      </div>

      <div style="padding:12px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.15);border-radius:var(--r-lg);display:flex;gap:10px;align-items:flex-start">
        <iconify-icon icon="solar:info-circle-linear" style="font-size:18px;color:#06B6D4;flex-shrink:0;margin-top:2px"></iconify-icon>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">Online sipariş detayları (min. tutar, teslimat alanı, mutfak kapatma saatleri) için ayrı bir ayar ekranı hazırlanacaktır.</div>
      </div>
    </div>
  `;

  const overlay = createBizOverlay('bizOnlineOrderSettingsOverlay', 'Online Sipariş Ayarları', content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function _bizToggleOnlineOrdering() {
  _bizMenuSettings.onlineOrderingEnabled = !_bizMenuSettings.onlineOrderingEnabled;
  openBizOnlineOrderSettings(); /* yeniden çiz */
}
function _bizToggleOnlineSub(key) {
  _bizMenuSettings[key] = !_bizMenuSettings[key];
  openBizOnlineOrderSettings();
}

/* ═══ BACKWARD COMPATIBILITY — expose globally ═══ */
if (typeof window !== 'undefined') {
  window.openBizMenuSettings = openBizMenuSettings;
  window.openBizTableOrderSettings = openBizTableOrderSettings;
  window.openBizOnlineOrderSettings = openBizOnlineOrderSettings;
  window._bizSetTableOrderMode = _bizSetTableOrderMode;
  window._bizToggleTableOnlinePayment = _bizToggleTableOnlinePayment;
  window._bizToggleOnlineOrdering = _bizToggleOnlineOrdering;
  window._bizToggleOnlineSub = _bizToggleOnlineSub;
}
