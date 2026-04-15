/* ═══════════════════════════════════════════════
 *  SUPPORT — Yardım & Destek Sayfası
 *  Hesabım > "Destek" karosundan açılır.
 *  Sadece UI — backend entegrasyonu yok.
 * ═══════════════════════════════════════════════ */

/* ── State ── */
var _spQuery = '';
var _spTicketSeed = [
  { id: 'T12345', subject: 'Hatalı Ürün Bildirimi', status: 'investigating', createdAt: '2 gün önce' },
  { id: 'T12298', subject: 'Teslimat Süresi Aşımı',  status: 'resolved',      createdAt: '1 hafta önce' }
];

/* ── SSS Verisi ── */
var _SP_FAQ = [
  {
    id: 'rest',
    title: 'Restoran Siparişleri',
    icon: 'solar:bag-2-bold',
    color: '#F97316',
    items: [
      { q: 'Teslimat ücreti nasıl hesaplanır?', a: 'Teslimat ücreti, seçtiğiniz restoranın konumuna ve mesafeye göre değişir. Minimum sepet tutarını aşan siparişlerde bazı restoranlar ücretsiz teslimat sunar.' },
      { q: 'Siparişimi nasıl iptal ederim?', a: 'Sipariş restoran tarafından hazırlanmaya başlanmadıysa "Siparişlerim" sayfasından tek tıkla iptal edebilirsiniz. Hazırlanan siparişler için Destek ile iletişime geçmeniz gerekir.' },
      { q: 'Ödeme sırasında hata aldım, ne yapmalıyım?', a: 'Kartınızdan tutar çekildiği halde sipariş oluşmadıysa, tutar 1-3 iş günü içinde otomatik iade edilir. Sorun devam ederse Şef Destek ile iletişime geçin.' },
      { q: 'Eksik veya hatalı ürün geldi', a: 'Sipariş detayından "Sorun Bildir" butonuyla fotoğraflı bildirim yapabilirsiniz. Genellikle 24 saat içinde iade veya yeniden gönderim sağlanır.' }
    ]
  },
  {
    id: 'recipe',
    title: 'Tarif ve Planlama',
    icon: 'solar:chef-hat-bold',
    color: '#EC4899',
    items: [
      { q: 'Planlarım sekmesi nasıl kullanılır?', a: 'Haftalık yemek planınızı oluşturmak için tarif veya restoran menüsü detay sayfasındaki takvim ikonuna tıklayın. Gün ve öğün seçerek plana ekleyebilirsiniz.' },
      { q: 'Bir tarifi planımdan nasıl çıkarırım?', a: 'Planlarım > ilgili gün > yemek kartında sağa kaydırarak veya üç nokta menüsünden "Kaldır" diyerek silebilirsiniz.' },
      { q: 'AI analizim yanlış sonuç veriyor', a: 'AI analizleri tahmin niteliğindedir. Hatalı bulduğunuz analizlerde "Geri Bildirim" butonuyla bize bildirin — sistemi sürekli iyileştiriyoruz.' },
      { q: 'Premium tariflere nasıl erişirim?', a: 'Hesabım > Premium\'a Geç ile üyeliğinizi başlatın. Premium üyeler tüm özel tariflere anında erişebilir.' }
    ]
  },
  {
    id: 'account',
    title: 'Hesap ve Güvenlik',
    icon: 'solar:shield-user-bold',
    color: '#8B5CF6',
    items: [
      { q: 'Şifremi nasıl sıfırlarım?', a: 'Giriş ekranında "Şifremi Unuttum" bağlantısına tıklayın ve e-posta adresinizi girin. Gelen bağlantı ile yeni şifrenizi belirleyin.' },
      { q: 'Hesabımı nasıl silerim?', a: 'Hesabım > Ayarlar > Hesap > "Hesabımı Sil" ile kalıcı silme talebi oluşturabilirsiniz. 30 günlük bekleme süresi sonrası tüm verileriniz silinir.' },
      { q: 'Verilerim nasıl korunuyor?', a: 'Tüm verileriniz şifrelenerek saklanır. KVKK ve GDPR uyumlu altyapımız, verilerinizi yetkisiz erişime karşı korur. Daha fazlası için Gizlilik Politikamızı inceleyin.' },
      { q: 'Bir kullanıcıyı engelledim, nasıl geri alırım?', a: 'Hesabım > Ayarlar > Gizlilik > "Engellenen Kullanıcılar" listesinden kaldırabilirsiniz.' }
    ]
  }
];

