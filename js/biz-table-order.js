/* ═══ BIZ TABLE — ADD ORDER FLOW ═══
   Opens a full-screen overlay with the menu, portion selection, and a
   kitchen note. On submit, pushes an order to BIZ_ORDERS, opens the table
   if it was empty, and refreshes the table detail view. */

let _bizAddOrderState = null;

function _bizAddOrderBranchMenu(branchId) {
  const items = (typeof BIZ_MENU_ITEMS !== 'undefined') ? BIZ_MENU_ITEMS : [];
  return items.filter(m => m.status !== 'inactive' && (!branchId || m.branchId === branchId));
}

function _bizNextOrderId() {
  const orders = (typeof BIZ_ORDERS !== 'undefined') ? BIZ_ORDERS : [];
  let max = 1000;
  orders.forEach(o => {
    const n = parseInt(String(o.id || '').replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return '#' + (max + 1);
}

function openBizAddOrderToTable(tableId) {
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (!table) return;
  const menu = _bizAddOrderBranchMenu(table.branchId);
  if (!menu.length) { alert('Bu şube için menü bulunamadı.'); return; }

  _bizAddOrderState = {
    tableId: tableId,
    cart: [],               // [{id,name,price,qty,portion,note}]
    kitchenNote: '',
    guestCount: Math.max(table.guestCount || 0, 1),
    query: '',
    category: 'all'
  };

  const existing = document.getElementById('bizAddOrderOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'bizAddOrderOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-page);z-index:80;display:flex;flex-direction:column;overflow:hidden';
  overlay.innerHTML = `
    <div style="padding:max(env(safe-area-inset-top),12px) var(--app-px) 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle);background:var(--glass-bg);backdrop-filter:var(--glass-blur);flex-shrink:0">
      <div class="btn-icon" onclick="closeBizAddOrder()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">Sipariş Ekle</div>
        <div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:2px">Masa ${table.number} · ${table.capacity} kişilik</div>
      </div>
      <div id="bizAddOrderCartChip" onclick="_bizAddOrderFocusCart()" style="display:none;align-items:center;gap:6px;padding:6px 10px;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer">
        <iconify-icon icon="solar:cart-large-bold" style="font-size:14px"></iconify-icon><span id="bizAddOrderCartChipCount">0</span>
      </div>
    </div>

    <div style="padding:10px var(--app-px);flex-shrink:0;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid var(--border-subtle)">
      <div style="position:relative">
        <iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;color:var(--text-muted)"></iconify-icon>
        <input id="bizAddOrderSearch" oninput="_bizAddOrderSetQuery(this.value)" placeholder="Ürün ara..." style="width:100%;padding:9px 12px 9px 34px;border:1px solid var(--border-subtle);border-radius:var(--r-full);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">
      </div>
      <div id="bizAddOrderChips" style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px"></div>
    </div>

    <div id="bizAddOrderList" style="flex:1;overflow-y:auto;padding:12px var(--app-px) 16px;display:flex;flex-direction:column;gap:8px"></div>

    <div id="bizAddOrderCart" style="border-top:1px solid var(--border-subtle);background:var(--bg-phone);padding:10px var(--app-px) max(env(safe-area-inset-bottom),12px);flex-shrink:0;max-height:55vh;overflow-y:auto;display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <iconify-icon icon="solar:cart-large-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);flex:1">Seçilen Ürünler</span>
        <span id="bizAddOrderTotal" style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)">0.00 ₺</span>
      </div>
      <div id="bizAddOrderCartItems" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px"></div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
        <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);display:flex;align-items:center;gap:6px">
          <iconify-icon icon="solar:chef-hat-minimalistic-linear" style="font-size:14px;color:var(--primary)"></iconify-icon> Mutfağa Not
        </label>
        <textarea id="bizAddOrderKitchenNote" oninput="_bizAddOrderState.kitchenNote=this.value" rows="2" placeholder="örn: İskender az yağlı, ayran soğuk olsun..." style="width:100%;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-page);font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-primary);resize:vertical;outline:none"></textarea>
      </div>
      <button onclick="bizAddOrderSubmit()" style="width:100%;padding:12px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px">
        <iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon> Siparişi Gönder
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  _bizAddOrderRenderChips();
  _bizAddOrderRenderList();
}

function closeBizAddOrder() {
  const el = document.getElementById('bizAddOrderOverlay');
  if (el) el.remove();
  _bizAddOrderState = null;
}

function _bizAddOrderSetQuery(v) {
  if (!_bizAddOrderState) return;
  _bizAddOrderState.query = (v || '').toLowerCase().trim();
  _bizAddOrderRenderList();
}

function _bizAddOrderSetCategory(cat) {
  if (!_bizAddOrderState) return;
  _bizAddOrderState.category = cat;
  _bizAddOrderRenderChips();
  _bizAddOrderRenderList();
}

function _bizAddOrderRenderChips() {
  const st = _bizAddOrderState; if (!st) return;
  const table = BIZ_TABLES.find(t => t.id === st.tableId);
  const menu = _bizAddOrderBranchMenu(table && table.branchId);
  const cats = Array.from(new Set(menu.map(m => m.category || 'Diğer')));
  const chipsEl = document.getElementById('bizAddOrderChips');
  if (!chipsEl) return;
  const chip = (key, label) => {
    const active = st.category === key;
    return `<div onclick="_bizAddOrderSetCategory('${key.replace(/'/g, "\\'")}')" style="padding:6px 12px;border-radius:var(--r-full);border:1px solid ${active ? 'var(--primary)' : 'var(--border-subtle)'};background:${active ? 'var(--primary)' : 'var(--bg-phone)'};color:${active ? '#fff' : 'var(--text-primary)'};font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;white-space:nowrap">${label}</div>`;
  };
  chipsEl.innerHTML = [chip('all', 'Tümü')].concat(cats.map(c => chip(c, c))).join('');
}

function _bizAddOrderRenderList() {
  const st = _bizAddOrderState; if (!st) return;
  const table = BIZ_TABLES.find(t => t.id === st.tableId);
  const menu = _bizAddOrderBranchMenu(table && table.branchId);
  const filtered = menu.filter(m => {
    if (st.category !== 'all' && (m.category || 'Diğer') !== st.category) return false;
    if (st.query && !(m.name || '').toLowerCase().includes(st.query)) return false;
    return true;
  });
  const listEl = document.getElementById('bizAddOrderList');
  if (!listEl) return;
  if (!filtered.length) {
    listEl.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text-muted);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Eşleşen ürün bulunamadı.</div>`;
    return;
  }
  listEl.innerHTML = filtered.map(m => {
    const inCart = st.cart.filter(c => c.id === m.id).reduce((s, c) => s + c.qty * c.portion, 0);
    return `
      <div onclick="_bizAddOrderPickPortion('${m.id}')" style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);cursor:pointer">
        <div style="width:40px;height:40px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:dish-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(m.name)}</div>
          <div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(m.category || '')}</div>
        </div>
        ${inCart > 0 ? `<span style="font:var(--fw-semibold) 10px/1 var(--font);color:var(--primary);background:var(--primary-soft);padding:3px 7px;border-radius:var(--r-full)">×${inCart}</span>` : ''}
        <div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);flex-shrink:0">${Number(m.price).toFixed(2)} ₺</div>
        <iconify-icon icon="solar:add-circle-bold" style="font-size:22px;color:var(--primary);flex-shrink:0"></iconify-icon>
      </div>`;
  }).join('');
}

function _bizAddOrderPickPortion(menuItemId) {
  const st = _bizAddOrderState; if (!st) return;
  const item = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : []).find(m => m.id === menuItemId);
  if (!item) return;

  const modal = document.createElement('div');
  modal.id = 'bizAddOrderPortion';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:85;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const portions = [
    { v: 0.5, l: '½ Porsiyon' },
    { v: 1,   l: '1 Porsiyon' },
    { v: 1.5, l: '1½ Porsiyon' },
    { v: 2,   l: '2 Porsiyon' }
  ];

  modal.innerHTML = `
    <div style="width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:16px var(--app-px) max(env(safe-area-inset-bottom),16px);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:44px;height:44px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:dish-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(item.name)}</div>
          <div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(item.category || '')} · ${Number(item.price).toFixed(2)} ₺ / porsiyon</div>
        </div>
        <div class="btn-icon" onclick="document.getElementById('bizAddOrderPortion').remove()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>
      </div>

      <div style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)">Porsiyon</div>
      <div id="bizPortionChips" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        ${portions.map(p => `
          <div data-p="${p.v}" onclick="_bizAddOrderSelectPortion(${p.v})" style="padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);text-align:center;cursor:pointer;background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">${p.l}</div>
        `).join('')}
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;background:var(--bg-phone);border-radius:var(--r-md);border:1px solid var(--border-subtle)">
        <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Adet</span>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="btn-icon" onclick="_bizAddOrderQtyNudge(-1)" style="background:var(--glass-card-strong)"><iconify-icon icon="solar:minus-circle-linear" style="font-size:20px"></iconify-icon></div>
          <span id="bizPortionQty" style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);min-width:24px;text-align:center">1</span>
          <div class="btn-icon" onclick="_bizAddOrderQtyNudge(1)" style="background:var(--glass-card-strong)"><iconify-icon icon="solar:add-circle-linear" style="font-size:20px"></iconify-icon></div>
        </div>
      </div>

      <textarea id="bizPortionNote" rows="2" placeholder="Ürün notu (ops.)" style="width:100%;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-primary);resize:vertical;outline:none"></textarea>

      <button onclick="_bizAddOrderConfirmPortion('${item.id}')" style="width:100%;padding:12px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer">Sepete Ekle</button>
    </div>`;
  document.body.appendChild(modal);

  modal.dataset.portion = '1';
  modal.dataset.qty = '1';
  _bizAddOrderSelectPortion(1);
}

function _bizAddOrderSelectPortion(v) {
  const modal = document.getElementById('bizAddOrderPortion'); if (!modal) return;
  modal.dataset.portion = String(v);
  modal.querySelectorAll('#bizPortionChips [data-p]').forEach(el => {
    const active = parseFloat(el.dataset.p) === v;
    el.style.borderColor = active ? 'var(--primary)' : 'var(--border-subtle)';
    el.style.background = active ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = active ? '#fff' : 'var(--text-primary)';
  });
}

function _bizAddOrderQtyNudge(delta) {
  const modal = document.getElementById('bizAddOrderPortion'); if (!modal) return;
  let q = parseInt(modal.dataset.qty || '1', 10) + delta;
  if (q < 1) q = 1; if (q > 99) q = 99;
  modal.dataset.qty = String(q);
  const qtyEl = document.getElementById('bizPortionQty');
  if (qtyEl) qtyEl.textContent = q;
}

function _bizAddOrderConfirmPortion(menuItemId) {
  const st = _bizAddOrderState; if (!st) return;
  const modal = document.getElementById('bizAddOrderPortion'); if (!modal) return;
  const item = (typeof BIZ_MENU_ITEMS !== 'undefined' ? BIZ_MENU_ITEMS : []).find(m => m.id === menuItemId);
  if (!item) return;
  const portion = parseFloat(modal.dataset.portion || '1');
  const qty = parseInt(modal.dataset.qty || '1', 10);
  const note = (document.getElementById('bizPortionNote') || {}).value || '';
  st.cart.push({
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    portion: portion,
    qty: qty,
    note: note.trim()
  });
  modal.remove();
  _bizAddOrderRenderList();
  _bizAddOrderRenderCart();
}

function _bizAddOrderRemoveCart(idx) {
  const st = _bizAddOrderState; if (!st) return;
  st.cart.splice(idx, 1);
  _bizAddOrderRenderList();
  _bizAddOrderRenderCart();
}

function _bizAddOrderRenderCart() {
  const st = _bizAddOrderState; if (!st) return;
  const cartEl = document.getElementById('bizAddOrderCart');
  const chipEl = document.getElementById('bizAddOrderCartChip');
  const countEl = document.getElementById('bizAddOrderCartChipCount');
  const listEl = document.getElementById('bizAddOrderCartItems');
  const totalEl = document.getElementById('bizAddOrderTotal');
  if (!cartEl || !listEl) return;
  if (!st.cart.length) {
    cartEl.style.display = 'none';
    if (chipEl) chipEl.style.display = 'none';
    return;
  }
  cartEl.style.display = 'block';
  if (chipEl) { chipEl.style.display = 'inline-flex'; if (countEl) countEl.textContent = st.cart.length; }

  let total = 0;
  listEl.innerHTML = st.cart.map((c, i) => {
    const line = c.price * c.portion * c.qty;
    total += line;
    const portionLabel = c.portion === 0.5 ? '½' : c.portion === 1.5 ? '1½' : String(c.portion);
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg-page);border:1px solid var(--border-subtle);border-radius:var(--r-md)">
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(c.name)}</div>
          <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:2px">${portionLabel} porsiyon × ${c.qty}${c.note ? ' · ' + escHtml(c.note) : ''}</div>
        </div>
        <div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">${line.toFixed(2)} ₺</div>
        <div class="btn-icon" onclick="_bizAddOrderRemoveCart(${i})" style="background:transparent"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:18px;color:#EF4444"></iconify-icon></div>
      </div>`;
  }).join('');
  if (totalEl) totalEl.textContent = total.toFixed(2) + ' ₺';
}

