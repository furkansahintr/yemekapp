/* ═══ BIZ RESERVATIONS COMPONENT ═══ */

/* Data helpers ─────────────────────────────────────────── */
function _bizBranchReservations(branchId) {
  return (typeof BIZ_RESERVATIONS !== 'undefined' ? BIZ_RESERVATIONS : [])
    .filter(r => r.branchId === branchId)
    .sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt));
}

function _bizTableReservations(tableId) {
  const now = new Date();
  return (typeof BIZ_RESERVATIONS !== 'undefined' ? BIZ_RESERVATIONS : [])
    .filter(r => r.tableId === tableId && r.status !== 'cancelled')
    .sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt))
    .filter(r => new Date(r.reservedAt) >= new Date(now.getTime() - 2 * 60 * 60 * 1000));
}

function _bizCanManageReservations() {
  return ['owner', 'manager', 'coordinator', 'waiter', 'cashier'].includes(bizCurrentRole);
}

function _bizReservedByLabel() {
  // Returns { id, name } representing the current reserver for auditing
  if (bizCurrentEmployment) {
    return { id: bizCurrentEmployment.id, name: bizCurrentEmployment.name || BIZ_ROLE_LABELS[bizCurrentRole] };
  }
  const me = (typeof BIZ_STAFF !== 'undefined' ? BIZ_STAFF : []).find(s => s.role === bizCurrentRole && s.branchId === bizActiveBranch);
  if (me) return { id: me.id, name: me.name };
  return { id: 'current_user', name: (AUTH && AUTH.user && AUTH.user.name) || BIZ_ROLE_LABELS[bizCurrentRole] || 'Kullanıcı' };
}

function _bizFormatReservationDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', weekday: 'short' });
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

