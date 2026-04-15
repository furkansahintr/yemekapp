/* ═══════════════════════════════════════════════
 *  PREMIUM — Conversion-Oriented Sales Page
 *  Hesabım > "Premium'a Geç" butonu ile açılır.
 *  Sadece UI — backend entegrasyonu yok.
 * ═══════════════════════════════════════════════ */

/* ── State ── */
var _prmBilling = 'yearly';  // 'monthly' | 'yearly'

/* ── Fiyatlandırma ── */
var _PRM_PRICING = {
  monthly: {
    id: 'monthly',
    pricePerMonth: 79,
    total: 79,
    totalLabel: '₺79 / ay',
    billedLabel: 'Aylık faturalandırılır'
  },
  yearly: {
    id: 'yearly',
    pricePerMonth: 63,          // 759 / 12 ≈ 63
    total: 759,
    totalLabel: '₺759 / yıl',
    billedLabel: 'Yıllık tek ödeme — %20 tasarruf',
    savingPct: 20,
    savingAmount: 189
  }
};

/* ── Avantajlar ── */
var _PRM_BENEFITS = [
  {
    icon: 'solar:calendar-bold',
    emoji: '🍽️',
    color: '#F97316',
    title: 'Sınırsız Planlama',
    desc: 'Haftalık yemek planlarını kısıtlama olmadan oluşturun, kaydedin ve paylaşın.'
  },
  {
    icon: 'solar:magnifer-zoom-in-bold',
    emoji: '🔍',
    color: '#8B5CF6',
    title: 'Gelişmiş AI Analizi',
    desc: 'Tarif ve menüleriniz için en detaylı besin, alerjen ve içerik analizlerine ulaşın.'
  },
  {
    icon: 'solar:shield-check-bold',
    emoji: '🚫',
    color: '#22C55E',
    title: 'Reklamsız Deneyim',
    desc: 'Uygulamayı kesintisiz ve akıcı bir şekilde kullanın — hiçbir reklam görmeyin.'
  },
  {
    icon: 'solar:chef-hat-bold',
    emoji: '👨‍🍳',
    color: '#EC4899',
    title: 'Özel Şef Tarifleri',
    desc: 'Yalnızca Premium üyelere özel şef imzalı tarif koleksiyonuna erişin.'
  },
  {
    icon: 'solar:cloud-download-bold',
    emoji: '📱',
    color: '#06B6D4',
    title: 'Çevrimdışı Erişim',
    desc: 'Favori tariflerinizi internetsiz de görüntüleyin ve pişirme modunu kullanın.'
  }
];

/* ═══ OPEN / CLOSE ═══ */
function openPremiumPage() {
  _prmBilling = 'yearly';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'premiumOverlay';
  overlay.style.display = 'flex';

  overlay.innerHTML =
    '<div class="prof-container" id="premiumContainer" style="background:var(--bg-page);position:relative">' +
      _prmRenderTopbar() +
      '<div id="premiumBody" style="padding-bottom:120px"></div>' +
      _prmRenderStickyCTA() +
    '</div>';

  document.getElementById('phone').appendChild(overlay);
  _prmInjectStyles();
  _prmRenderBody();
}

function closePremiumPage() {
  var overlay = document.getElementById('premiumOverlay');
  if (overlay) overlay.remove();
}

/* ═══ TOPBAR ═══ */
function _prmRenderTopbar() {
  return '' +
    '<div class="prof-topbar" style="background:transparent;border-bottom:none;position:absolute;top:0;left:0;right:0;z-index:5">' +
      '<div class="btn-icon" onclick="closePremiumPage()" style="background:rgba(255,255,255,0.9);backdrop-filter:blur(10px)">' +
        '<iconify-icon icon="solar:arrow-left-outline" style="font-size:20px;color:#1f2937"></iconify-icon>' +
      '</div>' +
      '<div style="width:36px"></div>' +
      '<div class="btn-icon" onclick="_prmRestore()" style="background:rgba(255,255,255,0.9);backdrop-filter:blur(10px)" title="Satın alımı geri yükle">' +
        '<iconify-icon icon="solar:refresh-circle-linear" style="font-size:20px;color:#1f2937"></iconify-icon>' +
      '</div>' +
    '</div>';
}

