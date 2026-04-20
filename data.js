/**
 * ═══════════════════════════════════════
 *  APP DATA — Food Delivery App
 * ═══════════════════════════════════════
 *  Tüm içerik verileri burada.
 *  Yeni item eklemek = array'e obje eklemek.
 * ═══════════════════════════════════════
 */


/* ── Kayıtlı Adresler ── */
const USER_ADDRESSES = [
  { id: 'ev',  label: 'Evim',    address: 'Atatürk Mah. Cumhuriyet Cad.', icon: 'solar:home-smile-bold' },
  { id: 'is',  label: 'İşyerim', address: 'Levent Mah. Büyükdere Cad.',  icon: 'solar:case-round-bold' },
];
let SELECTED_ADDRESS_ID = 'ev';

/* ── Menu Items (Tarifler - Ana Sayfa) ── */
const menuItems = [
  {
    name: 'Truffle Burger',
    type: 'tarif', category: 'Burger',
    allergens: ['gluten', 'laktoz', 'yumurta'],
    price: 185, rating: '4.8', reviews: '234', bookmarks: '1.2K', prepTime: '15dk', cookTime: '25dk', difficulty: 'Orta',
    desc: 'Özel truffle sosumuzla hazırlanan premium burger. 200 gram dana eti, taze marul, domates, karamelize soğan ve aged cheddar peyniri ile brioche ekmeğinde servis edilir.',
    ing: [{name:'Dana Eti',amount:'200g'},{name:'Aged Cheddar',amount:'2 dilim'},{name:'Truffle Sos',amount:'2 yemek kaşığı'},{name:'Marul',amount:'3 yaprak'},{name:'Karamelize Soğan',amount:'1 adet'},{name:'Brioche Ekmeği',amount:'1 adet'}],
    tips: ['Eti pişirmeden önce buzdolabından çıkarıp 20 dakika oda sıcaklığında bekletin.','Karamelize soğanı kısık ateşte en az 15 dakika kavurun.','Cheddar peynirini eti tavadan almadan 1 dakika önce ekleyin.'],
    grad: 'radial-gradient(circle at 40% 35%,#3D3535,#1A1616)',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    nutrition: { kalori:340, protein:28, yag:18, karbonhidrat:22, lif:2, seker:4, demir:3.2, kalsiyum:150, cvitamini:6, avitamini:120, sodyum:480 },
    author: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', followers: '12.4K', recipes: 86, following: false },
    servings: 2,
    steps: [
      { title:'Malzemeleri Hazırla', desc:'Dana etini buzdolabından çıkarıp 20 dakika oda sıcaklığında bekletin. Marul yapraklarını yıkayıp kurulayın. Domatesi halka şeklinde dilimleyin.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Soğanı Karamelize Et', desc:'Soğanı ince halka şeklinde doğrayın. Tavada tereyağı eritin ve kısık ateşte 15 dakika boyunca altın rengi olana kadar kavurun.', duration:'15dk', icon:'solar:fire-linear' },
      { title:'Köfteyi Pişir', desc:'Eti tuz ve karabiberle tatlandırın. Kızgın ızgarada her iki tarafı 4-5 dakika pişirin. Son 1 dakikada üzerine cheddar peyniri koyun.', duration:'10dk', icon:'solar:fire-linear' },
      { title:'Truffle Sosu Hazırla', desc:'Truffle sosunu küçük bir kapta oda sıcaklığına getirin. İsterseniz bir miktar mayonez ile karıştırarak kremamsı bir kıvam elde edin.', duration:'2dk', icon:'solar:cup-hot-linear' },
      { title:'Burgeri Birleştir', desc:'Brioche ekmeğini ızgarada hafifçe kızartın. Alt ekmeğe marul, domates, köfte, karamelize soğan ve truffle sosu ekleyin. Üst ekmeği kapatın.', duration:'3dk', icon:'solar:hand-stars-linear' },
      { title:'Servis Et', desc:'Burgeri ortadan kesin ve tabağa yerleştirin. Yanında patates kızartması veya coleslaw ile servis edin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Adana Kebap',
    type: 'tarif', category: 'Kebap',
    price: 220, rating: '4.9', reviews: '312', bookmarks: '2.1K', prepTime: '20dk', cookTime: '35dk', difficulty: 'Zor',
    desc: 'El yapımı acılı Adana kebap. Közlenmiş biber, domates ve taze lavaş eşliğinde sunulur.',
    ing: [{name:'Dana Kıyma',amount:'500g'},{name:'Acı Biber',amount:'2 adet'},{name:'Kuyruk Yağı',amount:'100g'},{name:'Lavaş',amount:'4 adet'},{name:'Soğan',amount:'1 adet'},{name:'Sumak',amount:'1 yemek kaşığı'}],
    tips: ['Kıymayı en az 10 kez yoğurun.','Şişe geçirmeden önce elinizi suyla ıslatın.','Közü çok yakın tutmayın, orta ateşte pişirin.'],
    grad: 'radial-gradient(circle at 35% 30%,#3A2E2E,#161212)',
    img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop',
    nutrition: { kalori:138, protein:12, yag:8, karbonhidrat:6, lif:1, seker:1, demir:2.4, kalsiyum:20, cvitamini:12, avitamini:45, sodyum:290 },
    author: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '23.1K', recipes: 134, following: false },
    servings: 4,
    steps: [
      { title:'Kıymayı Yoğur', desc:'Dana kıymayı geniş bir kaba alın. Acı biber, tuz, sumak ve pul biber ekleyin. En az 10 kez yoğurun. Kıyma yapışkan bir kıvam almalı.', duration:'10dk', icon:'solar:hand-stars-linear' },
      { title:'Kuyruk Yağını Hazırla', desc:'Kuyruk yağını küçük küpler halinde doğrayın. Kıymaya ekleyip iyice yoğurun. Yağ kıymayla tam bütünleşmeli.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Şişe Geçir', desc:'Elinizi suyla ıslatın. Kıymadan avuç içi büyüklüğünde parçalar koparıp şişe bastırarak geçirin. Parmak kalınlığında olmalı.', duration:'10dk', icon:'solar:fire-linear' },
      { title:'Közde Pişir', desc:'Közü iyice kızdırın ama çok yakın tutmayın. Orta ateşte her tarafı eşit pişene kadar çevirin. Toplam 15-20 dakika.', duration:'20dk', icon:'solar:fire-linear' },
      { title:'Lavaşı Hazırla', desc:'Lavaşları ızgarada hafifçe ısıtın. Közlenmiş biber ve domatesi de ızgaraya koyun.', duration:'5dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Lavaş üzerine kebapları dizin. Yanına közlenmiş biber, domates, soğan ve sumak ekleyin. Afiyet olsun!', duration:'3dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Margherita Pizza',
    type: 'tarif', category: 'Pizza',
    allergens: ['gluten', 'laktoz'],
    price: 165, rating: '4.7', reviews: '431', bookmarks: '1.5K', prepTime: '30dk', cookTime: '20dk', difficulty: 'Orta',
    desc: 'Taze mozzarella, domates sosu ve fesleğen ile klasik İtalyan pizzası.',
    ing: [{name:'Pizza Hamuru',amount:'300g'},{name:'Mozzarella',amount:'200g'},{name:'Domates Sosu',amount:'100g'},{name:'Fesleğen',amount:'5 yaprak'}],
    tips: ['Fırını en yüksek derecede ısıtın.','Hamuru çok ince açmayın.'],
    grad: 'radial-gradient(circle at 40% 35%,#4A3A2A,#1A1210)',
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
    nutrition: { kalori:280, protein:14, yag:12, karbonhidrat:32, lif:2, seker:4, demir:1.8, kalsiyum:220, cvitamini:8, avitamini:60, sodyum:520 },
    author: { name: 'Şef Isabella', avatar: 'https://i.pravatar.cc/80?img=5', followers: '8.7K', recipes: 52, following: false },
    servings: 2,
    steps: [
      { title:'Hamuru Hazırla', desc:'Pizza hamurunu oda sıcaklığında 30 dakika dinlendirin. Unlayarak yuvarlak şekilde açın. Çok ince olmasın.', duration:'10dk', icon:'solar:hand-stars-linear' },
      { title:'Sosu Sür', desc:'Domates sosunu hamur üzerine eşit şekilde yayın. Kenarlardan 1-2 cm boşluk bırakın.', duration:'3dk', icon:'solar:cup-hot-linear' },
      { title:'Mozzarella Ekle', desc:'Taze mozzarellayı elle parçalayarak hamur üzerine dağıtın. Eşit dağılım önemli.', duration:'3dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Fırınla', desc:'Fırını en yüksek derecede (250°C) önceden ısıtın. Pizzayı 8-10 dakika, peynir eriyip kenarlar kızarana kadar pişirin.', duration:'12dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Fırından çıkarın, taze fesleğen yaprakları ekleyin. Zeytinyağı gezirin. Dilimleyip sıcak servis edin.', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Tiramisu',
    type: 'tarif', category: 'Tatlı',
    price: 95, rating: '4.7', reviews: '203', bookmarks: '1.8K', prepTime: '20dk', cookTime: '15dk', difficulty: 'Kolay',
    desc: 'Klasik İtalyan tiramisu. Mascarpone krem, espresso ve kakaolu ladyfinger bisküvi katmanları.',
    ing: [{name:'Mascarpone',amount:'500g'},{name:'Espresso',amount:'200ml'},{name:'Ladyfinger',amount:'24 adet'},{name:'Kakao',amount:'2 yemek kaşığı'}],
    tips: ['Bisküvileri kahveye çok batırmayın.','En az 4 saat buzdolabında bekletin.'],
    grad: 'radial-gradient(circle at 40% 35%,#3D3020,#1A1410)',
    img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
    nutrition: { kalori:320, protein:8, yag:18, karbonhidrat:34, lif:0, seker:22, demir:1.2, kalsiyum:80, cvitamini:0, avitamini:120, sodyum:150 },
    author: { name: 'Şef Isabella', avatar: 'https://i.pravatar.cc/80?img=5', followers: '8.7K', recipes: 52, following: false },
    servings: 6,
    steps: [
      { title:'Espresso Hazırla', desc:'Güçlü bir espresso demleyin ve tamamen soğumasını bekleyin. Yaklaşık 200ml olmalı.', duration:'5dk', icon:'solar:cup-hot-linear' },
      { title:'Krema Karışımı', desc:'Mascarpone peyniri, şeker ve yumurta sarısını geniş bir kapta çırpın. Pürüzsüz ve kremamsı olana kadar karıştırın.', duration:'8dk', icon:'solar:hand-stars-linear' },
      { title:'Bisküvileri Islatır', desc:'Ladyfinger bisküvileri soğuk espressoya hızlıca batırın. Çok bekletmeyin, sadece dış yüzeyi ıslansın.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Katmanla', desc:'Bir kaba ıslatılmış bisküvileri dizin. Üzerine mascarpone kremayı yayın. İşlemi tekrarlayarak 2-3 kat oluşturun.', duration:'5dk', icon:'solar:layers-linear' },
      { title:'Buzdolabında Dinlendir', desc:'Kabı streç filmle kapatın. En az 4 saat, tercihen bir gece buzdolabında dinlendirin.', duration:'4sa', icon:'solar:fridge-linear' },
      { title:'Servis Et', desc:'Üzerine bol kakao tozu eleyin. Dilimleyip soğuk servis edin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Caesar Salata',
    type: 'tarif', category: 'Salata',
    price: 110, rating: '4.5', reviews: '156', bookmarks: '934', prepTime: '10dk', cookTime: '10dk', difficulty: 'Kolay',
    desc: 'Avokadolu caesar salata, parmesan cipsi ve ev yapımı sos ile.',
    ing: [{name:'Marul',amount:'1 baş'},{name:'Parmesan',amount:'50g'},{name:'Kruton',amount:'1 avuç'},{name:'Avokado',amount:'1 adet'}],
    tips: ['Sosu servis öncesi ekleyin.','Parmesan cipsini fırında yapın.'],
    grad: 'radial-gradient(circle at 40% 35%,#2A3A2A,#101A10)',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    nutrition: { kalori:220, protein:12, yag:14, karbonhidrat:14, lif:4, seker:3, demir:1.5, kalsiyum:180, cvitamini:18, avitamini:200, sodyum:380 },
    author: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=9', followers: '5.3K', recipes: 78, following: false },
    servings: 2,
    steps: [
      { title:'Malzemeleri Yıka', desc:'Marul yapraklarını soğuk suda iyice yıkayın ve kurulayın. Avokadoyu ikiye bölüp çekirdeğini çıkarın.', duration:'3dk', icon:'solar:hand-stars-linear' },
      { title:'Krutonları Hazırla', desc:'Ekmeği küp şeklinde kesin. Zeytinyağında kızartın veya fırında altın rengi olana kadar pişirin.', duration:'5dk', icon:'solar:fire-linear' },
      { title:'Sosu Karıştır', desc:'Caesar sosu, limon suyu, sarımsak ve zeytinyağını karıştırın. Parmesan rendeleyin ve sosun içine ekleyin.', duration:'3dk', icon:'solar:cup-hot-linear' },
      { title:'Salatayı Birleştir', desc:'Marul, avokado dilimleri, kruton ve parmesan cipsini geniş bir tabağa yerleştirin. Sosu üzerine gezdirin.', duration:'3dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Servis Et', desc:'Parmesan cipsi ile süsleyip hemen servis edin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Çikolatalı Sufle',
    type: 'tarif', category: 'Tatlı',
    price: 85, rating: '4.8', reviews: '278', bookmarks: '1.8K', prepTime: '15dk', cookTime: '20dk', difficulty: 'Orta',
    desc: 'İçi akışkan çikolatalı sufle, vanilya dondurma eşliğinde.',
    ing: [{name:'Bitter Çikolata',amount:'200g'},{name:'Tereyağı',amount:'100g'},{name:'Yumurta',amount:'3 adet'},{name:'Şeker',amount:'80g'}],
    tips: ['Fırından çıkar çıkmaz servis edin.','Kalıpları iyice yağlayın.'],
    grad: 'radial-gradient(circle at 40% 35%,#2A1A1A,#100808)',
    img: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&h=400&fit=crop',
    nutrition: { kalori:380, protein:8, yag:24, karbonhidrat:36, lif:2, seker:28, demir:3.0, kalsiyum:40, cvitamini:0, avitamini:80, sodyum:120 },
    author: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', followers: '12.4K', recipes: 86, following: false },
    servings: 2,
    steps: [
      { title:'Çikolatayı Erit', desc:'Bitter çikolatayı tereyağı ile benmari usulü eritin. Karışımı pürüzsüz olana kadar karıştırın ve ılımaya bırakın.', duration:'5dk', icon:'solar:fire-linear' },
      { title:'Yumurtaları Çırp', desc:'Yumurtaları şekerle beyazlayana ve kabarıncaya kadar mikserle çırpın. Hacmi 2-3 kat artmalı.', duration:'5dk', icon:'solar:hand-stars-linear' },
      { title:'Karışımları Birleştir', desc:'Erimiş çikolata karışımını yumurtalı karışıma spatula ile yavaşça katlayarak ekleyin. Hava kaçırmayin.', duration:'3dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Kalıplara Dök', desc:'Kalıpları tereyağı ve kakao tozu ile iyice yağlayın. Karışımı kalıplara eşit miktarda paylaştırın.', duration:'3dk', icon:'solar:layers-linear' },
      { title:'Fırınla', desc:'Önceden ısıtılmış 200°C fırında 12-14 dakika pişirin. Kenarlar pişmiş ama orta kısım hafif sallanıyor olmalı.', duration:'14dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Fırından çıkar çıkmaz hemen servis edin. Üzerine pudra şekeri serpin, yanına vanilya dondurma ekleyin.', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Mercimek Çorbası',
    type: 'tarif', category: 'Çorba',
    price: 55, rating: '4.7', reviews: '367', bookmarks: '987', prepTime: '10dk', cookTime: '20dk', difficulty: 'Kolay',
    desc: 'Geleneksel mercimek çorbası, kruton ve limon eşliğinde.',
    ing: [{name:'Kırmızı Mercimek',amount:'250g'},{name:'Soğan',amount:'1 adet'},{name:'Havuç',amount:'1 adet'},{name:'Patates',amount:'1 adet'}],
    tips: ['Blenderdan geçirdikten sonra kıvamını ayarlayın.','Üzerine kırmızı biber yağı ekleyin.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A3020,#1A1810)',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
    nutrition: { kalori:180, protein:12, yag:4, karbonhidrat:28, lif:8, seker:4, demir:3.8, kalsiyum:30, cvitamini:6, avitamini:320, sodyum:420 },
    author: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=9', followers: '5.3K', recipes: 78, following: false },
    servings: 4,
    steps: [
      { title:'Mercimeği Yıka', desc:'Kırmızı mercimeği bol su ile yıkayın. Suyu süzün ve kenara alın.', duration:'3dk', icon:'solar:hand-stars-linear' },
      { title:'Sebzeleri Doğra', desc:'Soğanı, havucu ve patatesi küçük küpler halinde doğrayın.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Kavur', desc:'Tencerede zeytinyağını ısıtın. Soğanı pembeleşene kadar kavurun. Havuç ve patatesi ekleyip 2-3 dakika daha kavurun.', duration:'5dk', icon:'solar:fire-linear' },
      { title:'Kaynat', desc:'Mercimeği ve sıcak suyu ekleyin. Kaynamaya başlayınca kısık ateşe alın. Tüm malzemeler yumuşayana kadar 15-20 dakika pişirin.', duration:'20dk', icon:'solar:fire-linear' },
      { title:'Blenderla Çek', desc:'Tencerenin altını kapatın. El blenderı ile pürüzsüz olana kadar çekin. Kıvamını su ekleyerek ayarlayın.', duration:'3dk', icon:'solar:cup-hot-linear' },
      { title:'Servis Et', desc:'Üzerine kırmızı biber yağı, limon ve kruton ekleyerek sıcak servis edin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Izgara Somon',
    type: 'tarif', category: 'Salata',
    price: 195, rating: '4.6', reviews: '187', bookmarks: '856', prepTime: '10dk', cookTime: '30dk', difficulty: 'Kolay',
    desc: 'Tereyağlı ızgara Norveç somonu, yeşillik yatağı üzerinde.',
    ing: [{name:'Somon Fileto',amount:'200g'},{name:'Tereyağı',amount:'30g'},{name:'Limon',amount:'1 adet'},{name:'Dereotu',amount:'bir tutam'}],
    tips: ['Somonu oda sıcaklığına getirin.','Derisini çıtır olana kadar pişirin.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A2525,#1A1010)',
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop',
    nutrition: { kalori:290, protein:34, yag:16, karbonhidrat:2, lif:0, seker:0, demir:1.2, kalsiyum:20, cvitamini:4, avitamini:80, sodyum:320 },
    author: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', followers: '12.4K', recipes: 86, following: false },
    servings: 2,
    steps: [
      { title:'Somonu Hazırla', desc:'Somon filetosunu buzdolabından çıkarıp oda sıcaklığına getirin. Kağıt havlu ile kurulatın.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Marine Et', desc:'Somonu zeytinyağı, limon suyu, tuz ve karabiberle marine edin. 10 dakika bekletin.', duration:'10dk', icon:'solar:hand-stars-linear' },
      { title:'Tavayı Isıt', desc:'Dökme demir tavayı yüksek ateşte ısıtın. Tereyağını ekleyin ve köpürmeye başlayana kadar bekleyin.', duration:'3dk', icon:'solar:fire-linear' },
      { title:'Pişir', desc:'Somonu deri tarafı alta gelecek şekilde tavaya koyun. 4-5 dakika çıtır olana kadar pişirin. Çevirin ve 3 dakika daha pişirin.', duration:'8dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Yeşillik yatağı üzerine yerleştirin. Dereotu ve limon dilimleri ile süsleyin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Lahmacun',
    type: 'tarif', category: 'Kebap',
    price: 65, rating: '4.7', reviews: '356', bookmarks: '1.9K', prepTime: '20dk', cookTime: '12dk', difficulty: 'Orta',
    desc: 'İnce hamur üzerine kıymalı harç, taze maydanoz ve limon ile.',
    ing: [{name:'Kıyma',amount:'300g'},{name:'Hamur',amount:'4 adet'},{name:'Domates',amount:'2 adet'},{name:'Biber',amount:'2 adet'}],
    tips: ['Hamuru çok ince açın.','Fırını en yüksek derecede pişirin.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A2E20,#1A1610)',
    img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop',
    nutrition: { kalori:210, protein:14, yag:8, karbonhidrat:22, lif:2, seker:3, demir:2.8, kalsiyum:30, cvitamini:14, avitamini:60, sodyum:380 },
    author: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '23.1K', recipes: 134, following: false },
    servings: 2,
    steps: [
      { title:'Harcı Hazırla', desc:'Kıyma, ince doğranmış domates, biber, soğan, maydanoz, tuz ve pul biberi yoğurarak karıştırın.', duration:'10dk', icon:'solar:hand-stars-linear' },
      { title:'Hamuru Aç', desc:'Hamuru çok ince yuvarlak şekilde açın. Ne kadar ince olursa o kadar çıtır olur.', duration:'10dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Harcı Sür', desc:'Hazırladığınız harcı hamur üzerine ince bir tabaka halinde yayın. Kenarlara kadar sürün.', duration:'5dk', icon:'solar:layers-linear' },
      { title:'Fırınla', desc:'Fırını en yüksek derecede (280-300°C) ısıtın. Lahmacunu 3-4 dakika, kenarlar kızarana kadar pişirin.', duration:'4dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Taze maydanoz, limon suyu sıkarak rulo yapın. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Künefe',
    type: 'tarif', category: 'Tatlı',
    price: 120, rating: '4.9', reviews: '298', bookmarks: '1.8K', prepTime: '15dk', cookTime: '18dk', difficulty: 'Zor',
    desc: 'Antep fıstıklı künefe, kaymak ile servis edilir.',
    ing: [{name:'Kadayıf',amount:'250g'},{name:'Peynir',amount:'200g'},{name:'Tereyağı',amount:'100g'},{name:'Şerbet',amount:'200ml'}],
    tips: ['Kadayıfı ince kıyın.','Şerbeti soğuk dökün.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A3020,#1A1810)',
    img: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=400&fit=crop',
    nutrition: { kalori:420, protein:10, yag:22, karbonhidrat:48, lif:1, seker:32, demir:1.0, kalsiyum:120, cvitamini:0, avitamini:60, sodyum:280 },
    author: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '23.1K', recipes: 134, following: false },
    servings: 4,
    steps: [
      { title:'Kadayıfı Hazırla', desc:'Tel kadayıfı ince kıyın. Eritilmiş tereyağının yarısını ekleyip iyice karıştırın.', duration:'5dk', icon:'solar:hand-stars-linear' },
      { title:'Peyniri Hazırla', desc:'Künefe peynirini tuzunu almak için suda bekletin. Süzüp rendeleyın.', duration:'10dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Katmanla', desc:'Künefe tepsisinin altına kadayıfın yarısını yayın, üzerine peyniri dağıtın, kalan kadayıfı üzerine kapatın.', duration:'5dk', icon:'solar:layers-linear' },
      { title:'Pişir', desc:'Kalan tereyağını üzerine dökün. Orta ateşte altı kızarana kadar pişirin, ters çevirip diğer tarafı da kızartın.', duration:'15dk', icon:'solar:fire-linear' },
      { title:'Şerbeti Hazırla', desc:'Şeker ve suyu kaynatıp limon suyu ekleyin. Şerbeti soğumaya bırakın.', duration:'5dk', icon:'solar:cup-hot-linear' },
      { title:'Servis Et', desc:'Sıcak künefenin üzerine soğuk şerbeti dökün. Antep fıstığı serpin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Falafel Wrap',
    type: 'tarif', category: 'Burger',
    price: 95, rating: '4.4', reviews: '98', bookmarks: '567', prepTime: '15dk', cookTime: '15dk', difficulty: 'Kolay',
    desc: 'Nohutlu falafel wrap, humus ve tahin sos ile.',
    ing: [{name:'Nohut',amount:'300g'},{name:'Maydanoz',amount:'1 demet'},{name:'Lavaş',amount:'2 adet'},{name:'Humus',amount:'100g'}],
    tips: ['Nohutları bir gece önceden ıslatın.','Kızgın yağda pişirin.'],
    grad: 'radial-gradient(circle at 40% 35%,#2A3520,#101A08)',
    img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop',
    nutrition: { kalori:260, protein:12, yag:10, karbonhidrat:34, lif:6, seker:2, demir:3.4, kalsiyum:60, cvitamini:10, avitamini:40, sodyum:420 },
    author: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=9', followers: '5.3K', recipes: 78, following: false },
    servings: 2,
    steps: [
      { title:'Nohutları Hazırla', desc:'Bir gece önceden ıslatılmış nohutları süzün. Kağıt havlu ile iyice kurulayın.', duration:'5dk', icon:'solar:hand-stars-linear' },
      { title:'Falafel Hamuru', desc:'Nohut, maydanoz, soğan, sarımsak, kimyon ve tuz ile robottan geçirin. Toparlanan bir hamur elde edin.', duration:'5dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Şekil Ver', desc:'Hamurdan ceviz büyüklüğünde parçalar koparıp yuvarlak toplar yapın. Hafifçe bastırarak yassılaştırın.', duration:'5dk', icon:'solar:hand-stars-linear' },
      { title:'Kızart', desc:'Derin bir tavada yağı 180°C\u2019ye ısıtın. Falafelleri altın rengi olana kadar 3-4 dakika kızartın.', duration:'8dk', icon:'solar:fire-linear' },
      { title:'Wrapı Hazırla', desc:'Lavaşa humus sürün. Falafel, domates, marul ve tahin sos ekleyip sarın.', duration:'3dk', icon:'solar:layers-linear' },
      { title:'Servis Et', desc:'Wrapı ortadan kesin. Yanında turşu ve tahin sos ile servis edin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
  {
    name: 'Menemen',
    type: 'tarif', category: 'Çorba',
    price: 60, rating: '4.5', reviews: '234', bookmarks: '1.1K', prepTime: '5dk', cookTime: '15dk', difficulty: 'Kolay',
    desc: 'Geleneksel Türk menemen, taze ekmek eşliğinde.',
    ing: [{name:'Yumurta',amount:'3 adet'},{name:'Domates',amount:'2 adet'},{name:'Biber',amount:'2 adet'},{name:'Tereyağı',amount:'20g'}],
    tips: ['Yumurtaları en son ekleyin.','Çok karıştırmayın.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A2A1A,#1A1208)',
    img: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=400&h=400&fit=crop',
    nutrition: { kalori:190, protein:12, yag:12, karbonhidrat:8, lif:2, seker:4, demir:2.0, kalsiyum:60, cvitamini:40, avitamini:180, sodyum:320 },
    author: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=9', followers: '5.3K', recipes: 78, following: false },
    servings: 2,
    steps: [
      { title:'Sebzeleri Doğra', desc:'Domatesleri küp küp, biberleri ince ince doğrayın. İsterseniz soğan da ekleyebilirsiniz.', duration:'3dk', icon:'solar:chef-hat-heart-linear' },
      { title:'Kavur', desc:'Tavada tereyağını eritin. Biberleri ekleyip 2-3 dakika kavurun. Domatesleri ekleyip suyunu salana kadar pişirin.', duration:'5dk', icon:'solar:fire-linear' },
      { title:'Yumurtaları Ekle', desc:'Yumurtaları kırıp tavaya ekleyin. Çok fazla karıştırmayın, hafifçe katlayın. Tuz ve pul biber serpin.', duration:'3dk', icon:'solar:hand-stars-linear' },
      { title:'Pişir', desc:'Kısık ateşte yumurtalar pişene kadar bekleyin. Akışkan kıvamda bırakmak en ideali.', duration:'3dk', icon:'solar:fire-linear' },
      { title:'Servis Et', desc:'Taze ekmek ile sıcak sıcak servis edin. Üzerine pul biber ve kekik serpin. Afiyet olsun!', duration:'2dk', icon:'solar:cup-star-linear' },
    ],
  },
];


/* ── Restaurant Items (Restoranlar - Ana Sayfa) ── */
const restaurantItems = [
  {
    name: 'Klasik Cheeseburger', type: 'restoran', category: 'Burger',
    allergens: ['gluten', 'laktoz', 'susam'],
    price: 145, rating: '4.6', reviews: '1.2K', bookmarks: '3.4K', prepTime: '5dk', cookTime: '12dk', difficulty: 'Kolay',
    desc: 'Nefis ızgara köfte, cheddar peyniri, taze marul, domates, turşu ve özel burger sosu ile servis edilir.',
    ing: [{name:'Dana Köfte',amount:'150g'},{name:'Cheddar Peyniri',amount:'1 dilim'},{name:'Marul',amount:'2 yaprak'},{name:'Domates',amount:'2 dilim'}],
    tips: ['Sosunuzu ekstra isteyebilirsiniz.','Yanında patates kızartması gelir.'],
    grad: 'radial-gradient(circle at 40% 35%,#3D3535,#1A1616)',
    img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=400&fit=crop',
    nutrition: { kalori:520, protein:32, yag:28, karbonhidrat:38, lif:2, seker:6, demir:4.1, kalsiyum:180, cvitamini:4, avitamini:90, sodyum:720 },
    author: { name: 'Burger Lab', avatar: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&h=80&fit=crop', followers: '45.2K', recipes: 24, following: false },
    servings: 1,
    restaurant: { name: 'Burger Lab', address: 'Kadıköy, İstanbul', deliveryTime: '25-35dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.7' },
    sponsored: true,
  },
  {
    name: 'Iskender Kebap', type: 'restoran', category: 'Kebap',
    price: 245, rating: '4.9', reviews: '3.1K', bookmarks: '6.2K', prepTime: '10dk', cookTime: '25dk', difficulty: 'Orta',
    desc: 'İnce doğranmış döner eti, tereyağı, domates sosu ve yoğurt ile pide üzerinde servis edilir.',
    ing: [{name:'Döner Eti',amount:'200g'},{name:'Pide',amount:'1 adet'},{name:'Tereyağı',amount:'30g'},{name:'Domates Sosu',amount:'3 yemek kaşığı'},{name:'Yoğurt',amount:'100g'}],
    tips: ['Tereyağı sıcak servis edilir.','Yanında közlenmiş biber gelir.'],
    grad: 'radial-gradient(circle at 35% 30%,#3A2E2E,#161212)',
    img: 'https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=400&h=400&fit=crop',
    nutrition: { kalori:580, protein:36, yag:30, karbonhidrat:42, lif:2, seker:5, demir:3.5, kalsiyum:120, cvitamini:8, avitamini:95, sodyum:650 },
    author: { name: 'Kebapçı Hacı', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '52.3K', recipes: 32, following: false },
    servings: 1,
    restaurant: { name: 'Kebapçı Hacı', address: 'Fatih, İstanbul', deliveryTime: '20-30dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.9' },
    sponsored: true,
  },
  {
    name: 'Pepperoni Pizza', type: 'restoran', category: 'Pizza',
    price: 175, rating: '4.5', reviews: '890', bookmarks: '2.1K', prepTime: '10dk', cookTime: '18dk', difficulty: 'Kolay',
    desc: 'Bol mozzarella ve pepperoni dilimli pizza, ince hamur.',
    ing: [{name:'Pizza Hamuru',amount:'1 adet'},{name:'Mozzarella',amount:'200g'},{name:'Pepperoni',amount:'100g'},{name:'Domates Sosu',amount:'80g'}],
    tips: ['Ekstra peynir isteyebilirsiniz.'],
    grad: 'radial-gradient(circle at 40% 35%,#4A3020,#1A1208)',
    img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    nutrition: { kalori:450, protein:22, yag:20, karbonhidrat:44, lif:2, seker:5, demir:2.5, kalsiyum:250, cvitamini:4, avitamini:80, sodyum:680 },
    author: { name: 'Pizza House', avatar: 'https://i.pravatar.cc/80?img=60', followers: '32.1K', recipes: 18, following: false },
    servings: 1,
    restaurant: { name: 'Pizza House', address: 'Beşiktaş, İstanbul', deliveryTime: '30-40dk', deliveryFee: '15₺', minOrder: 80, rating: '4.5' },
    sponsored: true,
  },
  {
    name: 'Karışık Izgara', type: 'restoran', category: 'Kebap',
    price: 320, rating: '4.8', reviews: '2.3K', bookmarks: '4.5K', prepTime: '15dk', cookTime: '40dk', difficulty: 'Zor',
    desc: 'Adana, beyti, pirzola ve tavuk kanat. Közlenmiş sebzeler ile.',
    ing: [{name:'Adana Kebap',amount:'150g'},{name:'Beyti',amount:'150g'},{name:'Pirzola',amount:'2 adet'},{name:'Tavuk Kanat',amount:'4 adet'}],
    tips: ['Taze pide ile servis edilir.'],
    grad: 'radial-gradient(circle at 35% 30%,#3A2E20,#161210)',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    nutrition: { kalori:680, protein:52, yag:38, karbonhidrat:28, lif:3, seker:4, demir:5.2, kalsiyum:60, cvitamini:12, avitamini:100, sodyum:820 },
    author: { name: 'Kebapçı Hacı', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '52.3K', recipes: 32, following: false },
    servings: 2,
    restaurant: { name: 'Kebapçı Hacı', address: 'Fatih, İstanbul', deliveryTime: '25-35dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.9' },
  },
  {
    name: 'Tavuk Dürüm', type: 'restoran', category: 'Kebap',
    price: 135, rating: '4.4', reviews: '780', bookmarks: '1.8K', prepTime: '5dk', cookTime: '15dk', difficulty: 'Kolay',
    desc: 'Izgara tavuk dürüm, taze sebzeler ve özel sos ile.',
    ing: [{name:'Tavuk Göğsü',amount:'200g'},{name:'Lavaş',amount:'1 adet'},{name:'Domates',amount:'2 dilim'},{name:'Marul',amount:'3 yaprak'}],
    tips: ['Acılı sos tercih edebilirsiniz.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A3020,#1A1608)',
    img: 'https://images.unsplash.com/photo-1613769049987-b31b641f25b1?w=400&h=400&fit=crop',
    nutrition: { kalori:380, protein:28, yag:14, karbonhidrat:36, lif:2, seker:3, demir:2.0, kalsiyum:40, cvitamini:8, avitamini:60, sodyum:520 },
    author: { name: 'Lezzet Durağı', avatar: 'https://i.pravatar.cc/80?img=12', followers: '18.5K', recipes: 42, following: false },
    servings: 1,
    restaurant: { name: 'Lezzet Durağı', address: 'Şişli, İstanbul', deliveryTime: '15-25dk', deliveryFee: '10₺', minOrder: 60, rating: '4.4' },
  },
  {
    name: 'Double Smash Burger', type: 'restoran', category: 'Burger',
    price: 185, rating: '4.7', reviews: '1.5K', bookmarks: '3.8K', prepTime: '5dk', cookTime: '10dk', difficulty: 'Kolay',
    desc: 'Çift katlı smash burger, özel sos ve karamelize soğan ile.',
    ing: [{name:'Dana Köfte',amount:'2x100g'},{name:'Cheddar',amount:'2 dilim'},{name:'Karamelize Soğan',amount:'50g'},{name:'Özel Sos',amount:'30g'}],
    tips: ['Patates kızartması dahildir.'],
    grad: 'radial-gradient(circle at 40% 35%,#3D3535,#1A1616)',
    img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop',
    nutrition: { kalori:620, protein:38, yag:36, karbonhidrat:40, lif:2, seker:8, demir:5.0, kalsiyum:200, cvitamini:2, avitamini:80, sodyum:860 },
    author: { name: 'Burger Lab', avatar: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&h=80&fit=crop', followers: '45.2K', recipes: 24, following: false },
    servings: 1,
    restaurant: { name: 'Burger Lab', address: 'Kadıköy, İstanbul', deliveryTime: '25-35dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.7' },
  },
  {
    name: 'Karışık Pizza', type: 'restoran', category: 'Pizza',
    price: 195, rating: '4.6', reviews: '650', bookmarks: '1.4K', prepTime: '10dk', cookTime: '20dk', difficulty: 'Kolay',
    desc: 'Sucuk, mantar, biber, mısır ve bol mozzarella.',
    ing: [{name:'Pizza Hamuru',amount:'1 adet'},{name:'Sucuk',amount:'80g'},{name:'Mantar',amount:'50g'},{name:'Mozzarella',amount:'200g'}],
    tips: ['Kalın ya da ince hamur seçebilirsiniz.'],
    grad: 'radial-gradient(circle at 40% 35%,#4A3020,#1A1208)',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    nutrition: { kalori:480, protein:24, yag:22, karbonhidrat:46, lif:3, seker:5, demir:2.8, kalsiyum:280, cvitamini:6, avitamini:90, sodyum:720 },
    author: { name: 'Pizza House', avatar: 'https://i.pravatar.cc/80?img=60', followers: '32.1K', recipes: 18, following: false },
    servings: 1,
    restaurant: { name: 'Pizza House', address: 'Beşiktaş, İstanbul', deliveryTime: '30-40dk', deliveryFee: '15₺', minOrder: 80, rating: '4.5' },
  },
  {
    name: 'Cheesecake', type: 'restoran', category: 'Tatlı',
    price: 95, rating: '4.8', reviews: '420', bookmarks: '2.2K', prepTime: '5dk', cookTime: '5dk', difficulty: 'Kolay',
    desc: 'New York usulü frambuazlı cheesecake.',
    ing: [{name:'Cheesecake',amount:'1 dilim'},{name:'Frambuaz Sos',amount:'30g'}],
    tips: ['Soğuk servis edilir.'],
    grad: 'radial-gradient(circle at 40% 35%,#3A2A2A,#1A1010)',
    img: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&h=400&fit=crop',
    nutrition: { kalori:340, protein:6, yag:20, karbonhidrat:36, lif:1, seker:26, demir:0.8, kalsiyum:60, cvitamini:4, avitamini:120, sodyum:220 },
    author: { name: 'Deniz Cafe', avatar: 'https://i.pravatar.cc/80?img=15', followers: '14.2K', recipes: 35, following: false },
    servings: 1,
    restaurant: { name: 'Deniz Cafe', address: 'Bebek, İstanbul', deliveryTime: '20-30dk', deliveryFee: '20₺', minOrder: 75, rating: '4.6' },
  },
];

/* ── Keşfet Items (Pinterest Masonry) ── */
const kesfetItems = [
  { name: 'Truffle Burger Karamelize Soğan & Aged Cheddar', bookmarks: '1.2K', rating: '4.8', reviews: '324', cookTime: '25dk', prepTime: '15dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop' },
  { name: 'Tereyağlı Izgara Norveç Somonu',               bookmarks: '856',  rating: '4.6', reviews: '187', cookTime: '30dk', prepTime: '10dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&fit=crop' },
  { name: 'Adana Kebap',                                   bookmarks: '2.1K', rating: '4.9', reviews: '512', cookTime: '35dk', prepTime: '20dk', difficulty: 'Zor',   img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&fit=crop' },
  { name: 'Klasik Cheeseburger', type: 'restoran', price: 145, bookmarks: '3.4K', rating: '4.6', reviews: '1.2K', cookTime: '12dk', prepTime: '5dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&fit=crop', restaurant: { name: 'Burger Lab', deliveryTime: '25-35dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.7' } },
  { name: 'Tiramisu',                                      bookmarks: '1.8K', rating: '4.7', reviews: '203', cookTime: '15dk', prepTime: '20dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&fit=crop' },
  { name: 'Avokadolu Caesar Salata Parmesan Cipsi ile',    bookmarks: '934',  rating: '4.5', reviews: '156', prepTime: '10dk', cookTime: '10dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&fit=crop' },
  { name: 'Çikolatalı Sufle',                              bookmarks: '1.8K', rating: '4.8', reviews: '278', prepTime: '15dk', cookTime: '20dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&fit=crop' },
  { name: 'Falafel Wrap Humus & Tahin Sos',                bookmarks: '567',  rating: '4.4', reviews: '98',  prepTime: '15dk', cookTime: '15dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&fit=crop' },
  { name: 'Margherita Pizza',                              bookmarks: '1.5K', rating: '4.7', reviews: '431', prepTime: '30dk', cookTime: '20dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&fit=crop' },
  { name: 'Ton Balığı Poke Bowl Soya & Susam',            bookmarks: '723',  rating: '4.6', reviews: '167', prepTime: '10dk', cookTime: '12dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop' },
  { name: 'New York Usulü Frambuazlı Cheesecake',         bookmarks: '1.8K', rating: '4.9', reviews: '389', prepTime: '25dk', cookTime: '10dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&fit=crop' },
  { name: 'İskender Kebap Yoğurtlu Tereyağlı',            bookmarks: '2.1K', rating: '4.8', reviews: '445', prepTime: '15dk', cookTime: '25dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=400&fit=crop' },
  { name: 'Türk Kahvesi',                                  bookmarks: '3.2K', rating: '4.3', reviews: '112', prepTime: '2dk',  cookTime: '5dk',  difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=400&fit=crop' },
  { name: 'Iskender Kebap', type: 'restoran', price: 245, bookmarks: '6.2K', rating: '4.9', reviews: '3.1K', cookTime: '25dk', prepTime: '10dk', difficulty: 'Orta', img: 'https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=400&fit=crop', restaurant: { name: 'Kebapçı Hacı', deliveryTime: '20-30dk', deliveryFee: 'Ücretsiz', minOrder: 100, rating: '4.9' } },
  { name: 'Menemen',                                       bookmarks: '1.1K', rating: '4.5', reviews: '234', prepTime: '5dk',  cookTime: '15dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=400&fit=crop' },
  { name: 'Geleneksel Mercimek Çorbası Kruton Eşliğinde', bookmarks: '987',  rating: '4.7', reviews: '367', prepTime: '10dk', cookTime: '20dk', difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&fit=crop' },
  { name: 'Mersin Tantuni Lavaş',                          bookmarks: '1.4K', rating: '4.6', reviews: '189', prepTime: '5dk',  cookTime: '10dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1613769049987-b31b641f25b1?w=400&fit=crop' },
  { name: 'Ayran',                                         bookmarks: '3.2K', rating: '4.2', reviews: '78',  prepTime: '1dk',  cookTime: '2dk',  difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=400&fit=crop' },
  { name: 'Taze Sıkılmış Ev Yapımı Limonata',             bookmarks: '3.2K', rating: '4.4', reviews: '145', prepTime: '5dk',  cookTime: '5dk',  difficulty: 'Kolay', img: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&fit=crop' },
  { name: 'Antep Fıstıklı Künefe Kaymak ile',             bookmarks: '1.8K', rating: '4.9', reviews: '298', prepTime: '15dk', cookTime: '18dk', difficulty: 'Zor',   img: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&fit=crop' },
  { name: 'Lahmacun',                                      bookmarks: '1.9K', rating: '4.7', reviews: '356', prepTime: '20dk', cookTime: '12dk', difficulty: 'Orta',  img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&fit=crop' },
  { name: 'Karışık Izgara Tabağı Közlenmiş Sebzeler ile', bookmarks: '1.6K', rating: '4.8', reviews: '423', prepTime: '20dk', cookTime: '40dk', difficulty: 'Zor',   img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&fit=crop' },
  { name: 'Fırında Kuzu Tandır Pide Eşliğinde',           bookmarks: '2.4K', rating: '4.9', reviews: '578', prepTime: '30dk', cookTime: '1s 45dk', difficulty: 'Zor', img: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&fit=crop' },
];


/* ── Navigation Config ── */
const NAV_ITEMS = [
  { id: 'menu',      label: 'Ana Sayfa',  icon: 'solar:home-smile-linear',      iconActive: 'solar:home-smile-bold' },
  { id: 'search',    label: 'Keşfet',     icon: 'solar:magnifer-linear',        iconActive: 'solar:magnifer-bold' },
  { id: 'ai',        label: 'AI',         icon: 'solar:star-circle-linear',     iconActive: 'solar:star-circle-bold' },
  { id: 'community', label: 'Topluluk',   icon: 'solar:users-group-rounded-linear', iconActive: 'solar:users-group-rounded-bold' },
  { id: 'profile',   label: 'Profil',     icon: 'solar:user-circle-linear',     iconActive: 'solar:user-circle-bold' },
];

const TITLE_MAP = {
  menu: '',
  search: 'Keşfet',
  ai: 'AI Asistan',
  community: 'Topluluk',
  profile: 'Profil',
};

/* ── Category Pills (Keşfet) ── */
const CATEGORY_PILLS = ['Tümü', 'Burger', 'Pizza', 'Kebap', 'Tatlı', 'İçecek', 'Salata'];

/* ── Category Pills (Menü) ── */
const MENU_PILLS = ['Meet', 'Salads', 'Desserts', 'Drinks'];

/* ── Stories ── */
const STORIES = [
  { name: 'Senin', avatar: 'https://i.pravatar.cc/80?img=11', hasNew: false, isOwn: true },
  { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', hasNew: true },
  { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=5', hasNew: true },
  { name: 'Lezzet Durağı', avatar: 'https://i.pravatar.cc/80?img=12', hasNew: true },
  { name: 'Pizza House', avatar: 'https://i.pravatar.cc/80?img=60', hasNew: true },
  { name: 'Kebapçı Ali', avatar: 'https://i.pravatar.cc/80?img=33', hasNew: false },
  { name: 'Zeynep', avatar: 'https://i.pravatar.cc/80?img=9', hasNew: true },
  { name: 'Burger Lab', avatar: 'https://i.pravatar.cc/80?img=52', hasNew: false },
  { name: 'Deniz Cafe', avatar: 'https://i.pravatar.cc/80?img=15', hasNew: true },
];

/* ── Community Feed ── */
/* postType: 'normal' | 'recipe' | 'ask' | 'chef_tip'  */
const COMMUNITY_FEED = [
  {
    id: 1, postType: 'recipe',
    user: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', handle: '@chefahmet', isChef: true, verified: true },
    time: '2s önce',
    text: 'Bugün ilk defa truffle burger denedim ve sonuç inanılmazdı! Karamelize soğanı 20dk kavurdum, fark gerçekten hissediliyor.',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
    recipe: { name: 'Truffle Burger', menuIdx: 0, cookTime: '25dk', difficulty: 'Orta', kalori: 340 },
    likes: 234, comments: 18, shares: 12,
    liked: false, saved: true,
    tags: ['burger', 'truffle', 'evyapımı'],
    filter: 'popular',
  },
  {
    id: 2, postType: 'normal',
    user: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=5', handle: '@aysemutfak', isChef: true, verified: true },
    time: '4s önce',
    text: 'Anneannemin mercimek çorbası tarifi. Sırrı: bir tutam nane ve bol limon. 30 yıllık tarif, asla eskimiyor.',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    likes: 567, comments: 42, shares: 89,
    liked: true, saved: true,
    tags: ['çorba', 'geleneksel', 'anneannetarifi'],
    filter: 'popular',
  },
  {
    id: 3, postType: 'ask',
    user: { name: 'Zeynep', avatar: 'https://i.pravatar.cc/80?img=9', handle: '@zeynepyemek', isChef: false },
    time: '6s önce',
    text: 'Çikolatalı suflem her seferinde çöküyor! Fotoğraftaki gibi oluyor, ortası pişmiyor. Nerede hata yapıyorum? Yardım edin!',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop',
    askStatus: 'open', askReplies: 7,
    likes: 189, comments: 31, shares: 8,
    liked: false, saved: false,
    tags: ['tatlı', 'yardım', 'sufle'],
    filter: 'academy',
  },
  {
    id: 4, postType: 'chef_tip',
    user: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', handle: '@kebapci_mehmet', isChef: true, verified: true },
    time: '8s önce',
    text: 'Adana kebap yapmanın 3 altın kuralı:\n1. Kıymayı en az 10 kez yoğurun\n2. Kuyruk yağı oranı %20 olmalı\n3. Közün ısısı sabit tutulmalı',
    img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop',
    likes: 892, comments: 67, shares: 145,
    liked: false, saved: true,
    tags: ['kebap', 'adana', 'ipucu'],
    filter: 'academy',
  },
  {
    id: 5, postType: 'recipe',
    user: { name: 'Şef Isabella', avatar: 'https://i.pravatar.cc/80?img=5', handle: '@chef_isabella', isChef: true, verified: true },
    time: '12s önce',
    text: 'San Marzano domateslerle margherita yaptım. Domates kalitesi her şeyi değiştiriyor!',
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop',
    recipe: { name: 'Margherita Pizza', menuIdx: 2, cookTime: '20dk', difficulty: 'Orta', kalori: 280 },
    likes: 445, comments: 38, shares: 22,
    liked: true, saved: false,
    tags: ['pizza', 'italyan', 'sanmarzano'],
    filter: 'academy',
  },
  {
    id: 6, postType: 'normal',
    user: { name: 'Deniz', avatar: 'https://i.pravatar.cc/80?img=15', handle: '@deniz_lezzet', isChef: false },
    time: '1g önce',
    text: 'Pazar kahvaltısı hazırlığı tamam! Menemen, peynir tabağı, taze simit ve bol çay. Günaydın herkese!',
    img: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&h=400&fit=crop',
    likes: 1203, comments: 89, shares: 34,
    liked: false, saved: false,
    tags: ['kahvaltı', 'menemen', 'pazar'],
    filter: 'popular',
  },
  {
    id: 7, postType: 'normal',
    user: { name: 'Burger Lab', avatar: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&h=80&fit=crop', handle: '@burgerlab', isChef: false },
    time: '1g önce',
    text: 'Yeni menümüz hazır! Double smash burger artık karamelize soğan ve truffle mayo ile.',
    img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=400&fit=crop',
    likes: 678, comments: 52, shares: 167,
    liked: false, saved: false,
    tags: ['burger', 'yenimenu', 'kampanya'],
    filter: 'academy',
  },
  {
    id: 8, postType: 'ask',
    user: { name: 'Furkan', avatar: 'https://i.pravatar.cc/80?img=11', handle: '@furkan', isChef: false },
    time: '2g önce',
    text: 'İlk künefe denemem! Biraz yanık oldu ama lezzeti harikaydı. Nerede yanlış yaptım? Tavsiyelerinizi bekliyorum.',
    img: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&h=400&fit=crop',
    askStatus: 'open', askReplies: 12,
    likes: 45, comments: 12, shares: 2,
    liked: false, saved: false,
    tags: ['künefe', 'ilkdeneme', 'tatlı'],
    filter: 'academy',
  },
  {
    id: 9, postType: 'recipe',
    user: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=5', handle: '@aysemutfak', isChef: true, verified: true },
    time: '2g önce',
    text: 'Caesar salatayı avokado ile denedim, çok daha doyurucu oluyor. Parmesan cipsi de mutlaka kendiniz yapın!',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    recipe: { name: 'Caesar Salata', menuIdx: 4, cookTime: '10dk', difficulty: 'Kolay', kalori: 220 },
    likes: 321, comments: 24, shares: 15,
    liked: false, saved: false,
    tags: ['salata', 'sağlıklı', 'avokado'],
    filter: 'academy',
  },
  {
    id: 10, postType: 'ask',
    user: { name: 'Deniz', avatar: 'https://i.pravatar.cc/80?img=15', handle: '@deniz_lezzet', isChef: false },
    time: '3g önce',
    text: 'Ekmek hamuru kabarma konusunda sorun yaşıyorum. 3 saat bekletiyorum ama hiç kabarmıyor. Maya ölmüş olabilir mi? Sıcaklık mı önemli?',
    img: null,
    askStatus: 'solved', askReplies: 15,
    likes: 78, comments: 15, shares: 3,
    liked: false, saved: false,
    tags: ['ekmek', 'hamur', 'yardım'],
    filter: 'academy',
  },
  {
    id: 11, postType: 'chef_tip',
    user: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', handle: '@chefahmet', isChef: true, verified: true },
    time: '3g önce',
    text: 'Et pişirmenin sırrı: Eti buzdolabından 30dk önce çıkarın. Oda sıcaklığındaki et eşit pişer, soğuk et dışı yakar içi çiğ bırakır.',
    img: null,
    likes: 1420, comments: 95, shares: 234,
    liked: false, saved: true,
    tags: ['ipucu', 'et', 'pişirme'],
    filter: 'academy',
  },
];

/* ── Community Top Chefs ── */
const TOP_CHEFS = [
  { name: 'Chef Ahmet', handle: '@chefahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', followers: '12.4K', recipes: 86, specialty: 'Burger & Izgara' },
  { name: 'Kebapçı Mehmet', handle: '@kebapci_mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', followers: '23.1K', recipes: 134, specialty: 'Kebap & Izgara' },
  { name: 'Ayşe Mutfak', handle: '@aysemutfak', avatar: 'https://i.pravatar.cc/80?img=5', followers: '5.3K', recipes: 78, specialty: 'Ev Yemekleri' },
  { name: 'Şef Isabella', handle: '@chef_isabella', avatar: 'https://i.pravatar.cc/80?img=5', followers: '8.7K', recipes: 52, specialty: 'İtalyan Mutfağı' },
];

/* ── Akademi Videoları ── */
const ACADEMY_VIDEOS = [
  {
    id: 'av1',
    user: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', handle: '@chefahmet', verified: true, followers: '12.4K' },
    title: 'Mükemmel Smash Burger Tekniği',
    description: 'Evde restoran kalitesinde smash burger nasıl yapılır? Etin seçiminden pişirme sıcaklığına tüm detaylar bu videoda.',
    category: 'teknik',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    aspect: '16:9',
    duration: '12:34',
    views: 24500,
    time: '2g önce',
    likes: 1890, comments: 142, shares: 234, saved: false, liked: false,
    tags: ['burger', 'teknik', 'ızgara'],
  },
  {
    id: 'av2',
    user: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', handle: '@kebapci_mehmet', verified: true, followers: '23.1K' },
    title: 'Adana Kebap: Şişe Geçirme Sanatı',
    description: 'Kıymanın yoğrulmasından şişe sarma tekniğine, ustadan adım adım Adana kebap yapım rehberi.',
    category: 'tarif',
    thumbnail: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    aspect: '9:16',
    duration: '8:45',
    views: 67800,
    time: '4g önce',
    likes: 4520, comments: 389, shares: 567, saved: true, liked: false,
    tags: ['kebap', 'adana', 'geleneksel'],
  },
  {
    id: 'av3',
    user: { name: 'Şef Isabella', avatar: 'https://i.pravatar.cc/80?img=5', handle: '@chef_isabella', verified: true, followers: '8.7K' },
    title: 'Napoli Pizza Hamuru – 72 Saat Fermantasyon',
    description: 'Gerçek Napoli pizzası için 72 saatlik soğuk fermantasyon tekniği. Hamur elastikiyeti ve lezzet derinliği garantili.',
    category: 'tarif',
    thumbnail: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    aspect: '16:9',
    duration: '18:20',
    views: 31200,
    time: '1h önce',
    likes: 2340, comments: 198, shares: 312, saved: false, liked: true,
    tags: ['pizza', 'hamur', 'fermantasyon'],
  },
  {
    id: 'av4',
    user: { name: 'Ayşe Mutfak', avatar: 'https://i.pravatar.cc/80?img=5', handle: '@aysemutfak', verified: true, followers: '5.3K' },
    title: 'Bıçak Teknikleri: Julienne, Brunoise, Chiffonade',
    description: 'Profesyonel mutfak bıçak kesim teknikleri. Hızlı ve güvenli doğrama için temel beceriler.',
    category: 'teknik',
    thumbnail: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    aspect: '16:9',
    duration: '14:55',
    views: 18900,
    time: '1h önce',
    likes: 1560, comments: 87, shares: 145, saved: false, liked: false,
    tags: ['teknik', 'bıçak', 'temel'],
  },
  {
    id: 'av5',
    user: { name: 'Chef Ahmet', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', handle: '@chefahmet', verified: true, followers: '12.4K' },
    title: 'Sos Yapımının 5 Altın Kuralı',
    description: 'Béchamel\'den demi-glace\'a, sos dünyasının temelleri. Kıvam, sıcaklık ve malzeme dengeleri.',
    category: 'püf',
    thumbnail: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    aspect: '9:16',
    duration: '10:12',
    views: 9400,
    time: '2h önce',
    likes: 876, comments: 64, shares: 98, saved: false, liked: false,
    tags: ['sos', 'teknik', 'temel'],
  },
  {
    id: 'av6',
    user: { name: 'Kebapçı Mehmet', avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', handle: '@kebapci_mehmet', verified: true, followers: '23.1K' },
    title: 'Et Dinlendirme: Neden ve Nasıl?',
    description: 'Pişirme sonrası et dinlendirmenin bilimsel açıklaması. Doğru süre, sıcaklık ve teknikler.',
    category: 'püf',
    thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=340&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    aspect: '16:9',
    duration: '7:30',
    views: 41200,
    time: '3h önce',
    likes: 3210, comments: 245, shares: 410, saved: false, liked: false,
    tags: ['et', 'pişirme', 'ipucu'],
  },
];

/* ── Notifications ── */
const NOTIFICATIONS = [
  { id:1, type:'like',     user:'Chef Ahmet',  avatar:'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', text:'gönderinizi beğendi', time:'5dk', read:false },
  { id:2, type:'comment',  user:'Ayşe Mutfak', avatar:'https://i.pravatar.cc/80?img=5', text:'gönderinize yorum yaptı: "Harika görünüyor!"', time:'15dk', read:false },
  { id:3, type:'follow',   user:'Zeynep',      avatar:'https://i.pravatar.cc/80?img=9', text:'sizi takip etmeye başladı', time:'1s', read:false },
  { id:4, type:'mention',  user:'Kebapçı Mehmet', avatar:'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=80&h=80&fit=crop&crop=face', text:'sizi bir gönderide etiketledi', time:'2s', read:true },
  { id:5, type:'recipe',   user:'YemekApp',    avatar:'', text:'Bu hafta en popüler 5 tarif yayınlandı!', time:'3s', read:true },
  { id:6, type:'like',     user:'Deniz',       avatar:'https://i.pravatar.cc/80?img=15', text:'tarifini beğendi', time:'5s', read:true },
];

/* ── User Profile ── */
const USER_PROFILE = {
  name: 'Furkan',
  username: '@furkan',
  bio: 'Yemek yapmayı ve yeni tarifler keşfetmeyi seviyorum!',
  avatar: 'https://i.pravatar.cc/200?img=11',
  email: 'furkan.sahin@campusaxess.com',
  phone: '+905551234548',
  stats: { followers: 128, following: 87, posts: 12 },
  health: { height: 178, weight: 75, age: 26 },
  wallet: { balance: 350, currency: 'puan' },
  // User's own posts (3-column grid photos)
  myPosts: [
    { img:'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=300&h=300&fit=crop', likes:45, type:'post' },
    { img:'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=300&h=300&fit=crop', likes:23, type:'post' },
    { img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop', likes:67, type:'recipe' },
    { img:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop', likes:89, type:'recipe' },
    { img:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop', likes:34, type:'post' },
    { img:'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=300&h=300&fit=crop', likes:56, type:'recipe' },
    { img:'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop', likes:112, type:'post' },
    { img:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=300&fit=crop', likes:78, type:'recipe' },
    { img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop', likes:41, type:'post' },
  ],
  // ── Haftalık Yemek Planı ──
  weeklyPlan: {
    // key = 'YYYY-MM-DD', value = { meals: { sabah:[], ogle:[], aksam:[], ara:[] }, notes:[] }
    '2026-04-13': {
      meals: {
        sabah: [{ type:'recipe', sourceType:'menu', idx:8, note:'' }],
        ogle:  [{ type:'restoran', sourceType:'restoran', idx:1, note:'Kebapçı Hacı\'dan al' }],
        aksam: [{ type:'recipe', sourceType:'menu', idx:0, note:'' }],
        ara:   []
      },
      notes: ['Akşam yemeğinde misafir var, porsiyon 4 kişilik olsun']
    },
    '2026-04-14': {
      meals: {
        sabah: [],
        ogle:  [{ type:'recipe', sourceType:'menu', idx:5, note:'' }],
        aksam: [{ type:'recipe', sourceType:'myRecipe', id:1, note:'' }],
        ara:   [{ type:'note', text:'Meyve tabağı hazırla' }]
      },
      notes: ['Bugün hafif beslenme günü']
    },
    '2026-04-15': {
      meals: {
        sabah: [{ type:'recipe', sourceType:'menu', idx:2, note:'' }],
        ogle:  [],
        aksam: [{ type:'restoran', sourceType:'restoran', idx:0, note:'Burger Lab sipariş' }],
        ara:   []
      },
      notes: []
    }
  },
  // ── Alışveriş Listesi ──
  shoppingList: [],
  // ── Kullanıcının Oluşturduğu Tarifler ──
  myRecipes: [
    {
      id: 1, name: 'Ev Yapımı Mantı', category: 'Ana Yemek',
      img: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&h=400&fit=crop',
      prepTime: '45dk', cookTime: '30dk', difficulty: 'Zor', servings: 4,
      desc: 'Kayseri usulü el açması mantı, sarımsaklı yoğurt ve tereyağlı sos ile.',
      ingredients: ['Un 3 su bardağı', 'Kıyma 300g', 'Soğan 2 adet', 'Yoğurt 500g', 'Sarımsak 3 diş', 'Tereyağı 50g', 'Pul biber'],
      steps: ['Hamuru yoğurun ve 30dk dinlendirin', 'İç harcını hazırlayın', 'Hamuru ince açıp küçük kareler kesin', 'Kıymayı karelere koyup kapatın', 'Kaynayan suda 15-20dk haşlayın', 'Sarımsaklı yoğurt ve tereyağlı sos ile servis edin'],
      date: '2025-03-15'
    },
    {
      id: 2, name: 'Fırında Sebzeli Tavuk', category: 'Ana Yemek',
      img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop',
      prepTime: '15dk', cookTime: '45dk', difficulty: 'Kolay', servings: 3,
      desc: 'Marine edilmiş tavuk but, renkli sebzeler ile fırında.',
      ingredients: ['Tavuk but 4 adet', 'Patates 3 adet', 'Havuç 2 adet', 'Biber 2 adet', 'Zeytinyağı', 'Kekik, tuz, karabiber'],
      steps: ['Tavukları marine edin', 'Sebzeleri doğrayıp tepsiye dizin', 'Tavukları üzerine yerleştirin', '200°C fırında 45dk pişirin'],
      date: '2025-04-02'
    },
  ],
  // ── Alerjen & İntoleranslar ──
  allergens: ['gluten', 'laktoz'],  // aktif alerjen id'leri
  // ── Tarif Defteri (Bookmark — detay sayfası) ──
  savedRecipes: [0, 2, 4, 6, 9, 10],           // menuItems indexes
  // ── Favoriler (Kalp — Kişisel/Gizli, Hesabım > Favorilerim) ──
  favoriteRecipes: [0, 2, 4, 6, 9, 10],       // menuItems indexes
  favoriteRestaurants: [1, 3],                  // restaurantItems indexes
  // ── Beğeniler (Kaşık — Sosyal/Açık, Topluluk > Menü > Beğendiklerim) ──
  likedPosts: [2, 5],                           // COMMUNITY_FEED ids
  // ── Kaydedilenler (Topluluk > Menü > Kaydedilenler) ──
  savedPosts: [1, 4],                           // COMMUNITY_FEED ids
  // ── Yorumlarım (Topluluk > Menü > Yorumlar) ──
  userComments: [
    { postId: 2, text: 'Bu tarifi denedim, harika oldu!', date: '2025-04-08' },
    { postId: 5, text: 'San Marzano domatesler gerçekten fark yaratıyor.', date: '2025-04-10' },
  ],
  // Order history
  orders: [
    { id:'#1042', name:'Truffle Burger x2', date:'5 Nisan', price:370, status:'Teslim Edildi' },
    { id:'#1038', name:'Adana Kebap x4', date:'2 Nisan', price:880, status:'Teslim Edildi' },
    { id:'#1035', name:'Margherita Pizza', date:'28 Mart', price:165, status:'Teslim Edildi' },
    { id:'#1031', name:'Caesar Salata x2', date:'25 Mart', price:220, status:'İptal' },
  ],
};

/* ── Home Kategorileri ── */
const HOME_CATEGORIES = [
  { label: 'Burger',  icon: 'solar:fire-bold' },
  { label: 'Pizza',   icon: 'solar:pizza-bold' },
  { label: 'Kebap',   icon: 'solar:chef-hat-bold' },
  { label: 'Tatlı',   icon: 'solar:cup-hot-bold' },
  { label: 'Salata',  icon: 'solar:leaf-bold' },
  { label: 'İçecek',  icon: 'solar:glass-water-bold' },
  { label: 'Çorba',   icon: 'solar:bowl-bold' },
  { label: 'Kahve',   icon: 'solar:coffee-cup-bold' },
];

/* ── Saved Locations ── */
const SAVED_LOCATIONS = [
  { id: 'home', label: 'Evim', address: 'Ataşehir, Kayışdağı Cd. No:42, İstanbul', icon: 'solar:home-smile-bold', active: true },
  { id: 'work', label: 'İş Yerim', address: 'Levent, Büyükdere Cd. No:185, İstanbul', icon: 'solar:buildings-bold', active: false },
  { id: 'gym', label: 'Spor Salonu', address: 'Kadıköy, Moda Cd. No:12, İstanbul', icon: 'solar:dumbbell-bold', active: false },
];

/* ── Tarif Sections Config ── */
const TARIF_SECTIONS = [
  { id: 'recent',       title: 'Son Ziyaret Edilenler', icon: 'solar:clock-circle-bold',    type: 'recent' },
  { id: 'populer',      title: 'Popüler Tarifler',     icon: 'solar:fire-bold',             type: 'filter', sort: 'rating', limit: 6 },
  { id: 'quick',        title: '30dk Altı Tarifler',    icon: 'solar:alarm-bold',            type: 'filter', filter: item => { const t = parseInt(item.cookTime); return !isNaN(t) && t <= 30; }, limit: 6 },
  { id: 'cta_premium',  title: '', type: 'cta', cta: 'premium' },
  { id: 'saglikli',     title: 'Sağlıklı Seçimler',    icon: 'solar:heart-pulse-bold',      type: 'filter', filter: item => item.nutrition && item.nutrition.kalori < 300, limit: 6 },
  { id: 'tatlilar',     title: 'Tatlılar',              icon: 'solar:cup-hot-bold',          type: 'filter', filter: item => item.category === 'Tatlı', limit: 6 },
  { id: 'cta_ai',       title: '', type: 'cta', cta: 'ai' },
  { id: 'hamur',        title: 'Hamur İşleri',          icon: 'solar:donut-bold',            type: 'filter', filter: item => ['Pizza','Burger'].includes(item.category) || item.name.includes('Lahmacun') || item.name.includes('Wrap'), limit: 6 },
  { id: 'ana_yemek',    title: 'Ana Yemekler',          icon: 'solar:chef-hat-bold',         type: 'filter', filter: item => ['Kebap','Salata','Çorba'].includes(item.category), limit: 6 },
  { id: 'yeni',         title: 'Yeni Eklenenler',       icon: 'solar:star-shine-bold',       type: 'newest', limit: 5 },
];

/* ── Restoran Sections Config ── */
const RESTORAN_SECTIONS = [
  { id: 'recent',        title: 'Son Ziyaret Edilenler', icon: 'solar:clock-circle-bold',    type: 'recent' },
  { id: 'sponsored',     title: 'Öne Çıkanlar',          icon: 'solar:crown-bold',           type: 'filter', filter: item => item.sponsored === true, limit: 6, badge: 'Reklam' },
  { id: 'top_rated',     title: '4+ Yıldız',             icon: 'solar:star-bold',            type: 'filter', filter: item => parseFloat(item.rating) >= 4.5, sort: 'rating', limit: 6 },
  { id: 'cta_premium',   title: '', type: 'cta', cta: 'premium' },
  { id: 'yakin',         title: 'Yakın İşletmeler',      icon: 'solar:map-point-bold',       type: 'filter', filter: item => item.restaurant && (item.restaurant.address.includes('Kadıköy') || item.restaurant.address.includes('Ataşehir')), limit: 6 },
  { id: 'hizli',         title: 'Hızlı Teslimat',        icon: 'solar:delivery-bold',        type: 'filter', filter: item => { const t = parseInt((item.restaurant||{}).deliveryTime||'99'); return t <= 25; }, limit: 6 },
  { id: 'cta_ai',        title: '', type: 'cta', cta: 'ai' },
  { id: 'ucretsiz',      title: 'Ücretsiz Teslimat',     icon: 'solar:tag-price-bold',       type: 'filter', filter: item => item.restaurant && item.restaurant.deliveryFee === 'Ücretsiz', limit: 6 },
  { id: 'tatli_rest',    title: 'Tatlı & Kahve',         icon: 'solar:cup-hot-bold',         type: 'filter', filter: item => item.category === 'Tatlı', limit: 6 },
  { id: 'yeni',          title: 'Yeni Eklenen Mekanlar',  icon: 'solar:star-shine-bold',      type: 'newest', limit: 5 },
];

/* ═══ KULLANICININ ÇALIŞTIĞI İŞLETMELER ═══ */
const USER_EMPLOYMENTS = [
  // ═══ Lezzet Mutfak — tüm roller (demo amaçlı) ═══
  {
    id: 'emp_001',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'owner',
    roleLabel: 'İşletme Sahibi',
    roleColor: '#8B5CF6',
    status: 'active',
    assignedAt: '2024-03-15',
    isOwner: true,
    staffName: null
  },
  {
    id: 'emp_002',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'manager',
    roleLabel: 'Şube Müdürü',
    roleColor: '#3B82F6',
    status: 'active',
    assignedAt: '2025-11-01',
    isOwner: false,
    staffName: null
  },
  {
    id: 'emp_003',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'chef',
    roleLabel: 'Mutfak Sorumlusu',
    roleColor: '#F59E0B',
    status: 'active',
    assignedAt: '2026-01-10',
    isOwner: false,
    staffName: 'Serap Tuncer',
    kitchenCategories: ['grill', 'hot_kitchen']
  },
  {
    id: 'emp_004',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'waiter',
    roleLabel: 'Garson',
    roleColor: '#10B981',
    status: 'active',
    assignedAt: '2026-02-20',
    isOwner: false,
    staffName: 'Ayşe Kaya',
    staffId: 'staff_005'
  },
  {
    id: 'emp_005',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'cashier',
    roleLabel: 'Kasiyer',
    roleColor: '#EC4899',
    status: 'active',
    assignedAt: '2026-03-05',
    isOwner: false,
    staffName: 'Berat Yıldız'
  },
  {
    id: 'emp_006',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'courier',
    roleLabel: 'Kurye',
    roleColor: '#F97316',
    status: 'active',
    assignedAt: '2026-03-18',
    isOwner: false,
    staffName: 'Barış Güzel'
  },
  {
    id: 'emp_009',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    businessLogo: null,
    businessCuisine: 'Türk & Dünya Mutfağı',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    role: 'coordinator',
    roleLabel: 'Koordinatör',
    roleColor: '#A855F7',
    status: 'active',
    assignedAt: '2026-03-25',
    isOwner: false,
    staffName: 'Elif Aslan'
  },
  // ═══ Diğer işletmeler ═══
  {
    id: 'emp_007',
    businessId: 'bus_002',
    businessName: 'Kahve Dünyası',
    businessLogo: null,
    businessCuisine: 'Kahve & Tatlı',
    branchId: 'kb1',
    branchName: 'Beşiktaş Şubesi',
    role: 'manager',
    roleLabel: 'Şube Müdürü',
    roleColor: '#3B82F6',
    status: 'active',
    assignedAt: '2025-11-01',
    isOwner: false,
    staffName: null
  },
  {
    id: 'emp_008',
    businessId: 'bus_003',
    businessName: 'Balıkçı Hasan',
    businessLogo: null,
    businessCuisine: 'Balık & Deniz Ürünleri',
    branchId: 'bh1',
    branchName: 'Karaköy Şubesi',
    role: 'waiter',
    roleLabel: 'Garson',
    roleColor: '#10B981',
    status: 'active',
    assignedAt: '2026-02-20',
    isOwner: false,
    staffName: null
  }
];

/* ═══ EMPLOYEE SHIFTS & TASKS (User-side) ═══ */
const USER_EMPLOYEE_SHIFTS = [
  // İşletme Sahibi - Lezzet Mutfak
  { id: 'shift_u1', empId: 'emp_001', date: '2026-04-12', start: '09:00', end: '17:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u2', empId: 'emp_001', date: '2026-04-13', start: '09:00', end: '17:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u3', empId: 'emp_001', date: '2026-04-14', start: '10:00', end: '18:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u8', empId: 'emp_001', date: '2026-04-11', start: '09:00', end: '17:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Şube Müdürü - Lezzet Mutfak
  { id: 'shift_u4', empId: 'emp_002', date: '2026-04-12', start: '08:00', end: '17:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u5', empId: 'emp_002', date: '2026-04-13', start: '08:00', end: '17:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u9', empId: 'emp_002', date: '2026-04-11', start: '08:00', end: '17:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Mutfak Sorumlusu - Lezzet Mutfak
  { id: 'shift_u6', empId: 'emp_003', date: '2026-04-12', start: '10:00', end: '22:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u7', empId: 'emp_003', date: '2026-04-14', start: '10:00', end: '22:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Garson - Lezzet Mutfak
  { id: 'shift_u10', empId: 'emp_004', date: '2026-04-12', start: '11:00', end: '23:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u11', empId: 'emp_004', date: '2026-04-13', start: '11:00', end: '23:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u12', empId: 'emp_004', date: '2026-04-11', start: '11:00', end: '23:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Kasiyer - Lezzet Mutfak
  { id: 'shift_u13', empId: 'emp_005', date: '2026-04-12', start: '10:00', end: '18:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u14', empId: 'emp_005', date: '2026-04-14', start: '10:00', end: '18:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u15', empId: 'emp_005', date: '2026-04-10', start: '10:00', end: '18:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Kurye - Lezzet Mutfak
  { id: 'shift_u16', empId: 'emp_006', date: '2026-04-12', start: '08:00', end: '20:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u17', empId: 'emp_006', date: '2026-04-13', start: '08:00', end: '20:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u18', empId: 'emp_006', date: '2026-04-11', start: '08:00', end: '20:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Koordinatör - Lezzet Mutfak
  { id: 'shift_u23', empId: 'emp_009', date: '2026-04-12', start: '09:00', end: '19:00', status: 'active', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u24', empId: 'emp_009', date: '2026-04-13', start: '09:00', end: '19:00', status: 'upcoming', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  { id: 'shift_u25', empId: 'emp_009', date: '2026-04-11', start: '09:00', end: '19:00', status: 'completed', businessName: 'Lezzet Mutfak', branchName: 'Kadıköy Şubesi' },
  // Kahve Dünyası - Şube Müdürü
  { id: 'shift_u19', empId: 'emp_007', date: '2026-04-12', start: '12:00', end: '20:00', status: 'active', businessName: 'Kahve Dünyası', branchName: 'Beşiktaş Şubesi' },
  { id: 'shift_u20', empId: 'emp_007', date: '2026-04-13', start: '08:00', end: '16:00', status: 'upcoming', businessName: 'Kahve Dünyası', branchName: 'Beşiktaş Şubesi' },
  // Balıkçı Hasan - Garson
  { id: 'shift_u21', empId: 'emp_008', date: '2026-04-12', start: '11:00', end: '23:00', status: 'active', businessName: 'Balıkçı Hasan', branchName: 'Karaköy Şubesi' },
  { id: 'shift_u22', empId: 'emp_008', date: '2026-04-13', start: '11:00', end: '23:00', status: 'upcoming', businessName: 'Balıkçı Hasan', branchName: 'Karaköy Şubesi' }
];

const USER_EMPLOYEE_TASKS = [
  // İşletme Sahibi
  { id: 'task_u1', empId: 'emp_001', title: 'Menü fiyat güncellemesi', desc: 'Yaz menüsü fiyatlarını güncelle', priority: 'high', status: 'pending', dueDate: '2026-04-13', businessName: 'Lezzet Mutfak' },
  { id: 'task_u2', empId: 'emp_001', title: 'Stok sayımı', desc: 'Haftalık stok sayımını tamamla', priority: 'medium', status: 'in_progress', dueDate: '2026-04-12', businessName: 'Lezzet Mutfak' },
  { id: 'task_u5', empId: 'emp_001', title: 'Tedarikçi toplantısı', desc: 'Et tedarikçisiyle fiyat görüşmesi', priority: 'high', status: 'pending', dueDate: '2026-04-15', businessName: 'Lezzet Mutfak' },
  // Şube Müdürü
  { id: 'task_u3', empId: 'emp_002', title: 'Personel değerlendirmesi', desc: 'Aylık personel performans raporunu hazırla', priority: 'medium', status: 'pending', dueDate: '2026-04-14', businessName: 'Lezzet Mutfak' },
  { id: 'task_u12', empId: 'emp_002', title: 'Tedarik siparişi', desc: 'Haftalık sebze-meyve tedarik siparişini ver', priority: 'high', status: 'in_progress', dueDate: '2026-04-12', businessName: 'Lezzet Mutfak' },
  // Mutfak Sorumlusu
  { id: 'task_u4', empId: 'emp_003', title: 'Tarif standardizasyonu', desc: 'Adana kebap tarifini standartlaştır', priority: 'low', status: 'completed', dueDate: '2026-04-11', businessName: 'Lezzet Mutfak' },
  { id: 'task_u13', empId: 'emp_003', title: 'Mutfak ekipman kontrolü', desc: 'Izgara ve fırın bakım kontrollerini yap', priority: 'medium', status: 'pending', dueDate: '2026-04-13', businessName: 'Lezzet Mutfak' },
  // Garson
  { id: 'task_u6', empId: 'emp_004', title: 'Masa düzeni kontrolü', desc: 'Teras masalarını yaz düzenine geçir', priority: 'medium', status: 'pending', dueDate: '2026-04-13', businessName: 'Lezzet Mutfak' },
  { id: 'task_u7', empId: 'emp_004', title: 'Menü bilgisi çalışması', desc: 'Yeni menü öğelerini öğren ve müşterilere öner', priority: 'low', status: 'in_progress', dueDate: '2026-04-14', businessName: 'Lezzet Mutfak' },
  // Kasiyer
  { id: 'task_u8', empId: 'emp_005', title: 'Kasa kapanış raporu', desc: 'Günlük kasa kapanış raporunu hazırla', priority: 'high', status: 'pending', dueDate: '2026-04-12', businessName: 'Lezzet Mutfak' },
  { id: 'task_u9', empId: 'emp_005', title: 'İndirim kuponu kontrolü', desc: 'Süresi dolan kuponları sistemden kaldır', priority: 'low', status: 'completed', dueDate: '2026-04-11', businessName: 'Lezzet Mutfak' },
  // Kurye
  { id: 'task_u10', empId: 'emp_006', title: 'Teslimat rotası optimizasyonu', desc: 'Kadıköy bölgesi rota planını güncelle', priority: 'medium', status: 'in_progress', dueDate: '2026-04-12', businessName: 'Lezzet Mutfak' },
  { id: 'task_u11', empId: 'emp_006', title: 'Araç bakımı', desc: 'Motosiklet periyodik bakım randevusu al', priority: 'high', status: 'pending', dueDate: '2026-04-15', businessName: 'Lezzet Mutfak' },
  // Koordinatör
  { id: 'task_u16', empId: 'emp_009', title: 'Vardiya planı kontrolü', desc: 'Haftalık garson ve mutfak vardiyasını gözden geçir', priority: 'high', status: 'in_progress', dueDate: '2026-04-13', businessName: 'Lezzet Mutfak' },
  { id: 'task_u17', empId: 'emp_009', title: 'Müşteri yorumları değerlendirme', desc: 'Son hafta gelen yorumları incele ve topluluğa yanıt ver', priority: 'medium', status: 'pending', dueDate: '2026-04-14', businessName: 'Lezzet Mutfak' },
  // Kahve Dünyası
  { id: 'task_u14', empId: 'emp_007', title: 'Barista eğitimi', desc: 'Yeni barista için oryantasyon hazırla', priority: 'medium', status: 'pending', dueDate: '2026-04-14', businessName: 'Kahve Dünyası' },
  // Balıkçı Hasan
  { id: 'task_u15', empId: 'emp_008', title: 'Balık tezgahı hazırlığı', desc: 'Günlük taze balık tezgahını hazırla', priority: 'high', status: 'pending', dueDate: '2026-04-12', businessName: 'Balıkçı Hasan' }
];

const USER_EMPLOYEE_ANNOUNCEMENTS = [
  // Lezzet Mutfak — tüm roller görür
  { id: 'ann_1', empId: 'emp_001', title: 'Ramazan menüsü başlıyor', message: 'İftar menüsü 14 Nisan\'dan itibaren aktif olacak.', date: '2026-04-10', businessName: 'Lezzet Mutfak', isRead: false },
  { id: 'ann_3', empId: 'emp_001', title: 'Vardiya değişikliği', message: 'Hafta sonu vardiyaları 1 saat öne alındı.', date: '2026-04-08', businessName: 'Lezzet Mutfak', isRead: true },
  { id: 'ann_8', empId: 'emp_002', title: 'Hijyen denetimi', message: '15 Nisan\'da sağlık bakanlığı denetimi olacak. Tüm alanları hazırlayın.', date: '2026-04-11', businessName: 'Lezzet Mutfak', isRead: false },
  { id: 'ann_9', empId: 'emp_003', title: 'Yeni mutfak ekipmanı', message: 'Yeni konveksiyonlu fırın yarın kurulacak. Mutfak ekibini bilgilendirin.', date: '2026-04-10', businessName: 'Lezzet Mutfak', isRead: false },
  { id: 'ann_4', empId: 'emp_004', title: 'Teras açılışı', message: 'Teras bölümü 15 Nisan\'dan itibaren hizmete açılacak. Masa düzenini hazırlayın.', date: '2026-04-10', businessName: 'Lezzet Mutfak', isRead: false },
  { id: 'ann_5', empId: 'emp_005', title: 'POS sistemi güncellemesi', message: 'Yeni POS yazılımı bu akşam yüklenecek. Kasa işlemlerinde dikkatli olun.', date: '2026-04-11', businessName: 'Lezzet Mutfak', isRead: false },
  { id: 'ann_6', empId: 'emp_006', title: 'Yeni teslimat bölgesi', message: 'Ümraniye bölgesi teslimat alanına eklendi. Rota haritasını güncelleyin.', date: '2026-04-09', businessName: 'Lezzet Mutfak', isRead: true },
  { id: 'ann_7', empId: 'emp_006', title: 'Yağmurlu hava protokolü', message: 'Yağışlı havalarda teslimat süresi +15 dk tolerans uygulanacak.', date: '2026-04-07', businessName: 'Lezzet Mutfak', isRead: true },
  // Diğer işletmeler
  { id: 'ann_2', empId: 'emp_007', title: 'Yeni kahve çeşitleri', message: 'Cold brew ve nitro seçenekleri eklendi.', date: '2026-04-09', businessName: 'Kahve Dünyası', isRead: true },
  { id: 'ann_10', empId: 'emp_008', title: 'Sezon balıkları', message: 'Levrek ve çipura sezonu başladı. Müşterilere önerin.', date: '2026-04-10', businessName: 'Balıkçı Hasan', isRead: false }
];

/* ═══════════════════════════════════════════════════════════
   BAŞARILAR KOLEKSİYONU — Rozet Kataloğu + User Progress
   ═══════════════════════════════════════════════════════════ */

var USER_ACHIEVEMENTS_CATALOG = [
  /* ═══ HAFTALIK ═══ */
  /* Sosyal Etkileşim (weekly_posts) */
  { id:'social_bronze',  category:'social', duration:'weekly', tier:'bronze',  label:'İçerik Yazarı',   desc:'Haftada 3 paylaşım yap, topluluğa ilk adımını at.',            icon:'solar:pen-new-square-bold',   target:3,  metric:'weekly_posts' },
  { id:'social_silver',  category:'social', duration:'weekly', tier:'silver',  label:'Sosyal Fenomen',  desc:'Haftada 5 paylaşım yap, etkileşimini yükselt.',                icon:'solar:users-group-rounded-bold', target:5,  metric:'weekly_posts' },
  { id:'social_gold',    category:'social', duration:'weekly', tier:'gold',    label:'İlham Kaynağı',   desc:'Haftada 7 paylaşım yap, takipçilerine ilham ver.',             icon:'solar:medal-star-bold',       target:7,  metric:'weekly_posts' },
  { id:'social_diamond', category:'social', duration:'weekly', tier:'diamond', label:'Sosyal Kelebek',  desc:'Haftada 10 paylaşım ile topluluğun parlayan yıldızı ol.',      icon:'solar:stars-bold',            target:10, metric:'weekly_posts' },

  /* Eleştirmen (weekly_reviews) */
  { id:'critic_bronze',  category:'critic', duration:'weekly', tier:'bronze',  label:'Tadımcı',         desc:'Haftada 2 yorum yap, damak tadına dair ilk izlenimlerini paylaş.', icon:'solar:pen-bold',           target:2,  metric:'weekly_reviews' },
  { id:'critic_silver',  category:'critic', duration:'weekly', tier:'silver',  label:'Yorumcu',         desc:'Haftada 4 yorum yap, detaylı analizlerinle fark yarat.',       icon:'solar:feather-bold',          target:4,  metric:'weekly_reviews' },
  { id:'critic_gold',    category:'critic', duration:'weekly', tier:'gold',    label:'Gurme Yazar',     desc:'Haftada 5 yorum yap, damak zevkini kaleme dök.',               icon:'solar:notebook-bookmark-bold', target:5, metric:'weekly_reviews' },
  { id:'critic_diamond', category:'critic', duration:'weekly', tier:'diamond', label:'Baş Eleştirmen',  desc:'Haftada 7 yorum yap, platformun söz sahibi olursun.',          icon:'solar:cup-star-bold',         target:7,  metric:'weekly_reviews' },

  /* Lezzet Kaşifi (weekly_orders) */
  { id:'order_bronze',   category:'order',  duration:'weekly', tier:'bronze',  label:'Lezzet Avcısı',    desc:'Haftada 3 sipariş ver, yeni lezzet duraklarını keşfet.',      icon:'solar:compass-bold',          target:3,  metric:'weekly_orders' },
  { id:'order_silver',   category:'order',  duration:'weekly', tier:'silver',  label:'Gastronaut',       desc:'Haftada 5 sipariş ver, gastronomi galaksisinde keşfe çık.',   icon:'solar:rocket-bold',           target:5,  metric:'weekly_orders' },
  { id:'order_gold',     category:'order',  duration:'weekly', tier:'gold',    label:'Ağzının Tadını Biliyor', desc:'Haftada 7 sipariş ver, damak tadının ustası ol.',        icon:'solar:crown-bold',            target:7,  metric:'weekly_orders' },
  { id:'order_diamond',  category:'order',  duration:'weekly', tier:'diamond', label:'Yemek Profesörü',  desc:'Haftada 10 sipariş ile yemekte akademisyen seviyene ulaş.',  icon:'solar:user-hands-bold',       target:10, metric:'weekly_orders' },

  /* Gece Kuşu (weekly_night_orders) */
  { id:'night_l1',       category:'night',  duration:'weekly', tier:'bronze',  label:'Kakapo',           desc:'Haftada 3 gece siparişi (00:00-05:00) ile geceyi fethet.',    icon:'solar:moon-bold',             target:3,  metric:'weekly_night_orders' },
  { id:'night_l2',       category:'night',  duration:'weekly', tier:'silver',  label:'Gece Balıkçılı',   desc:'Haftada 5 gece siparişi ile sessizliğin ustası ol.',          icon:'solar:moon-stars-bold',       target:5,  metric:'weekly_night_orders' },
  { id:'night_l3',       category:'night',  duration:'weekly', tier:'gold',    label:'Gece Baykuşu',     desc:'Haftada 7 gece siparişi ile gecenin efendisi ol.',            icon:'solar:stars-minimalistic-bold', target:7, metric:'weekly_night_orders' },

  /* ═══ AYLIK ═══ */
  /* Müdavim (monthly_same_biz_orders) */
  { id:'loyal_l1',       category:'loyal',  duration:'monthly', tier:'bronze',  label:'Mahallenin Müdavimi', desc:'Aynı işletmeden ayda 4 sipariş ver, tanıdık bir yüz ol.',  icon:'solar:home-2-bold',           target:4,  metric:'monthly_same_biz_orders' },
  { id:'loyal_l2',       category:'loyal',  duration:'monthly', tier:'silver',  label:'Evin Oğlu/Kızı',     desc:'Ayda 6 sipariş ver, masada senin yerin hazır olsun.',      icon:'solar:heart-pulse-bold',      target:6,  metric:'monthly_same_biz_orders' },
  { id:'loyal_l3',       category:'loyal',  duration:'monthly', tier:'gold',    label:'İşletme Bilirkişisi', desc:'Ayda 8 sipariş ile menüyü ezbere bilen biri ol.',         icon:'solar:verified-check-bold',   target:8,  metric:'monthly_same_biz_orders' },
  { id:'loyal_l4',       category:'loyal',  duration:'monthly', tier:'diamond', label:'VIP Masa Sahibi',    desc:'Ayda 10 sipariş ile işletmenin VIP müdavimi ol.',          icon:'solar:crown-star-bold',       target:10, metric:'monthly_same_biz_orders' },

  /* Kalbi Güzel (monthly_donation_tokens) */
  { id:'donation_l1',    category:'donation', duration:'monthly', tier:'bronze',  label:'Gönüllü Destekçi',       desc:'Ayda 200 token bağışla öğrencilere destek ol.',          icon:'solar:hand-heart-bold',      target:200, metric:'monthly_donation_tokens' },
  { id:'donation_l2',    category:'donation', duration:'monthly', tier:'silver',  label:'İyilik Elçisi',           desc:'Ayda 400 token bağışla iyilik zincirini büyüt.',         icon:'solar:medal-star-circle-bold', target:400, metric:'monthly_donation_tokens' },
  { id:'donation_l3',    category:'donation', duration:'monthly', tier:'gold',    label:'Kalbi Büyük Kahraman',    desc:'Ayda 500+ token bağışla gerçek bir kahraman ol.',        icon:'solar:heart-shine-bold',     target:500, metric:'monthly_donation_tokens' },

  /* ═══ DİNAMİK VE KALICI ═══ */
  { id:'chef_master',    category:'chef', duration:'permanent', tier:'gold',    label:'Mutfak Şefi',        desc:'70 tarif paylaşarak mutfağın ustası ol. Kalıcı rozet.',                     icon:'solar:chef-hat-bold',         target:70,  metric:'total_recipes',  persistent:true },
  { id:'chef_legend',    category:'chef', duration:'permanent', tier:'diamond', label:'Efsane Şef',          desc:'150 tarif paylaşarak mutfak efsanesi ol. Kalıcı rozet.',                  icon:'solar:chef-hat-heart-bold',   target:150, metric:'total_recipes',  persistent:true },
  { id:'yearly_gourmet', category:'yearly', duration:'yearly', tier:'gold',     label:'Yılın Gurmesi',      desc:'Bir yılda 200+ sipariş vererek yılın gurmesi ol. Yıllık yenilenir.',       icon:'solar:cup-first-bold',        target:200, metric:'yearly_orders' },
  { id:'yearly_explorer',category:'yearly', duration:'yearly', tier:'silver',   label:'Kaşif Ruhu',          desc:'Daha önce gidilmemiş bir işletmeden ilk siparişi sen ver.',                icon:'solar:planet-bold',           target:1,   metric:'yearly_first_discovery' }
];

var USER_ACHIEVEMENT_CATEGORIES = [
  { id:'social',   duration:'weekly',    label:'Sosyal Etkileşim',   sub:'Haftalık Paylaşım',         icon:'solar:users-group-two-rounded-bold', color:'#3B82F6' },
  { id:'critic',   duration:'weekly',    label:'Eleştirmen',          sub:'Haftalık Yorum',            icon:'solar:pen-bold',                     color:'#EC4899' },
  { id:'order',    duration:'weekly',    label:'Lezzet Kaşifi',       sub:'Haftalık Sipariş',          icon:'solar:compass-bold',                 color:'#F59E0B' },
  { id:'night',    duration:'weekly',    label:'Gece Kuşu',           sub:'00:00-05:00 Siparişleri',   icon:'solar:moon-stars-bold',              color:'#6366F1' },
  { id:'loyal',    duration:'monthly',   label:'Müdavim',             sub:'Aynı işletmeden aylık',     icon:'solar:home-2-bold',                  color:'#10B981' },
  { id:'donation', duration:'monthly',   label:'Kalbi Güzel',         sub:'Aylık öğrenci bağışı',      icon:'solar:hand-heart-bold',              color:'#EF4444' },
  { id:'chef',     duration:'permanent', label:'Mutfak Şefi',         sub:'Tarif paylaşımı',           icon:'solar:chef-hat-bold',                color:'#8B5CF6' },
  { id:'yearly',   duration:'yearly',    label:'Yıllık Başarımlar',   sub:'Yıllık yenilenen rozetler', icon:'solar:calendar-mark-bold',           color:'#0EA5E9' }
];

/* Mevcut kullanıcının progress + koleksiyonu */
var USER_ACHIEVEMENT_PROGRESS = {
  // Haftalık sayaçlar (her Pazartesi 00:00 sıfırlanır)
  weekly_posts:             6,   // Bronz ve Gümüş tamamlandı, Altın için 1 eksik
  weekly_reviews:           4,   // Bronz ve Gümüş tamamlandı, Altın için 1 eksik
  weekly_orders:            3,   // Bronz tamam, Gümüş için 2 eksik
  weekly_night_orders:      1,
  // Aylık sayaçlar (her ayın 1'inde sıfırlanır)
  monthly_same_biz_orders:  4,   // Seviye 1 tamam
  monthly_donation_tokens:  250, // Seviye 1 tamam, Seviye 2 için 150 eksik
  // Kalıcı
  total_recipes:            72,  // Mutfak Şefi yeni kazanıldı
  // Yıllık (yıl başında sıfırlanır)
  yearly_orders:            142, // Yılın Gurmesi için 58 eksik
  yearly_first_discovery:   0,
  // Periyod başlangıç tarihleri
  weekStart:  '2026-04-14T00:00:00',
  monthStart: '2026-04-01T00:00:00',
  yearStart:  '2026-01-01T00:00:00',
  earnedIds: ['social_bronze','social_silver','critic_bronze','critic_silver','order_bronze','loyal_l1','donation_l1','chef_master']
};

/* ═══════════════════════════════════════════════════════════
   RESERVATIONS — Rezervasyon Yönetimi (Kullanıcı)
   ═══════════════════════════════════════════════════════════ */

// Rezervasyon yapılabilen işletmeler (masa krokisi + token + kapalı günler)
var RESERVATION_VENUES = [
  {
    id: 'v_burgerlab',
    name: 'Burger Lab',
    district: 'Kadıköy, İstanbul',
    img: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=160&h=160&fit=crop',
    rating: 4.7,
    tokenCost: 50,       // Rezervasyon başına bloke edilecek token
    closedDays: [1],     // 0=Pazar, 1=Pzt — haftada 1 gün kapalı
    fullDates: ['2026-04-19', '2026-04-25'],  // kapasitesi dolu günler
    tables: [
      { id: 'T1', label: 'Masa 1', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T2', label: 'Masa 2', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T3', label: 'Masa 3', capacity: 4, area: 'Salon',   status: 'occupied' },
      { id: 'T4', label: 'Masa 4', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T5', label: 'Masa 5', capacity: 6, area: 'Bahçe',   status: 'available' },
      { id: 'T6', label: 'Masa 6', capacity: 2, area: 'Bahçe',   status: 'available' },
      { id: 'T7', label: 'Masa 7', capacity: 4, area: 'Bahçe',   status: 'occupied' },
      { id: 'T8', label: 'Masa 8', capacity: 8, area: 'VIP',     status: 'available' }
    ]
  },
  {
    id: 'v_kebapcihaci',
    name: 'Kebapçı Hacı',
    district: 'Fatih, İstanbul',
    img: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=160&h=160&fit=crop',
    rating: 4.9,
    tokenCost: 75,
    closedDays: [],
    fullDates: ['2026-04-20'],
    tables: [
      { id: 'T1', label: 'Masa 1', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T2', label: 'Masa 2', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T3', label: 'Masa 3', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T4', label: 'Masa 4', capacity: 6, area: 'Salon',   status: 'occupied' },
      { id: 'T5', label: 'Masa 5', capacity: 8, area: 'Teras',   status: 'available' },
      { id: 'T6', label: 'Masa 6', capacity: 4, area: 'Teras',   status: 'available' }
    ]
  },
  {
    id: 'v_pizzahouse',
    name: 'Pizza House',
    district: 'Beşiktaş, İstanbul',
    img: 'https://i.pravatar.cc/160?img=60',
    rating: 4.5,
    tokenCost: 40,
    closedDays: [2],
    fullDates: [],
    tables: [
      { id: 'T1', label: 'Masa 1', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T2', label: 'Masa 2', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T3', label: 'Masa 3', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T4', label: 'Masa 4', capacity: 4, area: 'Bahçe',   status: 'available' },
      { id: 'T5', label: 'Masa 5', capacity: 6, area: 'Bahçe',   status: 'occupied' }
    ]
  },
  {
    id: 'v_sushibar',
    name: 'Sushi Bar',
    district: 'Şişli, İstanbul',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=160&h=160&fit=crop',
    rating: 4.8,
    tokenCost: 120,
    closedDays: [],
    fullDates: ['2026-04-22', '2026-04-23'],
    tables: [
      { id: 'T1', label: 'Masa 1', capacity: 2, area: 'Bar',     status: 'available' },
      { id: 'T2', label: 'Masa 2', capacity: 2, area: 'Bar',     status: 'available' },
      { id: 'T3', label: 'Masa 3', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T4', label: 'Masa 4', capacity: 6, area: 'VIP',     status: 'available' },
      { id: 'T5', label: 'Masa 5', capacity: 8, area: 'VIP',     status: 'occupied' }
    ]
  },
  {
    id: 'v_tatlici',
    name: 'Şekerci Atelier',
    district: 'Bebek, İstanbul',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=160&h=160&fit=crop',
    rating: 4.6,
    tokenCost: 30,
    closedDays: [1],
    fullDates: [],
    tables: [
      { id: 'T1', label: 'Masa 1', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T2', label: 'Masa 2', capacity: 2, area: 'Salon',   status: 'available' },
      { id: 'T3', label: 'Masa 3', capacity: 4, area: 'Salon',   status: 'available' },
      { id: 'T4', label: 'Masa 4', capacity: 4, area: 'Pencere', status: 'available' }
    ]
  }
];

// Kullanıcının rezervasyonları
// status: 'pending' (bekliyor) | 'confirmed' (onaylı) | 'completed' (tamamlandı) | 'cancelled' (iptal)
var USER_RESERVATIONS = [
  {
    id: 'res_001',
    venueId: 'v_burgerlab', venueName: 'Burger Lab', district: 'Kadıköy',
    date: '2026-04-24', time: '20:00', guests: 2,
    tableId: 'T5', tableLabel: 'Masa 5', area: 'Bahçe',
    tokenBlocked: 50,
    status: 'confirmed',
    createdAt: '2026-04-14T10:25:00'
  },
  {
    id: 'res_002',
    venueId: 'v_kebapcihaci', venueName: 'Kebapçı Hacı', district: 'Fatih',
    date: '2026-04-27', time: '19:30', guests: 4,
    tableId: 'T2', tableLabel: 'Masa 2', area: 'Salon',
    tokenBlocked: 75,
    status: 'confirmed',
    createdAt: '2026-04-16T14:12:00'
  },
  {
    id: 'res_003',
    venueId: 'v_sushibar', venueName: 'Sushi Bar', district: 'Şişli',
    date: '2026-04-19', time: '21:00', guests: 2,
    tableId: 'T1', tableLabel: 'Masa 1', area: 'Bar',
    tokenBlocked: 120,
    status: 'pending',
    createdAt: '2026-04-17T18:44:00'
  },
  // Geçmiş
  {
    id: 'res_101',
    venueId: 'v_pizzahouse', venueName: 'Pizza House', district: 'Beşiktaş',
    date: '2026-04-10', time: '20:30', guests: 3,
    tableId: 'T3', tableLabel: 'Masa 3', area: 'Salon',
    tokenBlocked: 40,
    status: 'completed',
    createdAt: '2026-04-05T11:30:00'
  },
  {
    id: 'res_102',
    venueId: 'v_tatlici', venueName: 'Şekerci Atelier', district: 'Bebek',
    date: '2026-04-08', time: '16:00', guests: 2,
    tableId: 'T2', tableLabel: 'Masa 2', area: 'Salon',
    tokenBlocked: 30,
    status: 'cancelled',
    cancelReason: 'Kullanıcı iptali · <24sa · token işletmeye aktarıldı',
    createdAt: '2026-04-07T09:15:00'
  },
  {
    id: 'res_103',
    venueId: 'v_burgerlab', venueName: 'Burger Lab', district: 'Kadıköy',
    date: '2026-03-28', time: '21:00', guests: 4,
    tableId: 'T4', tableLabel: 'Masa 4', area: 'Salon',
    tokenBlocked: 50,
    status: 'completed',
    createdAt: '2026-03-20T15:00:00'
  }
];

/* ═══════════════════════════════════════════════════════════
   SOCIAL FINANCE — Grup İşlemleri & Hesap Bölme
   ═══════════════════════════════════════════════════════════ */

// Kullanıcının arkadaşları (grup davetlerinden)
var USER_FRIENDS = [
  { id:'u_me',      name:'Furkan (Sen)',     avatar:'https://i.pravatar.cc/80?img=12', isMe:true  },
  { id:'u_muh',     name:'M. Salih',         avatar:'https://i.pravatar.cc/80?img=53', isMe:false },
  { id:'u_zeynep',  name:'Zeynep K.',        avatar:'https://i.pravatar.cc/80?img=47', isMe:false },
  { id:'u_burak',   name:'Burak Y.',         avatar:'https://i.pravatar.cc/80?img=33', isMe:false },
  { id:'u_elif',    name:'Elif D.',          avatar:'https://i.pravatar.cc/80?img=48', isMe:false },
  { id:'u_can',     name:'Can Ö.',           avatar:'https://i.pravatar.cc/80?img=15', isMe:false },
  { id:'u_selin',   name:'Selin A.',         avatar:'https://i.pravatar.cc/80?img=36', isMe:false }
];

// Aktif grup siparişi (ongoing)
var ACTIVE_GROUP_ORDER = {
  id:'grp_01',
  code:'FRK-9842',
  name:'Akşam Yemeği',
  venue:'Burger Lab',
  venueDistrict:'Kadıköy',
  createdAt:'2026-04-18T19:42:00',
  leaderId:'u_me',
  paymentMode:'split',       // 'split' (herkes kendi) | 'leader' (lider hepsini öder)
  phase:'lobby',             // 'lobby' | 'payment' | 'completed'
  members:['u_me','u_muh','u_zeynep','u_burak'],
  // Üye başına durum (ready + active/left + joinedAt)
  memberStates:{
    u_me:     { ready:false, status:'active', joinedAt:'2026-04-18T19:42:00' },
    u_muh:    { ready:true,  status:'active', joinedAt:'2026-04-18T19:43:00' },
    u_zeynep: { ready:false, status:'active', joinedAt:'2026-04-18T19:44:00' },
    u_burak:  { ready:true,  status:'active', joinedAt:'2026-04-18T19:45:00' }
  },
  items:[
    { id:'it_01', name:'Big Burger Menu',    price:145, qty:1, addedBy:'u_me',     addedAt:'19:43' },
    { id:'it_02', name:'Chicken Burger',     price:125, qty:1, addedBy:'u_muh',    addedAt:'19:44' },
    { id:'it_03', name:'Patates Kızartması', price: 45, qty:2, addedBy:'u_zeynep', addedAt:'19:45' },
    { id:'it_04', name:'Cola 330ml',         price: 25, qty:3, addedBy:'u_burak',  addedAt:'19:46' },
    { id:'it_05', name:'Cheesecake',         price: 85, qty:1, addedBy:'u_me',     addedAt:'19:48' }
  ]
};

// Aktif masa (QR ile bağlandığı) — Hesap Bölme akışı için
var ACTIVE_TABLE_BILL = {
  tableNo:5,
  venue:'La Pasta',
  district:'Beşiktaş',
  sessionStart:'20:05',
  items:[
    { id:'bi_01', name:'Carbonara',            price:185, qty:1, consumers:['u_me'] },
    { id:'bi_02', name:'Margherita Pizza',     price:165, qty:1, consumers:['u_zeynep'] },
    { id:'bi_03', name:'Sezar Salata',         price: 95, qty:1, consumers:['u_me','u_zeynep'] },
    { id:'bi_04', name:'Ev Limonatası',        price: 45, qty:2, consumers:['u_me','u_elif'] },
    { id:'bi_05', name:'Tiramisu',             price: 85, qty:1, consumers:['u_elif'] }
  ],
  people:['u_me','u_zeynep','u_elif'],   // masadaki kişiler
  paid:185                                  // şimdiye kadar ödenen
};

// Kullanıcı token + kart bakiyesi
var USER_WALLET = {
  tokens: 240,        // 1 token = ₺1
  cards: [
    { id:'c_01', brand:'Visa',       last4:'4821', primary:true  },
    { id:'c_02', brand:'Mastercard', last4:'9134', primary:false }
  ]
};

// Geçmiş gruplar
var PAST_GROUP_ORDERS = [
  {
    id:'grp_hist_01', code:'OFS-7721', name:'Ofis Cuma Grubu',
    venue:'Kebapçı Hacı', lastUsed:'2026-04-11T12:30:00',
    memberCount:5, total:485, frequent:true
  },
  {
    id:'grp_hist_02', code:'MAC-4402', name:'Maç Akşamı',
    venue:'Pizza House', lastUsed:'2026-04-06T20:15:00',
    memberCount:4, total:340, frequent:true
  },
  {
    id:'grp_hist_03', code:'FRT-3310', name:'Fatih Toplantı',
    venue:'Burger Lab', lastUsed:'2026-03-28T13:00:00',
    memberCount:6, total:612, frequent:false
  },
  {
    id:'grp_hist_04', code:'DFM-8801', name:'Doğum Günü',
    venue:'Sushi Bar', lastUsed:'2026-03-15T21:00:00',
    memberCount:8, total:1280, frequent:false
  }
];

/* ═══════════════════════════════════════════════════════════
   WALLET — Cüzdan (token, işlem geçmişi, share)
   ═══════════════════════════════════════════════════════════ */

// Admin-paramı (günlük share limiti — admin panelinden yönetilebilir)
var WALLET_CONFIG = {
  dailyShareLimit: 1000,    // Günde max 1000 token gönderilebilir
  minShare: 10,
  maxSingleShare: 500,
  loadMin: 50,
  loadPresets: [100, 250, 500, 1000, 2500],
  exchangeRate: 1.0         // 1 Token = 1 TL
};

// Karşılıklı takipleşen arkadaşlar (Token Share için uygun)
var USER_MUTUAL_FRIENDS = [
  { id:'mf_01', name:'M. Salih',       handle:'@msalih',     avatar:'https://i.pravatar.cc/80?img=53', mutual:true,  badge:null     },
  { id:'mf_02', name:'Zeynep K.',      handle:'@zeynepk',    avatar:'https://i.pravatar.cc/80?img=47', mutual:true,  badge:'⭐'     },
  { id:'mf_03', name:'Burak Y.',       handle:'@burakyz',    avatar:'https://i.pravatar.cc/80?img=33', mutual:true,  badge:null     },
  { id:'mf_04', name:'Elif D.',        handle:'@elifd',      avatar:'https://i.pravatar.cc/80?img=48', mutual:true,  badge:null     },
  { id:'mf_05', name:'Can Ö.',         handle:'@cano',       avatar:'https://i.pravatar.cc/80?img=15', mutual:true,  badge:'⭐'     },
  { id:'mf_06', name:'Selin A.',       handle:'@selina',     avatar:'https://i.pravatar.cc/80?img=36', mutual:true,  badge:null     },
  { id:'mf_07', name:'Mehmet Ö.',      handle:'@mehmetoz',   avatar:'https://i.pravatar.cc/80?img=68', mutual:false, badge:null     },
  { id:'mf_08', name:'Deniz K.',       handle:'@denizk',     avatar:'https://i.pravatar.cc/80?img=29', mutual:true,  badge:null     }
];

// İşlem geçmişi — kronolojik (yeni üstte)
// direction: 'in' (gelen) | 'out' (giden)
// source: 'load' | 'share' | 'order' | 'reservation' | 'premium' | 'refund' | 'system' | 'achievement'
var WALLET_TRANSACTIONS = [
  {
    id:'tx_041', direction:'out', source:'share', amount:50,
    counterparty:'Zeynep K.', counterpartyAvatar:'https://i.pravatar.cc/80?img=47',
    note:'Dünkü yemek için 🍕',
    balanceBefore:290, balanceAfter:240,
    date:'2026-04-18T11:32:00', channel:'Token Share'
  },
  {
    id:'tx_040', direction:'in', source:'achievement', amount:25,
    counterparty:'Başarılar', counterpartyAvatar:null,
    note:'Gece Kuşu rozeti hediyesi',
    balanceBefore:265, balanceAfter:290,
    date:'2026-04-17T23:10:00', channel:'Sistem'
  },
  {
    id:'tx_039', direction:'out', source:'reservation', amount:50,
    counterparty:'Burger Lab', counterpartyAvatar:'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&h=80&fit=crop',
    note:'Rezervasyon bloke · Masa 5',
    balanceBefore:315, balanceAfter:265,
    date:'2026-04-17T14:25:00', channel:'Rezervasyon'
  },
  {
    id:'tx_038', direction:'in', source:'load', amount:250,
    counterparty:'Yükleme', counterpartyAvatar:null,
    note:'Kredi kartı · Visa •••• 4821',
    balanceBefore:65, balanceAfter:315,
    date:'2026-04-16T18:50:00', channel:'Kart Yükleme'
  },
  {
    id:'tx_037', direction:'out', source:'order', amount:85,
    counterparty:'Kebapçı Hacı', counterpartyAvatar:'https://i.pravatar.cc/80?img=58',
    note:'İskender Porsiyon · Sipariş #4201',
    balanceBefore:150, balanceAfter:65,
    date:'2026-04-15T20:18:00', channel:'Sipariş'
  },
  {
    id:'tx_036', direction:'in', source:'share', amount:50,
    counterparty:'M. Salih', counterpartyAvatar:'https://i.pravatar.cc/80?img=53',
    note:'Maç akşamı ödeme 🏆',
    balanceBefore:100, balanceAfter:150,
    date:'2026-04-13T22:05:00', channel:'Token Share'
  },
  {
    id:'tx_035', direction:'out', source:'premium', amount:99,
    counterparty:'Premium', counterpartyAvatar:null,
    note:'Premium üyelik · 1 ay',
    balanceBefore:199, balanceAfter:100,
    date:'2026-04-12T09:30:00', channel:'Abonelik'
  },
  {
    id:'tx_034', direction:'in', source:'refund', amount:45,
    counterparty:'Pizza House', counterpartyAvatar:null,
    note:'İade · Sipariş #4189 iptal',
    balanceBefore:154, balanceAfter:199,
    date:'2026-04-10T13:22:00', channel:'İade'
  },
  {
    id:'tx_033', direction:'out', source:'order', amount:120,
    counterparty:'La Pasta', counterpartyAvatar:null,
    note:'Carbonara · Sipariş #4175',
    balanceBefore:274, balanceAfter:154,
    date:'2026-04-08T20:15:00', channel:'Sipariş'
  },
  {
    id:'tx_032', direction:'in', source:'load', amount:200,
    counterparty:'Yükleme', counterpartyAvatar:null,
    note:'Kredi kartı · Mastercard •••• 9134',
    balanceBefore:74, balanceAfter:274,
    date:'2026-04-05T11:40:00', channel:'Kart Yükleme'
  }
];

// Günlük share kullanımı (bugün gönderilen toplam)
var WALLET_DAILY_SHARED = 50;   // WALLET_CONFIG.dailyShareLimit üstü engellenir

/* ═══════════════════════════════════════════════════════════
   ACCOUNT DELETION — Hesap Silme / Veda Akışı
   Kayıp önleme sayfası · anket · 30 gün askıya alma
   ═══════════════════════════════════════════════════════════ */

// Kullanıcıyı ikna eden duygusal notlar (sayfa boyunca dağılır)
var DELETE_RETENTION_MESSAGES = [
  {
    icon:'solar:chef-hat-heart-bold', tone:'#F97316',
    title:'500 tarif seni bekliyor',
    body:'Henüz tatmadığın onlarca şefin özel tarifi koleksiyonumuzda.'
  },
  {
    icon:'solar:cup-star-bold', tone:'#F59E0B',
    title:'Rozetlerini kaybedeceksin',
    body:'Kazandığın 4 rozet ve ilerlediğin haftalık görevler silinecek.'
  },
  {
    icon:'solar:users-group-rounded-bold', tone:'#EC4899',
    title:'Arkadaşların seni özleyecek',
    body:'Ortak grup siparişlerin ve takipleştiğin 7 arkadaşın var.'
  },
  {
    icon:'solar:calendar-mark-bold', tone:'#8B5CF6',
    title:'Aktif 3 rezervasyonun var',
    body:'İptal etmediğin rezervasyonlarda token blokesi yanabilir.'
  },
  {
    icon:'solar:medal-ribbons-star-bold', tone:'#10B981',
    title:'6 ay emek verdin',
    body:'Uygulamadaki 248 sipariş ve 72 tarif kaydın geçmişinde.'
  }
];

// "Neden gidiyorsun?" anketi — admin-incident'a feed
var DELETE_SURVEY_OPTIONS = [
  { id:'slow',         icon:'solar:clock-circle-linear',    label:'Uygulama yavaş çalışıyor' },
  { id:'not_found',    icon:'solar:magnifer-linear',        label:'Aradığımı bulamıyorum' },
  { id:'notif',        icon:'solar:bell-off-linear',        label:'Çok bildirim geliyor' },
  { id:'expensive',    icon:'solar:tag-price-linear',       label:'Fiyatlar yüksek' },
  { id:'few_options',  icon:'solar:shop-linear',            label:'Yeterli işletme yok' },
  { id:'delivery',     icon:'solar:delivery-linear',        label:'Teslimat sorunları yaşadım' },
  { id:'duplicate',    icon:'solar:copy-linear',            label:'Başka hesabım var' },
  { id:'other',        icon:'solar:chat-round-line-linear', label:'Diğer / belirtmek istemiyorum' }
];

// Kullanıcının silme durumu (null = aktif; obje = askıya alındı)
var ACCOUNT_DELETION_STATE = null;
// Örnek aktif askı: { scheduledAt: '2026-04-18T12:00:00', deleteAt: '2026-05-18T12:00:00', reasons:['slow','notif'], note:'' }

