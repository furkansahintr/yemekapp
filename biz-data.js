// YemekApp - Business Management Panel Mock Data
// Lezzet Mutfak Restaurant Chain
// All data in Turkish

const BIZ_BUSINESS = {
  id: 'bus_001',
  name: 'Lezzet Mutfak',
  logo: 'https://placeholder.com/logo/lezzet-mutfak.png',
  cuisine: 'Türk & Dünya Mutfağı',
  owner: {
    name: 'Furkan',
    email: 'furkan@lezzetmutfak.com',
    phone: '+905551234548'
  },
  taxId: '1234567890',
  description: 'Geleneksel Türk mutfağından esinlenerek hazırlanmış, taze ve kaliteli yemekler sunuyoruz. Her şubemizde aynı kaliteyi ve hizmeti garantiliyoruz.',
  socialLinks: {
    instagram: '@lezzetmutfak',
    facebook: 'lezzetmutfak',
    twitter: '@lezzetmutfak'
  },
  subscription: 'premium',
  createdAt: '2024-03-15',
  branchCount: 3,
  totalStaff: 10
};

const BIZ_BRANCHES = [
  {
    id: 'b1',
    businessId: 'bus_001',
    name: 'Kadıköy Şubesi',
    address: 'Caferağa Mah. Moda Cad. No: 142, Kadıköy/İstanbul',
    phone: '+905551234500',
    workingHours: {
      'Pazartesi': { open: '11:00', close: '23:00' },
      'Salı': { open: '11:00', close: '23:00' },
      'Çarşamba': { open: '11:00', close: '23:00' },
      'Perşembe': { open: '11:00', close: '23:00' },
      'Cuma': { open: '10:00', close: '00:00' },
      'Cumartesi': { open: '10:00', close: '00:00' },
      'Pazar': { open: '10:00', close: '23:00' }
    },
    minOrder: 25,
    deliveryFee: 2.99,
    deliveryArea: {
      distance: '5 km',
      estimatedTime: '30-40 dakika'
    },
    status: 'open',
    tableCount: 12,
    rating: 4.7,
    reviews: 234,
    image: 'https://placeholder.com/branches/kadikoy.jpg',
    isMainBranch: true
  },
  {
    id: 'b2',
    businessId: 'bus_001',
    name: 'Beşiktaş Şubesi',
    address: 'Çırağan Cad. No: 89, Beşiktaş/İstanbul',
    phone: '+905551234501',
    workingHours: {
      'Pazartesi': { open: '12:00', close: '22:00' },
      'Salı': { open: '12:00', close: '22:00' },
      'Çarşamba': { open: '12:00', close: '22:00' },
      'Perşembe': { open: '12:00', close: '22:00' },
      'Cuma': { open: '11:00', close: '23:30' },
      'Cumartesi': { open: '11:00', close: '23:30' },
      'Pazar': { open: '12:00', close: '22:00' }
    },
    minOrder: 30,
    deliveryFee: 3.49,
    deliveryArea: {
      distance: '4 km',
      estimatedTime: '25-35 dakika'
    },
    status: 'open',
    tableCount: 8,
    rating: 4.5,
    reviews: 167,
    image: 'https://placeholder.com/branches/besiktas.jpg',
    isMainBranch: false
  },
  {
    id: 'b3',
    businessId: 'bus_001',
    name: 'Ataşehir Şubesi',
    address: 'Dumlupınar Mah. Mobilyacılar Cad. No: 45, Ataşehir/İstanbul',
    phone: '+905551234502',
    workingHours: {
      'Pazartesi': { open: 'Kapalı', close: 'Kapalı' },
      'Salı': { open: 'Kapalı', close: 'Kapalı' },
      'Çarşamba': { open: 'Kapalı', close: 'Kapalı' },
      'Perşembe': { open: 'Kapalı', close: 'Kapalı' },
      'Cuma': { open: 'Kapalı', close: 'Kapalı' },
      'Cumartesi': { open: 'Kapalı', close: 'Kapalı' },
      'Pazar': { open: 'Kapalı', close: 'Kapalı' }
    },
    minOrder: 25,
    deliveryFee: 2.99,
    deliveryArea: {
      distance: '6 km',
      estimatedTime: '35-45 dakika'
    },
    status: 'closed',
    tableCount: 10,
    rating: 0,
    reviews: 0,
    image: 'https://placeholder.com/branches/atasehir.jpg',
    isMainBranch: false,
    closureReason: 'Renovasyon',
    estimatedReopenDate: '2026-05-15'
  }
];

/* ═══ TABLE ZONES ═══ */
const BIZ_TABLE_ZONES = [
  { id: 'zone_1', branchId: 'b1', name: 'İç Salon', icon: 'solar:home-angle-bold', color: '#3B82F6', order: 1, assignedWaiters: ['staff_005'] },
  { id: 'zone_2', branchId: 'b1', name: 'Teras', icon: 'solar:sun-2-bold', color: '#F59E0B', order: 2, assignedWaiters: ['staff_006'] },
  { id: 'zone_3', branchId: 'b1', name: 'Bahçe', icon: 'solar:leaf-bold', color: '#22C55E', order: 3, assignedWaiters: ['staff_007'] },
  { id: 'zone_4', branchId: 'b1', name: 'VIP Oda', icon: 'solar:crown-bold', color: '#8B5CF6', order: 4, assignedWaiters: [] },
  { id: 'zone_5', branchId: 'b2', name: 'İç Salon', icon: 'solar:home-angle-bold', color: '#3B82F6', order: 1, assignedWaiters: [] },
  { id: 'zone_6', branchId: 'b2', name: 'Teras', icon: 'solar:sun-2-bold', color: '#F59E0B', order: 2, assignedWaiters: [] }
];

