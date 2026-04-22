/* ═══════════════════════════════════════════════════════════
   ŞEF OLMAK İÇİN BAŞVUR — Bilgilendirme Sayfası ("Çok Yakında")
   Hesabım > Bildirimler altındaki tile'dan açılır.
   Formsuz salt okunur landing; Geri Dön butonu ile Hesabım'a döner.
   ═══════════════════════════════════════════════════════════ */

function openChefApplyPage() {
  _chefApplyInjectStyles();
  var phone = document.getElementById('phone') || document.body;
  closeChefApplyPage();

  var overlay = document.createElement('div');
  overlay.id = 'chefApplyOverlay';
  overlay.className = 'prof-overlay open chef-apply-overlay';

  overlay.innerHTML = ''
    /* Arka plan görseli (blur) */
    + '<div class="chef-apply-bg"></div>'
    + '<div class="chef-apply-bg-veil"></div>'
    /* Üst bar — sol üstte Geri Dön */
    + '<div class="chef-apply-topbar">'
    +   '<div class="chef-apply-back" onclick="closeChefApplyPage()">'
    +     '<iconify-icon icon="solar:arrow-left-linear" style="font-size:19px"></iconify-icon>'
    +     '<span>Geri Dön</span>'
    +   '</div>'
    + '</div>'
    /* İçerik */
    + '<div class="chef-apply-body">'
    +   '<div class="chef-apply-badge">'
    +     '<iconify-icon icon="solar:chef-hat-minimalistic-bold" style="font-size:44px;color:#fff"></iconify-icon>'
    +   '</div>'
    +   '<div class="chef-apply-pill">'
    +     '<iconify-icon icon="solar:clock-circle-bold" style="font-size:12px"></iconify-icon>'
    +     '<span>Çok Yakında</span>'
    +   '</div>'
    +   '<h1 class="chef-apply-title">Şef Olmak İçin Başvur</h1>'
    +   '<p class="chef-apply-text">Değerli kullanıcımız; uygulama içerisinde şef olmanız için başvuru yapmanız gerekecektir. Şu an sistem içerisinde sizler gibi şeflerin daha rahat, konforlu ve emeklerinden gelir elde edebileceği, kendi topluluğunu yönetebileceği profesyonel bir yapı inşa ediyoruz.</p>'
    +   '<p class="chef-apply-text">Geliştirmelerimiz tüm hızıyla sürüyor. <b>Lufga</b> yemek uygulamasını takibini bırakmayın, çok yakında mutfağın hakimi siz olacaksınız!</p>'
    /* Özellik önizlemeleri */
    +   '<div class="chef-apply-features">'
    +     _chefApplyFeatureHtml('solar:users-group-rounded-bold', 'Topluluğunu Yönet', 'Takipçi, tarif yayın ve içerik performansı tek panelden')
    +     _chefApplyFeatureHtml('solar:dollar-minimalistic-bold', 'Emeğinden Kazan',   'Premium tarif, sponsorluk ve bağış modelleriyle gelir')
    +     _chefApplyFeatureHtml('solar:chat-round-dots-bold',     'Doğrudan Etkileşim','Takipçilerinle canlı soru-cevap ve workshop')
    +   '</div>'
    + '</div>'
    /* Alt bar — tekrar Geri Dön */
    + '<div class="chef-apply-foot">'
    +   '<button class="chef-apply-foot-btn" onclick="closeChefApplyPage()">'
    +     '<iconify-icon icon="solar:arrow-left-linear" style="font-size:16px"></iconify-icon>'
    +     'Hesabım\'a Geri Dön'
    +   '</button>'
    + '</div>';

  phone.appendChild(overlay);
}

function closeChefApplyPage() {
  var o = document.getElementById('chefApplyOverlay');
  if (o) o.remove();
}

