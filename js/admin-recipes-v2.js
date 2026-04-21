/* ═══════════════════════════════════════════════════════════
   ADMIN RECIPES V2 — 4 durum (Onaylı/Bekleyen/CevapBekleyen/Reddedilen)
   Drawer · AI allergen · Benzer tarif · Toplu işlem
   ═══════════════════════════════════════════════════════════ */

var _arv = {
  tab: 'pending',              // 'approved' | 'pending' | 'awaiting' | 'rejected'
  search: '',
  categoryFilter: '',
  selectedIds: {},             // { 'rc3': true } — bulk
  bulkMode: false,
  // Drawer state
  detailId: null,
  editingAllergens: [],
  showSimilar: false,
  // Action dialogs
  actionOpen: null,            // 'edit' | 'reject'
  actionNote: ''
};

/* ═══ Override mevcut admin sayfa render ═══ */
function renderAdminRecipes() {
  _arvInjectStyles();
  var c = document.getElementById('adminRecipesContainer');
  if (!c) return;
  _arvRender(c);
}

function _arvRender(c) {
  var counts = _arvCounts();

  var h = '<div class="arv-wrap adm-fadeIn">';

  // Header
  h += '<div class="arv-head">'
    + '<div class="arv-title"><iconify-icon icon="solar:chef-hat-heart-bold" style="font-size:20px;color:#F65013"></iconify-icon>Tarif Yönetimi</div>'
    + '<div class="arv-sub">' + ADMIN_RECIPES.length + ' tarif · ' + counts.pending + ' onay bekliyor</div>'
    + '</div>';

  // Tabs
  var tabs = [
    { id:'pending',   label:'Bekleyen',        icon:'solar:clock-circle-bold', color:'#F59E0B', count: counts.pending },
    { id:'awaiting',  label:'Cevap Bekleyen',  icon:'solar:chat-square-call-bold', color:'#8B5CF6', count: counts.awaiting },
    { id:'approved',  label:'Onaylı',          icon:'solar:check-circle-bold', color:'#22C55E', count: counts.approved },
    { id:'rejected',  label:'Reddedilen',      icon:'solar:close-circle-bold', color:'#EF4444', count: counts.rejected }
  ];

  h += '<div class="arv-tabs">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    h += '<button class="arv-tab' + (_arv.tab === t.id ? ' active' : '') + '" style="--tc:' + t.color + '" onclick="_arvSetTab(\'' + t.id + '\')">'
      + '<iconify-icon icon="' + t.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + t.label + '</span>'
      + '<span class="arv-tab-count">' + t.count + '</span>'
      + '</button>';
  }
  h += '</div>';

  // Search
  h += '<div class="arv-search">'
    + '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input type="text" placeholder="Tarif, kullanıcı veya kategori ara..." value="' + _arvEsc(_arv.search) + '" '
    + 'oninput="_arv.search=this.value;_arvRefreshList()">'
    + '</div>';

  // Body
  h += '<div id="arvListWrap" class="arv-list-wrap"></div>';

  h += '</div>';
  c.innerHTML = h;

  _arvRefreshList();
}

function _arvRefreshList() {
  var box = document.getElementById('arvListWrap');
  if (!box) return;
  box.innerHTML = '<div class="arv-placeholder">Liste (P2-P3-P8-P9) yakında...</div>';
}

function _arvSetTab(tab) {
  _arv.tab = tab;
  _arv.selectedIds = {};
  _arv.bulkMode = false;
  _arvRender(document.getElementById('adminRecipesContainer'));
}

function _arvCounts() {
  var c = { approved:0, pending:0, awaiting:0, rejected:0 };
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    var s = ADMIN_RECIPES[i].status;
    if (s === 'approved') c.approved++;
    else if (s === 'pending') c.pending++;
    else if (s === 'awaiting_response') c.awaiting++;
    else if (s === 'rejected') c.rejected++;
  }
  return c;
}

function _arvEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
