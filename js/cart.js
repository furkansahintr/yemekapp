/* ═══ CART COMPONENT ═══ */

let cart = [];
let deliveryMode = 'online';  // 'online' | 'pickup'

/* ─ Helper: Teslimat ücreti string'ini sayıya çevir ("15₺", "Ücretsiz") ─ */
function _parseDeliveryFee(raw) {
  if (!raw || typeof raw !== 'string') return 0;
  var m = raw.match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(',', '.')) : 0;
}

/* ─ Sepetin birincil restoranını döndür (ilk item) ─ */
function _cartPrimaryRestaurant() {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].restaurant) return cart[i].restaurant;
  }
  return null;
}

/* ─ Simüle edilmiş teslimat bölgesi kontrolü ─ */
function _cartIsInDeliveryZone() {
  var r = _cartPrimaryRestaurant();
  if (!r) return true;
  // Demo: fee > 15 olan restoranları zon dışı sayalım (sadece pickup önerisi için)
  return _parseDeliveryFee(r.deliveryFee) <= 15;
}

/* ─ Simüle uzaklık (demo) ─ */
function _cartRestaurantDistance() {
  var r = _cartPrimaryRestaurant();
  if (!r) return null;
  // Restoran ismine göre deterministik "fake" uzaklık (0.8–4.5 km)
  var seed = 0;
  for (var i = 0; i < (r.name || '').length; i++) seed += r.name.charCodeAt(i);
  var km = 0.8 + (seed % 38) / 10;
  return km.toFixed(1) + ' km';
}

function addToCart(idx, source) {
  const list = getListBySource(source);
  const item = list[idx];
  if (!item) return;
  const existing = cart.find(c => c.idx === idx && c.source === source);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      idx, source, qty: 1,
      name: item.name, price: item.price, img: item.img,
      restaurant: item.restaurant || null,
      restaurantName: item.restaurant ? item.restaurant.name : null
    });
  }
  updateCartBadge();
  if (typeof showToast === 'function') showToast('Ürün sepetinize başarıyla eklendi.');
  if (typeof bumpCartBadge === 'function') bumpCartBadge();
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
  if (deliveryMode === 'pickup') { confirmPickupOrder(); return; }
  if (typeof goToAddressSelection === 'function') goToAddressSelection();
}

