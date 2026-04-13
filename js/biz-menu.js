/* ═══ BIZ MENU COMPONENT ═══ */

let bizMenuActiveCategory = 'all';

/* ═══ ROLE-BASED MENU HELPERS ═══ */
function _menuCanEdit() {
  // owner, manager, chef can edit; cashier cannot
  return bizCurrentRole === 'owner' || bizCurrentRole === 'manager' || bizCurrentRole === 'chef';
}

function _menuGetChefKitchenIds() {
  // Reuse the same logic from biz-orders/biz-kitchen
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
  // Chef only sees items from their kitchen stations
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

function openBizMenuMgmt() {
  if (!bizRoleGuard('menu')) return;
  bizMenuActiveCategory = 'all';
  const overlay = createBizOverlay('bizMenuOverlay', 'Menü Yönetimi', renderBizMenuContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function switchBizMenuCategory(cat) {
  bizMenuActiveCategory = cat;
  const list = document.getElementById('bizMenuItemsList');
  if (list) list.innerHTML = renderBizMenuItems();

  document.querySelectorAll('.biz-menu-cat-tab').forEach(el => {
    const isActive = el.dataset.cat === cat;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });
}

function renderBizMenuContent() {
  const items = _menuGetFilteredItems();
  const categories = BIZ_MENU_CATEGORIES;
  const canEdit = _menuCanEdit();

  // Role banner for chef
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
    <!-- Add Item Button -->
    <div onclick="bizOpenAddMenuItem()" style="margin-top:16px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
      <iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:#fff"></iconify-icon>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Yeni Ürün Ekle</span>
    </div>
    ` : ''}
  `;
}

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
    const itemEditable = canEdit && _menuCanEditItem(item);
    return `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:12px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);display:flex;gap:12px;align-items:center">
      <div style="width:48px;height:48px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border-subtle)">
        <iconify-icon icon="${kitchenCat ? kitchenCat.icon : 'solar:dish-bold'}" style="font-size:22px;color:${kitchenCat ? kitchenCat.color : 'var(--text-muted)'}"></iconify-icon>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(item.name)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${item.category}</span>
          ${kitchenCat ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);color:${kitchenCat.color};background:${kitchenCat.color}12">→ ${kitchenCat.name}</span>` : ''}
        </div>
        <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);margin-top:4px">₺${item.price.toFixed(2)}</div>
      </div>
      ${itemEditable ? `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div onclick="bizToggleMenuItem('${item.id}')" style="width:36px;height:20px;border-radius:10px;background:${item.status === 'active' ? 'var(--primary)' : 'var(--glass-card-strong)'};position:relative;cursor:pointer">
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${item.status === 'active' ? 'right:2px' : 'left:2px'}"></div>
        </div>
        <iconify-icon icon="solar:pen-linear" onclick="bizEditMenuItem('${item.id}')" style="font-size:16px;color:var(--text-muted);cursor:pointer"></iconify-icon>
      </div>` : `
      <div style="display:flex;align-items:center">
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 8px;border-radius:var(--r-full);color:${item.status === 'active' ? '#22C55E' : '#EF4444'};background:${item.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}">${item.status === 'active' ? 'Aktif' : 'Pasif'}</span>
      </div>`}
    </div>`;
  }).join('');
}

function bizToggleMenuItem(itemId) {
  if (!_menuCanEdit()) return;
  const item = BIZ_MENU_ITEMS.find(i => i.id === itemId);
  if (item && _menuCanEditItem(item)) {
    item.status = item.status === 'active' ? 'inactive' : 'active';
    const list = document.getElementById('bizMenuItemsList');
    if (list) list.innerHTML = renderBizMenuItems();
  }
}

function bizEditMenuItem(itemId) {
  if (!_menuCanEdit()) return;
  const item = BIZ_MENU_ITEMS.find(i => i.id === itemId);
  if (!item || !_menuCanEditItem(item)) return;
  bizOpenMenuItemForm(item);
}

function bizOpenAddMenuItem() {
  if (!_menuCanEdit()) return;
  bizOpenMenuItemForm(null);
}

function bizOpenMenuItemForm(existingItem) {
  const isEdit = !!existingItem;
  const title = isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle';

  // Pre-set selections when editing
  _menuItemSelectedCat = isEdit ? existingItem.category : '';
  _menuItemSelectedKitchen = isEdit ? existingItem.kitchenCategory : '';

  // Chef can only assign to their own kitchen stations
  const isChef = bizCurrentRole === 'chef';
  const chefStations = isChef ? _menuGetChefKitchenIds() : null;
  const availableKitchenCats = isChef
    ? BIZ_KITCHEN_CATEGORIES.filter(k => chefStations.includes(k.id))
    : BIZ_KITCHEN_CATEGORIES;

  const modal = document.createElement('div');
  modal.id = 'bizMenuItemModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;width:100%;max-width:360px;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${title}</span>
        <div onclick="document.getElementById('bizMenuItemModal').remove()" style="cursor:pointer"><iconify-icon icon="solar:close-circle-linear" style="font-size:24px;color:var(--text-muted)"></iconify-icon></div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Ürün Adı</label>
          <input id="menuItemName" type="text" value="${isEdit ? escHtml(existingItem.name) : ''}" placeholder="Ürün adını girin" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>

        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Fiyat (₺)</label>
          <input id="menuItemPrice" type="number" step="0.50" value="${isEdit ? existingItem.price : ''}" placeholder="0.00" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>

        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Menü Kategorisi</label>
          <div style="display:flex;flex-wrap:wrap;gap:6px" id="menuItemCategoryPicker">
            ${BIZ_MENU_CATEGORIES.map(c => `
              <div onclick="bizSelectMenuCat(this,'${c}')" data-cat="${c}" style="padding:6px 12px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;border:1px solid ${isEdit && existingItem.category === c ? 'var(--primary)' : 'var(--border-subtle)'};background:${isEdit && existingItem.category === c ? 'var(--primary)' : 'var(--bg-phone)'};color:${isEdit && existingItem.category === c ? '#fff' : 'var(--text-secondary)'}">${c}</div>
            `).join('')}
          </div>
        </div>

        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Mutfak İstasyonu</label>
          <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-bottom:8px">Bu ürünün siparişi hangi mutfak istasyonuna düşsün?</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" id="menuItemKitchenPicker">
            ${availableKitchenCats.map(k => `
              <div onclick="bizSelectKitchenCat(this,'${k.id}')" data-kitchen="${k.id}" style="padding:6px 12px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;display:flex;align-items:center;gap:4px;border:1px solid ${isEdit && existingItem.kitchenCategory === k.id ? k.color : 'var(--border-subtle)'};background:${isEdit && existingItem.kitchenCategory === k.id ? k.color + '15' : 'var(--bg-phone)'};color:${isEdit && existingItem.kitchenCategory === k.id ? k.color : 'var(--text-secondary)'}">
                <iconify-icon icon="${k.icon}" style="font-size:12px;color:${k.color}"></iconify-icon>${k.name}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div onclick="bizSaveMenuItem('${isEdit ? existingItem.id : ''}')" style="margin-top:20px;background:var(--primary);border-radius:var(--r-lg);padding:12px;text-align:center;cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">${isEdit ? 'Güncelle' : 'Ekle'}</span>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

// Track selected values
let _menuItemSelectedCat = '';
let _menuItemSelectedKitchen = '';

function bizSelectMenuCat(el, cat) {
  _menuItemSelectedCat = cat;
  document.querySelectorAll('#menuItemCategoryPicker > div').forEach(d => {
    d.style.background = 'var(--bg-phone)';
    d.style.color = 'var(--text-secondary)';
    d.style.border = '1px solid var(--border-subtle)';
  });
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';
  el.style.border = '1px solid var(--primary)';
}

function bizSelectKitchenCat(el, kitchenId) {
  _menuItemSelectedKitchen = kitchenId;
  const cat = BIZ_KITCHEN_CATEGORIES.find(c => c.id === kitchenId);
  document.querySelectorAll('#menuItemKitchenPicker > div').forEach(d => {
    d.style.background = 'var(--bg-phone)';
    d.style.color = 'var(--text-secondary)';
    d.style.border = '1px solid var(--border-subtle)';
  });
  el.style.background = cat.color + '15';
  el.style.color = cat.color;
  el.style.border = '1px solid ' + cat.color;
}

function bizSaveMenuItem(existingId) {
  const name = document.getElementById('menuItemName').value.trim();
  const price = parseFloat(document.getElementById('menuItemPrice').value);
  const category = _menuItemSelectedCat;
  const kitchenCategory = _menuItemSelectedKitchen;

  if (!name || !price || !category || !kitchenCategory) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }

  if (existingId) {
    const item = BIZ_MENU_ITEMS.find(i => i.id === existingId);
    if (item) {
      item.name = name;
      item.price = price;
      item.category = category;
      item.kitchenCategory = kitchenCategory;
    }
  } else {
    const newId = 'mi_' + String(BIZ_MENU_ITEMS.length + 1).padStart(2, '0');
    BIZ_MENU_ITEMS.push({
      id: newId,
      name: name,
      price: price,
      category: category,
      kitchenCategory: kitchenCategory,
      status: 'active',
      branchId: bizActiveBranch
    });
  }

  // Close modal and refresh list
  const modal = document.getElementById('bizMenuItemModal');
  if (modal) modal.remove();

  const list = document.getElementById('bizMenuItemsList');
  if (list) list.innerHTML = renderBizMenuItems();

  // Reset selections
  _menuItemSelectedCat = '';
  _menuItemSelectedKitchen = '';
}