const BIZ_TABLES = [
  // ── b1 İç Salon (zone_1) ──
  { id: 't1', branchId: 'b1', zoneId: 'zone_1', number: 1, capacity: 2, status: 'empty', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0 },
  { id: 't2', branchId: 'b1', zoneId: 'zone_1', number: 2, capacity: 4, status: 'occupied', currentOrder: '#1045', assignedWaiter: 'Ayşe Kaya', occupiedSince: '2026-04-10T12:15:00Z', guestCount: 3 },
  { id: 't3', branchId: 'b1', zoneId: 'zone_1', number: 3, capacity: 4, status: 'occupied', currentOrder: '#1048', assignedWaiter: 'Mehmet Çakır', occupiedSince: '2026-04-10T12:45:00Z', guestCount: 4 },
  { id: 't4', branchId: 'b1', zoneId: 'zone_1', number: 4, capacity: 2, status: 'empty', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0 },
  // ── b1 Teras (zone_2) ──
  { id: 't5', branchId: 'b1', zoneId: 'zone_2', number: 5, capacity: 6, status: 'occupied', currentOrder: '#1042', assignedWaiter: 'Ayşe Kaya', occupiedSince: '2026-04-10T11:30:00Z', guestCount: 5 },
  { id: 't6', branchId: 'b1', zoneId: 'zone_2', number: 6, capacity: 4, status: 'reserved', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0, reservationName: 'Şahin', reservationTime: '2026-04-10T19:00:00Z' },
  { id: 't7', branchId: 'b1', zoneId: 'zone_2', number: 7, capacity: 2, status: 'empty', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0 },
  // ── b1 Bahçe (zone_3) ──
  { id: 't8', branchId: 'b1', zoneId: 'zone_3', number: 8, capacity: 8, status: 'occupied', currentOrder: '#1049', assignedWaiter: 'Mehmet Çakır', occupiedSince: '2026-04-10T13:00:00Z', guestCount: 7 },
  { id: 't9', branchId: 'b1', zoneId: 'zone_3', number: 9, capacity: 4, status: 'occupied', currentOrder: '#1050', assignedWaiter: 'Fatih Demir', occupiedSince: '2026-04-10T13:15:00Z', guestCount: 2 },
  { id: 't10', branchId: 'b1', zoneId: 'zone_3', number: 10, capacity: 2, status: 'empty', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0 },
  // ── b1 VIP Oda (zone_4) ──
  { id: 't11', branchId: 'b1', zoneId: 'zone_4', number: 11, capacity: 6, status: 'empty', currentOrder: null, assignedWaiter: null, occupiedSince: null, guestCount: 0 },
  { id: 't12', branchId: 'b1', zoneId: 'zone_4', number: 12, capacity: 4, status: 'occupied', currentOrder: '#1051', assignedWaiter: 'Fatih Demir', occupiedSince: '2026-04-10T12:30:00Z', guestCount: 3 }
];

/* ═══ BUSINESS PROFILE (community-facing) ═══ */
const BIZ_PROFILE = {
  id: 'bus_001',
  handle: '@lezzetmutfak',
  avatar: 'https://api.pravatar.cc/img?img=68',
  cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
  bio: 'Geleneksel lezzetler, modern sunum. Kadıköy • Beşiktaş • Ataşehir',
  rating: 4.7,
  postsCount: 18,
  followersCount: 1284,
  followingCount: 42
};

const BIZ_FOLLOWERS = [
  { id: 'u1', name: 'Zeynep Kaplan', handle: '@zeynepk',  avatar: 'https://api.pravatar.cc/img?img=11', follows: true },
  { id: 'u2', name: 'Ahmet Şahin',   handle: '@ahmets',   avatar: 'https://api.pravatar.cc/img?img=12', follows: false },
  { id: 'u3', name: 'Fatma Çetin',   handle: '@fatmac',   avatar: 'https://api.pravatar.cc/img?img=13', follows: true },
  { id: 'u4', name: 'Can Akın',      handle: '@cana',     avatar: 'https://api.pravatar.cc/img?img=14', follows: false },
  { id: 'u5', name: 'Dilara Yılmaz', handle: '@dilaray',  avatar: 'https://api.pravatar.cc/img?img=15', follows: true },
  { id: 'u6', name: 'Mert Öztürk',   handle: '@merto',    avatar: 'https://api.pravatar.cc/img?img=16', follows: false },
  { id: 'u7', name: 'Elif Demir',    handle: '@elifd',    avatar: 'https://api.pravatar.cc/img?img=17', follows: true },
  { id: 'u8', name: 'Burak Arslan',  handle: '@buraka',   avatar: 'https://api.pravatar.cc/img?img=18', follows: false }
];

const BIZ_FOLLOWING = [
  { id: 'f1', name: 'Şef Mehmet Usta',  handle: '@sefmehmet', avatar: 'https://api.pravatar.cc/img?img=33', verified: true },
  { id: 'f2', name: 'Anadolu Tatları',  handle: '@anadolut',  avatar: 'https://api.pravatar.cc/img?img=34', verified: true },
  { id: 'f3', name: 'İstanbul Gurme',   handle: '@istgurme',  avatar: 'https://api.pravatar.cc/img?img=35', verified: false },
  { id: 'f4', name: 'Kahve Dünyası',    handle: '@kahvedunyasi', avatar: 'https://api.pravatar.cc/img?img=36', verified: true }
];

/* ═══ RESERVATIONS ═══ */
const BIZ_RESERVATIONS = [
  {
    id: 'res_001',
    branchId: 'b1',
    tableId: 't6',
    customerName: 'Şahin Ailesi',
    customerPhone: '+905551112233',
    guestCount: 4,
    reservedAt: '2026-04-10T19:00:00Z',
    note: 'Pencere kenarı tercih edilir',
    createdBy: 'staff_001',
    createdByName: 'Furkan Yılmaz',
    createdAt: '2026-04-09T14:00:00Z',
    status: 'confirmed'
  },
  {
    id: 'res_002',
    branchId: 'b1',
    tableId: 't11',
    customerName: 'Doğum Günü Grubu',
    customerPhone: '+905554445566',
    guestCount: 6,
    reservedAt: '2026-04-13T20:30:00Z',
    note: 'Pasta servisi yapılacak',
    createdBy: 'staff_004',
    createdByName: 'Ayşe Kaya',
    createdAt: '2026-04-11T10:30:00Z',
    status: 'confirmed'
  }
];

const BIZ_ROLE_LABELS = {
  'owner': 'İşletme Sahibi',
  'manager': 'Şube Müdürü',
  'coordinator': 'Koordinatör',
  'chef': 'Mutfak Sorumlusu',
  'waiter': 'Garson',
  'cashier': 'Kasiyer',
  'courier': 'Kurye'
};