function confirmPickupOrder() {
  var r = _cartPrimaryRestaurant();
  if (!r) return;
  if (typeof showToast === 'function') showToast('Gel-Al siparişi oluşturuldu · ' + r.name);
  else alert('Gel-Al siparişi oluşturuldu!\n\n' + r.name + '\nHazır olunca bildirim alacaksın.');
  var el = document.getElementById('orderSuccessOverlay');
  if (el && el.classList) el.classList.add('open');
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

function getCartDeliveryFee() {
  if (deliveryMode !== 'online' || cart.length === 0) return 0;
  var r = _cartPrimaryRestaurant();
  return r ? _parseDeliveryFee(r.deliveryFee) : 0;
}

/* ─ Teslimat modu değiştir ─ */
function setDeliveryMode(mode) {
  if (mode !== 'online' && mode !== 'pickup') return;
  // Zon dışıysa online'a geçmeye izin verme
  if (mode === 'online' && !_cartIsInDeliveryZone()) {
    if (typeof showToast === 'function') showToast('İşletmenin teslimat bölgesi dışındasın. Gel-Al ile devam edebilirsin.');
    else alert('İşletmenin teslimat bölgesi dışındasın. Gel-Al ile devam edebilirsin.');
    return;
  }
  deliveryMode = mode;
  renderCartItems();
}

function cartOpenMap() {
  var r = _cartPrimaryRestaurant();
  if (!r) return;
  if (typeof showToast === 'function') showToast('Harita açılıyor: ' + r.name);
  else alert('Harita açılıyor — ' + (r.address || r.name) + ' (demo)');
}

function openCartOverlay() {
  renderCartItems();
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCartOverlay() {
  document.getElementById('cartOverlay').classList.remove('open');
}

/* ─ Teslimat modu UI (segmented toggle + info box) ─ */
function _renderCartDeliverySection() {
  var r = _cartPrimaryRestaurant();
  var inZone = _cartIsInDeliveryZone();
  var distance = _cartRestaurantDistance();

  var onlineActive = deliveryMode === 'online';
  var pickupActive = deliveryMode === 'pickup';

  var toggle = '<div class="cart-dl-toggle">'
    +   '<div class="cart-dl-opt' + (onlineActive ? ' active' : '') + '" onclick="setDeliveryMode(\'online\')">'
    +     '<iconify-icon icon="solar:scooter-bold" style="font-size:18px"></iconify-icon>'
    +     '<div class="cart-dl-opt-text">'
    +       '<div class="cart-dl-opt-lbl">Online Sipariş</div>'
    +       '<div class="cart-dl-opt-sub">Adrese teslim</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="cart-dl-opt' + (pickupActive ? ' active' : '') + '" onclick="setDeliveryMode(\'pickup\')">'
    +     '<iconify-icon icon="solar:bag-smile-bold" style="font-size:18px"></iconify-icon>'
    +     '<div class="cart-dl-opt-text">'
    +       '<div class="cart-dl-opt-lbl">Gel-Al</div>'
    +       '<div class="cart-dl-opt-sub">Takeaway</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  // Info box
  var info;
  if (pickupActive) {
    var prep = (r && r.deliveryTime) ? r.deliveryTime : '15-20dk';
    info = '<div class="cart-dl-info cart-dl-info--pickup">'
      +   '<div class="cart-dl-info-text">Siparişiniz işletme tarafından hazırlanacak ve sizin tarafınızdan teslim alınacaktır. Kurye ücreti uygulanmaz.</div>'
      +   '<div class="cart-dl-info-row">'
      +     '<iconify-icon icon="solar:map-point-bold" style="font-size:14px;color:#16A34A"></iconify-icon>'
      +     '<span>' + (r ? (r.address || r.name) : 'İşletme') + (distance ? ' · <b>' + distance + '</b> uzaklıkta' : '') + '</span>'
      +   '</div>'
      +   '<div class="cart-dl-info-row">'
      +     '<iconify-icon icon="solar:clock-circle-bold" style="font-size:14px;color:#16A34A"></iconify-icon>'
      +     '<span><b>' + prep + '</b> içinde hazır olur</span>'
      +   '</div>'
      +   '<button class="cart-dl-map-btn" onclick="cartOpenMap()">'
      +     '<iconify-icon icon="solar:map-bold" style="font-size:15px"></iconify-icon>Haritada Gör'
      +   '</button>'
      + '</div>';
  } else {
    var dt = (r && r.deliveryTime) ? r.deliveryTime : '30-45dk';
    var fee = (r && r.deliveryFee) ? r.deliveryFee : 'Ücretsiz';
    var warn = (!inZone)
      ? '<div class="cart-dl-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#DC2626"></iconify-icon><span>Teslimat bölgesi dışındasın. <b>Gel-Al</b>\'a geç.</span></div>'
      : '';
    info = '<div class="cart-dl-info cart-dl-info--online">'
      +   '<div class="cart-dl-info-text">Siparişiniz seçtiğiniz adrese kurye aracılığıyla teslim edilecektir.</div>'
      +   '<div class="cart-dl-info-row">'
      +     '<iconify-icon icon="solar:clock-circle-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>'
      +     '<span>Tahmini teslimat: <b>' + dt + '</b></span>'
      +   '</div>'
      +   '<div class="cart-dl-info-row">'
      +     '<iconify-icon icon="solar:delivery-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>'
      +     '<span>Kurye ücreti: <b>' + fee + '</b></span>'
      +   '</div>'
      +   warn
      + '</div>';
  }

  return toggle + info;
}

function renderCartItems() {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const clearBtn = document.getElementById('cartClearBtn');
  const deliverySection = document.getElementById('cartDeliverySection');

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    itemsEl.style.display = 'none';
    footerEl.style.display = 'none';
    clearBtn.style.display = 'none';
    if (deliverySection) deliverySection.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  itemsEl.style.display = '';
  footerEl.style.display = '';
  clearBtn.style.display = '';

  // Teslimat modu bölümü — animasyonla fade update
  if (deliverySection) {
    deliverySection.style.display = '';
    deliverySection.innerHTML = _renderCartDeliverySection();
  }

  itemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${c.img}" alt="${c.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-source">${c.restaurantName || 'Tarif'}</div>
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
  const fee = getCartDeliveryFee();
  const total = subtotal + fee;

  document.getElementById('cartSubtotal').textContent = '₺' + subtotal;

  // Kurye ücreti satırı sadece online modda görünür
  const feeRow = document.getElementById('cartDeliveryRow');
  const feeEl = document.getElementById('cartDelivery');
  if (feeRow) feeRow.style.display = (deliveryMode === 'online') ? '' : 'none';
  if (feeEl) feeEl.textContent = fee > 0 ? '₺' + fee : 'Ücretsiz';

  document.getElementById('cartTotal').textContent = '₺' + total;

  // Checkout butonu label/icon — gel-al vs online
  const coBtn = document.getElementById('cartCheckoutBtn');
  if (coBtn) {
    coBtn.innerHTML = (deliveryMode === 'pickup')
      ? '<iconify-icon icon="solar:bag-smile-bold" style="font-size:18px"></iconify-icon>Gel-Al Siparişi Oluştur'
      : '<iconify-icon icon="solar:bag-check-bold" style="font-size:18px"></iconify-icon>Siparişi Onayla';
  }
}
