/* ═══════════════════════════════════════════════════════════
   ADMIN-DATA.JS — Platform-wide seed data for Admin Panel
   ═══════════════════════════════════════════════════════════ */

/* ── Platform Stats ── */
var ADMIN_STATS = {
  totalUsers: 48520,
  activeUsers: 31200,
  totalBusinesses: 1842,
  activeBusinesses: 1456,
  totalBranches: 3210,
  totalOrders: 285400,
  monthlyOrders: 34200,
  dailyOrders: 1180,
  totalRevenue: 42500000,
  monthlyRevenue: 5120000,
  dailyRevenue: 172000,
  avgOrderValue: 148.5,
  platformCommission: 12.4,
  totalTokensSold: 18500000,
  activeTokenBalance: 4200000,
  supportTicketsOpen: 23,
  avgDeliveryTime: 28
};

/* ── Weekly Trend (last 7 days) ── */
var ADMIN_WEEKLY_TREND = [
  { day: 'Pzt', orders: 980,  revenue: 145200 },
  { day: 'Sal', orders: 1050, revenue: 155400 },
  { day: 'Çar', orders: 1120, revenue: 165800 },
  { day: 'Per', orders: 1200, revenue: 177600 },
  { day: 'Cum', orders: 1450, revenue: 214600 },
  { day: 'Cmt', orders: 1680, revenue: 248640 },
  { day: 'Paz', orders: 1520, revenue: 224960 }
];

/* ── Platform Businesses (top 15) — 360° enriched ── */
var ADMIN_BUSINESSES = [
  { id:'bz1', name:'Lezzet Mutfak', owner:'Ali Yılmaz', ownerPhone:'+905551001001', branches:2, branchList:['Kadıköy','Beşiktaş'], rating:4.7, status:'active', plan:'premium', planExpiry:'2026-09-15', monthlyOrders:820, commission:9, tokenBalance:5640, joinDate:'2025-06-15', city:'İstanbul',
    menu:[{cat:'Ana Yemek',items:['Adana Kebap','Kuzu Tandır','İskender']},{cat:'Çorba',items:['Mercimek','Ezogelin']},{cat:'Tatlı',items:['Künefe','Kadayıf']}],
    tables:8, activeOrders:3, totalOrders:4200,
    staff:[{name:'Ali Yılmaz',role:'owner'},{name:'Sevgi Kara',role:'manager'},{name:'Emre Demir',role:'chef'},{name:'Ahmet Genç',role:'waiter'},{name:'Yusuf Can',role:'courier'}],
    shiftLogs:[{date:'2026-04-15',desc:'Emre Demir: Gece → Gündüz vardiya değişimi'},{date:'2026-04-12',desc:'Ahmet Genç: İzin talebi onaylandı (14-16 Nisan)'}],
    walletHistory:[{date:'2026-04-16T10:00:00',type:'commission',amount:-40,desc:'Sipariş #104281 komisyon'},{date:'2026-04-15T08:00:00',type:'topup',amount:2000,desc:'Token yükleme (2000 TL paket)'},{date:'2026-04-14T14:00:00',type:'refund',amount:112,desc:'İptal iadesi #104272'}] },
  { id:'bz2', name:'Pide Palace', owner:'Mehmet Demir', ownerPhone:'+905551002002', branches:3, branchList:['Beşiktaş','Kadıköy','Üsküdar'], rating:4.9, status:'active', plan:'premium', planExpiry:'2027-01-20', monthlyOrders:1250, commission:7, tokenBalance:12400, joinDate:'2025-03-20', city:'İstanbul',
    menu:[{cat:'Pide',items:['Kuşbaşılı','Kaşarlı Sucuklu','Karışık']},{cat:'Salata',items:['Karışık Salata','Çoban Salata']},{cat:'İçecek',items:['Ayran','Şalgam']}],
    tables:12, activeOrders:2, totalOrders:6800,
    staff:[{name:'Mehmet Demir',role:'owner'},{name:'Hakan Yıldız',role:'manager'},{name:'Fatih Kılıç',role:'chef'},{name:'Deniz Polat',role:'chef'},{name:'Gizem Ak',role:'waiter'},{name:'Murat Koç',role:'courier'},{name:'Selim Aydın',role:'courier'}],
    shiftLogs:[{date:'2026-04-16',desc:'Fatih Kılıç: Öğle vardiyası başladı'},{date:'2026-04-14',desc:'Selim Aydın: Hasta raporu (3 gün)'}],
    walletHistory:[{date:'2026-04-16T12:00:00',type:'commission',amount:-23.8,desc:'Sipariş #104280 komisyon'},{date:'2026-04-16T08:00:00',type:'topup',amount:5000,desc:'Token yükleme (5000 TL paket)'}] },
  { id:'bz3', name:'Burger Lab', owner:'Zeynep Kaya', ownerPhone:'+905551003003', branches:1, branchList:['Kızılay'], rating:4.5, status:'active', plan:'free', planExpiry:null, monthlyOrders:430, commission:9, tokenBalance:2100, joinDate:'2025-09-10', city:'Ankara',
    menu:[{cat:'Burger',items:['Classic','Double Cheese','Veggie']},{cat:'Yan Ürün',items:['Patates','Soğan Halkası']},{cat:'İçecek',items:['Milkshake','Limonata']}],
    tables:6, activeOrders:1, totalOrders:2100,
    staff:[{name:'Zeynep Kaya',role:'owner'},{name:'Can Yılmaz',role:'chef'},{name:'Derya Su',role:'waiter'}],
    shiftLogs:[],
    walletHistory:[{date:'2026-04-16T12:30:00',type:'commission',amount:-16.65,desc:'Sipariş #104279 komisyon'}] },
  { id:'bz4', name:'Sushi Master', owner:'Kemal Aksoy', ownerPhone:'+905551004004', branches:2, branchList:['Alsancak','Karşıyaka'], rating:4.8, status:'active', plan:'premium', planExpiry:'2026-12-01', monthlyOrders:680, commission:7, tokenBalance:8900, joinDate:'2025-04-01', city:'İzmir',
    menu:[{cat:'Roll',items:['Dragon Roll','California','Spicy Tuna']},{cat:'Çorba',items:['Miso Çorba']},{cat:'Apetizer',items:['Edamame','Gyoza']},{cat:'Sashimi',items:['Somon Set','Mix Set']}],
    tables:10, activeOrders:1, totalOrders:3500,
    staff:[{name:'Kemal Aksoy',role:'owner'},{name:'Yuki Tanaka',role:'chef'},{name:'Aslı Demir',role:'manager'},{name:'Ozan Kılıç',role:'waiter'},{name:'Selin Er',role:'waiter'}],
    shiftLogs:[{date:'2026-04-15',desc:'Yuki Tanaka: Akşam → Gece vardiya uzatması'}],
    walletHistory:[{date:'2026-04-16T12:15:00',type:'commission',amount:-36.4,desc:'Sipariş #104278 komisyon'},{date:'2026-04-13T09:00:00',type:'topup',amount:3000,desc:'Token yükleme (3000 TL paket)'}] },
  { id:'bz5', name:'Çiğ Köfte Express', owner:'Fatma Şahin', ownerPhone:'+905551005005', branches:5, branchList:['Kadıköy','Ataşehir','Beylikdüzü','Pendik','Tuzla'], rating:4.3, status:'active', plan:'premium', planExpiry:'2026-07-12', monthlyOrders:2100, commission:11, tokenBalance:15300, joinDate:'2025-01-12', city:'İstanbul',
    menu:[{cat:'Çiğ Köfte',items:['Dürüm','Porsiyon','Lavaşlı']},{cat:'İçecek',items:['Şalgam','Ayran','Nar Suyu']}],
    tables:4, activeOrders:0, totalOrders:11000,
    staff:[{name:'Fatma Şahin',role:'owner'},{name:'Hüseyin Ak',role:'manager'},{name:'Elif Su',role:'coordinator'},{name:'Murat Kaya',role:'chef'},{name:'Burak Er',role:'chef'},{name:'Gül Demir',role:'cashier'},{name:'Ahmet Polat',role:'courier'},{name:'Selim Genç',role:'courier'}],
    shiftLogs:[{date:'2026-04-16',desc:'Burak Er: Kadıköy → Ataşehir transfer'},{date:'2026-04-15',desc:'Gül Demir: Fazla mesai onaylandı'}],
    walletHistory:[{date:'2026-04-16T11:50:00',type:'commission',amount:-10.45,desc:'Sipariş #104277 komisyon'},{date:'2026-04-16T08:00:00',type:'topup',amount:5000,desc:'Token yükleme (5000 TL paket)'}] },
  { id:'bz6', name:'Pizza Napoli', owner:'Emre Öztürk', ownerPhone:'+905551006006', branches:1, branchList:['Nilüfer'], rating:3.8, status:'active', plan:'free', planExpiry:null, monthlyOrders:210, commission:13, tokenBalance:890, joinDate:'2025-11-05', city:'Bursa',
    menu:[{cat:'Pizza',items:['Margherita','Karışık','Sucuklu']},{cat:'Makarna',items:['Bolonez']},{cat:'İçecek',items:['Cola','Fanta']}],
    tables:5, activeOrders:0, totalOrders:980,
    staff:[{name:'Emre Öztürk',role:'owner'},{name:'Merve Kara',role:'chef'}],
    shiftLogs:[],
    walletHistory:[{date:'2026-04-16T11:10:00',type:'refund',amount:80,desc:'Kullanıcı iptali iadesi #104275'}] },
  { id:'bz7', name:'Waffle House', owner:'Selin Aydın', ownerPhone:'+905551007007', branches:2, branchList:['Bağdat Cad','Caddebostan'], rating:4.6, status:'active', plan:'premium', planExpiry:'2026-10-22', monthlyOrders:560, commission:9, tokenBalance:4200, joinDate:'2025-07-22', city:'İstanbul',
    menu:[{cat:'Waffle',items:['Çikolatalı','Meyveli','Karamelli']},{cat:'İçecek',items:['Türk Kahvesi','Çay','Filtre Kahve']}],
    tables:6, activeOrders:0, totalOrders:2800,
    staff:[{name:'Selin Aydın',role:'owner'},{name:'Cansu Yılmaz',role:'manager'},{name:'Ege Demir',role:'chef'},{name:'Ayşe Polat',role:'waiter'}],
    shiftLogs:[{date:'2026-04-14',desc:'Ege Demir: Gece vardiyası kapandı'}],
    walletHistory:[{date:'2026-04-16T09:30:00',type:'commission',amount:-10.8,desc:'Sipariş #104271 komisyon'}] },
  { id:'bz8', name:'Tantuni Evi', owner:'Hasan Çelik', ownerPhone:'+905551008008', branches:1, branchList:['Yenişehir'], rating:4.1, status:'suspended', plan:'free', planExpiry:null, monthlyOrders:0, commission:11, tokenBalance:50, joinDate:'2025-10-08', city:'Mersin',
    menu:[{cat:'Tantuni',items:['Tavuk Tantuni','Et Tantuni']},{cat:'İçecek',items:['Ayran']}],
    tables:3, activeOrders:0, totalOrders:650,
    staff:[{name:'Hasan Çelik',role:'owner'},{name:'Ali Kılıç',role:'chef'}],
    shiftLogs:[],
    walletHistory:[{date:'2026-03-15T10:00:00',type:'commission',amount:-5.5,desc:'Son sipariş komisyon'}] },
  { id:'bz9', name:'Kebapçı Hakkı', owner:'Hakkı Usta', ownerPhone:'+905551009009', branches:4, branchList:['Merkez','Şahinbey','Şehitkamil','Nizip'], rating:4.9, status:'active', plan:'premium', planExpiry:'2027-06-01', monthlyOrders:1800, commission:5.5, tokenBalance:22000, joinDate:'2024-12-01', city:'Gaziantep',
    menu:[{cat:'Kebap',items:['Adana','Beyti','Patlıcan','Ali Nazik','Ciğer']},{cat:'Pide',items:['Lahmacun']},{cat:'İçecek',items:['Ayran','Şıra','Şalgam']},{cat:'Tatlı',items:['Katmer','Fıstıklı Baklava']}],
    tables:20, activeOrders:5, totalOrders:14200,
    staff:[{name:'Hakkı Usta',role:'owner'},{name:'Mustafa Usta',role:'manager'},{name:'Osman Demir',role:'manager'},{name:'Kadir Avcı',role:'chef'},{name:'Tuncay Yılmaz',role:'chef'},{name:'Serkan Polat',role:'chef'},{name:'Elif Genç',role:'cashier'},{name:'Murat Çelik',role:'waiter'},{name:'Burak Ak',role:'waiter'},{name:'Cem Kılıç',role:'courier'},{name:'Selim Doğan',role:'courier'},{name:'Hakan Er',role:'courier'}],
    shiftLogs:[{date:'2026-04-16',desc:'Kadir Avcı: Merkez → Şahinbey transfer'},{date:'2026-04-15',desc:'Serkan Polat: Fazla mesai (2 saat)'},{date:'2026-04-14',desc:'Cem Kılıç: İzin (16-17 Nisan)'}],
    walletHistory:[{date:'2026-04-16T11:30:00',type:'commission',amount:-20.9,desc:'Sipariş #104276 komisyon'},{date:'2026-04-16T09:10:00',type:'commission',amount:-17.05,desc:'Sipariş #104265 komisyon'},{date:'2026-04-14T08:00:00',type:'topup',amount:10000,desc:'Token yükleme (10000 TL paket)'}] },
  { id:'bz10', name:'Vegan Kitchen', owner:'Deniz Yıldız', ownerPhone:'+905551010010', branches:1, branchList:['Kadıköy'], rating:4.4, status:'active', plan:'free', planExpiry:null, monthlyOrders:320, commission:11, tokenBalance:1600, joinDate:'2026-01-15', city:'İstanbul',
    menu:[{cat:'Bowl',items:['Buddha Bowl','Quinoa Bowl']},{cat:'Smoothie',items:['Yeşil Smoothie','Mango Smoothie']},{cat:'Tatlı',items:['Granola','Chia Puding']}],
    tables:4, activeOrders:0, totalOrders:980,
    staff:[{name:'Deniz Yıldız',role:'owner'},{name:'Naz Demir',role:'chef'},{name:'Arda Koç',role:'waiter'}],
    shiftLogs:[],
    walletHistory:[{date:'2026-04-16T08:15:00',type:'commission',amount:-23.1,desc:'Sipariş #104270 komisyon'}] },
  { id:'bz11', name:'Balıkçı Rıza', owner:'Rıza Kaptan', ownerPhone:'+905551011011', branches:1, branchList:['Merkez'], rating:4.2, status:'pending', plan:'free', planExpiry:null, monthlyOrders:0, commission:15, tokenBalance:0, joinDate:'2026-04-10', city:'Trabzon',
    menu:[{cat:'Balık',items:['Hamsi Tava','Levrek Izgara','Karides Güveç']},{cat:'Meze',items:['Deniz Böreği','Ahtapot Salata']}],
    tables:6, activeOrders:0, totalOrders:0,
    staff:[{name:'Rıza Kaptan',role:'owner'}],
    shiftLogs:[],
    walletHistory:[] },
  { id:'bz12', name:'Dönerci Baba', owner:'İbrahim Koç', ownerPhone:'+905551012012', branches:3, branchList:['Çankaya','Keçiören','Mamak'], rating:4.6, status:'active', plan:'premium', planExpiry:'2026-11-18', monthlyOrders:950, commission:9, tokenBalance:7800, joinDate:'2025-05-18', city:'Ankara',
    menu:[{cat:'Döner',items:['Tombik','Dürüm','Porsiyon İskender']},{cat:'Çorba',items:['Mercimek','Tavuk']},{cat:'İçecek',items:['Ayran','Cola']}],
    tables:10, activeOrders:0, totalOrders:5200,
    staff:[{name:'İbrahim Koç',role:'owner'},{name:'Sevda Polat',role:'manager'},{name:'Kemal Genç',role:'chef'},{name:'Ayşe Er',role:'cashier'},{name:'Onur Kaya',role:'courier'}],
    shiftLogs:[{date:'2026-04-15',desc:'Kemal Genç: Çankaya → Keçiören transfer'}],
    walletHistory:[{date:'2026-04-16T10:20:00',type:'commission',amount:-13.05,desc:'Sipariş #104273 komisyon'},{date:'2026-04-16T10:05:00',type:'commission',amount:-20.25,desc:'Sipariş #104262 komisyon'}] },
  { id:'bz13', name:'Tatlıcı Nene', owner:'Ayşe Hanım', ownerPhone:'+905551013013', branches:2, branchList:['Beyoğlu','Nişantaşı'], rating:5.0, status:'active', plan:'premium', planExpiry:'2027-02-28', monthlyOrders:780, commission:5.5, tokenBalance:9500, joinDate:'2025-02-28', city:'İstanbul',
    menu:[{cat:'Tatlı',items:['Baklava','Sütlaç','Kazandibi','Aşure','Kemalpaşa']},{cat:'İçecek',items:['Türk Kahvesi','Çay','Sahlep']}],
    tables:8, activeOrders:0, totalOrders:4500,
    staff:[{name:'Ayşe Hanım',role:'owner'},{name:'Hülya Kaya',role:'manager'},{name:'Zeynep Çelik',role:'chef'},{name:'Gizem Su',role:'waiter'},{name:'Elif Koç',role:'waiter'}],
    shiftLogs:[{date:'2026-04-16',desc:'Zeynep Çelik: Öğle vardiyası başladı'}],
    walletHistory:[{date:'2026-04-16T10:40:00',type:'commission',amount:-14.85,desc:'Sipariş #104274 komisyon'},{date:'2026-04-16T08:40:00',type:'refund',amount:95,desc:'Kullanıcı iptali iadesi #104264'}] },
  { id:'bz14', name:'Kumpir Evi', owner:'Can Polat', ownerPhone:'+905551014014', branches:1, branchList:['Konyaaltı'], rating:3.2, status:'suspended', plan:'free', planExpiry:null, monthlyOrders:0, commission:15, tokenBalance:0, joinDate:'2025-12-20', city:'Antalya',
    menu:[{cat:'Kumpir',items:['Karışık','Sosisli','Vejetaryen']}],
    tables:3, activeOrders:0, totalOrders:320,
    staff:[{name:'Can Polat',role:'owner'}],
    shiftLogs:[],
    walletHistory:[] },
  { id:'bz15', name:'Makarna Dükkanı', owner:'Ece Yılmaz', ownerPhone:'+905551015015', branches:1, branchList:['Bornova'], rating:4.0, status:'active', plan:'free', planExpiry:null, monthlyOrders:280, commission:11, tokenBalance:1400, joinDate:'2026-02-05', city:'İzmir',
    menu:[{cat:'Makarna',items:['Bolonez','Alfredo','Arabiata']},{cat:'Tatlı',items:['Tiramisu','Panna Cotta']},{cat:'İçecek',items:['Limonata','Espresso']}],
    tables:5, activeOrders:0, totalOrders:840,
    staff:[{name:'Ece Yılmaz',role:'owner'},{name:'Serhat Kara',role:'chef'},{name:'Nisa Er',role:'waiter'}],
    shiftLogs:[],
    walletHistory:[{date:'2026-04-16T07:50:00',type:'commission',amount:-19.25,desc:'Sipariş #104269 komisyon'}] }
];

/* ── Platform Users (sample 12) — 360° enriched ── */
var ADMIN_USERS = [
  { id:'u1', name:'Furkan Şahin', email:'furkan@email.com', phone:'+905551234548', orders:47, spent:6850, status:'active', joinDate:'2025-03-10', city:'İstanbul', district:'Kadıköy', lastActive:'2026-04-16T14:00:00',
    height:178, weight:75, allergens:['Gluten','Fıstık'], healthNotes:'Laktozsuz tercih eder',
    walletBalance:5640, savedAddresses:['Kadıköy, Caferağa Mah. No:12','Beşiktaş, Sinanpaşa Mah. No:5'],
    followers:124, following:89, blocked:3,
    stories:[{id:'s1',date:'2026-04-16T10:00:00',expired:false,text:'Kahvaltı keyfi!'},{id:'s2',date:'2026-04-10T08:00:00',expired:true,text:'Hafta sonu brunch'}],
    posts:[{id:'p1',date:'2026-04-14T12:00:00',text:'Lezzet Mutfak\'ın Adana Kebabı muazzam!',likes:32},{id:'p2',date:'2026-04-02T18:00:00',text:'Yeni keşfim: Vegan Kitchen',likes:18}],
    comments:[{id:'c1',date:'2026-04-15T14:00:00',on:'Pide Palace',text:'Hamurun kıvamı mükemmel'}],
    isPremium:false },
  { id:'u2', name:'Elif Demir', email:'elif@email.com', phone:'+905552345678', orders:82, spent:12400, status:'active', joinDate:'2025-01-05', city:'Ankara', district:'Çankaya', lastActive:'2026-04-16T12:30:00',
    height:165, weight:58, allergens:['Süt Ürünleri'], healthNotes:'Vegan beslenme',
    walletBalance:12400, savedAddresses:['Çankaya, Kızılay Mah. No:8','Keçiören, Etlik Cad. No:22'],
    followers:312, following:201, blocked:1,
    stories:[{id:'s3',date:'2026-04-16T09:00:00',expired:false,text:'Öğle yemeği zamanı'}],
    posts:[{id:'p3',date:'2026-04-12T20:00:00',text:'Vegan Kitchen gerçekten harika',likes:45},{id:'p4',date:'2026-03-28T15:00:00',text:'Dönerci Baba\'da tombik döner yedim!',likes:27}],
    comments:[{id:'c2',date:'2026-04-13T11:00:00',on:'Burger Lab',text:'Vejetaryen burger ekleseniz süper olur'}],
    isPremium:true },
  { id:'u3', name:'Burak Yıldız', email:'burak@email.com', phone:'+905553456789', orders:23, spent:3200, status:'active', joinDate:'2025-08-22', city:'İzmir', district:'Bornova', lastActive:'2026-04-15T20:00:00',
    height:182, weight:85, allergens:[], healthNotes:'',
    walletBalance:2100, savedAddresses:['Bornova, Ege Mah. No:15'],
    followers:56, following:43, blocked:0,
    stories:[], posts:[{id:'p5',date:'2026-04-08T19:00:00',text:'Makarna Dükkanı favorim',likes:11}],
    comments:[], isPremium:false },
  { id:'u4', name:'Aylin Kara', email:'aylin@email.com', phone:'+905554567890', orders:156, spent:23400, status:'active', joinDate:'2024-11-18', city:'İstanbul', district:'Beşiktaş', lastActive:'2026-04-16T09:15:00',
    height:170, weight:62, allergens:['Kabuklu Deniz Ürünleri','Soya'], healthNotes:'Çölyak hastası',
    walletBalance:8900, savedAddresses:['Beşiktaş, Abbasağa Mah. No:3','Etiler, Nisbetiye Cad. No:18','Kadıköy, Moda Cad. No:7'],
    followers:520, following:310, blocked:5,
    stories:[{id:'s4',date:'2026-04-16T12:00:00',expired:false,text:'Sushi Master\'da öğle yemeği'},{id:'s5',date:'2026-04-14T19:00:00',expired:true,text:'Waffle House\'da tatlı'}],
    posts:[{id:'p6',date:'2026-04-15T11:00:00',text:'156. siparişim! Platform bağımlısı oldum',likes:89},{id:'p7',date:'2026-04-06T16:00:00',text:'Tatlıcı Nene baklavası efsane',likes:54}],
    comments:[{id:'c3',date:'2026-04-14T20:00:00',on:'Sushi Master',text:'Dragon Roll mükemmeldi'}],
    isPremium:true },
  { id:'u5', name:'Mert Özkan', email:'mert@email.com', phone:'+905555678901', orders:8, spent:960, status:'active', joinDate:'2026-03-01', city:'Bursa', district:'Nilüfer', lastActive:'2026-04-14T18:45:00',
    height:175, weight:72, allergens:[], healthNotes:'',
    walletBalance:890, savedAddresses:['Nilüfer, Beşevler Mah. No:9'],
    followers:12, following:28, blocked:0,
    stories:[], posts:[], comments:[], isPremium:false },
  { id:'u6', name:'Zehra Aydın', email:'zehra@email.com', phone:'+905556789012', orders:34, spent:5100, status:'banned', joinDate:'2025-06-12', city:'İstanbul', district:'Üsküdar', lastActive:'2026-03-20T10:00:00',
    height:163, weight:55, allergens:['Yumurta'], healthNotes:'',
    walletBalance:0, savedAddresses:['Üsküdar, Altunizade Mah. No:6'],
    followers:45, following:67, blocked:12,
    stories:[], posts:[{id:'p8',date:'2026-03-18T14:00:00',text:'Spam içerik',likes:0}],
    comments:[{id:'c4',date:'2026-03-19T10:00:00',on:'Tantuni Evi',text:'Hakaret içeren yorum'}],
    isPremium:false },
  { id:'u7', name:'Onur Çetin', email:'onur@email.com', phone:'+905557890123', orders:67, spent:9800, status:'active', joinDate:'2025-02-14', city:'Antalya', district:'Muratpaşa', lastActive:'2026-04-16T11:00:00',
    height:180, weight:80, allergens:['Susam'], healthNotes:'Diyabet (Tip 2), şekersiz menü tercih eder',
    walletBalance:4200, savedAddresses:['Muratpaşa, Lara Mah. No:14','Konyaaltı, Sarısu Mah. No:21'],
    followers:189, following:132, blocked:2,
    stories:[{id:'s6',date:'2026-04-15T18:00:00',expired:true,text:'Kebapçı Hakkı\'da akşam yemeği'}],
    posts:[{id:'p9',date:'2026-04-10T13:00:00',text:'Antalya\'nın en iyi kebapçısı',likes:34}],
    comments:[], isPremium:true },
  { id:'u8', name:'Sude Korkmaz', email:'sude@email.com', phone:'+905558901234', orders:45, spent:6750, status:'active', joinDate:'2025-05-30', city:'İstanbul', district:'Ataşehir', lastActive:'2026-04-15T22:30:00',
    height:168, weight:60, allergens:['Fıstık','Ceviz'], healthNotes:'Ağır fındık alerjisi — EpiPen taşır',
    walletBalance:4200, savedAddresses:['Ataşehir, İçerenköy Mah. No:11','Kadıköy, Fenerbahçe Mah. No:3'],
    followers:98, following:75, blocked:1,
    stories:[], posts:[{id:'p10',date:'2026-04-09T17:00:00',text:'Çiğ Köfte Express çok hızlı!',likes:22}],
    comments:[{id:'c5',date:'2026-04-11T19:00:00',on:'Waffle House',text:'Çikolatalı waffle harika'}],
    isPremium:false },
  { id:'u9', name:'Cem Arslan', email:'cem@email.com', phone:'+905559012345', orders:12, spent:1680, status:'active', joinDate:'2026-01-20', city:'Gaziantep', district:'Şahinbey', lastActive:'2026-04-13T15:00:00',
    height:176, weight:78, allergens:[], healthNotes:'',
    walletBalance:1680, savedAddresses:['Şahinbey, Kolejtepe Mah. No:5'],
    followers:30, following:18, blocked:0,
    stories:[], posts:[], comments:[], isPremium:false },
  { id:'u10', name:'İrem Yılmaz', email:'irem@email.com', phone:'+905550123456', orders:91, spent:13500, status:'active', joinDate:'2025-04-08', city:'İstanbul', district:'Beyoğlu', lastActive:'2026-04-16T13:45:00',
    height:172, weight:64, allergens:['Gluten'], healthNotes:'Çölyak teşhisi — glutensiz menü zorunlu',
    walletBalance:9500, savedAddresses:['Beyoğlu, Cihangir Mah. No:8','Şişli, Osmanbey Mah. No:12'],
    followers:245, following:178, blocked:4,
    stories:[{id:'s7',date:'2026-04-16T11:00:00',expired:false,text:'Tatlıcı Nene\'de baklava keyfi'}],
    posts:[{id:'p11',date:'2026-04-13T14:00:00',text:'Glutensiz seçenekler artıyor harika!',likes:41},{id:'p12',date:'2026-03-30T12:00:00',text:'Burger Lab glutensiz ekmeği denedim',likes:29}],
    comments:[{id:'c6',date:'2026-04-15T16:00:00',on:'Tatlıcı Nene',text:'Sütlaç çok kremamsıydı'}],
    isPremium:true },
  { id:'u11', name:'Kaan Doğan', email:'kaan@email.com', phone:'+905551112233', orders:3, spent:420, status:'active', joinDate:'2026-04-01', city:'Konya', district:'Selçuklu', lastActive:'2026-04-12T16:20:00',
    height:185, weight:90, allergens:[], healthNotes:'',
    walletBalance:420, savedAddresses:['Selçuklu, Bosna Hersek Mah. No:2'],
    followers:5, following:11, blocked:0,
    stories:[], posts:[], comments:[], isPremium:false },
  { id:'u12', name:'Melis Tan', email:'melis@email.com', phone:'+905552223344', orders:58, spent:8700, status:'active', joinDate:'2025-07-15', city:'İzmir', district:'Karşıyaka', lastActive:'2026-04-16T10:30:00',
    height:167, weight:57, allergens:['Süt Ürünleri','Yumurta'], healthNotes:'Vegan, B12 takviyesi alıyor',
    walletBalance:5200, savedAddresses:['Karşıyaka, Bostanlı Mah. No:16','Bornova, Kazımdirik Mah. No:4'],
    followers:167, following:120, blocked:2,
    stories:[{id:'s8',date:'2026-04-15T14:00:00',expired:true,text:'Vegan yemek tarifleri'}],
    posts:[{id:'p13',date:'2026-04-11T10:00:00',text:'Makarna Dükkanı\'nda vegan seçenek bekliyoruz!',likes:38}],
    comments:[{id:'c7',date:'2026-04-12T20:00:00',on:'Vegan Kitchen',text:'Buddha Bowl favorim'}],
    isPremium:true }
];