/* ── Yardımcı: aktif sipariş var mı? ── */
function _spHasActiveOrder() {
  if (typeof USER_PROFILE === 'undefined') return false;
  var orders = USER_PROFILE.orders || [];
  return orders.some(function(o) {
    var s = (o.status || '').toLowerCase();
    return s === 'hazırlanıyor' || s === 'yolda' || s === 'preparing' || s === 'onaylandı' || s === 'pending';
  });
}

/* ═══ OPEN / CLOSE ═══ */
function openSupportPage() {
  _spQuery = '';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'supportOverlay';
  overlay.style.display = 'flex';

  overlay.innerHTML =
    '<div class="prof-container" id="supportContainer" style="background:var(--bg-page);position:relative">' +
      '<div id="supportBody" style="padding-bottom:120px"></div>' +
      _spRenderFAB() +
    '</div>';

  document.getElementById('phone').appendChild(overlay);
  _spInjectStyles();
  _spRender();
}

function closeSupportPage() {
  var overlay = document.getElementById('supportOverlay');
  if (overlay) overlay.remove();
}

/* ═══ MAIN RENDER ═══ */
function _spRender() {
  var body = document.getElementById('supportBody');
  if (!body) return;

  var html = '';

  /* ── 1. HEADER ── */
  html += '<div style="background:linear-gradient(180deg,#EFF6FF 0%,var(--bg-page) 100%);padding:12px 16px 18px">';
  /* Topbar */
  html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0 14px">';
  html += '<div class="btn-icon" onclick="closeSupportPage()" style="background:transparent"><iconify-icon icon="solar:arrow-left-outline" style="font-size:22px;color:var(--text-primary)"></iconify-icon></div>';
  html += '<div style="flex:1"></div>';
  html += '</div>';
  /* Greeting */
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">';
  html += '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#3B82F6 0%,#60A5FA 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,.25);flex-shrink:0">';
  html += '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:26px;color:#fff"></iconify-icon>';
  html += '</div>';
  html += '<div style="flex:1;min-width:0">';
  html += '<div style="font:var(--fw-bold) 22px/1.2 var(--font);color:var(--text-primary)">Yardım ve Destek</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Sana nasıl yardımcı olabiliriz?</div>';
  html += '</div>';
  html += '</div>';
  /* Search */
  html += '<div style="margin-top:14px;display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px 14px;box-shadow:0 2px 8px rgba(0,0,0,.04)">';
  html += '<iconify-icon icon="solar:magnifer-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>';
  html += '<input type="text" id="spSearchInput" placeholder="Sorununuzu buraya yazın..." value="' + _spEsc(_spQuery) + '" oninput="_spOnSearch(this.value)" ';
  html += 'style="flex:1;border:none;outline:none;background:transparent;font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">';
  if (_spQuery) {
    html += '<div onclick="_spClearSearch()" style="cursor:pointer;flex-shrink:0"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>';
  }
  html += '</div>';
  html += '</div>';

  /* ── If searching, show results ── */
  if (_spQuery.trim()) {
    html += _spRenderSearchResults();
    body.innerHTML = html;
    return;
  }

  /* ── 2. QUICK ACTION TILES ── */
  html += '<div style="padding:20px 16px 8px">';
  html += '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);margin-bottom:12px;padding:0 4px">Hızlı çözüm</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';

  /* Kart 1: Aktif sipariş */
  var hasActive = _spHasActiveOrder();
  if (hasActive) {
    html += '<div onclick="_spOpenTopic(\'active-order\')" style="grid-column:1 / -1;padding:16px;border-radius:var(--r-xl);background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);cursor:pointer;position:relative;overflow:hidden;box-shadow:0 6px 18px rgba(249,115,22,.3)">';
    html += '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.12)"></div>';
    html += '<div style="display:flex;align-items:center;gap:12px;position:relative">';
    html += '<div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0">';
    html += '<iconify-icon icon="solar:bag-check-bold" style="font-size:22px;color:#fff"></iconify-icon>';
    html += '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="display:flex;align-items:center;gap:6px"><span style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:#fff">Aktif Siparişimle İlgili</span><span style="width:8px;height:8px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.3);animation:spPulse 1.5s infinite"></span></div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:rgba(255,255,255,.88);margin-top:3px">Teslimat, gecikme veya sorun bildir</div>';
    html += '</div>';
    html += '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:20px;color:#fff;flex-shrink:0"></iconify-icon>';
    html += '</div>';
    html += '</div>';
  }

  /* Kart 2: Ödeme ve Abonelik */
  html += _spTile({
    key: 'payment',
    title: 'Ödeme ve Abonelik',
    desc: 'Premium ve cüzdan',
    icon: 'solar:card-bold',
    color: '#8B5CF6'
  });

  /* Kart 3: Topluluk ve Güvenlik */
  html += _spTile({
    key: 'community',
    title: 'Topluluk ve Güvenlik',
    desc: 'Şikayet ve engel',
    icon: 'solar:shield-check-bold',
    color: '#22C55E'
  });

  /* Kart 4: Mutfak ve Tarifler */
  html += _spTile({
    key: 'recipe',
    title: 'Mutfak ve Tarifler',
    desc: 'AI analiz ve tarifler',
    icon: 'solar:chef-hat-bold',
    color: '#EC4899'
  });

  /* Ek kart: Genel */
  html += _spTile({
    key: 'account',
    title: 'Hesap ve Ayarlar',
    desc: 'Profil, şifre, veriler',
    icon: 'solar:user-id-bold',
    color: '#3B82F6'
  });

  html += '</div>';
  html += '</div>';

  /* ── 3. AKTİF TALEPLERİM ── */
  if (_spTicketSeed.length > 0) {
    html += '<div style="padding:16px 16px 4px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 4px">';
    html += '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Aktif Taleplerim</div>';
    html += '<span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);background:var(--bg-btn);padding:4px 10px;border-radius:var(--r-full)">' + _spTicketSeed.length + '</span>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    _spTicketSeed.forEach(function(t) {
      var statusMeta = t.status === 'resolved'
        ? { label: 'Çözüldü',     color: '#22C55E', bg: '#22C55E15', icon: 'solar:check-circle-bold' }
        : { label: 'İnceleniyor', color: '#F59E0B', bg: '#F59E0B15', icon: 'solar:clock-circle-bold' };
      html += '<div onclick="_spOpenTicket(\'' + t.id + '\')" class="g-card" style="padding:13px 14px;border-radius:var(--r-lg);border:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;cursor:pointer">';
      html += '<div style="width:38px;height:38px;border-radius:10px;background:' + statusMeta.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">';
      html += '<iconify-icon icon="' + statusMeta.icon + '" style="font-size:20px;color:' + statusMeta.color + '"></iconify-icon>';
      html += '</div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<div style="display:flex;align-items:center;gap:6px"><span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + t.subject + '</span><span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">#' + t.id + '</span></div>';
      html += '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + t.createdAt + '</div>';
      html += '</div>';
      html += '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + statusMeta.color + ';background:' + statusMeta.bg + ';padding:5px 9px;border-radius:var(--r-full);flex-shrink:0">' + statusMeta.label + '</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  }

  /* ── 4. SSS ACCORDION ── */
  html += '<div style="padding:20px 16px 4px">';
  html += '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);margin-bottom:12px;padding:0 4px">Sıkça Sorulanlar</div>';
  html += _spRenderFAQ();
  html += '</div>';

  /* ── 5. E-MAIL / CONTACT ── */
  html += '<div style="padding:14px 16px 20px">';
  html += '<div style="padding:16px;border:1px dashed var(--border-subtle);border-radius:var(--r-xl);display:flex;align-items:center;gap:12px;background:var(--bg-phone)">';
  html += '<div style="width:40px;height:40px;border-radius:10px;background:#3B82F615;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:letter-bold" style="font-size:22px;color:#3B82F6"></iconify-icon></div>';
  html += '<div style="flex:1;min-width:0">';
  html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">E-posta ile bize yazın</div>';
  html += '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);margin-top:4px;text-decoration:underline">destek@superresto.com</div>';
  html += '</div>';
  html += '<div onclick="_spCopyEmail()" style="padding:8px 12px;background:var(--bg-btn);border-radius:var(--r-full);cursor:pointer;font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);flex-shrink:0;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:copy-linear" style="font-size:12px"></iconify-icon>Kopyala</div>';
  html += '</div>';
  html += '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);text-align:center;margin-top:12px">Genellikle 24 saat içinde yanıt veriyoruz · 7/24 AI destek için sağ alttaki Şef Destek\'e dokun</div>';
  html += '</div>';

  body.innerHTML = html;
}

/* ── Quick Tile helper ── */
function _spTile(o) {
  return '' +
    '<div onclick="_spOpenTopic(\'' + o.key + '\')" class="g-card" style="padding:14px;border-radius:var(--r-xl);cursor:pointer;display:flex;flex-direction:column;gap:8px;border:1px solid var(--border-subtle);min-height:100px">' +
      '<div style="width:40px;height:40px;border-radius:12px;background:' + o.color + '15;display:flex;align-items:center;justify-content:center">' +
        '<iconify-icon icon="' + o.icon + '" style="font-size:22px;color:' + o.color + '"></iconify-icon>' +
      '</div>' +
      '<div style="margin-top:auto">' +
        '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + o.title + '</div>' +
        '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + o.desc + '</div>' +
      '</div>' +
    '</div>';
}

/* ── FAQ accordion ── */
function _spRenderFAQ() {
  var html = '<div style="display:flex;flex-direction:column;gap:10px">';
  _SP_FAQ.forEach(function(cat) {
    html += '<div class="g-card" style="border-radius:var(--r-xl);overflow:hidden;border:1px solid var(--border-subtle)">';
    html += '<div style="padding:14px;display:flex;align-items:center;gap:12px;background:' + cat.color + '08">';
    html += '<div style="width:36px;height:36px;border-radius:10px;background:' + cat.color + '20;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="' + cat.icon + '" style="font-size:18px;color:' + cat.color + '"></iconify-icon></div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + cat.title + '</div>';
    html += '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + cat.items.length + ' konu</div>';
    html += '</div>';
    html += '</div>';
    cat.items.forEach(function(it, idx) {
      html += '<details class="sp-faq-item"' + (idx === 0 ? '' : ' style="border-top:1px solid var(--border-subtle)"') + '>';
      html += '<summary style="padding:13px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;list-style:none;font:var(--fw-medium) var(--fs-sm)/1.4 var(--font);color:var(--text-primary)">';
      html += '<span style="flex:1">' + _spEsc(it.q) + '</span>';
      html += '<iconify-icon icon="solar:alt-arrow-down-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0;transition:transform .2s"></iconify-icon>';
      html += '</summary>';
      html += '<div style="padding:0 16px 14px;font:var(--fw-regular) var(--fs-xs)/1.55 var(--font);color:var(--text-secondary)">' + _spEsc(it.a) + '</div>';
      html += '</details>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ── Search results ── */
function _spRenderSearchResults() {
  var q = _spQuery.toLowerCase().trim();
  var matches = [];
  _SP_FAQ.forEach(function(cat) {
    cat.items.forEach(function(it) {
      if (it.q.toLowerCase().indexOf(q) !== -1 || it.a.toLowerCase().indexOf(q) !== -1) {
        matches.push({ cat: cat, item: it });
      }
    });
  });

  var html = '<div style="padding:16px">';
  html += '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:12px">"' + _spEsc(_spQuery) + '" için ' + matches.length + ' sonuç</div>';

  if (matches.length === 0) {
    html += '<div style="padding:32px 16px;text-align:center">';
    html += '<iconify-icon icon="solar:magnifer-bug-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon>';
    html += '<div style="font:var(--fw-semibold) var(--fs-md)/1.3 var(--font);color:var(--text-primary);margin-top:10px">Aradığınız sonucu bulamadık</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:6px">Şef Destek ile konuşarak sorununuzu doğrudan iletebilirsiniz.</div>';
    html += '<button onclick="_spOpenChatbot()" style="margin-top:18px;padding:12px 24px;border:none;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:8px"><iconify-icon icon="solar:chef-hat-bold" style="font-size:16px"></iconify-icon>Şef Destek ile Konuş</button>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    matches.forEach(function(m) {
      html += '<div class="g-card" style="padding:14px;border-radius:var(--r-lg);border:1px solid var(--border-subtle)">';
      html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><iconify-icon icon="' + m.cat.icon + '" style="font-size:14px;color:' + m.cat.color + '"></iconify-icon><span style="font:var(--fw-medium) 10px/1 var(--font);color:' + m.cat.color + ';text-transform:uppercase;letter-spacing:.4px">' + m.cat.title + '</span></div>';
      html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">' + _spHighlight(m.item.q) + '</div>';
      html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-secondary)">' + _spHighlight(m.item.a) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function _spHighlight(str) {
  if (!_spQuery.trim()) return _spEsc(str);
  var esc = _spEsc(str);
  var q = _spQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return esc.replace(new RegExp('(' + q + ')', 'gi'), '<mark style="background:#FEF3C7;color:#92400E;padding:1px 3px;border-radius:3px">$1</mark>');
}

/* ═══ FAB (Floating Action Button) ═══ */
function _spRenderFAB() {
  return '' +
    '<div id="supportFab" onclick="_spOpenChatbot()" ' +
    'style="position:absolute;right:18px;bottom:26px;z-index:20;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);box-shadow:0 10px 28px rgba(249,115,22,.45),0 0 0 0 rgba(249,115,22,.5);display:flex;align-items:center;justify-content:center;cursor:pointer;animation:spFabPulse 2.4s infinite">' +
      '<iconify-icon icon="solar:chef-hat-bold" style="font-size:28px;color:#fff"></iconify-icon>' +
      '<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#22C55E;border:2px solid var(--bg-page);box-shadow:0 0 0 2px rgba(34,197,94,.3)"></div>' +
    '</div>' +
    '<div style="position:absolute;right:90px;bottom:44px;z-index:19;background:var(--text-primary);color:#fff;padding:7px 12px;border-radius:var(--r-full);font:var(--fw-semibold) 11px/1 var(--font);box-shadow:0 4px 12px rgba(0,0,0,.15);pointer-events:none;animation:spFabLabel 2.4s infinite">Şef Destek ile Konuş</div>';
}

/* ═══ ACTIONS ═══ */
function _spOnSearch(val) {
  _spQuery = val;
  _spRender();
  setTimeout(function() {
    var inp = document.getElementById('spSearchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(val.length, val.length); }
  }, 10);
}

function _spClearSearch() {
  _spQuery = '';
  _spRender();
}

function _spOpenTopic(key) {
  var labels = {
    'active-order': 'Aktif Siparişimle İlgili',
    'payment': 'Ödeme ve Abonelik',
    'community': 'Topluluk ve Güvenlik',
    'recipe': 'Mutfak ve Tarifler',
    'account': 'Hesap ve Ayarlar'
  };
  _spToast(labels[key] + ' formuna yönlendiriliyor...');
}

function _spOpenTicket(id) {
  _spToast('Talep #' + id + ' detayına yönlendiriliyor...');
}

function _spOpenChatbot() {
  /* Prefer existing AI screen if available */
  if (typeof openAiChat === 'function') {
    closeSupportPage();
    setTimeout(openAiChat, 150);
    return;
  }
  if (typeof switchTab === 'function') {
    closeSupportPage();
    setTimeout(function() { switchTab('ai'); }, 150);
    return;
  }
  _spToast('Şef Destek açılıyor...');
}

function _spCopyEmail() {
  var email = 'destek@superresto.com';
  try {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(email);
    }
  } catch (e) {}
  _spToast('E-posta kopyalandı: ' + email);
}

function _spEsc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _spToast(msg) {
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:9999;transition:opacity .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; }, 2000);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

/* ═══ STYLES ═══ */
function _spInjectStyles() {
  if (document.getElementById('supportStyles')) return;
  var st = document.createElement('style');
  st.id = 'supportStyles';
  st.textContent =
    '@keyframes spPulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }' +
    '@keyframes spFabPulse { 0%,100% { box-shadow: 0 10px 28px rgba(249,115,22,.45), 0 0 0 0 rgba(249,115,22,.5); } 50% { box-shadow: 0 10px 28px rgba(249,115,22,.45), 0 0 0 14px rgba(249,115,22,0); } }' +
    '@keyframes spFabLabel { 0%,80%,100% { opacity: 0; transform: translateX(6px); } 30%,50% { opacity: 1; transform: translateX(0); } }' +
    '#supportOverlay .sp-faq-item[open] summary iconify-icon { transform: rotate(180deg); }' +
    '#supportOverlay .sp-faq-item summary::-webkit-details-marker { display: none; }';
  document.head.appendChild(st);
}

/* ═══ EXPORTS ═══ */
window.openSupportPage = openSupportPage;
window.closeSupportPage = closeSupportPage;
window._spOnSearch = _spOnSearch;
window._spClearSearch = _spClearSearch;
window._spOpenTopic = _spOpenTopic;
window._spOpenTicket = _spOpenTicket;
window._spOpenChatbot = _spOpenChatbot;
window._spCopyEmail = _spCopyEmail;