/* ═══ ROLE-BASED PERMISSION MAP ═══ */
const BIZ_ROLE_PERMISSIONS = {
  owner: {
    label: 'İşletme Sahibi',
    color: '#8B5CF6',
    tiles: ['orders','tables','menu','waiterCalls','staff','reviews','branches','delivery'],
    navTabs: ['bizHome','bizDashboard','bizAI','bizCommunity','bizMyBusiness'],
    screens: ['orders','tables','menu','waiterCalls','staff','reviews','dashboard','ai','community','myBusiness','branches','roles','payments','invoice','settings','notifications'],
    actions: ['edit_menu','manage_staff','assign_roles','view_reports','process_payment','manage_tables','manage_orders','manage_settings','manage_branches']
  },
  manager: {
    label: 'Şube Müdürü',
    color: '#3B82F6',
    tiles: ['orders','tables','menu','waiterCalls','staff','reviews'],
    navTabs: ['bizHome','bizDashboard','bizAI','bizCommunity','bizMyBusiness'],
    screens: ['orders','tables','menu','waiterCalls','staff','reviews','dashboard','ai','community','myBusiness'],
    actions: ['edit_menu','manage_staff','view_reports','manage_tables','manage_orders','manage_reservations']
  },
  coordinator: {
    label: 'Koordinatör',
    color: '#A855F7',
    tiles: ['orders','tables','waiterCalls','staff','reviews','delivery'],
    // AI access: only for the coordinator's own branch (branch picker is
    // already locked to bizActiveBranch for non-owner roles in biz-app.js).
    navTabs: ['bizHome','bizAI','bizCommunity'],
    screens: ['orders','tables','waiterCalls','staff','reviews','delivery','ai','community'],
    actions: ['manage_tables','manage_orders','post_community','manage_reservations']
  },
  chef: {
    label: 'Mutfak Sorumlusu',
    color: '#F59E0B',
    tiles: ['orders','menu'],
    navTabs: ['bizHome','bizAI'],
    screens: ['orders','menu','ai'],
    actions: ['edit_menu','manage_orders']
  },
  waiter: {
    label: 'Garson',
    color: '#22C55E',
    tiles: ['orders','tables','waiterCalls'],
    navTabs: ['bizHome'],
    screens: ['orders','tables','waiterCalls'],
    actions: ['manage_tables','manage_orders','manage_reservations']
  },
  cashier: {
    label: 'Kasiyer',
    color: '#06B6D4',
    tiles: ['orders','tables','menu'],
    navTabs: ['bizHome','bizAI','bizCommunity'],
    screens: ['orders','tables','menu','ai','community'],
    actions: ['process_payment','manage_orders','manage_reservations']
  },
  courier: {
    label: 'Kurye',
    color: '#EF4444',
    tiles: ['orders','delivery'],
    navTabs: ['bizHome'],
    screens: ['orders','delivery'],
    actions: ['manage_orders']
  },
};

/* ═══ TILE DEFINITIONS (id → config) ═══ */
const BIZ_TILE_DEFS = {
  orders:       { icon: 'solar:bag-check-bold',                    color: '#8B5CF6', title: 'Siparişler',       fn: 'openBizOrders' },
  tables:       { icon: 'solar:sofa-2-bold',                       color: '#3B82F6', title: 'Masalar',          fn: 'openBizTables' },
  menu:         { icon: 'solar:notebook-bold',                     color: '#F59E0B', title: 'Menü',             fn: 'openBizMenuMgmt' },
  waiterCalls:  { icon: 'solar:bell-bing-bold',                    color: '#EF4444', title: 'Garson Çağrıları', fn: 'openBizWaiterCalls' },
  staff:        { icon: 'solar:users-group-two-rounded-bold',      color: '#EC4899', title: 'Personel',         fn: 'openBizStaff' },
  reviews:      { icon: 'solar:star-bold',                         color: '#F59E0B', title: 'Değerlendirmeler', fn: 'openBizReviews' },
  delivery:     { icon: 'solar:delivery-bold',                     color: '#EF4444', title: 'Teslimatlar',      fn: 'openBizDelivery' },
  branches:     { icon: 'solar:buildings-2-bold',                  color: '#6366F1', title: 'Şubeler',          fn: 'openBizBranches' }
};

const BIZ_STAFF = [
  {
    id: 'staff_001',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Furkan Yılmaz',
    phone: '+905551234548',
    email: 'furkan@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=1',
    role: 'owner',
    roleLabel: 'İşletme Sahibi',
    permissions: ['all'],
    status: 'active',
    hireDate: '2024-03-15'
  },
  {
    id: 'staff_002',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Emre Demir',
    phone: '+905551111111',
    email: 'emre@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=2',
    role: 'manager',
    roleLabel: 'Şube Müdürü',
    permissions: ['view_orders', 'manage_staff', 'view_reports'],
    status: 'active',
    hireDate: '2024-04-20'
  },
  {
    id: 'staff_003',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Serap Tuncer',
    phone: '+905552222222',
    email: 'serap@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=3',
    role: 'chef',
    roleLabel: 'Mutfak Sorumlusu',
    kitchenCategories: ['grill', 'hot_kitchen'],
    permissions: ['view_orders', 'manage_menu', 'view_kitchen'],
    status: 'active',
    hireDate: '2024-03-20'
  },
  {
    id: 'staff_004',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Hakan Özdemir',
    phone: '+905553333333',
    email: 'hakan@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=4',
    role: 'chef',
    roleLabel: 'Mutfak Sorumlusu',
    kitchenCategories: ['cold_kitchen', 'salad', 'pastry'],
    permissions: ['view_orders', 'manage_menu', 'view_kitchen'],
    status: 'active',
    hireDate: '2024-05-10'
  },
  {
    id: 'staff_005',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Ayşe Kaya',
    phone: '+905554444444',
    email: 'ayse@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=5',
    role: 'waiter',
    roleLabel: 'Garson',
    permissions: ['view_orders', 'manage_tables'],
    status: 'active',
    hireDate: '2024-06-01'
  },
  {
    id: 'staff_006',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Mehmet Çakır',
    phone: '+905555555555',
    email: 'mehmet@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=6',
    role: 'waiter',
    roleLabel: 'Garson',
    permissions: ['view_orders', 'manage_tables'],
    status: 'active',
    hireDate: '2024-06-15'
  },
  {
    id: 'staff_007',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Fatih Demir',
    phone: '+905556666666',
    email: 'fatih@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=7',
    role: 'waiter',
    roleLabel: 'Garson',
    permissions: ['view_orders', 'manage_tables'],
    status: 'active',
    hireDate: '2024-07-05'
  },
  {
    id: 'staff_008',
    businessId: 'bus_001',
    branchId: 'b2',
    name: 'Zeynep Arslan',
    phone: '+905557777777',
    email: 'zeynep@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=8',
    role: 'waiter',
    roleLabel: 'Garson',
    permissions: ['view_orders', 'manage_tables'],
    status: 'active',
    hireDate: '2024-07-20'
  },
  {
    id: 'staff_009',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Berat Yıldız',
    phone: '+905558888888',
    email: 'berat@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=9',
    role: 'cashier',
    roleLabel: 'Kasiyer',
    permissions: ['view_orders', 'process_payment'],
    status: 'active',
    hireDate: '2024-08-01'
  },
  {
    id: 'staff_010',
    businessId: 'bus_001',
    branchId: 'b1',
    name: 'Barış Güzel',
    phone: '+905559999999',
    email: 'baris@lezzetmutfak.com',
    avatar: 'https://api.pravatar.cc/img?img=10',
    role: 'courier',
    roleLabel: 'Kurye',
    permissions: ['view_orders', 'manage_delivery'],
    status: 'active',
    hireDate: '2024-08-15'
  }
];