function _bizAddOrderFocusCart() {
  const cartEl = document.getElementById('bizAddOrderCart');
  if (cartEl) cartEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function bizAddOrderSubmit() {
  const st = _bizAddOrderState; if (!st) return;
  if (!st.cart.length) { alert('Sepet boş. Lütfen önce ürün ekleyin.'); return; }
  const table = BIZ_TABLES.find(t => t.id === st.tableId);
  if (!table) return;

  // Open table if empty
  if (table.status === 'empty' || table.status === 'reserved') {
    table.status = 'occupied';
    table.occupiedSince = new Date().toISOString();
    if (!table.guestCount) table.guestCount = 1;
    if (!table.assignedWaiter && typeof bizCurrentEmployment !== 'undefined' && bizCurrentEmployment && bizCurrentEmployment.name) {
      table.assignedWaiter = bizCurrentEmployment.name;
    }
  }

  // Build order items — collapse same id+portion+note
  const itemsMap = new Map();
  st.cart.forEach(c => {
    const key = c.id + '|' + c.portion + '|' + (c.note || '');
    const existing = itemsMap.get(key);
    const eff = c.price * c.portion;
    const portionLabel = c.portion === 0.5 ? ' (½)' : c.portion === 1.5 ? ' (1½)' : c.portion !== 1 ? ' (×' + c.portion + ')' : '';
    const displayName = c.name + portionLabel + (c.note ? ' — ' + c.note : '');
    if (existing) existing.qty += c.qty;
    else itemsMap.set(key, { name: displayName, qty: c.qty, price: eff });
  });
  const items = Array.from(itemsMap.values());
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const orderId = _bizNextOrderId();
  const order = {
    id: orderId,
    branchId: table.branchId,
    type: 'dine-in',
    tableId: table.id,
    tableNumber: table.number,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: items,
    total: Math.round(total * 100) / 100,
    paymentMethod: 'cash',
    status: 'pending',
    createdAt: new Date().toISOString(),
    prepStartedAt: null,
    completedAt: null,
    waiterName: (typeof bizCurrentEmployment !== 'undefined' && bizCurrentEmployment && bizCurrentEmployment.name) ? bizCurrentEmployment.name : (table.assignedWaiter || ''),
    kitchenNote: (st.kitchenNote || '').trim(),
    createdBy: (typeof bizCurrentRole !== 'undefined') ? bizCurrentRole : ''
  };
  if (typeof BIZ_ORDERS !== 'undefined') BIZ_ORDERS.unshift(order);
  table.currentOrder = orderId;

  closeBizAddOrder();
  // Refresh table detail
  document.getElementById('bizTableDetailOverlay')?.remove();
  if (typeof bizRefreshTablesOverlay === 'function') bizRefreshTablesOverlay();
  if (typeof openBizTableDetail === 'function') openBizTableDetail(table.number);
}