function _chefApplyFeatureHtml(icon, title, desc) {
  return '<div class="chef-apply-feature">'
    + '<div class="chef-apply-feat-ico"><iconify-icon icon="' + icon + '" style="font-size:18px;color:#EA580C"></iconify-icon></div>'
    + '<div style="flex:1"><div class="chef-apply-feat-title">' + title + '</div>'
    + '<div class="chef-apply-feat-desc">' + desc + '</div></div>'
    + '</div>';
}

function _chefApplyInjectStyles() {
  if (document.getElementById('chefApplyStyles')) return;
  var s = document.createElement('style');
  s.id = 'chefApplyStyles';
  s.textContent = [
    '.chef-apply-overlay{overflow:hidden}',
    /* Blur'lu profesyonel mutfak arka planı */
    '.chef-apply-bg{position:absolute;inset:0;background-image:url("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80");background-size:cover;background-position:center;filter:blur(22px) saturate(1.05);transform:scale(1.1);z-index:0}',
    '.chef-apply-bg-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,242,232,.85) 0%,rgba(255,255,255,.95) 55%,rgba(255,255,255,.98) 100%);z-index:0}',
    '.chef-apply-topbar{position:relative;z-index:2;padding:max(env(safe-area-inset-top),16px) var(--app-px) 8px;display:flex;align-items:center}',
    '.chef-apply-back{display:inline-flex;align-items:center;gap:6px;padding:8px 14px 8px 10px;background:var(--bg-page);border:1px solid var(--border-subtle);border-radius:var(--r-full);box-shadow:var(--shadow-sm);cursor:pointer;color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font)}',
    '.chef-apply-back:active{transform:scale(.97)}',
    '.chef-apply-body{position:relative;z-index:2;flex:1;overflow-y:auto;padding:16px var(--app-px) 120px;display:flex;flex-direction:column;align-items:center;text-align:center}',
    '.chef-apply-badge{width:108px;height:108px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FB923C,#EA580C);box-shadow:0 18px 36px rgba(234,88,12,.28);margin:14px 0 16px;position:relative}',
    '.chef-apply-badge::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px dashed rgba(234,88,12,.35);animation:chefApplyRing 12s linear infinite}',
    '@keyframes chefApplyRing{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '.chef-apply-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--r-full);background:rgba(234,88,12,.12);border:1px solid rgba(234,88,12,.32);color:#EA580C;font:var(--fw-bold) 10.5px/1 var(--font);letter-spacing:.5px;text-transform:uppercase}',
    '.chef-apply-title{font:var(--fw-bold) 24px/1.2 var(--font);color:#7C2D12;margin:12px 0 4px;letter-spacing:-.3px}',
    '.chef-apply-text{max-width:420px;font:var(--fw-regular) 13.5px/1.6 var(--font);color:var(--text-secondary);margin:10px 0 0}',
    '.chef-apply-text b{color:#EA580C;font-weight:700}',
    '.chef-apply-features{width:100%;max-width:420px;margin:22px 0 4px;display:flex;flex-direction:column;gap:10px}',
    '.chef-apply-feature{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(234,88,12,.18);border-radius:var(--r-xl);text-align:left}',
    '.chef-apply-feat-ico{width:38px;height:38px;border-radius:var(--r-lg);background:rgba(234,88,12,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.chef-apply-feat-title{font:var(--fw-bold) 13.5px/1.2 var(--font);color:var(--text-primary)}',
    '.chef-apply-feat-desc{font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-muted);margin-top:3px}',
    '.chef-apply-foot{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:14px var(--app-px) max(env(safe-area-inset-bottom),16px);background:linear-gradient(0deg,var(--bg-page) 40%,rgba(255,255,255,0) 100%)}',
    '.chef-apply-foot-btn{width:100%;padding:14px 18px;border:none;border-radius:var(--r-full);background:linear-gradient(135deg,#FB923C,#EA580C);color:#fff;font:var(--fw-bold) 14px/1 var(--font);display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 10px 24px rgba(234,88,12,.32)}',
    '.chef-apply-foot-btn:active{transform:scale(.98)}'
  ].join('\n');
  document.head.appendChild(s);
}
