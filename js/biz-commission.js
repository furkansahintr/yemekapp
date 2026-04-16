/* ═══════════════════════════════════════════════════
   KOMİSYON AYARLARI — UI-only
   Şube bazlı dinamik komisyon göstergesi + rehber + SSS
   ═══════════════════════════════════════════════════ */

/* Puandan komisyon oranı hesaplama (UI mock)
   5.0      → 5.5%   (Süper İşletme)
   4.8-4.9  → 7.0%
   4.5-4.7  → 9.0%
   4.0-4.4  → 11.0%
   3.5-3.9  → 13.0%
   <3.5     → 15.0%
*/
function _commRate(rating) {
  if (rating >= 5.0) return 5.5;
  if (rating >= 4.8) return 7.0;
  if (rating >= 4.5) return 9.0;
  if (rating >= 4.0) return 11.0;
  if (rating >= 3.5) return 13.0;
  return 15.0;
}

function _commTier(rating) {
  if (rating >= 5.0) return { label: 'Süper İşletme', color: '#A855F7', icon: 'solar:crown-bold' };
  if (rating >= 4.8) return { label: 'Elit', color: '#22C55E', icon: 'solar:medal-star-bold' };
  if (rating >= 4.5) return { label: 'Yüksek', color: '#10B981', icon: 'solar:shield-check-bold' };
  if (rating >= 4.0) return { label: 'Standart', color: '#F59E0B', icon: 'solar:star-bold' };
  if (rating >= 3.5) return { label: 'Gelişim', color: '#F97316', icon: 'solar:graph-up-linear' };
  return { label: 'Dikkat', color: '#EF4444', icon: 'solar:danger-triangle-bold' };
}

/* Bir sonraki kademeye atlamak için hedef puan */
function _commNextTarget(rating) {
  if (rating >= 5.0) return null;
  if (rating >= 4.8) return { target: 5.0, gap: (5.0 - rating).toFixed(1), rate: 5.5 };
  if (rating >= 4.5) return { target: 4.8, gap: (4.8 - rating).toFixed(1), rate: 7.0 };
  if (rating >= 4.0) return { target: 4.5, gap: (4.5 - rating).toFixed(1), rate: 9.0 };
  if (rating >= 3.5) return { target: 4.0, gap: (4.0 - rating).toFixed(1), rate: 11.0 };
  return { target: 3.5, gap: (3.5 - rating).toFixed(1), rate: 13.0 };
}

/* Tüm kademeler — tablo için */
var _COMM_TIERS = [
  { from: 5.0, to: 5.0, rate: 5.5, label: 'Süper İşletme', color: '#A855F7' },
  { from: 4.8, to: 4.9, rate: 7.0, label: 'Elit', color: '#22C55E' },
  { from: 4.5, to: 4.7, rate: 9.0, label: 'Yüksek', color: '#10B981' },
  { from: 4.0, to: 4.4, rate: 11.0, label: 'Standart', color: '#F59E0B' },
  { from: 3.5, to: 3.9, rate: 13.0, label: 'Gelişim', color: '#F97316' },
  { from: 0.0, to: 3.4, rate: 15.0, label: 'Dikkat', color: '#EF4444' }
];

