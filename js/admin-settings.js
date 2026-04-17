/* ═══════════════════════════════════════════════════════════
   ADMIN-SETTINGS.JS — Yönetim Paneli (Platform Ayarları)
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   YÖNETİM MERKEZİ — Tile Grid (ana render)
   ═══════════════════════════════════════════════════════════ */
function renderAdminSettings() {
  _admInjectStyles();
  var c = document.getElementById('adminSettingsContainer');
  if (!c) return;

  var S = (typeof ADMIN_STATS !== 'undefined') ? ADMIN_STATS : {};
  var M = (typeof ADMIN_MGMT_METRICS !== 'undefined') ? ADMIN_MGMT_METRICS : {};
  var BIZ = (typeof ADMIN_BUSINESSES !== 'undefined') ? ADMIN_BUSINESSES : [];
  var REC = (typeof ADMIN_RECIPES !== 'undefined') ? ADMIN_RECIPES : [];
  var TK  = (typeof ADMIN_TICKETS !== 'undefined') ? ADMIN_TICKETS : [];
  var RP  = (typeof ADMIN_REPORTS !== 'undefined') ? ADMIN_REPORTS : [];
  var CP  = (typeof ADMIN_CAMPAIGNS !== 'undefined') ? ADMIN_CAMPAIGNS : [];

  var openTickets = TK.filter(function(t) { return t.status === 'open' || t.status === 'in_progress'; }).length;
  var openReports = RP.filter(function(r) { return r.status === 'pending'; }).length;
  var pendingRecipes = REC.filter(function(r) { return r.status === 'pending'; }).length;
  var activeCampaigns = CP.filter(function(c) { return c.status === 'active'; }).length;

  /* ═══ HIZLI ERİŞİM — 3 priority 2x tile ═══ */
  var priority = [
    { id:'orders',    label:'Siparişler',           icon:'solar:bag-check-bold',       tone:'#22C55E',
      summary:_admFmt(S.dailyOrders || 0)+' bugün • '+_admFmtTL(S.dailyRevenue || 0),
      action:"adminSwitchTab('adminOrders')" },
    { id:'support',   label:'Destek',               icon:'solar:chat-round-dots-bold', tone:'#0EA5E9',
      summary:openTickets+' açık talep',
      action:"(typeof openAdminSupport==='function'?openAdminSupport():_admOpenTickets())" },
    { id:'bizApps',   label:'İşletme Başvuruları',  icon:'solar:inbox-in-bold',        tone:'#F59E0B',
      summary:((typeof ADMIN_BIZ_APPLICATIONS!=='undefined')
        ? ADMIN_BIZ_APPLICATIONS.filter(function(a){return a.status==='pending';}).length+' yeni • '+ADMIN_BIZ_APPLICATIONS.filter(function(a){return a.status==='awaiting_response';}).length+' cevap bekliyor'
        : (M.bizApplications && M.bizApplications.pending ? M.bizApplications.pending+' Yeni Başvuru' : '—')),
      action:"_admOpenBizApps()" }
  ];

  /* ═══ 5 GRUP ═══ */
  var groups = [
    {
      num:'01', title:'Paydaş ve Operasyon Yönetimi',
      sub:'Uygulamanın ana aktörleri ve saha operasyonları',
      tiles:[
        { id:'users',      label:'Kullanıcılar', icon:'solar:users-group-two-rounded-bold', tone:'#3B82F6',
          summary:_admFmt(S.totalUsers || 0)+' • '+_admFmt(S.activeUsers || 0)+' aktif',
          action:"adminSwitchTab('adminUsers')" },
        { id:'businesses', label:'İşletmeler', icon:'solar:shop-bold', tone:'#F97316',
          summary:_admFmt(BIZ.length)+' kayıtlı • '+_admFmt(S.totalBranches || 0)+' şube',
          action:"_admMgmtOpenBusinesses()" },
        { id:'staff',      label:'Personel Sayfası', icon:'solar:users-group-rounded-bold', tone:'#8B5CF6',
          summary:((typeof ADMIN_STAFF!=='undefined') ? _admFmt(ADMIN_STAFF.length)+' personel • '+_admFmt((M.staff&&M.staff.activeShifts)||0)+' vardiya' : (M.staff ? _admFmt(M.staff.total)+' • '+_admFmt(M.staff.activeShifts)+' vardiya' : '—')),
          action:"_admOpenStaff()" }
      ]
    },
    {
      num:'02', title:'Finans ve Gelir Merkezi',
      sub:'Para, token ve abonelik akışı',
      tiles:[
        { id:'tokenSupply', label:'Token Yönetim Merkezi', icon:'solar:dollar-minimalistic-bold', tone:'#EAB308',
          summary:(M.tokenSupply ? _admFmt(M.tokenSupply.total)+' arz' : '—'),
          action:"_admToast('Token yönetimi yakında')" },
        { id:'tokenTxns',  label:'Token İşlemleri', icon:'solar:round-transfer-horizontal-bold', tone:'#14B8A6',
          summary:(M.tokenTxns ? 'Bugün: '+_admFmt(M.tokenTxns.todayNet)+' ↑' : '—'),
          action:"_admToast('Token işlem geçmişi yakında')" },
        { id:'payments',   label:'Ödemeler', icon:'solar:card-bold', tone:'#10B981',
          summary:(M.payments ? 'Bugün: +'+_admFmtTL(M.payments.todayTl) : '—'),
          action:"renderAdminFinance()" },
        { id:'commission', label:'Komisyon Ayarları', icon:'solar:pie-chart-2-bold', tone:'#EC4899',
          summary:((typeof ADMIN_COMMISSION_RULES!=='undefined') ? ADMIN_COMMISSION_RULES.length+' aktif kural • Ort. %'+(S.platformCommission || 0).toFixed(1) : 'Ort. %'+(S.platformCommission || 0).toFixed(1)),
          action:"_admOpenCommission()" },
        { id:'premium',    label:'Premium Plan & Ücret', icon:'solar:crown-bold', tone:'#A855F7',
          summary:((typeof ADMIN_PREMIUM_MEMBERS!=='undefined') ? (ADMIN_PREMIUM_MEMBERS.biz.length+ADMIN_PREMIUM_MEMBERS.user.length)+' üye • '+ADMIN_PREMIUM_BIZ_PLANS.length+' katman' : (M.premium ? _admFmt(M.premium.subscribers)+' premium üye' : '—')),
          action:"_admOpenPremium()" }
      ]
    },
    {
      num:'03', title:'İçerik, Topluluk ve Pazarlama',
      sub:'Sosyal doku ve dışa dönük yüz',
      tiles:[
        { id:'recipes',      label:'Tarifler', icon:'solar:chef-hat-bold', tone:'#F65013',
          summary:_admFmt(REC.length)+' tarif • '+pendingRecipes+' bekliyor',
          action:"adminSwitchTab('adminRecipes')" },
        { id:'community',    label:'Topluluk Analizleri', icon:'solar:hashtag-chat-bold', tone:'#06B6D4',
          summary:(M.community ? '%'+M.community.engagementPct+' etkileşim' : '—'),
          action:"_admToast('Topluluk analizleri yakında')" },
        { id:'ads',          label:'Reklam Alanı', icon:'solar:gallery-wide-bold', tone:'#8B5CF6',
          summary:((typeof ADMIN_AD_CAMPAIGNS!=='undefined')
            ? ADMIN_AD_CAMPAIGNS.filter(function(c){return c.status==='active';}).length+' aktif • '+ADMIN_AD_PLACEMENTS.length+' yerleşim'
            : activeCampaigns+' aktif kampanya'),
          action:"_admOpenAds()" },
        { id:'notifications',label:'Bildirim Merkezi', icon:'solar:bell-bing-bold', tone:'#6366F1',
          summary:'Şablonlar & toplu gönderim',
          action:"_admOpenNotifTemplates()" }
      ]
    },
    {
      num:'04', title:'Güvenlik, Denetim ve Kriz Yönetimi',
      sub:'Sistem disiplini ve müdahale',
      tiles:[
        { id:'complaints', label:'Şikayet Yönetimi', icon:'solar:shield-warning-bold', tone:'#F59E0B',
          summary:openReports+' bekliyor',
          action:"_admOpenComplaints()" },
        { id:'blacklist',  label:'Kara Liste', icon:'solar:user-block-rounded-bold', tone:'#6B7280',
          summary:((typeof ADMIN_PENALTIES!=='undefined')
            ? ADMIN_PENALTIES.filter(function(p){return p.type==='ban';}).length+' yasak • '+ADMIN_PENALTIES.filter(function(p){return p.type==='restriction';}).length+' engel'
            : (M.blacklist ? M.blacklist.banned+' engelli' : '—')),
          action:"_admOpenBlacklist()" },
        { id:'incident',   label:'Hızlı Müdahale', icon:'solar:siren-bold',
          tone:(M.incident && M.incident.status === 'critical' ? '#EF4444' : M.incident && M.incident.status === 'warning' ? '#F59E0B' : '#22C55E'),
          summary:(M.incident && M.incident.status === 'critical' ? 'Sistem: Kritik' : M.incident && M.incident.status === 'warning' ? 'Sistem: Uyarı' : 'Sistem: Normal'),
          action:"_admToast('Acil müdahale merkezi yakında','err')" }
      ]
    },
    {
      num:'05', title:'Raporlama ve Üst Düzey Yetkilendirme',
      sub:'Stratejik kararlar ve hassas ayarlar',
      tiles:[
        { id:'reports',   label:'Raporlama Merkezi', icon:'solar:chart-2-bold', tone:'#0EA5E9',
          summary:(M.reports ? 'Son: '+M.reports.lastRun : '—'),
          action:"_admToast('Raporlama merkezi yakında')" },
        { id:'adminUsers',label:'Admin Ayarları', icon:'solar:shield-user-bold', tone:'#A855F7',
          summary:(M.adminUsers ? M.adminUsers.total+' admin • Hassas Erişim' : 'Hassas Erişim'),
          action:"_admToast('Admin yönetimi yakında')" }
      ]
    }
  ];

  var html = '<div class="amgmt-wrap adm-fadeIn">';

  /* Header */
  html += '<div class="amgmt-head">'
    + '<div>'
    + '<div class="amgmt-title">Yönetim Merkezi</div>'
    + '<div class="amgmt-sub">Platformun kalbi — paydaş, finans, içerik, denetim ve raporlama</div>'
    + '</div>'
    + '<div class="amgmt-badge"><iconify-icon icon="solar:shield-check-bold" style="font-size:13px"></iconify-icon><span>Süper Admin</span></div>'
    + '</div>';

  /* Hızlı Erişim (priority) */
  html += '<div class="amgmt-group amgmt-group--priority">'
    + '<div class="amgmt-ghead">'
    + '<div class="amgmt-gnum amgmt-gnum--priority">★</div>'
    + '<div><div class="amgmt-gtitle">Hızlı Erişim</div><div class="amgmt-gsub">En çok kullanılanlar</div></div>'
    + '</div>'
    + '<div class="amgmt-grid amgmt-grid--priority">'
    + priority.map(function(t){ return _amgmtTile(t, true); }).join('')
    + '</div></div>';

  /* 5 Groups */
  for (var gi = 0; gi < groups.length; gi++) {
    var g = groups[gi];
    html += '<div class="amgmt-group">'
      + '<div class="amgmt-ghead">'
      + '<div class="amgmt-gnum">'+g.num+'</div>'
      + '<div><div class="amgmt-gtitle">'+g.title+'</div><div class="amgmt-gsub">'+g.sub+'</div></div>'
      + '</div>'
      + '<div class="amgmt-grid">'
      + g.tiles.map(function(t){ return _amgmtTile(t, false); }).join('')
      + '</div></div>';
  }

  /* Footnote */
  html += '<div class="amgmt-note">'
    + '<iconify-icon icon="solar:lock-keyhole-bold" style="font-size:14px;color:#A855F7;flex-shrink:0;margin-top:1px"></iconify-icon>'
    + '<span><b>Admin Ayarları</b> alanı Hassas Erişim katmanıyla korunur — sadece tanımlı yetkililer giriş yapabilir.</span>'
    + '</div>';

  /* Footer — Çıkış (eski davranış korunuyor) */
  html += '<div style="padding-top:8px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Süperresto Admin <span style="font:var(--fw-bold)">v1.0.0</span></div>'
    + '</div>'
    + '<button onclick="adminLogout()" style="width:100%;padding:12px;background:#EF4444;color:#fff;border:none;border-radius:var(--r-lg);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">'
    + '<iconify-icon icon="solar:logout-bold" style="font-size:14px;vertical-align:text-bottom;margin-right:6px"></iconify-icon>'
    + 'Çıkış Yap</button>'
    + '</div>';

  html += '</div>';

  c.innerHTML = html;
}

