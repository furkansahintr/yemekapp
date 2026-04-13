/* ═══ BIZ WAITER CALLS COMPONENT ═══ */

function openBizWaiterCalls() {
  if (!bizRoleGuard('waiterCalls')) return;
  const calls = getBranchCalls();
  const overlay = createBizOverlay('bizCallsOverlay', 'Garson Çağrıları', renderBizCallsContent(calls));
  document.getElementById('bizPhone').appendChild(overlay);
}

function renderBizCallsContent(calls) {
  const typeMap = { waiter: 'Garson', bill: 'Hesap', water: 'Su', other: 'Diğer' };
  const typeIcon = { waiter: 'solar:hand-shake-linear', bill: 'solar:bill-list-linear', water: 'solar:glass-water-linear', other: 'solar:question-circle-linear' };
  const statusMap = {
    pending: { label: 'Bekliyor', color: '#EF4444' },
    accepted: { label: 'Kabul Edildi', color: '#3B82F6' },
    completed: { label: 'Tamamlandı', color: '#22C55E' }
  };

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${calls.map(c => {
        const s = statusMap[c.status];
        return `<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid ${s.color}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center">
                <iconify-icon icon="${typeIcon[c.type]}" style="font-size:18px;color:${s.color}"></iconify-icon>
              </div>
              <div>
                <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Masa ${c.tableNumber}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${typeMap[c.type]} · ${c.createdAt}</div>
              </div>
            </div>
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:${s.color}15;color:${s.color}">${s.label}</span>
          </div>
          ${c.status === 'pending' ? `
            <div style="display:flex;gap:8px;margin-top:8px">
              <button style="flex:1;padding:10px;border-radius:var(--r-lg);background:var(--primary);color:#fff;border:none;font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer">Kabul Et</button>
              <button style="padding:10px 16px;border-radius:var(--r-lg);background:var(--bg-btn);color:var(--text-secondary);border:1px solid var(--border-subtle);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer">Ata</button>
            </div>` : ''}
          ${c.assignedWaiter ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:6px">Garson: ${c.assignedWaiter}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;
}

