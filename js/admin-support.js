/* ═══════════════════════════════════════════════════════════
   ADMIN SUPPORT — Destek Talepleri Yönetimi
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _asup = {
  search: '',
  statusFilter: 'all',   /* all | open | in_progress | resolved */
  typeFilter: 'all',      /* all | order | payment | technical | complaint */
  sortBy: 'newest',       /* newest | oldest */
  filtersOpen: false,
  chatOpen: false,
  chatTicketId: null,
  userCardOpen: false,
  userCardId: null
};

/* ── Status defs ── */
var _ASUP_ST = {
  open:        { label: 'Yeni',       color: '#3B82F6', icon: 'solar:bell-bing-bold',      bg: '#DBEAFE' },
  in_progress: { label: 'Devam Eden', color: '#F97316', icon: 'solar:hourglass-bold',      bg: '#FED7AA' },
  resolved:    { label: 'Çözüldü',    color: '#22C55E', icon: 'solar:check-circle-bold',   bg: '#DCFCE7' }
};

/* ── Type defs ── */
var _ASUP_TYPE = {
  order:      { label: 'Sipariş Sorunu', icon: 'solar:bag-cross-bold',        color: '#EF4444' },
  payment:    { label: 'Ödeme',          icon: 'solar:wallet-money-bold',      color: '#F59E0B' },
  technical:  { label: 'Teknik Hata',    icon: 'solar:bug-bold',              color: '#8B5CF6' },
  complaint:  { label: 'Şikayet',        icon: 'solar:danger-triangle-bold',  color: '#EC4899' }
};

/* ═══════════════════════════════════════
   TILE — Dashboard Genel sekmesinde
   ═══════════════════════════════════════ */