const BIZ_SHIFTS = [
  {
    id: 'shift_001',
    staffId: 'staff_003',
    branchId: 'b1',
    date: '2026-04-06',
    startTime: '08:00',
    endTime: '16:00',
    actualStart: '08:05',
    actualEnd: '16:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_002',
    staffId: 'staff_004',
    branchId: 'b1',
    date: '2026-04-06',
    startTime: '16:00',
    endTime: '00:00',
    actualStart: '16:00',
    actualEnd: '00:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Cuma akşamı'
  },
  {
    id: 'shift_003',
    staffId: 'staff_005',
    branchId: 'b1',
    date: '2026-04-07',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: '20:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_004',
    staffId: 'staff_006',
    branchId: 'b1',
    date: '2026-04-07',
    startTime: '18:00',
    endTime: '23:00',
    actualStart: '18:00',
    actualEnd: '23:30',
    status: 'completed',
    overtimeMinutes: 30,
    notes: 'Cumartesi yoğun'
  },
  {
    id: 'shift_005',
    staffId: 'staff_007',
    branchId: 'b1',
    date: '2026-04-07',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: '20:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_006',
    staffId: 'staff_003',
    branchId: 'b1',
    date: '2026-04-08',
    startTime: '08:00',
    endTime: '16:00',
    actualStart: '08:00',
    actualEnd: '16:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Pazar sabahı'
  },
  {
    id: 'shift_007',
    staffId: 'staff_005',
    branchId: 'b1',
    date: '2026-04-08',
    startTime: '16:00',
    endTime: '23:00',
    actualStart: '16:00',
    actualEnd: '23:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_008',
    staffId: 'staff_003',
    branchId: 'b1',
    date: '2026-04-09',
    startTime: '08:00',
    endTime: '16:00',
    actualStart: '08:00',
    actualEnd: '16:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_009',
    staffId: 'staff_005',
    branchId: 'b1',
    date: '2026-04-09',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: '20:00',
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_010',
    staffId: 'staff_006',
    branchId: 'b1',
    date: '2026-04-09',
    startTime: '16:00',
    endTime: '00:00',
    actualStart: '16:00',
    actualEnd: null,
    status: 'completed',
    overtimeMinutes: 0,
    notes: 'Normal vardiya'
  },
  {
    id: 'shift_011',
    staffId: 'staff_003',
    branchId: 'b1',
    date: '2026-04-10',
    startTime: '08:00',
    endTime: '16:00',
    actualStart: '08:00',
    actualEnd: null,
    status: 'active',
    overtimeMinutes: 0,
    notes: 'Bugünün vardiyası'
  },
  {
    id: 'shift_012',
    staffId: 'staff_004',
    branchId: 'b1',
    date: '2026-04-10',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: null,
    status: 'active',
    overtimeMinutes: 0,
    notes: 'Bugünün vardiyası'
  },
  {
    id: 'shift_013',
    staffId: 'staff_005',
    branchId: 'b1',
    date: '2026-04-10',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: null,
    status: 'active',
    overtimeMinutes: 0,
    notes: 'Bugünün vardiyası'
  },
  {
    id: 'shift_014',
    staffId: 'staff_006',
    branchId: 'b1',
    date: '2026-04-10',
    startTime: '16:00',
    endTime: '00:00',
    actualStart: '16:00',
    actualEnd: null,
    status: 'active',
    overtimeMinutes: 0,
    notes: 'Bugünün vardiyası'
  },
  {
    id: 'shift_015',
    staffId: 'staff_007',
    branchId: 'b1',
    date: '2026-04-10',
    startTime: '12:00',
    endTime: '20:00',
    actualStart: '12:00',
    actualEnd: null,
    status: 'active',
    overtimeMinutes: 0,
    notes: 'Bugünün vardiyası'
  }
];