/* Gelişim ipuçları — her biri ayrı detay sayfasına girilebilir */
var _COMM_TIPS = [
  {
    id: 'speed',
    icon: 'solar:clock-circle-bold',
    color: '#3B82F6',
    title: 'Hız ve Operasyon',
    text: 'Sipariş hazırlama sürelerinizi 15 dakikanın altına indirerek puanınızı artırabilirsiniz.',
    target: '< 15 dk hazırlık',
    impact: '+0.3 puan',
    steps: [
      { icon: 'solar:chef-hat-linear', title: 'Mutfakta hazırlık istasyonlarını optimize edin', desc: 'Sık siparişlenen ürünler için sabit istasyon ayarlayın; mise-en-place hazır olsun.' },
      { icon: 'solar:bell-linear', title: 'KDS / tablet bildirimlerini açık tutun', desc: 'Yeni sipariş geldiğinde 30 saniye içinde onaylamak ortalama süreyi 2-3 dakika kısaltır.' },
      { icon: 'solar:graph-new-up-linear', title: 'Yoğun saatlerde ekibi güçlendirin', desc: 'Haftalık rapordaki pik saatleri inceleyip ek personel veya vardiya planlayın.' },
      { icon: 'solar:cup-hot-linear', title: 'Paketleme akışını ayrı bir personele verin', desc: 'Pişirme ile paketlemeyi ayırmak, kurye bekleme süresini belirgin şekilde azaltır.' }
    ],
    kpis: [
      { label: 'Ortalama hazırlık', value: '12 dk', color: '#22C55E' },
      { label: 'Pik saat hazırlık', value: '18 dk', color: '#F59E0B' },
      { label: 'Hedef', value: '< 15 dk', color: '#3B82F6' }
    ]
  },
  {
    id: 'feedback',
    icon: 'solar:chat-round-check-bold',
    color: '#10B981',
    title: 'Geri Bildirimler',
    text: 'Müşteri yorumlarına nazik ve hızlı dönüş yapmak, sadakati ve puanınızı doğrudan etkiler.',
    target: '< 24 saat yanıt',
    impact: '+0.2 puan',
    steps: [
      { icon: 'solar:inbox-in-linear', title: 'Yorumları günlük kontrol edin', desc: 'Her sabah ve akşam yorum kutunuza göz atın; cevap süresi 24 saatin altında kalsın.' },
      { icon: 'solar:heart-linear', title: 'Olumlu yorumlara teşekkür edin', desc: 'Kısa ve samimi bir "Teşekkürler, tekrar bekleriz!" mesajı bile sadakati artırır.' },
      { icon: 'solar:shield-warning-linear', title: 'Olumsuz yorumları savunmaya geçmeden çözün', desc: 'Özür + çözüm + telafi formülü kullanın; müşteri tekrar sipariş verme olasılığı 3x artar.' },
      { icon: 'solar:document-add-linear', title: 'Hazır yanıt şablonları oluşturun', desc: 'Sık karşılaşılan durumlar için kişiselleştirilebilir şablonlar hız kazandırır.' }
    ],
    kpis: [
      { label: 'Yanıt oranı', value: '%78', color: '#10B981' },
      { label: 'Ort. yanıt süresi', value: '6 saat', color: '#22C55E' },
      { label: 'Hedef', value: '%90+', color: '#10B981' }
    ]
  },
  {
    id: 'accuracy',
    icon: 'solar:check-square-bold',
    color: '#A855F7',
    title: 'Hatasız Servis',
    text: 'Eksik veya hatalı ürün gönderim oranını %1\'in altında tutan işletmeler, "Süper İşletme" statüsüne geçerek indirimli komisyon oranlarından yararlanır.',
    target: '< %1 hata',
    impact: 'Süper İşletme statüsü',
    steps: [
      { icon: 'solar:clipboard-check-linear', title: 'Paketleme kontrol listesi kullanın', desc: 'Her paketi kapatmadan önce kontrol eden 2. bir kişi hatayı %60 azaltır.' },
      { icon: 'solar:tag-price-linear', title: 'Ürünleri etiketleyin', desc: 'Modifikasyon ve not bilgileri etiket üzerinde olsun; kurye ve müşteri doğrulayabilsin.' },
      { icon: 'solar:box-linear', title: 'Isı ve taşıma standartları', desc: 'Sıcak-soğuk ayrımı, sızdırmaz kaplar ve bozulmaya karşı koruyucu paketleme şarttır.' },
      { icon: 'solar:refresh-linear', title: 'Hataları kök nedeninde çözün', desc: 'Haftalık hata raporunu ekiple inceleyin; tekrarlayan hatayı süreç değişikliğiyle kapatın.' }
    ],
    kpis: [
      { label: 'Hata oranı', value: '%0.8', color: '#22C55E' },
      { label: 'Tekrar sipariş', value: '%64', color: '#A855F7' },
      { label: 'Süper hedefi', value: '< %1', color: '#A855F7' }
    ]
  },
  {
    id: 'photos',
    icon: 'solar:gallery-bold',
    color: '#F97316',
    title: 'Kaliteli Ürün Görselleri',
    text: 'Profesyonel ve güncel menü fotoğrafları, sipariş sayısını artırır ve müşteri memnuniyetini destekler.',
    target: 'Tüm ürünlerde görsel',
    impact: '+%18 sipariş',
    steps: [
      { icon: 'solar:camera-linear', title: 'Doğal ışık ve sade arka plan kullanın', desc: 'Gün ışığı altında, beyaz/ahşap zeminde çekilen görseller en yüksek tıklanma oranına sahip.' },
      { icon: 'solar:crop-linear', title: 'Standart oranda çekin', desc: '1:1 (kare) veya 4:3 oran, tüm cihazlarda tutarlı görünüm sağlar.' },
      { icon: 'solar:calendar-linear', title: 'Görselleri güncel tutun', desc: 'Sunum değişirse fotoğrafı da yenileyin; yanıltıcı görsel puanı düşürür.' },
      { icon: 'solar:magic-stick-3-linear', title: 'AI ile iyileştirin', desc: 'Uygulamadaki "Görsel İyileştir" aracı ile renkleri ve kontrastı otomatik optimize edin.' }
    ],
    kpis: [
      { label: 'Görsel kapsamı', value: '%92', color: '#F97316' },
      { label: 'Ort. tıklama', value: '+%18', color: '#22C55E' },
      { label: 'Hedef', value: '%100', color: '#F97316' }
    ]
  },
  {
    id: 'menu',
    icon: 'solar:bill-list-bold',
    color: '#EC4899',
    title: 'Menü Güncelliği',
    text: 'Stokta olmayan ürünleri anında "tükendi" olarak işaretlemek, iptal oranını azaltır ve puanınızı korur.',
    target: 'Canlı stok takibi',
    impact: '-%40 iptal',
    steps: [
      { icon: 'solar:box-minimalistic-linear', title: 'Stok seviyelerini günlük güncelleyin', desc: 'Sabah açılışta ve akşam servisten önce hızlı bir kontrol ile ürün durumu güncellensin.' },
      { icon: 'solar:lightning-linear', title: '"Tükendi" düğmesini kullanın', desc: 'Anlık tükenen ürünü tek dokunuşla menüden gizleyerek iptalleri önleyin.' },
      { icon: 'solar:calendar-add-linear', title: 'Mevsimsel ürünler planlayın', desc: 'Kısa süreli mevsim ürünleri "sınırlı süre" etiketi ile ilgi çeker ve stoğu tüketir.' },
      { icon: 'solar:tag-linear', title: 'Fiyat değişikliğini hemen yansıtın', desc: 'Tedarikçi değişiklikleri sonrası fiyat güncellenmezse marjınız zarar görür.' }
    ],
    kpis: [
      { label: 'İptal oranı', value: '%2.1', color: '#F59E0B' },
      { label: 'Stok güncelliği', value: 'Günlük', color: '#22C55E' },
      { label: 'Hedef iptal', value: '< %1.5', color: '#EC4899' }
    ]
  }
];

