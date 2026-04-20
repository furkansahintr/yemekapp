/* ═══════════════════════════════════════════════════════════
   BIZ LEGAL DOCS — Yasal Evraklar (Şube bazında)
   Kritik alanlar (tabela/adres/koordinat/vergi/IBAN) → 24 saat inceleme + satışa kapalı
   Kritik olmayanlar (fotoğraf, telefon) → anında güncellenir
   ═══════════════════════════════════════════════════════════ */

var _ld = {
  branchId: null,
  draft: null,
  CRITICAL_KEYS: ['title','address','coords','taxNo','taxCertFile','iban']
};

function openBizLegalDocs(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  _ld.branchId = branchId;
  var data = bizBranchLegal(branchId);
  // Draft = kritik alanlarda mevcut + (eğer pending varsa) override
  _ld.draft = JSON.parse(JSON.stringify(data.current));
  _ldInjectStyles();
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  var title = 'Yasal Evraklar · ' + (branch ? branch.name : 'Şube');
  var overlay = createBizOverlay('bizLegalDocsOverlay', title, _ldBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _ldBody() {
  var data = bizBranchLegal(_ld.branchId);
  var pending = data.pending;
  var d = _ld.draft;
  var isPending = !!pending && new Date(pending.reviewDeadline) > new Date();

  return '<div class="ld-wrap">'
    + _ldWarningPanel()
    + (isPending ? _ldPendingPanel(pending) : '')
    + _ldCriticalCard(d, pending)
    + _ldNonCriticalCard(d)
    + _ldSaveBar()
    + '</div>';
}

function _ldWarningPanel() {
  return '<div class="ld-warn">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:22px;color:#F59E0B;flex-shrink:0"></iconify-icon>'
    + '<div>'
    +   '<div class="ld-warn-title">Önemli Uyarı</div>'
    +   '<div class="ld-warn-body">Bu sekmede yapacağınız kritik veri değişiklikleri, sistem güvenliği ve yasal uyumluluk gereği ekibimiz tarafından manuel olarak kontrol edilecektir. Değişiklik kaydedildikten sonra işletmeniz inceleme süresince (maksimum <b>24 saat</b>) geçici olarak hizmete kapatılacaktır.</div>'
    + '</div>'
    + '</div>';
}

function _ldPendingPanel(pending) {
  var left = new Date(pending.reviewDeadline) - new Date();
  var hrs = Math.max(0, Math.floor(left / 3600000));
  var mins = Math.max(0, Math.floor((left % 3600000) / 60000));
  var fields = Object.keys(pending.changes || {}).length;
  return '<div class="ld-pending">'
    + '<div class="ld-pending-head">'
    +   '<div class="ld-pending-pulse"></div>'
    +   '<div style="flex:1">'
    +     '<div class="ld-pending-title">İnceleme Altında</div>'
    +     '<div class="ld-pending-sub">' + fields + ' alan doğrulama bekliyor</div>'
    +   '</div>'
    +   '<div class="ld-pending-time">'
    +     '<div class="ld-pending-time-val">' + hrs + 's ' + mins + 'd</div>'
    +     '<div class="ld-pending-time-lbl">kaldı</div>'
    +   '</div>'
    + '</div>'
    + '<div class="ld-pending-foot">'
    +   '<iconify-icon icon="solar:lock-keyhole-bold" style="font-size:13px;color:#DC2626"></iconify-icon>'
    +   '<span>Şube şu an satışa kapalı. Onay sonrası otomatik olarak açılacak ve bildirim alacaksınız.</span>'
    + '</div>'
    + '</div>';
}

function _ldCriticalCard(d, pending) {
  var pendingChanges = (pending && pending.changes) || {};
  function fieldChip(key) {
    if (key in pendingChanges) return '<span class="ld-chip ld-chip--pending"><span class="ld-chip-dot"></span>Doğrulama Bekliyor</span>';
    return '';
  }
  function fieldIco(icon, color) {
    return '<div class="ld-field-ico" style="background:' + color + '18;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:16px"></iconify-icon></div>';
  }
  return '<div class="ld-card">'
    + '<div class="ld-section-head"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:16px;color:#DC2626"></iconify-icon><span>Kritik Bilgiler</span><span class="ld-sec-note">değişiklik → 24sa inceleme</span></div>'

    + '<div class="ld-field">'
    +   fieldIco('solar:shop-bold', '#3B82F6')
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">İşletme Ünvanı (Tabela İsmi)</label>'
    +     '<input type="text" class="ld-input" value="' + _ldEsc(d.title) + '" oninput="_ld.draft.title=this.value">'
    +   '</div>'
    +   fieldChip('title')
    + '</div>'

    + '<div class="ld-field">'
    +   fieldIco('solar:map-point-bold', '#10B981')
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">Adres & Harita Konumu</label>'
    +     '<textarea class="ld-input" rows="2" oninput="_ld.draft.address=this.value">' + _ldEsc(d.address) + '</textarea>'
    +     '<div class="ld-coords" onclick="_ldPickCoords()">'
    +       '<iconify-icon icon="solar:map-bold" style="font-size:13px"></iconify-icon>'
    +       '<span>Koordinat: ' + (d.coords ? d.coords.lat.toFixed(4) + '°N, ' + d.coords.lng.toFixed(4) + '°E' : '—') + '</span>'
    +       '<span style="margin-left:auto;color:var(--primary);font-weight:700">Haritada seç ›</span>'
    +     '</div>'
    +   '</div>'
    +   (fieldChip('address') || fieldChip('coords'))
    + '</div>'

    + '<div class="ld-field">'
    +   fieldIco('solar:document-text-bold', '#F59E0B')
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">Vergi Numarası</label>'
    +     '<input type="text" class="ld-input" value="' + _ldEsc(d.taxNo) + '" oninput="_ld.draft.taxNo=this.value">'
    +     '<label class="ld-upload" style="margin-top:8px">'
    +       '<iconify-icon icon="solar:file-text-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>'
    +       '<span>Vergi Levhası: <b>' + (d.taxCertFile || 'Yükle') + '</b></span>'
    +       '<input type="file" accept=".pdf,image/*" style="display:none" onchange="_ldUploadTax(this)">'
    +       '<span style="margin-left:auto;color:var(--primary);font-weight:700;font-size:11px">Değiştir</span>'
    +     '</label>'
    +   '</div>'
    +   (fieldChip('taxNo') || fieldChip('taxCertFile'))
    + '</div>'

    + '<div class="ld-field">'
    +   fieldIco('solar:card-bold', '#8B5CF6')
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">IBAN</label>'
    +     '<input type="text" class="ld-input ld-iban" value="' + _ldEsc(d.iban) + '" oninput="_ld.draft.iban=this.value.toUpperCase()">'
    +   '</div>'
    +   fieldChip('iban')
    + '</div>'

    + '</div>';
}

function _ldNonCriticalCard(d) {
  return '<div class="ld-card">'
    + '<div class="ld-section-head"><iconify-icon icon="solar:bolt-circle-bold" style="font-size:16px;color:#22C55E"></iconify-icon><span>Hızlı Güncellenen</span><span class="ld-sec-note">anında yayınlanır</span></div>'

    + '<div class="ld-field">'
    +   '<div class="ld-field-ico" style="background:rgba(34,197,94,0.12);color:#22C55E"><iconify-icon icon="solar:phone-bold" style="font-size:16px"></iconify-icon></div>'
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">Şube Telefonu</label>'
    +     '<input type="tel" class="ld-input" value="' + _ldEsc(d.phone) + '" oninput="_ld.draft.phone=this.value">'
    +   '</div>'
    + '</div>'

    + '<div class="ld-field" style="align-items:flex-start">'
    +   '<div class="ld-field-ico" style="background:rgba(236,72,153,0.12);color:#EC4899"><iconify-icon icon="solar:gallery-bold" style="font-size:16px"></iconify-icon></div>'
    +   '<div style="flex:1;min-width:0">'
    +     '<label class="ld-label">Şube Fotoğrafları</label>'
    +     '<div class="ld-photo-grid">'
    +       _ldPhotoSlot('Kapak', d.photos && d.photos.cover)
    +       + _ldPhotoSlot('Ortam 1', d.photos && d.photos.ambient && d.photos.ambient[0])
    +       + _ldPhotoSlot('Menü', d.photos && d.photos.menu && d.photos.menu[0])
    +     '</div>'
    +   '</div>'
    + '</div>'

    + '</div>';
}

function _ldPhotoSlot(label, src) {
  if (src) {
    return '<div class="ld-photo-item has-img">'
      + '<div class="ld-photo-label">' + label + '</div>'
      + '<div class="ld-photo-thumb" style="background-image:url(\'' + src + '\')"></div>'
      + '<button class="ld-photo-swap">Değiştir</button>'
      + '</div>';
  }
  return '<label class="ld-photo-item ld-photo-add">'
    + '<div class="ld-photo-label">' + label + '</div>'
    + '<div class="ld-photo-thumb"><iconify-icon icon="solar:camera-add-bold" style="font-size:22px;color:var(--primary)"></iconify-icon></div>'
    + '<input type="file" accept="image/*" style="display:none">'
    + '</label>';
}

function _ldSaveBar() {
  return '<button class="ld-save" onclick="_ldSave()">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:18px"></iconify-icon>'
    + 'Değişiklikleri Kaydet'
    + '</button>';
}

/* ─ Actions ─ */
function _ldSave() {
  var data = bizBranchLegal(_ld.branchId);
  var cur = data.current;
  var d = _ld.draft;

  // Değişen kritik alanları topla
  var changes = {};
  _ld.CRITICAL_KEYS.forEach(function(k){
    if (k === 'coords') {
      if (!cur.coords || d.coords.lat !== cur.coords.lat || d.coords.lng !== cur.coords.lng) changes.coords = d.coords;
    } else {
      if (d[k] !== cur[k]) changes[k] = d[k];
    }
  });

  // Kritik olmayanları anında uygula
  if (d.phone !== cur.phone) cur.phone = d.phone;
  // Fotoğraflar — demo

  if (Object.keys(changes).length === 0) {
    if (typeof _admToast === 'function') _admToast('Değişiklik yok', 'ok');
    else alert('Değişiklik yok');
    return;
  }

  _ldConfirmCritical(changes);
}

function _ldConfirmCritical(changes) {
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'ldConfirmModal';
  m.className = 'ld-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) m.remove(); };
  var changedKeys = Object.keys(changes);
  var labels = { title:'İşletme Ünvanı', address:'Adres', coords:'Koordinat', taxNo:'Vergi No', taxCertFile:'Vergi Levhası', iban:'IBAN' };
  var list = changedKeys.map(function(k){ return '<div class="ld-conf-row"><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon><span>' + (labels[k] || k) + '</span></div>'; }).join('');
  m.innerHTML = '<div class="ld-modal">'
    + '<div class="ld-modal-head" style="background:linear-gradient(135deg,#F59E0B,#DC2626);color:#fff">'
    +   '<iconify-icon icon="solar:shield-warning-bold" style="font-size:32px"></iconify-icon>'
    +   '<div class="ld-modal-title">24 Saatlik İnceleme</div>'
    +   '<div class="ld-modal-sub">Aşağıdaki değişiklikler inceleme sürecine girecek</div>'
    + '</div>'
    + '<div class="ld-modal-body">'
    +   '<div class="ld-conf-list">' + list + '</div>'
    +   '<div class="ld-warn" style="margin-top:12px;padding:10px 12px"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:15px;color:#DC2626;flex-shrink:0"></iconify-icon><span style="font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-secondary)">Kaydettiğinizde şube <b>satışa kapatılacak</b> ve ekip onayının ardından tekrar açılacak.</span></div>'
    +   '<div style="display:flex;gap:8px;margin-top:14px">'
    +     '<button class="ld-btn ld-btn--ghost" style="flex:1" onclick="document.getElementById(\'ldConfirmModal\').remove()">Vazgeç</button>'
    +     '<button class="ld-btn ld-btn--danger" style="flex:2" onclick="_ldSubmit()">Onaylayıp İnceleme Başlat</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _ld._pendingChanges = changes;
}

function _ldSubmit() {
  var data = bizBranchLegal(_ld.branchId);
  var changes = _ld._pendingChanges || {};
  var now = new Date();
  var deadline = new Date(now.getTime() + 24 * 60 * 60000);
  data.pending = {
    changes: changes,
    submittedAt: now.toISOString(),
    reviewDeadline: deadline.toISOString()
  };
  // Şube statüsünü inceleme altına al
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === _ld.branchId; });
  if (branch) {
    branch._prevStatus = branch.status;
    branch.status = 'under_review';
  }
  var m = document.getElementById('ldConfirmModal');
  if (m) m.remove();
  if (typeof _admToast === 'function') _admToast('İnceleme başlatıldı · şube satışa kapatıldı', 'ok');
  _ldRerender();
}

