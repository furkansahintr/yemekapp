/* ═══════════════════════════════════════════════════════════
   BIZ BRANCH ACHIEVEMENTS — İşletme Başarıları ve Koleksiyonları
   4 kategori · 12 rozet · kazanıldı/kilitli durumu + dinamik istatistikler
   ═══════════════════════════════════════════════════════════ */

var _bba = { branchId: null, detailId: null };

function openBizBranchAchievements(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  _bba.branchId = branchId;
  _bbaInjectStyles();
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  var title = 'Başarılar · ' + (branch ? branch.name : 'Şube');
  var overlay = createBizOverlay('bizBranchAchievementsOverlay', title, _bbaRenderBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _bbaBadge(id) {
  for (var i = 0; i < BIZ_BRANCH_BADGES_CATALOG.length; i++) {
    if (BIZ_BRANCH_BADGES_CATALOG[i].id === id) return BIZ_BRANCH_BADGES_CATALOG[i];
  }
  return null;
}
function _bbaIsEarned(id) {
  return bizBranchBadgeState(_bba.branchId).earnedIds.indexOf(id) > -1;
}
function _bbaTierColor(tier) {
  return tier === 'bronze' ? '#CD7F32'
    : tier === 'silver' ? '#C0C0C0'
    : tier === 'gold' ? '#F59E0B'
    : tier === 'diamond' ? '#3FCFF6'
    : tier === 'prestige' ? '#8B5CF6'
    : '#6B7280';
}
function _bbaTierGradient(tier) {
  return tier === 'bronze' ? 'linear-gradient(135deg,#CD7F32,#A0522D)'
    : tier === 'silver' ? 'linear-gradient(135deg,#E5E7EB,#9CA3AF)'
    : tier === 'gold' ? 'linear-gradient(135deg,#FCD34D,#F59E0B)'
    : tier === 'diamond' ? 'linear-gradient(135deg,#A7F3FF,#3FCFF6 60%,#0EA5E9)'
    : tier === 'prestige' ? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
    : 'linear-gradient(135deg,#9CA3AF,#6B7280)';
}
function _bbaTierLabel(tier) {
  return tier === 'bronze' ? 'BRONZ'
    : tier === 'silver' ? 'GÜMÜŞ'
    : tier === 'gold' ? 'ALTIN'
    : tier === 'diamond' ? 'ELMAS'
    : tier === 'prestige' ? 'PRESTİJ'
    : '—';
}

/* ─ Render body ─ */
function _bbaRenderBody() {
  var state = bizBranchBadgeState(_bba.branchId);
  var earnedCount = state.earnedIds.length;
  var totalCount = BIZ_BRANCH_BADGES_CATALOG.length;

  // En son kazanılan rozet bildirimi (dev tebrik)
  var winBanner = '';
  if (state.lastEarnedId) {
    var last = _bbaBadge(state.lastEarnedId);
    if (last) {
      var when = new Date(state.lastEarnedAt);
      var daysAgo = Math.floor((Date.now() - when.getTime()) / 86400000);
      var whenTxt = daysAgo === 0 ? 'bugün' : daysAgo === 1 ? 'dün' : daysAgo + ' gün önce';
      winBanner = '<div class="bba-win">'
        + '<div class="bba-win-ico" style="background:' + _bbaTierGradient(last.tier) + '"><iconify-icon icon="' + last.icon + '" style="font-size:22px;color:#fff"></iconify-icon></div>'
        + '<div class="bba-win-text">'
        +   '<div class="bba-win-title">🎉 Tebrikler! "' + last.label + '" rozetini kazandınız.</div>'
        +   '<div class="bba-win-sub">Kusursuz hizmetiniz sayesinde profiliniz artık daha fazla kullanıcıya öneriliyor · <b>' + whenTxt + '</b></div>'
        + '</div>'
        + '</div>';
    }
  }

  // Hero özet
  var hero = '<div class="bba-hero">'
    + '<div class="bba-hero-num">' + earnedCount + '<span>/' + totalCount + '</span></div>'
    + '<div class="bba-hero-sub">aktif rozet</div>'
    + '<div class="bba-hero-progress"><div class="bba-hero-fill" style="width:' + Math.round(earnedCount / totalCount * 100) + '%"></div></div>'
    + '</div>';

  // Rozet kaybı uyarısı
  var lossInfo = '<div class="bba-info"><iconify-icon icon="solar:refresh-circle-bold" style="font-size:16px;color:#F59E0B;flex-shrink:0"></iconify-icon><span><b>Dinamik rozetler</b> — puanınız düştüğünde veya kriter kaybolduğunda rozet otomatik kaldırılır. Düzenli kaliteyi koruyarak rozetlerinizi üstünüzde tutun.</span></div>';

  // Kategori bölümleri
  var sections = '';
  for (var i = 0; i < BIZ_BRANCH_BADGE_CATEGORIES.length; i++) {
    var cat = BIZ_BRANCH_BADGE_CATEGORIES[i];
    var badges = BIZ_BRANCH_BADGES_CATALOG.filter(function(b){ return b.category === cat.id; });
    var catEarned = badges.filter(function(b){ return _bbaIsEarned(b.id); }).length;

    sections += '<div class="bba-cat">'
      + '<div class="bba-cat-head">'
      +   '<div class="bba-cat-ico" style="background:' + cat.color + '18;color:' + cat.color + '"><iconify-icon icon="' + cat.icon + '" style="font-size:18px"></iconify-icon></div>'
      +   '<div style="flex:1">'
      +     '<div class="bba-cat-lbl">' + cat.label + '</div>'
      +     '<div class="bba-cat-sub">' + cat.sub + '</div>'
      +   '</div>'
      +   '<div class="bba-cat-count">' + catEarned + '/' + badges.length + '</div>'
      + '</div>'
      + '<div class="bba-grid">';
    for (var j = 0; j < badges.length; j++) sections += _bbaCard(badges[j]);
    sections += '</div></div>';
  }

  return '<div class="bba-wrap">' + winBanner + hero + lossInfo + sections + '</div>';
}

function _bbaCard(b) {
  var earned = _bbaIsEarned(b.id);
  var grad = _bbaTierGradient(b.tier);
  var color = _bbaTierColor(b.tier);
  var dynamicChip = b.id === 'reliable_biz' ? '<span class="bba-dyn-chip">DİNAMİK</span>' : '';
  return '<div class="bba-card' + (earned ? ' earned' : ' locked') + '" onclick="_bbaOpenDetail(\'' + b.id + '\')">'
    + '<div class="bba-card-ico" style="background:' + (earned ? grad : 'var(--bg-btn)') + '">'
    +   '<iconify-icon icon="' + b.icon + '" style="font-size:24px;color:' + (earned ? '#fff' : '#9CA3AF') + '"></iconify-icon>'
    +   (earned ? '<span class="bba-check"><iconify-icon icon="solar:check-circle-bold" style="font-size:13px;color:#fff"></iconify-icon></span>' : '<span class="bba-lock"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:12px;color:var(--text-muted)"></iconify-icon></span>')
    + '</div>'
    + '<div class="bba-card-text">'
    +   '<div class="bba-card-name" style="color:' + (earned ? color : 'var(--text-secondary)') + '">' + b.label + '</div>'
    +   '<div class="bba-card-short">' + b.short + '</div>'
    + '</div>'
    + dynamicChip
    + '</div>';
}

/* ─ Detail modal ─ */
function _bbaOpenDetail(id) {
  _bbaCloseDetail();
  var b = _bbaBadge(id);
  if (!b) return;
  _bba.detailId = id;

  var earned = _bbaIsEarned(id);
  var state = bizBranchBadgeState(_bba.branchId);
  var st = state.stats || {};
  var grad = earned ? _bbaTierGradient(b.tier) : 'linear-gradient(135deg,#64748B,#475569)';
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'bbaDetailModal';
  m.className = 'bba-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _bbaCloseDetail(); };

  // Kritere göre mevcut durum satırları
  var metrics = _bbaDetailMetrics(b, st);

  m.innerHTML = '<div class="bba-modal">'
    + '<div class="bba-detail-head" style="background:' + grad + '">'
    +   '<div class="bba-close" onclick="_bbaCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px;color:#fff"></iconify-icon></div>'
    +   '<div class="bba-detail-ico' + (earned ? ' is-earned' : '') + '">'
    +     '<iconify-icon icon="' + b.icon + '" style="font-size:44px;color:#fff"></iconify-icon>'
    +     (!earned ? '<div class="bba-big-lock"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:18px;color:#fff"></iconify-icon></div>' : '')
    +   '</div>'
    +   '<div class="bba-detail-tier">' + _bbaTierLabel(b.tier) + '</div>'
    +   '<div class="bba-detail-title">' + b.label + '</div>'
    +   '<div class="bba-detail-status">' + (earned ? '✓ Kazanıldı' : 'Kilitli') + '</div>'
    + '</div>'
    + '<div class="bba-detail-body">'
    +   '<div class="bba-detail-desc">' + b.desc + '</div>'
    +   '<div class="bba-detail-rule"><iconify-icon icon="solar:target-bold" style="font-size:13px;color:var(--primary)"></iconify-icon><span><b>Kural:</b> ' + b.rule + '</span></div>'
    +   (metrics ? '<div class="bba-section-lbl">Mevcut Durum</div><div class="bba-metric-list">' + metrics + '</div>' : '')
    +   (b.id === 'reliable_biz' ? '<div class="bba-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:15px;color:#EF4444"></iconify-icon><span><b>Dikkat:</b> 2 üst üste işletme iptali rozeti anında düşürür.</span></div>' : '')
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _bbaDetailMetrics(b, st) {
  function row(lbl, val, ok) {
    return '<div class="bba-metric-row"><span class="bba-metric-lbl">' + lbl + '</span><span class="bba-metric-val' + (ok === true ? ' ok' : ok === false ? ' bad' : '') + '">' + val + '</span></div>';
  }
  if (b.id === 'customer_fav')    return row('Genel puan', st.generalRating || '—', (st.generalRating || 0) >= 4.5) + row('Min. ürün puanı', st.minItemRating || '—', (st.minItemRating || 0) >= 4.0);
  if (b.id === 'flawless_taste')  return row('Min. ürün puanı', st.minItemRating || '—', (st.minItemRating || 0) >= 4.5);
  if (b.id === 'gourmet_pick')    return row('Genel puan', st.generalRating || '—', (st.generalRating || 0) >= 4.9) + row('Min. ürün puanı', st.minItemRating || '—', (st.minItemRating || 0) >= 4.8);
  if (b.id === 'week_star')       return row('Son 7 gün min. puan', st.weekMinOrderRating || '—', (st.weekMinOrderRating || 0) >= 4);
  if (b.id === 'vegan_friendly')  return row('Vegan ürün oranı', '%' + (st.veganPercent || 0), (st.veganPercent || 0) >= 50);
  if (b.id === 'veggie_friendly') return row('Vejetaryen oranı', '%' + (st.vegetarianPercent || 0), (st.vegetarianPercent || 0) >= 50);
  if (b.id === 'mom_style')       return row('Ev yapımı / dondurulmuş yok', st.homemade ? 'Evet' : 'Hayır', !!st.homemade);
  if (b.id === 'caring_biz')      return row('Yorum yanıt oranı', '%' + Math.round((st.replyRate || 0) * 100), (st.replyRate || 0) >= 0.9);
  if (b.id === 'super_support')   return row('İlk 24sa yanıt oranı', '%' + Math.round((st.fastReplyRate24h || 0) * 100), (st.fastReplyRate24h || 0) >= 0.9);
  if (b.id === 'order_champion')  return row('Haftalık sipariş sırası', '#' + (st.weeklyOrderRank || '—'), (st.weeklyOrderRank || 999) <= 100);
  if (b.id === 'low_cancel_user') return row('Kullanıcı iptal oranı', '%' + ((st.userCancelRate || 0) * 100).toFixed(2), (st.userCancelRate || 1) <= 0.01);
  if (b.id === 'reliable_biz')    return row('İşletme iptal oranı', '%' + ((st.bizCancelRate || 0) * 100).toFixed(2), (st.bizCancelRate || 1) <= 0.01);
  return '';
}

function _bbaCloseDetail() {
  var m = document.getElementById('bbaDetailModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
  _bba.detailId = null;
}

/* ─ Styles ─ */
function _bbaInjectStyles() {
  if (document.getElementById('bbaStyles')) return;
  var s = document.createElement('style');
  s.id = 'bbaStyles';
  s.textContent = [
    '.bba-wrap{display:flex;flex-direction:column;gap:14px;padding-bottom:20px}',
    '/* Win banner */',
    '.bba-win{display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-xl);background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.06));border:1.5px solid rgba(139,92,246,0.3);box-shadow:0 4px 14px rgba(139,92,246,.12);animation:bbaWinIn .4s ease}',
    '@keyframes bbaWinIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
    '.bba-win-ico{width:44px;height:44px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 10px rgba(0,0,0,.15)}',
    '.bba-win-text{flex:1;min-width:0}',
    '.bba-win-title{font:var(--fw-bold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);margin-bottom:4px}',
    '.bba-win-sub{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}',
    '.bba-win-sub b{font-weight:700;color:var(--text-primary)}',
    '/* Hero özet */',
    '.bba-hero{text-align:center;padding:14px 16px;background:linear-gradient(135deg,rgba(245,158,11,0.08),var(--bg-phone));border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm)}',
    '.bba-hero-num{font:var(--fw-bold) 34px/1 var(--font);color:var(--text-primary)}',
    '.bba-hero-num span{font-size:18px;color:var(--text-muted);font-weight:500}',
    '.bba-hero-sub{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-top:4px;letter-spacing:.4px;text-transform:uppercase}',
    '.bba-hero-progress{margin-top:12px;height:6px;background:var(--bg-btn);border-radius:var(--r-full);overflow:hidden}',
    '.bba-hero-fill{height:100%;background:linear-gradient(90deg,#F59E0B,#EC4899);border-radius:var(--r-full);transition:width .4s ease}',
    '/* Info */',
    '.bba-info{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:var(--r-lg);font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary)}',
    '.bba-info b{color:var(--text-primary);font-weight:700}',
    '/* Category */',
    '.bba-cat{display:flex;flex-direction:column;gap:10px;margin-top:4px}',
    '.bba-cat-head{display:flex;align-items:center;gap:10px}',
    '.bba-cat-ico{width:34px;height:34px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.bba-cat-lbl{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.bba-cat-sub{font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.bba-cat-count{padding:3px 9px;border-radius:var(--r-full);background:var(--bg-btn);font:var(--fw-bold) 10.5px/1.4 var(--font);color:var(--text-secondary)}',
    '/* Grid */',
    '.bba-grid{display:grid;grid-template-columns:1fr;gap:8px}',
    '.bba-card{position:relative;display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-xl);background:var(--bg-phone);box-shadow:var(--shadow-sm);cursor:pointer;transition:all .15s}',
    '.bba-card:hover{transform:translateY(-1px);box-shadow:var(--shadow-md)}',
    '.bba-card.locked{opacity:.72}',
    '.bba-card-ico{position:relative;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.bba-check{position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#22C55E;border:2px solid var(--bg-phone);display:flex;align-items:center;justify-content:center}',
    '.bba-lock{position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:var(--bg-btn);border:2px solid var(--bg-phone);display:flex;align-items:center;justify-content:center}',
    '.bba-card-text{flex:1;min-width:0}',
    '.bba-card-name{font:var(--fw-bold) 13px/1.2 var(--font);margin-bottom:3px}',
    '.bba-card-short{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}',
    '.bba-dyn-chip{position:absolute;top:8px;right:8px;padding:2px 7px;border-radius:var(--r-full);background:rgba(239,68,68,.12);color:#DC2626;font:var(--fw-bold) 8.5px/1.4 var(--font);letter-spacing:.4px}',
    '/* Detail modal */',
    '.bba-modal-backdrop{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding:0;opacity:0;transition:opacity .2s}',
    '.bba-modal-backdrop.open{opacity:1}',
    '.bba-modal{width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(24px);transition:transform .28s ease;max-height:90vh;display:flex;flex-direction:column}',
    '.bba-modal-backdrop.open .bba-modal{transform:translateY(0)}',
    '.bba-detail-head{padding:22px 18px 20px;text-align:center;position:relative;color:#fff}',
    '.bba-close{position:absolute;top:12px;right:12px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.bba-detail-ico{position:relative;width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.35);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}',
    '.bba-detail-ico.is-earned{animation:bbaPulse 1.8s ease-in-out infinite}',
    '@keyframes bbaPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.4)}50%{box-shadow:0 0 0 12px rgba(255,255,255,0)}}',
    '.bba-big-lock{position:absolute;bottom:-4px;right:-4px;width:30px;height:30px;border-radius:50%;background:#374151;border:2px solid #fff;display:flex;align-items:center;justify-content:center}',
    '.bba-detail-tier{font:var(--fw-bold) 10px/1 var(--font);letter-spacing:.8px;opacity:.92;margin-bottom:6px}',
    '.bba-detail-title{font:var(--fw-bold) 18px/1.2 var(--font)}',
    '.bba-detail-status{display:inline-block;margin-top:10px;padding:4px 12px;border-radius:var(--r-full);background:rgba(0,0,0,.28);font:var(--fw-bold) 10px/1.4 var(--font);letter-spacing:.4px}',
    '.bba-detail-body{padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}',
    '.bba-detail-desc{font:var(--fw-regular) 13px/1.5 var(--font);color:var(--text-secondary)}',
    '.bba-detail-rule{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--r-lg);font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-primary)}',
    '.bba-section-lbl{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;padding-left:2px}',
    '.bba-metric-list{display:flex;flex-direction:column;gap:6px}',
    '.bba-metric-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)}',
    '.bba-metric-lbl{font:var(--fw-medium) 12px/1 var(--font);color:var(--text-secondary)}',
    '.bba-metric-val{font:var(--fw-bold) 12px/1 var(--font);color:var(--text-primary)}',
    '.bba-metric-val.ok{color:#16A34A}',
    '.bba-metric-val.bad{color:#DC2626}',
    '.bba-warn{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);border-radius:var(--r-lg);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.bba-warn b{color:#DC2626;font-weight:700}'
  ].join('\n');
  document.head.appendChild(s);
}