const BIZ_ORDERS = [
  {
    id: '#1042',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't5',
    tableNumber: 5,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Adana Kebap', qty: 2, price: 18.50 },
      { name: 'Pilaf', qty: 2, price: 3.50 },
      { name: 'Ayran', qty: 2, price: 2.50 }
    ],
    total: 56.00,
    paymentMethod: 'cash',
    status: 'preparing',
    createdAt: '2026-04-10T11:30:00Z',
    prepStartedAt: '2026-04-10T11:35:00Z',
    completedAt: null,
    waiterName: 'Ayşe Kaya'
  },
  {
    id: '#1043',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Ali Yılmaz',
    customerPhone: '+905558888888',
    customerAddress: 'Moda Cad. No: 50, Kadıköy',
    customerNote: 'Lütfen acılı turşuyu ayrı paketleyin, kapıyı çalmayın.',
    items: [
      { name: 'İskender Kebap Tavası', qty: 1, price: 24.00 },
      { name: 'Acılı Turşu', qty: 1, price: 3.00 },
      { name: 'Kola', qty: 1, price: 3.50 }
    ],
    total: 31.50,
    paymentMethod: 'online',
    status: 'delivered',
    createdAt: '2026-04-10T11:00:00Z',
    prepStartedAt: '2026-04-10T11:05:00Z',
    completedAt: '2026-04-10T12:00:00Z',
    waiterName: null,
    courierName: 'Barış Güzel'
  },
  {
    id: '#1044',
    branchId: 'b1',
    type: 'takeaway',
    tableId: null,
    tableNumber: null,
    customerName: 'Aylin Demir',
    customerPhone: '+905559999999',
    customerAddress: null,
    items: [
      { name: 'Döner Dürüm', qty: 3, price: 8.50 },
      { name: 'Hummus', qty: 1, price: 4.00 }
    ],
    total: 29.50,
    paymentMethod: 'card',
    status: 'ready',
    createdAt: '2026-04-10T12:00:00Z',
    prepStartedAt: '2026-04-10T12:05:00Z',
    completedAt: '2026-04-10T12:35:00Z',
    waiterName: null
  },
  {
    id: '#1045',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't2',
    tableNumber: 2,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Çoban Salatası', qty: 1, price: 7.50 },
      { name: 'Köfte', qty: 3, price: 9.00 },
      { name: 'Çay', qty: 3, price: 2.00 }
    ],
    total: 42.50,
    paymentMethod: 'cash',
    status: 'preparing',
    createdAt: '2026-04-10T12:15:00Z',
    prepStartedAt: '2026-04-10T12:20:00Z',
    completedAt: null,
    waiterName: 'Ayşe Kaya'
  },
  {
    id: '#1046',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Murat Kaya',
    customerPhone: '+905551111111',
    customerAddress: 'Caferağa Mah. Cad. No: 75, Kadıköy',
    customerNote: 'Sosu az olsun, plastik çatal-bıçak istemiyorum.',
    items: [
      { name: 'Şiş Tavuk', qty: 2, price: 14.00 },
      { name: 'Garnitür', qty: 2, price: 5.00 },
      { name: 'Maden Suyu', qty: 2, price: 2.50 }
    ],
    total: 45.00,
    paymentMethod: 'online',
    status: 'delivered',
    createdAt: '2026-04-10T11:45:00Z',
    prepStartedAt: '2026-04-10T11:50:00Z',
    completedAt: '2026-04-10T12:45:00Z',
    waiterName: null,
    courierName: 'Barış Güzel'
  },
  {
    id: '#1047',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Selin Özkan',
    customerPhone: '+905552222222',
    customerAddress: 'Moda Cad. No: 120, Kadıköy',
    items: [
      { name: 'Pide', qty: 2, price: 10.00 },
      { name: 'Feta Peyniri Salatası', qty: 1, price: 6.50 }
    ],
    total: 26.50,
    paymentMethod: 'cash',
    status: 'cancelled',
    createdAt: '2026-04-10T12:30:00Z',
    prepStartedAt: null,
    completedAt: null,
    waiterName: null,
    cancellationReason: 'Müşteri talep etti'
  },
  {
    id: '#1048',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't3',
    tableNumber: 3,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Lahmacun', qty: 4, price: 6.50 },
      { name: 'Beyaz Peynir', qty: 1, price: 5.00 },
      { name: 'Domates Salatası', qty: 1, price: 5.00 },
      { name: 'Limonata', qty: 4, price: 3.00 }
    ],
    total: 62.00,
    paymentMethod: 'card',
    status: 'preparing',
    createdAt: '2026-04-10T12:45:00Z',
    prepStartedAt: '2026-04-10T12:50:00Z',
    completedAt: null,
    waiterName: 'Mehmet Çakır'
  },
  {
    id: '#1049',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't8',
    tableNumber: 8,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Kebap Seçme Tabı', qty: 1, price: 35.00 },
      { name: 'Bulgur Pilavı', qty: 1, price: 4.00 },
      { name: 'Turş', qty: 1, price: 3.00 },
      { name: 'Ayran', qty: 1, price: 2.50 }
    ],
    total: 44.50,
    paymentMethod: 'card',
    status: 'ready',
    createdAt: '2026-04-10T13:00:00Z',
    prepStartedAt: '2026-04-10T13:05:00Z',
    completedAt: '2026-04-10T13:25:00Z',
    waiterName: 'Mehmet Çakır'
  },
  {
    id: '#1050',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't9',
    tableNumber: 9,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Kol Böreği', qty: 2, price: 7.50 },
      { name: 'Mercimek Çorbası', qty: 2, price: 4.00 },
      { name: 'Çay', qty: 2, price: 2.00 }
    ],
    total: 33.00,
    paymentMethod: 'cash',
    status: 'preparing',
    createdAt: '2026-04-10T13:15:00Z',
    prepStartedAt: '2026-04-10T13:20:00Z',
    completedAt: null,
    waiterName: 'Fatih Demir'
  },
  {
    id: '#1051',
    branchId: 'b1',
    type: 'dine-in',
    tableId: 't12',
    tableNumber: 12,
    customerName: null,
    customerPhone: null,
    customerAddress: null,
    items: [
      { name: 'Patlıcan Salatası', qty: 1, price: 6.00 },
      { name: 'Tavuk Şiş', qty: 2, price: 12.00 },
      { name: 'Bulgur Pilavı', qty: 2, price: 4.00 },
      { name: 'Çay', qty: 3, price: 2.00 }
    ],
    total: 48.00,
    paymentMethod: 'card',
    status: 'preparing',
    createdAt: '2026-04-10T12:30:00Z',
    prepStartedAt: '2026-04-10T12:35:00Z',
    completedAt: null,
    waiterName: 'Fatih Demir'
  },
  {
    id: '#1052',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Hakan Çetin',
    customerPhone: '+905553333333',
    customerAddress: 'Göztepe Mah. Cad. No: 25, Kadıköy',
    items: [
      { name: 'Dürüm Sodası', qty: 1, price: 12.00 },
      { name: 'Mezze Tabı', qty: 1, price: 22.00 }
    ],
    total: 34.00,
    paymentMethod: 'online',
    status: 'pending',
    createdAt: '2026-04-10T13:20:00Z',
    prepStartedAt: null,
    completedAt: null,
    waiterName: null,
    courierName: 'Emre Yıldız'
  },
  {
    id: '#1053',
    branchId: 'b1',
    type: 'takeaway',
    tableId: null,
    tableNumber: null,
    customerName: 'Emine Özdemir',
    customerPhone: '+905554444444',
    customerAddress: null,
    items: [
      { name: 'Ispanaklı Börek', qty: 1, price: 8.50 },
      { name: 'Beyaz Peynir Salatası', qty: 1, price: 6.00 },
      { name: 'Çay', qty: 1, price: 2.00 }
    ],
    total: 16.50,
    paymentMethod: 'cash',
    status: 'ready',
    createdAt: '2026-04-10T12:50:00Z',
    prepStartedAt: '2026-04-10T12:55:00Z',
    completedAt: '2026-04-10T13:10:00Z',
    waiterName: null
  },
  {
    id: '#1054',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Kaan Güneş',
    customerPhone: '+905555555555',
    customerAddress: 'Kızıltoprak Mah. Cad. No: 90, Kadıköy',
    items: [
      { name: 'Taverna Kebap', qty: 1, price: 19.50 },
      { name: 'Çoban Salatası', qty: 1, price: 7.50 },
      { name: 'Ayran', qty: 1, price: 2.50 }
    ],
    total: 29.50,
    paymentMethod: 'online',
    status: 'pending',
    createdAt: '2026-04-10T13:25:00Z',
    prepStartedAt: null,
    completedAt: null,
    waiterName: null,
    courierName: 'Emre Yıldız'
  },
  {
    id: '#1055',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Neşe Arslan',
    customerPhone: '+905556666666',
    customerAddress: 'Caferağa Mah. Cad. No: 100, Kadıköy',
    items: [
      { name: 'Lula Kebap', qty: 1, price: 17.00 },
      { name: 'Hummus', qty: 1, price: 4.00 },
      { name: 'Kola', qty: 1, price: 3.50 }
    ],
    total: 24.50,
    paymentMethod: 'online',
    status: 'pending',
    createdAt: '2026-04-10T13:30:00Z',
    prepStartedAt: null,
    completedAt: null,
    waiterName: null,
    courierName: 'Barış Güzel'
  },
  {
    id: '#1056',
    branchId: 'b1',
    type: 'online',
    tableId: null,
    tableNumber: null,
    customerName: 'Rıza Korkmaz',
    customerPhone: '+905557777777',
    customerAddress: 'Moda Cad. No: 200, Kadıköy',
    items: [
      { name: 'Ciğer Kebap', qty: 2, price: 16.00 },
      { name: 'Mısır Pilav', qty: 2, price: 4.50 },
      { name: 'Turşu', qty: 1, price: 3.00 }
    ],
    total: 43.50,
    paymentMethod: 'card',
    status: 'delivered',
    createdAt: '2026-04-10T10:30:00Z',
    prepStartedAt: '2026-04-10T10:35:00Z',
    completedAt: '2026-04-10T11:15:00Z',
    waiterName: null,
    courierName: 'Barış Güzel'
  }
];