/* ── Platform Orders (last 20) ── */
var ADMIN_ORDERS = [
  { id: 'po1', orderId: '#104281', business: 'Lezzet Mutfak', branch: 'Kadıköy', user: 'Furkan Şahin', total: 200, commission: 40, status: 'delivered', date: '2026-04-16T13:22:00', deliveryTime: 24, type: 'online', cancelReason: null, tokenBefore: 5640, tokenAfter: 5440, items: ['Adana Kebap x2','Ayran x2','Künefe x1'] },
  { id: 'po2', orderId: '#104280', business: 'Pide Palace', branch: 'Beşiktaş', user: 'Elif Demir', total: 340, commission: 23.8, status: 'delivered', date: '2026-04-16T12:45:00', deliveryTime: 32, type: 'online', cancelReason: null, tokenBefore: 12400, tokenAfter: 12060, items: ['Kuşbaşılı Pide x2','Karışık Salata x1'] },
  { id: 'po3', orderId: '#104279', business: 'Burger Lab', branch: 'Kızılay', user: 'Burak Yıldız', total: 185, commission: 16.65, status: 'preparing', date: '2026-04-16T14:30:00', deliveryTime: null, type: 'online', cancelReason: null, tokenBefore: 2100, tokenAfter: null, items: ['Classic Burger x1','Patates Kızartması x1','Milkshake x1'] },
  { id: 'po4', orderId: '#104278', business: 'Sushi Master', branch: 'Alsancak', user: 'Aylin Kara', total: 520, commission: 36.4, status: 'on_way', date: '2026-04-16T14:15:00', deliveryTime: null, type: 'online', cancelReason: null, tokenBefore: 8900, tokenAfter: null, items: ['Dragon Roll x2','Miso Çorba x1','Edamame x1','Sashimi Set x1'] },
  { id: 'po5', orderId: '#104277', business: 'Çiğ Köfte Express', branch: 'Kadıköy', user: 'Mert Özkan', total: 95, commission: 10.45, status: 'delivered', date: '2026-04-16T11:50:00', deliveryTime: 18, type: 'masa', cancelReason: null, tokenBefore: 890, tokenAfter: 780, items: ['Çiğ Köfte Dürüm x2','Şalgam x2'] },
  { id: 'po6', orderId: '#104276', business: 'Kebapçı Hakkı', branch: 'Merkez', user: 'Onur Çetin', total: 380, commission: 20.9, status: 'delivered', date: '2026-04-16T11:30:00', deliveryTime: 26, type: 'masa', cancelReason: null, tokenBefore: 22000, tokenAfter: 21620, items: ['Beyti Kebap x1','Lahmacun x3','Ayran x4'] },
  { id: 'po7', orderId: '#104275', business: 'Pizza Napoli', branch: 'Nilüfer', user: 'Sude Korkmaz', total: 160, commission: 20.8, status: 'cancelled_user', date: '2026-04-16T11:10:00', deliveryTime: null, type: 'online', cancelReason: 'Bekleme süresi çok uzun', tokenBefore: 4200, tokenAfter: 4280, items: ['Margherita Pizza x1','Cola x1'] },
  { id: 'po8', orderId: '#104274', business: 'Tatlıcı Nene', branch: 'Beyoğlu', user: 'İrem Yılmaz', total: 270, commission: 14.85, status: 'delivered', date: '2026-04-16T10:40:00', deliveryTime: 22, type: 'online', cancelReason: null, tokenBefore: 9500, tokenAfter: 9230, items: ['Baklava (1kg) x1','Sütlaç x2','Türk Kahvesi x2'] },
  { id: 'po9', orderId: '#104273', business: 'Dönerci Baba', branch: 'Çankaya', user: 'Cem Arslan', total: 145, commission: 13.05, status: 'delivered', date: '2026-04-16T10:20:00', deliveryTime: 30, type: 'online', cancelReason: null, tokenBefore: 1680, tokenAfter: 1535, items: ['İskender x1','Ayran x1'] },
  { id: 'po10', orderId: '#104272', business: 'Lezzet Mutfak', branch: 'Beşiktaş', user: 'Melis Tan', total: 450, commission: 40.5, status: 'cancelled_biz', date: '2026-04-16T09:55:00', deliveryTime: null, type: 'online', cancelReason: 'Malzeme stok tükendi', tokenBefore: 5640, tokenAfter: 5528, items: ['Kuzu Tandır x2','Mercimek Çorba x2','Kadayıf x1'] },
  { id: 'po11', orderId: '#104271', business: 'Waffle House', branch: 'Bağdat Cad', user: 'Furkan Şahin', total: 120, commission: 10.8, status: 'delivered', date: '2026-04-16T09:30:00', deliveryTime: 20, type: 'masa', cancelReason: null, tokenBefore: 4200, tokenAfter: 4080, items: ['Çikolatalı Waffle x1','Çay x2'] },
  { id: 'po12', orderId: '#104270', business: 'Vegan Kitchen', branch: 'Kadıköy', user: 'Elif Demir', total: 210, commission: 23.1, status: 'delivered', date: '2026-04-16T08:15:00', deliveryTime: 35, type: 'online', cancelReason: null, tokenBefore: 1600, tokenAfter: 1370, items: ['Buddha Bowl x1','Smoothie x1','Granola x1'] },
  { id: 'po13', orderId: '#104269', business: 'Makarna Dükkanı', branch: 'Bornova', user: 'Burak Yıldız', total: 175, commission: 19.25, status: 'cancelled_admin', date: '2026-04-16T07:50:00', deliveryTime: null, type: 'online', cancelReason: 'Şüpheli işlem tespit edildi', tokenBefore: 2100, tokenAfter: 2100, items: ['Bolonez Makarna x2','Tiramisu x1'] },
  { id: 'po14', orderId: '#104268', business: 'Pide Palace', branch: 'Kadıköy', user: 'Kaan Doğan', total: 290, commission: 20.3, status: 'preparing', date: '2026-04-16T14:40:00', deliveryTime: null, type: 'masa', cancelReason: null, tokenBefore: 420, tokenAfter: null, items: ['Kaşarlı Sucuklu Pide x2','Ayran x2'] },
  { id: 'po15', orderId: '#104267', business: 'Çiğ Köfte Express', branch: 'Ataşehir', user: 'Sude Korkmaz', total: 80, commission: 8.8, status: 'delivered', date: '2026-04-16T08:00:00', deliveryTime: 15, type: 'online', cancelReason: null, tokenBefore: 4200, tokenAfter: 4112, items: ['Çiğ Köfte Porsiyon x2'] },
  { id: 'po16', orderId: '#104266', business: 'Burger Lab', branch: 'Kızılay', user: 'İrem Yılmaz', total: 245, commission: 22.05, status: 'on_way', date: '2026-04-16T14:20:00', deliveryTime: null, type: 'online', cancelReason: null, tokenBefore: 9500, tokenAfter: null, items: ['Double Cheese Burger x1','Soğan Halkası x1','Limonata x2'] },
  { id: 'po17', orderId: '#104265', business: 'Kebapçı Hakkı', branch: 'Şahinbey', user: 'Furkan Şahin', total: 310, commission: 17.05, status: 'delivered', date: '2026-04-16T09:10:00', deliveryTime: 22, type: 'online', cancelReason: null, tokenBefore: 22000, tokenAfter: 21690, items: ['Ali Nazik x1','Patlıcan Kebap x1','Şıra x2'] },
  { id: 'po18', orderId: '#104264', business: 'Tatlıcı Nene', branch: 'Nişantaşı', user: 'Melis Tan', total: 190, commission: 10.45, status: 'cancelled_user', date: '2026-04-16T08:40:00', deliveryTime: null, type: 'online', cancelReason: 'Yanlış adres girdim', tokenBefore: 9500, tokenAfter: 9595, items: ['Kazandibi x3','Aşure x2'] },
  { id: 'po19', orderId: '#104263', business: 'Waffle House', branch: 'Caddebostan', user: 'Cem Arslan', total: 155, commission: 13.95, status: 'delivered', date: '2026-04-16T09:45:00', deliveryTime: 25, type: 'masa', cancelReason: null, tokenBefore: 1680, tokenAfter: 1521, items: ['Meyveli Waffle x1','Türk Kahvesi x1'] },
  { id: 'po20', orderId: '#104262', business: 'Dönerci Baba', branch: 'Keçiören', user: 'Elif Demir', total: 225, commission: 20.25, status: 'delivered', date: '2026-04-16T10:05:00', deliveryTime: 28, type: 'online', cancelReason: null, tokenBefore: 12400, tokenAfter: 12175, items: ['Tombik Döner x2','Mercimek Çorba x1','Ayran x2'] }
];

/* ── Support Tickets ── */
var ADMIN_TICKETS = [
  { id:'tk1', ticketNo:'#DST-1041', user:'Furkan Şahin', userId:'u1', subject:'Sipariş eksik geldi', business:'Lezzet Mutfak', status:'open', priority:'high', type:'order', subReason:'Eksik ürün', date:'2026-04-16T10:00:00', orderId:'#104281',
    messages:[
      {from:'user',name:'Furkan Şahin',text:'Merhaba, siparişimde Künefe eksik geldi. 2 adet Adana Kebap ve 2 Ayran geldi ama Künefe yok.',time:'2026-04-16T10:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Merhaba Furkan Bey, sorununuzu inceliyoruz. Sipariş numaranızı onaylayabilir misiniz?',time:'2026-04-16T10:05:00'},
      {from:'user',name:'Furkan Şahin',text:'#104281 numaralı sipariş.',time:'2026-04-16T10:06:00'},
      {from:'support',name:'Destek Ekibi',text:'Teşekkürler, işletmeyle iletişime geçiyoruz. Kısa sürede dönüş yapacağız.',time:'2026-04-16T10:10:00'}
    ]},
  { id:'tk2', ticketNo:'#DST-1040', user:'Elif Demir', userId:'u2', subject:'Ödeme iadesi talebi', business:'Pizza Napoli', status:'open', priority:'high', type:'payment', subReason:'İptal edilen sipariş iadesi', date:'2026-04-16T09:30:00', orderId:'#104275',
    messages:[
      {from:'user',name:'Elif Demir',text:'Dün iptal ettiğim siparişin iadesi hâlâ hesabıma yansımadı. Ne zaman gelecek?',time:'2026-04-16T09:30:00'},
      {from:'support',name:'Destek Ekibi',text:'Merhaba Elif Hanım, iptal işleminiz onaylanmıştır. İade 1-3 iş günü içinde hesabınıza yansıyacaktır.',time:'2026-04-16T09:45:00'},
      {from:'user',name:'Elif Demir',text:'Anlıyorum ama 3 gün oldu hâlâ gelmedi.',time:'2026-04-16T09:50:00'}
    ]},
  { id:'tk3', ticketNo:'#DST-1039', user:'Mert Özkan', userId:'u5', subject:'Kurye geç geldi', business:'Burger Lab', status:'in_progress', priority:'medium', type:'order', subReason:'Teslimat gecikmesi', date:'2026-04-15T18:00:00', orderId:'#104279',
    messages:[
      {from:'user',name:'Mert Özkan',text:'Siparişim 45 dakika oldu hâlâ gelmedi. Tahmini süre 25 dk diyordu.',time:'2026-04-15T18:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Özür dileriz Mert Bey, kurye trafikten dolayı gecikmiştir. Durumu takip ediyoruz.',time:'2026-04-15T18:10:00'},
      {from:'user',name:'Mert Özkan',text:'Tamam bekliyorum ama bu süre kabul edilemez.',time:'2026-04-15T18:12:00'},
      {from:'support',name:'Destek Ekibi',text:'Haklısınız, bir sonraki siparişinize %10 indirim kuponu tanımlıyoruz.',time:'2026-04-15T18:20:00'},
      {from:'user',name:'Mert Özkan',text:'Teşekkür ederim.',time:'2026-04-15T18:22:00'}
    ]},
  { id:'tk4', ticketNo:'#DST-1038', user:'Aylin Kara', userId:'u4', subject:'Uygulama çöküyor', business:null, status:'open', priority:'low', type:'technical', subReason:'Uygulama hatası', date:'2026-04-15T14:20:00', orderId:null,
    messages:[
      {from:'user',name:'Aylin Kara',text:'Uygulama menü sayfasında sürekli çöküyor. iPhone 15 Pro kullanıyorum, iOS 19.2.',time:'2026-04-15T14:20:00'},
      {from:'support',name:'Destek Ekibi',text:'Merhaba Aylin Hanım, sorunu teknik ekibimize ilettik. Uygulamayı silip yeniden yükler misiniz?',time:'2026-04-15T14:40:00'},
      {from:'user',name:'Aylin Kara',text:'Denedim ama hâlâ aynı sorun devam ediyor.',time:'2026-04-15T15:00:00'}
    ]},
  { id:'tk5', ticketNo:'#DST-1037', user:'Onur Çetin', userId:'u7', subject:'Yanlış adrese teslim', business:'Kebapçı Hakkı', status:'resolved', priority:'high', type:'order', subReason:'Yanlış adres', date:'2026-04-14T16:45:00', orderId:'#104276',
    messages:[
      {from:'user',name:'Onur Çetin',text:'Siparişim yanlış adrese teslim edilmiş! Ben Lara\'dayım ama Konyaaltı\'na gitmiş.',time:'2026-04-14T16:45:00'},
      {from:'support',name:'Destek Ekibi',text:'Çok özür dileriz Onur Bey. Hemen yeni bir sipariş hazırlatıyoruz.',time:'2026-04-14T16:55:00'},
      {from:'user',name:'Onur Çetin',text:'Tamam teşekkürler.',time:'2026-04-14T17:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Yeni siparişiniz 20 dakika içinde teslim edilecektir. İade de hesabınıza tanımlandı.',time:'2026-04-14T17:10:00'},
      {from:'user',name:'Onur Çetin',text:'Geldi, teşekkürler sorun çözüldü.',time:'2026-04-14T17:35:00'},
      {from:'support',name:'Destek Ekibi',text:'İyi günler dileriz! Talep kapatılmıştır.',time:'2026-04-14T17:40:00'}
    ]},
  { id:'tk6', ticketNo:'#DST-1036', user:'Sude Korkmaz', userId:'u8', subject:'Alerjen bilgisi eksik', business:'Waffle House', status:'in_progress', priority:'medium', type:'complaint', subReason:'Eksik bilgilendirme', date:'2026-04-14T11:00:00', orderId:null,
    messages:[
      {from:'user',name:'Sude Korkmaz',text:'Waffle House menüsünde fıstık alerjeni yazmıyor ama waffle\'da fıstık kullanılıyor! Bu çok tehlikeli.',time:'2026-04-14T11:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Bu çok önemli bir geri bildirim, teşekkür ederiz. İşletmeye alerjen bilgilerini güncellemeleri için bildirim gönderiyoruz.',time:'2026-04-14T11:15:00'},
      {from:'user',name:'Sude Korkmaz',text:'Ben ağır fıstık alerjisi olan biriyim. Bu hayati bir konu.',time:'2026-04-14T11:20:00'},
      {from:'support',name:'Destek Ekibi',text:'Kesinlikle haklısınız. İşletmeye uyarı verildi ve menü güncelleme süreci başlatıldı.',time:'2026-04-14T11:30:00'}
    ]},
  { id:'tk7', ticketNo:'#DST-1035', user:'İrem Yılmaz', userId:'u10', subject:'Kupon kodu çalışmıyor', business:null, status:'resolved', priority:'low', type:'payment', subReason:'Kupon/indirim sorunu', date:'2026-04-13T20:00:00', orderId:null,
    messages:[
      {from:'user',name:'İrem Yılmaz',text:'ILKSIPARIS30 kupon kodunu giriyorum ama "geçersiz kod" diyor.',time:'2026-04-13T20:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Merhaba İrem Hanım, bu kod sadece ilk sipariş için geçerlidir. Daha önce kullanmış olabilirsiniz.',time:'2026-04-13T20:10:00'},
      {from:'user',name:'İrem Yılmaz',text:'Aa evet haklısınız, ilk siparişimde kullanmıştım. Başka bir kod var mı?',time:'2026-04-13T20:15:00'},
      {from:'support',name:'Destek Ekibi',text:'Size özel IREM15 kodunu tanımladık, %15 indirim sağlar. İyi alışverişler!',time:'2026-04-13T20:20:00'},
      {from:'user',name:'İrem Yılmaz',text:'Harika, teşekkürler!',time:'2026-04-13T20:22:00'}
    ]},
  { id:'tk8', ticketNo:'#DST-1034', user:'Cem Arslan', userId:'u9', subject:'Yemek soğuk geldi', business:'Dönerci Baba', status:'open', priority:'medium', type:'order', subReason:'Kalite sorunu', date:'2026-04-16T11:30:00', orderId:'#104273',
    messages:[
      {from:'user',name:'Cem Arslan',text:'İskender buz gibi soğuk geldi. Teslimat çok uzun sürdü galiba.',time:'2026-04-16T11:30:00'},
      {from:'support',name:'Destek Ekibi',text:'Özür dileriz Cem Bey. Bu durumu işletmeye iletiyoruz.',time:'2026-04-16T11:40:00'}
    ]},
  { id:'tk9', ticketNo:'#DST-1033', user:'Melis Tan', userId:'u12', subject:'Token yükleme başarısız', business:null, status:'in_progress', priority:'high', type:'payment', subReason:'Ödeme hatası', date:'2026-04-15T20:00:00', orderId:null,
    messages:[
      {from:'user',name:'Melis Tan',text:'2000 TL token yüklemeye çalıştım, kartımdan para çekildi ama token gelmedi!',time:'2026-04-15T20:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Merhaba Melis Hanım, ödeme loglarını kontrol ediyoruz. Kart son 4 hanesi nedir?',time:'2026-04-15T20:10:00'},
      {from:'user',name:'Melis Tan',text:'4532 ile biten kart.',time:'2026-04-15T20:12:00'},
      {from:'support',name:'Destek Ekibi',text:'Ödemenizi tespit ettik, teknik bir aksaklık yaşanmış. Token bakiyenize manuel olarak ekliyoruz.',time:'2026-04-15T20:25:00'},
      {from:'user',name:'Melis Tan',text:'Tamam bekliyorum.',time:'2026-04-15T20:26:00'}
    ]},
  { id:'tk10', ticketNo:'#DST-1032', user:'Kaan Doğan', userId:'u11', subject:'Sipariş iptali yapılamıyor', business:'Pide Palace', status:'resolved', priority:'low', type:'technical', subReason:'Uygulama hatası', date:'2026-04-12T16:00:00', orderId:'#104268',
    messages:[
      {from:'user',name:'Kaan Doğan',text:'Siparişimi iptal etmek istiyorum ama buton çalışmıyor.',time:'2026-04-12T16:00:00'},
      {from:'support',name:'Destek Ekibi',text:'Siparişinizi manuel olarak iptal ettik. Uygulama hatasını teknik ekibe ilettik.',time:'2026-04-12T16:15:00'},
      {from:'user',name:'Kaan Doğan',text:'Teşekkürler.',time:'2026-04-12T16:20:00'}
    ]}
];

/* ── Reported Content ── */
var ADMIN_REPORTS = [
  { id: 'rp1', type: 'post', reportedBy: 'Elif Demir', target: 'Spam içerik paylaşımı', business: 'Tantuni Evi', status: 'pending', date: '2026-04-16T08:00:00' },
  { id: 'rp2', type: 'review', reportedBy: 'Furkan Şahin', target: 'Hakaret içeren yorum', business: 'Pizza Napoli', status: 'pending', date: '2026-04-15T16:00:00' },
  { id: 'rp3', type: 'post', reportedBy: 'Mert Özkan', target: 'Yanıltıcı kampanya', business: 'Kumpir Evi', status: 'resolved', date: '2026-04-14T12:00:00' }
];

/* ── Campaigns ── */
var ADMIN_CAMPAIGNS = [
  { id: 'cp1', name: 'İlk Sipariş %30 İndirim', type: 'discount', status: 'active', startDate: '2026-04-01', endDate: '2026-04-30', usageCount: 2840, budget: 50000, spent: 32400 },
  { id: 'cp2', name: 'Hafta Sonu Ücretsiz Teslimat', type: 'delivery', status: 'active', startDate: '2026-04-12', endDate: '2026-04-20', usageCount: 1560, budget: 25000, spent: 14800 },
  { id: 'cp3', name: '5000 Token Yükle +1500 Bonus', type: 'bonus', status: 'active', startDate: '2026-04-01', endDate: '2026-05-01', usageCount: 420, budget: null, spent: null },
  { id: 'cp4', name: 'Ramazan Özel Menü', type: 'special', status: 'ended', startDate: '2026-03-01', endDate: '2026-03-30', usageCount: 8200, budget: 100000, spent: 94500 }
];

/* ── Finance Summary ── */
var ADMIN_FINANCE = {
  totalCommissionEarned: 3420000,
  monthlyCommissionEarned: 412000,
  dailyCommissionEarned: 14200,
  totalTokensSold: 18500000,
  monthlyTokensSold: 2200000,
  pendingPayouts: 185000,
  refundsThisMonth: 42000,
  avgCommissionRate: 10.2,
  topCommissionBiz: 'Çiğ Köfte Express',
  topCommissionAmount: 48000
};

/* ── Notification Templates ── */
var ADMIN_NOTIF_TEMPLATES = [
  { id: 'nt1', name: 'Yeni İşletme Onayı', trigger: 'Yeni işletme başvurusu', channel: 'push', active: true },
  { id: 'nt2', name: 'Düşük Bakiye', trigger: 'Token < 500', channel: 'push+email', active: true },
  { id: 'nt3', name: 'Yüksek İptal Oranı', trigger: 'İptal > %10', channel: 'push', active: true },
  { id: 'nt4', name: 'Kampanya Bitiş', trigger: '3 gün kala', channel: 'email', active: false },
  { id: 'nt5', name: 'Haftalık Rapor', trigger: 'Her Pazartesi', channel: 'email', active: true }
];

