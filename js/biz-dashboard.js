/* ═══ BIZ DASHBOARD COMPONENT ═══ */

function renderBizDashboard() {
  const stats = BIZ_DASHBOARD_STATS;

  // Render peak hours chart
  const chart = document.getElementById('bizPeakHoursChart');
  if (chart && stats.peakHours) {
    const maxOrders = Math.max(...stats.peakHours.map(h => h.orders));
    chart.innerHTML = stats.peakHours.map(h => {
      const pct = (h.orders / maxOrders) * 100;
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);min-width:36px">${h.hour}</span>
        <div style="flex:1;height:16px;background:var(--bg-surface-alt);border-radius:var(--r-sm);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--primary);border-radius:var(--r-sm);transition:width .3s"></div>
        </div>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);min-width:20px;text-align:right">${h.orders}</span>
      </div>`;
    }).join('');
  }

  // Render top items
  const topList = document.getElementById('bizTopItemsList');
  if (topList && stats.thisWeek && stats.thisWeek.topItems) {
    topList.innerHTML = stats.thisWeek.topItems.map((item, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i < stats.thisWeek.topItems.length - 1 ? 'border-bottom:1px solid var(--border-subtle)' : ''}">
        <div style="width:28px;height:28px;border-radius:50%;background:${i === 0 ? 'var(--primary)' : 'var(--glass-card)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:${i === 0 ? '#fff' : 'var(--text-secondary)'}">${i + 1}</span>
        </div>
        <div style="flex:1;font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${item.name}</div>
        <div style="text-align:right">
          <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${item.qty} adet</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">₺${item.revenue.toLocaleString('tr-TR')}</div>
        </div>
      </div>
    `).join('');
  }

  // Render staff performance
  const staffList = document.getElementById('bizStaffPerfList');
  if (staffList && stats.staffPerformance) {
    staffList.innerHTML = stats.staffPerformance.map((s, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i < stats.staffPerformance.length - 1 ? 'border-bottom:1px solid var(--border-subtle)' : ''}">
        <img src="https://i.pravatar.cc/40?u=${s.staffId}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" alt="">
        <div style="flex:1">
          <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${s.name}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${s.ordersServed} sipariş · Ort. ${s.avgServiceTime}dk</div>
        </div>
        <div style="display:flex;align-items:center;gap:2px">
          <iconify-icon icon="solar:star-bold" style="font-size:12px;color:#f59e0b"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${s.rating}</span>
        </div>
      </div>
    `).join('');
  }

  // Render revenue chart placeholder (simple bar chart)
  const revChart = document.getElementById('bizRevenueChart');
  if (revChart) {
    const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    const values = [800, 1200, 1800, 2400, 2100, 1500, 1000, 1200, 1800, 2200, 1900, 1400];
    const max = Math.max(...values);
    revChart.innerHTML = `<div style="display:flex;align-items:flex-end;gap:4px;height:100%;padding:8px 0">
      ${hours.map((h, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end">
        <div style="width:100%;background:var(--primary);opacity:${0.4 + (values[i] / max) * 0.6};border-radius:var(--r-sm) var(--r-sm) 0 0;height:${(values[i] / max) * 80}%"></div>
        <span style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-tertiary)">${h}</span>
      </div>`).join('')}
    </div>`;
  }
}