/* ─── Yönetim Merkezi tile (priority flag) ─── */
function _amgmtTile(t, priority) {
  var cls = 'amgmt-tile' + (priority ? ' amgmt-tile--priority' : '');
  var iconSize = priority ? 24 : 20;
  return '<div class="'+cls+'" onclick="'+t.action+'">'
    + '<div class="amgmt-ticon" style="background:'+t.tone+'18;color:'+t.tone+'">'
    + '<iconify-icon icon="'+t.icon+'" style="font-size:'+iconSize+'px"></iconify-icon>'
    + '</div>'
    + '<div class="amgmt-tbody">'
    + '<div class="amgmt-tlabel">'+t.label+'</div>'
    + '<div class="amgmt-tsum" style="color:'+t.tone+'">'+t.summary+'</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" class="amgmt-tchev"></iconify-icon>'
    + '</div>';
}

/* ─── İşletmeler — overlay wrapper (navbar'a bağlı olmadığı için) ─── */
function _admMgmtOpenBusinesses() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İşletmeler</div></div>'
    + '</div>'
    + '<div id="adminBusinessesContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);
  if (typeof renderAdminBusinesses === 'function') renderAdminBusinesses();
}

/* ─── Settings Tile ─── */
function _admSettingsTile(icon, color, title, desc, onClick) {
  return '<div onclick="(' + onClick.toString().slice(13, -1) + ')" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px" onmouseover="this.style.background=\'var(--bg-phone-secondary)\'" onmouseout="this.style.background=\'var(--bg-phone)\'">'
    + '<div style="width:44px;height:44px;border-radius:var(--r-md);background:' + color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + icon + '" style="font-size:20px;color:' + color + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + title + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + desc + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-bold" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>'
    + '</div>';
}

