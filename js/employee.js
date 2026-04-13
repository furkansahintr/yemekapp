/* ═══ EMPLOYEE COMPONENT ═══ */

let employeeActiveEmp = null;

function renderEmployee() {
  const container = document.getElementById('employeeContent');
  if (!container) return;

  if (typeof USER_EMPLOYMENTS === 'undefined' || USER_EMPLOYMENTS.length === 0) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;text-align:center">
        <iconify-icon icon="solar:case-round-bold" style="font-size:56px;color:var(--text-tertiary);margin-bottom:16px"></iconify-icon>
        <div style="font:var(--fw-semibold) var(--fs-lg)/1.3 var(--font);color:var(--text-primary);margin-bottom:8px">Henüz bir işletmeye bağlı değilsiniz</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-muted)">Bir işletmede çalışmaya başladığınızda burada vardiya, görev ve duyurularınızı görebilirsiniz.</div>
      </div>`;
    return;
  }

  // Default to first employment
  if (!employeeActiveEmp || !USER_EMPLOYMENTS.find(e => e.id === employeeActiveEmp)) {
    employeeActiveEmp = USER_EMPLOYMENTS[0].id;
  }

  const emp = USER_EMPLOYMENTS.find(e => e.id === employeeActiveEmp);
  const shifts = (typeof USER_EMPLOYEE_SHIFTS !== 'undefined' ? USER_EMPLOYEE_SHIFTS : []).filter(s => s.empId === emp.id);
  const tasks = (typeof USER_EMPLOYEE_TASKS !== 'undefined' ? USER_EMPLOYEE_TASKS : []).filter(t => t.empId === emp.id);
  const announcements = (typeof USER_EMPLOYEE_ANNOUNCEMENTS !== 'undefined' ? USER_EMPLOYEE_ANNOUNCEMENTS : []).filter(a => a.empId === emp.id);

  const todayShift = shifts.find(s => s.status === 'active');
  const upcomingShifts = shifts.filter(s => s.status === 'upcoming');
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const unreadAnn = announcements.filter(a => !a.isRead);

  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };
  const priorityLabels = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
  const taskStatusLabels = { pending: 'Bekliyor', in_progress: 'Devam Ediyor', completed: 'Tamamlandı' };
  const taskStatusColors = { pending: '#F59E0B', in_progress: '#3B82F6', completed: '#22C55E' };

  container.innerHTML = `
    <!-- İşletme Seçici (birden fazla varsa) -->
    ${USER_EMPLOYMENTS.length > 1 ? `
    <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0">
      ${USER_EMPLOYMENTS.map(e => `
        <div onclick="switchEmployeeEmp('${e.id}')" style="padding:8px 16px;border-radius:var(--r-full);white-space:nowrap;cursor:pointer;transition:all .2s;font:var(--fw-medium) var(--fs-sm)/1 var(--font);${e.id === employeeActiveEmp ? 'background:var(--primary);color:#fff;border:1px solid var(--primary)' : 'background:var(--bg-phone);color:var(--text-secondary);border:1px solid var(--border-subtle)'}">${escHtml(e.businessName)}</div>
      `).join('')}
    </div>` : ''}

    <!-- Çalışan Kart -->
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);display:flex;align-items:center;gap:14px">
      <div style="width:50px;height:50px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <iconify-icon icon="${emp.isOwner ? 'solar:crown-bold' : 'solar:case-round-bold'}" style="font-size:24px;color:#fff"></iconify-icon>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(emp.businessName)}</div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(emp.branchName)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
          <span style="font:var(--fw-medium) 10px/1 var(--font);color:${emp.roleColor};background:${emp.roleColor}12;padding:3px 8px;border-radius:var(--r-full)">${escHtml(emp.roleLabel)}</span>
          <span style="font:var(--fw-medium) 9px/1 var(--font);color:#22c55e">● Aktif</span>
        </div>
      </div>
      <div onclick="switchToBizAccount('${emp.id}')" style="display:flex;align-items:center;gap:4px;padding:8px 14px;border-radius:var(--r-full);background:var(--primary);cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff">Yönet</span>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:#fff"></iconify-icon>
      </div>
    </div>

    <!-- Bugünkü Vardiya -->
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Bugünkü Vardiya</span>
      </div>
      ${todayShift ? `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid #22C55E">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${todayShift.start} - ${todayShift.end}</span>
          </div>
          <span style="font:var(--fw-medium) 10px/1 var(--font);padding:3px 10px;border-radius:var(--r-full);color:#22c55e;background:rgba(34,197,94,0.1)">Aktif</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <iconify-icon icon="solar:shop-2-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${escHtml(todayShift.branchName)}</span>
        </div>
      </div>` : `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg);text-align:center">
        <iconify-icon icon="solar:calendar-minimalistic-linear" style="font-size:28px;color:var(--text-tertiary);margin-bottom:8px"></iconify-icon>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Bugün planlanmış vardiya yok</div>
      </div>`}
    </div>

    <!-- Yaklaşan Vardiyalar -->
    ${upcomingShifts.length > 0 ? `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:calendar-bold" style="font-size:18px;color:#3B82F6"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Yaklaşan Vardiyalar</span>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:auto">${upcomingShifts.length} vardiya</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${upcomingShifts.map(s => `
        <div style="background:var(--bg-phone);border-radius:var(--r-lg);padding:12px 14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:12px">
          <div style="min-width:42px;text-align:center">
            <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--primary)">${s.date.split('-')[2]}</div>
            <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][parseInt(s.date.split('-')[1]) - 1]}</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border-subtle)"></div>
          <div style="flex:1">
            <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${s.start} - ${s.end}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">${escHtml(s.branchName)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Görevlerim -->
    ${pendingTasks.length > 0 ? `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:checklist-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Görevlerim</span>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:auto">${pendingTasks.length} aktif</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${pendingTasks.map(t => `
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid ${priorityColors[t.priority]}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(t.title)}</span>
            <span style="font:var(--fw-medium) 10px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:${taskStatusColors[t.status]};background:${taskStatusColors[t.status]}15">${taskStatusLabels[t.status]}</span>
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:6px">${escHtml(t.desc)}</div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="display:flex;align-items:center;gap:4px;font:var(--fw-medium) 10px/1 var(--font);color:${priorityColors[t.priority]}"><iconify-icon icon="solar:flag-bold" style="font-size:12px"></iconify-icon>${priorityLabels[t.priority]}</span>
            <span style="display:flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)"><iconify-icon icon="solar:calendar-minimalistic-linear" style="font-size:12px"></iconify-icon>${t.dueDate.split('-')[2]}/${t.dueDate.split('-')[1]}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Duyurular -->
    ${announcements.length > 0 ? `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:bell-bold" style="font-size:18px;color:#EF4444"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Duyurular</span>
        ${unreadAnn.length > 0 ? `<span style="font:var(--fw-bold) 10px/1 var(--font);color:#fff;background:#EF4444;padding:2px 7px;border-radius:var(--r-full)">${unreadAnn.length}</span>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${announcements.map(a => `
        <div style="background:var(--bg-phone);border-radius:var(--r-lg);padding:12px 14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);${!a.isRead ? 'border-left:3px solid #EF4444' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${escHtml(a.title)}</span>
            ${!a.isRead ? '<div style="width:6px;height:6px;border-radius:50%;background:#EF4444;flex-shrink:0"></div>' : ''}
          </div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:4px">${escHtml(a.message)}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">${escHtml(a.businessName)} · ${a.date.split('-')[2]}/${a.date.split('-')[1]}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Geçmiş Vardiyalar -->
    ${shifts.filter(s => s.status === 'completed').length > 0 ? `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:history-bold" style="font-size:18px;color:var(--text-tertiary)"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Geçmiş Vardiyalar</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${shifts.filter(s => s.status === 'completed').map(s => `
        <div style="background:var(--bg-phone);border-radius:var(--r-lg);padding:12px 14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:12px;opacity:0.7">
          <div style="min-width:42px;text-align:center">
            <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-secondary)">${s.date.split('-')[2]}</div>
            <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][parseInt(s.date.split('-')[1]) - 1]}</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border-subtle)"></div>
          <div style="flex:1">
            <div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">${s.start} - ${s.end}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">${escHtml(s.branchName)}</div>
          </div>
          <iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <div style="height:8px"></div>
  `;
}

function switchEmployeeEmp(empId) {
  employeeActiveEmp = empId;
  renderEmployee();
}