/* SSS */
var _COMM_FAQ = [
  {
    q: 'Komisyon oranları neden farklılık gösteriyor?',
    a: 'Süperresto olarak amacımız, en kaliteli hizmeti veren işletmeleri ödüllendirmektir. Yüksek puanlı işletmeler daha az komisyon öderken, bu sistem sayesinde platformdaki hizmet kalitesini hep beraber yükseltiyoruz.'
  },
  {
    q: 'Değerlendirmelerim ne sıklıkla güncelleniyor?',
    a: 'Puanlarınız ve komisyon oranınız haftalık olarak yeniden hesaplanır. Yani bu hafta yapacağınız mükemmel bir servis, önümüzdeki hafta komisyonunuzun düşmesini sağlayabilir!'
  },
  {
    q: 'Puanım düşerse komisyon oranım hemen yükselir mi?',
    a: 'Hayır, puan değişimleri haftalık döngülerde değerlendirilir. Böylece geçici dalgalanmalar işletmenizi anlık etkilemez; toparlanmak için her zaman fırsatınız olur.'
  },
  {
    q: 'Hangi puanlar hesaplamaya dahil ediliyor?',
    a: 'Son 90 gün içindeki müşteri yorumları, sipariş hazırlama süresi, iptal/iade oranı ve operasyonel kalite metrikleri birlikte değerlendirilir. Tek bir kötü yorum toplam puanınızı önemli ölçüde değiştirmez.'
  },
  {
    q: '"Süper İşletme" nasıl olabilirim?',
    a: '5.0 puan seviyesine ulaşan ve son 4 hafta boyunca bu seviyeyi koruyan işletmeler otomatik olarak Süper İşletme statüsüne geçer. Bu rozet profilinizde ve müşteri aramalarında öne çıkar.'
  },
  {
    q: 'Komisyon oranım platform promosyonlarını etkiler mi?',
    a: 'Hayır. Platform kampanyaları ve komisyon oranı birbirinden bağımsız yönetilir. Kampanyalara katılarak satışınızı artırabilir, aynı zamanda puanınızı yükselterek komisyonunuzu düşürebilirsiniz.'
  }
];