function _ldRerender() {
  var o = document.getElementById('bizLegalDocsOverlay');
  if (!o) return;
  var content = o.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _ldBody();
}

function _ldPickCoords() {
  // Demo: mock picker — dummy değişiklik
  var d = _ld.draft;
  if (!confirm('Harita açılacak (demo) — koordinatı değiştirmeyi simüle edelim mi?')) return;
  d.coords = { lat: (d.coords.lat + 0.0005), lng: (d.coords.lng + 0.0005) };
  if (typeof _admToast === 'function') _admToast('Yeni koordinat seçildi', 'ok');
  _ldRerender();
}

function _ldUploadTax(input) {
  var f = input.files && input.files[0];
  if (!f) return;
  _ld.draft.taxCertFile = f.name;
  _ldRerender();
}

function _ldEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _ldInjectStyles() {
  if (document.getElementById('ldStyles')) return;
  var s = document.createElement('style');
  s.id = 'ldStyles';
  s.textContent = [
    '.ld-wrap{display:flex;flex-direction:column;gap:14px;padding-bottom:24px}',
    '/* Warning */',
    '.ld-warn{display:flex;gap:12px;padding:14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:var(--r-xl)}',
    '.ld-warn-title{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:#D97706;margin-bottom:6px;display:flex;align-items:center;gap:6px}',
    '.ld-warn-body{font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.ld-warn-body b{color:var(--text-primary);font-weight:700}',
    '/* Pending panel */',
    '.ld-pending{background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(245,158,11,0.05));border:1.5px solid rgba(239,68,68,0.28);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-md)}',
    '.ld-pending-head{display:flex;align-items:center;gap:12px}',
    '.ld-pending-pulse{width:12px;height:12px;border-radius:50%;background:#EF4444;box-shadow:0 0 0 0 rgba(239,68,68,0.55);animation:ldPulse 1.4s infinite;flex-shrink:0}',
    '@keyframes ldPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,0.55)}70%{box-shadow:0 0 0 10px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}',
    '.ld-pending-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:#DC2626}',
    '.ld-pending-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary);margin-top:3px}',
    '.ld-pending-time{text-align:right}',
    '.ld-pending-time-val{font:var(--fw-bold) 18px/1 var(--font);color:#DC2626}',
    '.ld-pending-time-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.ld-pending-foot{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px dashed rgba(239,68,68,0.22);font:var(--fw-medium) 11.5px/1.4 var(--font);color:var(--text-secondary)}',
    '/* Cards */',
    '.ld-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px;display:flex;flex-direction:column;gap:14px}',
    '.ld-section-head{display:flex;align-items:center;gap:6px;font:var(--fw-bold) 12px/1 var(--font);color:var(--text-primary)}',
    '.ld-sec-note{margin-left:auto;font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)}',
    '/* Field */',
    '.ld-field{display:flex;gap:10px;align-items:center}',
    '.ld-field-ico{width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.ld-label{display:block;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-bottom:6px;letter-spacing:.2px}',
    '.ld-input{width:100%;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-page);font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box;resize:vertical}',
    '.ld-input:focus{border-color:var(--primary)}',
    '.ld-iban{font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.5px}',
    '.ld-coords{display:flex;align-items:center;gap:6px;margin-top:6px;padding:7px 10px;background:var(--bg-btn);border-radius:var(--r-md);font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);cursor:pointer}',
    '.ld-upload{display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--bg-btn);border:1px dashed var(--border-subtle);border-radius:var(--r-md);font:var(--fw-medium) 11.5px/1 var(--font);color:var(--text-secondary);cursor:pointer;margin:0}',
    '.ld-upload b{color:var(--text-primary);font-weight:700}',
    '.ld-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);font:var(--fw-bold) 9.5px/1.4 var(--font);letter-spacing:.3px;flex-shrink:0;align-self:flex-start;margin-top:20px}',
    '.ld-chip--pending{background:rgba(245,158,11,0.14);color:#D97706}',
    '.ld-chip-dot{width:6px;height:6px;border-radius:50%;background:#F59E0B;animation:ldPulse 1.4s infinite}',
    '/* Photos */',
    '.ld-photo-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}',
    '.ld-photo-item{display:flex;flex-direction:column;gap:4px;cursor:pointer}',
    '.ld-photo-label{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)}',
    '.ld-photo-thumb{aspect-ratio:1;border-radius:var(--r-md);background:var(--bg-btn);background-size:cover;background-position:center;border:1px dashed var(--border-subtle);display:flex;align-items:center;justify-content:center}',
    '.ld-photo-add .ld-photo-thumb{border-style:dashed;border-color:var(--primary)}',
    '.ld-photo-item.has-img .ld-photo-thumb{border-style:solid;border-color:var(--border-subtle)}',
    '.ld-photo-swap{margin-top:4px;padding:4px 8px;border:none;background:var(--bg-btn);color:var(--text-primary);border-radius:var(--r-sm);font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer}',
    '/* Save button */',
    '.ld-save{width:100%;padding:14px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,var(--primary),var(--primary-deep));color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:var(--shadow-md);transition:transform .15s}',
    '.ld-save:active{transform:scale(.98)}',
    '/* Confirm modal */',
    '.ld-modal-backdrop{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.ld-modal-backdrop.open{opacity:1}',
    '.ld-modal{width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(24px);transition:transform .28s ease;max-height:90vh;display:flex;flex-direction:column}',
    '.ld-modal-backdrop.open .ld-modal{transform:translateY(0)}',
    '.ld-modal-head{padding:22px 18px 18px;text-align:center}',
    '.ld-modal-title{font:var(--fw-bold) 17px/1.2 var(--font);margin-top:8px}',
    '.ld-modal-sub{font:var(--fw-regular) 11.5px/1.4 var(--font);opacity:.92;margin-top:4px}',
    '.ld-modal-body{padding:16px 18px;overflow-y:auto}',
    '.ld-conf-list{background:var(--bg-btn);border-radius:var(--r-md);padding:10px 12px;display:flex;flex-direction:column;gap:6px}',
    '.ld-conf-row{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) 12px/1 var(--font);color:var(--text-primary)}',
    '.ld-btn{padding:12px;border-radius:var(--r-lg);border:none;font:var(--fw-bold) 13px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.ld-btn:active{transform:scale(.97)}',
    '.ld-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.ld-btn--danger{background:#EF4444;color:#fff}'
  ].join('\n');
  document.head.appendChild(s);
}