function _asupTileHtml() {
  var openT = ADMIN_TICKETS.filter(function(t) { return t.status === 'open'; });
  var progT = ADMIN_TICKETS.filter(function(t) { return t.status === 'in_progress'; });
  var total = openT.length + progT.length;

  return '<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);cursor:pointer;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow-sm)" onclick="openAdminSupport()">'
    + '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<div style="width:36px;height:36px;border-radius:var(--r-lg);background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:18px;color:#EF4444"></iconify-icon>'
    + '</div>'
    + (openT.length > 0 ? '<span style="font:var(--fw-bold) 10px/1 var(--font);color:#fff;background:#EF4444;min-width:18px;height:18px;border-radius:var(--r-full);display:flex;align-items:center;justify-content:center;padding:0 5px">' + openT.length + '</span>' : '')
    + '</div>'
    + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Destek Talepleri</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + total + ' Açık Talep</div>'
    + '<div style="display:flex;gap:8px">'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#3B82F6">' + openT.length + ' yeni</span>'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#F97316">' + progT.length + ' devam eden</span>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   DETAIL PAGE — Full overlay
   ═══════════════════════════════════════ */
function openAdminSupport() {
  _asupInjectStyles();
  var ov = document.getElementById('adminSupportOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'adminSupportOverlay';
    ov.className = 'prof-overlay';
    document.getElementById('adminPhone').appendChild(ov);
  }
  ov.classList.add('open');
  _asupRenderList();
}

function _asupClose() {
  var ov = document.getElementById('adminSupportOverlay');
  if (ov) ov.classList.remove('open');
}

/* ── List render ── */
function _asupRenderList() {
  var ov = document.getElementById('adminSupportOverlay');
  if (!ov) return;

  /* Filter data */
  var list = ADMIN_TICKETS.slice();

  if (_asup.statusFilter !== 'all') {
    list = list.filter(function(t) { return t.status === _asup.statusFilter; });
  }
  if (_asup.typeFilter !== 'all') {
    list = list.filter(function(t) { return t.type === _asup.typeFilter; });
  }
  if (_asup.search) {
    var q = _asup.search.toLowerCase();
    list = list.filter(function(t) {
      return t.user.toLowerCase().indexOf(q) !== -1
        || t.subject.toLowerCase().indexOf(q) !== -1
        || t.ticketNo.toLowerCase().indexOf(q) !== -1
        || (t.business && t.business.toLowerCase().indexOf(q) !== -1);
    });
  }

  /* Sort */
  list.sort(function(a, b) {
    return _asup.sortBy === 'newest'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  /* Stats */
  var openC  = ADMIN_TICKETS.filter(function(t) { return t.status === 'open'; }).length;
  var progC  = ADMIN_TICKETS.filter(function(t) { return t.status === 'in_progress'; }).length;
  var resC   = ADMIN_TICKETS.filter(function(t) { return t.status === 'resolved'; }).length;

  var h = '<div style="display:flex;flex-direction:column;height:100%;background:var(--bg-phone)">';

  /* ── Sticky header ── */
  h += '<div style="padding:14px 16px 0;flex-shrink:0">';

  /* Top bar */
  h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'
    + '<div style="width:34px;height:34px;border-radius:var(--r-lg);background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_asupClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-primary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1"><div style="font:var(--fw-bold) 20px/1.1 var(--font);color:var(--text-primary)">Destek Talepleri</div></div>'
    + '</div>';

  /* Mini KPIs */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">'
    + _asupMiniKpi('Yeni', openC, '#3B82F6')
    + _asupMiniKpi('Devam', progC, '#F97316')
    + _asupMiniKpi('Çözüldü', resC, '#22C55E')
    + '</div>';

  /* Search */
  h += '<div style="display:flex;gap:8px;margin-bottom:10px">'
    + '<div style="flex:1;position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="asup-search" placeholder="Talep no, kullanıcı veya konu..." value="' + _asupEsc(_asup.search) + '" oninput="_asupSearchChange(this.value)" />'
    + '</div>'
    + '<div class="asup-icon-btn' + (_asup.filtersOpen ? ' active' : '') + '" onclick="_asupToggleFilters()">'
    + '<iconify-icon icon="solar:filter-bold" style="font-size:16px"></iconify-icon>'
    + (_asupHasFilters() ? '<span class="asup-filter-dot"></span>' : '')
    + '</div>'
    + '</div>';

  /* Filter panel */
  if (_asup.filtersOpen) {
    h += _asupRenderFilters();
  }

  /* Status tabs */
  h += '<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:10px">';
  var stabs = [
    { key: 'all', label: 'Tümü', count: ADMIN_TICKETS.length },
    { key: 'open', label: 'Yeni', count: openC },
    { key: 'in_progress', label: 'Devam Eden', count: progC },
    { key: 'resolved', label: 'Çözüldü', count: resC }
  ];
  for (var si = 0; si < stabs.length; si++) {
    var st = stabs[si];
    var isAct = _asup.statusFilter === st.key;
    h += '<button class="asup-tab' + (isAct ? ' active' : '') + '" onclick="_asupSetStatus(\'' + st.key + '\')">'
      + st.label + ' <span class="asup-tab-count">' + st.count + '</span></button>';
  }
  h += '</div>';

  h += '</div>'; /* end sticky header */

  /* ── Scrollable list ── */
  h += '<div style="flex:1;overflow-y:auto;padding:0 16px 80px">';

  if (list.length === 0) {
    h += '<div style="text-align:center;padding:40px 20px">'
      + '<iconify-icon icon="solar:chat-round-check-bold" style="font-size:48px;color:var(--text-tertiary)"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:10px">Filtrelerle eşleşen talep bulunamadı</div>'
      + '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var i = 0; i < list.length; i++) {
      h += _asupTicketCard(list[i]);
    }
    h += '</div>';
  }

  h += '</div></div>';

  ov.innerHTML = h;
}

/* ── Ticket card ── */
function _asupTicketCard(tk) {
  var st = _ASUP_ST[tk.status] || _ASUP_ST.open;
  var tp = _ASUP_TYPE[tk.type] || _ASUP_TYPE.order;
  var lastMsg = tk.messages && tk.messages.length > 0 ? tk.messages[tk.messages.length - 1] : null;

  var h = '<div class="asup-card" onclick="_asupOpenChat(\'' + tk.id + '\')">';

  /* Row 1: ticket no + status badge */
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted)">' + tk.ticketNo + '</span>'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + st.color + ';background:' + st.bg + ';padding:3px 8px;border-radius:var(--r-full)">' + st.label + '</span>'
    + '</div>';

  /* Row 2: type icon + subject */
  h += '<div style="display:flex;align-items:flex-start;gap:10px">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:' + tp.color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + tp.icon + '" style="font-size:16px;color:' + tp.color + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + tk.subject + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + tp.label + (tk.subReason ? ' · ' + tk.subReason : '') + '</div>'
    + '</div>'
    + '</div>';

  /* Row 3: user + time */
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle)">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:user-circle-bold" style="font-size:14px;color:var(--text-tertiary)"></iconify-icon>'
    + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + tk.user + '</span>'
    + (tk.business ? '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">· ' + tk.business + '</span>' : '')
    + '</div>'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">' + _asupRelTime(tk.date) + '</span>'
    + '</div>';

  /* Row 4: last message preview */
  if (lastMsg) {
    var preview = lastMsg.text.length > 60 ? lastMsg.text.substring(0, 60) + '...' : lastMsg.text;
    h += '<div style="margin-top:6px;padding:6px 8px;background:var(--bg-phone-secondary);border-radius:var(--r-md)">'
      + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)">'
      + '<span style="font-weight:var(--fw-medium);color:var(--text-secondary)">' + lastMsg.name + ':</span> ' + preview
      + '</div></div>';
  }

  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   CHAT DETAIL — Side-drawer
   ═══════════════════════════════════════ */