/* Main screen ──────────────────────────────────────────── */
function openBizReservations() {
  if (!bizRoleGuard('reservations')) return;
  const overlay = createBizOverlay('bizReservationsOverlay', 'Rezervasyonlar', renderBizReservationsContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function renderBizReservationsContent() {
  const tables = getBranchTables();
  let zones = BIZ_TABLE_ZONES.filter(z => z.branchId === bizActiveBranch).sort((a, b) => a.order - b.order);
  if (bizCurrentRole === 'waiter') {
    const zoneIds = (typeof getWaiterAssignedZoneIds === 'function') ? getWaiterAssignedZoneIds() : [];
    if (zoneIds.length) zones = zones.filter(z => zoneIds.includes(z.id));
  }
  const allRes = _bizBranchReservations(bizActiveBranch);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toDateString();
  const todayRes = allRes.filter(r => new Date(r.reservedAt).toDateString() === todayStr);
  const upcomingRes = allRes.filter(r => new Date(r.reservedAt) >= today);

  const summary = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div style="background:var(--glass-card);border-radius:var(--r-lg);padding:12px;text-align:center">
        <div style="font:var(--fw-bold) 20px/1 var(--font);color:#14B8A6">${todayRes.length}</div>
        <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px">Bugün</div>
      </div>
      <div style="background:var(--glass-card);border-radius:var(--r-lg);padding:12px;text-align:center">
        <div style="font:var(--fw-bold) 20px/1 var(--font);color:#3B82F6">${upcomingRes.length}</div>
        <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px">Yaklaşan</div>
      </div>
      <div style="background:var(--glass-card);border-radius:var(--r-lg);padding:12px;text-align:center">
        <div style="font:var(--fw-bold) 20px/1 var(--font);color:#8B5CF6">${allRes.length}</div>
        <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px">Toplam</div>
      </div>
    </div>
    <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:14px">
      Rezervasyon oluşturmak için bir masaya dokunun.
    </div>
  `;

  const zonesHtml = zones.map(zone => {
    const zoneTables = tables.filter(t => t.zoneId === zone.id);
    if (!zoneTables.length) return '';
    const cards = zoneTables.map(t => {
      const res = _bizTableReservations(t.id);
      const next = res[0];
      const badgeColor = next ? '#14B8A6' : '#94A3B8';
      const badgeBg = next ? 'rgba(20,184,166,0.12)' : 'rgba(148,163,184,0.12)';
      return `
        <div onclick="openBizReserveTable('${t.id}')" style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:8px;min-height:96px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Masa ${t.number}</span>
            <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">${t.capacity} kişilik</span>
          </div>
          <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:var(--r-full);background:${badgeBg};color:${badgeColor};font:var(--fw-medium) 10px/1 var(--font);align-self:flex-start">
            <iconify-icon icon="solar:calendar-mark-bold" style="font-size:10px"></iconify-icon>
            ${res.length} rezervasyon
          </div>
          ${next ? `
          <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary);margin-top:auto">
            ${escHtml(next.customerName)} · ${_bizFormatReservationDateTime(next.reservedAt)}
          </div>` : `
          <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-tertiary);margin-top:auto;font-style:italic">
            Rezervasyon yok
          </div>`}
        </div>
      `;
    }).join('');

    return `
      <div style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:28px;height:28px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;background:${zone.color}15">
            <iconify-icon icon="${zone.icon}" style="font-size:16px;color:${zone.color}"></iconify-icon>
          </div>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(zone.name)}</span>
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${zoneTables.length} masa</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">${cards}</div>
      </div>
    `;
  }).join('');

  return summary + (zonesHtml || `<div style="text-align:center;color:var(--text-muted);padding:40px 0">Bu şubede masa yok</div>`);
}

function _bizRefreshReservationsScreen() {
  const host = document.querySelector('#bizReservationsOverlay > div:last-child');
  if (host) host.innerHTML = renderBizReservationsContent();
}

/* Per-table detail / reserve modal ──────────────────────── */
function openBizReserveTable(tableId) {
  if (!_bizCanManageReservations()) {
    alert('Rezervasyon yönetimi için yetkiniz yok.');
    return;
  }
  const table = (typeof BIZ_TABLES !== 'undefined' ? BIZ_TABLES : []).find(t => t.id === tableId);
  if (!table) return;
  const zone = BIZ_TABLE_ZONES.find(z => z.id === table.zoneId);
  const res = _bizTableReservations(tableId);

  const listHtml = res.length === 0
    ? `<div style="padding:20px;text-align:center;color:var(--text-muted);background:var(--glass-card);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Bu masaya yaklaşan rezervasyon yok.</div>`
    : res.map(r => `
        <div style="background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(r.customerName)}</span>
            <span style="font:var(--fw-medium) 10px/1 var(--font);color:#14B8A6;background:rgba(20,184,166,0.12);padding:3px 8px;border-radius:var(--r-full)">${r.guestCount} kişi</span>
          </div>
          <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--primary)">
            <iconify-icon icon="solar:calendar-mark-bold" style="font-size:12px;vertical-align:-2px"></iconify-icon>
            ${_bizFormatReservationDateTime(r.reservedAt)}
          </div>
          ${r.customerPhone ? `<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-secondary)">${escHtml(r.customerPhone)}</div>` : ''}
          ${r.note ? `<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);background:var(--bg-page);padding:6px 8px;border-radius:var(--r-md)">${escHtml(r.note)}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px">
            <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">
              ${escHtml(r.createdByName || 'Bilinmiyor')} tarafından
            </span>
            <div onclick="bizCancelReservation('${r.id}','${tableId}')" style="font:var(--fw-medium) 11px/1 var(--font);color:#EF4444;cursor:pointer;padding:4px 8px;border-radius:var(--r-md);background:rgba(239,68,68,0.1)">
              İptal Et
            </div>
          </div>
        </div>
      `).join('');

  // Default to next whole hour
  const suggested = new Date();
  suggested.setMinutes(0, 0, 0);
  suggested.setHours(suggested.getHours() + 1);
  const defaultDate = suggested.toISOString().slice(0, 10);
  const defaultTime = suggested.toISOString().slice(11, 16);

  const content = `
    <div style="padding:16px var(--app-px);display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow-y:auto">
      <div style="display:flex;align-items:center;gap:10px;background:var(--glass-card);border-radius:var(--r-lg);padding:12px">
        <div style="width:34px;height:34px;border-radius:var(--r-md);background:${zone ? zone.color + '20' : 'var(--primary-soft)'};display:flex;align-items:center;justify-content:center">
          <iconify-icon icon="${zone ? zone.icon : 'solar:sofa-2-bold'}" style="font-size:18px;color:${zone ? zone.color : 'var(--primary)'}"></iconify-icon>
        </div>
        <div>
          <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Masa ${table.number}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted)">${zone ? escHtml(zone.name) : ''} · ${table.capacity} kişilik</div>
        </div>
      </div>

      <div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Yaklaşan Rezervasyonlar</div>
        <div style="display:flex;flex-direction:column;gap:8px">${listHtml}</div>
      </div>

      <div style="height:1px;background:var(--border-subtle)"></div>

      <div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Yeni Rezervasyon</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <label style="display:flex;flex-direction:column;gap:4px">
            <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Ad Soyad</span>
            <input id="bizResName" type="text" placeholder="Örn. Ahmet Yılmaz" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">
          </label>
          <label style="display:flex;flex-direction:column;gap:4px">
            <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Telefon (opsiyonel)</span>
            <input id="bizResPhone" type="tel" placeholder="+90 5XX XXX XX XX" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label style="display:flex;flex-direction:column;gap:4px">
              <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Tarih</span>
              <input id="bizResDate" type="date" value="${defaultDate}" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">
            </label>
            <label style="display:flex;flex-direction:column;gap:4px">
              <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Saat</span>
              <input id="bizResTime" type="time" value="${defaultTime}" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">
            </label>
          </div>
          <label style="display:flex;flex-direction:column;gap:4px">
            <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Kişi Sayısı</span>
            <input id="bizResGuests" type="number" min="1" max="${Math.max(table.capacity, 1)}" value="${Math.min(2, table.capacity)}" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">
          </label>
          <label style="display:flex;flex-direction:column;gap:4px">
            <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)">Not (opsiyonel)</span>
            <textarea id="bizResNote" rows="2" placeholder="Özel istek veya not" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);resize:vertical"></textarea>
          </label>
        </div>
        <button onclick="bizSubmitReservation('${tableId}')" class="btn-primary" style="width:100%;margin-top:12px">
          Rezerve Et
        </button>
      </div>
    </div>
  `;

  // Bottom-sheet overlay
  const existing = document.getElementById('bizReserveModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'bizReserveModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:70;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div style="width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
      <div style="padding:14px var(--app-px);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px">
        <div class="btn-icon" onclick="document.getElementById('bizReserveModal').remove()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);flex:1">Masa Rezervasyonu</span>
      </div>
      <div style="flex:1;overflow-y:auto">${content}</div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* Actions ─────────────────────────────────────────────── */
function bizSubmitReservation(tableId) {
  if (!_bizCanManageReservations()) return;
  const name = (document.getElementById('bizResName').value || '').trim();
  const phone = (document.getElementById('bizResPhone').value || '').trim();
  const date = document.getElementById('bizResDate').value;
  const time = document.getElementById('bizResTime').value;
  const guests = parseInt(document.getElementById('bizResGuests').value, 10);
  const note = (document.getElementById('bizResNote').value || '').trim();

  if (!name) { alert('Lütfen müşteri adını girin.'); return; }
  if (!date || !time) { alert('Lütfen tarih ve saat seçin.'); return; }
  const whenIso = new Date(`${date}T${time}:00`).toISOString();
  if (new Date(whenIso) < new Date(Date.now() - 5 * 60 * 1000)) {
    alert('Geçmiş bir tarih için rezervasyon oluşturulamaz.'); return;
  }
  if (!guests || guests < 1) { alert('Kişi sayısı en az 1 olmalı.'); return; }

  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (guests > table.capacity) {
    if (!confirm(`Bu masa ${table.capacity} kişilik. ${guests} kişi için devam edilsin mi?`)) return;
  }

  // Conflict check (±90 dk penceresi)
  const win = 90 * 60 * 1000;
  const conflict = BIZ_RESERVATIONS.find(r =>
    r.tableId === tableId && r.status !== 'cancelled' &&
    Math.abs(new Date(r.reservedAt) - new Date(whenIso)) < win
  );
  if (conflict) {
    if (!confirm(`Bu masada ${_bizFormatReservationDateTime(conflict.reservedAt)} saatinde (${escHtml(conflict.customerName)}) rezervasyon mevcut. Yine de eklensin mi?`)) return;
  }

  const by = _bizReservedByLabel();
  const newRes = {
    id: 'res_' + Date.now().toString(36),
    branchId: bizActiveBranch,
    tableId: tableId,
    customerName: name,
    customerPhone: phone,
    guestCount: guests,
    reservedAt: whenIso,
    note: note,
    createdBy: by.id,
    createdByName: by.name,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };
  BIZ_RESERVATIONS.push(newRes);

  // Reflect reservation on the table (closest upcoming)
  const upcoming = _bizTableReservations(tableId)[0];
  if (upcoming && table.status === 'empty') {
    table.status = 'reserved';
    table.reservationName = upcoming.customerName;
    table.reservationTime = upcoming.reservedAt;
  }

  const modal = document.getElementById('bizReserveModal');
  if (modal) modal.remove();
  _bizRefreshReservationsScreen();
  // If the tables screen is open, refresh it too
  if (document.getElementById('bizTablesOverlay') && typeof renderBizTablesContent === 'function') {
    const host = document.querySelector('#bizTablesOverlay > div:last-child');
    if (host) host.innerHTML = renderBizTablesContent();
  }
  alert(`Rezervasyon oluşturuldu:\n${name} · ${_bizFormatReservationDateTime(whenIso)}\nMasa ${table.number}`);
}

function bizCancelReservation(resId, tableId) {
  if (!_bizCanManageReservations()) return;
  if (!confirm('Bu rezervasyon iptal edilsin mi?')) return;
  const r = BIZ_RESERVATIONS.find(x => x.id === resId);
  if (!r) return;
  r.status = 'cancelled';

  // Clear table's reservation fields if this was the active one
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (table && table.status === 'reserved') {
    const stillActive = _bizTableReservations(tableId)[0];
    if (stillActive) {
      table.reservationName = stillActive.customerName;
      table.reservationTime = stillActive.reservedAt;
    } else {
      table.status = 'empty';
      table.reservationName = null;
      table.reservationTime = null;
    }
  }

  // Re-open table modal to show updated list
  openBizReserveTable(tableId);
  _bizRefreshReservationsScreen();
}