const BIZ_WAITER_CALLS = [
  {
    id: 'call_001',
    branchId: 'b1',
    tableId: 't2',
    tableNumber: 2,
    type: 'waiter',
    status: 'pending',
    assignedWaiter: null,
    createdAt: '2026-04-10T13:35:00Z',
    acceptedAt: null,
    completedAt: null
  },
  {
    id: 'call_002',
    branchId: 'b1',
    tableId: 't5',
    tableNumber: 5,
    type: 'bill',
    status: 'accepted',
    assignedWaiter: 'Ayşe Kaya',
    createdAt: '2026-04-10T13:25:00Z',
    acceptedAt: '2026-04-10T13:26:00Z',
    completedAt: null
  },
  {
    id: 'call_003',
    branchId: 'b1',
    tableId: 't8',
    tableNumber: 8,
    type: 'water',
    status: 'accepted',
    assignedWaiter: 'Mehmet Çakır',
    createdAt: '2026-04-10T13:30:00Z',
    acceptedAt: '2026-04-10T13:31:00Z',
    completedAt: null
  },
  {
    id: 'call_004',
    branchId: 'b1',
    tableId: 't12',
    tableNumber: 12,
    type: 'other',
    status: 'pending',
    assignedWaiter: null,
    createdAt: '2026-04-10T13:40:00Z',
    acceptedAt: null,
    completedAt: null
  },
  {
    id: 'call_005',
    branchId: 'b1',
    tableId: 't3',
    tableNumber: 3,
    type: 'waiter',
    status: 'completed',
    assignedWaiter: 'Mehmet Çakır',
    createdAt: '2026-04-10T13:15:00Z',
    acceptedAt: '2026-04-10T13:16:00Z',
    completedAt: '2026-04-10T13:22:00Z'
  }
];

const BIZ_REVIEWS = [
  {
    id: 'review_001',
    branchId: 'b1',
    customerName: 'Zeynep Kaplan',
    customerAvatar: 'https://api.pravatar.cc/img?img=11',
    rating: 5,
    text: 'Harika bir yer! Yemekler çok lezzetli ve taze. Servis mükemmel. Kesinlikle tavsiye ederim.',
    date: '2026-04-09T18:30:00Z',
    reply: {
      author: 'Furkan',
      text: 'Ziyaretiniz için teşekkür ederiz Zeynep. Yakında tekrar bekliyoruz!',
      date: '2026-04-09T20:00:00Z'
    }
  },
  {
    id: 'review_002',
    branchId: 'b1',
    customerName: 'Ahmet Şahin',
    customerAvatar: 'https://api.pravatar.cc/img?img=12',
    rating: 4,
    text: 'Yemekler çok iyi. Ortamı da güzel. Sadece biraz yoğun zamanlar vardı, bekleme süresi uzundu.',
    date: '2026-04-08T19:45:00Z',
    reply: null
  },
  {
    id: 'review_003',
    branchId: 'b1',
    customerName: 'Fatma Çetin',
    customerAvatar: 'https://api.pravatar.cc/img?img=13',
    rating: 5,
    text: 'Adana kebaptan başka hiçbir şey yemeyin, en iyisi burada! Tavsiye ederim.',
    date: '2026-04-07T20:15:00Z',
    reply: {
      author: 'Furkan',
      text: 'Çok teşekkürler Fatma! Adana kebabımız gerçekten özel.',
      date: '2026-04-07T21:30:00Z'
    }
  },
  {
    id: 'review_004',
    branchId: 'b1',
    customerName: 'Can Akın',
    customerAvatar: 'https://api.pravatar.cc/img?img=14',
    rating: 3,
    text: 'Ortalama bir restoran. Yemekler iyiydi ama fiyatlar biraz yüksek. Garson aşırı yavaş.',
    date: '2026-04-06T21:00:00Z',
    reply: null
  },
  {
    id: 'review_005',
    branchId: 'b1',
    customerName: 'Dilara Yılmaz',
    customerAvatar: 'https://api.pravatar.cc/img?img=15',
    rating: 5,
    text: 'Harika bir döner ve fırın kebabı deneyimi. Çok profesyonel ekip. Süper!',
    date: '2026-04-05T18:20:00Z',
    reply: {
      author: 'Furkan',
      text: 'Teşekkürler Dilara! Ekibimiz en iyi hizmeti sunmak için her zaman hazır.',
      date: '2026-04-05T19:45:00Z'
    }
  },
  {
    id: 'review_006',
    branchId: 'b1',
    customerName: 'Serhan Demir',
    customerAvatar: 'https://api.pravatar.cc/img?img=16',
    rating: 4,
    text: 'İyi yemekler, temiz ortam. Gelin gelin bir daha gelelim demek en iyi tavsiye.',
    date: '2026-04-04T19:30:00Z',
    reply: null
  },
  {
    id: 'review_007',
    branchId: 'b1',
    customerName: 'Güldem Arslan',
    customerAvatar: 'https://api.pravatar.cc/img?img=17',
    rating: 5,
    text: 'Yemeklerin hepsi damak tadıma uygundu. Ortam çok rahat ve misafirperver. Mutlaka gelirim.',
    date: '2026-04-03T20:00:00Z',
    reply: null
  },
  {
    id: 'review_008',
    branchId: 'b1',
    customerName: 'İbrahim Kaya',
    customerAvatar: 'https://api.pravatar.cc/img?img=18',
    rating: 4,
    text: 'Lezzetli ve kaliteli yemekler. Mekan biraz küçük ama rahat. Tavsiye ederim.',
    date: '2026-04-02T19:15:00Z',
    reply: {
      author: 'Furkan',
      text: 'Mekana gelmek için teşekkür ederiz. Yakında daha geniş alana taşınacağız.',
      date: '2026-04-02T20:30:00Z'
    }
  }
];