/* ── Recipes (Platform Tarif Veritabanı) ── */
var ADMIN_RECIPES = [
  { id:'rc1', title:'Klasik Künefe', userId:'u1', userName:'Furkan Şahin', category:'dessert', status:'approved', date:'2026-04-14T10:00:00',
    cover:'https://images.unsplash.com/photo-1576097449798-7c1e8e4b6d0c?w=400&h=300&fit=crop',
    description:'Hatay usulü klasik künefe tarifi. İnce kadayıf, tuzsuz peynir ve bol şerbetle hazırlanan geleneksel lezzet.',
    story:'Hatay\'a her gittiğimde mutlaka yediğim künefenin tarifini ustasından öğrendim. Evde yapınca o kadar güzel oldu ki paylaşmadan edemedim!',
    ingredients:[
      {name:'İnce kadayıf',amount:'500 g'},{name:'Tuzsuz peynir (dil veya lor)',amount:'250 g'},{name:'Tereyağı (eritilmiş)',amount:'150 g'},
      {name:'Şeker',amount:'2 su bardağı'},{name:'Su',amount:'1.5 su bardağı'},{name:'Limon suyu',amount:'1 yemek kaşığı'},{name:'Antep fıstığı (kıyılmış)',amount:'Üzeri için'}
    ],
    steps:[
      'Kadayıfı ince ince kıyın ve eritilmiş tereyağı ile iyice yoğurun.',
      'Yuvarlak bir tepsinin tabanına kadayıfın yarısını bastırarak yayın.',
      'Rendelenmiş tuzsuz peyniri üzerine eşit şekilde dağıtın.',
      'Kalan kadayıfı üzerine yayıp hafifçe bastırın.',
      'Kısık ateşte altı kızarana kadar pişirin, sonra ters çevirerek diğer tarafını da kızartın.',
      'Şeker ve suyu kaynatıp limon suyu ekleyerek şerbeti hazırlayın, ılıtın.',
      'Sıcak künefenin üzerine ılık şerbeti gezdirin. Kıyılmış fıstık ile servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1576097449798-7c1e8e4b6d0c?w=800',flagged:false},{type:'photo',url:'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800',flagged:false}],
    nutrition:{calories:380,protein:12,carbs:42,fat:18,fiber:1},
    tags:['Geleneksel','Şerbetli','Hatay'],
    allergens:['Glüten','Süt Ürünleri','Fıstık'],
    saves:245, comments:38, likes:312, cookTime:45, servings:6, difficulty:'Orta'
  },
  { id:'rc2', title:'Vegan Buddha Bowl', userId:'u2', userName:'Elif Demir', category:'vegan', status:'approved', date:'2026-04-13T15:30:00',
    cover:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description:'Renkli ve besleyici bir vegan kase. Kinoa, avokado, ıspanak ve humus ile hazırlanan sağlıklı bir öğün.',
    story:'Veganlığa geçtikten sonra en çok sevdiğim tarif bu oldu. Hem doyurucu hem göz alıcı!',
    ingredients:[
      {name:'Kinoa',amount:'1 su bardağı'},{name:'Avokado',amount:'1 adet'},{name:'Bebek ıspanak',amount:'2 avuç'},
      {name:'Kırmızı lahana (ince kıyılmış)',amount:'1 su bardağı'},{name:'Nohut (haşlanmış)',amount:'1 su bardağı'},
      {name:'Havuç (rendelenmiş)',amount:'1 adet'},{name:'Humus',amount:'3 yemek kaşığı'},{name:'Zeytinyağı',amount:'2 yemek kaşığı'},
      {name:'Limon suyu',amount:'1 adet'},{name:'Susam',amount:'Üzeri için'}
    ],
    steps:[
      'Kinoayı paketteki talimata göre haşlayın ve soğutun.',
      'Avokadoyu dilimleyin, nohutları süzün.',
      'Geniş bir kaseye ıspanakları yatırın.',
      'Kinoa, avokado, nohut, kırmızı lahana ve havucu bölümler halinde yerleştirin.',
      'Ortasına humus koyun.',
      'Zeytinyağı ve limon suyu ile sosunu hazırlayıp üzerine gezdirin.',
      'Susam serperek servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',flagged:false}],
    nutrition:{calories:420,protein:16,carbs:48,fat:20,fiber:12},
    tags:['Vegan','Sağlıklı','Kolay'],
    allergens:['Susam'],
    saves:189, comments:27, likes:256, cookTime:25, servings:2, difficulty:'Kolay'
  },
  { id:'rc3', title:'Ev Yapımı Lahmacun', userId:'u5', userName:'Mert Özkan', category:'main', status:'pending', date:'2026-04-15T18:00:00',
    cover:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    description:'Çıtır çıtır hamuru ve lezzetli harciyla ev yapımı lahmacun tarifi.',
    story:'Annemin tarifiyle yaptığım lahmacunlar fırıncıdakinden daha güzel oluyor. Sırrı hamurda!',
    ingredients:[
      {name:'Un',amount:'3 su bardağı'},{name:'Yaş maya',amount:'10 g'},{name:'Ilık su',amount:'1 su bardağı'},
      {name:'Tuz',amount:'1 çay kaşığı'},{name:'Kıyma',amount:'250 g'},{name:'Soğan (rendelenmiş)',amount:'2 adet'},
      {name:'Domates (rendelenmiş)',amount:'2 adet'},{name:'Biber salçası',amount:'1 yemek kaşığı'},
      {name:'Maydanoz',amount:'1 demet'},{name:'Pul biber',amount:'1 çay kaşığı'}
    ],
    steps:[
      'Mayayı ılık suda eritin, un ve tuzla hamur yoğurun. 30 dk mayalandırın.',
      'Kıymayı soğan, domates, salça, maydanoz ve baharatlarla yoğurun.',
      'Hamuru ceviz büyüklüğünde bezlere ayırın, ince açın.',
      'Harcı ince bir tabaka halinde hamurların üzerine yayın.',
      'Önceden ısıtılmış 250°C fırında 8-10 dakika pişirin.',
      'Limon sıkıp maydanoz ile servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',flagged:false},{type:'video',url:'https://example.com/lahmacun-video.mp4',flagged:false}],
    nutrition:{calories:290,protein:18,carbs:35,fat:9,fiber:2},
    tags:['Geleneksel','Hamur İşi','Pratik'],
    allergens:['Glüten'],
    saves:156, comments:44, likes:198, cookTime:60, servings:8, difficulty:'Orta'
  },
  { id:'rc4', title:'Çilekli Cheesecake', userId:'u4', userName:'Aylin Kara', category:'dessert', status:'pending', date:'2026-04-16T09:00:00',
    cover:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    description:'Pişirmeden yapılan kolay çilekli cheesecake. Kremalı dokusu ve taze çilekli sosuyla enfes.',
    story:'Doğum günüm için yaptığım bu pasta herkesin favorisi oldu. Fırın bile kullanmıyorsunuz!',
    ingredients:[
      {name:'Yulaflı bisküvi',amount:'200 g'},{name:'Tereyağı (eritilmiş)',amount:'80 g'},{name:'Krem peynir',amount:'400 g'},
      {name:'Krema (sıvı)',amount:'200 ml'},{name:'Pudra şekeri',amount:'100 g'},{name:'Jelatin',amount:'10 g'},
      {name:'Çilek',amount:'300 g'},{name:'Vanilya',amount:'1 paket'}
    ],
    steps:[
      'Bisküvileri rondodan geçirin, eritilmiş tereyağı ile karıştırıp kalıbın tabanına bastırın. Buzdolabına koyun.',
      'Krem peynir, pudra şekeri ve vanilyayı mikserle çırpın.',
      'Sıvı kremayı ayrı bir kapta çırpıp krem peynir karışımına ekleyin.',
      'Jelatini talimata göre eritip karışıma ekleyin, iyice karıştırın.',
      'Bisküvi tabanının üzerine dökün, en az 4 saat buzdolabında dondurun.',
      'Çilekleri blenderdan geçirip biraz şekerle kaynatarak sos hazırlayın.',
      'Soğuyan pastanın üzerine çilek sosunu gezdirip servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',flagged:false}],
    nutrition:{calories:340,protein:6,carbs:38,fat:19,fiber:1},
    tags:['Pişirmesiz','Kolay','Parti'],
    allergens:['Glüten','Süt Ürünleri','Jelatin'],
    saves:312, comments:56, likes:420, cookTime:30, servings:8, difficulty:'Kolay'
  },
  { id:'rc5', title:'Mercimek Çorbası', userId:'u7', userName:'Onur Çetin', category:'soup', status:'approved', date:'2026-04-10T12:00:00',
    cover:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    description:'Türk mutfağının vazgeçilmezi, klasik kırmızı mercimek çorbası.',
    story:'Kış günlerinin olmazsa olmazı. Annemin tarifinden öğrendiğim küçük dokunuşlarla mükemmel kıvamda.',
    ingredients:[
      {name:'Kırmızı mercimek',amount:'1.5 su bardağı'},{name:'Soğan',amount:'1 adet'},{name:'Havuç',amount:'1 adet'},
      {name:'Patates',amount:'1 adet'},{name:'Domates salçası',amount:'1 yemek kaşığı'},{name:'Tereyağı',amount:'1 yemek kaşığı'},
      {name:'Un',amount:'1 yemek kaşığı'},{name:'Tuz, karabiber, kimyon',amount:'Tadına göre'},{name:'Limon',amount:'Servis için'}
    ],
    steps:[
      'Soğan, havuç ve patatesi küçük küçük doğrayın.',
      'Mercimeği yıkayıp süzün.',
      'Tencereye biraz yağ koyun, soğanı kavurun. Salça ekleyip çevirin.',
      'Sebzeleri ve mercimeği ekleyip 6 su bardağı su ile kaynatın.',
      'Kısık ateşte 25-30 dakika pişirin.',
      'Blenderdan geçirip pürüzsüz hale getirin.',
      'Ayrı tavada tereyağını eritip un ve pul biber ekleyerek sos yapın, çorbanın üzerine gezdirin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',flagged:false}],
    nutrition:{calories:180,protein:12,carbs:28,fat:3,fiber:8},
    tags:['Geleneksel','Sağlıklı','Kış'],
    allergens:['Glüten','Süt Ürünleri'],
    saves:420, comments:62, likes:510, cookTime:40, servings:6, difficulty:'Kolay'
  },
  { id:'rc6', title:'Ispanaklı Gözleme', userId:'u8', userName:'Sude Korkmaz', category:'breakfast', status:'rejected', date:'2026-04-11T08:00:00',
    cover:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    description:'Köy usulü ıspanaklı gözleme. İnce hamur, bol ıspanak ve beyaz peynirle.',
    story:'Bu tarifi babaannemin köyünde öğrendim. Sac üzerinde pişirince tadına doyum olmuyor.',
    ingredients:[
      {name:'Un',amount:'3 su bardağı'},{name:'Su',amount:'1 su bardağı'},{name:'Tuz',amount:'1 çay kaşığı'},
      {name:'Ispanak',amount:'500 g'},{name:'Beyaz peynir',amount:'200 g'},{name:'Soğan',amount:'1 adet'},
      {name:'Tereyağı',amount:'Pişirmek için'}
    ],
    steps:[
      'Un, su ve tuzu yoğurup 20 dakika dinlendirin.',
      'Ispanakları yıkayıp doğrayın, tuz ekleyip suyunu çıkarın.',
      'Peynir ve soğanı ıspanağa ekleyip iç harcı hazırlayın.',
      'Hamuru bezlere ayırıp ince açın.',
      'İç harcı yerleştirip kapatın.',
      'Kızgın tavada veya saçta tereyağı ile her iki tarafını pişirin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',flagged:true}],
    nutrition:{calories:260,protein:14,carbs:30,fat:10,fiber:4},
    tags:['Geleneksel','Köy Usulü'],
    allergens:['Glüten','Süt Ürünleri'],
    saves:88, comments:12, likes:95, cookTime:45, servings:4, difficulty:'Orta',
    rejectReason:'Kapak fotoğrafı tarif ile uyuşmuyor, pizza görseli kullanılmış.'
  },
  { id:'rc7', title:'Falafel Wrap', userId:'u10', userName:'İrem Yılmaz', category:'vegan', status:'approved', date:'2026-04-12T11:30:00',
    cover:'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
    description:'Nohuttan yapılan çıtır falafel, lavaş içinde taze sebzeler ve tahin sosuyla.',
    story:'Ortadoğu\'dan ilham alan bu tarif, hem vegan hem de inanılmaz lezzetli!',
    ingredients:[
      {name:'Nohut (bir gece ıslatılmış)',amount:'2 su bardağı'},{name:'Maydanoz',amount:'1 demet'},{name:'Soğan',amount:'1 adet'},
      {name:'Sarımsak',amount:'3 diş'},{name:'Kimyon',amount:'1 çay kaşığı'},{name:'Karbonat',amount:'Yarım çay kaşığı'},
      {name:'Lavaş',amount:'4 adet'},{name:'Tahin',amount:'3 yemek kaşığı'},{name:'Domates, marul, salatalık',amount:'Servis için'}
    ],
    steps:[
      'Islatılmış nohutları süzün, maydanoz, soğan, sarımsak ile robottan geçirin.',
      'Kimyon, tuz ve karbonat ekleyip yoğurun.',
      'Ceviz büyüklüğünde toplar yapın, hafifçe bastırın.',
      'Bolca yağda kızartın veya fırında 200°C\'de 25 dk pişirin.',
      'Tahini su ve limon ile açarak sos hazırlayın.',
      'Lavaşa marul, domates, salatalık, falafel koyun, tahin sos gezdirip sarın.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',flagged:false}],
    nutrition:{calories:350,protein:14,carbs:40,fat:16,fiber:9},
    tags:['Vegan','Ortadoğu','Pratik'],
    allergens:['Glüten','Susam'],
    saves:134, comments:19, likes:178, cookTime:40, servings:4, difficulty:'Orta'
  },
  { id:'rc8', title:'Menemen', userId:'u9', userName:'Cem Arslan', category:'breakfast', status:'approved', date:'2026-04-09T07:30:00',
    cover:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
    description:'Klasik Türk kahvaltısının yıldızı. Domates, biber ve yumurtayla yapılan geleneksel menemen.',
    story:'Kahvaltıda en çok tercih ettiğim tarif. Sırrı domatesler — mutlaka olgun ve mevsiminde olmalı!',
    ingredients:[
      {name:'Yumurta',amount:'4 adet'},{name:'Domates',amount:'3 adet'},{name:'Sivri biber',amount:'3 adet'},
      {name:'Soğan',amount:'1 adet'},{name:'Zeytinyağı',amount:'2 yemek kaşığı'},
      {name:'Tuz, karabiber, pul biber',amount:'Tadına göre'}
    ],
    steps:[
      'Soğanı ve biberleri küçük küçük doğrayıp zeytinyağında kavurun.',
      'Domatesleri rendeleyin veya küp küp doğrayıp ekleyin.',
      'Domatesler suyunu salıp yumuşayana kadar pişirin.',
      'Yumurtaları kırıp ekleyin, hafifçe karıştırın.',
      'Yumurtalar pişene kadar (ama çok sert olmadan) ateşten alın.',
      'Pul biber serperek sıcak servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',flagged:false}],
    nutrition:{calories:220,protein:14,carbs:12,fat:14,fiber:3},
    tags:['Geleneksel','Kahvaltı','Hızlı'],
    allergens:['Yumurta'],
    saves:380, comments:48, likes:460, cookTime:15, servings:2, difficulty:'Kolay'
  },
  { id:'rc9', title:'Mantı', userId:'u12', userName:'Melis Tan', category:'main', status:'pending', date:'2026-04-16T11:00:00',
    cover:'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
    description:'Kayseri usulü el açması mantı. Yoğurt ve tereyağlı sos ile servis edilir.',
    story:'Mantı yapımı sabır işi ama sonucu o kadar lezzetli ki her dakikasına değiyor!',
    ingredients:[
      {name:'Un',amount:'3 su bardağı'},{name:'Yumurta',amount:'1 adet'},{name:'Su',amount:'Yarım su bardağı'},
      {name:'Kıyma',amount:'250 g'},{name:'Soğan (rendelenmiş)',amount:'2 adet'},{name:'Tuz, karabiber',amount:'Tadına göre'},
      {name:'Yoğurt',amount:'3 su bardağı'},{name:'Sarımsak',amount:'2 diş'},{name:'Tereyağı',amount:'50 g'},
      {name:'Pul biber, kuru nane',amount:'Üzeri için'}
    ],
    steps:[
      'Un, yumurta, su ve tuzla sert bir hamur yoğurun. 30 dk dinlendirin.',
      'Kıyma, soğan, tuz ve karabiberi yoğurup iç harcı hazırlayın.',
      'Hamuru ince ince açın, küçük kareler kesin.',
      'Her karenin ortasına bir miktar harç koyup kapatın.',
      'Kaynar tuzlu suda 15-20 dakika haşlayın.',
      'Yoğurdu sarımsakla ezin.',
      'Tereyağını eritip pul biber ve nane ekleyin.',
      'Mantıları tabağa alın, yoğurt ve tereyağlı sosu gezdirip servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',flagged:false},{type:'photo',url:'https://images.unsplash.com/photo-1590576413003-f09fb2e040db?w=800',flagged:false}],
    nutrition:{calories:380,protein:22,carbs:42,fat:14,fiber:2},
    tags:['Geleneksel','Kayseri','Hamur İşi'],
    allergens:['Glüten','Yumurta','Süt Ürünleri'],
    saves:267, comments:73, likes:345, cookTime:90, servings:6, difficulty:'Zor'
  },
  { id:'rc10', title:'Smoothie Bowl', userId:'u4', userName:'Aylin Kara', category:'breakfast', status:'approved', date:'2026-04-08T08:45:00',
    cover:'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    description:'Tropikal meyveli smoothie bowl. Granola, chia tohumu ve taze meyvelerle.',
    story:'Sağlıklı bir güne başlamak için en sevdiğim kahvaltı. Rengarenk ve besleyici!',
    ingredients:[
      {name:'Dondurulmuş muz',amount:'2 adet'},{name:'Dondurulmuş mango',amount:'1 su bardağı'},{name:'Badem sütü',amount:'Yarım su bardağı'},
      {name:'Granola',amount:'3 yemek kaşığı'},{name:'Chia tohumu',amount:'1 yemek kaşığı'},{name:'Taze çilek',amount:'5-6 adet'},
      {name:'Hindistancevizi rendesi',amount:'1 yemek kaşığı'},{name:'Bal',amount:'İsteğe göre'}
    ],
    steps:[
      'Dondurulmuş muz ve mangoyu badem sütü ile blenderdan geçirin.',
      'Kıvamı kalın ve kaşıklanabilir olmalı — çok sıvı eklemeyin.',
      'Kaseye dökün ve yüzeyi düzleştirin.',
      'Üzerine granola, chia tohumu, dilimlenmiş çilek ve hindistancevizi rendesi serpin.',
      'İsterseniz bal gezdirip servis edin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',flagged:false}],
    nutrition:{calories:310,protein:8,carbs:52,fat:10,fiber:9},
    tags:['Sağlıklı','Vegan','Kahvaltı'],
    allergens:['Fıstık (olası çapraz bulaşma)'],
    saves:198, comments:31, likes:275, cookTime:10, servings:1, difficulty:'Kolay'
  },
  { id:'rc11', title:'Karnıyarık', userId:'u1', userName:'Furkan Şahin', category:'main', status:'approved', date:'2026-04-07T13:00:00',
    cover:'https://images.unsplash.com/photo-1583133160673-6f16fae23e2a?w=400&h=300&fit=crop',
    description:'Patlıcan severlerin gözdesi karnıyarık. Kıymalı iç harç ve fırında pişirme.',
    story:'Karnıyarık yapmanın püf noktası patlıcanları doğru kızartmak. Bu tarifle her seferinde mükemmel oluyor.',
    ingredients:[
      {name:'Patlıcan',amount:'6 adet'},{name:'Kıyma',amount:'300 g'},{name:'Soğan',amount:'2 adet'},
      {name:'Domates',amount:'3 adet'},{name:'Biber',amount:'2 adet'},{name:'Sarımsak',amount:'2 diş'},
      {name:'Domates salçası',amount:'1 yemek kaşığı'},{name:'Sıvı yağ',amount:'Kızartmak için'},{name:'Tuz, karabiber, pul biber',amount:'Tadına göre'}
    ],
    steps:[
      'Patlıcanları alacalı soyun, tuzlu suda 20 dk bekletin.',
      'Sıvı yağda patlıcanları kızartıp tepsiye dizin.',
      'Kıymayı soğanla kavurun, salça, domates ve biber ekleyin.',
      'Baharatları ekleyip 10 dk pişirin.',
      'Patlıcanları ortadan yarıp içine harçtan doldurun.',
      'Üzerine domates dilimleri koyup 180°C fırında 25 dk pişirin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1583133160673-6f16fae23e2a?w=800',flagged:false}],
    nutrition:{calories:320,protein:20,carbs:18,fat:20,fiber:6},
    tags:['Geleneksel','Fırın','Ana Yemek'],
    allergens:[],
    saves:290, comments:55, likes:380, cookTime:60, servings:6, difficulty:'Orta'
  },
  { id:'rc12', title:'Açma (Yumuşak Poğaça)', userId:'u11', userName:'Kaan Doğan', category:'breakfast', status:'pending', date:'2026-04-16T06:30:00',
    cover:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    description:'Pamuk gibi yumuşak açma tarifi. Peynirli veya sade yapılabilir.',
    story:'Fırıncıdan aldığım açmaların sırrını çözdüm sonunda. Hamuruna eklenen yoğurt her şeyi değiştiriyor!',
    ingredients:[
      {name:'Un',amount:'4 su bardağı'},{name:'Süt (ılık)',amount:'1 su bardağı'},{name:'Yoğurt',amount:'3 yemek kaşığı'},
      {name:'Yaş maya',amount:'10 g'},{name:'Şeker',amount:'1 yemek kaşığı'},{name:'Tuz',amount:'1 çay kaşığı'},
      {name:'Sıvı yağ',amount:'Yarım su bardağı'},{name:'Yumurta',amount:'1 adet (üzeri için)'},{name:'Beyaz peynir (isteğe göre)',amount:'200 g'}
    ],
    steps:[
      'Ilık sütte maya ve şekeri eritin.',
      'Un, tuz, yoğurt ve sıvı yağı ekleyip yumuşak hamur yoğurun.',
      '40 dakika mayalandırın.',
      'Hamuru bezlere ayırıp uzun fitil şeklinde açın, rulo yaparak şekil verin.',
      'İsterseniz içine peynir koyun.',
      'Tepsiye dizin, üzerine yumurta sarısı sürün.',
      '180°C fırında 20-25 dakika altın rengi olana kadar pişirin.'
    ],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',flagged:false}],
    nutrition:{calories:240,protein:8,carbs:32,fat:9,fiber:1},
    tags:['Kahvaltı','Hamur İşi','Fırın'],
    allergens:['Glüten','Süt Ürünleri','Yumurta'],
    saves:175, comments:28, likes:210, cookTime:80, servings:12, difficulty:'Orta'
  }
];

var ADMIN_RECIPE_CATEGORIES = [
  { key:'breakfast', label:'Kahvaltı',   icon:'solar:sun-fog-bold',       color:'#F59E0B' },
  { key:'main',      label:'Ana Yemek',  icon:'solar:chef-hat-bold',      color:'#EF4444' },
  { key:'soup',      label:'Çorba',      icon:'solar:cup-hot-bold',       color:'#F97316' },
  { key:'dessert',   label:'Tatlı',      icon:'solar:cake-bold',          color:'#EC4899' },
  { key:'vegan',     label:'Vegan',      icon:'solar:leaf-bold',          color:'#22C55E' },
  { key:'salad',     label:'Salata',     icon:'solar:leaf-bold',          color:'#10B981' },
  { key:'snack',     label:'Atıştırmalık',icon:'solar:donut-bold',        color:'#8B5CF6' }
];

/* ═══ YÖNETİM MERKEZİ — Tile summary metrics ═══ */
var ADMIN_MGMT_METRICS = {
  /* 1 — Paydaş ve Operasyon */
  bizApplications: { pending: 12 },
  staff:           { total: 3892, activeShifts: 847 },

  /* 2 — Finans */
  tokenSupply:  { total: 18500000 },
  tokenTxns:    { todayNet: 284520 },
  payments:     { todayTl: 15400 },
  premium:      { subscribers: 287 },

  /* 3 — İçerik & Topluluk */
  community:    { engagementPct: 78 },

  /* 4 — Güvenlik */
  blacklist:    { banned: 41 },
  incident:     { status: 'normal' }, // 'normal' | 'warning' | 'critical'

  /* 5 — Raporlama & Yetki */
  reports:      { lastRun: 'Bugün 09:00' },
  adminUsers:   { total: 5 }
};

/* ═══════════════════════════════════════════════════════════
   PERSONEL YÖNETİMİ — Seed Staff, Branches & Shifts
   ═══════════════════════════════════════════════════════════ */

/* Roller — Yetki sistemi ile uyumlu */
var ADMIN_STAFF_ROLES = [
  { id:'owner',       label:'İşletme Sahibi',    color:'#8B5CF6' },
  { id:'manager',     label:'Şube Müdürü',       color:'#3B82F6' },
  { id:'coordinator', label:'Koordinatör',       color:'#06B6D4' },
  { id:'chef',        label:'Mutfak Sorumlusu',  color:'#F59E0B' },
  { id:'waiter',      label:'Garson',            color:'#22C55E' },
  { id:'cashier',     label:'Kasiyer',           color:'#EC4899' },
  { id:'courier',     label:'Kurye',             color:'#EF4444' }
];

/* Şube kataloğu — ADMIN_BUSINESSES'in branchList'lerinden türetilir */
var ADMIN_BRANCHES = (function() {
  var out = [];
  for (var i = 0; i < ADMIN_BUSINESSES.length; i++) {
    var b = ADMIN_BUSINESSES[i];
    if (!b.branchList) continue;
    for (var j = 0; j < b.branchList.length; j++) {
      out.push({
        id: b.id + '_br' + (j + 1),
        businessId: b.id,
        businessName: b.name,
        name: b.branchList[j],
        city: b.city
      });
    }
  }
  return out;
})();

/* Vardiya üretici — her personel için geçmiş + gelecek 14 gün */
function _admGenShifts(baseDate, workRate) {
  var list = [];
  var start = new Date(baseDate);
  start.setDate(start.getDate() - 7);
  var shiftTemplates = [
    { start:'09:00', end:'17:00', label:'Gündüz' },
    { start:'14:00', end:'22:00', label:'Akşam' },
    { start:'22:00', end:'06:00', label:'Gece' },
    { start:'08:00', end:'14:00', label:'Sabah' }
  ];
  for (var d = 0; d < 14; d++) {
    var date = new Date(start);
    date.setDate(start.getDate() + d);
    // workRate: 0.0-1.0 arası çalışma yoğunluğu
    if (((d * 7 + 3) % 10) / 10 > (1 - workRate)) {
      var tpl = shiftTemplates[(d + Math.floor(workRate * 10)) % shiftTemplates.length];
      var now = new Date(baseDate);
      var status = date < now ? (Math.random() > 0.1 ? 'completed' : 'missed') : 'scheduled';
      list.push({
        date: date.toISOString().slice(0, 10),
        start: tpl.start,
        end: tpl.end,
        label: tpl.label,
        status: status
      });
    }
  }
  return list;
}

/* Personel listesi — 22 kişi, çoklu işletme/şube/rol */
var ADMIN_STAFF = (function() {
  var seed = [
    { n:'Ahmet Yılmaz',     p:'+905551100101', e:'ahmet.yilmaz@lezzetmutfak.com',   biz:'bz1',  br:0, r:'waiter',      created:'2026-04-15T14:32:00' },
    { n:'Elif Demir',       p:'+905551100102', e:'elif.demir@pidepalace.com',       biz:'bz2',  br:2, r:'manager',     created:'2026-04-12T09:15:00' },
    { n:'Burak Çelik',      p:'+905551100103', e:'burak.celik@burgerlab.com',       biz:'bz3',  br:0, r:'chef',        created:'2026-04-10T11:00:00' },
    { n:'Seda Kaya',        p:'+905551100104', e:'seda.kaya@sushimaster.com',       biz:'bz4',  br:1, r:'cashier',     created:'2026-04-08T16:45:00' },
    { n:'Murat Polat',      p:'+905551100105', e:'murat.polat@cigkofte.com',        biz:'bz5',  br:3, r:'courier',     created:'2026-04-05T08:20:00' },
    { n:'Gizem Aydın',      p:'+905551100106', e:'gizem.aydin@lezzetmutfak.com',    biz:'bz1',  br:1, r:'waiter',      created:'2026-04-03T13:10:00' },
    { n:'Kerem Öztürk',     p:'+905551100107', e:'kerem.ozturk@kebapcihakki.com',   biz:'bz9',  br:0, r:'chef',        created:'2026-03-28T10:00:00' },
    { n:'Aslı Güneş',       p:'+905551100108', e:'asli.gunes@dondurmababa.com',     biz:'bz12', br:1, r:'cashier',     created:'2026-03-25T15:30:00' },
    { n:'Hakan Ak',         p:'+905551100109', e:'hakan.ak@pidepalace.com',         biz:'bz2',  br:0, r:'courier',     created:'2026-03-22T09:45:00' },
    { n:'Nilay Şahin',      p:'+905551100110', e:'nilay.sahin@waffleuse.com',       biz:'bz7',  br:0, r:'waiter',      created:'2026-03-20T12:00:00' },
    { n:'Onur Kılıç',       p:'+905551100111', e:'onur.kilic@cigkofte.com',         biz:'bz5',  br:0, r:'manager',     created:'2026-03-18T17:15:00' },
    { n:'Deniz Koç',        p:'+905551100112', e:'deniz.koc@kebapcihakki.com',      biz:'bz9',  br:2, r:'courier',     created:'2026-03-15T08:30:00' },
    { n:'Ceren Yıldız',     p:'+905551100113', e:'ceren.yildiz@tatlicinene.com',    biz:'bz13', br:1, r:'waiter',      created:'2026-03-12T14:20:00' },
    { n:'Umut Er',          p:'+905551100114', e:'umut.er@lezzetmutfak.com',        biz:'bz1',  br:0, r:'courier',     created:'2026-03-10T11:40:00' },
    { n:'Melis Kaya',       p:'+905551100115', e:'melis.kaya@sushimaster.com',      biz:'bz4',  br:0, r:'chef',        created:'2026-03-05T16:00:00' },
    { n:'Tolga Arslan',     p:'+905551100116', e:'tolga.arslan@pidepalace.com',     biz:'bz2',  br:1, r:'waiter',      created:'2026-02-28T09:00:00' },
    { n:'Pelin Doğan',      p:'+905551100117', e:'pelin.dogan@cigkofte.com',        biz:'bz5',  br:1, r:'coordinator', created:'2026-02-25T13:30:00' },
    { n:'Cem Sönmez',       p:'+905551100118', e:'cem.sonmez@burgerlab.com',        biz:'bz3',  br:0, r:'waiter',      created:'2026-02-20T10:15:00' },
    { n:'Büşra Kurt',       p:'+905551100119', e:'busra.kurt@makarnadukkani.com',   biz:'bz15', br:0, r:'cashier',     created:'2026-02-15T15:45:00' },
    { n:'Emir Tunç',        p:'+905551100120', e:'emir.tunc@kebapcihakki.com',      biz:'bz9',  br:1, r:'chef',        created:'2026-02-10T08:30:00' },
    { n:'Yasemin Bulut',    p:'+905551100121', e:'yasemin.bulut@donercibaba.com',   biz:'bz12', br:0, r:'waiter',      created:'2026-02-05T12:20:00' },
    { n:'Kaan Özdemir',     p:'+905551100122', e:'kaan.ozdemir@lezzetmutfak.com',   biz:'bz1',  br:1, r:'manager',     created:'2026-01-28T14:00:00' }
  ];
  var out = [];
  for (var i = 0; i < seed.length; i++) {
    var s = seed[i];
    var biz = ADMIN_BUSINESSES.find(function(b) { return b.id === s.biz; });
    if (!biz || !biz.branchList) continue;
    var branchIdx = Math.min(s.br, biz.branchList.length - 1);
    var branchName = biz.branchList[branchIdx];
    var branchId = s.biz + '_br' + (branchIdx + 1);
    var surname = s.n.split(' ').pop().toLowerCase()
      .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u');
    var idNum = 1000 + i;
    out.push({
      id: 'ast_' + String(idNum).padStart(4, '0'),
      name: s.n,
      phone: s.p,
      email: s.e,
      username: surname + '.' + (1000 + ((i * 37) % 9000)),
      password: _admGenPassword(i),
      avatar: null,
      businessId: s.biz,
      businessName: biz.name,
      branchId: branchId,
      branchName: branchName,
      role: s.r,
      status: 'active',
      createdAt: s.created,
      shifts: _admGenShifts('2026-04-17T12:00:00', 0.55 + (i % 5) * 0.08)
    });
  }
  // En yeni en üstte
  out.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  return out;
})();