/* ═══ STICKY CTA ═══ */
function _prmRenderStickyCTA() {
  return '' +
    '<div id="premiumStickyCTA" style="position:absolute;left:0;right:0;bottom:0;padding:16px 18px 22px;background:linear-gradient(to top,var(--bg-page) 0%,var(--bg-page) 60%,rgba(255,255,255,0) 100%);z-index:10">' +
      '<button onclick="_prmPurchase()" id="premiumPurchaseBtn" ' +
      'style="width:100%;padding:17px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%);color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;box-shadow:0 8px 24px rgba(124,58,237,.35);display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .12s" onmousedown="this.style.transform=\'scale(.98)\'" onmouseup="this.style.transform=\'scale(1)\'" onmouseleave="this.style.transform=\'scale(1)\'">' +
        '<iconify-icon icon="solar:crown-bold" style="font-size:22px;color:#FCD34D"></iconify-icon>' +
        '<span>Hemen Premiumlu Ol</span>' +
      '</button>' +
      /* Trust factors */
      '<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;flex-wrap:wrap">' +
        '<div style="display:flex;align-items:center;gap:4px">' +
          '<iconify-icon icon="solar:close-square-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>' +
          '<span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">İstediğin zaman iptal et</span>' +
        '</div>' +
        '<div style="width:1px;height:11px;background:var(--border-subtle)"></div>' +
        '<div style="display:flex;align-items:center;gap:4px">' +
          '<iconify-icon icon="solar:lock-password-bold" style="font-size:13px;color:#22C55E"></iconify-icon>' +
          '<span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Güvenli ödeme</span>' +
        '</div>' +
      '</div>' +
      /* Payment method icons */
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px">' +
        '<div style="padding:4px 10px;background:#fff;border:1px solid var(--border-subtle);border-radius:6px;font:800 11px/1 Arial;color:#1A1F71;letter-spacing:-0.5px">VISA</div>' +
        '<div style="padding:4px 8px;background:#fff;border:1px solid var(--border-subtle);border-radius:6px;display:flex;align-items:center;gap:2px"><div style="width:12px;height:12px;border-radius:50%;background:#EB001B"></div><div style="width:12px;height:12px;border-radius:50%;background:#F79E1B;margin-left:-5px;mix-blend-mode:multiply"></div></div>' +
        '<div style="padding:4px 10px;background:#fff;border:1px solid var(--border-subtle);border-radius:6px;font:900 10px/1 Arial;color:#1f2937">TROY</div>' +
        '<div style="padding:4px 8px;background:#fff;border:1px solid var(--border-subtle);border-radius:6px;display:flex;align-items:center;gap:3px"><iconify-icon icon="logos:apple-pay" style="font-size:18px"></iconify-icon></div>' +
      '</div>' +
    '</div>';
}

