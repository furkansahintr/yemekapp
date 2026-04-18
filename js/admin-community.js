/* ═══════════════════════════════════════════════════════════
   ADMIN — Topluluk Analizleri
   13 Top-10 listesi · time × region filtre · deep link
   ═══════════════════════════════════════════════════════════ */

var _acmty = {
  time: 'week',
  region: 'all',
  expandedCard: null   // mobil detay için (opsiyonel)
};

function _admOpenCommunity() {
  _acmtyInjectStyles();
  var host = document.getElementById('adminPhone');
  if (!host) return;
  var existing = host.querySelector('.acmty-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open acmty-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'acmtyOverlay';
  host.appendChild(overlay);

  _acmtyRender();
}

function _acmtyClose() {
  var o = document.getElementById('acmtyOverlay');
  if (o) o.remove();
}

/* ── Helpers ── */
function _acmtyEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _acmtyFmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'K';
  return String(n);
}

function _acmtyList(id) {
  var base = ADMIN_COMMUNITY_BASE[id] || [];
  var out = base.map(function(it) {
    return Object.assign({}, it, { v: _admCmScale(it.v, _acmty.time, _acmty.region) });
  });
  out.sort(function(a,b){ return b.v - a.v; });
  return out;
}

function _acmtyRegionLbl() {
  for (var i = 0; i < ADMIN_COMMUNITY_REGIONS.length; i++) {
    if (ADMIN_COMMUNITY_REGIONS[i].id === _acmty.region) return ADMIN_COMMUNITY_REGIONS[i].label;
  }
  return '';
}

function _acmtyTimeLbl() {
  for (var i = 0; i < ADMIN_COMMUNITY_TIME.length; i++) {
    if (ADMIN_COMMUNITY_TIME[i].id === _acmty.time) return ADMIN_COMMUNITY_TIME[i].label;
  }
  return '';
}

/* ── Render ── */
function _acmtyRender() {
  var o = document.getElementById('acmtyOverlay');
  if (!o) return;

  var h = '<div class="acmty-header">'
    + '<div class="acmty-back" onclick="_acmtyClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="acmty-title"><iconify-icon icon="solar:hashtag-chat-bold" style="font-size:17px;color:#06B6D4"></iconify-icon>Topluluk Analizleri</div>'
    + '<div class="acmty-sub">13 kategori · Top 10 · ' + _acmtyTimeLbl() + ' · ' + _acmtyRegionLbl() + '</div>'
    + '</div>'
    + '</div>'
    + '<div id="acmtyBody" style="flex:1"></div>';

  o.innerHTML = h;
  _acmtyRenderBody();
}

function _acmtyRenderBody() {
  var body = document.getElementById('acmtyBody');
  if (!body) return;

  var h = '<div class="acmty-wrap adm-fadeIn">';

  // Filtre bar — Time
  h += '<div class="acmty-filter-group">'
    + '<div class="acmty-filter-lbl"><iconify-icon icon="solar:clock-circle-linear" style="font-size:13px"></iconify-icon>Zaman</div>'
    + '<div class="acmty-chips">';
  for (var i = 0; i < ADMIN_COMMUNITY_TIME.length; i++) {
    var t = ADMIN_COMMUNITY_TIME[i];
    h += '<button class="acmty-chip' + (_acmty.time===t.id?' active':'') + '" onclick="_acmtySetTime(\'' + t.id + '\')">'
      + _acmtyEsc(t.label) + '</button>';
  }
  h += '</div></div>';

  // Filtre bar — Region
  h += '<div class="acmty-filter-group">'
    + '<div class="acmty-filter-lbl"><iconify-icon icon="solar:map-point-linear" style="font-size:13px"></iconify-icon>Bölge</div>'
    + '<div class="acmty-chips">';
  for (var j = 0; j < ADMIN_COMMUNITY_REGIONS.length; j++) {
    var r = ADMIN_COMMUNITY_REGIONS[j];
    h += '<button class="acmty-chip' + (_acmty.region===r.id?' active':'') + '" onclick="_acmtySetRegion(\'' + r.id + '\')">'
      + _acmtyEsc(r.label) + '</button>';
  }
  h += '</div></div>';

  // Grid
  h += '<div class="acmty-grid">';
  for (var k = 0; k < ADMIN_COMMUNITY_CARDS.length; k++) {
    h += _acmtyCard(ADMIN_COMMUNITY_CARDS[k]);
  }
  h += '</div>';

  // Stratejik not
  h += '<div class="acmty-tip">'
    + '<iconify-icon icon="solar:lightbulb-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
    + '<div><b>Stratejik fırsat:</b> Bu listeleri kullanarak token hediye kampanyaları, reklam yönlendirmesi ve etkileşim artırıcı aksiyonlar planlayabilirsin.</div>'
    + '</div>';

  h += '</div>';
  body.innerHTML = h;
}