/* ═══════════════════════════════════════════════════════════
   CAMPAIGNS OVERLAY
   ═══════════════════════════════════════════════════════════ */
function _admOpenCampaigns() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:megaphone-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Kampanyalar</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + ADMIN_CAMPAIGNS.length + ' kampanya</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">';

  for (var i = 0; i < ADMIN_CAMPAIGNS.length; i++) {
    var cp = ADMIN_CAMPAIGNS[i];
    var statusColor = cp.status === 'active' ? '#22C55E' : '#9CA3AF';
    var statusLabel = cp.status === 'active' ? 'Aktif' : 'Sona Erdi';
    var budgetPct = cp.budget ? Math.round((cp.spent / cp.budget) * 100) : 0;

    html += '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">'
      + '<div>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + cp.name + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admDate(cp.startDate) + ' → ' + _admDate(cp.endDate) + '</div>'
      + '</div>'
      + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + statusColor + ';background:' + statusColor + '15;padding:4px 8px;border-radius:var(--r-full)">' + statusLabel + '</span>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
      + '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Kullanım</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:2px">' + _admFmt(cp.usageCount) + 'x</div></div>'
      + (cp.budget ? '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Bütçe</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:2px">' + _admFmtTL(cp.spent) + ' / ' + _admFmtTL(cp.budget) + '</div></div>' : '')
      + '</div>'
      + (cp.budget ? '<div style="height:4px;background:var(--border-subtle);border-radius:var(--r-full);overflow:hidden"><div style="height:100%;width:' + budgetPct + '%;background:var(--primary);border-radius:var(--r-full)"></div></div>' : '')
      + '</div>';
  }

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