/* Random password helper (seed-seçici, tutarlılık için index bazlı) */
function _admGenPassword(seed) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var out = '';
  var n = seed * 7919 + 104729;
  for (var i = 0; i < 10; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    out += chars[n % chars.length];
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════
   KOMİSYON AYARLARI — Kriterler, Kurallar, İptal Oranları
   ═══════════════════════════════════════════════════════════ */

/* Değerlendirme kriteri kataloğu — her kriter kendi "operator"leri ile */
var ADMIN_COMMISSION_CRITERIA = [
  {
    id: 'rating',
    label: 'İşletme Puanı',
    icon: 'solar:star-bold',
    color: '#F59E0B',
    unit: '★',
    ranges: [
      { id: 'r_50',    label: '5.0 (Mükemmel)' },
      { id: 'r_48_49', label: '4.8 – 4.9' },
      { id: 'r_45_47', label: '4.5 – 4.7' },
      { id: 'r_40_44', label: '4.0 – 4.4' },
      { id: 'r_35_39', label: '3.5 – 3.9' },
      { id: 'r_lt_35', label: '< 3.5' }
    ]
  },
  {
    id: 'monthlyOrders',
    label: 'Aylık Sipariş Hacmi',
    icon: 'solar:bag-check-bold',
    color: '#3B82F6',
    unit: '',
    ranges: [
      { id: 'o_gt2000',    label: '> 2.000' },
      { id: 'o_1000_2000', label: '1.000 – 2.000' },
      { id: 'o_500_999',   label: '500 – 999' },
      { id: 'o_100_499',   label: '100 – 499' },
      { id: 'o_lt100',     label: '< 100' }
    ]
  },
  {
    id: 'prepTime',
    label: 'Ort. Hazırlık Süresi',
    icon: 'solar:chef-hat-bold',
    color: '#8B5CF6',
    unit: 'dk',
    ranges: [
      { id: 'p_lt15',   label: '< 15 dk' },
      { id: 'p_15_25',  label: '15 – 25 dk' },
      { id: 'p_25_40',  label: '25 – 40 dk' },
      { id: 'p_gt40',   label: '> 40 dk' }
    ]
  },
  {
    id: 'satisfaction',
    label: 'Müşteri Memnuniyeti',
    icon: 'solar:heart-bold',
    color: '#EC4899',
    unit: '%',
    ranges: [
      { id: 's_gt90',  label: '> %90' },
      { id: 's_80_90', label: '%80 – %90' },
      { id: 's_70_79', label: '%70 – %79' },
      { id: 's_lt70',  label: '< %70' }
    ]
  },
  {
    id: 'branches',
    label: 'Şube Sayısı',
    icon: 'solar:buildings-bold',
    color: '#06B6D4',
    unit: '',
    ranges: [
      { id: 'b_1',     label: 'Tekil İşletme' },
      { id: 'b_2_4',   label: '2 – 4 Şube' },
      { id: 'b_5_10',  label: '5 – 10 Şube' },
      { id: 'b_gt10',  label: '10+ Şube (Zincir)' }
    ]
  }
];

/* Aktif komisyon kuralları — kategori bazlı (online / masa) */
var ADMIN_COMMISSION_RULES = [
  /* ── Online Siparişler ── */
  { id: 'cr_on_1', category: 'online', criterionA: { criterion:'rating',        range:'r_50' },      criterionB: { criterion:'satisfaction', range:'s_gt90' },  rate: 5.5, updatedAt: '2026-03-20T10:00:00' },
  { id: 'cr_on_2', category: 'online', criterionA: { criterion:'rating',        range:'r_48_49' },   criterionB: { criterion:'monthlyOrders', range:'o_gt2000' }, rate: 7.0, updatedAt: '2026-03-20T10:00:00' },
  { id: 'cr_on_3', category: 'online', criterionA: { criterion:'rating',        range:'r_45_47' },   criterionB: { criterion:'prepTime',     range:'p_lt15' },  rate: 9.0, updatedAt: '2026-03-20T10:00:00' },
  { id: 'cr_on_4', category: 'online', criterionA: { criterion:'rating',        range:'r_40_44' },   criterionB: { criterion:'satisfaction', range:'s_80_90' }, rate: 11.0, updatedAt: '2026-03-20T10:00:00' },
  { id: 'cr_on_5', category: 'online', criterionA: { criterion:'rating',        range:'r_35_39' },   criterionB: { criterion:'monthlyOrders', range:'o_100_499' }, rate: 13.0, updatedAt: '2026-03-20T10:00:00' },

  /* ── Masa Siparişleri ── */
  { id: 'cr_ma_1', category: 'masa', criterionA: { criterion:'rating',        range:'r_50' },      criterionB: { criterion:'prepTime',     range:'p_lt15' },  rate: 3.0, updatedAt: '2026-03-15T14:00:00' },
  { id: 'cr_ma_2', category: 'masa', criterionA: { criterion:'rating',        range:'r_48_49' },   criterionB: { criterion:'satisfaction', range:'s_gt90' },  rate: 4.5, updatedAt: '2026-03-15T14:00:00' },
  { id: 'cr_ma_3', category: 'masa', criterionA: { criterion:'rating',        range:'r_45_47' },   criterionB: { criterion:'branches',     range:'b_2_4' },  rate: 6.0, updatedAt: '2026-03-15T14:00:00' },
  { id: 'cr_ma_4', category: 'masa', criterionA: { criterion:'rating',        range:'r_40_44' },   criterionB: { criterion:'monthlyOrders', range:'o_500_999' }, rate: 8.0, updatedAt: '2026-03-15T14:00:00' }
];

/* Dinamik İptal Komisyonları — mevcut komisyonun % */
var ADMIN_CANCEL_COMMISSION = {
  userCancel:   { label: 'Kullanıcı İptal — Hizmet Bedeli', rate: 50, description: 'Kullanıcı siparişi iptal ettiğinde, işletmeden mevcut komisyonun %X\'i token olarak kesilir.' },
  bizCancel:    { label: 'İşletme İptal — Cayma Bedeli',    rate: 25, description: 'İşletme siparişi iptal ettiğinde, mevcut komisyonun %X\'i kadar ek ceza uygulanır.' },
  updatedAt: '2026-03-20T10:00:00'
};

/* ═══════════════════════════════════════════════════════════
   PREMIUM PLAN — Özellik Katalogları, Planlar, Üyeler
   ═══════════════════════════════════════════════════════════ */

/* ── Kullanıcı Premium Özellik Kataloğu ── */
var ADMIN_PREMIUM_USER_FEATURES = [
  { id:'u_noads',       label:'Reklamsız Kullanım',         icon:'solar:shield-cross-bold',     description:'Tüm uygulamada reklam gösterilmez' },
  { id:'u_recipes',     label:'Özel Tarif Erişimi',          icon:'solar:chef-hat-heart-bold',    description:'Şefe özel, sınırlı tarif arşivi' },
  { id:'u_ai',          label:'AI Asistan (Süresiz)',        icon:'solar:magic-stick-3-bold',     description:'Aylık sorgu limiti yok' },
  { id:'u_handsfree',   label:'Hands-Free Pişirme',          icon:'solar:microphone-bold',        description:'Sesli tarif yönlendirme' },
  { id:'u_planner',     label:'Haftalık Planlama',           icon:'solar:calendar-bold',          description:'Özel menü + alışveriş listesi' },
  { id:'u_bmi',         label:'BMI & Sağlık Analizi',        icon:'solar:heart-pulse-bold',       description:'Kişiye özel kalori önerisi' },
  { id:'u_community',   label:'Özel Topluluk Erişimi',       icon:'solar:users-group-two-rounded-bold', description:'Şeflerle canlı soru-cevap' },
  { id:'u_savings',     label:'Token Cashback +%5',          icon:'solar:wallet-money-bold',      description:'Her siparişte ekstra %5 cashback' },
  { id:'u_priority',    label:'Öncelikli Destek',            icon:'solar:headphones-round-sound-bold', description:'7/24 hat önceliği' },
  { id:'u_unlimited',   label:'Sınırsız Favori & Liste',     icon:'solar:heart-bold',             description:'Kayıt limiti yok' }
];

/* Aktif Kullanıcı Premium Planı */
var ADMIN_PREMIUM_USER_PLAN = {
  activeFeatures: ['u_noads','u_recipes','u_ai','u_handsfree','u_planner','u_bmi','u_savings','u_priority'],
  pricing: { monthly: 59, yearly: 590 },
  currency: '₺',
  updatedAt: '2026-03-20T10:00:00'
};

/* ── İşletme Premium Özellik Kataloğu ── */
var ADMIN_PREMIUM_BIZ_FEATURES = [
  { id:'b_dashboard',    label:'Gelişmiş Dashboard',         icon:'solar:chart-2-bold' },
  { id:'b_staff',        label:'Sınırsız Personel',           icon:'solar:users-group-rounded-bold' },
  { id:'b_branches',     label:'Çoklu Şube Yönetimi',         icon:'solar:buildings-bold' },
  { id:'b_kitchen',      label:'Mutfak İstasyonu Paneli',     icon:'solar:chef-hat-bold' },
  { id:'b_tables',       label:'Masa & QR Menü Yönetimi',     icon:'solar:qr-code-bold' },
  { id:'b_stock',        label:'Canlı Stok Takibi',           icon:'solar:boxes-bold' },
  { id:'b_analytics',    label:'Satış & Trend Analizi',       icon:'solar:graph-up-bold' },
  { id:'b_ai',           label:'AI Menü Optimizasyonu',       icon:'solar:magic-stick-3-bold' },
  { id:'b_commission',   label:'İndirimli Komisyon',          icon:'solar:pie-chart-2-bold' },
  { id:'b_ads',          label:'Reklam Alanı (Öne Çıkar)',    icon:'solar:megaphone-bold' },
  { id:'b_support',      label:'7/24 Öncelikli Destek',       icon:'solar:headphones-round-sound-bold' },
  { id:'b_api',          label:'API & Entegrasyon Erişimi',   icon:'solar:code-square-bold' },
  { id:'b_branding',     label:'Beyaz Etiket (White-label)',  icon:'solar:crown-bold' },
  { id:'b_coupons',      label:'Kupon & Kampanya Sihirbazı',  icon:'solar:tag-price-bold' }
];

/* İşletme Premium — 3 Katmanlı Plan */
var ADMIN_PREMIUM_BIZ_PLANS = [
  {
    id:'tier_standard',
    label:'Standart',
    tagline:'Tek şube • Temel analitik',
    tier:'silver',
    accent:'#94A3B8',
    accentSoft:'#CBD5E1',
    features:['b_dashboard','b_staff','b_tables','b_stock','b_commission'],
    pricing:{ monthly:500, yearly:5000 },
    updatedAt:'2026-03-15T10:00:00'
  },
  {
    id:'tier_plus',
    label:'Plus',
    tagline:'Çoklu şube • Gelişmiş raporlar',
    tier:'plus',
    accent:'#8B5CF6',
    accentSoft:'#C4B5FD',
    features:['b_dashboard','b_staff','b_branches','b_kitchen','b_tables','b_stock','b_analytics','b_commission','b_coupons'],
    pricing:{ monthly:1250, yearly:12500 },
    updatedAt:'2026-03-15T10:00:00'
  },
  {
    id:'tier_pro',
    label:'Pro',
    tagline:'Kurumsal • Tam paket + API',
    tier:'gold',
    accent:'#F59E0B',
    accentSoft:'#FCD34D',
    features:['b_dashboard','b_staff','b_branches','b_kitchen','b_tables','b_stock','b_analytics','b_ai','b_commission','b_ads','b_support','b_api','b_branding','b_coupons'],
    pricing:{ monthly:2800, yearly:28000 },
    updatedAt:'2026-03-15T10:00:00'
  }
];

/* ── Premium Üye Listesi — biz (ADMIN_BUSINESSES plan:'premium') ve user (ADMIN_USERS isPremium) türevli ── */
var ADMIN_PREMIUM_MEMBERS = (function() {
  var out = { biz: [], user: [] };

  // İşletme üyeleri
  var bizPlanAssign = {
    bz1:'tier_plus', bz2:'tier_pro', bz4:'tier_plus', bz5:'tier_pro',
    bz7:'tier_standard', bz9:'tier_pro', bz12:'tier_plus', bz13:'tier_pro'
  };
  if (typeof ADMIN_BUSINESSES !== 'undefined') {
    for (var i = 0; i < ADMIN_BUSINESSES.length; i++) {
      var b = ADMIN_BUSINESSES[i];
      if (b.plan !== 'premium') continue;
      var tier = bizPlanAssign[b.id] || 'tier_standard';
      out.biz.push({
        id: 'mbz_' + b.id,
        bizId: b.id,
        name: b.name,
        owner: b.owner,
        tier: tier,
        startDate: b.joinDate,
        endDate: b.planExpiry,
        billingCycle: (i % 3 === 0 ? 'yearly' : 'monthly')
      });
    }
  }

  // Kullanıcı üyeleri — ADMIN_USERS.isPremium
  if (typeof ADMIN_USERS !== 'undefined') {
    var billingCycles = ['monthly','yearly','monthly','yearly','monthly'];
    var cy = 0;
    for (var u = 0; u < ADMIN_USERS.length; u++) {
      var usr = ADMIN_USERS[u];
      if (!usr.isPremium) continue;
      var start = usr.joinDate || '2025-08-01';
      var end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      out.user.push({
        id: 'mur_' + usr.id,
        userId: usr.id,
        name: usr.name,
        email: usr.email,
        avatar: null,
        startDate: (start instanceof Date) ? start.toISOString().slice(0,10) : start,
        endDate: end.toISOString().slice(0,10),
        billingCycle: billingCycles[cy++ % billingCycles.length]
      });
    }
  }

  return out;
})();

/* ═══════════════════════════════════════════════════════════
   KARA LİSTE — Kısıtlama Kataloğu, Aktif Cezalar, Sabıka Kaydı
   ═══════════════════════════════════════════════════════════ */

/* Engelleme modunda kullanılabilecek kısıtlama toggle'ları */
var ADMIN_PENALTY_RESTRICTIONS = [
  { id:'no_recipe',      label:'Tarif paylaşımı',       icon:'solar:chef-hat-bold',           description:'Yeni tarif yükleyemez ve paylaşamaz' },
  { id:'no_post',        label:'İçerik paylaşımı',      icon:'solar:gallery-bold',            description:'Hikaye, gönderi veya yorum paylaşamaz' },
  { id:'no_order',       label:'Online sipariş',        icon:'solar:bag-check-bold',          description:'Online sipariş vermesi engellenir' },
  { id:'no_table_order', label:'Masa siparişi',         icon:'solar:table-2-bold',            description:'QR/Masa üzerinden sipariş veremez' },
  { id:'no_waiter_call', label:'Garson çağırma',        icon:'solar:bell-bold',               description:'Restoranda garson çağırma özelliği kapatılır' },
  { id:'no_ai',          label:'Yapay Zeka asistanı',   icon:'solar:magic-stick-3-bold',      description:'AI asistan ve öneri sistemini kullanamaz' },
  { id:'no_like',        label:'Beğenme / Yorum',       icon:'solar:heart-bold',              description:'Diğer içeriklere beğeni veya yorum yapamaz' }
];

/* Ceza sebebi preset'leri (wizard için) */
var ADMIN_PENALTY_REASONS = [
  'Uygunsuz içerik paylaşımı',
  'Taciz veya hakaret',
  'Spam / tekrar eden gönderi',
  'Sahte değerlendirme',
  'Ödeme sorunu / iade suistimali',
  'Platform kurallarını ihlal',
  'Kullanıcı şikayeti (çoklu)',
  'Diğer'
];

/* Aktif ceza kaydı */
var ADMIN_PENALTIES = [
  /* ── Kullanıcı cezaları ── */
  {
    id:'pen_001', subjectType:'user', subjectId:'u6', subjectName:'Zehra Aydın',
    type:'ban', reason:'Taciz veya hakaret',
    createdAt:'2026-03-20T10:00:00', expiresAt:null,
    userNote:'Platform kurallarını ihlal nedeniyle hesabınız kalıcı olarak askıya alınmıştır.',
    adminNote:'Birden fazla şikayet aldıktan sonra kalıcı ban uygulandı. 3 farklı kullanıcıdan taciz raporu.',
    restrictions:[],
    appliedBy:'Admin'
  },
  {
    id:'pen_002', subjectType:'user', subjectId:'u12', subjectName:'Hasan Yılmaz',
    type:'restriction', reason:'Sahte değerlendirme',
    createdAt:'2026-04-05T14:30:00', expiresAt:'2026-05-05T14:30:00',
    userNote:'Sahte yorum tespiti nedeniyle 30 gün boyunca yorum yapamayacaksınız.',
    adminNote:'Aynı işletmeye 5 farklı hesaptan yorum bırakmış. 3. uyarı.',
    restrictions:['no_like','no_post'],
    appliedBy:'Admin'
  },
  {
    id:'pen_003', subjectType:'user', subjectId:'u18', subjectName:'Murat Demir',
    type:'restriction', reason:'Spam / tekrar eden gönderi',
    createdAt:'2026-04-10T08:15:00', expiresAt:'2026-04-24T08:15:00',
    userNote:'Spam içerik nedeniyle 14 gün sipariş veremeyeceksiniz.',
    adminNote:'Sürekli aynı kampanyayı spam şeklinde paylaşıyor.',
    restrictions:['no_order','no_post','no_like'],
    appliedBy:'Admin'
  },
  /* ── İşletme cezaları ── */
  {
    id:'pen_004', subjectType:'biz', subjectId:'bz8', subjectName:'Tantuni Evi',
    type:'ban', reason:'Ödeme sorunu / iade suistimali',
    createdAt:'2026-03-10T09:00:00', expiresAt:null,
    userNote:'İşletmeniz platform kurallarını ihlal nedeniyle askıya alınmıştır.',
    adminNote:'Ödeme ihtilafı, müşteriye ulaşmama, token geri ödeme gerçekleşmedi.',
    restrictions:[],
    appliedBy:'Admin'
  },
  {
    id:'pen_005', subjectType:'biz', subjectId:'bz14', subjectName:'Kumpir Evi',
    type:'restriction', reason:'Kullanıcı şikayeti (çoklu)',
    createdAt:'2026-04-02T16:20:00', expiresAt:'2026-05-02T16:20:00',
    userNote:'30 gün boyunca öne çıkan listelerden kaldırıldınız.',
    adminNote:'Puanı 3.2\'ye düştü, son ayda 12 olumsuz yorum.',
    restrictions:['no_post'],
    appliedBy:'Admin'
  }
];

/* Sabıka kaydı / geçmiş uyarılar — subjectId bazlı */
var ADMIN_PENALTY_HISTORY = [
  /* u6 — Zehra (şu an ban) */
  { id:'hist_001', subjectType:'user', subjectId:'u6', date:'2025-11-04T10:00:00', action:'warning',     reason:'Uygunsuz yorum', note:'Yazılı uyarı' },
  { id:'hist_002', subjectType:'user', subjectId:'u6', date:'2026-01-15T14:20:00', action:'restriction', reason:'Yorumda hakaret', note:'7 gün engel' },
  { id:'hist_003', subjectType:'user', subjectId:'u6', date:'2026-03-20T10:00:00', action:'ban',         reason:'Taciz/hakaret', note:'Kalıcı ban' },
  /* u12 — Hasan */
  { id:'hist_004', subjectType:'user', subjectId:'u12', date:'2025-12-10T11:30:00', action:'warning',     reason:'Sahte yorum', note:'Uyarı' },
  { id:'hist_005', subjectType:'user', subjectId:'u12', date:'2026-02-08T09:15:00', action:'restriction', reason:'Sahte yorum (tekrar)', note:'14 gün yorum engeli' },
  { id:'hist_006', subjectType:'user', subjectId:'u12', date:'2026-04-05T14:30:00', action:'restriction', reason:'Sahte yorum', note:'30 gün engel (mevcut)' },
  /* u18 — Murat */
  { id:'hist_007', subjectType:'user', subjectId:'u18', date:'2026-04-10T08:15:00', action:'restriction', reason:'Spam', note:'İlk ihlal' },
  /* bz8 — Tantuni Evi */
  { id:'hist_008', subjectType:'biz', subjectId:'bz8', date:'2025-12-20T10:00:00', action:'warning',     reason:'Geç teslimat', note:'Uyarı' },
  { id:'hist_009', subjectType:'biz', subjectId:'bz8', date:'2026-02-01T14:00:00', action:'restriction', reason:'İade sorunu', note:'15 gün öncelik kaybı' },
  { id:'hist_010', subjectType:'biz', subjectId:'bz8', date:'2026-03-10T09:00:00', action:'ban',         reason:'Ödeme suistimali', note:'Kalıcı askı' },
  /* bz14 — Kumpir Evi */
  { id:'hist_011', subjectType:'biz', subjectId:'bz14', date:'2026-03-15T12:00:00', action:'warning',     reason:'Puan düşüşü', note:'Uyarı' },
  { id:'hist_012', subjectType:'biz', subjectId:'bz14', date:'2026-04-02T16:20:00', action:'restriction', reason:'Çoklu şikayet', note:'30 gün (mevcut)' }
];

/* ═══════════════════════════════════════════════════════════
   ŞİKAYET PANELİ — Kategoriler ve Zenginleştirilmiş Şikayetler
   ═══════════════════════════════════════════════════════════ */

var ADMIN_COMPLAINT_CATEGORIES = [
  { id:'order',   label:'Sipariş Şikayeti',    icon:'solar:bag-check-bold',        color:'#3B82F6' },
  { id:'content', label:'İçerik Şikayeti',     icon:'solar:gallery-bold',          color:'#8B5CF6' },
  { id:'user',    label:'Kullanıcı Davranışı', icon:'solar:user-cross-rounded-bold', color:'#EF4444' }
];

/* Mevcut ADMIN_REPORTS kayıtlarına zengin şikayet verisi ekle + yeni kayıtlar */
(function() {
  if (typeof ADMIN_REPORTS === 'undefined') return;

  // Eski 3 kayda category ve boş alanlar doldur (geriye dönük uyum)
  var legacyMap = {
    rp1: { category:'content', subject:'Spam içerik paylaşımı',   description:'Bu işletme aynı kampanyayı ard arda 7 kez paylaştı. Feed kirliliği yaratıyor.', reporterId:'u2', reporterAvatar:null,
      evidence:{ kind:'post', postId:'p_spam_01', authorName:'Tantuni Evi', authorHandle:'@tantunievi', text:'🔥🔥 %50 İndirim sadece bugün! 🔥🔥 KAÇIRMA KAÇIRMA KAÇIRMA!', image:null, likes:2, comments:0, postedAt:'2026-04-15T22:10:00' } },
    rp2: { category:'content', subject:'Hakaret içeren yorum',     description:'Bir müşteri yorumda küfürlü ifadeler kullandı.', reporterId:'u1', reporterAvatar:null,
      evidence:{ kind:'review', reviewId:'rv_9812', reviewerName:'Anonim Kullanıcı', rating:1, text:'Yemek *** gibiydi, çalışanları *** bunlar! ASLA GİTMEYİN.', business:'Pizza Napoli', postedAt:'2026-04-15T14:20:00' } },
    rp3: { category:'content', subject:'Yanıltıcı kampanya',        description:'"Ücretsiz teslimat" ilanı var ama kasada teslimat ücreti kesildi.', reporterId:'u5', reporterAvatar:null,
      evidence:{ kind:'post', postId:'p_mis_03', authorName:'Kumpir Evi', authorHandle:'@kumpirevi', text:'Tüm siparişler ÜCRETSİZ TESLİMAT! 🚀', image:null, likes:45, comments:8, postedAt:'2026-04-13T09:00:00' },
      adminNote:'İşletmeyle görüşüldü, kampanya detayında minimum sepet tutarı eksik bulundu. Uyarı verildi, gönderi güncellendi.',
      userNote:'Şikayetiniz değerlendirilmiş olup işletme uyarılmıştır. Teslimat ücretiniz iade edildi.',
      resolvedAt:'2026-04-14T15:30:00', resolvedBy:'Admin' }
  };

  for (var i = 0; i < ADMIN_REPORTS.length; i++) {
    var rp = ADMIN_REPORTS[i];
    var patch = legacyMap[rp.id] || {};
    for (var k in patch) rp[k] = patch[k];
    if (!rp.category) rp.category = 'content';
    if (!rp.subject) rp.subject = rp.target || '';
    if (!rp.reporterId) rp.reporterId = null;
    if (!rp.description) rp.description = '';
    if (!rp.adminNote) rp.adminNote = '';
    if (!rp.userNote) rp.userNote = '';
  }

  // Yeni zengin şikayetler
  var extra = [
    {
      id:'rp4', category:'order', type:'order', status:'pending', date:'2026-04-16T14:05:00',
      reportedBy:'Sude Korkmaz', reporterId:'u3', reporterAvatar:null,
      target:'Eksik ürün teslimi', subject:'Siparişim eksik geldi',
      description:'3 farklı ürün siparişi verdim, kurye 1 ürünü getirmedi ama sistem "teslim edildi" yazıyor.',
      evidence:{ kind:'order', orderId:'#104275', business:'Pizza Napoli', branch:'Nilüfer', total:160, items:['Margherita Pizza x1','Cola x1','Tiramisu x1 (EKSİK)'], courier:'Ahmet T.', deliveredAt:'2026-04-16T13:45:00', paymentMethod:'Kart' }
    },
    {
      id:'rp5', category:'order', type:'order', status:'pending', date:'2026-04-16T11:30:00',
      reportedBy:'Onur Çetin', reporterId:'u4', reporterAvatar:null,
      target:'Yanlış ürün teslimi', subject:'İstediğim ürün yerine farklı ürün geldi',
      description:'Lahmacun istemiştim, pide geldi. Kurye değişmem için geri dönmedi.',
      evidence:{ kind:'order', orderId:'#104276', business:'Kebapçı Hakkı', branch:'Merkez', total:380, items:['Beyti Kebap x1','Pide x3 (YANLIŞ — Lahmacun olmalıydı)','Ayran x4'], courier:'Murat Y.', deliveredAt:'2026-04-16T11:15:00', paymentMethod:'Token' }
    },
    {
      id:'rp6', category:'user', type:'user', status:'pending', date:'2026-04-16T09:20:00',
      reportedBy:'İrem Yılmaz', reporterId:'u7', reporterAvatar:null,
      target:'Hasan Yılmaz — spam mesaj',
      subject:'Sürekli rahatsız edici DM atıyor',
      description:'Bir yorumuma itirazdan başlayıp kişisel saldırıya dönüştü. Son 3 günde 40+ mesaj.',
      evidence:{ kind:'user', userId:'u12', userName:'Hasan Yılmaz', userHandle:'@hasan_y', userAvatar:null, joinDate:'2025-09-10',
        messages:[
          { from:'Hasan Yılmaz', text:'Yorumun sildirirsin tatlım 😉', date:'2026-04-13T21:00:00' },
          { from:'Hasan Yılmaz', text:'İstemediğim cevap aldığımda ne yaparım biliyor musun?', date:'2026-04-14T01:15:00' },
          { from:'Hasan Yılmaz', text:'Eee cevap ver', date:'2026-04-14T08:30:00' },
          { from:'Hasan Yılmaz', text:'(+37 mesaj daha)', date:'2026-04-16T09:10:00' }
        ]
      }
    },
    {
      id:'rp7', category:'content', type:'story', status:'pending', date:'2026-04-16T07:45:00',
      reportedBy:'Cem Arslan', reporterId:'u8', reporterAvatar:null,
      target:'Uygunsuz görsel içerik',
      subject:'Hikayede uygunsuz görsel',
      description:'Gıda hijyenine aykırı, midemi bulandırıcı görsel paylaşılmış.',
      evidence:{ kind:'story', storyId:'st_4417', authorName:'Vegan Kitchen', authorHandle:'@vegankitchen', text:'Bugünün taze malzemeleri!', image:'[görsel önizleme]', expired:false, postedAt:'2026-04-16T07:00:00' }
    },
    {
      id:'rp8', category:'content', type:'recipe', status:'pending', date:'2026-04-15T20:10:00',
      reportedBy:'Aylin Kara', reporterId:'u9', reporterAvatar:null,
      target:'Tarif intihali',
      subject:'Benim tarifim kopyalanmış',
      description:'3 ay önce paylaştığım tarif, aynı görseller ve metinlerle başka bir kullanıcı tarafından tekrar yayımlanmış.',
      evidence:{ kind:'recipe', recipeId:'rc_221', authorName:'Mert Özkan', authorHandle:'@mertusta', title:'Klasik Mantı', ingredients:8, steps:12, image:'[görsel]', postedAt:'2026-04-15T15:00:00' }
    },
    {
      id:'rp9', category:'order', type:'order', status:'pending', date:'2026-04-15T18:30:00',
      reportedBy:'Burak Yıldız', reporterId:'u10', reporterAvatar:null,
      target:'Geç teslimat — ürün soğuk',
      subject:'Sipariş 1.5 saat gecikti',
      description:'Tahmini 30 dk yazıyordu, 90 dk sonra geldi. Yemek tamamen soğumuştu.',
      evidence:{ kind:'order', orderId:'#104265', business:'Çiğ Köfte Express', branch:'Pendik', total:95, items:['Çiğ Köfte Dürüm x2','Şalgam x2'], courier:'Serkan A.', deliveredAt:'2026-04-15T18:20:00', paymentMethod:'Nakit' }
    },
    {
      id:'rp10', category:'user', type:'user', status:'resolved', date:'2026-04-13T12:00:00',
      reportedBy:'Elif Demir', reporterId:'u11', reporterAvatar:null,
      target:'Murat Demir — spam yorum',
      subject:'Aynı yorumu 50+ kez bıraktı',
      description:'Kampanya linkli aynı yorumu farklı işletmelerin altına bıraktı.',
      evidence:{ kind:'user', userId:'u18', userName:'Murat Demir', userHandle:'@mdemir', userAvatar:null, joinDate:'2025-12-01',
        comments:[
          { on:'Lezzet Mutfak', text:'Sen de şu linki dene kazan 💰 bit.ly/xxx', date:'2026-04-12T19:00:00' },
          { on:'Pide Palace', text:'Sen de şu linki dene kazan 💰 bit.ly/xxx', date:'2026-04-12T19:02:00' },
          { on:'Burger Lab',  text:'Sen de şu linki dene kazan 💰 bit.ly/xxx', date:'2026-04-12T19:03:00' },
          { on:'(+48 aynı yorum daha)', text:'', date:'2026-04-12T20:00:00' }
        ]
      },
      adminNote:'Tekrarlayan spam. 14 gün sipariş ve yorum yasağı uygulandı. Kara Liste #pen_003 ile bağlandı.',
      userNote:'Bildirdiğiniz kullanıcı hakkında inceleme tamamlanmış ve 14 gün süreli kısıtlama uygulanmıştır. Katkınız için teşekkür ederiz.',
      resolvedAt:'2026-04-14T09:30:00', resolvedBy:'Admin'
    },
    {
      id:'rp11', category:'content', type:'post', status:'resolved', date:'2026-04-12T10:00:00',
      reportedBy:'Zehra Aydın', reporterId:'u14', reporterAvatar:null,
      target:'Yanlış bilgi — tarif',
      subject:'Alerjen bilgisi eksik paylaşım',
      description:'Gluten içeren tarifte "glutensiz" etiketi kullanılmış. Çocuğum reaksiyon verebilirdi.',
      evidence:{ kind:'post', postId:'p_alj_08', authorName:'Tatlıcı Nene', authorHandle:'@tatlicinene', text:'Glutensiz kurabiyeler (tarif aşağıda!)', image:'[görsel]', likes:120, comments:18, postedAt:'2026-04-11T16:00:00' },
      adminNote:'İşletme ile görüşüldü — etiketler düzeltildi. Kendisine alerjen sorumluluğu eğitimi önerildi.',
      userNote:'Uyarınız önemliydi, teşekkürler. İşletme içerik ve etiketlerini güncelledi.',
      resolvedAt:'2026-04-13T11:45:00', resolvedBy:'Admin'
    },
    {
      id:'rp12', category:'order', type:'order', status:'resolved', date:'2026-04-10T21:15:00',
      reportedBy:'Melis Tan', reporterId:'u15', reporterAvatar:null,
      target:'İptal edilen sipariş — iade sorunu',
      subject:'İade 5 gündür yapılmadı',
      description:'İşletme stok yok deyip iptal etti ama 230₺ token iademi alamadım.',
      evidence:{ kind:'order', orderId:'#104272', business:'Lezzet Mutfak', branch:'Beşiktaş', total:450, items:['Kuzu Tandır x2','Mercimek Çorba x2','Kadayıf x1'], cancelReason:'Malzeme stok tükendi', deliveredAt:null, paymentMethod:'Token' },
      adminNote:'Finans ekibi ile görüşüldü, işlem sistem gecikmesi imiş. Token elle iade edildi.',
      userNote:'230 token cüzdanınıza yatırılmıştır. Yaşattığımız gecikme için özür dileriz.',
      resolvedAt:'2026-04-12T14:00:00', resolvedBy:'Admin'
    },
    {
      id:'rp13', category:'user', type:'user', status:'pending', date:'2026-04-16T15:50:00',
      reportedBy:'Selin Er', reporterId:'u16', reporterAvatar:null,
      target:'Sahte hesap şüphesi',
      subject:'Bu profil gerçek görünmüyor',
      description:'Aynı görseli farklı 4 hesapta gördüm. Sahte hesap gibi duruyor.',
      evidence:{ kind:'user', userId:'u_fake_01', userName:'Cansu Y.', userHandle:'@cansu_foodie', userAvatar:null, joinDate:'2026-04-10',
        notes:'Hesap 6 gün önce açıldı, 80 takipçi kazandı ama hiç paylaşım yok. Bio boş. Profil fotoğrafı stok görsel.'
      }
    },
    {
      id:'rp14', category:'order', type:'order', status:'pending', date:'2026-04-16T10:00:00',
      reportedBy:'Arda Koç', reporterId:'u17', reporterAvatar:null,
      target:'Ücret farkı itirazı',
      subject:'Sepetteki fiyat kasada arttı',
      description:'Menüde 120₺ yazan ürün 145₺ kesildi.',
      evidence:{ kind:'order', orderId:'#104282', business:'Waffle House', branch:'Bağdat Cad', total:145, items:['Çikolatalı Waffle x1','Çay x2'], menuPrice:120, chargedPrice:145, paymentMethod:'Kart' }
    },
    {
      id:'rp15', category:'content', type:'story', status:'pending', date:'2026-04-16T12:20:00',
      reportedBy:'Naz Demir', reporterId:'u19', reporterAvatar:null,
      target:'Rakibe yönelik karalama',
      subject:'Başka işletmeye karalama hikayesi',
      description:'Bir işletmenin adını anarak kötü görsel paylaşımı yapılmış.',
      evidence:{ kind:'story', storyId:'st_5812', authorName:'Pizza Napoli', authorHandle:'@pizzanapoli', text:'FALANCA PIZZA = ÇÖP 🤮', image:'[görsel]', expired:false, postedAt:'2026-04-16T11:30:00' }
    }
  ];

  for (var j = 0; j < extra.length; j++) ADMIN_REPORTS.push(extra[j]);
})();

/* ═══════════════════════════════════════════════════════════
   REKLAM ALANI — Placement Katalog + Reklam Veren Kampanyaları
   ═══════════════════════════════════════════════════════════ */

/* 8 reklam yerleşimi, 3 grup halinde */
var ADMIN_AD_PLACEMENTS = [
  /* Konum Odaklı */
  { id:'p_rest_list',  group:'location', groupLabel:'Konum Odaklı',
    label:'Restoran Listeleme',  icon:'solar:shop-bold',
    description:'Konumdaki restoran listesinde üst sıralarda yer alma',
    pricePerImpression: 2.5, dailyFreqCap: 5, region:'İl bazlı', color:'#3B82F6',
    updatedAt:'2026-03-15T10:00:00' },
  { id:'p_recipe_disc', group:'location', groupLabel:'Konum Odaklı',
    label:'Tarif Keşfi',  icon:'solar:chef-hat-heart-bold',
    description:'Yakındaki kullanıcıların tarifler sekmesinde işletme görünümü',
    pricePerImpression: 1.8, dailyFreqCap: 4, region:'5 km çap', color:'#F59E0B',
    updatedAt:'2026-03-15T10:00:00' },
  { id:'p_local_story', group:'location', groupLabel:'Konum Odaklı',
    label:'Yerel Hikayeler',  icon:'solar:gallery-wide-bold',
    description:'Konumdaki kullanıcıların hikaye akışında reklam',
    pricePerImpression: 3.0, dailyFreqCap: 3, region:'İlçe bazlı', color:'#EC4899',
    updatedAt:'2026-03-15T10:00:00' },

  /* İçerik & AI */
  { id:'p_smart_match', group:'content', groupLabel:'İçerik & AI Odaklı',
    label:'Akıllı Eşleşme',  icon:'solar:magic-stick-3-bold',
    description:'Tarif içeriği ile menü ürünü örtüştüğünde tarif içi yerleşim',
    pricePerImpression: 4.2, dailyFreqCap: 2, region:'Ülke geneli', color:'#8B5CF6',
    updatedAt:'2026-03-15T10:00:00' },
  { id:'p_ai_assist',   group:'content', groupLabel:'İçerik & AI Odaklı',
    label:'AI Asistan Reklamı',  icon:'solar:widget-5-bold',
    description:'AI ile tarif/yer arayanlara öneri olarak işletme sunumu',
    pricePerImpression: 5.0, dailyFreqCap: 1, region:'Ülke geneli', color:'#06B6D4',
    updatedAt:'2026-03-15T10:00:00' },

  /* Genel & Keşfet */
  { id:'p_discover',    group:'general', groupLabel:'Genel & Keşfet',
    label:'Keşfet Tanıtımı',  icon:'solar:compass-bold',
    description:'Keşfet sayfasında genel işletme tanıtımı',
    pricePerImpression: 2.0, dailyFreqCap: 6, region:'İl bazlı', color:'#22C55E',
    updatedAt:'2026-03-15T10:00:00' },
  { id:'p_content_feat',group:'general', groupLabel:'Genel & Keşfet',
    label:'İçerik Öne Çıkarma',  icon:'solar:star-bold',
    description:'Seçili topluluk içeriğini öne çıkarma',
    pricePerImpression: 2.8, dailyFreqCap: 4, region:'Opsiyonel konum', color:'#F97316',
    updatedAt:'2026-03-15T10:00:00' },
  { id:'p_global_story',group:'general', groupLabel:'Genel & Keşfet',
    label:'Global Hikayeler',  icon:'solar:planet-bold',
    description:'Kullanıcı hikayelerinde konumdan bağımsız gösterim',
    pricePerImpression: 3.5, dailyFreqCap: 3, region:'Ülke geneli', color:'#6366F1',
    updatedAt:'2026-03-15T10:00:00' }
];

/* Reklam Veren Kampanyaları — her işletmenin satın aldığı placement + bütçe */
var ADMIN_AD_CAMPAIGNS = [
  /* ── AKTİF ── */
  { id:'ac_001', bizId:'bz2', bizName:'Pide Palace', bizOwner:'Mehmet Demir',
    placements:['p_rest_list','p_smart_match','p_recipe_disc'],
    budgetToken:25000, spentToken:14300, impressions:8420, clicks:612,
    startDate:'2026-04-01', endDate:'2026-04-30', status:'active',
    dailySpend:[520,610,580,640,700,680,720,560,640,720] },
  { id:'ac_002', bizId:'bz9', bizName:'Kebapçı Hakkı', bizOwner:'Hakkı Usta',
    placements:['p_rest_list','p_ai_assist','p_discover','p_global_story'],
    budgetToken:60000, spentToken:38900, impressions:15200, clicks:1120,
    startDate:'2026-03-20', endDate:'2026-05-20', status:'active',
    dailySpend:[1100,1240,1380,1420,1380,1520,1490,1550,1420,1480] },
  { id:'ac_003', bizId:'bz5', bizName:'Çiğ Köfte Express', bizOwner:'Fatma Şahin',
    placements:['p_local_story','p_content_feat'],
    budgetToken:18000, spentToken:7200, impressions:6100, clicks:340,
    startDate:'2026-04-05', endDate:'2026-05-05', status:'active',
    dailySpend:[280,320,390,410,380,420,450,410,460,490] },
  { id:'ac_004', bizId:'bz13', bizName:'Tatlıcı Nene', bizOwner:'Ayşe Hanım',
    placements:['p_smart_match','p_recipe_disc','p_ai_assist'],
    budgetToken:35000, spentToken:21500, impressions:9300, clicks:725,
    startDate:'2026-03-25', endDate:'2026-04-25', status:'active',
    dailySpend:[720,840,890,920,890,950,1020,890,940,1050] },
  { id:'ac_005', bizId:'bz7', bizName:'Waffle House', bizOwner:'Selin Aydın',
    placements:['p_discover','p_content_feat'],
    budgetToken:12000, spentToken:9800, impressions:4200, clicks:310,
    startDate:'2026-04-01', endDate:'2026-04-20', status:'active',
    dailySpend:[480,520,510,490,560,580,520,540,600,510] },
  { id:'ac_006', bizId:'bz12', bizName:'Dönerci Baba', bizOwner:'İbrahim Koç',
    placements:['p_rest_list'],
    budgetToken:8000, spentToken:3400, impressions:2800, clicks:180,
    startDate:'2026-04-10', endDate:'2026-05-10', status:'active',
    dailySpend:[310,340,380,410,390,420,380] },
  { id:'ac_007', bizId:'bz1', bizName:'Lezzet Mutfak', bizOwner:'Ali Yılmaz',
    placements:['p_local_story','p_global_story','p_discover'],
    budgetToken:20000, spentToken:11200, impressions:5900, clicks:430,
    startDate:'2026-04-03', endDate:'2026-05-03', status:'active',
    dailySpend:[480,540,590,620,580,640,610,680,720,650] },

  /* ── GEÇMIŞ ── */
  { id:'ac_008', bizId:'bz4', bizName:'Sushi Master', bizOwner:'Kemal Aksoy',
    placements:['p_ai_assist','p_discover'],
    budgetToken:22000, spentToken:22000, impressions:8100, clicks:580,
    startDate:'2026-02-15', endDate:'2026-03-15', status:'ended',
    dailySpend:[720,780,820,790] },
  { id:'ac_009', bizId:'bz15', bizName:'Makarna Dükkanı', bizOwner:'Ece Yılmaz',
    placements:['p_smart_match'],
    budgetToken:10000, spentToken:6700, impressions:3200, clicks:195,
    startDate:'2026-02-01', endDate:'2026-03-01', status:'cancelled',
    dailySpend:[260,290,310] },
  { id:'ac_010', bizId:'bz3', bizName:'Burger Lab', bizOwner:'Zeynep Kaya',
    placements:['p_rest_list','p_discover'],
    budgetToken:15000, spentToken:15000, impressions:5800, clicks:412,
    startDate:'2026-01-10', endDate:'2026-02-10', status:'ended',
    dailySpend:[510,540,580,600] },
  { id:'ac_011', bizId:'bz6', bizName:'Pizza Napoli', bizOwner:'Emre Öztürk',
    placements:['p_local_story'],
    budgetToken:5000, spentToken:2100, impressions:1400, clicks:78,
    startDate:'2026-03-01', endDate:'2026-03-15', status:'cancelled',
    dailySpend:[180,210,240] }
];

/* ═══════════════════════════════════════════════════════════
   İŞLETME BAŞVURULARI — Belge Tipleri + Başvuru Kayıtları
   ═══════════════════════════════════════════════════════════ */

/* 6 belge tipi — resmi başvuru paketi */
var ADMIN_BIZ_APP_DOC_TYPES = [
  { id:'doc_tax',      label:'Vergi Levhası',         icon:'solar:document-text-bold',     required:true },
  { id:'doc_activity', label:'Faaliyet Belgesi',      icon:'solar:verified-check-bold',    required:true },
  { id:'doc_signature',label:'İmza Sirküleri',        icon:'solar:pen-new-square-bold',    required:true },
  { id:'doc_id',       label:'Yetkili TC Kimlik',     icon:'solar:user-id-bold',           required:true },
  { id:'doc_bank',     label:'Banka Hesap Belgesi',   icon:'solar:card-bold',              required:true },
  { id:'doc_license',  label:'İşyeri Ruhsatı',        icon:'solar:document-add-bold',      required:false }
];

/* Başvuru kayıtları */
var ADMIN_BIZ_APPLICATIONS = [
  /* ── BEKLEYEN (pending) ── */
  {
    id:'bap_001', status:'pending',
    bizName:'Mantıcı Adile Teyze', bizType:'Geleneksel Türk Mutfağı',
    owner:'Adile Yılmaz', ownerPhone:'+905551201001', ownerEmail:'adile@manticiadileteyze.com',
    taxNo:'1234567890', taxOffice:'Kadıköy Vergi Dairesi',
    address:'Caferağa Mah. Moda Cad. No:42 Kadıköy/İstanbul',
    city:'İstanbul', district:'Kadıköy',
    branchCount:1, expectedOpenDate:'2026-05-01',
    appliedAt:'2026-04-16T08:30:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-16T08:20:00', preview:'Vergi Levhası 2026 · PDF · 1.2 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-16T08:22:00', preview:'Faaliyet Belgesi · PDF · 890 KB',    flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-16T08:25:00', preview:'İmza Sirküleri · PDF · 1.8 MB',      flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-16T08:27:00', preview:'TC Kimlik Kartı · JPG · 450 KB',     flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-16T08:28:00', preview:'Banka Hesap Dekont · PDF · 320 KB',   flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:null,                 preview:null,                                flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'', businessNote:'', history:[
      { date:'2026-04-16T08:30:00', by:'İşletme', text:'Başvuru gönderildi' }
    ]
  },
  {
    id:'bap_002', status:'pending',
    bizName:'Fırın Başı', bizType:'Ekmek & Pastane',
    owner:'Recep Demir', ownerPhone:'+905551202002', ownerEmail:'recep@firinbasi.com',
    taxNo:'9876543210', taxOffice:'Çankaya Vergi Dairesi',
    address:'Kavaklıdere Mah. Tunalı Hilmi Cad. No:78 Çankaya/Ankara',
    city:'Ankara', district:'Çankaya',
    branchCount:2, expectedOpenDate:'2026-05-15',
    appliedAt:'2026-04-16T10:15:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-16T10:00:00', preview:'Vergi Levhası · PDF · 980 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-16T10:03:00', preview:'Faaliyet Belgesi · PDF · 760 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-16T10:06:00', preview:'İmza Sirküleri · PDF · 1.5 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-16T10:08:00', preview:'TC Kimlik · JPG · 380 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-16T10:10:00', preview:'IBAN Dekont · PDF · 290 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:'2026-04-16T10:12:00', preview:'İşyeri Ruhsatı · PDF · 1.4 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'', businessNote:'', history:[
      { date:'2026-04-16T10:15:00', by:'İşletme', text:'Başvuru gönderildi' }
    ]
  },
  {
    id:'bap_003', status:'pending',
    bizName:'Denizci Balık', bizType:'Deniz Ürünleri Restoranı',
    owner:'Ahmet Balcı', ownerPhone:'+905551203003', ownerEmail:'ahmet@denizcibalik.com',
    taxNo:'5544332211', taxOffice:'Konyaaltı Vergi Dairesi',
    address:'Arapsuyu Mah. Konyaaltı Cad. No:215 Konyaaltı/Antalya',
    city:'Antalya', district:'Konyaaltı',
    branchCount:1, expectedOpenDate:'2026-06-01',
    appliedAt:'2026-04-15T16:45:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-15T16:30:00', preview:'Vergi Levhası · PDF · 1.1 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-15T16:33:00', preview:'Faaliyet Belgesi · PDF · 820 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-15T16:36:00', preview:'İmza Sirküleri · PDF · 1.6 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-15T16:38:00', preview:'TC Kimlik · JPG · 420 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-15T16:40:00', preview:'Banka Dekont · PDF · 310 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:null,                 preview:null, flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'', businessNote:'', history:[
      { date:'2026-04-15T16:45:00', by:'İşletme', text:'Başvuru gönderildi' }
    ]
  },
  {
    id:'bap_004', status:'pending',
    bizName:'Bambu Sushi Co.', bizType:'Asya Mutfağı',
    owner:'Yuki Tanaka', ownerPhone:'+905551204004', ownerEmail:'yuki@bambusushi.com',
    taxNo:'7788990011', taxOffice:'Alsancak Vergi Dairesi',
    address:'Alsancak Mah. Kıbrıs Şehitleri Cad. No:112 Konak/İzmir',
    city:'İzmir', district:'Konak',
    branchCount:1, expectedOpenDate:'2026-05-20',
    appliedAt:'2026-04-14T11:20:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-14T11:05:00', preview:'Vergi Levhası · PDF · 1.0 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-14T11:08:00', preview:'Faaliyet Belgesi · PDF · 740 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-14T11:12:00', preview:'İmza Sirküleri · PDF · 1.3 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-14T11:14:00', preview:'TC Kimlik · JPG · 400 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-14T11:16:00', preview:'IBAN · PDF · 280 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:'2026-04-14T11:18:00', preview:'İşyeri Ruhsatı · PDF · 1.2 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'', businessNote:'', history:[
      { date:'2026-04-14T11:20:00', by:'İşletme', text:'Başvuru gönderildi' }
    ]
  },
  {
    id:'bap_005', status:'pending',
    bizName:'Pancake Factory', bizType:'Kahvaltı & Brunch',
    owner:'Cem Kara', ownerPhone:'+905551205005', ownerEmail:'cem@pancakefactory.com',
    taxNo:'2233445566', taxOffice:'Nişantaşı Vergi Dairesi',
    address:'Nişantaşı Teşvikiye Cad. No:28 Şişli/İstanbul',
    city:'İstanbul', district:'Şişli',
    branchCount:1, expectedOpenDate:'2026-05-10',
    appliedAt:'2026-04-13T09:30:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-13T09:10:00', preview:'Vergi Levhası · PDF · 1.1 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:null,                 preview:null, flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-13T09:15:00', preview:'İmza Sirküleri · PDF · 1.4 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-13T09:18:00', preview:'TC Kimlik · JPG · 380 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-13T09:22:00', preview:'Banka Dekont · PDF · 310 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:null,                 preview:null, flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'', businessNote:'', history:[
      { date:'2026-04-13T09:30:00', by:'İşletme', text:'Başvuru gönderildi' }
    ]
  },

  /* ── CEVAP BEKLEYEN (awaiting_response) ── */
  {
    id:'bap_006', status:'awaiting_response',
    bizName:'Vegan Dükkan', bizType:'Vegan & Bitkisel',
    owner:'Ela Demir', ownerPhone:'+905551206006', ownerEmail:'ela@vegandukkan.com',
    taxNo:'1122334455', taxOffice:'Beşiktaş Vergi Dairesi',
    address:'Levent Mah. Büyükdere Cad. No:88 Beşiktaş/İstanbul',
    city:'İstanbul', district:'Beşiktaş',
    branchCount:1, expectedOpenDate:'2026-04-28',
    appliedAt:'2026-04-10T14:00:00',
    respondedAt:'2026-04-11T11:30:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-10T13:45:00', preview:'Vergi Levhası 2023 · PDF · 920 KB', flaggedIssue:true,  issueNote:'Güncel değil — 2026 tarihli olanı yükleyin' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-10T13:48:00', preview:'Faaliyet Belgesi · PDF · 760 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2026-04-10T13:52:00', preview:'İmza Sirküleri · PDF · 1.3 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-10T13:54:00', preview:'TC Kimlik ön yüz · JPG · 280 KB', flaggedIssue:true,  issueNote:'Arka yüz de gerekli — lütfen ekleyin' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-10T13:56:00', preview:'IBAN · PDF · 290 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:null,                 preview:null, flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'Vergi levhası güncel tarih taşımıyor. TC arka yüz eksik. Onay verilmedi.',
    businessNote:'Merhaba, başvurunuzu inceledik. Vergi levhanız eski tarihli (2023). 2026 tarihli güncel Vergi Levhanızı yüklemenizi ve TC kimlik kartınızın arka yüzünü de eklemenizi rica ederiz.',
    history:[
      { date:'2026-04-10T14:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2026-04-11T11:30:00', by:'Admin',   text:'Eksik bildirim gönderildi (2 belge)' }
    ]
  },
  {
    id:'bap_007', status:'awaiting_response',
    bizName:'Köfteci Dayı', bizType:'Fast Food',
    owner:'Hüseyin Yıldız', ownerPhone:'+905551207007', ownerEmail:'huseyin@koftecidayi.com',
    taxNo:'3344556677', taxOffice:'Sultanbeyli Vergi Dairesi',
    address:'Abdurrahmangazi Mah. İnönü Cad. No:19 Sultanbeyli/İstanbul',
    city:'İstanbul', district:'Sultanbeyli',
    branchCount:3, expectedOpenDate:'2026-04-20',
    appliedAt:'2026-04-08T16:00:00',
    respondedAt:'2026-04-09T10:00:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-08T15:45:00', preview:'Vergi Levhası · PDF · 1.0 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-08T15:48:00', preview:'Faaliyet Belgesi · PDF · 720 KB', flaggedIssue:true,  issueNote:'Sicil tasdik tarihi 6 aydan eski — yeniden tasdiklenmeli' },
      { typeId:'doc_signature', uploadedAt:'2026-04-08T15:50:00', preview:'İmza Sirküleri · PDF · 1.4 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2026-04-08T15:52:00', preview:'TC Kimlik · JPG · 410 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-08T15:54:00', preview:'Farklı bir şahıs adına · PDF · 280 KB', flaggedIssue:true,  issueNote:'IBAN şirket adına olmalı. Başka bir şahıs adına dekont yüklenmiş.' },
      { typeId:'doc_license',   uploadedAt:'2026-04-08T15:56:00', preview:'İşyeri Ruhsatı · PDF · 1.1 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'Faaliyet belgesi tasdik süresi geçmiş. Banka dekontu şirket değil şahıs adına.',
    businessNote:'Faaliyet Belgenizin tasdik tarihi 6 aydan eski. Güncel tasdikli belgeyi yükleyin. Ayrıca Banka Hesap Dekontu şirket adına olmalı.',
    history:[
      { date:'2026-04-08T16:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2026-04-09T10:00:00', by:'Admin',   text:'Eksik bildirim gönderildi (2 belge)' }
    ]
  },
  {
    id:'bap_008', status:'awaiting_response',
    bizName:'Kumruhane', bizType:'Sokak Lezzetleri',
    owner:'Ersin Polat', ownerPhone:'+905551208008', ownerEmail:'ersin@kumruhane.com',
    taxNo:'6677889900', taxOffice:'Bornova Vergi Dairesi',
    address:'Kazımdirik Mah. 364 Sok. No:14 Bornova/İzmir',
    city:'İzmir', district:'Bornova',
    branchCount:1, expectedOpenDate:'2026-04-25',
    appliedAt:'2026-04-06T10:00:00',
    respondedAt:'2026-04-07T14:20:00',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2026-04-06T09:45:00', preview:'Vergi Levhası · PDF · 980 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2026-04-06T09:48:00', preview:'Faaliyet Belgesi · PDF · 710 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:null,                 preview:null, flaggedIssue:true,  issueNote:'İmza Sirküleri eksik — lütfen yükleyin' },
      { typeId:'doc_id',        uploadedAt:'2026-04-06T09:52:00', preview:'TC Kimlik · JPG · 390 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2026-04-06T09:54:00', preview:'IBAN · PDF · 270 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:null,                 preview:null, flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'İmza sirküleri hiç yüklenmemiş — zorunlu belge.',
    businessNote:'İmza Sirküleri paketine eklenmemiş. Zorunlu bir belge olduğu için tamamlamanız gerekiyor.',
    history:[
      { date:'2026-04-06T10:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2026-04-07T14:20:00', by:'Admin',   text:'Eksik bildirim gönderildi (1 belge)' }
    ]
  },

  /* ── TAMAMLANAN (completed) ── */
  {
    id:'bap_009', status:'completed',
    bizName:'Lezzet Mutfak', bizType:'Türk Mutfağı',
    owner:'Ali Yılmaz', ownerPhone:'+905551001001', ownerEmail:'ali@lezzetmutfak.com',
    taxNo:'0011223344', taxOffice:'Kadıköy Vergi Dairesi',
    address:'Caferağa Mah. Moda Cad. No:15 Kadıköy/İstanbul',
    city:'İstanbul', district:'Kadıköy',
    branchCount:2, expectedOpenDate:'2025-06-15',
    appliedAt:'2025-06-10T11:00:00', approvedAt:'2025-06-12T16:00:00',
    bizId:'bz1',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2025-06-10T10:40:00', preview:'Vergi Levhası · PDF · 1.1 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2025-06-10T10:43:00', preview:'Faaliyet Belgesi · PDF · 820 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2025-06-10T10:46:00', preview:'İmza Sirküleri · PDF · 1.5 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2025-06-10T10:48:00', preview:'TC Kimlik · JPG · 420 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2025-06-10T10:50:00', preview:'IBAN · PDF · 290 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:'2025-06-10T10:52:00', preview:'İşyeri Ruhsatı · PDF · 1.3 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'Tüm belgeler eksiksiz. Ticari referanslar güçlü. Onay verildi.',
    businessNote:'Başvurunuz onaylandı! Platforma hoş geldiniz. Giriş bilgilerinizi e-posta adresinize gönderdik.',
    history:[
      { date:'2025-06-10T11:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2025-06-12T16:00:00', by:'Admin',   text:'Onaylandı ve aktifleştirildi' }
    ]
  },
  {
    id:'bap_010', status:'completed',
    bizName:'Pide Palace', bizType:'Pide & Lahmacun',
    owner:'Mehmet Demir', ownerPhone:'+905551002002', ownerEmail:'mehmet@pidepalace.com',
    taxNo:'2233445511', taxOffice:'Üsküdar Vergi Dairesi',
    address:'Beylerbeyi Mah. Sahil Yolu No:45 Üsküdar/İstanbul',
    city:'İstanbul', district:'Üsküdar',
    branchCount:3, expectedOpenDate:'2025-03-15',
    appliedAt:'2025-03-10T09:00:00', approvedAt:'2025-03-12T11:30:00',
    bizId:'bz2',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2025-03-10T08:40:00', preview:'Vergi Levhası · PDF · 1.0 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2025-03-10T08:43:00', preview:'Faaliyet Belgesi · PDF · 780 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2025-03-10T08:46:00', preview:'İmza Sirküleri · PDF · 1.4 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2025-03-10T08:48:00', preview:'TC Kimlik · JPG · 380 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2025-03-10T08:50:00', preview:'IBAN · PDF · 270 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:'2025-03-10T08:52:00', preview:'İşyeri Ruhsatı · PDF · 1.2 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'3 şubeli zincir. Tüm şubelerin ruhsatı ek belgelerde.',
    businessNote:'Başvurunuz onaylandı! Platforma hoş geldiniz.',
    history:[
      { date:'2025-03-10T09:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2025-03-12T11:30:00', by:'Admin',   text:'Onaylandı ve aktifleştirildi' }
    ]
  },
  {
    id:'bap_011', status:'completed',
    bizName:'Kebapçı Hakkı', bizType:'Et & Kebap',
    owner:'Hakkı Usta', ownerPhone:'+905551009009', ownerEmail:'hakki@kebapcihakki.com',
    taxNo:'5544332299', taxOffice:'Şahinbey Vergi Dairesi',
    address:'Merkez Mah. Hürriyet Cad. No:12 Şahinbey/Gaziantep',
    city:'Gaziantep', district:'Şahinbey',
    branchCount:4, expectedOpenDate:'2024-12-01',
    appliedAt:'2024-11-25T13:00:00', approvedAt:'2024-11-28T10:00:00',
    bizId:'bz9',
    documents:[
      { typeId:'doc_tax',       uploadedAt:'2024-11-25T12:40:00', preview:'Vergi Levhası · PDF · 1.2 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_activity',  uploadedAt:'2024-11-25T12:43:00', preview:'Faaliyet Belgesi · PDF · 850 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_signature', uploadedAt:'2024-11-25T12:46:00', preview:'İmza Sirküleri · PDF · 1.6 MB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_id',        uploadedAt:'2024-11-25T12:48:00', preview:'TC Kimlik · JPG · 410 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_bank',      uploadedAt:'2024-11-25T12:50:00', preview:'IBAN · PDF · 310 KB', flaggedIssue:false, issueNote:'' },
      { typeId:'doc_license',   uploadedAt:'2024-11-25T12:52:00', preview:'4 Şube Ruhsatı · PDF · 3.4 MB', flaggedIssue:false, issueNote:'' }
    ],
    adminNote:'Premium üye adayı. 4 şubeli köklü işletme. Hızlı onay.',
    businessNote:'Tebrikler, başvurunuz onaylandı! Premium plan detaylarını da inceleyebilirsiniz.',
    history:[
      { date:'2024-11-25T13:00:00', by:'İşletme', text:'Başvuru gönderildi' },
      { date:'2024-11-28T10:00:00', by:'Admin',   text:'Onaylandı ve aktifleştirildi' }
    ]
  }
];