function _acmtySetTime(t) { _acmty.time = t; _acmtyRender(); }
function _acmtySetRegion(r) { _acmty.region = r; _acmtyRender(); }

/* ── Card ── */
function _acmtyCard(card) {
  var list = _acmtyList(card.id).slice(0, 10);

  var h = '<div class="acmty-card">'
    + '<div class="acmty-card-head" style="background:' + card.color + '12">'
    + '<div class="acmty-card-ico" style="background:' + card.color + ';color:#fff">'
    + '<iconify-icon icon="' + card.icon + '" style="font-size:16px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="acmty-card-title">' + _acmtyEsc(card.title) + '</div>'
    + '<div class="acmty-card-sub">' + _acmtyEsc(card.group) + ' · ' + _acmtyEsc(card.unit) + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="acmty-list">';

  if (list.length === 0) {
    h += '<div class="acmty-empty">Veri yok</div>';
  } else {
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var rank = i + 1;
      var medal = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'plain';
      var rankIcon = rank <= 3
        ? '<iconify-icon icon="solar:medal-ribbons-star-bold" style="font-size:14px"></iconify-icon>'
        : '';

      var subLine = it.biz ? ' · ' + _acmtyEsc(it.biz) : (it.sub ? ' · ' + _acmtyEsc(it.sub) : '');
      var onClick = _acmtyDeepLink(it);

      h += '<div class="acmty-row" onclick="' + onClick + '">'
        + '<div class="acmty-rank acmty-rank--' + medal + '">' + rankIcon + (rankIcon ? '' : rank) + (rankIcon ? '<span class="acmty-rank-n">' + rank + '</span>' : '') + '</div>'
        + '<div class="acmty-row-main">'
        + '<div class="acmty-row-name">' + _acmtyEsc(it.name) + '</div>'
        + (subLine ? '<div class="acmty-row-sub">' + subLine.slice(3) + '</div>' : '')
        + '</div>'
        + '<div class="acmty-row-val" style="color:' + card.color + '">'
        + _acmtyFmt(it.v) + (it.unit ? ' <span class="acmty-row-unit">' + _acmtyEsc(it.unit) + '</span>' : '')
        + '</div>'
        + '</div>';
    }
  }
  h += '</div></div>';
  return h;
}

/* ── Deep Link ── */
function _acmtyDeepLink(it) {
  if (it.kind === 'user') {
    if (typeof _admOpenUserFullDetail === 'function') {
      return '_admOpenUserFullDetail(\'' + _acmtyEsc(it.id) + '\')';
    }
    return "_admToast('Kullanıcı: " + _acmtyEsc(it.name) + "')";
  }
  if (it.kind === 'biz') {
    if (typeof _admOpenBizFullDetail === 'function') {
      return '_admOpenBizFullDetail(\'' + _acmtyEsc(it.id) + '\')';
    }
    return "_admToast('İşletme: " + _acmtyEsc(it.name) + "')";
  }
  if (it.kind === 'recipe') {
    return "_acmtyOpenRecipe('" + _acmtyEsc(it.id) + "','" + _acmtyEsc(it.name) + "')";
  }
  if (it.kind === 'menu') {
    return "_acmtyOpenMenuItem('" + _acmtyEsc(it.id) + "','" + _acmtyEsc(it.name) + "','" + _acmtyEsc(it.biz || '') + "')";
  }
  return "_admToast('" + _acmtyEsc(it.name) + "')";
}

