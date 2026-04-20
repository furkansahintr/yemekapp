/* ═══ BIZ MY BUSINESS COMPONENT ═══ */

function renderBizMyBusiness() {
  const container = document.getElementById('bizMyBusinessContainer');
  if (!container) return;

  const biz = BIZ_BUSINESS;
  const staff = BIZ_STAFF;
  const rolePerms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];

  // Şube müdürü yalnızca atandığı şubeyi görebilir — diğer roller için tüm şubeler.
  const isManager = bizCurrentRole === 'manager';
  const branches = isManager
    ? BIZ_BRANCHES.filter(b => b.id === bizActiveBranch)
    : BIZ_BRANCHES;
  const branchesLabel = isManager ? 'Şubem' : 'Şubelerim';

  container.innerHTML = `
    <div style="padding:max(env(safe-area-inset-top),48px) var(--app-px) var(--app-px);display:flex;flex-direction:column;gap:16px">

      <!-- Business Profile Card -->
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);flex-shrink:0;display:flex;align-items:center;justify-content:center">
          <iconify-icon icon="solar:shop-bold" style="font-size:28px;color:#fff"></iconify-icon>
        </div>
        <div style="flex:1">
          <div style="font:var(--fw-bold) var(--fs-xl)/1.2 var(--font);color:var(--text-primary)">${escHtml(biz.name)}</div>
          <div style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(biz.cuisine)}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#A855F7;background:rgba(168,85,247,0.1);padding:3px 8px;border-radius:var(--r-full)">Premium</span>
            ${bizCurrentRole !== 'owner' ? `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:${rolePerms?.color || '#666'};background:${rolePerms?.color || '#666'}12;padding:3px 8px;border-radius:var(--r-full)">${rolePerms?.label || bizCurrentRole}</span>` : ''}
          </div>
        </div>
        ${bizCurrentRole === 'owner' ? `<div class="g-pill" style="padding:8px 14px;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer" onclick="openBizProfileEdit()">Düzenle</div>` : ''}
      </div>

      <!-- İşletme Bilgileri -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">İşletme Bilgileri</div>
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle)">
          <iconify-icon icon="solar:phone-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Telefon</div>
            <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:2px">${biz.owner.phone}</div>
          </div>
        </div>
        <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle)">
          <iconify-icon icon="solar:letter-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">E-posta</div>
            <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:2px">${biz.owner.email}</div>
          </div>
        </div>
        <div style="padding:14px 16px;display:flex;align-items:center;gap:12px">
          <iconify-icon icon="solar:document-text-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Vergi No</div>
            <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:2px">${biz.taxId}</div>
          </div>
        </div>
      </div>

      <!-- Şubelerim -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0">
        <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${branchesLabel}</div>
        ${bizCurrentRole === 'owner' ? `<div onclick="openBizAddBranch()" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon> Şube Ekle</div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${branches.map(b => {
          const branchStaff = staff.filter(s => s.branchId === b.id);
          const branchTables = (typeof BIZ_TABLES !== 'undefined') ? BIZ_TABLES.filter(t => t.branchId === b.id) : [];
          return `
          <div onclick="openBizBranchDetail('${b.id}')" style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <iconify-icon icon="solar:shop-2-bold" style="font-size:22px;color:${b.status === 'open' ? '#22c55e' : '#ef4444'}"></iconify-icon>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(b.name)}</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(b.address)}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
                <span style="font:var(--fw-medium) 10px/1 var(--font);color:${b.status === 'open' ? '#22c55e' : '#ef4444'};background:${b.status === 'open' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'};padding:3px 8px;border-radius:var(--r-full)">${b.status === 'open' ? 'Açık' : 'Kapalı'}</span>
                ${(typeof bizReservationSettings === 'function' && bizReservationSettings(b.id).enabled) ? '<span title="Rezervasyon aktif" style="display:inline-flex;align-items:center;gap:3px;font:var(--fw-medium) 10px/1 var(--font);color:#7C3AED;background:rgba(139,92,246,0.1);padding:3px 8px;border-radius:var(--r-full)"><iconify-icon icon="solar:calendar-mark-bold" style="font-size:11px"></iconify-icon>Rez.</span>' : ''}
                <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">${branchTables.length} masa · ${branchStaff.length} personel</span>
              </div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>`;
        }).join('')}
      </div>

      ${bizCurrentRole !== 'owner' ? `
      <!-- Vardiyam (çalışan görünümü) -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">Benim Çalışma Programım</div>
      <div onclick="openMyShifts()" style="background:linear-gradient(135deg, var(--primary-soft), var(--bg-phone));border-radius:var(--r-xl);border:1px solid var(--primary-soft);box-shadow:var(--shadow-md);padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer">
        <div style="width:44px;height:44px;border-radius:var(--r-lg);background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:calendar-mark-bold" style="font-size:22px;color:#fff"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">Vardiyam</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Çalışma programım, izin durumum ve değişiklikler</div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--primary)"></iconify-icon>
      </div>
      ` : ''}

      <!-- Abonelik -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">Abonelik & Plan</div>
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div onclick="openBizPremiumPlan()" style="padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer">
          <div style="width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center">
            <iconify-icon icon="solar:crown-bold" style="font-size:22px;color:#A855F7"></iconify-icon>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Premium Plan</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${BIZ_BUSINESS.subscription === 'premium' ? 'Sınırsız şube · Tüm özellikler' : 'Temel plan — yükseltmek için dokun'}</div>
          </div>
          ${BIZ_BUSINESS.subscription === 'premium'
            ? `<div style="padding:6px 12px;border-radius:var(--r-full);background:#A855F7;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#fff">Aktif</div>`
            : `<div style="padding:6px 12px;border-radius:var(--r-full);background:var(--bg-btn);border:1px solid var(--border-subtle);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Ücretsiz</div>`}
          <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
        </div>
      </div>

      <!-- Komisyon Oranlarım -->
      ${(function(){
        var _visibleBranches = isManager
          ? BIZ_BRANCHES.filter(function(b){ return b.id === bizActiveBranch; })
          : BIZ_BRANCHES;
        if (!_visibleBranches.length) return '';
        var _cb = _visibleBranches[0];
        var _cr = Number(_cb.rating || 0);
        var _cRate = (typeof _commRate === 'function') ? _commRate(_cr) : '—';
        var _cTier = (typeof _commTier === 'function') ? _commTier(_cr) : { label:'', color:'#666', icon:'solar:star-bold' };
        var _multi = _visibleBranches.length > 1;
        var _onclick = _multi ? '_commOpenBranchPicker()' : 'openBizCommissionSettings(\'' + _cb.id + '\')';
        var _sub = _multi
          ? _visibleBranches.length + ' şube · Şube seçerek komisyon detaylarını görüntüleyin'
          : _cr.toFixed(1) + ' puan · %' + _cRate + ' komisyon · ' + _cb.name;
        return '<div onclick="' + _onclick + '" style="background:linear-gradient(135deg, ' + _cTier.color + '15, var(--bg-phone));border-radius:var(--r-xl);border:1px solid ' + _cTier.color + '44;box-shadow:var(--shadow-md);padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-top:2px">'
          + '<div style="width:44px;height:44px;border-radius:var(--r-lg);background:' + _cTier.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:22px;color:#fff"></iconify-icon>'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
          + '<span style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">Komisyon Oranlarım</span>'
          + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + _cTier.color + ';background:' + _cTier.color + '18;padding:3px 7px;border-radius:var(--r-full)">' + (_multi ? _visibleBranches.length + ' Şube' : _cTier.label) + '</span>'
          + '</div>'
          + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + _sub + '</div>'
          + '</div>'
          + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:' + _cTier.color + '"></iconify-icon>'
          + '</div>';
      })()}

      <!-- Şubeyi Kapat (Komisyon Ayarları altı) -->
      ${(function(){
        var _visibleBranches = isManager
          ? BIZ_BRANCHES.filter(function(b){ return b.id === bizActiveBranch; })
          : BIZ_BRANCHES;
        if (!_visibleBranches.length) return '';
        var _tb = _visibleBranches[0];
        return '<div onclick="openBizBranchDeletePage(\'' + _tb.id + '\')" style="background:linear-gradient(135deg,rgba(239,68,68,.05),var(--bg-phone));border:1px solid rgba(239,68,68,.22);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-top:2px">'
          + '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:rgba(239,68,68,.12);color:#EF4444;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          + '<iconify-icon icon="solar:shop-minus-bold" style="font-size:22px"></iconify-icon>'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:#DC2626">Bu Şubeyi Kalıcı Olarak Sil</div>'
          + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Menü, personel ve saatler yayından kalkar · 30 gün geri alma</div>'
          + '</div>'
          + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:#EF4444"></iconify-icon>'
          + '</div>';
      })()}

      <!-- Cüzdanım -->
      ${(typeof _wltPreviewTileHtml === 'function') ? _wltPreviewTileHtml() : ''}

      <!-- Ayarlar -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">Ayarlar</div>
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        ${bizSettingsItem('solar:bell-linear', 'Bildirim Ayarları', '', '')}
        ${bizSettingsItem('solar:link-circle-linear', 'Entegrasyonlar', 'POS, muhasebe, kargo', '')}
        ${bizCurrentRole === 'owner' ? bizSettingsItem('solar:lock-password-linear', 'Güvenlik', 'Şifre & iki adımlı doğrulama', '') : ''}
        ${bizCurrentRole === 'owner' ? `
        <div onclick="openBizBusinessDeletePage()" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;background:linear-gradient(90deg,rgba(239,68,68,.04),transparent)">
          <iconify-icon icon="solar:shield-cross-bold" style="font-size:20px;color:#EF4444"></iconify-icon>
          <div style="flex:1">
            <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#DC2626">İşletme Hesabını ve Tüm Şubeleri Sil</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Tam veda · 3 aşamalı güvenlik · 30 gün geri alma</div>
          </div>
          <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:#EF4444"></iconify-icon>
        </div>
        ` : ''}
        <div style="padding:14px 16px;display:flex;align-items:center;gap:12px">
          <iconify-icon icon="solar:moon-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
          <span style="flex:1;font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Koyu Tema</span>
          <div onclick="toggleTheme()" style="width:44px;height:24px;border-radius:12px;background:var(--bg-btn);border:1px solid var(--border-subtle);position:relative;cursor:pointer;transition:background .2s" id="bizThemeSwitch">
            <div style="width:18px;height:18px;border-radius:50%;background:var(--text-muted);position:absolute;top:2px;left:2px;transition:transform .2s" id="bizThemeDot"></div>
          </div>
        </div>
      </div>

      <!-- Return to Personal Account -->
      ${bizCurrentEmployment ? `
      <div onclick="returnToUserAccount()" style="background:var(--primary-soft);border:1px solid var(--primary);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:user-circle-bold" style="font-size:20px;color:#fff"></iconify-icon>
        </div>
        <div style="flex:1">
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--primary)">Kişisel Hesaba Dön</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Furkan — Kullanıcı hesabına geç</div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--primary)"></iconify-icon>
      </div>
      ` : ''}

      <!-- Version & Logout -->
      <div style="text-align:center;padding:16px 0">
        <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);margin-bottom:16px">YemekApp İşletme v1.0.0</div>
        <button onclick="AUTH.logout()" style="background:none;border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px 32px;font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#EF4444;cursor:pointer;width:100%">Çıkış Yap</button>
      </div>
    </div>
  `;
}

function bizSettingsItem(icon, title, subtitle, onclick) {
  return `<div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" ${onclick ? 'onclick="' + onclick + '"' : ''}>
    <iconify-icon icon="${icon}" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
    <div style="flex:1">
      <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${title}</div>
      ${subtitle ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${subtitle}</div>` : ''}
    </div>
    <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
  </div>`;
}