/* ═══════════════════════════════════════════════════════════
   BİLDİRİM MERKEZİ — Kanallar, Otomasyon, Kitle Filtreleri
   ═══════════════════════════════════════════════════════════ */

/* 3 gönderim kanalı */
var ADMIN_NOTIF_CHANNELS = [
  { id:'mail', label:'Mail ile Gönderim', icon:'solar:letter-bold',
    description:'Zengin içerikli bültenler (görsel + metin)',
    color:'#3B82F6', gradient:'linear-gradient(135deg,#3B82F6,#06B6D4)' },
  { id:'sms',  label:'SMS ile Gönderim',  icon:'solar:chat-round-dots-bold',
    description:'Acil ve doğrudan metin mesajları',
    color:'#22C55E', gradient:'linear-gradient(135deg,#22C55E,#16A34A)', charLimit:160 },
  { id:'push', label:'Uygulama Bildirimi', icon:'solar:bell-bing-bold',
    description:'Anlık uygulama içi bildirim',
    color:'#8B5CF6', gradient:'linear-gradient(135deg,#8B5CF6,#A78BFA)', charLimit:120 }
];

/* Kullanılabilir dinamik değişkenler */
var ADMIN_NOTIF_VARIABLES = [
  { token:'{kullanici_adi}',  label:'Kullanıcı Adı',  example:'Ahmet Yılmaz' },
  { token:'{siparis_no}',     label:'Sipariş No',     example:'#104281' },
  { token:'{isletme_adi}',    label:'İşletme Adı',    example:'Lezzet Mutfak' },
  { token:'{tutar}',          label:'Tutar',          example:'₺184' },
  { token:'{kurye_adi}',      label:'Kurye',          example:'Murat Y.' },
  { token:'{sehir}',          label:'Şehir',          example:'İstanbul' }
];

/* Dinamik otomasyon senaryoları — 4 grup */
var ADMIN_NOTIF_AUTOMATION = [
  {
    id:'grp_order', label:'Sipariş Senaryoları', icon:'solar:bag-check-bold', color:'#3B82F6',
    scenarios:[
      { id:'n_order_received',  label:'Sipariş Alındı',       channel:'push', active:true,
        text:'Merhaba {kullanici_adi}, siparişiniz ({siparis_no}) alındı. {isletme_adi} hazırlamaya başlıyor.' },
      { id:'n_order_preparing', label:'Sipariş Hazırlanıyor', channel:'push', active:true,
        text:'Şefler mutfakta! {siparis_no} numaralı siparişiniz {isletme_adi} tarafından hazırlanıyor.' },
      { id:'n_order_onway',     label:'Sipariş Yola Çıktı',   channel:'push', active:true,
        text:'Siparişiniz yola çıktı! {kurye_adi} en kısa sürede kapınıza getirecek. 🚴' },
      { id:'n_order_delivered', label:'Sipariş Teslim Edildi', channel:'push', active:true,
        text:'{siparis_no} teslim edildi. Afiyet olsun! Siparişinizi değerlendirmek ister misiniz?' }
    ]
  },
  {
    id:'grp_cancel', label:'İptal & İade Senaryoları', icon:'solar:close-circle-bold', color:'#EF4444',
    scenarios:[
      { id:'n_cancel_user',   label:'Kullanıcı İptali',        channel:'push', active:true,
        text:'{siparis_no} numaralı siparişiniz iptal edildi. İade süreci başlatıldı.' },
      { id:'n_cancel_biz',    label:'İşletme İptali',          channel:'push', active:true,
        text:'Üzgünüz, {isletme_adi} {siparis_no} siparişini iptal etti. Cüzdan iadeniz yapıldı.' },
      { id:'n_cancel_admin',  label:'Admin İptali',            channel:'mail', active:true,
        text:'Sipariş {siparis_no} güvenlik nedeniyle iptal edilmiştir. Detaylar e-postanızda.' },
      { id:'n_refund_done',   label:'Token İadesi Tamamlandı', channel:'push', active:true,
        text:'{tutar} token iadeniz cüzdanınıza yatırıldı.' }
    ]
  },
  {
    id:'grp_community', label:'Topluluk Senaryoları', icon:'solar:users-group-two-rounded-bold', color:'#EC4899',
    scenarios:[
      { id:'n_new_recipe',  label:'Yeni Tarif Paylaşıldı', channel:'push', active:true,
        text:'Takip ettiğin şef {kullanici_adi} yeni bir tarif paylaştı. Hemen keşfet!' },
      { id:'n_liked',       label:'İçeriğin Beğenildi',    channel:'push', active:false,
        text:'Paylaşımın {kullanici_adi} tarafından beğenildi ❤️' },
      { id:'n_new_follower', label:'Yeni Takipçi',          channel:'push', active:true,
        text:'{kullanici_adi} seni takip etmeye başladı. Merhaba de! 👋' }
    ]
  },
  {
    id:'grp_system', label:'Sistem Senaryoları', icon:'solar:shield-keyhole-bold', color:'#8B5CF6',
    scenarios:[
      { id:'n_password_reset', label:'Şifre Sıfırlama',     channel:'mail', active:true,
        text:'Merhaba {kullanici_adi}, şifre sıfırlama isteğiniz alındı. Aşağıdaki linke tıklayarak yeni şifrenizi belirleyebilirsiniz.' },
      { id:'n_new_login',      label:'Yeni Giriş Tespit Edildi', channel:'mail', active:true,
        text:'Hesabınıza {sehir} konumundan yeni bir giriş yapıldı. Siz değilseniz hemen şifrenizi değiştirin.' }
    ]
  }
];