function _asupOpenChat(ticketId) {
  _asup.chatOpen = true;
  _asup.chatTicketId = ticketId;
  _asupRenderChat();
}

function _asupCloseChat() {
  _asup.chatOpen = false;
  _asup.chatTicketId = null;
  var bd = document.getElementById('asupChatBackdrop');
  var dw = document.getElementById('asupChatDrawer');
  if (bd) bd.classList.remove('open');
  if (dw) dw.classList.remove('open');
  setTimeout(function() { if (bd) bd.remove(); if (dw) dw.remove(); }, 300);
}

function _asupRenderChat() {
  var tk = null;
  for (var i = 0; i < ADMIN_TICKETS.length; i++) {
    if (ADMIN_TICKETS[i].id === _asup.chatTicketId) { tk = ADMIN_TICKETS[i]; break; }
  }
  if (!tk) return;

  var st = _ASUP_ST[tk.status] || _ASUP_ST.open;
  var tp = _ASUP_TYPE[tk.type] || _ASUP_TYPE.order;

  /* Remove existing */
  var oldBd = document.getElementById('asupChatBackdrop');
  var oldDw = document.getElementById('asupChatDrawer');
  if (oldBd) oldBd.remove();
  if (oldDw) oldDw.remove();

  /* Backdrop */
  var bd = document.createElement('div');
  bd.id = 'asupChatBackdrop';
  bd.className = 'asup-drawer-backdrop';
  bd.onclick = _asupCloseChat;

  /* Drawer */
  var dw = document.createElement('div');
  dw.id = 'asupChatDrawer';
  dw.className = 'asup-drawer';

  var h = '';

  /* ── Header ── */
  h += '<div class="asup-chat-header">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div style="width:30px;height:30px;border-radius:var(--r-md);background:' + st.color + '18;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_asupCloseChat()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:16px;color:var(--text-primary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + tk.ticketNo + ' · ' + tk.subject + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:3px">'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + st.color + ';background:' + st.bg + ';padding:2px 6px;border-radius:var(--r-full)">' + st.label + '</span>'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">' + _asupRelTime(tk.date) + '</span>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';

  /* ── Info panel ── */
  h += '<div class="asup-chat-info">'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<span class="asup-info-chip" style="color:' + tp.color + ';background:' + tp.color + '12"><iconify-icon icon="' + tp.icon + '" style="font-size:12px"></iconify-icon>' + tp.label + '</span>'
    + (tk.subReason ? '<span class="asup-info-chip" style="color:var(--text-secondary);background:var(--bg-phone-secondary)">' + tk.subReason + '</span>' : '')
    + (tk.orderId ? '<span class="asup-info-chip" style="color:#3B82F6;background:rgba(59,130,246,0.1)"><iconify-icon icon="solar:bag-check-bold" style="font-size:12px"></iconify-icon>' + tk.orderId + '</span>' : '')
    + '</div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">'
    + '<div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="_asupOpenUserCard(\'' + tk.userId + '\')">'
    + '<div style="width:26px;height:26px;border-radius:50%;background:var(--primary-soft);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:user-bold" style="font-size:13px;color:var(--primary)"></iconify-icon>'
    + '</div>'
    + '<div>'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary)">' + tk.user + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:1px">Profili gör →</div>'
    + '</div>'
    + '</div>'
    + (tk.business ? '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + tk.business + '</span>' : '')
    + '</div>'
    + '</div>';

  /* ── Messages area ── */
  h += '<div class="asup-chat-messages" id="asupChatMsgArea">';
  for (var m = 0; m < tk.messages.length; m++) {
    var msg = tk.messages[m];
    var isSupport = msg.from === 'support';
    h += '<div class="asup-msg ' + (isSupport ? 'asup-msg-support' : 'asup-msg-user') + '">'
      + '<div class="asup-msg-name">' + msg.name + '</div>'
      + '<div class="asup-msg-text">' + msg.text + '</div>'
      + '<div class="asup-msg-time">' + _asupFmtTime(msg.time) + '</div>'
      + '</div>';
  }
  h += '</div>';

  /* ── Input area ── */
  h += '<div class="asup-chat-input-area">';

  /* Status actions */
  if (tk.status !== 'resolved') {
    h += '<div style="display:flex;gap:6px;margin-bottom:8px">';
    if (tk.status === 'open') {
      h += '<button class="asup-action-btn" style="background:#F97316;color:#fff" onclick="_asupChangeStatus(\'' + tk.id + '\',\'in_progress\')">'
        + '<iconify-icon icon="solar:play-bold" style="font-size:13px"></iconify-icon>İşleme Al</button>';
    }
    h += '<button class="asup-action-btn" style="background:#22C55E;color:#fff" onclick="_asupChangeStatus(\'' + tk.id + '\',\'resolved\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:13px"></iconify-icon>Çözüldü</button>';
    h += '</div>';
  }

  /* Message input */
  h += '<div style="display:flex;gap:8px;align-items:flex-end">'
    + '<textarea id="asupMsgInput" class="asup-msg-input" placeholder="Mesaj yaz..." rows="1" oninput="this.style.height=\'auto\';this.style.height=Math.min(this.scrollHeight,80)+\'px\'"></textarea>'
    + '<button class="asup-send-btn" onclick="_asupSendMessage(\'' + tk.id + '\')">'
    + '<iconify-icon icon="solar:plain-bold" style="font-size:18px"></iconify-icon>'
    + '</button>'
    + '</div>';

  h += '</div>';

  dw.innerHTML = h;

  var ov = document.getElementById('adminSupportOverlay');
  if (!ov) return;
  ov.appendChild(bd);
  ov.appendChild(dw);

  requestAnimationFrame(function() {
    bd.classList.add('open');
    dw.classList.add('open');
    /* Scroll to bottom */
    var ma = document.getElementById('asupChatMsgArea');
    if (ma) ma.scrollTop = ma.scrollHeight;
  });
}

