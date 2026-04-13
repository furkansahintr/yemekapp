/* ═══ BIZ MY BUSINESS COMPONENT ═══ */

function renderBizMyBusiness() {
  const container = document.getElementById('bizMyBusinessContainer');
  if (!container) return;

  const biz = BIZ_BUSINESS;
  const branches = BIZ_BRANCHES;
  const staff = BIZ_STAFF;
  const rolePerms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];

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
        <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Şubelerim</div>
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
                <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">${branchTables.length} masa · ${branchStaff.length} personel</span>
              </div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>`;
        }).join('')}
      </div>

      <!-- Abonelik -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">Abonelik & Plan</div>
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:16px;display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center">
            <iconify-icon icon="solar:crown-bold" style="font-size:22px;color:#A855F7"></iconify-icon>
          </div>
          <div style="flex:1">
            <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Premium Plan</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Sınırsız şube · Tüm özellikler</div>
          </div>
          <div style="padding:6px 12px;border-radius:var(--r-full);background:#A855F7;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#fff">Aktif</div>
        </div>
      </div>

      <!-- Ayarlar -->
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;padding:4px 0">Ayarlar</div>
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        ${bizSettingsItem('solar:bell-linear', 'Bildirim Ayarları', '', '')}
        ${bizSettingsItem('solar:link-circle-linear', 'Entegrasyonlar', 'POS, muhasebe, kargo', '')}
        ${bizCurrentRole === 'owner' ? bizSettingsItem('solar:lock-password-linear', 'Güvenlik', 'Şifre & iki adımlı doğrulama', '') : ''}
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