/* Audience filtre preset seçenekleri */
var ADMIN_NOTIF_FILTERS = {
  cities: ['İstanbul','Ankara','İzmir','Bursa','Antalya','Gaziantep','Mersin','Trabzon'],
  statuses: [
    { id:'premium', label:'Premium Üyeler',   icon:'solar:crown-bold',             color:'#F59E0B' },
    { id:'chef',    label:'İçerik Paylaşanlar', icon:'solar:chef-hat-bold',        color:'#EC4899' },
    { id:'biz',     label:'İşletme Çalışanları', icon:'solar:shop-bold',           color:'#3B82F6' },
    { id:'active',  label:'Aktif Kullanıcılar', icon:'solar:fire-bold',            color:'#22C55E' }
  ],
  activityPresets: [
    { id:'7d',  label:'Son 7 gün',  days:7 },
    { id:'30d', label:'Son 30 gün', days:30 },
    { id:'90d', label:'Son 90 gün', days:90 },
    { id:'inactive', label:'30+ gündür aktif değil', days:-30 }
  ]
};

/* ═══════════════════════════════════════════════════════════
   ADMIN AYARLARI — Roller, Görevler, Modüller, Yetki Matrisi,
                     Adminler, Aktivite Logu
   ═══════════════════════════════════════════════════════════ */

/* Roller — hiyerarşik sıra: en üst Süper Admin */
var ADMIN_PANEL_ROLES = [
  { id:'super_admin', label:'Süper Admin',    color:'#EF4444', critical:true,
    description:'Tam yetki • Tüm modüllere erişim + sistem ayarları' },
  { id:'admin',       label:'Admin',          color:'#8B5CF6', critical:false,
    description:'Çoğu modüle erişim • Hassas ayarlar yok' },
  { id:'support',     label:'Destek',         color:'#3B82F6', critical:false,
    description:'Kullanıcı destek ve şikayet yönetimi' },
  { id:'crisis',      label:'Kriz Yönetimi',  color:'#F97316', critical:false,
    description:'Acil müdahale, güvenlik olayları, hızlı reaksiyon' },
  { id:'finance',     label:'Finans',         color:'#22C55E', critical:false,
    description:'Ödeme, token, komisyon raporları' },
  { id:'content',     label:'İçerik Editörü', color:'#EC4899', critical:false,
    description:'Tarif, gönderi, kampanya moderasyonu' }
];

/* Görev (Pozisyon) tanımları */
var ADMIN_PANEL_TASKS = [
  { id:'tsk_ops',       label:'Operasyon',        description:'Sipariş akışı, operasyonel izleme' },
  { id:'tsk_support',   label:'Destek',           description:'Kullanıcı destek talepleri' },
  { id:'tsk_crisis',    label:'Kriz Müdahale',    description:'Acil olaylar, güvenlik' },
  { id:'tsk_finance',   label:'Finans',           description:'Ödeme ve muhasebe' },
  { id:'tsk_content',   label:'İçerik & Moderasyon', description:'Tarif ve gönderi onayı' },
  { id:'tsk_ads',       label:'Reklam',           description:'Kampanya ve reklam yönetimi' },
  { id:'tsk_system',    label:'Sistem Yönetimi',  description:'Platform geneli ayarlar' }
];

/* Platform modülleri — yetki matrisi için */
var ADMIN_PANEL_MODULES = [
  { id:'mod_dashboard',    label:'Dashboard',         icon:'solar:chart-2-bold' },
  { id:'mod_users',        label:'Kullanıcılar',      icon:'solar:users-group-two-rounded-bold' },
  { id:'mod_businesses',   label:'İşletmeler',        icon:'solar:shop-bold' },
  { id:'mod_orders',       label:'Siparişler',        icon:'solar:bag-check-bold' },
  { id:'mod_recipes',      label:'Tarifler',          icon:'solar:chef-hat-heart-bold' },
  { id:'mod_complaints',   label:'Şikayet Yönetimi',  icon:'solar:shield-warning-bold' },
  { id:'mod_blacklist',    label:'Kara Liste',        icon:'solar:user-block-rounded-bold' },
  { id:'mod_finance',      label:'Finans & Ödeme',    icon:'solar:card-bold' },
  { id:'mod_commission',   label:'Komisyon',          icon:'solar:pie-chart-2-bold' },
  { id:'mod_premium',      label:'Premium Plan',      icon:'solar:crown-bold' },
  { id:'mod_ads',          label:'Reklam Alanı',      icon:'solar:gallery-wide-bold' },
  { id:'mod_notifications',label:'Bildirim Merkezi',  icon:'solar:bell-bing-bold' },
  { id:'mod_bizapps',      label:'İşletme Başvuruları', icon:'solar:inbox-in-bold' },
  { id:'mod_reports',      label:'Raporlama',         icon:'solar:document-text-bold' },
  { id:'mod_admin',        label:'Admin Ayarları',    icon:'solar:shield-user-bold', sensitive:true }
];

/* Yetki matrisi — role × module × [view, edit, delete] */
var ADMIN_PANEL_PERMISSIONS = (function() {
  var m = {};

  // Süper Admin — her şey tam yetki
  m.super_admin = {};
  for (var i = 0; i < ADMIN_PANEL_MODULES.length; i++) {
    m.super_admin[ADMIN_PANEL_MODULES[i].id] = { view:true, edit:true, delete:true };
  }

  // Admin — her şey var ama Admin Ayarları yok
  m.admin = {};
  for (var j = 0; j < ADMIN_PANEL_MODULES.length; j++) {
    var mod = ADMIN_PANEL_MODULES[j];
    m.admin[mod.id] = mod.sensitive
      ? { view:false, edit:false, delete:false }
      : { view:true, edit:true, delete:false };
  }

  // Destek — kullanıcı + şikayet + kara liste + siparişler (view ağırlıklı)
  m.support = {
    mod_dashboard:    { view:true,  edit:false, delete:false },
    mod_users:        { view:true,  edit:true,  delete:false },
    mod_businesses:   { view:true,  edit:false, delete:false },
    mod_orders:       { view:true,  edit:true,  delete:false },
    mod_recipes:      { view:true,  edit:false, delete:false },
    mod_complaints:   { view:true,  edit:true,  delete:false },
    mod_blacklist:    { view:true,  edit:true,  delete:false },
    mod_finance:      { view:false, edit:false, delete:false },
    mod_commission:   { view:false, edit:false, delete:false },
    mod_premium:      { view:true,  edit:false, delete:false },
    mod_ads:          { view:false, edit:false, delete:false },
    mod_notifications:{ view:true,  edit:false, delete:false },
    mod_bizapps:      { view:true,  edit:false, delete:false },
    mod_reports:      { view:true,  edit:false, delete:false },
    mod_admin:        { view:false, edit:false, delete:false }
  };

  // Kriz — çok geniş ama finans yok
  m.crisis = {
    mod_dashboard:    { view:true,  edit:false, delete:false },
    mod_users:        { view:true,  edit:true,  delete:false },
    mod_businesses:   { view:true,  edit:true,  delete:false },
    mod_orders:       { view:true,  edit:true,  delete:true  },
    mod_recipes:      { view:true,  edit:true,  delete:true  },
    mod_complaints:   { view:true,  edit:true,  delete:false },
    mod_blacklist:    { view:true,  edit:true,  delete:true  },
    mod_finance:      { view:false, edit:false, delete:false },
    mod_commission:   { view:false, edit:false, delete:false },
    mod_premium:      { view:true,  edit:false, delete:false },
    mod_ads:          { view:true,  edit:true,  delete:false },
    mod_notifications:{ view:true,  edit:true,  delete:false },
    mod_bizapps:      { view:true,  edit:true,  delete:false },
    mod_reports:      { view:true,  edit:false, delete:false },
    mod_admin:        { view:false, edit:false, delete:false }
  };

  // Finans
  m.finance = {
    mod_dashboard:    { view:true,  edit:false, delete:false },
    mod_users:        { view:true,  edit:false, delete:false },
    mod_businesses:   { view:true,  edit:false, delete:false },
    mod_orders:       { view:true,  edit:false, delete:false },
    mod_recipes:      { view:false, edit:false, delete:false },
    mod_complaints:   { view:false, edit:false, delete:false },
    mod_blacklist:    { view:false, edit:false, delete:false },
    mod_finance:      { view:true,  edit:true,  delete:false },
    mod_commission:   { view:true,  edit:true,  delete:false },
    mod_premium:      { view:true,  edit:true,  delete:false },
    mod_ads:          { view:true,  edit:false, delete:false },
    mod_notifications:{ view:false, edit:false, delete:false },
    mod_bizapps:      { view:true,  edit:false, delete:false },
    mod_reports:      { view:true,  edit:false, delete:false },
    mod_admin:        { view:false, edit:false, delete:false }
  };

  // İçerik Editörü
  m.content = {
    mod_dashboard:    { view:true,  edit:false, delete:false },
    mod_users:        { view:true,  edit:false, delete:false },
    mod_businesses:   { view:true,  edit:false, delete:false },
    mod_orders:       { view:false, edit:false, delete:false },
    mod_recipes:      { view:true,  edit:true,  delete:true  },
    mod_complaints:   { view:true,  edit:true,  delete:false },
    mod_blacklist:    { view:false, edit:false, delete:false },
    mod_finance:      { view:false, edit:false, delete:false },
    mod_commission:   { view:false, edit:false, delete:false },
    mod_premium:      { view:false, edit:false, delete:false },
    mod_ads:          { view:true,  edit:true,  delete:false },
    mod_notifications:{ view:true,  edit:true,  delete:false },
    mod_bizapps:      { view:false, edit:false, delete:false },
    mod_reports:      { view:true,  edit:false, delete:false },
    mod_admin:        { view:false, edit:false, delete:false }
  };

  return m;
})();

/* Admin listesi */
var ADMIN_PANEL_ADMINS = [
  { id:'adm_001', firstName:'Furkan',   lastName:'Şahin',     email:'furkan@superresto.com',    phone:'+905559990001', birthDate:'1992-03-15',
    taskId:'tsk_system',  roleId:'super_admin', status:'active', createdAt:'2025-01-10T09:00:00' },
  { id:'adm_002', firstName:'Elif',     lastName:'Kaya',      email:'elif@superresto.com',      phone:'+905559990002', birthDate:'1990-07-22',
    taskId:'tsk_ops',     roleId:'admin',       status:'active', createdAt:'2025-02-20T10:30:00' },
  { id:'adm_003', firstName:'Murat',    lastName:'Demir',     email:'murat@superresto.com',     phone:'+905559990003', birthDate:'1988-11-05',
    taskId:'tsk_support', roleId:'support',     status:'active', createdAt:'2025-03-15T14:00:00' },
  { id:'adm_004', firstName:'Aslı',     lastName:'Polat',     email:'asli@superresto.com',      phone:'+905559990004', birthDate:'1994-05-30',
    taskId:'tsk_crisis',  roleId:'crisis',      status:'active', createdAt:'2025-04-01T11:15:00' },
  { id:'adm_005', firstName:'Kemal',    lastName:'Özdemir',   email:'kemal@superresto.com',     phone:'+905559990005', birthDate:'1985-09-18',
    taskId:'tsk_finance', roleId:'finance',     status:'active', createdAt:'2025-05-10T09:45:00' },
  { id:'adm_006', firstName:'Selin',    lastName:'Arslan',    email:'selin@superresto.com',     phone:'+905559990006', birthDate:'1993-12-02',
    taskId:'tsk_content', roleId:'content',     status:'active', createdAt:'2025-06-25T16:20:00' },
  { id:'adm_007', firstName:'Onur',     lastName:'Yılmaz',    email:'onur@superresto.com',      phone:'+905559990007', birthDate:'1991-04-14',
    taskId:'tsk_support', roleId:'support',     status:'inactive', createdAt:'2025-07-08T13:00:00' }
];

/* Aktivite Logu — Read-only (silinemez) */
var ADMIN_PANEL_ACTIVITY_LOG = [
  { id:'log_001', adminId:'adm_001', date:'2026-04-16T14:32:00', action:'role_change',   target:'adm_002', detail:'Elif Kaya rolü: Destek → Admin' },
  { id:'log_002', adminId:'adm_001', date:'2026-04-16T13:15:00', action:'user_ban',      target:'u6',       detail:'Zehra Aydın kalıcı olarak yasaklandı' },
  { id:'log_003', adminId:'adm_003', date:'2026-04-16T11:20:00', action:'complaint_resolved', target:'rp_spam_01', detail:'Şikayet RP10 çözüldü (Murat Demir hk.)' },
  { id:'log_004', adminId:'adm_002', date:'2026-04-16T10:00:00', action:'biz_approved',  target:'bz1',      detail:'Lezzet Mutfak başvurusu onaylandı' },
  { id:'log_005', adminId:'adm_004', date:'2026-04-15T22:45:00', action:'biz_suspended', target:'bz8',      detail:'Tantuni Evi askıya alındı (ödeme ihlali)' },
  { id:'log_006', adminId:'adm_006', date:'2026-04-15T18:30:00', action:'recipe_approved', target:'rc_042', detail:'Klasik Mantı tarifi yayına alındı' },
  { id:'log_007', adminId:'adm_005', date:'2026-04-15T16:00:00', action:'commission_updated', target:'cr_on_2', detail:'Online komisyon kuralı %7 olarak güncellendi' },
  { id:'log_008', adminId:'adm_001', date:'2026-04-15T14:00:00', action:'admin_created', target:'adm_007',  detail:'Onur Yılmaz admin olarak eklendi (Destek)' },
  { id:'log_009', adminId:'adm_003', date:'2026-04-15T11:45:00', action:'user_restricted', target:'u12',    detail:'Hasan Yılmaz 14 gün yorum engeli uygulandı' },
  { id:'log_010', adminId:'adm_002', date:'2026-04-14T20:15:00', action:'notification_sent', target:'bulk_12k', detail:'12.400 kullanıcıya push bildirim gönderildi' },
  { id:'log_011', adminId:'adm_001', date:'2026-04-14T15:00:00', action:'permission_updated', target:'support', detail:'Destek rolüne Kara Liste düzenleme yetkisi eklendi' },
  { id:'log_012', adminId:'adm_006', date:'2026-04-14T12:30:00', action:'ad_campaign_cancelled', target:'ac_009', detail:'Makarna Dükkanı reklam kampanyası iptal edildi' },
  { id:'log_013', adminId:'adm_004', date:'2026-04-14T09:00:00', action:'login',         target:null,       detail:'Sisteme giriş yaptı (İstanbul)' },
  { id:'log_014', adminId:'adm_003', date:'2026-04-13T17:20:00', action:'complaint_resolved', target:'rp11', detail:'Şikayet RP11 çözüldü (alerjen uyarısı)' },
  { id:'log_015', adminId:'adm_002', date:'2026-04-13T13:00:00', action:'biz_rejected_partial', target:'bap_006', detail:'Vegan Dükkan başvurusu için eksik bildirim gönderildi' },
  { id:'log_016', adminId:'adm_001', date:'2026-04-13T10:00:00', action:'task_created',  target:'tsk_ads',   detail:'"Reklam" görevi sisteme eklendi' },
  { id:'log_017', adminId:'adm_005', date:'2026-04-12T16:30:00', action:'premium_plan_updated', target:'tier_pro', detail:'Pro paket aylık ücreti ₺2.800 olarak güncellendi' },
  { id:'log_018', adminId:'adm_001', date:'2026-04-12T09:30:00', action:'super_admin_granted', target:'adm_001', detail:'İlk süper admin hesabı aktifleştirildi' }
];

/* ═══════════════════════════════════════════════════════════
   RAPORLAMA MERKEZİ — Kategoriler, Raporlar, Zaman Serileri
   ═══════════════════════════════════════════════════════════ */

var ADMIN_REPORT_CATEGORIES = [
  { id:'cat_user',    label:'Kullanıcı & Etkileşim', icon:'solar:users-group-two-rounded-bold', color:'#3B82F6' },
  { id:'cat_ops',     label:'Operasyon & Finans',    icon:'solar:bag-check-bold',               color:'#22C55E' },
  { id:'cat_support', label:'Destek & Kalite',       icon:'solar:shield-warning-bold',          color:'#F97316' },
  { id:'cat_strategic', label:'Stratejik Metrikler', icon:'solar:magic-stick-3-bold',           color:'#8B5CF6' }
];

/* Zaman serileri üretici — deterministik dummy */
var ADMIN_REPORT_TIMESERIES = (function() {
  function gen(seed, base, variance, days) {
    var out = [];
    var s = seed;
    for (var i = 0; i < days; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var pct = ((s % 10000) / 10000);
      var val = Math.round(base + pct * variance - variance/2);
      if (val < 0) val = 0;
      out.push(val);
    }
    return out;
  }
  return {
    dau:           gen(111, 31200, 4000, 30),
    wau:           gen(222, 42100, 5500, 30),
    mau:           gen(333, 48520, 3800, 30),
    posts:         gen(444, 420,   180,  30),
    recipes:       gen(555, 120,   60,   30),
    aiRecipeAsk:   gen(666, 2400,  800,  30),
    aiPlaceAsk:    gen(777, 1600,  600,  30),
    orders:        gen(888, 1180,  420,  30),
    ordersDone:    gen(999, 1050,  380,  30),
    cancelUser:    gen(121, 58,    24,   30),
    cancelBiz:     gen(232, 42,    18,   30),
    avgBasket:     gen(343, 148,   35,   30),
    tokenSpent:    gen(454, 284520, 80000, 30),
    tokenEarned:   gen(565, 312000, 95000, 30),
    complaints:    gen(676, 22,    12,   30),
    complaintsResolved: gen(787, 18, 9, 30),
    responseTime:  gen(898, 12,    8,    30)  // dakika
  };
})();

/* Rapor kataloğu */
var ADMIN_REPORTS_CATALOG = [
  // Kullanıcı & Etkileşim
  { id:'rpt_dau',        category:'cat_user', name:'Aktif Kullanıcı Sayısı (DAU/WAU/MAU)', scope:'Günlük + rollup',
    chart:'line', description:'Platforma her gün/hafta/ay giriş yapan kullanıcı sayısı trendi.',
    series:['dau','wau','mau'], labels:['Günlük','Haftalık','Aylık'], colors:['#3B82F6','#06B6D4','#8B5CF6'],
    lastUpdated:'2026-04-16T09:00:00' },
  { id:'rpt_posts',      category:'cat_user', name:'İçerik Paylaşım & Tarif Sayısı', scope:'Günlük',
    chart:'bar', description:'Her gün topluluğa eklenen paylaşım ve tarif sayısı.',
    series:['posts','recipes'], labels:['Paylaşım','Tarif'], colors:['#EC4899','#F59E0B'],
    lastUpdated:'2026-04-16T08:30:00' },
  { id:'rpt_ai',         category:'cat_user', name:'AI Asistan Kullanımı', scope:'Günlük',
    chart:'line', description:'Yapay zekaya sorulan tarif ve yer önerisi sayısı.',
    series:['aiRecipeAsk','aiPlaceAsk'], labels:['Tarif Sorusu','Yer Önerisi'], colors:['#8B5CF6','#06B6D4'],
    lastUpdated:'2026-04-16T07:00:00' },

  // Operasyon & Finans
  { id:'rpt_orders',     category:'cat_ops', name:'Toplam & Tamamlanan Siparişler', scope:'Günlük',
    chart:'line', description:'Platform genelinde oluşturulan ve tamamlanan sipariş trendi.',
    series:['orders','ordersDone'], labels:['Toplam','Tamamlanan'], colors:['#3B82F6','#22C55E'],
    lastUpdated:'2026-04-16T13:00:00' },
  { id:'rpt_cancel',     category:'cat_ops', name:'İptal Analizi (Kullanıcı vs. İşletme)', scope:'Günlük',
    chart:'bar', description:'Günlük iptal sebepleri karşılaştırması.',
    series:['cancelUser','cancelBiz'], labels:['Kullanıcı İptali','İşletme İptali'], colors:['#F97316','#EF4444'],
    lastUpdated:'2026-04-16T12:00:00' },
  { id:'rpt_basket',     category:'cat_ops', name:'Ortalama Sepet Tutarı', scope:'Günlük (₺)',
    chart:'line', description:'Her gün sipariş başına düşen ortalama harcama.',
    series:['avgBasket'], labels:['Ort. Sepet'], colors:['#22C55E'],
    lastUpdated:'2026-04-16T11:00:00' },
  { id:'rpt_token',      category:'cat_ops', name:'Token Sirkülasyonu', scope:'Günlük',
    chart:'bar', description:'Sistemde harcanan ve kullanıcılar tarafından kazanılan toplam token.',
    series:['tokenSpent','tokenEarned'], labels:['Harcanan','Kazanılan'], colors:['#EAB308','#22C55E'],
    lastUpdated:'2026-04-16T10:30:00' },

  // Destek & Kalite
  { id:'rpt_complaints', category:'cat_support', name:'Şikayet Sayısı & Çözümleme', scope:'Günlük',
    chart:'line', description:'Gelen ve çözülen şikayetlerin günlük akışı.',
    series:['complaints','complaintsResolved'], labels:['Toplam','Çözülen'], colors:['#EF4444','#22C55E'],
    lastUpdated:'2026-04-16T14:00:00' },
  { id:'rpt_complaint_types', category:'cat_support', name:'Şikayet Türleri Dağılımı', scope:'Son 30 gün',
    chart:'pie', description:'Şikayetlerin kategorilere göre dağılımı (pasta grafiği).',
    pie:[
      { label:'İçerik',     value:47, color:'#8B5CF6' },
      { label:'Sipariş',    value:28, color:'#3B82F6' },
      { label:'Kullanıcı',  value:15, color:'#EF4444' },
      { label:'Diğer',      value:10, color:'#6B7280' }
    ],
    lastUpdated:'2026-04-16T09:30:00' },
  { id:'rpt_response',   category:'cat_support', name:'Şikayete Yanıt Süresi (dk)', scope:'Günlük',
    chart:'line', description:'Destek ekibinin ortalama yanıt süresi. 15 dk üzeri uyarı.',
    series:['responseTime'], labels:['Ort. Yanıt (dk)'], colors:['#F59E0B'], threshold:15,
    lastUpdated:'2026-04-16T13:45:00' },

  // Stratejik
  { id:'rpt_heatmap',    category:'cat_strategic', name:'Popüler Kategori Isı Haritası', scope:'Saatlik × Kategori',
    chart:'heatmap', description:'Hangi saatlerde hangi mutfak türü daha çok sipariş veriliyor?',
    lastUpdated:'2026-04-16T12:15:00' },
  { id:'rpt_league',     category:'cat_strategic', name:'İşletme Performans Ligi', scope:'Son 30 gün',
    chart:'league', description:'En yüksek puanlı ve en az şikayet alan ilk 10 işletme.',
    lastUpdated:'2026-04-16T10:00:00' },
  { id:'rpt_retention',  category:'cat_strategic', name:'Retention (Bağlılık) Oranı', scope:'Cohort',
    chart:'retention', description:'Yeni kullanıcıların ne kadarı ikinci kez sipariş veriyor veya tarif paylaşıyor?',
    lastUpdated:'2026-04-15T18:00:00' },
  { id:'rpt_premium',    category:'cat_strategic', name:'Premium Dönüşüm Hızı', scope:'Son 90 gün',
    chart:'pie', description:'Ücretsiz kullanıcıların premium\'a geçiş süresi analizi.',
    pie:[
      { label:'İlk 7 gün',   value:34, color:'#22C55E' },
      { label:'8-30 gün',    value:28, color:'#3B82F6' },
      { label:'31-90 gün',   value:19, color:'#8B5CF6' },
      { label:'90+ gün',     value:12, color:'#F59E0B' },
      { label:'Dönüşmedi',   value:7,  color:'#6B7280' }
    ],
    lastUpdated:'2026-04-16T08:00:00' }
];

/* KPI özet — Ana dashboard için */
var ADMIN_REPORT_KPI = {
  todayOrders:   { value: 1180,  delta: 12.4, trend: 'up'   },
  activeUsers:   { value: 31200, delta: 3.2,  trend: 'up'   },
  todayRevenue:  { value: 172000, delta: 8.7, trend: 'up'   },
  openComplaints:{ value: 23,    delta: -15.0, trend: 'down' }
};

/* Stratejik veriler */
var ADMIN_REPORT_HEATMAP = (function() {
  // 24 saat × 7 kategori, her hücrede yoğunluk 0-100
  var cats = ['Burger & Fast Food','Türk Mutfağı','İtalyan','Kahvaltı','Deniz Ürünleri','Tatlı','Kebap'];
  var rows = [];
  var seed = 13579;
  for (var c = 0; c < cats.length; c++) {
    var row = { label: cats[c], hours: [] };
    for (var h = 0; h < 24; h++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var base = 20;
      // Öğün saatlerinde artış
      if (h === 12 || h === 13 || h === 19 || h === 20) base = 60;
      else if (h === 11 || h === 14 || h === 18 || h === 21) base = 45;
      else if (h >= 7 && h <= 10) base = c === 3 ? 70 : 25; // kahvaltı
      else if (h >= 0 && h <= 5) base = 8;
      var intensity = base + (seed % 25);
      if (intensity > 100) intensity = 100;
      row.hours.push(intensity);
    }
    rows.push(row);
  }
  return rows;
})();

var ADMIN_REPORT_LEAGUE = [
  { rank:1, bizId:'bz13', name:'Tatlıcı Nene',       rating:5.0, complaints:0, orders:780,  delta:2 },
  { rank:2, bizId:'bz9',  name:'Kebapçı Hakkı',      rating:4.9, complaints:1, orders:1800, delta:0 },
  { rank:3, bizId:'bz2',  name:'Pide Palace',        rating:4.9, complaints:2, orders:1250, delta:1 },
  { rank:4, bizId:'bz4',  name:'Sushi Master',       rating:4.8, complaints:1, orders:680,  delta:-1 },
  { rank:5, bizId:'bz1',  name:'Lezzet Mutfak',      rating:4.7, complaints:3, orders:820,  delta:3 },
  { rank:6, bizId:'bz12', name:'Dönerci Baba',       rating:4.6, complaints:4, orders:950,  delta:0 },
  { rank:7, bizId:'bz7',  name:'Waffle House',       rating:4.6, complaints:3, orders:560,  delta:-2 },
  { rank:8, bizId:'bz3',  name:'Burger Lab',         rating:4.5, complaints:5, orders:430,  delta:1 },
  { rank:9, bizId:'bz10', name:'Vegan Kitchen',      rating:4.4, complaints:2, orders:320,  delta:4 },
  { rank:10, bizId:'bz5', name:'Çiğ Köfte Express',  rating:4.3, complaints:8, orders:2100, delta:-3 }
];

var ADMIN_REPORT_RETENTION = {
  cohorts: [
    { label:'Ocak',  D1:100, D7:68, D30:41, D90:28 },
    { label:'Şubat', D1:100, D7:72, D30:45, D90:31 },
    { label:'Mart',  D1:100, D7:75, D30:48, D90:34 },
    { label:'Nisan', D1:100, D7:77, D30:50, D90:null } // henüz 90 gün geçmedi
  ],
  averageD30: 46
};

/* ═══════════════════════════════════════════════════════════
   TOKEN YÖNETİMİ — Konfigürasyon ve Zenginleştirilmiş Ledger
   ═══════════════════════════════════════════════════════════ */

var ADMIN_TOKEN_CONFIG = {
  exchangeRate: 1.00,        // 1 Token = 1.00 TL
  currency: '₺',
  lowBalanceThreshold: 500,  // Bu eşiğin altı düşük bakiye
  warningThreshold: 2000     // Bu eşiğin altı uyarı
};

/* Her işletmeye eksik yerlerde ledger genişletmesi yap + "gift" gibi yeni tiplerle zenginleştir */
(function() {
  if (typeof ADMIN_BUSINESSES === 'undefined') return;

  // Her işletme için eğer walletHistory yoksa boş array yap
  for (var i = 0; i < ADMIN_BUSINESSES.length; i++) {
    var b = ADMIN_BUSINESSES[i];
    if (!b.walletHistory) b.walletHistory = [];
  }

  // Ekstra ledger kayıtları (admin hediye + bonus + earn) — gerçekçi görünüm için
  var extras = [
    { bizId:'bz1',  date:'2026-04-10T09:30:00', type:'gift',        amount:500,    desc:'Sadakat ödülü — Admin hediyesi', byAdmin:true },
    { bizId:'bz2',  date:'2026-04-08T14:00:00', type:'gift',        amount:1000,   desc:'Kampanya başarısı — Admin hediyesi', byAdmin:true },
    { bizId:'bz9',  date:'2026-04-05T10:00:00', type:'gift',        amount:2500,   desc:'Top #1 Performans Ligi ödülü', byAdmin:true },
    { bizId:'bz13', date:'2026-04-12T16:20:00', type:'gift',        amount:800,    desc:'5.0 puan başarısı ödülü', byAdmin:true },
    { bizId:'bz1',  date:'2026-04-12T10:00:00', type:'earn',        amount:350,    desc:'Müşteri beğeni bonusu' },
    { bizId:'bz2',  date:'2026-04-11T11:00:00', type:'earn',        amount:820,    desc:'Haftalık aktivite bonusu' },
    { bizId:'bz5',  date:'2026-04-09T08:00:00', type:'commission',  amount:-180,   desc:'Sipariş komisyonu #104250' },
    { bizId:'bz5',  date:'2026-04-08T20:00:00', type:'commission',  amount:-95,    desc:'Sipariş komisyonu #104248' },
    { bizId:'bz9',  date:'2026-04-13T09:00:00', type:'topup',       amount:5000,   desc:'Token yükleme (5000 TL paket)' },
    { bizId:'bz12', date:'2026-04-07T13:30:00', type:'refund',      amount:230,    desc:'Kullanıcı iptal iadesi #104265' },
    { bizId:'bz8',  date:'2026-04-15T12:00:00', type:'penalty',     amount:-500,   desc:'Platform ihlali — Admin cezası', byAdmin:true },
    { bizId:'bz14', date:'2026-04-14T14:00:00', type:'penalty',     amount:-250,   desc:'Puan düşüşü cezası', byAdmin:true },
    { bizId:'bz3',  date:'2026-04-11T15:45:00', type:'gift',        amount:300,    desc:'Yeni üye hoşgeldin ödülü', byAdmin:true },
    { bizId:'bz4',  date:'2026-04-10T11:30:00', type:'commission',  amount:-145,   desc:'Sipariş komisyonu #104245' },
    { bizId:'bz7',  date:'2026-04-09T19:15:00', type:'earn',        amount:180,    desc:'Yorum etkileşim bonusu' },
    { bizId:'bz10', date:'2026-04-16T08:30:00', type:'commission',  amount:-110,   desc:'Sipariş komisyonu #104270' }
  ];

  for (var e = 0; e < extras.length; e++) {
    var ex = extras[e];
    var biz = ADMIN_BUSINESSES.find(function(b) { return b.id === ex.bizId; });
    if (biz) biz.walletHistory.push(ex);
  }
})();

