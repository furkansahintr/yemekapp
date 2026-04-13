/* ═══ CART COMPONENT ═══ */

let cart = [];

function addToCart(idx, source) {
  const list = getListBySource(source);
  const item = list[idx];
  if (!item) return;
  const existing = cart.find(c => c.idx === idx && c.source === source);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ idx, source, qty: 1, name: item.name, price: item.price, img: item.img, restaurant: item.restaurant ? item.restaurant.name : null });
  }
  updateCartBadge();
}

function removeFromCart(idx, source) {
  const i = cart.findIndex(c => c.idx === idx && c.source === source);
  if (i > -1) {
    cart[i].qty--;
    if (cart[i].qty <= 0) cart.splice(i, 1);
  }
  updateCartBadge();
  renderCartItems();
}

function renderCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  ['headerCartBadge', 'stickyCartBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = total;
      el.style.display = total > 0 ? '' : 'none';
    }
  });
}

function openCart() {
  renderCartItems();
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
}

function renderCart() {
  renderCartItems();
}

function updateCartQuantity(idx, source) {
  const existing = cart.find(c => c.idx === idx && c.source === source);
  if (existing) existing.qty++;
  updateCartBadge();
  renderCartItems();
}

function removeCartItem(idx, source) {
  const i = cart.findIndex(c => c.idx === idx && c.source === source);
  if (i > -1) cart.splice(i, 1);
  updateCartBadge();
  renderCartItems();
}

function checkoutCart() {
  goToAddressSelection();
}

function closeOrderSuccess() {
  document.getElementById('orderSuccessOverlay').classList.remove('open');
  switchTab('menu');
}

function increaseCartItem(idx, source) {
  const existing = cart.find(c => c.idx === idx && c.source === source);
  if (existing) existing.qty++;
  updateCartBadge();
  renderCartItems();
}

function clearCart() {
  cart = [];
  updateCartBadge();
  renderCartItems();
}

function getCartTotal() {
  return cart.reduce((s, c) => s + c.price * c.qty, 0);
}

function openCartOverlay() {
  renderCartItems();
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCartOverlay() {
  document.getElementById('cartOverlay').classList.remove('open');
}

function renderCartItems() {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const clearBtn = document.getElementById('cartClearBtn');

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    itemsEl.style.display = 'none';
    footerEl.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  itemsEl.style.display = '';
  footerEl.style.display = '';
  clearBtn.style.display = '';

  itemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${c.img}" alt="${c.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-source">${c.restaurant || 'Tarif'}</div>
        <div class="cart-item-bottom">
          <div class="cart-item-price">₺${c.price * c.qty}</div>
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="removeFromCart(${c.idx},'${c.source}')">−</button>
            <span class="cart-qty-val">${c.qty}</span>
            <button class="cart-qty-btn" onclick="increaseCartItem(${c.idx},'${c.source}')">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  document.getElementById('cartSubtotal').textContent = '₺' + subtotal;
  document.getElementById('cartTotal').textContent = '₺' + subtotal;
}