const BIZ_DASHBOARD_STATS = {
  today: {
    revenue: 12450,
    orders: 47,
    avgBasket: 264.89,
    newCustomers: 12,
    returningCustomers: 35,
    currency: 'TRY'
  },
  yesterday: {
    revenue: 11200,
    orders: 43,
    avgBasket: 260.47,
    currency: 'TRY'
  },
  thisWeek: {
    revenue: 78500,
    orders: 312,
    currency: 'TRY',
    topItems: [
      { name: 'Adana Kebap', qty: 65, revenue: 1202.50 },
      { name: 'İskender Kebap', qty: 52, revenue: 1248.00 },
      { name: 'Döner', qty: 48, revenue: 408.00 },
      { name: 'Kebap Seçme Tabı', qty: 35, revenue: 1225.00 },
      { name: 'Şiş Tavuk', qty: 42, revenue: 588.00 }
    ]
  },
  thisMonth: {
    revenue: 324000,
    orders: 1280,
    avgRating: 4.6,
    totalReviews: 234,
    currency: 'TRY'
  },
  peakHours: [
    { hour: '10:00', orders: 3 },
    { hour: '11:00', orders: 5 },
    { hour: '12:00', orders: 12 },
    { hour: '13:00', orders: 14 },
    { hour: '14:00', orders: 8 },
    { hour: '15:00', orders: 4 },
    { hour: '16:00', orders: 3 },
    { hour: '17:00', orders: 5 },
    { hour: '18:00', orders: 9 },
    { hour: '19:00', orders: 11 },
    { hour: '20:00', orders: 7 },
    { hour: '21:00', orders: 4 },
    { hour: '22:00', orders: 2 }
  ],
  orderTypeDistribution: {
    'dine-in': 55,
    'online': 35,
    'takeaway': 10
  },
  staffPerformance: [
    {
      staffId: 'staff_005',
      name: 'Ayşe Kaya',
      ordersServed: 94,
      avgServiceTime: 12,
      rating: 4.8,
      satisfaction: 'Çok İyi'
    },
    {
      staffId: 'staff_006',
      name: 'Mehmet Çakır',
      ordersServed: 87,
      avgServiceTime: 14,
      rating: 4.6,
      satisfaction: 'İyi'
    },
    {
      staffId: 'staff_007',
      name: 'Fatih Demir',
      ordersServed: 82,
      avgServiceTime: 13,
      rating: 4.5,
      satisfaction: 'İyi'
    }
  ]
};

const BIZ_NOTIFICATIONS = [
  {
    id: 'notif_001',
    type: 'new_order',
    title: 'Yeni Sipariş Alındı',
    text: 'Online siparişi #1055 hazırlanmaya başladı',
    time: '2026-04-10T13:30:00Z',
    read: false,
    branchId: 'b1',
    priority: 'high'
  },
  {
    id: 'notif_002',
    type: 'waiter_call',
    title: 'Garson Çağırması',
    text: 'Masa 2 garson çağırıyor',
    time: '2026-04-10T13:35:00Z',
    read: false,
    branchId: 'b1',
    priority: 'high'
  },
  {
    id: 'notif_003',
    type: 'new_order',
    title: 'Yeni Online Sipariş',
    text: 'Yeni sipariş #1054 Kızıltoprak adresine gidiyor',
    time: '2026-04-10T13:25:00Z',
    read: true,
    branchId: 'b1',
    priority: 'medium'
  },
  {
    id: 'notif_004',
    type: 'review',
    title: 'Yeni Değerlendirme',
    text: 'Zeynep Kaplan 5 yıldız verdi: "Harika bir yer! Yemekler çok lezzetli..."',
    time: '2026-04-09T18:30:00Z',
    read: true,
    branchId: 'b1',
    priority: 'low'
  },
  {
    id: 'notif_005',
    type: 'shift_reminder',
    title: 'Vardiya Başlangıcı',
    text: 'Mehmet Çakır\'ın vardiyası 16:00\'de başlayacak',
    time: '2026-04-10T15:30:00Z',
    read: false,
    branchId: 'b1',
    priority: 'medium'
  },
  {
    id: 'notif_006',
    type: 'payment',
    title: 'Ödeme İşleme',
    text: 'Masa 5 işlemini sonuçlandırdı. Tutar: 56 TRY',
    time: '2026-04-10T13:15:00Z',
    read: true,
    branchId: 'b1',
    priority: 'low'
  },
  {
    id: 'notif_007',
    type: 'new_order',
    title: 'Uzun Hazırlık Süresi',
    text: 'Sipariş #1048 15 dakikadır hazırlanıyor',
    time: '2026-04-10T13:05:00Z',
    read: true,
    branchId: 'b1',
    priority: 'medium'
  },
  {
    id: 'notif_008',
    type: 'low_stock',
    title: 'Stok Uyarısı',
    text: 'Döner eti stoku 5 kg kaldı',
    time: '2026-04-10T12:45:00Z',
    read: true,
    branchId: 'b1',
    priority: 'high'
  }
];

const BIZ_MENU_CATEGORIES = [
  'Burgerler',
  'Pizzalar',
  'Kebaplar',
  'Salatalar',
  'Tatlılar',
  'İçecekler',
  'Çorbalar',
  'Kahvaltı'
];