/* ═══ ŞUBE SEÇİCİ (çoklu şube) ═══ */
function _commOpenBranchPicker() {
  _commInjectStyles();
  var branches = BIZ_BRANCHES;

  var overlay = document.createElement('div');
  overlay.id = 'commBranchPickerOverlay';
  overlay.className = 'prof-overlay open';
  overlay.innerHTML = '\
    <div class="prof-container" style="background:var(--bg-phone-secondary)">\
      <div class="prof-topbar" style="background:var(--bg-phone);border-bottom:1px solid var(--border-subtle)">\
        <div onclick="document.getElementById(\'commBranchPickerOverlay\').remove()" style="cursor:pointer;display:flex;align-items:center;gap:6px">\
          <iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:22px;color:var(--text-primary)"></iconify-icon>\
        </div>\
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyon Oranlarım</div>\
        <div style="width:22px"></div>\
      </div>\
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">\
        <div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:12px 14px;display:flex;gap:10px;align-items:flex-start">\
          <iconify-icon icon="solar:shop-2-bold" style="font-size:20px;color:var(--primary);flex-shrink:0;margin-top:1px"></iconify-icon>\
          <div style="font:var(--fw-regular) var(--fs-xs)/1.45 var(--font);color:var(--text-secondary)">Komisyon detaylarını görüntülemek istediğiniz şubeyi seçin. Her şubenin komisyon oranı, kendi performans puanına göre ayrı hesaplanır.</div>\
        </div>\
        <div style="display:flex;flex-direction:column;gap:10px" id="commBranchList"></div>\
        <div style="height:20px"></div>\
      </div>\
    </div>';
  document.getElementById('bizPhone').appendChild(overlay);

  var list = document.getElementById('commBranchList');
  if (!list) return;
  var html = '';
  for (var i = 0; i < branches.length; i++) {
    var b = branches[i];
    var r = Number(b.rating || 0);
    var rate = _commRate(r);
    var tier = _commTier(r);
    html += '<div onclick="document.getElementById(\'commBranchPickerOverlay\').remove(); openBizCommissionSettings(\'' + b.id + '\')" style="background:var(--bg-phone);border:1px solid ' + tier.color + '33;border-radius:var(--r-xl);box-shadow:var(--shadow-md);padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:border-color .15s ease">'
      + '<div style="width:50px;height:50px;border-radius:var(--r-lg);background:' + tier.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0;flex-direction:column;gap:2px">'
      + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + tier.color + '">%' + rate + '</span>'
      + '<span style="font:var(--fw-regular) 9px/1 var(--font);color:' + tier.color + '">komisyon</span>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
      + '<span style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">' + (typeof escHtml === 'function' ? escHtml(b.name) : b.name) + '</span>'
      + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + tier.color + ';background:' + tier.color + '18;padding:3px 7px;border-radius:var(--r-full)">' + tier.label + '</span>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:6px;margin-top:5px">'
      + '<div style="display:flex;gap:1px">' + _commStars(r) + '</div>'
      + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + r.toFixed(1) + ' / 5.0</span>'
      + '</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-tertiary);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (typeof escHtml === 'function' ? escHtml(b.address) : b.address) + '</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:20px;color:' + tier.color + '"></iconify-icon>'
      + '</div>';
  }
  list.innerHTML = html;
}