/* ═══════════════════════════════════════════════════════════
   TOKEN İŞLEMLERİ — Paketler, Otomatik Kampanya, Analitik
   ═══════════════════════════════════════════════════════════ */

/* Token paketleri — alım limiti & bonus */
var ADMIN_TOKEN_PACKAGES = [
  { id:'pkg_001', minTL:1000,  tokens:1050,  active:true,  createdAt:'2026-01-15T10:00:00' },
  { id:'pkg_002', minTL:2500,  tokens:2700,  active:true,  createdAt:'2026-01-15T10:00:00' },
  { id:'pkg_003', minTL:5000,  tokens:6000,  active:true,  createdAt:'2026-02-01T10:00:00' },
  { id:'pkg_004', minTL:10000, tokens:12500, active:true,  createdAt:'2026-02-15T10:00:00' },
  { id:'pkg_005', minTL:25000, tokens:35000, active:true,  createdAt:'2026-03-01T10:00:00' },
  { id:'pkg_006', minTL:500,   tokens:500,   active:false, createdAt:'2025-12-01T10:00:00' }
];

/* Otomatik kampanya */
var ADMIN_TOKEN_AUTO_CAMPAIGN = {
  enabled: true,
  triggerType: 'first_topup',       // 'first_topup' | 'monthly_loyalty'
  label: 'Yeni İşletmeye İlk Yükleme Bonusu',
  description: 'Yeni kayıt olan işletmelerin ilk token yüklemesinde ekstra bonus verilir',
  bonusPercent: 10,
  minAmount: 500,
  maxBonus: 5000,
  updatedAt: '2026-03-10T14:00:00'
};

/* Günlük İşlem Özeti (anlık snapshot) */
var ADMIN_TOKEN_DAILY_SUMMARY = {
  soldToken: 184500,         // İşletmelerin bugün satın aldığı
  giftToken: 12400,          // Bugün hediye edilen
  spentToken: 156800,        // Sirkülasyonda bugün harcanan
  netVolume: 27700,          // Sold - Spent
  reserveTL: 2450000,        // Sistem rezervi
  circulationToken: 2510000, // Dolaşımdaki toplam token
  reserveHealth: 'healthy'   // 'healthy' | 'warning' | 'critical'
};

/* Trend: 24 saatlik yükleme + haftalık */
var ADMIN_TOKEN_TRENDS = (function() {
  function gen(seed, base, variance, n) {
    var out = []; var s = seed;
    for (var i = 0; i < n; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var pct = (s % 10000) / 10000;
      out.push(Math.max(0, Math.round(base + pct * variance - variance / 2)));
    }
    return out;
  }
  return {
    hourly24: gen(100, 3500, 4500, 24),    // 24h saatlik yükleme
    weekly7:  gen(200, 24000, 16000, 7),   // 7g günlük yükleme
    daily30:  gen(300, 22000, 18000, 30),  // 30g günlük yükleme
    giftConversion: [
      { label:'<1 gün',    value:38, color:'#22C55E' },
      { label:'1-3 gün',   value:27, color:'#3B82F6' },
      { label:'4-7 gün',   value:18, color:'#8B5CF6' },
      { label:'8-30 gün',  value:12, color:'#F59E0B' },
      { label:'Harcanmadı', value:5,  color:'#6B7280' }
    ]
  };
})();

/* Tüm Token Hareketleri — log */
var ADMIN_TOKEN_TRANSACTIONS = [
  { id:'tx_001', date:'2026-04-16T14:32:00', bizId:'bz9',  bizName:'Kebapçı Hakkı',      type:'package',    amount:12500,  status:'success', desc:'10K TL Paket (+2500 bonus)' },
  { id:'tx_002', date:'2026-04-16T13:50:00', bizId:'bz2',  bizName:'Pide Palace',         type:'commission', amount:-180,   status:'success', desc:'Sipariş #104280 komisyonu' },
  { id:'tx_003', date:'2026-04-16T13:22:00', bizId:'bz1',  bizName:'Lezzet Mutfak',       type:'commission', amount:-40,    status:'success', desc:'Sipariş #104281 komisyonu' },
  { id:'tx_004', date:'2026-04-16T12:15:00', bizId:'bz13', bizName:'Tatlıcı Nene',        type:'gift',       amount:800,    status:'success', desc:'Admin hediyesi — 5.0 puan ödülü' },
  { id:'tx_005', date:'2026-04-16T11:30:00', bizId:'bz5',  bizName:'Çiğ Köfte Express',   type:'package',    amount:2700,   status:'success', desc:'2.5K TL Paket (+200 bonus)' },
  { id:'tx_006', date:'2026-04-16T11:15:00', bizId:'bz4',  bizName:'Sushi Master',        type:'ad',         amount:-420,   status:'success', desc:'AI Asistan reklam gösterimi' },
  { id:'tx_007', date:'2026-04-16T10:40:00', bizId:'bz13', bizName:'Tatlıcı Nene',        type:'commission', amount:-15,    status:'success', desc:'Sipariş #104274 komisyonu' },
  { id:'tx_008', date:'2026-04-16T10:20:00', bizId:'bz12', bizName:'Dönerci Baba',        type:'refund',     amount:230,    status:'success', desc:'Kullanıcı iptal iadesi' },
  { id:'tx_009', date:'2026-04-16T09:55:00', bizId:'bz3',  bizName:'Burger Lab',          type:'package',    amount:1050,   status:'pending', desc:'1K TL Paket — ödeme onayı bekliyor' },
  { id:'tx_010', date:'2026-04-16T09:30:00', bizId:'bz7',  bizName:'Waffle House',        type:'ad',         amount:-180,   status:'success', desc:'Keşfet reklam gösterimi' },
  { id:'tx_011', date:'2026-04-16T09:00:00', bizId:'bz2',  bizName:'Pide Palace',         type:'gift',       amount:1000,   status:'success', desc:'Admin hediyesi — Kampanya başarısı' },
  { id:'tx_012', date:'2026-04-16T08:45:00', bizId:'bz15', bizName:'Makarna Dükkanı',     type:'package',    amount:500,    status:'cancelled', desc:'500 TL Paket — iptal' },
  { id:'tx_013', date:'2026-04-16T08:30:00', bizId:'bz10', bizName:'Vegan Kitchen',       type:'commission', amount:-23,    status:'success', desc:'Sipariş #104270 komisyonu' },
  { id:'tx_014', date:'2026-04-15T22:10:00', bizId:'bz9',  bizName:'Kebapçı Hakkı',       type:'commission', amount:-21,    status:'success', desc:'Sipariş #104265 komisyonu' },
  { id:'tx_015', date:'2026-04-15T18:00:00', bizId:'bz1',  bizName:'Lezzet Mutfak',       type:'ad',         amount:-320,   status:'success', desc:'Local Stories reklam' },
  { id:'tx_016', date:'2026-04-15T14:00:00', bizId:'bz6',  bizName:'Pizza Napoli',        type:'gift',       amount:300,    status:'success', desc:'Otomatik kampanya — İlk yükleme bonusu' }
];

/* Tx tür meta (render için) */
var ADMIN_TOKEN_TX_TYPES = {
  package:    { label:'Paket Alımı',       color:'#22C55E', icon:'solar:wallet-money-bold',      direction:'in'  },
  gift:       { label:'Manuel Hediye',     color:'#8B5CF6', icon:'solar:gift-bold',              direction:'in'  },
  refund:     { label:'İade',              color:'#06B6D4', icon:'solar:refresh-circle-bold',    direction:'in'  },
  commission: { label:'Sipariş Komisyonu', color:'#F97316', icon:'solar:pie-chart-2-bold',       direction:'out' },
  ad:         { label:'Reklam Ödemesi',    color:'#EC4899', icon:'solar:gallery-wide-bold',      direction:'out' }
};

/* ═══════════════════════════════════════════════════════════
   ÖDEMELER — Transaction Seed
   ═══════════════════════════════════════════════════════════ */

var ADMIN_PAYMENT_TYPES = {
  premium_biz:  { label:'İşletme Premium',  icon:'solar:crown-star-bold',    color:'#F59E0B' },
  premium_user: { label:'Kullanıcı Premium', icon:'solar:crown-bold',         color:'#8B5CF6' },
  token:        { label:'Token Paketi',      icon:'solar:coin-bold',          color:'#EAB308' },
  ad:           { label:'Reklam Ödemesi',    icon:'solar:gallery-wide-bold',  color:'#EC4899' }
};

var ADMIN_PAYMENT_METHODS = {
  card:      { label:'Kredi Kartı',     icon:'solar:card-bold' },
  bank:      { label:'Banka Havalesi',  icon:'solar:money-bag-bold' },
  wallet:    { label:'Dijital Cüzdan',  icon:'solar:wallet-money-bold' }
};

var ADMIN_PAYMENT_PROVIDERS = ['Iyzico','Stripe','Papara','PayTR'];

var ADMIN_PAYMENT_ERROR_CODES = {
  '3DS_FAILED':       { label:'3D Secure Hatası',     desc:'Müşteri 3D Secure doğrulamasını tamamlayamadı', severity:'warning' },
  'INSUFFICIENT':     { label:'Yetersiz Bakiye',       desc:'Kart üzerinde yeterli bakiye yok',            severity:'info' },
  'CARD_DECLINED':    { label:'Kart Reddedildi',        desc:'Banka ödemeyi onaylamadı',                    severity:'critical' },
  'EXPIRED_CARD':     { label:'Kart Süresi Dolmuş',     desc:'Kart son kullanma tarihi geçmiş',             severity:'info' },
  'FRAUD_SUSPECTED':  { label:'Dolandırıcılık Şüphesi', desc:'Sistem güvenlik kontrolünde takıldı',         severity:'critical' },
  'TIMEOUT':          { label:'Zaman Aşımı',            desc:'Ödeme aracısı yanıt vermedi',                 severity:'warning' },
  'BANK_MAINTENANCE': { label:'Banka Bakım',            desc:'Banka bakımda, sonra tekrar deneyin',         severity:'warning' }
};

var ADMIN_PAYMENTS = [
  /* ── TAMAMLANAN (success) ── */
  { id:'py_001', status:'success', type:'premium_biz', payerKind:'biz',  payerId:'bz9',  payerName:'Kebapçı Hakkı',  amount:2800,   date:'2026-04-16T14:32:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83920-2026', cardMask:'**** 4521',
    productDesc:'Pro Plan — 1 aylık premium üyelik (14 özellik)', billingPeriod:'monthly' },
  { id:'py_002', status:'success', type:'token',       payerKind:'biz',  payerId:'bz2',  payerName:'Pide Palace',    amount:5000,   date:'2026-04-16T13:50:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83921-2026', cardMask:'**** 8833',
    productDesc:'5000 TL karşılığı 6000 Token Paketi (+1000 hediye)', tokenGranted:6000 },
  { id:'py_003', status:'success', type:'premium_user', payerKind:'user', payerId:'u2',   payerName:'Elif Demir',    amount:590,    date:'2026-04-16T12:20:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83918-2026', cardMask:'**** 1234',
    productDesc:'Kullanıcı Premium — 12 aylık yıllık üyelik', billingPeriod:'yearly' },
  { id:'py_004', status:'success', type:'ad',          payerKind:'biz',  payerId:'bz1',  payerName:'Lezzet Mutfak',  amount:1500,   date:'2026-04-16T11:15:00',
    method:'wallet', provider:'Papara', providerRef:'PPR-44872-2026',
    productDesc:'Reklam bütçesi — Yerel Hikayeler yerleşimi' },
  { id:'py_005', status:'success', type:'token',       payerKind:'biz',  payerId:'bz13', payerName:'Tatlıcı Nene',   amount:2500,   date:'2026-04-16T10:40:00',
    method:'card', provider:'Stripe', providerRef:'STR-ch_7732-2026', cardMask:'**** 9912',
    productDesc:'2500 TL karşılığı 2700 Token Paketi (+200 hediye)', tokenGranted:2700 },
  { id:'py_006', status:'success', type:'premium_biz', payerKind:'biz',  payerId:'bz5',  payerName:'Çiğ Köfte Express', amount:14400, date:'2026-04-15T16:00:00',
    method:'bank', provider:'PayTR', providerRef:'PYT-TRF-2026-0415-5511',
    productDesc:'Plus Plan — 12 aylık yıllık abonelik (indirimli)', billingPeriod:'yearly', invoiceNo:'FT-2026-0488' },
  { id:'py_007', status:'success', type:'token',       payerKind:'biz',  payerId:'bz4',  payerName:'Sushi Master',   amount:1000,   date:'2026-04-15T14:30:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83901-2026', cardMask:'**** 5522',
    productDesc:'1000 TL karşılığı 1050 Token Paketi (+50 hediye)', tokenGranted:1050 },
  { id:'py_008', status:'success', type:'ad',          payerKind:'biz',  payerId:'bz12', payerName:'Dönerci Baba',   amount:8000,   date:'2026-04-15T11:20:00',
    method:'bank', provider:'PayTR', providerRef:'PYT-TRF-2026-0415-4422',
    productDesc:'Reklam bütçesi — Keşfet + AI Asistan yerleşimi', invoiceNo:'FT-2026-0487' },
  { id:'py_009', status:'success', type:'premium_user', payerKind:'user', payerId:'u5',   payerName:'Mert Özkan',    amount:59,     date:'2026-04-15T09:45:00',
    method:'card', provider:'Stripe', providerRef:'STR-ch_7711-2026', cardMask:'**** 7845',
    productDesc:'Kullanıcı Premium — 1 aylık aylık üyelik', billingPeriod:'monthly' },
  { id:'py_010', status:'success', type:'token',       payerKind:'biz',  payerId:'bz7',  payerName:'Waffle House',   amount:2500,   date:'2026-04-14T18:30:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83880-2026', cardMask:'**** 3399',
    productDesc:'2500 TL karşılığı 2700 Token Paketi (+200 hediye)', tokenGranted:2700,
    refunded:true, refundedAt:'2026-04-15T10:00:00', refundReason:'Müşteri talebiyle iade' },

  /* ── TAMAMLANMAYAN (failed) ── */
  { id:'py_011', status:'failed',  type:'premium_biz', payerKind:'biz',  payerId:'bz15', payerName:'Makarna Dükkanı', amount:500,    date:'2026-04-16T15:00:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83922-2026', cardMask:'**** 6677',
    errorCode:'3DS_FAILED',
    productDesc:'Standart Plan — 1 aylık üyelik' },
  { id:'py_012', status:'failed',  type:'token',       payerKind:'biz',  payerId:'bz6',  payerName:'Pizza Napoli',   amount:10000,  date:'2026-04-16T13:10:00',
    method:'card', provider:'Stripe', providerRef:'STR-ch_7730-2026', cardMask:'**** 8811',
    errorCode:'INSUFFICIENT',
    productDesc:'10000 TL karşılığı 12500 Token Paketi' },
  { id:'py_013', status:'failed',  type:'ad',          payerKind:'biz',  payerId:'bz11', payerName:'Balıkçı Rıza',   amount:2000,   date:'2026-04-16T09:45:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83915-2026', cardMask:'**** 2211',
    errorCode:'CARD_DECLINED',
    productDesc:'Reklam bütçesi — Restoran Listeleme' },
  { id:'py_014', status:'failed',  type:'premium_user', payerKind:'user', payerId:'u12',  payerName:'Hasan Yılmaz',   amount:590,    date:'2026-04-15T22:15:00',
    method:'card', provider:'Stripe', providerRef:'STR-ch_7705-2026', cardMask:'**** 4433',
    errorCode:'EXPIRED_CARD',
    productDesc:'Kullanıcı Premium — Yıllık' },
  { id:'py_015', status:'failed',  type:'token',       payerKind:'biz',  payerId:'bz14', payerName:'Kumpir Evi',     amount:25000,  date:'2026-04-15T20:00:00',
    method:'card', provider:'PayTR', providerRef:'PYT-CRD-2026-0415-9901', cardMask:'**** 7788',
    errorCode:'FRAUD_SUSPECTED',
    productDesc:'25000 TL karşılığı 35000 Token Paketi' },
  { id:'py_016', status:'failed',  type:'premium_biz', payerKind:'biz',  payerId:'bz8',  payerName:'Tantuni Evi',    amount:500,    date:'2026-04-15T11:30:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83875-2026', cardMask:'**** 5566',
    errorCode:'TIMEOUT',
    productDesc:'Standart Plan — 1 aylık' },

  /* ── BEKLEYEN (pending) ── */
  { id:'py_017', status:'pending', type:'token',       payerKind:'biz',  payerId:'bz3',  payerName:'Burger Lab',     amount:1000,   date:'2026-04-16T15:45:00',
    method:'bank', provider:'PayTR', providerRef:'PYT-TRF-2026-0416-8834',
    productDesc:'1000 TL karşılığı 1050 Token Paketi', pendingReason:'Havale onayı bekleniyor' },
  { id:'py_018', status:'pending', type:'premium_biz', payerKind:'biz',  payerId:'bz10', payerName:'Vegan Kitchen',  amount:1250,   date:'2026-04-16T14:20:00',
    method:'card', provider:'Iyzico', providerRef:'IYZ-83920-2026', cardMask:'**** 0099',
    productDesc:'Plus Plan — 1 aylık üyelik', pendingReason:'Provizyon tamamlanıyor' },
  { id:'py_019', status:'pending', type:'ad',          payerKind:'biz',  payerId:'bz2',  payerName:'Pide Palace',    amount:5000,   date:'2026-04-16T12:50:00',
    method:'bank', provider:'PayTR', providerRef:'PYT-TRF-2026-0416-5511',
    productDesc:'Reklam bütçesi — Akıllı Eşleşme yerleşimi', pendingReason:'Manuel admin onayı gerekli' }
];

/* ═══════════════════════════════════════════════════════════
   HIZLI MÜDAHALE — Kayıp Önleme Event'leri
   ═══════════════════════════════════════════════════════════ */

/* İptal sebepleri preset */
var ADMIN_CANCEL_REASONS = [
  { id:'expensive',      label:'Fiyat yüksek',                  color:'#EF4444' },
  { id:'unused',          label:'Yeterince kullanmadım',        color:'#F97316' },
  { id:'competitor',     label:'Rakibe geçtim',                 color:'#EC4899' },
  { id:'technical',      label:'Teknik sorunlar',               color:'#F59E0B' },
  { id:'no_need',        label:'İhtiyacım kalmadı',             color:'#6B7280' },
  { id:'temporary',      label:'Geçici olarak duraklatıyorum',  color:'#3B82F6' },
  { id:'privacy',        label:'Gizlilik endişeleri',           color:'#8B5CF6' },
  { id:'other',          label:'Diğer',                          color:'#64748B' }
];

/* Retention event listesi */
var ADMIN_RETENTION_EVENTS = [
  /* ── KULLANICI EVENTS ── */
  { id:'re_001', kind:'user', eventType:'premium_cancel', subjectId:'u4', subjectName:'Mert Özkan',
    email:'mert@email.com', phone:'+905553334001',
    membershipDays:124, totalSpent:295, cancelledAt:'2026-04-16T14:20:00',
    reasonId:'expensive', reasonText:'Aylık ücret benim için yüksek — yılda 1-2 kez kullanıyorum',
    status:'open' },
  { id:'re_002', kind:'user', eventType:'account_delete', subjectId:'u11', subjectName:'Cem Arslan',
    email:'cem@email.com', phone:'+905553334002',
    activeDays:287, lastActivity:'2026-04-14T10:00:00', requestedAt:'2026-04-16T09:15:00',
    reasonId:'privacy', reasonText:'GDPR hakkım çerçevesinde tüm verilerimin silinmesini istiyorum',
    status:'pending_contact' },
  { id:'re_003', kind:'user', eventType:'premium_cancel', subjectId:'u9', subjectName:'Aylin Kara',
    email:'aylin@email.com', phone:'+905553334003',
    membershipDays:182, totalSpent:418, cancelledAt:'2026-04-15T18:45:00',
    reasonId:'unused', reasonText:'Son 2 aydır premium özellikleri açmadım',
    status:'open' },
  { id:'re_004', kind:'user', eventType:'account_delete', subjectId:'u17', subjectName:'Arda Koç',
    email:'arda@email.com', phone:'+905553334004',
    activeDays:45, lastActivity:'2026-04-15T22:00:00', requestedAt:'2026-04-15T22:30:00',
    reasonId:'competitor', reasonText:'Başka bir uygulamaya geçiyorum',
    status:'pending_contact' },
  { id:'re_005', kind:'user', eventType:'premium_cancel', subjectId:'u2', subjectName:'Elif Demir',
    email:'elif@email.com', phone:'+905553334005',
    membershipDays:360, totalSpent:708, cancelledAt:'2026-04-15T11:30:00',
    reasonId:'no_need', reasonText:'Çocuklarım büyüdü, artık o kadar yemek siparişi vermiyoruz',
    status:'contacted' },
  { id:'re_006', kind:'user', eventType:'account_delete', subjectId:'u16', subjectName:'Selin Er',
    email:'selin@email.com', phone:'+905553334006',
    activeDays:92, lastActivity:'2026-04-13T08:00:00', requestedAt:'2026-04-14T16:20:00',
    reasonId:'technical', reasonText:'Uygulama sürekli donuyor',
    status:'resolved' },
  { id:'re_007', kind:'user', eventType:'premium_cancel', subjectId:'u5', subjectName:'Mert Özkan (ikinci hesap)',
    email:'mert2@email.com', phone:'+905553334007',
    membershipDays:31, totalSpent:59, cancelledAt:'2026-04-14T13:00:00',
    reasonId:'temporary', reasonText:'Yaza kadar gerek yok, eylülde tekrar alırım',
    status:'open' },

  /* ── İŞLETME EVENTS ── */
  { id:'re_008', kind:'biz', eventType:'premium_cancel', subjectId:'bz6', subjectName:'Pizza Napoli',
    email:'emre@pizzanapoli.com', phone:'+905551006006',
    membershipDays:215, totalSpent:5400, cancelledAt:'2026-04-16T12:30:00',
    reasonId:'expensive', reasonText:'Plus plan aylık 1.250 TL benim için yüksek — daha uygun bir paket olsa kalırım',
    status:'open' },
  { id:'re_009', kind:'biz', eventType:'account_delete', subjectId:'bz8', subjectName:'Tantuni Evi',
    email:'hasan@tantunievi.com', phone:'+905551008008',
    activeDays:189, lastActivity:'2026-03-15T10:00:00', requestedAt:'2026-04-16T10:00:00',
    reasonId:'other', reasonText:'Restoran kapanıyor, hesap artık gerekli değil',
    status:'pending_contact' },
  { id:'re_010', kind:'biz', eventType:'premium_cancel', subjectId:'bz15', subjectName:'Makarna Dükkanı',
    email:'ece@makarnadukkani.com', phone:'+905551015015',
    membershipDays:73, totalSpent:1500, cancelledAt:'2026-04-15T15:20:00',
    reasonId:'unused', reasonText:'Premium özellikleri açmaya fırsat bulamadım',
    status:'open' },
  { id:'re_011', kind:'biz', eventType:'premium_cancel', subjectId:'bz3', subjectName:'Burger Lab',
    email:'zeynep@burgerlab.com', phone:'+905551003003',
    membershipDays:45, totalSpent:625, cancelledAt:'2026-04-14T20:00:00',
    reasonId:'competitor', reasonText:'Yemeksepeti ile devam edeceğim',
    status:'contacted' },
  { id:'re_012', kind:'biz', eventType:'account_delete', subjectId:'bz14', subjectName:'Kumpir Evi',
    email:'can@kumpirevi.com', phone:'+905551014014',
    activeDays:120, lastActivity:'2026-04-13T12:00:00', requestedAt:'2026-04-15T18:00:00',
    reasonId:'technical', reasonText:'Sipariş paneli sürekli donuyor, kullanamıyoruz',
    status:'pending_contact' }
];

/* Geri kazanım teklif şablonları */
var ADMIN_WINBACK_TEMPLATES = [
  { id:'wb_discount_50', label:'%50 İndirimli 3 Aylık',        type:'discount', value:50, durationMonths:3,  color:'#8B5CF6' },
  { id:'wb_free_month',  label:'1 Ay Ücretsiz Uzatma',          type:'free',      value:1,  durationMonths:1,  color:'#22C55E' },
  { id:'wb_downgrade',   label:'Daha Uygun Plana Geçiş Öner',  type:'downgrade', value:0,  durationMonths:0,  color:'#3B82F6' },
  { id:'wb_custom',      label:'Özel Taslak',                     type:'custom',    value:0,  durationMonths:0,  color:'#EC4899' }
];

/* ═══════════════════════════════════════════════════════════
   COMMUNITY — Topluluk Analizleri
   13 Top-10 listesi • time × region filtreli
   ═══════════════════════════════════════════════════════════ */

var ADMIN_COMMUNITY_REGIONS = [
  { id:'all',       label:'Tüm Türkiye',  city:null },
  { id:'istanbul',  label:'İstanbul',      city:'İstanbul' },
  { id:'ankara',    label:'Ankara',        city:'Ankara' },
  { id:'izmir',     label:'İzmir',         city:'İzmir' },
  { id:'bodrum',    label:'Bodrum',        city:'Muğla' },
  { id:'kadikoy',   label:'Kadıköy',       city:'İstanbul/Kadıköy' }
];

var ADMIN_COMMUNITY_TIME = [
  { id:'day',   label:'Günlük',  sub:'Son 24 saat' },
  { id:'week',  label:'Haftalık',sub:'Son 7 gün' },
  { id:'month', label:'Aylık',   sub:'Son 30 gün' }
];

// Helper: zaman × bölge etkiyle sayıyı ölçeklendir
function _admCmScale(base, time, region) {
  var tMult = time === 'day' ? 0.08 : time === 'week' ? 0.45 : 1.0;
  var rMult = region === 'all' ? 1.0
    : region === 'istanbul' ? 0.52
    : region === 'ankara' ? 0.21
    : region === 'izmir' ? 0.17
    : region === 'bodrum' ? 0.07
    : region === 'kadikoy' ? 0.14
    : 1.0;
  return Math.max(1, Math.round(base * tMult * rMult));
}

