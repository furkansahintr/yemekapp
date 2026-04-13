/* ═══ NOTIFICATIONS COMPONENT ═══ */

function openNotifications(){
  renderNotifications();
  document.getElementById('notifOverlay').classList.add('open');
}

function closeNotifications(){
  document.getElementById('notifOverlay').classList.remove('open');
}

function renderNotifications(){
  const list = document.getElementById('notifList');
  if(!list || typeof NOTIFICATIONS==='undefined') return;
  const iconMap = { like:'solar:heart-bold', comment:'solar:chat-round-dots-bold', follow:'solar:user-plus-bold', mention:'solar:mention-circle-bold', recipe:'solar:chef-hat-bold' };
  const colorMap = { like:'#EF4444', comment:'#3B82F6', follow:'#8B5CF6', mention:'#F59E0B', recipe:'var(--primary)' };

  list.innerHTML = NOTIFICATIONS.map(n=>{
    const avatarHtml = n.avatar
      ? `<img class="notif-item-avatar" src="${n.avatar}" alt="">`
      : `<div class="notif-item-avatar system"><iconify-icon icon="solar:chef-hat-bold" style="font-size:18px;color:#fff"></iconify-icon></div>`;
    return `<div class="notif-item${n.read?'':' unread'}">
      ${avatarHtml}
      <div class="notif-item-body">
        <div class="notif-item-text"><strong>${n.user}</strong> ${n.text}</div>
        <div class="notif-item-time">${n.time} önce</div>
      </div>
      <div class="notif-item-icon" style="background:${colorMap[n.type]||'var(--glass-card)'}20">
        <iconify-icon icon="${iconMap[n.type]||'solar:bell-bold'}" style="font-size:16px;color:${colorMap[n.type]||'var(--text-secondary)'}"></iconify-icon>
      </div>
    </div>`;
  }).join('');
}

function markAllRead(){
  if(typeof NOTIFICATIONS!=='undefined') NOTIFICATIONS.forEach(n=>n.read=true);
  renderNotifications();
  const dot = document.getElementById('commNotifDot');
  if(dot) dot.style.display = 'none';
}