/* ═══ PREMIUM PLAN DETAIL OVERLAY ═══ */
const BIZ_PREMIUM_PRICE_TRY = 499;
const BIZ_PREMIUM_BENEFITS = [
  { icon: 'solar:buildings-2-bold',            color: '#6366F1', title: 'Sınırsız Şube',          desc: 'İstediğiniz kadar şube ekleyin, tek panelden yönetin.' },
  { icon: 'solar:chart-2-bold',                color: '#22C55E', title: 'Gelişmiş Raporlar',      desc: 'Ciro, ürün ve personel raporları detaylı analiz ile.' },
  { icon: 'solar:magic-stick-3-bold',          color: '#A855F7', title: 'AI Asistan (Sınırsız)',  desc: 'Menü önerisi, fiyatlama, rapor özeti için yapay zeka.' },
  { icon: 'solar:users-group-two-rounded-bold', color: '#EC4899', title: 'Sınırsız Personel',     desc: 'Rol bazlı izinlerle sınırsız kullanıcı ekleyin.' },
  { icon: 'solar:bell-bing-bold',              color: '#F59E0B', title: 'Öncelikli Destek',       desc: '7/24 öncelikli müşteri desteği ve canlı yardım.' },
  { icon: 'solar:shield-check-bold',           color: '#14B8A6', title: 'Gelişmiş Güvenlik',      desc: 'İki adımlı doğrulama, denetim logu ve yedekleme.' },
  { icon: 'solar:calendar-mark-bold',          color: '#3B82F6', title: 'Rezervasyon Yönetimi',   desc: 'Masa bazlı rezervasyon, hatırlatma ve çakışma kontrolü.' },
  { icon: 'solar:link-circle-bold',            color: '#8B5CF6', title: 'Entegrasyonlar',         desc: 'POS, muhasebe, kargo ve teslimat platformlarıyla bağlantı.' }
];