/* ── Send message ── */
function _asupSendMessage(ticketId) {
  var inp = document.getElementById('asupMsgInput');
  if (!inp || !inp.value.trim()) return;

  var tk = null;
  for (var i = 0; i < ADMIN_TICKETS.length; i++) {
    if (ADMIN_TICKETS[i].id === ticketId) { tk = ADMIN_TICKETS[i]; break; }
  }
  if (!tk) return;

  tk.messages.push({
    from: 'support',
    name: 'Destek Ekibi',
    text: inp.value.trim(),
    time: new Date().toISOString()
  });

  _asupRenderChat();
  _asupRenderList();
}

/* ── Change status ── */
function _asupChangeStatus(ticketId, newStatus) {
  for (var i = 0; i < ADMIN_TICKETS.length; i++) {
    if (ADMIN_TICKETS[i].id === ticketId) {
      ADMIN_TICKETS[i].status = newStatus;
      break;
    }
  }
  _asupRenderChat();
  _asupRenderList();
}

/* ═══════════════════════════════════════
   USER CARD — Mini side panel
   ═══════════════════════════════════════ */
function _asupOpenUserCard(userId) {
  var user = null;
  for (var i = 0; i < ADMIN_USERS.length; i++) {
    if (ADMIN_USERS[i].id === userId) { user = ADMIN_USERS[i]; break; }
  }
  if (!user) return;

  /* Remove old */
  var old = document.getElementById('asupUserCard');
  if (old) old.remove();

  var card = document.createElement('div');
  card.id = 'asupUserCard';
  card.className = 'asup-user-card';

  var statusColor = user.status === 'active' ? '#22C55E' : user.status === 'banned' ? '#EF4444' : '#F59E0B';
  var statusLabel = user.status === 'active' ? 'Aktif' : user.status === 'banned' ? 'Banlı' : 'Askıda';

  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Kullanıcı Bilgileri</span>'
    + '<div style="width:26px;height:26px;border-radius:var(--r-md);background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById(\'asupUserCard\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:16px;color:var(--text-muted)"></iconify-icon>'
    + '</div></div>';

  /* Avatar + name */
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    + '<div style="width:42px;height:42px;border-radius:50%;background:var(--primary-soft);display:flex;align-items:center;justify-content:center">'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)">' + user.name.charAt(0) + '</span>'
    + '</div>'
    + '<div>'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)">' + user.name + '</div>'
    + '<div style="display:flex;align-items:center;gap:4px;margin-top:3px">'
    + '<span style="width:6px;height:6px;border-radius:50%;background:' + statusColor + '"></span>'
    + '<span style="font:var(--fw-medium) 10px/1 var(--font);color:' + statusColor + '">' + statusLabel + '</span>'
    + (user.isPremium ? '<span style="font:var(--fw-bold) 10px/1 var(--font);color:#F59E0B;margin-left:4px">★ Premium</span>' : '')
    + '</div>'
    + '</div></div>';

  /* Contact info */
  h += '<div class="asup-uc-section">'
    + _asupUcRow('solar:phone-bold', user.phone)
    + _asupUcRow('solar:letter-bold', user.email)
    + _asupUcRow('solar:map-point-bold', user.city + (user.district ? ', ' + user.district : ''))
    + '</div>';

  /* Stats */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0">'
    + _asupUcStat('Sipariş', user.orders)
    + _asupUcStat('Harcama', '₺' + user.spent.toLocaleString('tr-TR'))
    + _asupUcStat('Cüzdan', '₺' + user.walletBalance.toLocaleString('tr-TR'))
    + _asupUcStat('Üyelik', _asupRelTime(user.joinDate + 'T00:00:00'))
    + '</div>';

  /* Allergens */
  if (user.allergens && user.allergens.length > 0) {
    h += '<div style="padding:8px;background:rgba(239,68,68,0.06);border-radius:var(--r-md);margin-bottom:8px">'
      + '<div style="font:var(--fw-semibold) 10px/1 var(--font);color:#EF4444;margin-bottom:4px">Alerjenler</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-secondary)">' + user.allergens.join(', ') + '</div>'
      + '</div>';
  }

  /* Link to 360° profile */
  h += '<button class="asup-uc-profile-btn" onclick="_asupGoTo360(\'' + user.id + '\')">'
    + '<iconify-icon icon="solar:user-id-bold" style="font-size:14px"></iconify-icon>'
    + '360° Profili Gör'
    + '</button>';

  card.innerHTML = h;

  var dw = document.getElementById('asupChatDrawer');
  if (dw) dw.appendChild(card);

  requestAnimationFrame(function() { card.classList.add('open'); });
}