/* ═══ KITCHEN CATEGORIES (Mutfak İstasyonları) ═══ */
const BIZ_KITCHEN_CATEGORIES = [
  { id: 'hot_kitchen',  name: 'Sıcak Mutfak',  icon: 'solar:fire-bold',        color: '#EF4444' },
  { id: 'cold_kitchen', name: 'Soğuk Mutfak',   icon: 'solar:snowflake-bold',   color: '#3B82F6' },
  { id: 'grill',        name: 'Izgara',         icon: 'solar:fire-square-bold',  color: '#F97316' },
  { id: 'pastry',       name: 'Pastane',        icon: 'solar:donut-bold',       color: '#EC4899' },
  { id: 'bar',          name: 'Bar / İçecek',   icon: 'solar:cup-hot-bold',     color: '#A855F7' },
  { id: 'salad',        name: 'Salata Bar',     icon: 'solar:leaf-bold',        color: '#22C55E' }
];

/* ═══ MENU ITEMS (with kitchen category) ═══ */
const BIZ_MENU_ITEMS = [
  { id: 'mi_01', name: 'Adana Kebap',            price: 18.50, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_02', name: 'İskender Kebap Tavası',  price: 24.00, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_03', name: 'Döner Dürüm',            price: 8.50,  category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_04', name: 'Şiş Tavuk',              price: 14.00, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_05', name: 'Ciğer Kebap',            price: 16.00, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_06', name: 'Lula Kebap',             price: 17.00, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_07', name: 'Taverna Kebap',          price: 19.50, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_08', name: 'Lahmacun',               price: 6.50,  category: 'Kebaplar',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_09', name: 'Pide',                   price: 10.00, category: 'Pizzalar',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_10', name: 'Köfte',                  price: 9.00,  category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_11', name: 'Ispanaklı Börek',        price: 8.50,  category: 'Kahvaltı',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_12', name: 'Mezze Tabı',             price: 22.00, category: 'Salatalar', kitchenCategory: 'cold_kitchen', status: 'active', branchId: 'b1' },
  { id: 'mi_13', name: 'Dürüm Sodası',           price: 12.00, category: 'Kebaplar',  kitchenCategory: 'grill',        status: 'active', branchId: 'b1' },
  { id: 'mi_14', name: 'Çoban Salatası',         price: 7.50,  category: 'Salatalar', kitchenCategory: 'salad',        status: 'active', branchId: 'b1' },
  { id: 'mi_15', name: 'Feta Peyniri Salatası',  price: 6.50,  category: 'Salatalar', kitchenCategory: 'salad',        status: 'active', branchId: 'b1' },
  { id: 'mi_16', name: 'Beyaz Peynir Salatası',  price: 6.00,  category: 'Salatalar', kitchenCategory: 'salad',        status: 'active', branchId: 'b1' },
  { id: 'mi_17', name: 'Domates Salatası',       price: 5.00,  category: 'Salatalar', kitchenCategory: 'salad',        status: 'active', branchId: 'b1' },
  { id: 'mi_18', name: 'Hummus',                 price: 4.00,  category: 'Salatalar', kitchenCategory: 'cold_kitchen', status: 'active', branchId: 'b1' },
  { id: 'mi_19', name: 'Pilaf',                  price: 3.50,  category: 'Kebaplar',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_20', name: 'Garnitür',               price: 5.00,  category: 'Kebaplar',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_21', name: 'Mısır Pilav',            price: 4.50,  category: 'Kebaplar',  kitchenCategory: 'hot_kitchen',  status: 'active', branchId: 'b1' },
  { id: 'mi_22', name: 'Beyaz Peynir',           price: 5.00,  category: 'Kahvaltı',  kitchenCategory: 'cold_kitchen', status: 'active', branchId: 'b1' },
  { id: 'mi_23', name: 'Acılı Turşu',            price: 3.00,  category: 'Salatalar', kitchenCategory: 'cold_kitchen', status: 'active', branchId: 'b1' },
  { id: 'mi_24', name: 'Turşu',                  price: 3.00,  category: 'Salatalar', kitchenCategory: 'cold_kitchen', status: 'active', branchId: 'b1' },
  { id: 'mi_25', name: 'Ayran',                  price: 2.50,  category: 'İçecekler', kitchenCategory: 'bar',          status: 'active', branchId: 'b1' },
  { id: 'mi_26', name: 'Kola',                   price: 3.50,  category: 'İçecekler', kitchenCategory: 'bar',          status: 'active', branchId: 'b1' },
  { id: 'mi_27', name: 'Maden Suyu',             price: 2.50,  category: 'İçecekler', kitchenCategory: 'bar',          status: 'active', branchId: 'b1' },
  { id: 'mi_28', name: 'Çay',                    price: 2.00,  category: 'İçecekler', kitchenCategory: 'bar',          status: 'active', branchId: 'b1' },
  { id: 'mi_29', name: 'Limonata',               price: 3.00,  category: 'İçecekler', kitchenCategory: 'bar',          status: 'active', branchId: 'b1' }
];

/* ═══ STAFF INVITATIONS / CREDENTIALS ═══
 * When an owner/manager invites someone via "Personel Ekle", the system
 * generates a username + password and "sends" it via SMS/email. The pending
 * credential is stored here so it can be matched when the new employee logs in
 * via Settings → "Bir İşletmede Çalışıyorum".
 */
const BIZ_INVITES = [
  // Demo invite: username 'demo.garson' / password 'Lez4821' is preloaded
  // so the login flow can be tried out immediately.
  {
    id: 'inv_demo_001',
    username: 'demo.garson',
    password: 'Lez4821',
    name: 'Demo Garson',
    phone: '+905550000000',
    email: 'demo.garson@example.com',
    role: 'waiter',
    businessId: 'bus_001',
    businessName: 'Lezzet Mutfak',
    branchId: 'b1',
    branchName: 'Kadıköy Şubesi',
    invitedBy: 'staff_001',
    invitedAt: '2026-04-12T10:00:00Z',
    status: 'pending' // pending | accepted | revoked
  }
];

// Export all data
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BIZ_BUSINESS,
    BIZ_BRANCHES,
    BIZ_TABLE_ZONES,
    BIZ_TABLES,
    BIZ_RESERVATIONS,
    BIZ_PROFILE,
    BIZ_FOLLOWERS,
    BIZ_FOLLOWING,
    BIZ_STAFF,
    BIZ_INVITES,
    BIZ_ROLE_LABELS,
    BIZ_ROLE_PERMISSIONS,
    BIZ_TILE_DEFS,
    BIZ_SHIFTS,
    BIZ_ORDERS,
    BIZ_WAITER_CALLS,
    BIZ_REVIEWS,
    BIZ_DASHBOARD_STATS,
    BIZ_NOTIFICATIONS,
    BIZ_MENU_CATEGORIES,
    BIZ_KITCHEN_CATEGORIES,
    BIZ_MENU_ITEMS
  };
}
