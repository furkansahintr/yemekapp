/* ═══ BIZ REVIEWS COMPONENT ═══ */

function openBizReviews() {
  if (!bizRoleGuard('reviews')) return;
  const overlay = createBizOverlay('bizReviewsOverlay', 'Değerlendirmeler', renderBizReviewsContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function renderBizReviewsContent() {
  const reviews = BIZ_REVIEWS;
  const avg = BIZ_DASHBOARD_STATS.thisMonth.avgRating;

  const stars = n => Array.from({ length: 5 }, (_, i) =>
    `<iconify-icon icon="solar:star-${i < n ? 'bold' : 'linear'}" style="font-size:14px;color:${i < n ? '#f59e0b' : 'var(--text-tertiary)'}"></iconify-icon>`
  ).join('');

  return `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg);text-align:center;margin-bottom:16px">
      <div style="font:var(--fw-bold) 36px/1 var(--font);color:var(--text-primary)">${avg}</div>
      <div style="margin:8px 0">${stars(Math.round(avg))}</div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">${BIZ_DASHBOARD_STATS.thisMonth.totalReviews} değerlendirme</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${reviews.map(r => `
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <img src="${r.customerAvatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" alt="">
            <div style="flex:1">
              <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${r.customerName}</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${r.date}</div>
            </div>
            <div>${stars(r.rating)}</div>
          </div>
          <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">${r.text}</div>
          ${r.reply ? `<div style="margin-top:10px;padding:10px;background:var(--bg-surface-alt);border-radius:var(--r-lg)">
            <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);margin-bottom:4px">İşletme Yanıtı</div>
            <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary)">${r.reply}</div>
          </div>` : `<div style="margin-top:8px;text-align:right">
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer">Yanıtla</span>
          </div>`}
        </div>
      `).join('')}
    </div>
  `;
}