/* ═══════════════════════════════════════════════════════════
   TICKETS OVERLAY
   ═══════════════════════════════════════════════════════════ */
function _admOpenTickets() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Destek Talepleri</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + ADMIN_TICKETS.length + ' talebi</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">';

  for (var i = 0; i < ADMIN_TICKETS.length; i++) {
    var tk = ADMIN_TICKETS[i];
    var prioColor = tk.priority === 'high' ? '#EF4444' : tk.priority === 'medium' ? '#F59E0B' : '#6B7280';
    var statusColor = tk.status === 'open' ? '#EF4444' : tk.status === 'in_progress' ? '#F59E0B' : '#22C55E';

    html += '<div onclick="_admOpenTicketDetail(\'' + tk.id + '\')" style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;cursor:pointer;transition:all .2s" onmouseover="this.style.background=\'var(--border-subtle)\'" onmouseout="this.style.background=\'var(--bg-phone-secondary)\'">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + tk.subject + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">' + tk.user + (tk.business ? ' · ' + tk.business : '') + '</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<div style="width:6px;height:6px;border-radius:50%;background:' + prioColor + '"></div>'
      + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">' + _admRelative(tk.date) + '</span>'
      + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + statusColor + ';background:' + statusColor + '15;padding:2px 6px;border-radius:var(--r-full)">' + (tk.status === 'open' ? 'Açık' : tk.status === 'in_progress' ? 'İşleniyor' : 'Çözüldü') + '</span>'
      + '</div>'
      + '</div>';
  }

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