function _asupGoTo360(userId) {
  _asupCloseChat();
  _asupClose();
  /* Navigate to Üyeler tab and open 360° */
  if (typeof switchAdminTab === 'function') {
    switchAdminTab('users');
    setTimeout(function() {
      if (typeof _mbrOpenUserDetail === 'function') {
        _mbrOpenUserDetail(userId);
      }
    }, 150);
  }
}

/* ═══════════════════════════════════════
   FILTER HELPERS
   ═══════════════════════════════════════ */
function _asupRenderFilters() {
  var h = '<div class="asup-filter-panel">';

  /* Sort */
  h += '<div class="asup-filter-group">'
    + '<div class="asup-filter-label">Sıralama</div>'
    + '<div style="display:flex;gap:4px">'
    + '<button class="asup-chip' + (_asup.sortBy === 'newest' ? ' active' : '') + '" onclick="_asupSetSort(\'newest\')">En Yeni</button>'
    + '<button class="asup-chip' + (_asup.sortBy === 'oldest' ? ' active' : '') + '" onclick="_asupSetSort(\'oldest\')">En Eski</button>'
    + '</div></div>';

  /* Type filter */
  h += '<div class="asup-filter-group">'
    + '<div class="asup-filter-label">Talep Türü</div>'
    + '<div style="display:flex;gap:4px;flex-wrap:wrap">'
    + '<button class="asup-chip' + (_asup.typeFilter === 'all' ? ' active' : '') + '" onclick="_asupSetType(\'all\')">Tümü</button>';
  var typeKeys = ['order', 'payment', 'technical', 'complaint'];
  for (var i = 0; i < typeKeys.length; i++) {
    var tk = typeKeys[i];
    var tp = _ASUP_TYPE[tk];
    h += '<button class="asup-chip' + (_asup.typeFilter === tk ? ' active' : '') + '" onclick="_asupSetType(\'' + tk + '\')">' + tp.label + '</button>';
  }
  h += '</div></div>';

  /* Reset */
  if (_asupHasFilters()) {
    h += '<button class="asup-reset-btn" onclick="_asupResetFilters()">'
      + '<iconify-icon icon="solar:restart-bold" style="font-size:13px"></iconify-icon>Filtreleri Temizle</button>';
  }

  h += '</div>';
  return h;
}