// Baseline listeler — zaman/bölge faktörüyle ölçeklenir
var ADMIN_COMMUNITY_BASE = {
  // 1. En çok aranan tarifler
  searchRecipes: [
    { id:'r_manti',     name:'Mantı',              v:48250, kind:'recipe' },
    { id:'r_lahmacun',  name:'Lahmacun',           v:42180, kind:'recipe' },
    { id:'r_adana',     name:'Adana Kebap',        v:38940, kind:'recipe' },
    { id:'r_iskender',  name:'İskender',           v:35210, kind:'recipe' },
    { id:'r_kofte',     name:'Ev Köftesi',         v:31870, kind:'recipe' },
    { id:'r_pilav',     name:'İç Pilav',           v:28430, kind:'recipe' },
    { id:'r_cheesecake',name:'Cheesecake',         v:24910, kind:'recipe' },
    { id:'r_dolma',     name:'Yaprak Sarma',       v:22560, kind:'recipe' },
    { id:'r_borek',     name:'Su Böreği',          v:20130, kind:'recipe' },
    { id:'r_pizza_ev',  name:'Ev Yapımı Pizza',    v:18420, kind:'recipe' }
  ],
  // 2. En çok aranan menü itemleri
  searchMenu: [
    { id:'m_bigburger', name:'Big Burger Menu',      biz:'Burger Lab',      v:12400, kind:'menu' },
    { id:'m_iskender',  name:'İskender Porsiyon',    biz:'Kebapçı Hacı',    v:11820, kind:'menu' },
    { id:'m_carbonara', name:'Carbonara',            biz:'La Pasta',        v:10910, kind:'menu' },
    { id:'m_peppsalami',name:'Pepperoni Pizza',      biz:'Pizza House',     v: 9680, kind:'menu' },
    { id:'m_sushi_set', name:'Philadelphia Set',     biz:'Sushi Bar',       v: 8740, kind:'menu' },
    { id:'m_cheesecake',name:'San Sebastian',        biz:'Şekerci Atelier', v: 7920, kind:'menu' },
    { id:'m_doner',     name:'Döner Dürüm',          biz:'Dönerci Mehmet',  v: 7460, kind:'menu' },
    { id:'m_mangal',    name:'Karışık Mangal',       biz:'Mangal Evi',      v: 6310, kind:'menu' },
    { id:'m_mantip',    name:'Kayseri Mantısı',      biz:'Anadolu Sofrası', v: 5890, kind:'menu' },
    { id:'m_waffle',    name:'Meyveli Waffle',       biz:'Waffle Dükkanı',  v: 5120, kind:'menu' }
  ],
  // 3. En çok kaydedilen tarifler
  savedRecipes: [
    { id:'r_lahmacun',  name:'Lahmacun',           v:18420, kind:'recipe' },
    { id:'r_cheesecake',name:'Cheesecake',         v:16290, kind:'recipe' },
    { id:'r_manti',     name:'Mantı',              v:15740, kind:'recipe' },
    { id:'r_pilav',     name:'İç Pilav',           v:13110, kind:'recipe' },
    { id:'r_borek',     name:'Su Böreği',          v:11530, kind:'recipe' },
    { id:'r_kofte',     name:'Ev Köftesi',         v: 9840, kind:'recipe' },
    { id:'r_adana',     name:'Adana Kebap',        v: 8720, kind:'recipe' },
    { id:'r_iskender',  name:'İskender',           v: 7510, kind:'recipe' },
    { id:'r_dolma',     name:'Yaprak Sarma',       v: 6980, kind:'recipe' },
    { id:'r_pizza_ev',  name:'Ev Yapımı Pizza',    v: 5720, kind:'recipe' }
  ],
  // 4. En çok beğenilen tarifler
  likedRecipes: [
    { id:'r_cheesecake',name:'Cheesecake',         v:24120, kind:'recipe' },
    { id:'r_manti',     name:'Mantı',              v:22480, kind:'recipe' },
    { id:'r_lahmacun',  name:'Lahmacun',           v:19950, kind:'recipe' },
    { id:'r_borek',     name:'Su Böreği',          v:17230, kind:'recipe' },
    { id:'r_pizza_ev',  name:'Ev Yapımı Pizza',    v:15640, kind:'recipe' },
    { id:'r_kofte',     name:'Ev Köftesi',         v:13820, kind:'recipe' },
    { id:'r_pilav',     name:'İç Pilav',           v:11510, kind:'recipe' },
    { id:'r_iskender',  name:'İskender',           v:10240, kind:'recipe' },
    { id:'r_adana',     name:'Adana Kebap',        v: 8710, kind:'recipe' },
    { id:'r_dolma',     name:'Yaprak Sarma',       v: 7520, kind:'recipe' }
  ],
  // 5. En çok yorum alan tarifler
  commentedRecipes: [
    { id:'r_manti',     name:'Mantı',              v: 3240, kind:'recipe' },
    { id:'r_cheesecake',name:'Cheesecake',         v: 2810, kind:'recipe' },
    { id:'r_borek',     name:'Su Böreği',          v: 2460, kind:'recipe' },
    { id:'r_lahmacun',  name:'Lahmacun',           v: 2180, kind:'recipe' },
    { id:'r_pilav',     name:'İç Pilav',           v: 1920, kind:'recipe' },
    { id:'r_kofte',     name:'Ev Köftesi',         v: 1740, kind:'recipe' },
    { id:'r_pizza_ev',  name:'Ev Yapımı Pizza',    v: 1580, kind:'recipe' },
    { id:'r_iskender',  name:'İskender',           v: 1340, kind:'recipe' },
    { id:'r_dolma',     name:'Yaprak Sarma',       v: 1190, kind:'recipe' },
    { id:'r_adana',     name:'Adana Kebap',        v: 1040, kind:'recipe' }
  ],
  // 6. En çok paylaşılan tarifler
  sharedRecipes: [
    { id:'r_lahmacun',  name:'Lahmacun',           v: 5420, kind:'recipe' },
    { id:'r_cheesecake',name:'Cheesecake',         v: 4810, kind:'recipe' },
    { id:'r_manti',     name:'Mantı',              v: 4560, kind:'recipe' },
    { id:'r_borek',     name:'Su Böreği',          v: 3940, kind:'recipe' },
    { id:'r_pizza_ev',  name:'Ev Yapımı Pizza',    v: 3520, kind:'recipe' },
    { id:'r_kofte',     name:'Ev Köftesi',         v: 3180, kind:'recipe' },
    { id:'r_iskender',  name:'İskender',           v: 2840, kind:'recipe' },
    { id:'r_pilav',     name:'İç Pilav',           v: 2610, kind:'recipe' },
    { id:'r_dolma',     name:'Yaprak Sarma',       v: 2310, kind:'recipe' },
    { id:'r_adana',     name:'Adana Kebap',        v: 1980, kind:'recipe' }
  ],
  // 7. En çok kaydedilen menü itemleri
  savedMenu: [
    { id:'m_cheesecake',name:'San Sebastian',        biz:'Şekerci Atelier', v: 4210, kind:'menu' },
    { id:'m_iskender',  name:'İskender Porsiyon',    biz:'Kebapçı Hacı',    v: 3840, kind:'menu' },
    { id:'m_bigburger', name:'Big Burger Menu',      biz:'Burger Lab',      v: 3510, kind:'menu' },
    { id:'m_carbonara', name:'Carbonara',            biz:'La Pasta',        v: 2910, kind:'menu' },
    { id:'m_peppsalami',name:'Pepperoni Pizza',      biz:'Pizza House',     v: 2680, kind:'menu' },
    { id:'m_mantip',    name:'Kayseri Mantısı',      biz:'Anadolu Sofrası', v: 2240, kind:'menu' },
    { id:'m_sushi_set', name:'Philadelphia Set',     biz:'Sushi Bar',       v: 2020, kind:'menu' },
    { id:'m_doner',     name:'Döner Dürüm',          biz:'Dönerci Mehmet',  v: 1760, kind:'menu' },
    { id:'m_mangal',    name:'Karışık Mangal',       biz:'Mangal Evi',      v: 1540, kind:'menu' },
    { id:'m_waffle',    name:'Meyveli Waffle',       biz:'Waffle Dükkanı',  v: 1290, kind:'menu' }
  ],
  // 8. En çok beğenilen menü itemleri
  likedMenu: [
    { id:'m_bigburger', name:'Big Burger Menu',      biz:'Burger Lab',      v: 8920, kind:'menu' },
    { id:'m_carbonara', name:'Carbonara',            biz:'La Pasta',        v: 7610, kind:'menu' },
    { id:'m_cheesecake',name:'San Sebastian',        biz:'Şekerci Atelier', v: 7180, kind:'menu' },
    { id:'m_iskender',  name:'İskender Porsiyon',    biz:'Kebapçı Hacı',    v: 6540, kind:'menu' },
    { id:'m_peppsalami',name:'Pepperoni Pizza',      biz:'Pizza House',     v: 5910, kind:'menu' },
    { id:'m_sushi_set', name:'Philadelphia Set',     biz:'Sushi Bar',       v: 4840, kind:'menu' },
    { id:'m_waffle',    name:'Meyveli Waffle',       biz:'Waffle Dükkanı',  v: 4120, kind:'menu' },
    { id:'m_doner',     name:'Döner Dürüm',          biz:'Dönerci Mehmet',  v: 3780, kind:'menu' },
    { id:'m_mangal',    name:'Karışık Mangal',       biz:'Mangal Evi',      v: 3210, kind:'menu' },
    { id:'m_mantip',    name:'Kayseri Mantısı',      biz:'Anadolu Sofrası', v: 2740, kind:'menu' }
  ],
  // 9. En çok yorum alan menü itemleri
  commentedMenu: [
    { id:'m_bigburger', name:'Big Burger Menu',      biz:'Burger Lab',      v: 1820, kind:'menu' },
    { id:'m_iskender',  name:'İskender Porsiyon',    biz:'Kebapçı Hacı',    v: 1540, kind:'menu' },
    { id:'m_carbonara', name:'Carbonara',            biz:'La Pasta',        v: 1320, kind:'menu' },
    { id:'m_cheesecake',name:'San Sebastian',        biz:'Şekerci Atelier', v: 1180, kind:'menu' },
    { id:'m_peppsalami',name:'Pepperoni Pizza',      biz:'Pizza House',     v:  980, kind:'menu' },
    { id:'m_sushi_set', name:'Philadelphia Set',     biz:'Sushi Bar',       v:  810, kind:'menu' },
    { id:'m_mangal',    name:'Karışık Mangal',       biz:'Mangal Evi',      v:  710, kind:'menu' },
    { id:'m_mantip',    name:'Kayseri Mantısı',      biz:'Anadolu Sofrası', v:  610, kind:'menu' },
    { id:'m_doner',     name:'Döner Dürüm',          biz:'Dönerci Mehmet',  v:  540, kind:'menu' },
    { id:'m_waffle',    name:'Meyveli Waffle',       biz:'Waffle Dükkanı',  v:  470, kind:'menu' }
  ],
  // 10. En çok paylaşılan menü itemleri
  sharedMenu: [
    { id:'m_bigburger', name:'Big Burger Menu',      biz:'Burger Lab',      v: 2740, kind:'menu' },
    { id:'m_peppsalami',name:'Pepperoni Pizza',      biz:'Pizza House',     v: 2410, kind:'menu' },
    { id:'m_cheesecake',name:'San Sebastian',        biz:'Şekerci Atelier', v: 2180, kind:'menu' },
    { id:'m_carbonara', name:'Carbonara',            biz:'La Pasta',        v: 1920, kind:'menu' },
    { id:'m_iskender',  name:'İskender Porsiyon',    biz:'Kebapçı Hacı',    v: 1670, kind:'menu' },
    { id:'m_sushi_set', name:'Philadelphia Set',     biz:'Sushi Bar',       v: 1420, kind:'menu' },
    { id:'m_waffle',    name:'Meyveli Waffle',       biz:'Waffle Dükkanı',  v: 1210, kind:'menu' },
    { id:'m_doner',     name:'Döner Dürüm',          biz:'Dönerci Mehmet',  v: 1080, kind:'menu' },
    { id:'m_mangal',    name:'Karışık Mangal',       biz:'Mangal Evi',      v:  920, kind:'menu' },
    { id:'m_mantip',    name:'Kayseri Mantısı',      biz:'Anadolu Sofrası', v:  780, kind:'menu' }
  ],
  // 11. En çok takipçi kazanan profiller
  topFollowed: [
    { id:'usr_001', name:'Chef Ayşe Demir',  sub:'@chefayse · Şef',         v: 18420, kind:'user' },
    { id:'usr_002', name:'Burger Lab',       sub:'@burgerlab · İşletme',    v: 15210, kind:'biz'  },
    { id:'usr_003', name:'Mehmet Usta',      sub:'@mehmetusta · Şef',       v: 13840, kind:'user' },
    { id:'usr_004', name:'Kebapçı Hacı',     sub:'@kebapcihaci · İşletme',  v: 12650, kind:'biz'  },
    { id:'usr_005', name:'Gurme Elif',       sub:'@gurmeelif · Kullanıcı',  v: 11320, kind:'user' },
    { id:'usr_006', name:'La Pasta',         sub:'@lapasta · İşletme',      v:  9840, kind:'biz'  },
    { id:'usr_007', name:'Tatlı Dürdane',    sub:'@durdane · Kullanıcı',    v:  8510, kind:'user' },
    { id:'usr_008', name:'Sushi Bar',        sub:'@sushibar · İşletme',     v:  7420, kind:'biz'  },
    { id:'usr_009', name:'Cem Öztürk',       sub:'@cemozturk · Şef',        v:  6310, kind:'user' },
    { id:'usr_010', name:'Pizza House',      sub:'@pizzahouse · İşletme',   v:  5480, kind:'biz'  }
  ],
  // 12. En çok sipariş veren kullanıcılar (Sadık müşteriler)
  topBuyers: [
    { id:'usr_101', name:'Furkan Şahin',    sub:'furkan.s@cmp · 248 sipariş',  v:248, unit:'sipariş', kind:'user' },
    { id:'usr_102', name:'Zeynep Kaya',     sub:'zeynep.k · 214 sipariş',       v:214, unit:'sipariş', kind:'user' },
    { id:'usr_103', name:'Burak Yılmaz',    sub:'burak.y · 198 sipariş',        v:198, unit:'sipariş', kind:'user' },
    { id:'usr_104', name:'Elif Doğan',      sub:'elif.d · 176 sipariş',         v:176, unit:'sipariş', kind:'user' },
    { id:'usr_105', name:'Emre Çelik',      sub:'emre.c · 154 sipariş',         v:154, unit:'sipariş', kind:'user' },
    { id:'usr_106', name:'Selin Aydın',     sub:'selin.a · 142 sipariş',        v:142, unit:'sipariş', kind:'user' },
    { id:'usr_107', name:'Can Özdemir',     sub:'can.o · 128 sipariş',          v:128, unit:'sipariş', kind:'user' },
    { id:'usr_108', name:'Melis Arslan',    sub:'melis.a · 116 sipariş',        v:116, unit:'sipariş', kind:'user' },
    { id:'usr_109', name:'Onur Şimşek',     sub:'onur.s · 104 sipariş',         v:104, unit:'sipariş', kind:'user' },
    { id:'usr_110', name:'Deniz Kurt',      sub:'deniz.k · 92 sipariş',         v: 92, unit:'sipariş', kind:'user' }
  ],
  // 13. En çok sipariş satan işletmeler
  topSellers: [
    { id:'biz_001', name:'Burger Lab',       sub:'Kadıköy · 18K sipariş',   v:18420, unit:'sipariş', kind:'biz' },
    { id:'biz_002', name:'Kebapçı Hacı',     sub:'Fatih · 15K sipariş',     v:15210, unit:'sipariş', kind:'biz' },
    { id:'biz_003', name:'La Pasta',         sub:'Beşiktaş · 13K sipariş',  v:13840, unit:'sipariş', kind:'biz' },
    { id:'biz_004', name:'Pizza House',      sub:'Şişli · 12K sipariş',     v:12650, unit:'sipariş', kind:'biz' },
    { id:'biz_005', name:'Sushi Bar',        sub:'Şişli · 11K sipariş',     v:11320, unit:'sipariş', kind:'biz' },
    { id:'biz_006', name:'Dönerci Mehmet',   sub:'Üsküdar · 9.8K sipariş',  v: 9840, unit:'sipariş', kind:'biz' },
    { id:'biz_007', name:'Şekerci Atelier',  sub:'Bebek · 8.5K sipariş',    v: 8510, unit:'sipariş', kind:'biz' },
    { id:'biz_008', name:'Mangal Evi',       sub:'Bakırköy · 7.4K sipariş', v: 7420, unit:'sipariş', kind:'biz' },
    { id:'biz_009', name:'Anadolu Sofrası',  sub:'Maltepe · 6.3K sipariş',  v: 6310, unit:'sipariş', kind:'biz' },
    { id:'biz_010', name:'Waffle Dükkanı',   sub:'Caddebostan · 5.5K sipariş', v:5480, unit:'sipariş', kind:'biz' }
  ]
};

// Kart tanımları (görsel)
var ADMIN_COMMUNITY_CARDS = [
  { id:'searchRecipes',    title:'En Çok Aranan Tarifler',       icon:'solar:magnifer-bold',         color:'#F65013', group:'Arama',    unit:'arama' },
  { id:'searchMenu',       title:'En Çok Aranan Menü',           icon:'solar:magnifer-zoom-in-bold', color:'#F59E0B', group:'Arama',    unit:'arama' },
  { id:'savedRecipes',     title:'En Çok Kaydedilen Tarifler',   icon:'solar:bookmark-bold',         color:'#3B82F6', group:'Tarif',    unit:'kaydetme' },
  { id:'likedRecipes',     title:'En Çok Beğenilen Tarifler',    icon:'solar:heart-bold',            color:'#EC4899', group:'Tarif',    unit:'beğeni' },
  { id:'commentedRecipes', title:'En Çok Yorum Alan Tarifler',   icon:'solar:chat-round-dots-bold',  color:'#06B6D4', group:'Tarif',    unit:'yorum' },
  { id:'sharedRecipes',    title:'En Çok Paylaşılan Tarifler',   icon:'solar:share-bold',            color:'#8B5CF6', group:'Tarif',    unit:'paylaşım' },
  { id:'savedMenu',        title:'En Çok Kaydedilen Menü',       icon:'solar:bookmark-bold',         color:'#3B82F6', group:'Menü',     unit:'kaydetme' },
  { id:'likedMenu',        title:'En Çok Beğenilen Menü',        icon:'solar:heart-bold',            color:'#EC4899', group:'Menü',     unit:'beğeni' },
  { id:'commentedMenu',    title:'En Çok Yorum Alan Menü',       icon:'solar:chat-round-dots-bold',  color:'#06B6D4', group:'Menü',     unit:'yorum' },
  { id:'sharedMenu',       title:'En Çok Paylaşılan Menü',       icon:'solar:share-bold',            color:'#8B5CF6', group:'Menü',     unit:'paylaşım' },
  { id:'topFollowed',      title:'En Çok Takipçi Kazanan',       icon:'solar:users-group-rounded-bold',color:'#22C55E',group:'Liderler', unit:'takipçi' },
  { id:'topBuyers',        title:'En Sadık Müşteriler',          icon:'solar:bag-smile-bold',        color:'#F59E0B', group:'Liderler', unit:'sipariş' },
  { id:'topSellers',       title:'En Çok Satan İşletmeler',      icon:'solar:shop-2-bold',           color:'#10B981', group:'Liderler', unit:'sipariş' }
];

/* ═══════════════════════════════════════════════════════════
   AI ASSISTANT — Yapay Zeka Asistanı (Admin)
   Chat tabanlı komut arayüzü · salt okuma + aksiyon trigger
   ═══════════════════════════════════════════════════════════ */

// Hızlı prompt'lar (chat üstünde chip olarak)
var ADMIN_AI_PROMPTS = [
  { icon:'solar:calendar-date-bold',       label:'Bugünün özeti',           prompt:'Bugünün platform özetini çıkar' },
  { icon:'solar:danger-triangle-bold',     label:'Sorunlu işletmeler',      prompt:'Son hafta en çok şikayet alan işletmeleri listele' },
  { icon:'solar:chart-square-bold',        label:'Düşen bölgeler',          prompt:'Geçen aya göre sipariş düşüşü olan bölgeleri çıkar' },
  { icon:'solar:gift-bold',                label:'Kampanya kurgula',        prompt:'Sadık kullanıcılara token hediye kampanyası kurgula' },
  { icon:'solar:magnifer-zoom-in-bold',    label:'Trend menü',              prompt:'Son bir haftada en çok aranan 3 menü itemini bul, reklam vermemiş işletmelere bildir' },
  { icon:'solar:moon-sleep-bold',          label:'Pasif kullanıcılar',      prompt:'Bodrum bölgesindeki aktif olmayan kullanıcılara %10 indirim bildirimi taslakla' }
];

// Senaryo kütüphanesi — anahtar kelime eşleştirmesiyle yanıt + aksiyon
// Her senaryo: keywords (regex) · intro · analysis (tablo) · action (buton + meta)
var ADMIN_AI_SCENARIOS = [
  {
    id:'trend_menu',
    keywords:['trend','en çok aranan','top menü','reklam vermemiş'],
    intro:'Son 7 günün arama verisini tarıyorum...',
    buildResponse: function() {
      return {
        text:'Son 1 haftada en çok aranan 3 menü itemini buldum ve bu ürünleri satan ama henüz reklam vermemiş 5 işletmeyi listeledim. Aşağıda bildirimin taslağını hazırladım — onaylarsan gönderiyorum.',
        analysis: {
          title:'Trend Menü Analizi',
          rows:[
            { label:'#1 Big Burger Menu',   value:'12.4K arama',  note:'Burger Lab' },
            { label:'#2 İskender Porsiyon', value:'11.8K arama',  note:'Kebapçı Hacı' },
            { label:'#3 Carbonara',         value:'10.9K arama',  note:'La Pasta' },
            { label:'Reklam vermeyen biz.', value:'5 işletme',    note:'Hedef kitle' }
          ]
        },
        action: {
          type:'notification',
          label:'Bildirimi Gönder',
          target:'5 işletme',
          preview:'"Bu ürününüz şu anda trend! Reklam vererek arama sonuçlarında öne çıkmak ister misiniz?"',
          channel:'Push + E-posta'
        }
      };
    }
  },
  {
    id:'inactive_users',
    keywords:['aktif olmayan','pasif','uyuyan','bodrum','indirim','geri kazan'],
    intro:'Pasif kullanıcı listesi hazırlanıyor...',
    buildResponse: function() {
      return {
        text:'Bodrum bölgesinde son 30 gündür sipariş vermemiş 247 kullanıcı buldum. %10 indirim içeren bir bildirim taslağı hazırladım. Onayın ile gönderim başlar.',
        analysis: {
          title:'Pasif Kullanıcı Analizi',
          rows:[
            { label:'Bölge',              value:'Bodrum',        note:'Muğla' },
            { label:'Pasif kullanıcı',    value:'247 kişi',      note:'>30 gün sipariş yok' },
            { label:'Ort. sepet (eski)',  value:'₺185',          note:'Son 6 ayda' },
            { label:'Tahmini geri dönüş', value:'%18-22',        note:'Benzer kampanyalardan' }
          ]
        },
        action: {
          type:'notification',
          label:'Taslağı Onayla & Gönder',
          target:'247 kullanıcı',
          preview:'"Seni özledik! Bodrum\'daki favori lezzetlerinde %10 indirim senin için tanımlı. 7 gün geçerli 🧡"',
          channel:'Uygulama Bildirimi'
        }
      };
    }
  },
  {
    id:'daily_summary',
    keywords:['bugün özet','günün özeti','bugünkü','günlük özet'],
    intro:'Günlük metrikleri toplarken sabrını rica ederim...',
    buildResponse: function() {
      return {
        text:'Bugünün platform özeti hazır. Sipariş hacmi dünküne göre +%4.2 artışta. Destek talepleri normal seyir, ödeme hattında 2 kritik hata var — ayrı uyarı açtım.',
        analysis: {
          title:'Bugünün Özeti',
          rows:[
            { label:'Siparişler',    value:'4.824',   note:'+%4.2 ↑' },
            { label:'Gelir',         value:'₺612.400', note:'Hedef: ₺580K' },
            { label:'Yeni kullanıcı',value:'312',     note:'-%1.1 ↓' },
            { label:'Açık destek',   value:'18',      note:'Ort. 2sa yanıt' },
            { label:'Ödeme hatası',  value:'2 kritik',note:'Müdahale bekliyor' }
          ]
        },
        action: null
      };
    }
  },
  {
    id:'problem_bizs',
    keywords:['sorunlu işletme','şikayet','çok şikayet','kırmızı alarm'],
    intro:'Şikayet verilerini analiz ediyorum...',
    buildResponse: function() {
      return {
        text:'Son 7 günde ortalamanın üzerinde şikayet alan 4 işletme tespit ettim. Bunlardan ikisi kritik seviyede — uyarı SMS\'i hazırladım.',
        analysis: {
          title:'Şikayet Sıcak Noktaları',
          rows:[
            { label:'Dönerci Mehmet', value:'12 şikayet',  note:'Gecikme + soğuk yemek' },
            { label:'Pizza Palace',   value:'9 şikayet',   note:'Yanlış sipariş' },
            { label:'Burger Max',     value:'7 şikayet',   note:'Hijyen' },
            { label:'La Pasta',       value:'6 şikayet',   note:'Paketleme' }
          ]
        },
        action: {
          type:'sms',
          label:'Uyarı SMS\'i Gönder',
          target:'4 işletme sahibi',
          preview:'"Son 7 günde şikayet oranınız yükseldi. Detaylar için panelden rapora göz atın, destek ekibimiz sizinle iletişime geçecek."',
          channel:'SMS'
        }
      };
    }
  },
  {
    id:'region_drop',
    keywords:['düşüş','azalma','bölge düşüş','azalan bölge'],
    intro:'Bölgesel sipariş verilerini kıyaslıyorum...',
    buildResponse: function() {
      return {
        text:'Geçen aya göre sipariş hacmi düşen 3 bölge var. En kritik düşüş İzmir\'de (-%14). Buralardaki işletmeler için toplam %7 komisyon indirimi destek kampanyası öneriyorum.',
        analysis: {
          title:'Bölgesel Düşüş',
          rows:[
            { label:'İzmir',      value:'-%14.2', note:'Eski: 8.2K → Yeni: 7.0K sipariş' },
            { label:'Antalya',    value:'-%8.6',  note:'Mevsimsel etki' },
            { label:'Eskişehir',  value:'-%5.1',  note:'Rekabet baskısı' }
          ]
        },
        action: {
          type:'campaign',
          label:'Destek Kampanyası Başlat',
          target:'3 bölge, ~420 işletme',
          preview:'30 gün boyunca %7 komisyon indirimi + öne çıkarma kredisi',
          channel:'Otomatik aktivasyon'
        }
      };
    }
  },
  {
    id:'loyal_gift',
    keywords:['sadık','token hediye','ödül','en çok sipariş veren'],
    intro:'En sadık müşterileri topluyorum...',
    buildResponse: function() {
      return {
        text:'En çok sipariş veren ilk 10 kullanıcıyı belirledim. Hepsine moral olması için 100 token hediye etmeyi öneriyorum — toplam maliyet: 1.000 token (≈ ₺500 mock değer).',
        analysis: {
          title:'Sadık Müşteri Ödülü',
          rows:[
            { label:'Top 10 kullanıcı', value:'1.748 sipariş', note:'Son 6 ay' },
            { label:'Hediye/kişi',      value:'100 token',     note:'Bir defalık' },
            { label:'Toplam maliyet',   value:'1.000 token',   note:'Platform bütçesinden' },
            { label:'Retention etkisi', value:'+%27',          note:'Tahmini (benchmark)' }
          ]
        },
        action: {
          type:'token_grant',
          label:'Token Hediyesini Dağıt',
          target:'Top 10 kullanıcı',
          preview:'"Platformun en sadık üyelerinden birisin! Sana teşekkür olarak 100 token hediye ettik 🎁"',
          channel:'Cüzdan + Bildirim'
        }
      };
    }
  }
];

/* ═══════════════════════════════════════════════════════════
   ADMIN RECIPES — REVAMP SEED EXTENSION
   aiAllergens · editRequestNote · rejectReason · similarityHints · bekleyen yanıt
   ═══════════════════════════════════════════════════════════ */

// Mevcut ADMIN_RECIPES'lara ek bilgileri "zenginleştir" (idempotent)
(function() {
  if (typeof ADMIN_RECIPES === 'undefined') return;
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    var r = ADMIN_RECIPES[i];
    if (!r.aiAllergens) r.aiAllergens = (r.allergens || []).slice();
    if (!r.prepTime) r.prepTime = Math.max(10, Math.round((r.cookTime || 30) * 0.4));
    if (!r.tagCount) r.tagCount = (r.tags || []).length * 3 + Math.floor(Math.random() * 8);
    if (!r.favoriteCount) r.favoriteCount = r.likes || 0;
    if (!r.responseHistory) r.responseHistory = [];
  }
})();

// Yeni: awaiting_response ve ek bekleyen/reddedilen seedler
var ADMIN_RECIPE_EXTRAS = [
  {
    id:'rc_await_01', title:'Fırın Sebzeli Tavuk', userId:'u11', userName:'Selin Arslan', category:'main', status:'awaiting_response',
    date:'2026-04-14T09:20:00', editRequestedAt:'2026-04-16T11:30:00',
    editRequestNote:'Lütfen pişirme adımlarına fırın sıcaklığı ve süresi eklenmeli. Ayrıca kapak kullanıp kullanılmayacağı belirtilmeli.',
    cover:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    description:'Fırında sebzeyle pişen nefis tavuk.',
    ingredients:[{name:'Tavuk but',amount:'4 adet'},{name:'Patates',amount:'3 adet'},{name:'Havuç',amount:'2 adet'}],
    steps:['Tavukları marine et.','Sebzeleri doğra.','Fırında pişir.'],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',flagged:false}],
    allergens:[], aiAllergens:[],
    tags:['Fırın','Pratik','Aile'], tagCount:6,
    saves:0, comments:0, likes:0, favoriteCount:0,
    prepTime:15, cookTime:50, servings:4, difficulty:'Kolay',
    responseHistory:[{action:'edit_requested', at:'2026-04-16T11:30:00', by:'admin', note:'Pişirme detayları eksik.'}]
  },
  {
    id:'rc_await_02', title:'Humus Sandviç', userId:'u12', userName:'Burak Yıldız', category:'lunch', status:'awaiting_response',
    date:'2026-04-13T14:15:00', editRequestedAt:'2026-04-15T10:10:00',
    editRequestNote:'Görsel çözünürlüğü düşük, lütfen daha net bir fotoğraf yükleyin.',
    cover:'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop',
    description:'Vegan humus sandviç.',
    ingredients:[{name:'Tam buğday ekmek',amount:'2 dilim'},{name:'Humus',amount:'3 kaşık'},{name:'Marul',amount:'2 yaprak'}],
    steps:['Ekmeğe humus sür.','Sebzeleri yerleştir.','Kapat ve servis et.'],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800',flagged:false}],
    allergens:['Glüten','Susam'], aiAllergens:['Glüten','Susam'],
    tags:['Vegan','Hızlı','Kahvaltı'], tagCount:4,
    saves:0, comments:0, likes:0, favoriteCount:0,
    prepTime:5, cookTime:0, servings:1, difficulty:'Kolay',
    responseHistory:[{action:'edit_requested', at:'2026-04-15T10:10:00', by:'admin', note:'Fotoğraf netleştirilecek.'}]
  },
  {
    id:'rc_rej_01', title:'Çiğ Tavuk Salatası', userId:'u13', userName:'Emre Kaya', category:'salad', status:'rejected',
    date:'2026-04-10T12:00:00', rejectedAt:'2026-04-11T09:45:00',
    rejectReason:'Gıda güvenliği: Çiğ tavuk kullanımı sağlık açısından sakıncalıdır. Tarif yayına alınamaz.',
    cover:'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    description:'Taze tavuk salatası.',
    ingredients:[{name:'Çiğ tavuk göğüs',amount:'300 g'},{name:'Marul',amount:'1 baş'}],
    steps:['Tavuğu doğra.','Salatayı karıştır.'],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',flagged:true}],
    allergens:[], aiAllergens:['Çiğ Et - Risk'],
    tags:['Diyet','Düşük Kalori'], tagCount:2,
    saves:0, comments:0, likes:0, favoriteCount:0,
    prepTime:10, cookTime:0, servings:2, difficulty:'Kolay',
    responseHistory:[{action:'rejected', at:'2026-04-11T09:45:00', by:'admin', note:'Çiğ tavuk güvenli değil.'}]
  },
  {
    id:'rc_rej_02', title:'Enerji İçeceği Kokteyl', userId:'u14', userName:'Can Demir', category:'drink', status:'rejected',
    date:'2026-04-08T20:15:00', rejectedAt:'2026-04-09T16:20:00',
    rejectReason:'Telif: Tarif, başka bir platformdan kopyalanmış ve orijinal değildir. Ayrıca tarif zaten kayıtlı.',
    cover:'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop',
    description:'Klasik kokteyl.',
    ingredients:[{name:'Enerji içeceği',amount:'200 ml'},{name:'Votka',amount:'50 ml'}],
    steps:['Buzla karıştır.'],
    media:[{type:'photo',url:'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',flagged:false}],
    allergens:[], aiAllergens:['Alkol'],
    tags:['Parti'], tagCount:1,
    saves:0, comments:0, likes:0, favoriteCount:0,
    prepTime:3, cookTime:0, servings:1, difficulty:'Kolay',
    responseHistory:[{action:'rejected', at:'2026-04-09T16:20:00', by:'admin', note:'Telif ve mükerrer.'}]
  }
];

// Eğer ADMIN_RECIPES mevcutsa, extras'ları ekle (duplicate kontrolü)
(function() {
  if (typeof ADMIN_RECIPES === 'undefined') return;
  var existingIds = {};
  for (var i = 0; i < ADMIN_RECIPES.length; i++) existingIds[ADMIN_RECIPES[i].id] = true;
  for (var j = 0; j < ADMIN_RECIPE_EXTRAS.length; j++) {
    if (!existingIds[ADMIN_RECIPE_EXTRAS[j].id]) ADMIN_RECIPES.push(ADMIN_RECIPE_EXTRAS[j]);
  }
})();

// Admin notify log (onay/red sonrası bildirim kayıtları)
var ADMIN_RECIPE_NOTIFICATIONS = [];