/* ═══ ANA SAYFA ═══ */
function openBizCommissionSettings(branchId) {
  if (typeof bizCurrentRole !== 'undefined' && bizCurrentRole !== 'owner' && bizCurrentRole !== 'manager') {
    if (typeof _bshToast === 'function') _bshToast('Bu alana erişim yetkiniz yok', 'err');
    return;
  }
  const branch = BIZ_BRANCHES.find(b => b.id === branchId);
  if (!branch) return;

  _commInjectStyles();

  const rating = Number(branch.rating || 0);
  const rate = _commRate(rating);
  const tier = _commTier(rating);
  const next = _commNextTarget(rating);

  const container = document.createElement('div');
  container.id = 'bizCommissionOverlay';
  container.className = 'prof-overlay open';
  container.innerHTML = `
    <div class="prof-container" style="background:var(--bg-phone-secondary)">
      <div class="prof-topbar" style="background:var(--bg-phone);border-bottom:1px solid var(--border-subtle)">
        <div onclick="document.getElementById('bizCommissionOverlay').remove()" style="cursor:pointer;display:flex;align-items:center;gap:6px">
          <iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:22px;color:var(--text-primary)"></iconify-icon>
        </div>
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyon Ayarları</div>
        <div style="width:22px"></div>
      </div>

      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">

        <!-- Dashboard Card -->
        <div class="comm-hero" style="background:linear-gradient(135deg, ${tier.color}20, var(--bg-phone));border:1px solid ${tier.color}55;border-radius:var(--r-xl);padding:18px;box-shadow:var(--shadow-md);overflow:hidden;position:relative">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <iconify-icon icon="${tier.icon}" style="font-size:18px;color:${tier.color}"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:${tier.color};text-transform:uppercase;letter-spacing:0.5px">${tier.label}</span>
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:14px">${_commEsc(branch.name)}</div>

          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:16px">
            <div style="flex:1">
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:6px">Değerlendirme Puanı</div>
              <div style="display:flex;align-items:baseline;gap:4px">
                <span style="font:var(--fw-bold) 40px/1 var(--font);color:var(--text-primary)">${rating.toFixed(1)}</span>
                <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-muted)">/ 5.0</span>
              </div>
              <div style="display:flex;gap:2px;margin-top:6px">
                ${_commStars(rating)}
              </div>
            </div>
            <div style="width:1px;height:60px;background:var(--border-subtle)"></div>
            <div style="flex:1;text-align:right">
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:6px">Güncel Komisyon</div>
              <div style="display:flex;align-items:baseline;gap:2px;justify-content:flex-end">
                <span style="font:var(--fw-bold) 40px/1 var(--font);color:${tier.color}">%${rate}</span>
              </div>
              <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-tertiary);margin-top:6px">Haftalık hesaplanır</div>
            </div>
          </div>

          ${next ? `
          <div style="background:var(--bg-phone);border:1px dashed ${tier.color}77;border-radius:var(--r-lg);padding:12px;display:flex;align-items:center;gap:10px">
            <iconify-icon icon="solar:graph-up-linear" style="font-size:22px;color:${tier.color};flex-shrink:0"></iconify-icon>
            <div style="flex:1;min-width:0">
              <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Hedef: ${next.target.toFixed(1)} puan</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Sadece <b style="color:${tier.color}">${next.gap} puan</b> uzakta — komisyonunuz %${next.rate}'e düşebilir</div>
            </div>
          </div>
          ` : `
          <div style="background:var(--bg-phone);border:1px dashed #A855F7;border-radius:var(--r-lg);padding:12px;display:flex;align-items:center;gap:10px">
            <iconify-icon icon="solar:crown-bold" style="font-size:22px;color:#A855F7;flex-shrink:0"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:#A855F7">Tebrikler — En Üst Kademedesiniz!</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Bu seviyeyi koruyarak avantajlı komisyon oranınızı sürdürebilirsiniz.</div>
            </div>
          </div>
          `}
        </div>

        <!-- Bilgilendirme -->
        <div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:12px 14px;display:flex;gap:10px;align-items:flex-start">
          <iconify-icon icon="solar:info-circle-bold" style="font-size:20px;color:var(--primary);flex-shrink:0;margin-top:1px"></iconify-icon>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.45 var(--font);color:var(--text-secondary)">Komisyon oranınız, işletme performansınız ve müşteri memnuniyet puanınız üzerinden dinamik olarak hesaplanmaktadır.</div>
        </div>

        <!-- Komisyon Kademeleri -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:chart-square-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyon Kademeleri</span>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
            ${_COMM_TIERS.map((t, idx) => {
              const active = rating >= t.from && rating <= t.to;
              return `
              <div onclick="_commOpenTier(${idx}, ${rating})" style="padding:12px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;${idx < _COMM_TIERS.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : ''}${active ? `background:${t.color}10;` : ''}">
                <div style="width:36px;height:36px;border-radius:var(--r-md);background:${t.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:${t.color}">%${t.rate}</span>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font:var(--fw-medium) var(--fs-sm)/1.1 var(--font);color:var(--text-primary);display:flex;align-items:center;gap:6px">
                    ${t.label}
                    ${active ? `<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#fff;background:${t.color};padding:3px 7px;border-radius:var(--r-full)">SİZ</span>` : ''}
                  </div>
                  <div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:3px">${t.from === t.to ? `${t.from.toFixed(1)} puan` : `${t.from.toFixed(1)} – ${t.to.toFixed(1)} puan`}</div>
                </div>
                ${active ? `<iconify-icon icon="solar:verified-check-bold" style="font-size:20px;color:${t.color}"></iconify-icon>` : `<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-tertiary)"></iconify-icon>`}
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Gelişim İpuçları -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:lightbulb-bolt-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Nasıl Daha Az Komisyon Öderim?</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${_COMM_TIPS.map(tip => `
              <div onclick="_commOpenTip('${tip.id}')" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:transform .15s ease, border-color .15s ease" onmouseover="this.style.borderColor='${tip.color}55'" onmouseout="this.style.borderColor='var(--border-subtle)'">
                <div style="width:38px;height:38px;border-radius:var(--r-lg);background:${tip.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <iconify-icon icon="${tip.icon}" style="font-size:20px;color:${tip.color}"></iconify-icon>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${tip.title}</span>
                    <span style="font:var(--fw-semibold) 10px/1 var(--font);color:${tip.color};background:${tip.color}18;padding:3px 7px;border-radius:var(--r-full)">${tip.impact}</span>
                  </div>
                  <div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-muted);margin-top:4px">${tip.text}</div>
                  <div style="margin-top:8px;display:flex;align-items:center;gap:4px">
                    <span style="font:var(--fw-medium) 11px/1 var(--font);color:${tip.color}">Detayları gör</span>
                    <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:${tip.color}"></iconify-icon>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SSS -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:question-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Sıkça Sorulan Sorular</span>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
            ${_COMM_FAQ.map((f, i) => `
              <div class="comm-faq-item" style="${i < _COMM_FAQ.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : ''}">
                <div class="comm-faq-q" onclick="_commToggleFaq(${i})" data-faq-idx="${i}" style="padding:14px 16px;display:flex;align-items:center;gap:10px;cursor:pointer">
                  <div style="flex:1;min-width:0;font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">${f.q}</div>
                  <iconify-icon icon="solar:alt-arrow-down-linear" class="comm-faq-chev" data-chev="${i}" style="font-size:18px;color:var(--text-muted);transition:transform .2s"></iconify-icon>
                </div>
                <div class="comm-faq-a" id="commFaqA_${i}" style="max-height:0;overflow:hidden;transition:max-height .3s ease;background:var(--primary-soft)">
                  <div style="padding:12px 16px 14px;font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">${f.a}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- İletişim -->
        <div onclick="(typeof openSupportPanel==='function') ? openSupportPanel() : alert('Destek ekibi — yakında!')" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer">
          <iconify-icon icon="solar:chat-square-like-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-semibold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)">Daha fazla sorunuz mu var?</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Destek ekibimizle iletişime geçin</div>
          </div>
          <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>
        </div>

        <div style="height:20px"></div>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(container);
}

/* ═══ İPUCU DETAY SAYFASI ═══ */
function _commOpenTip(tipId) {
  const tip = _COMM_TIPS.find(t => t.id === tipId);
  if (!tip) return;

  const c = document.createElement('div');
  c.id = 'commTipOverlay';
  c.className = 'prof-overlay open';
  c.style.zIndex = '85';
  c.innerHTML = `
    <div class="prof-container" style="background:var(--bg-phone-secondary)">
      <div class="prof-topbar" style="background:var(--bg-phone);border-bottom:1px solid var(--border-subtle)">
        <div onclick="document.getElementById('commTipOverlay').remove()" style="cursor:pointer;display:flex;align-items:center;gap:6px">
          <iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:22px;color:var(--text-primary)"></iconify-icon>
        </div>
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${_commEsc(tip.title)}</div>
        <div style="width:22px"></div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">

        <!-- Başlık kartı -->
        <div style="background:linear-gradient(135deg, ${tip.color}22, var(--bg-phone));border:1px solid ${tip.color}55;border-radius:var(--r-xl);padding:18px;display:flex;gap:14px;align-items:center;box-shadow:var(--shadow-md)">
          <div style="width:58px;height:58px;border-radius:var(--r-lg);background:${tip.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <iconify-icon icon="${tip.icon}" style="font-size:30px;color:#fff"></iconify-icon>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font);color:var(--text-primary)">${_commEsc(tip.title)}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">${_commEsc(tip.text)}</div>
          </div>
        </div>

        <!-- KPI / Hedef -->
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
          ${tip.kpis.map(k => `
            <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px;text-align:center">
              <div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:${k.color}">${k.value}</div>
              <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:4px">${k.label}</div>
            </div>
          `).join('')}
        </div>

        <!-- Hedef rozeti -->
        <div style="background:${tip.color}12;border:1px dashed ${tip.color};border-radius:var(--r-lg);padding:12px 14px;display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:target-linear" style="font-size:22px;color:${tip.color}"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Hedef</div>
            <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);margin-top:3px">${_commEsc(tip.target)}</div>
          </div>
          <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff;background:${tip.color};padding:6px 10px;border-radius:var(--r-full)">${_commEsc(tip.impact)}</span>
        </div>

        <!-- Adımlar -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:checklist-minimalistic-bold" style="font-size:18px;color:${tip.color}"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Uygulama Adımları</span>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
            ${tip.steps.map((st, idx) => `
              <div style="padding:14px;display:flex;gap:12px;align-items:flex-start;${idx < tip.steps.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : ''}">
                <div style="width:28px;height:28px;border-radius:50%;background:${tip.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:${tip.color}">${idx + 1}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px">
                    <iconify-icon icon="${st.icon}" style="font-size:16px;color:${tip.color}"></iconify-icon>
                    <span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${_commEsc(st.title)}</span>
                  </div>
                  <div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-muted);margin-top:4px">${_commEsc(st.desc)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Eyleme dönüştür -->
        <div style="background:var(--primary-soft);border:1px solid var(--primary);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px">
          <iconify-icon icon="solar:bolt-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Hemen uygulamaya geçin</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Bu önerileri 1 hafta uyguladığınızda puanınızdaki değişimi ölçebilirsiniz.</div>
          </div>
        </div>

        <div style="height:20px"></div>
      </div>
    </div>
  `;
  document.getElementById('bizPhone').appendChild(c);
}

/* ═══ KADEME DETAY SAYFASI ═══ */
function _commOpenTier(idx, rating) {
  const t = _COMM_TIERS[idx];
  if (!t) return;
  const active = rating >= t.from && rating <= t.to;
  const gap = rating < t.from ? (t.from - rating).toFixed(1) : null;

  const requirements = {
    0: ['Son 4 hafta 5.0 puan koruması', 'Hata oranı < %1', 'Yanıt oranı > %90', 'Hazırlık süresi < 15 dk'],
    1: ['4.8+ ortalama puan', 'Yanıt oranı > %80', 'Hata oranı < %2', 'Düzenli menü güncellemesi'],
    2: ['4.5+ ortalama puan', 'Yorumlara aktif dönüş', 'Standart paketleme', 'Pik saat planlaması'],
    3: ['4.0+ ortalama puan', 'Temel operasyonel disiplin', 'Güncel menü ve görseller'],
    4: ['3.5+ ortalama puan', 'Gelişim planı gerekli', 'İade/iptal takibi'],
    5: ['3.5 altı puan', 'Destek ekibiyle aksiyon planı', 'Yoğun gelişim önerileri']
  };
  const perks = {
    0: ['%5.5 komisyon', 'Aramalarda öne çıkan sıralama', 'Süper İşletme rozeti', 'Öncelikli destek'],
    1: ['%7 komisyon', '"Elit" işletme rozeti', 'Haftalık performans raporu'],
    2: ['%9 komisyon', 'Standart rozet', 'Kampanyalara öncelikli davet'],
    3: ['%11 komisyon', 'Standart görünürlük'],
    4: ['%13 komisyon', 'Gelişim programına uygunluk'],
    5: ['%15 komisyon', 'İyileştirme odaklı destek']
  };

  const c = document.createElement('div');
  c.id = 'commTierOverlay';
  c.className = 'prof-overlay open';
  c.style.zIndex = '85';
  c.innerHTML = `
    <div class="prof-container" style="background:var(--bg-phone-secondary)">
      <div class="prof-topbar" style="background:var(--bg-phone);border-bottom:1px solid var(--border-subtle)">
        <div onclick="document.getElementById('commTierOverlay').remove()" style="cursor:pointer;display:flex;align-items:center;gap:6px">
          <iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:22px;color:var(--text-primary)"></iconify-icon>
        </div>
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${_commEsc(t.label)} Kademesi</div>
        <div style="width:22px"></div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">

        <!-- Kademe Kartı -->
        <div style="background:linear-gradient(135deg, ${t.color}25, var(--bg-phone));border:1px solid ${t.color}66;border-radius:var(--r-xl);padding:20px;text-align:center;box-shadow:var(--shadow-md)">
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${t.from === t.to ? `${t.from.toFixed(1)} puan` : `${t.from.toFixed(1)} – ${t.to.toFixed(1)} puan aralığı`}</div>
          <div style="font:var(--fw-bold) 44px/1 var(--font);color:${t.color};margin-top:10px">%${t.rate}</div>
          <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:8px">${_commEsc(t.label)}</div>
          ${active ? `
            <div style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:${t.color};padding:6px 12px;border-radius:var(--r-full)">
              <iconify-icon icon="solar:verified-check-bold" style="font-size:14px;color:#fff"></iconify-icon>
              <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff">Şu anda buradasınız</span>
            </div>
          ` : gap ? `
            <div style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:${t.color}18;padding:6px 12px;border-radius:var(--r-full)">
              <iconify-icon icon="solar:graph-up-linear" style="font-size:14px;color:${t.color}"></iconify-icon>
              <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:${t.color}">+${gap} puan uzakta</span>
            </div>
          ` : `
            <div style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:var(--bg-btn);padding:6px 12px;border-radius:var(--r-full)">
              <iconify-icon icon="solar:arrow-down-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>
              <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Önceki kademe</span>
            </div>
          `}
        </div>

        <!-- Gereksinimler -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:clipboard-list-bold" style="font-size:18px;color:${t.color}"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Kriterler</span>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);overflow:hidden">
            ${(requirements[idx] || []).map((r, i, arr) => `
              <div style="padding:12px 14px;display:flex;align-items:center;gap:10px;${i < arr.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : ''}">
                <iconify-icon icon="solar:check-circle-linear" style="font-size:18px;color:${t.color};flex-shrink:0"></iconify-icon>
                <span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">${_commEsc(r)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Avantajlar -->
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <iconify-icon icon="solar:gift-bold" style="font-size:18px;color:${t.color}"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Bu Kademede Neler Var?</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${(perks[idx] || []).map(p => `
              <div style="background:var(--bg-phone);border:1px solid ${t.color}33;border-radius:var(--r-lg);padding:12px 14px;display:flex;align-items:center;gap:10px">
                <div style="width:26px;height:26px;border-radius:50%;background:${t.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <iconify-icon icon="solar:star-bold" style="font-size:14px;color:${t.color}"></iconify-icon>
                </div>
                <span style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">${_commEsc(p)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="height:20px"></div>
      </div>
    </div>
  `;
  document.getElementById('bizPhone').appendChild(c);
}

function _commStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += `<iconify-icon icon="solar:star-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>`;
    } else if (rating >= i - 0.5) {
      html += `<iconify-icon icon="solar:star-fall-2-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>`;
    } else {
      html += `<iconify-icon icon="solar:star-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>`;
    }
  }
  return html;
}

function _commToggleFaq(idx) {
  const body = document.getElementById('commFaqA_' + idx);
  const chev = document.querySelector('[data-chev="' + idx + '"]');
  if (!body) return;
  const open = body.style.maxHeight && body.style.maxHeight !== '0px';
  // Collapse all
  document.querySelectorAll('.comm-faq-a').forEach(el => { el.style.maxHeight = '0'; });
  document.querySelectorAll('.comm-faq-chev').forEach(el => { el.style.transform = 'rotate(0deg)'; });
  if (!open) {
    body.style.maxHeight = body.scrollHeight + 'px';
    if (chev) chev.style.transform = 'rotate(180deg)';
  }
}

function _commInjectStyles() {
  if (document.getElementById('commStyles')) return;
  const s = document.createElement('style');
  s.id = 'commStyles';
  s.textContent = `
    .comm-hero { animation: commFadeIn .35s ease; }
    @keyframes commFadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: none; } }
    .comm-faq-q:hover { background: var(--bg-phone-secondary); }
  `;
  document.head.appendChild(s);
}

/* Tiny HTML escape (local) */
function _commEsc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