/* ═══ BODY ═══ */
function _prmRenderBody() {
  var body = document.getElementById('premiumBody');
  if (!body) return;

  var p = _PRM_PRICING[_prmBilling];

  var html = '';

  /* ── HERO ── */
  html += '<div style="position:relative;padding:70px 20px 28px;background:linear-gradient(180deg,#7C3AED 0%,#5B21B6 55%,#4C1D95 100%);overflow:hidden">';
  /* Decorative orbs */
  html += '<div style="position:absolute;top:40px;right:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(252,211,77,.35) 0%,rgba(252,211,77,0) 70%)"></div>';
  html += '<div style="position:absolute;bottom:-50px;left:-30px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(236,72,153,.25) 0%,rgba(236,72,153,0) 70%)"></div>';
  html += '<div style="position:relative;text-align:center">';
  /* Crown icon */
  html += '<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#FCD34D 0%,#F59E0B 100%);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(252,211,77,.4);margin-bottom:14px">';
  html += '<iconify-icon icon="solar:crown-bold" style="font-size:38px;color:#fff"></iconify-icon>';
  html += '</div>';
  /* Badge */
  html += '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(252,211,77,.18);border:1px solid rgba(252,211,77,.4);border-radius:var(--r-full);margin-bottom:12px">';
  html += '<iconify-icon icon="solar:star-bold" style="font-size:13px;color:#FCD34D"></iconify-icon>';
  html += '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:#FCD34D;letter-spacing:.3px">PREMIUM ÜYELİK</span>';
  html += '</div>';
  /* Title */
  html += '<h1 style="font:var(--fw-bold) 26px/1.15 var(--font);color:#fff;margin:0 0 10px">Mutfağında Bir Şef,<br>Cebinde Bir Diyetisyen</h1>';
  html += '<p style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:rgba(255,255,255,.82);margin:0;max-width:320px;margin:0 auto">Premium\'a geçerek sınırsız planlama, gelişmiş AI analizleri ve reklamsız bir deneyimin kilidini aç.</p>';
  html += '</div>';
  html += '</div>';

  /* ── BENEFITS LIST ── */
  html += '<div style="padding:24px 16px 8px">';
  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">Premium ile neler kazanırsın?</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:16px">Tüm özellikler ilk günden itibaren kullanıma açıktır.</div>';

  html += '<div style="display:flex;flex-direction:column;gap:10px">';
  _PRM_BENEFITS.forEach(function(b) {
    html += '<div class="g-card" style="padding:14px;border-radius:var(--r-xl);display:flex;align-items:flex-start;gap:12px;border:1px solid var(--border-subtle)">';
    html += '<div style="width:42px;height:42px;border-radius:12px;background:' + b.color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0">';
    html += '<iconify-icon icon="' + b.icon + '" style="font-size:22px;color:' + b.color + '"></iconify-icon>';
    html += '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="display:flex;align-items:center;gap:6px">';
    html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + b.title + '</span>';
    html += '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>';
    html += '</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.45 var(--font);color:var(--text-secondary);margin-top:4px">' + b.desc + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';

  /* ── PRICING CARD ── */
  html += '<div style="padding:20px 16px 8px">';
  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:14px">Planını seç</div>';

  /* Billing toggle */
  html += '<div style="background:var(--bg-btn);border-radius:var(--r-full);padding:4px;display:flex;position:relative;margin-bottom:16px">';
  /* Monthly */
  var monActive = _prmBilling === 'monthly';
  html += '<div onclick="_prmSetBilling(\'monthly\')" style="flex:1;padding:11px 14px;border-radius:var(--r-full);background:' + (monActive ? '#fff' : 'transparent') + ';box-shadow:' + (monActive ? '0 2px 8px rgba(0,0,0,.08)' : 'none') + ';cursor:pointer;text-align:center;transition:all .2s">';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:' + (monActive ? 'var(--text-primary)' : 'var(--text-muted)') + '">Aylık</span>';
  html += '</div>';
  /* Yearly */
  var yearActive = _prmBilling === 'yearly';
  html += '<div onclick="_prmSetBilling(\'yearly\')" style="flex:1;padding:11px 14px;border-radius:var(--r-full);background:' + (yearActive ? '#fff' : 'transparent') + ';box-shadow:' + (yearActive ? '0 2px 8px rgba(0,0,0,.08)' : 'none') + ';cursor:pointer;text-align:center;transition:all .2s;position:relative">';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:' + (yearActive ? 'var(--text-primary)' : 'var(--text-muted)') + '">Yıllık</span>';
  html += '<span style="position:absolute;top:-9px;right:-2px;background:linear-gradient(135deg,#FCD34D 0%,#F59E0B 100%);color:#fff;font:var(--fw-bold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);box-shadow:0 2px 6px rgba(245,158,11,.4);letter-spacing:.3px">%20 TASARRUF</span>';
  html += '</div>';
  html += '</div>';

  /* Price card */
  html += '<div style="border:2px solid #7C3AED;border-radius:var(--r-xl);padding:20px;background:linear-gradient(135deg,rgba(124,58,237,.05) 0%,rgba(252,211,77,.05) 100%);position:relative;overflow:hidden">';
  /* Best value ribbon for yearly */
  if (yearActive) {
    html += '<div style="position:absolute;top:14px;right:-32px;transform:rotate(35deg);background:linear-gradient(90deg,#7C3AED 0%,#5B21B6 100%);color:#fff;padding:4px 32px;font:var(--fw-bold) 9px/1 var(--font);letter-spacing:.5px;box-shadow:0 2px 6px rgba(0,0,0,.15)">EN İYİ</div>';
  }

  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  html += '<iconify-icon icon="solar:crown-bold" style="font-size:18px;color:#7C3AED"></iconify-icon>';
  html += '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Premium ' + (yearActive ? 'Yıllık' : 'Aylık') + '</span>';
  html += '</div>';

  /* Main price display */
  html += '<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">';
  html += '<span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Sadece</span>';
  html += '<span style="font:var(--fw-bold) 38px/1 var(--font);color:#7C3AED">₺' + p.pricePerMonth + '</span>';
  html += '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-secondary)">/ ay</span>';
  html += '</div>';

  /* Subtext */
  html += '<div style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">' + p.billedLabel + '</div>';

  /* Saving highlight for yearly */
  if (yearActive) {
    html += '<div style="margin-top:14px;padding:10px 12px;background:#22C55E15;border:1px dashed #22C55E60;border-radius:var(--r-lg);display:flex;align-items:center;gap:8px">';
    html += '<iconify-icon icon="solar:tag-price-bold" style="font-size:18px;color:#22C55E"></iconify-icon>';
    html += '<div style="flex:1">';
    html += '<div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:#16A34A">Yıllık alımda ₺' + p.savingAmount + ' tasarruf</div>';
    html += '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Aylık ₺79 yerine, ayda ₺' + p.pricePerMonth + '</div>';
    html += '</div>';
    html += '</div>';
  }

  /* Features quick list */
  html += '<div style="margin-top:16px;padding-top:14px;border-top:1px dashed var(--border-subtle)">';
  ['Tüm Premium özellikler', '7 gün ücretsiz deneme', 'İstediğin zaman iptal'].forEach(function(f) {
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">';
    html += '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px;color:#22C55E"></iconify-icon>';
    html += '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + f + '</span>';
    html += '</div>';
  });
  html += '</div>';

  html += '</div>';  /* /price card */
  html += '</div>';

  /* ── SOCIAL PROOF ── */
  html += '<div style="padding:16px">';
  html += '<div style="padding:16px;background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px">';
  /* Avatar stack */
  html += '<div style="display:flex;align-items:center;flex-shrink:0">';
  var avColors = ['#F97316', '#8B5CF6', '#22C55E', '#EC4899'];
  avColors.forEach(function(c, i) {
    html += '<div style="width:30px;height:30px;border-radius:50%;background:' + c + ';border:2px solid var(--bg-phone);margin-left:' + (i === 0 ? '0' : '-10px') + ';display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 11px/1 var(--font);color:#fff">' + String.fromCharCode(65 + i) + '</div>';
  });
  html += '</div>';
  html += '<div style="flex:1;min-width:0">';
  html += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">';
  for (var s = 0; s < 5; s++) {
    html += '<iconify-icon icon="solar:star-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>';
  }
  html += '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-left:4px">4.9</span>';
  html += '</div>';
  html += '<div style="font:var(--fw-medium) 11px/1.3 var(--font);color:var(--text-secondary)"><strong style="color:var(--text-primary)">12.400+</strong> kullanıcı Premium\'u seviyor</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  /* ── FAQ mini ── */
  html += '<div style="padding:8px 16px 20px">';
  html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px;padding:0 4px">Sıkça sorulanlar</div>';
  [
    { q: 'Deneme süresi boyunca ücret alınır mı?', a: '7 gün boyunca hiçbir ücret alınmaz. İstediğin zaman iptal edebilirsin.' },
    { q: 'İptal nasıl çalışır?', a: 'Üyelik ayarlarından tek tıkla iptal edebilirsin. Mevcut dönemin sonuna kadar erişimin devam eder.' },
    { q: 'Farklı cihazlarda kullanabilir miyim?', a: 'Evet. Hesabınla tüm cihazlarda aynı üyelik geçerli olur.' }
  ].forEach(function(f, i) {
    html += '<details style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);margin-bottom:8px">';
    html += '<summary style="padding:14px 16px;cursor:pointer;font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px">';
    html += '<span>' + f.q + '</span>';
    html += '<iconify-icon icon="solar:alt-arrow-down-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>';
    html += '</summary>';
    html += '<div style="padding:0 16px 14px;font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-secondary)">' + f.a + '</div>';
    html += '</details>';
  });
  html += '</div>';

  /* ── Legal footer ── */
  html += '<div style="padding:0 16px 16px;text-align:center">';
  html += '<div style="font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-muted)">Satın alma ile <span style="text-decoration:underline">Kullanım Koşulları</span> ve <span style="text-decoration:underline">Gizlilik Politikası</span>\'nı kabul etmiş olursun. Üyelik otomatik yenilenir, iptal edilene kadar.</div>';
  html += '</div>';

  body.innerHTML = html;
}

/* ═══ ACTIONS ═══ */
function _prmSetBilling(b) {
  if (b !== 'monthly' && b !== 'yearly') return;
  _prmBilling = b;
  _prmRenderBody();
}

function _prmPurchase() {
  var p = _PRM_PRICING[_prmBilling];
  var btn = document.getElementById('premiumPurchaseBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<iconify-icon icon="solar:refresh-linear" style="font-size:20px;color:#fff;animation:prmSpin 1s linear infinite"></iconify-icon><span>İşleniyor...</span>';
  }
  setTimeout(function() {
    _prmShowSuccess(p);
  }, 900);
}

function _prmShowSuccess(p) {
  var container = document.getElementById('premiumContainer');
  if (!container) return;

  container.innerHTML =
    '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;background:linear-gradient(180deg,#4C1D95 0%,#7C3AED 100%);position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(252,211,77,.3) 0%,rgba(252,211,77,0) 70%)"></div>' +
      '<div style="position:relative">' +
        '<div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#FCD34D 0%,#F59E0B 100%);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(252,211,77,.5);margin-bottom:20px;animation:prmPop .5s cubic-bezier(.34,1.56,.64,1)">' +
          '<iconify-icon icon="solar:crown-bold" style="font-size:52px;color:#fff"></iconify-icon>' +
        '</div>' +
        '<h2 style="font:var(--fw-bold) 24px/1.2 var(--font);color:#fff;margin:0 0 10px">Hoş geldin, Premium Üye! 🎉</h2>' +
        '<p style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:rgba(255,255,255,.85);margin:0 0 28px;max-width:320px">Tüm Premium özellikler şu anda hesabında aktif. İlk 7 gün ücretsiz — sonrasında ' + p.totalLabel + '.</p>' +
        '<button onclick="closePremiumPage()" style="padding:15px 32px;border:none;border-radius:var(--r-xl);background:#fff;color:#7C3AED;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2)">Keşfetmeye Başla</button>' +
      '</div>' +
    '</div>';
}

function _prmRestore() {
  var msg = 'Geri yüklenecek önceki satın alım bulunamadı';
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:9999';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

/* ═══ STYLES ═══ */
function _prmInjectStyles() {
  if (document.getElementById('premiumStyles')) return;
  var st = document.createElement('style');
  st.id = 'premiumStyles';
  st.textContent =
    '@keyframes prmSpin { to { transform: rotate(360deg); } }' +
    '@keyframes prmPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }' +
    '#premiumOverlay details[open] summary iconify-icon { transform: rotate(180deg); transition: transform .2s; }' +
    '#premiumOverlay details summary iconify-icon { transition: transform .2s; }' +
    '#premiumOverlay details summary::-webkit-details-marker { display: none; }';
  document.head.appendChild(st);
}

/* ═══ EXPORTS ═══ */
window.openPremiumPage = openPremiumPage;
window.closePremiumPage = closePremiumPage;
window._prmSetBilling = _prmSetBilling;
window._prmPurchase = _prmPurchase;
window._prmRestore = _prmRestore;