function _acmtyOpenRecipe(id, name) {
  if (typeof _admToast === 'function') _admToast('Tarif detayı açılıyor: ' + name, 'ok');
  if (typeof adminSwitchTab === 'function') {
    setTimeout(function(){ adminSwitchTab('adminRecipes'); _acmtyClose(); }, 320);
  }
}

function _acmtyOpenMenuItem(id, name, biz) {
  if (typeof _admToast === 'function') _admToast('Menü ürünü: ' + name + (biz ? ' · ' + biz : ''), 'ok');
}

/* ── Styles ── */
function _acmtyInjectStyles() {
  if (document.getElementById('acmtyStyles')) return;
  var s = document.createElement('style');
  s.id = 'acmtyStyles';
  s.textContent = [
    '.acmty-overlay{color:var(--text-primary)}',
    '.acmty-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);z-index:5}',
    '.acmty-back{width:34px;height:34px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.acmty-back:active{transform:scale(.94)}',
    '.acmty-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.acmty-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.acmty-wrap{padding:12px 14px 24px;display:flex;flex-direction:column;gap:12px}',
    '/* Filter group */',
    '.acmty-filter-group{display:flex;flex-direction:column;gap:7px}',
    '.acmty-filter-lbl{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;padding-left:2px}',
    '.acmty-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}',
    '.acmty-chips::-webkit-scrollbar{display:none}',
    '.acmty-chip{flex-shrink:0;padding:7px 13px;background:var(--bg-phone-secondary);border:1.5px solid transparent;color:var(--text-primary);border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap}',
    '.acmty-chip:active{transform:scale(.95)}',
    '.acmty-chip.active{background:#06B6D415;color:#06B6D4;border-color:#06B6D4}',
    '/* Grid */',
    '.acmty-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:4px}',
    '.acmty-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04)}',
    '.acmty-card-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-soft)}',
    '.acmty-card-ico{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.acmty-card-title{font-size:13px;font-weight:700;color:var(--text-primary)}',
    '.acmty-card-sub{font-size:10.5px;color:var(--text-muted);margin-top:1px}',
    '.acmty-list{display:flex;flex-direction:column}',
    '.acmty-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border-soft);cursor:pointer;transition:background .15s}',
    '.acmty-row:last-child{border-bottom:none}',
    '.acmty-row:hover,.acmty-row:active{background:var(--bg-phone-secondary)}',
    '/* Rank medal */',
    '.acmty-rank{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;color:var(--text-muted);background:var(--bg-phone-secondary);position:relative}',
    '.acmty-rank--gold{background:linear-gradient(135deg,#FCD34D,#F59E0B);color:#78350F;box-shadow:0 1px 4px rgba(245,158,11,.35)}',
    '.acmty-rank--silver{background:linear-gradient(135deg,#E5E7EB,#9CA3AF);color:#1F2937;box-shadow:0 1px 4px rgba(156,163,175,.3)}',
    '.acmty-rank--bronze{background:linear-gradient(135deg,#CD7F32,#92400E);color:#fff;box-shadow:0 1px 4px rgba(205,127,50,.3)}',
    '.acmty-rank-n{position:absolute;bottom:-3px;right:-3px;background:var(--bg-phone);color:var(--text-primary);font-size:8px;width:13px;height:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;border:1.5px solid var(--bg-phone)}',
    '.acmty-row-main{flex:1;min-width:0}',
    '.acmty-row-name{font-size:12.5px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.acmty-row-sub{font-size:10px;color:var(--text-muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.acmty-row-val{font-size:12.5px;font-weight:800;flex-shrink:0;font-variant-numeric:tabular-nums}',
    '.acmty-row-unit{font-size:9px;font-weight:600;color:var(--text-muted);margin-left:2px}',
    '.acmty-empty{padding:16px 12px;text-align:center;color:var(--text-muted);font-size:11.5px}',
    '/* Tip */',
    '.acmty-tip{display:flex;gap:10px;align-items:flex-start;padding:12px 13px;background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(6,182,212,.08));border:1px solid rgba(245,158,11,.2);border-radius:12px;font-size:11.5px;line-height:1.5;color:var(--text-primary);margin-top:4px}',
    '.acmty-tip b{font-weight:800;color:var(--text-primary)}'
  ].join('\n');
  document.head.appendChild(s);
}
