/* ═══ BIZ PLACEHOLDER FUNCTIONS ═══ */

function openBizRevenue() { if (!bizRoleGuard('revenue')) return; bizSwitchTab('bizDashboard'); }

function openBizBranches() { if (!bizRoleGuard('branches')) return; alert('Şube yönetimi — yakında!'); }

function openBizAddBranch() { alert('Şube ekleme — yakında!'); }

function openBizRoles() { alert('Rol yönetimi — yakında!'); }

function openBizProfileEdit() { alert('Profil düzenleme — yakında!'); }

function openBizCategories() { alert('Kategori yönetimi — yakında!'); }

function openBizRecipeShare() { alert('Tarif paylaşımı — yakında!'); }

function openBizPayments() { if (!bizRoleGuard('payments')) return; alert('Ödeme geçmişi — yakında!'); }

function openBizInvoice() { alert('Fatura bilgileri — yakında!'); }

// openBizKitchen → js/biz-kitchen.js
// openBizBar → js/biz-kitchen.js (bar is a kitchen station)
function openBizBar() { if (!bizRoleGuard('bar')) return; bizKitchenActiveStation = 'bar'; openBizKitchen(); }

function openBizReservations() { if (!bizRoleGuard('reservations')) return; alert('Rezervasyonlar — yakında!'); }

function openBizDelivery() { if (!bizRoleGuard('delivery')) return; alert('Teslimatlar — yakında!'); }

function closeBizMyBusiness() { /* handled by screen system */ }