function _asupHasFilters() {
  return _asup.typeFilter !== 'all' || _asup.sortBy !== 'newest';
}

/* ═══════════════════════════════════════
   INTERACTIONS
   ═══════════════════════════════════════ */
function _asupSearchChange(v) { _asup.search = v; _asupRenderList(); }
function _asupToggleFilters() { _asup.filtersOpen = !_asup.filtersOpen; _asupRenderList(); }
function _asupSetStatus(s) { _asup.statusFilter = s; _asupRenderList(); }
function _asupSetSort(s) { _asup.sortBy = s; _asupRenderList(); }
function _asupSetType(t) { _asup.typeFilter = t; _asupRenderList(); }
function _asupResetFilters() {
  _asup.typeFilter = 'all';
  _asup.sortBy = 'newest';
  _asupRenderList();
}

/* ═══════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════ */
function _asupEsc(s) { return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function _asupRelTime(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  var diff = Math.floor((now - d) / 60000);
  if (diff < 1) return 'Az önce';
  if (diff < 60) return diff + ' dk önce';
  var hrs = Math.floor(diff / 60);
  if (hrs < 24) return hrs + ' sa önce';
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + ' gün önce';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function _asupFmtTime(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function _asupMiniKpi(label, count, color) {
  return '<div style="text-align:center;padding:8px;background:' + color + '10;border-radius:var(--r-lg);border:1px solid ' + color + '20">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + '">' + count + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">' + label + '</div>'
    + '</div>';
}

function _asupUcRow(icon, text) {
  return '<div style="display:flex;align-items:center;gap:6px;padding:4px 0">'
    + '<iconify-icon icon="' + icon + '" style="font-size:13px;color:var(--text-tertiary)"></iconify-icon>'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + text + '</span>'
    + '</div>';
}

function _asupUcStat(label, val) {
  return '<div style="text-align:center;padding:6px;background:var(--bg-phone-secondary);border-radius:var(--r-md)">'
    + '<div style="font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + val + '</div>'
    + '<div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-tertiary);margin-top:2px">' + label + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
function _asupInjectStyles() {
  if (document.getElementById('asupStyles')) return;
  var s = document.createElement('style');
  s.id = 'asupStyles';
  s.textContent = ''
    /* Search */
    + '.asup-search{width:100%;padding:9px 10px 9px 34px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);background:var(--bg-phone);color:var(--text-primary);outline:none;transition:border .2s}'
    + '.asup-search:focus{border-color:var(--primary)}'

    /* Icon btn */
    + '.asup-icon-btn{width:38px;height:38px;border-radius:var(--r-lg);border:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--bg-phone);position:relative;transition:all .15s;color:var(--text-secondary)}'
    + '.asup-icon-btn.active{background:var(--primary-soft);border-color:var(--primary);color:var(--primary)}'
    + '.asup-filter-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--primary)}'

    /* Tabs */
    + '.asup-tab{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;transition:all .15s}'
    + '.asup-tab.active{background:var(--primary);color:#fff;border-color:var(--primary)}'
    + '.asup-tab-count{font:var(--fw-bold) 10px/1 var(--font);opacity:.7}'

    /* Card */
    + '.asup-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px 14px;cursor:pointer;transition:all .15s;box-shadow:var(--shadow-sm)}'
    + '.asup-card:active{transform:scale(0.98);opacity:.9}'

    /* Filter panel */
    + '.asup-filter-panel{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px;margin-bottom:4px;display:flex;flex-direction:column;gap:10px}'
    + '.asup-filter-group{display:flex;flex-direction:column;gap:5px}'
    + '.asup-filter-label{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}'
    + '.asup-chip{padding:5px 10px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .15s}'
    + '.asup-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}'
    + '.asup-reset-btn{display:flex;align-items:center;justify-content:center;gap:4px;padding:7px;border-radius:var(--r-lg);border:none;background:rgba(239,68,68,0.08);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#EF4444;cursor:pointer}'

    /* Drawer */
    + '.asup-drawer-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.35);z-index:50;opacity:0;transition:opacity .3s;pointer-events:none}'
    + '.asup-drawer-backdrop.open{opacity:1;pointer-events:auto}'
    + '.asup-drawer{position:absolute;top:0;right:-100%;width:100%;height:100%;background:var(--bg-phone);z-index:51;transition:right .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column}'
    + '.asup-drawer.open{right:0}'

    /* Chat header */
    + '.asup-chat-header{padding:14px 16px;border-bottom:1px solid var(--border-subtle);flex-shrink:0}'

    /* Chat info panel */
    + '.asup-chat-info{padding:10px 16px;border-bottom:1px solid var(--border-subtle);flex-shrink:0}'
    + '.asup-info-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);font:var(--fw-semibold) 10px/1 var(--font)}'

    /* Messages */
    + '.asup-chat-messages{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px}'
    + '.asup-msg{max-width:85%;padding:10px 12px;border-radius:16px;position:relative}'
    + '.asup-msg-user{align-self:flex-start;background:var(--bg-phone-secondary);border-bottom-left-radius:4px}'
    + '.asup-msg-support{align-self:flex-end;background:var(--primary);color:#fff;border-bottom-right-radius:4px}'
    + '.asup-msg-name{font:var(--fw-semibold) 10px/1 var(--font);margin-bottom:4px;opacity:.7}'
    + '.asup-msg-text{font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)}'
    + '.asup-msg-time{font:var(--fw-regular) 9px/1 var(--font);opacity:.5;margin-top:4px;text-align:right}'
    + '.asup-msg-user .asup-msg-name{color:var(--text-muted)}'
    + '.asup-msg-user .asup-msg-text{color:var(--text-primary)}'

    /* Input area */
    + '.asup-chat-input-area{padding:10px 16px;border-top:1px solid var(--border-subtle);flex-shrink:0;background:var(--bg-phone)}'
    + '.asup-msg-input{flex:1;padding:8px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);background:var(--bg-phone);color:var(--text-primary);outline:none;resize:none;min-height:36px;max-height:80px;transition:border .2s}'
    + '.asup-msg-input:focus{border-color:var(--primary)}'
    + '.asup-send-btn{width:36px;height:36px;border-radius:50%;background:var(--primary);border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:transform .15s}'
    + '.asup-send-btn:active{transform:scale(0.9)}'
    + '.asup-action-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);border:none;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .15s}'
    + '.asup-action-btn:active{transform:scale(0.95)}'

    /* User card */
    + '.asup-user-card{position:absolute;bottom:0;left:0;right:0;background:var(--bg-phone);border-top:1px solid var(--border-subtle);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:16px;z-index:60;box-shadow:0 -4px 20px rgba(0,0,0,0.12);transform:translateY(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);max-height:75%;overflow-y:auto}'
    + '.asup-user-card.open{transform:translateY(0)}'
    + '.asup-uc-section{padding:8px 0;border-bottom:1px solid var(--border-subtle)}'
    + '.asup-uc-profile-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:var(--r-lg);border:1.5px solid var(--primary);background:transparent;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--primary);cursor:pointer;margin-top:8px;transition:all .15s}'
    + '.asup-uc-profile-btn:active{background:var(--primary-soft)}';

  document.head.appendChild(s);
}