function _admOpenTicketDetail(ticketId) {
  var tk = ADMIN_TICKETS.find(function(t) { return t.id === ticketId; });
  if (!tk) return;

  var adminPhone = document.getElementById('adminPhone');
  var overlay = adminPhone.querySelector('.prof-overlay');
  if (!overlay) return;

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:79;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + tk.subject + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:16px">';

  html += '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Kullanıcı</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:4px">' + tk.user + '</div></div>'
    + '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">İşletme</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:4px">' + (tk.business || 'Platform') + '</div></div>'
    + '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Tarih</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:4px">' + _admDate(tk.date) + '</div></div>'
    + '<div><span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Durum</span><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:4px">' + (tk.status === 'open' ? 'Açık' : tk.status === 'in_progress' ? 'İşleniyor' : 'Çözüldü') + '</div></div>'
    + '</div>'
    + '</div>';

  html += '<div>'
    + '<label style="display:block;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Yanıt:</label>'
    + '<textarea placeholder="Yanıtınızı yazın..." style="width:100%;min-height:120px;padding:12px;background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);resize:none;box-sizing:border-box"></textarea>'
    + '<button style="width:100%;margin-top:10px;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 12px/1 var(--font);cursor:pointer;transition:opacity .2s" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">Yanıt Gönder</button>'
    + '</div>';

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

/* ═══════════════════════════════════════════════════════════
   REPORTS OVERLAY
   ═══════════════════════════════════════════════════════════ */
function _admOpenReports() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:warning-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Bildirilen İçerikler</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + ADMIN_REPORTS.length + ' rapor</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">';

  for (var i = 0; i < ADMIN_REPORTS.length; i++) {
    var rp = ADMIN_REPORTS[i];
    var statusColor = rp.status === 'pending' ? '#F59E0B' : '#22C55E';

    html += '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">'
      + '<div>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + rp.target + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">' + rp.type + ' · ' + rp.reportedBy + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + (rp.business || 'Platform') + ' · ' + _admRelative(rp.date) + '</div>'
      + '</div>'
      + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + statusColor + ';background:' + statusColor + '15;padding:4px 8px;border-radius:var(--r-full)">' + (rp.status === 'pending' ? 'Bekleniyor' : 'Çözüldü') + '</span>'
      + '</div>'
      + '<div style="display:flex;gap:8px">'
      + '<button onclick="_admToast(\'İçerik kaldırıldı\')" style="flex:1;padding:8px;background:#EF4444;color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;transition:opacity .2s" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">Kaldır</button>'
      + '<button onclick="_admToast(\'İçerik onaylandı\')" style="flex:1;padding:8px;background:#22C55E;color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;transition:opacity .2s" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">Onayla</button>'
      + '</div>'
      + '</div>';
  }

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION TEMPLATES OVERLAY
   ═══════════════════════════════════════════════════════════ */
function _admOpenNotifTemplates() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:bell-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Bildirim Şablonları</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + ADMIN_NOTIF_TEMPLATES.length + ' şablon</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">';

  for (var i = 0; i < ADMIN_NOTIF_TEMPLATES.length; i++) {
    var nt = ADMIN_NOTIF_TEMPLATES[i];

    html += '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;justify-content:space-between">'
      + '<div>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + nt.name + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">' + nt.trigger + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + nt.channel + '</div>'
      + '</div>'
      + '<div style="width:44px;height:28px;background:' + (nt.active ? '#22C55E' : 'var(--border-subtle)') + ';border-radius:var(--r-full);cursor:pointer;position:relative" onclick="this.style.background=' + (nt.active ? '\'var(--border-subtle)\'' : '\'#22C55E\'') + '; this.previousSibling.style.display=\'none\'">'
      + '<div style="width:24px;height:24px;background:#fff;border-radius:50%;position:absolute;top:2px;' + (nt.active ? 'right:2px' : 'left:2px') + ';transition:all .2s"></div>'
      + '</div>'
      + '</div>';
  }

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

/* ═══════════════════════════════════════════════════════════
   TIER INFO OVERLAY
   ═══════════════════════════════════════════════════════════ */
function _admOpenTierInfo() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:layers-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Komisyon Kademeleri</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Platform sistemi</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:16px">';

  html += '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-xl);padding:16px;color:#fff">'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.8">İşletme Yıldız Ortalamasına Göre</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font);margin-top:6px">Komisyon Oranı Belirlenir</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.7;margin-top:8px">Daha yüksek rating = daha düşük komisyon</div>'
    + '</div>';

  var tiers = [
    { rating: '5.0', commission: '5.5%', color: '#22C55E', description: 'Mükemmel işletmeler' },
    { rating: '4.8-4.9', commission: '7%', color: '#3B82F6', description: 'Çok iyi işletmeler' },
    { rating: '4.5-4.7', commission: '9%', color: '#8B5CF6', description: 'İyi işletmeler' },
    { rating: '4.0-4.4', commission: '11%', color: '#F59E0B', description: 'Orta işletmeler' },
    { rating: '3.5-3.9', commission: '13%', color: '#F97316', description: 'Düşük işletmeler' },
    { rating: '<3.5', commission: '15%', color: '#EF4444', description: 'Sorunlu işletmeler' }
  ];

  for (var i = 0; i < tiers.length; i++) {
    var tier = tiers[i];
    html += '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
      + '<div style="width:8px;height:8px;border-radius:50%;background:' + tier.color + '"></div>'
      + '<div>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">⭐ ' + tier.rating + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:1px">' + tier.description + '</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border-subtle)">'
      + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Komisyon Oranı</span>'
      + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + tier.color + '">' + tier.commission + '</span>'
      + '</div>'
      + '</div>';
  }

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}