function openBizPremiumPlan() {
  const isOwner = (typeof bizCurrentRole !== 'undefined') && bizCurrentRole === 'owner';
  const active = BIZ_BUSINESS.subscription === 'premium';

  const benefitsHtml = BIZ_PREMIUM_BENEFITS.map(b => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)">
      <div style="width:36px;height:36px;border-radius:var(--r-md);background:${b.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <iconify-icon icon="${b.icon}" style="font-size:20px;color:${b.color}"></iconify-icon>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${b.title}</div>
        <div style="font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-muted);margin-top:3px">${b.desc}</div>
      </div>
      <iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:#22C55E;flex-shrink:0;margin-top:8px"></iconify-icon>
    </div>`).join('');

  const heroBg = 'background:linear-gradient(135deg,#A855F7 0%,#6366F1 100%);color:#fff';
  const content = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Hero -->
      <div style="${heroBg};border-radius:var(--r-xl);padding:20px;position:relative;overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <iconify-icon icon="solar:crown-bold" style="font-size:26px"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font)">Premium Plan</span>
          ${active ? `<span style="margin-left:auto;padding:4px 10px;border-radius:var(--r-full);background:rgba(255,255,255,0.25);font:var(--fw-semibold) 11px/1 var(--font)">AKTİF</span>` : ''}
        </div>
        <div style="display:flex;align-items:baseline;gap:6px">
          <span style="font:var(--fw-bold) 32px/1 var(--font)">${BIZ_PREMIUM_PRICE_TRY} ₺</span>
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);opacity:0.85">/ ay</span>
        </div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);margin-top:6px;opacity:0.9">KDV dahil · İstediğiniz zaman iptal edebilirsiniz.</div>
      </div>

      <!-- Benefits -->
      <div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Premium ile Kazandıklarınız</div>
        <div style="display:flex;flex-direction:column;gap:8px">${benefitsHtml}</div>
      </div>

      ${!isOwner ? `
      <div style="background:#F59E0B15;border:1px solid #F59E0B66;border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;gap:10px">
        <iconify-icon icon="solar:shield-warning-bold" style="font-size:20px;color:#F59E0B;flex-shrink:0"></iconify-icon>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">Premium plana dahil olma ve iptal etme işlemleri yalnızca işletme sahibi tarafından yapılabilir.</div>
      </div>` : ''}

      ${isOwner ? (active ? `
        <button onclick="bizCancelPremiumConfirm()" style="width:100%;padding:14px;border:1px solid #EF4444;border-radius:var(--r-lg);background:transparent;color:#EF4444;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px">
          <iconify-icon icon="solar:close-circle-linear" style="font-size:18px"></iconify-icon> Premium'u İptal Et
        </button>
      ` : `
        <button onclick="bizSubscribePremium()" style="width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#A855F7 0%,#6366F1 100%);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:var(--shadow-md)">
          <iconify-icon icon="solar:crown-bold" style="font-size:18px"></iconify-icon> Premium'a Dahil Ol — ${BIZ_PREMIUM_PRICE_TRY} ₺ / ay
        </button>
      `) : ''}
    </div>
  `;

  const overlay = createBizOverlay('bizPremiumOverlay', 'Premium Plan', content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function bizCancelPremiumConfirm() {
  if ((typeof bizCurrentRole === 'undefined') || bizCurrentRole !== 'owner') {
    alert('Bu işlem yalnızca işletme sahibi tarafından yapılabilir.');
    return;
  }
  const existing = document.getElementById('bizPremiumConfirmModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'bizPremiumConfirmModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:90;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div style="width:100%;max-width:360px;background:var(--bg-page);border-radius:var(--r-xl);padding:20px;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:44px;height:44px;border-radius:50%;background:#EF444422;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:shield-warning-bold" style="font-size:24px;color:#EF4444"></iconify-icon>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Premium'u İptal Et</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Bu işlem hemen etkili olur.</div>
        </div>
      </div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">
        Bu ayrıcalıklardan yararlanmamak istediğinizden emin misiniz? Sınırsız şube, gelişmiş raporlar, AI asistan ve diğer Premium özellikler erişilemez olacak.
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="document.getElementById('bizPremiumConfirmModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>
        <button onclick="bizCancelPremium()" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);background:#EF4444;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Evet, İptal Et</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function bizCancelPremium() {
  if ((typeof bizCurrentRole === 'undefined') || bizCurrentRole !== 'owner') return;
  BIZ_BUSINESS.subscription = 'free';
  document.getElementById('bizPremiumConfirmModal')?.remove();
  document.getElementById('bizPremiumOverlay')?.remove();
  if (typeof renderBizMyBusiness === 'function') renderBizMyBusiness();
  alert('Premium aboneliğiniz iptal edildi.');
}

function bizSubscribePremium() {
  if ((typeof bizCurrentRole === 'undefined') || bizCurrentRole !== 'owner') {
    alert('Bu işlem yalnızca işletme sahibi tarafından yapılabilir.');
    return;
  }
  BIZ_BUSINESS.subscription = 'premium';
  document.getElementById('bizPremiumOverlay')?.remove();
  if (typeof renderBizMyBusiness === 'function') renderBizMyBusiness();
  alert('Premium plan etkinleştirildi.');
}
