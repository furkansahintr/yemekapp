/* ═══════════════════════════════════════════════════════════
   ADMIN COMMISSION — Komisyon Ayarları
   (Tab: Masa/Online • Kural kartları • Ekle/Düzenle modal •
    Dinamik İptal Komisyonları)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _acm = {
  category: 'online',    // 'online' | 'masa'
  modalOpen: false,
  editingRuleId: null,
  form: {
    criterionA_id: '',
    criterionA_range: '',
    criterionB_id: '',
    criterionB_range: '',
    rate: ''
  }
};

/* ═══ Overlay Aç ═══ */
function _admOpenCommission() {
  _admInjectStyles();
  _acmInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_acmCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyon Ayarları</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">Kriter bazlı kurallar ve iptal oranları</div>'
    + '</div>'
    + '<div class="acm-fab" onclick="_acmOpenAdd()" title="Yeni Kural"><iconify-icon icon="solar:add-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<div id="adminCommissionContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);

  renderAdminCommission();
}

function _acmCloseOverlay() {
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var o = adminPhone.querySelector('.prof-overlay');
  if (o) o.remove();
  _acmCloseModal();
}

/* ═══ Ana Render ═══ */
function renderAdminCommission() {
  var c = document.getElementById('adminCommissionContainer');
  if (!c) return;

  var h = '<div class="adm-fadeIn" style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px">';

  // P2'de doldurulacak: segment + kartlar
  h += _acmRenderSegment();
  h += _acmRenderRules();

  // P5'te doldurulacak: iptal komisyonları
  h += _acmRenderCancelSection();

  h += '</div>';
  c.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _acmEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _acmCriterion(id) {
  for (var i = 0; i < ADMIN_COMMISSION_CRITERIA.length; i++) {
    if (ADMIN_COMMISSION_CRITERIA[i].id === id) return ADMIN_COMMISSION_CRITERIA[i];
  }
  return null;
}

function _acmRange(criterionId, rangeId) {
  var cr = _acmCriterion(criterionId);
  if (!cr) return null;
  for (var i = 0; i < cr.ranges.length; i++) {
    if (cr.ranges[i].id === rangeId) return cr.ranges[i];
  }
  return null;
}

function _acmSetCategory(cat) {
  _acm.category = cat;
  renderAdminCommission();
}

/* ═══════════════════════════════════════
   P2 — Segment (Masa/Online) + Kural Kartları
   ═══════════════════════════════════════ */
function _acmRenderSegment() {
  var onlineCount = ADMIN_COMMISSION_RULES.filter(function(r) { return r.category === 'online'; }).length;
  var masaCount = ADMIN_COMMISSION_RULES.filter(function(r) { return r.category === 'masa'; }).length;

  var h = '<div class="acm-segment">'
    + '<button class="acm-seg-btn' + (_acm.category === 'masa' ? ' active' : '') + '" onclick="_acmSetCategory(\'masa\')">'
    + '<iconify-icon icon="solar:table-2-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Masa Siparişleri</span>'
    + '<span class="acm-seg-count">' + masaCount + '</span>'
    + '</button>'
    + '<button class="acm-seg-btn' + (_acm.category === 'online' ? ' active' : '') + '" onclick="_acmSetCategory(\'online\')">'
    + '<iconify-icon icon="solar:delivery-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Online Siparişler</span>'
    + '<span class="acm-seg-count">' + onlineCount + '</span>'
    + '</button>'
    + '</div>';

  return h;
}

function _acmRenderRules() {
  var cat = _acm.category;
  var rules = ADMIN_COMMISSION_RULES.filter(function(r) { return r.category === cat; });
  // Oran küçükten büyüğe
  rules.sort(function(a, b) { return a.rate - b.rate; });

  var catLabel = cat === 'masa' ? 'Masa Siparişleri' : 'Online Siparişler';
  var catDesc = cat === 'masa'
    ? 'Restoran içi (masa/QR) sipariş komisyon oranları — genelde daha düşüktür.'
    : 'Teslimat ve paket sipariş komisyon oranları.';

  var h = '<div class="acm-sect">'
    + '<div class="acm-sect-head">'
    + '<iconify-icon icon="solar:layers-bold" style="font-size:16px;color:#6366F1"></iconify-icon>'
    + '<span>' + catLabel + ' — Aktif Kurallar</span>'
    + '<button class="acm-add-inline" onclick="_acmOpenAdd()"><iconify-icon icon="solar:add-circle-linear" style="font-size:13px"></iconify-icon>Kural Ekle</button>'
    + '</div>'
    + '<div class="acm-sect-desc">' + catDesc + '</div>';

  if (rules.length === 0) {
    h += '<div class="acm-empty"><iconify-icon icon="solar:archive-bold" style="font-size:40px;opacity:0.3"></iconify-icon>'
      + '<div>Bu kategori için henüz kural tanımlanmamış</div>'
      + '<button class="acm-empty-cta" onclick="_acmOpenAdd()"><iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon>İlk Kuralı Ekle</button>'
      + '</div>';
  } else {
    h += '<div class="acm-rules">';
    for (var i = 0; i < rules.length; i++) {
      h += _acmRuleCard(rules[i]);
    }
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _acmRuleCard(rule) {
  var crA = _acmCriterion(rule.criterionA.criterion);
  var crB = _acmCriterion(rule.criterionB.criterion);
  var rgA = _acmRange(rule.criterionA.criterion, rule.criterionA.range);
  var rgB = _acmRange(rule.criterionB.criterion, rule.criterionB.range);
  if (!crA || !crB || !rgA || !rgB) return '';

  var rateColor = rule.rate <= 5 ? '#22C55E'
    : rule.rate <= 8 ? '#3B82F6'
    : rule.rate <= 11 ? '#F59E0B'
    : '#EF4444';

  return '<div class="acm-rule">'
    + '<div class="acm-rule-rate" style="background:' + rateColor + '18;color:' + rateColor + '">'
    + '%<b>' + rule.rate.toFixed(1) + '</b>'
    + '</div>'
    + '<div class="acm-rule-body">'
    + '<div class="acm-rule-critline">'
    + '<iconify-icon icon="' + crA.icon + '" style="font-size:13px;color:' + crA.color + '"></iconify-icon>'
    + '<span class="acm-rule-crlbl">' + _acmEsc(crA.label) + '</span>'
    + '<span class="acm-rule-crval" style="background:' + crA.color + '15;color:' + crA.color + '">' + _acmEsc(rgA.label) + '</span>'
    + '</div>'
    + '<div class="acm-rule-and">VE</div>'
    + '<div class="acm-rule-critline">'
    + '<iconify-icon icon="' + crB.icon + '" style="font-size:13px;color:' + crB.color + '"></iconify-icon>'
    + '<span class="acm-rule-crlbl">' + _acmEsc(crB.label) + '</span>'
    + '<span class="acm-rule-crval" style="background:' + crB.color + '15;color:' + crB.color + '">' + _acmEsc(rgB.label) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="acm-rule-actions">'
    + '<button class="acm-ico-btn" onclick="_acmOpenEdit(\'' + rule.id + '\')" title="Düzenle"><iconify-icon icon="solar:pen-linear" style="font-size:14px"></iconify-icon></button>'
    + '<button class="acm-ico-btn danger" onclick="_acmDeleteRule(\'' + rule.id + '\')" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Kural Ekleme/Düzenleme Modal
   ═══════════════════════════════════════ */
function _acmOpenAdd() {
  _acm.editingRuleId = null;
  _acm.form = { criterionA_id: '', criterionA_range: '', criterionB_id: '', criterionB_range: '', rate: '' };
  _acmMountModal();
}

function _acmMountModal() {
  _acmCloseModal();
  _acm.modalOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var m = document.createElement('div');
  m.id = 'acmModal';
  m.className = 'acm-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _acmCloseModal(); };
  m.innerHTML = '<div class="acm-modal"><div id="acmModalBody" class="acm-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _acmRenderModal();
}

function _acmCloseModal() {
  var m = document.getElementById('acmModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _acm.modalOpen = false;
  _acm.editingRuleId = null;
}

function _acmRenderModal() {
  var body = document.getElementById('acmModalBody');
  if (!body) return;
  var f = _acm.form;
  var isEdit = !!_acm.editingRuleId;
  var ready = f.criterionA_id && f.criterionA_range && f.criterionB_id && f.criterionB_range && f.rate !== '' && !isNaN(parseFloat(f.rate));
  var diffCrit = f.criterionA_id && f.criterionB_id && f.criterionA_id !== f.criterionB_id;

  var h = '';

  // Header
  h += '<div class="acm-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#EC4899,#F43F5E);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:pie-chart-2-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="acm-mtitle">' + (isEdit ? 'Kuralı Düzenle' : 'Yeni Komisyon Kuralı') + '</div>'
    + '<div class="acm-msub">' + (_acm.category === 'masa' ? 'Masa Siparişleri' : 'Online Siparişler') + ' • İki kriter seçip oran belirleyin</div></div>'
    + '</div>'
    + '<div class="acm-close" onclick="_acmCloseModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Kriter A
  h += _acmRenderCriterionBlock('A', 'Kriter 1', f.criterionA_id, f.criterionA_range);

  // Kriter B
  h += _acmRenderCriterionBlock('B', 'Kriter 2', f.criterionB_id, f.criterionB_range);

  // Uyarı: iki kriter aynı olamaz
  if (f.criterionA_id && f.criterionB_id && f.criterionA_id === f.criterionB_id) {
    h += '<div class="acm-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>'
      + 'İki kriter birbirinden farklı olmalıdır.</div>';
  }

  // Oran
  h += '<div class="acm-sect-in">'
    + '<div class="acm-sect-head-in"><iconify-icon icon="solar:percent-square-bold" style="font-size:14px;color:#22C55E"></iconify-icon><span>Komisyon Yüzdesi</span></div>'
    + '<div class="acm-rate-wrap">'
    + '<input type="number" class="acm-rate-input" min="0" max="100" step="0.5" placeholder="Ör: 7.5" value="' + _acmEsc(f.rate) + '" oninput="_acm.form.rate=this.value;_acmUpdateCTA()" />'
    + '<span class="acm-rate-suffix">%</span>'
    + '</div>'
    + '<div class="acm-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:11px"></iconify-icon>Bu kriterleri karşılayan işletmelere uygulanacak platform komisyon oranı.</div>'
    + '</div>';

  // CTA
  var canSave = ready && diffCrit;
  h += '<button id="acmSaveBtn" class="acm-cta' + (canSave ? '' : ' disabled') + '" onclick="_acmSubmit()"' + (canSave ? '' : ' disabled') + '>'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:16px"></iconify-icon>'
    + 'Kaydet ve Uygula</button>';

  if (isEdit) {
    h += '<button class="acm-secondary" onclick="_acmDeleteRule(\'' + _acm.editingRuleId + '\', true)">'
      + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:14px"></iconify-icon>'
      + 'Bu Kuralı Sil</button>';
  }

  body.innerHTML = h;
}

function _acmRenderCriterionBlock(slot, label, selectedCriterion, selectedRange) {
  var cr = selectedCriterion ? _acmCriterion(selectedCriterion) : null;

  var h = '<div class="acm-sect-in">'
    + '<div class="acm-sect-head-in"><iconify-icon icon="solar:checklist-bold" style="font-size:14px;color:#3B82F6"></iconify-icon><span>' + label + '</span></div>';

  // Kriter select
  h += '<div class="acm-field">'
    + '<label>Değerlendirme Kriteri</label>'
    + '<div class="acm-select-wrap">'
    + '<select class="acm-select" onchange="_acmSetCriterion(\'' + slot + '\', this.value)">'
    + '<option value="">Kriter seç...</option>';
  for (var i = 0; i < ADMIN_COMMISSION_CRITERIA.length; i++) {
    var c = ADMIN_COMMISSION_CRITERIA[i];
    var sel = c.id === selectedCriterion ? ' selected' : '';
    h += '<option value="' + c.id + '"' + sel + '>' + _acmEsc(c.label) + '</option>';
  }
  h += '</select>'
    + '<iconify-icon icon="solar:alt-arrow-down-linear" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--text-muted);pointer-events:none"></iconify-icon>'
    + '</div></div>';

  // Range chips
  if (cr) {
    h += '<div class="acm-field">'
      + '<label>Aralık</label>'
      + '<div class="acm-range-grid">';
    for (var j = 0; j < cr.ranges.length; j++) {
      var r = cr.ranges[j];
      var isSel = r.id === selectedRange;
      h += '<button class="acm-range-chip' + (isSel ? ' active' : '') + '" '
        + 'style="' + (isSel ? 'border-color:' + cr.color + ';background:' + cr.color + '18;color:' + cr.color : '') + '" '
        + 'onclick="_acmSetRange(\'' + slot + '\', \'' + r.id + '\')">' + _acmEsc(r.label) + '</button>';
    }
    h += '</div></div>';
  }

  h += '</div>';
  return h;
}

function _acmSetCriterion(slot, criterionId) {
  if (slot === 'A') { _acm.form.criterionA_id = criterionId; _acm.form.criterionA_range = ''; }
  else { _acm.form.criterionB_id = criterionId; _acm.form.criterionB_range = ''; }
  _acmRenderModal();
}

function _acmSetRange(slot, rangeId) {
  if (slot === 'A') _acm.form.criterionA_range = rangeId;
  else _acm.form.criterionB_range = rangeId;
  _acmRenderModal();
}

function _acmUpdateCTA() {
  var btn = document.getElementById('acmSaveBtn');
  if (!btn) return;
  var f = _acm.form;
  var ready = f.criterionA_id && f.criterionA_range && f.criterionB_id && f.criterionB_range
    && f.rate !== '' && !isNaN(parseFloat(f.rate))
    && f.criterionA_id !== f.criterionB_id;
  if (ready) { btn.classList.remove('disabled'); btn.removeAttribute('disabled'); }
  else { btn.classList.add('disabled'); btn.setAttribute('disabled', 'disabled'); }
}

function _acmSubmit() {
  var f = _acm.form;
  if (!f.criterionA_id || !f.criterionA_range || !f.criterionB_id || !f.criterionB_range) {
    _admToast('Lütfen her iki kriteri de seçin', 'err');
    return;
  }
  if (f.criterionA_id === f.criterionB_id) {
    _admToast('İki kriter farklı olmalı', 'err');
    return;
  }
  var rate = parseFloat(f.rate);
  if (isNaN(rate) || rate < 0 || rate > 100) {
    _admToast('Geçerli bir yüzde gir (0–100)', 'err');
    return;
  }

  var nowIso = new Date().toISOString();
  if (_acm.editingRuleId) {
    var r = ADMIN_COMMISSION_RULES.find(function(x) { return x.id === _acm.editingRuleId; });
    if (r) {
      r.criterionA = { criterion: f.criterionA_id, range: f.criterionA_range };
      r.criterionB = { criterion: f.criterionB_id, range: f.criterionB_range };
      r.rate = rate;
      r.updatedAt = nowIso;
      _admToast('Kural güncellendi', 'ok');
    }
  } else {
    var newId = 'cr_' + Date.now().toString(36);
    ADMIN_COMMISSION_RULES.push({
      id: newId,
      category: _acm.category,
      criterionA: { criterion: f.criterionA_id, range: f.criterionA_range },
      criterionB: { criterion: f.criterionB_id, range: f.criterionB_range },
      rate: rate,
      updatedAt: nowIso
    });
    _admToast('Kural kaydedildi ve uygulandı', 'ok');
  }

  _acmCloseModal();
  renderAdminCommission();
}

/* ═══════════════════════════════════════
   P4 — Düzenleme ve Silme
   ═══════════════════════════════════════ */
function _acmOpenEdit(ruleId) {
  var r = ADMIN_COMMISSION_RULES.find(function(x) { return x.id === ruleId; });
  if (!r) { _admToast('Kural bulunamadı', 'err'); return; }
  _acm.editingRuleId = ruleId;
  // Kategoriyi de bu kurala ayarla (tutarlılık için)
  _acm.category = r.category;
  _acm.form = {
    criterionA_id: r.criterionA.criterion,
    criterionA_range: r.criterionA.range,
    criterionB_id: r.criterionB.criterion,
    criterionB_range: r.criterionB.range,
    rate: String(r.rate)
  };
  _acmMountModal();
}

function _acmDeleteRule(ruleId, fromModal) {
  var idx = ADMIN_COMMISSION_RULES.findIndex(function(x) { return x.id === ruleId; });
  if (idx === -1) return;
  if (!confirm('Bu komisyon kuralı silinecek. Devam edilsin mi?')) return;
  ADMIN_COMMISSION_RULES.splice(idx, 1);
  _admToast('Kural silindi', 'ok');
  if (fromModal) _acmCloseModal();
  renderAdminCommission();
}

/* ═══════════════════════════════════════
   P5 — Dinamik İptal Komisyonları (Cezai Şartlar)
   ═══════════════════════════════════════ */
function _acmRenderCancelSection() {
  var u = ADMIN_CANCEL_COMMISSION.userCancel;
  var b = ADMIN_CANCEL_COMMISSION.bizCancel;

  var h = '<div class="acm-sect acm-cancel-sect">'
    + '<div class="acm-sect-head">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:16px;color:#EF4444"></iconify-icon>'
    + '<span>Dinamik İptal Komisyonları</span>'
    + '</div>'
    + '<div class="acm-sect-desc">Sistem genelinde çalışan cezai oranlar — mevcut komisyonun yüzdesi olarak uygulanır.</div>';

  h += _acmCancelCard('user', 'solar:user-cross-rounded-bold', '#F59E0B', u);
  h += _acmCancelCard('biz',  'solar:shop-minus-bold',           '#EF4444', b);

  h += '<div class="acm-cancel-footer">'
    + '<iconify-icon icon="solar:clock-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + 'Son güncelleme: ' + _admRelative(ADMIN_CANCEL_COMMISSION.updatedAt)
    + '</div>';

  h += '</div>';
  return h;
}

function _acmCancelCard(key, icon, color, cfg) {
  var fieldId = 'acmCancel_' + key;
  var rate = cfg.rate;
  return '<div class="acm-cancel-card" style="border-left:4px solid ' + color + '">'
    + '<div class="acm-cancel-head">'
    + '<div class="acm-cancel-icon" style="background:' + color + '18;color:' + color + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div class="acm-cancel-meta">'
    + '<div class="acm-cancel-lbl">' + _acmEsc(cfg.label) + '</div>'
    + '<div class="acm-cancel-desc">' + _acmEsc(cfg.description).replace('%X', '<b>%' + rate + '</b>') + '</div>'
    + '</div>'
    + '<div class="acm-cancel-val" id="' + fieldId + '_val" style="background:' + color + '18;color:' + color + '">%' + rate + '</div>'
    + '</div>'
    + '<div class="acm-cancel-controls">'
    + '<input type="range" class="acm-slider" id="' + fieldId + '_slider" min="0" max="100" step="1" value="' + rate + '" '
    + 'style="--c:' + color + '" '
    + 'oninput="_acmCancelChange(\'' + key + '\', this.value)" />'
    + '<div class="acm-slider-row">'
    + '<input type="number" class="acm-rate-input acm-cancel-input" id="' + fieldId + '_input" min="0" max="100" step="1" value="' + rate + '" oninput="_acmCancelChange(\'' + key + '\', this.value)" />'
    + '<span class="acm-rate-suffix">%</span>'
    + '</div>'
    + '</div>'
    + '</div>';
}

var _acmSaveTimer = null;

function _acmCancelChange(key, val) {
  var num = parseFloat(val);
  if (isNaN(num)) num = 0;
  if (num < 0) num = 0;
  if (num > 100) num = 100;

  var cfg = key === 'user' ? ADMIN_CANCEL_COMMISSION.userCancel : ADMIN_CANCEL_COMMISSION.bizCancel;
  cfg.rate = num;

  // Anında UI güncelle (input <-> slider <-> badge senkronu)
  var fieldId = 'acmCancel_' + key;
  var slider = document.getElementById(fieldId + '_slider');
  var input = document.getElementById(fieldId + '_input');
  var badge = document.getElementById(fieldId + '_val');
  if (slider && slider.value != num) slider.value = num;
  if (input && document.activeElement !== input && input.value != num) input.value = num;
  if (badge) badge.textContent = '%' + num;

  // Açıklamadaki bold yüzde
  // (Render hafifliği için sadece açıklama DOM'u ara)
  var card = slider ? slider.closest('.acm-cancel-card') : null;
  if (card) {
    var descEl = card.querySelector('.acm-cancel-desc b');
    if (descEl) descEl.textContent = '%' + num;
  }

  // Debounced toast — spam önlemek için
  if (_acmSaveTimer) clearTimeout(_acmSaveTimer);
  _acmSaveTimer = setTimeout(function() {
    ADMIN_CANCEL_COMMISSION.updatedAt = new Date().toISOString();
    _admToast('İptal oranı güncellendi', 'ok');
    // Footer relative tarihi tazele
    var footer = document.querySelector('.acm-cancel-footer');
    if (footer) {
      footer.innerHTML = '<iconify-icon icon="solar:clock-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>Son güncelleme: Az önce';
    }
  }, 600);
}

/* ═══════════════════════════════════════
   P6 — Stiller
   ═══════════════════════════════════════ */
function _acmInjectStyles() {
  if (document.getElementById('acmStyles')) return;
  var css = ''
    /* FAB */
    + '.acm-fab{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#EC4899,#F43F5E);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(236,72,153,0.35);transition:transform .15s}'
    + '.acm-fab:active{transform:scale(0.92)}'
    /* Segment */
    + '.acm-segment{display:flex;gap:2px;padding:3px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.acm-seg-btn{flex:1;padding:10px 12px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .2s}'
    + '.acm-seg-btn.active{background:var(--bg-phone);color:var(--primary);box-shadow:var(--shadow-sm)}'
    + '.acm-seg-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 6px;border-radius:var(--r-full)}'
    + '.acm-seg-btn.active .acm-seg-count{background:var(--primary);color:#fff}'
    /* Section */
    + '.acm-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.acm-sect-head{display:flex;align-items:center;gap:8px;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.acm-sect-head span{flex:1}'
    + '.acm-sect-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);margin-top:-4px}'
    + '.acm-add-inline{padding:5px 10px;border-radius:var(--r-full);border:1px solid #EC4899;background:rgba(236,72,153,0.08);color:#EC4899;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all .15s}'
    + '.acm-add-inline:hover{background:#EC489922;color:#fff;background:#EC4899}'
    /* Empty */
    + '.acm-empty{padding:36px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted)}'
    + '.acm-empty>div{font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font)}'
    + '.acm-empty-cta{padding:8px 16px;border-radius:var(--r-full);border:none;background:linear-gradient(135deg,#EC4899,#F43F5E);color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:6px}'
    /* Rule card */
    + '.acm-rules{display:flex;flex-direction:column;gap:8px}'
    + '.acm-rule{display:flex;align-items:stretch;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);transition:all .15s}'
    + '.acm-rule:hover{border-color:#EC4899;box-shadow:0 2px 8px rgba(236,72,153,0.08)}'
    + '.acm-rule-rate{min-width:68px;display:flex;align-items:center;justify-content:center;border-radius:var(--r-md);font:var(--fw-regular) 12px/1 var(--font);flex-direction:column;padding:6px 8px}'
    + '.acm-rule-rate b{font:var(--fw-bold) 20px/1 var(--font);margin-top:2px}'
    + '.acm-rule-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;justify-content:center}'
    + '.acm-rule-critline{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.acm-rule-crlbl{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)}'
    + '.acm-rule-crval{font:var(--fw-semibold) 10px/1 var(--font);padding:3px 7px;border-radius:var(--r-full)}'
    + '.acm-rule-and{font:var(--fw-bold) 9px/1 var(--font);color:var(--text-muted);letter-spacing:1px;margin:1px 0 1px 2px}'
    + '.acm-rule-actions{display:flex;flex-direction:column;gap:4px;justify-content:center}'
    + '.acm-ico-btn{width:28px;height:28px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.acm-ico-btn:hover{border-color:#EC4899;color:#EC4899;background:rgba(236,72,153,0.08)}'
    + '.acm-ico-btn.danger:hover{border-color:#EF4444;color:#EF4444;background:rgba(239,68,68,0.08)}'
    /* Modal */
    + '.acm-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.acm-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.acm-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.acm-modal-backdrop.open .acm-modal{transform:translateY(0)}'
    + '.acm-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.acm-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.acm-mtitle{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.acm-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.acm-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    /* Inner section (modal içi) */
    + '.acm-sect-in{background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:12px;display:flex;flex-direction:column;gap:8px}'
    + '.acm-sect-head-in{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.acm-field{display:flex;flex-direction:column;gap:5px}'
    + '.acm-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    /* Select */
    + '.acm-select-wrap{position:relative}'
    + '.acm-select{width:100%;box-sizing:border-box;padding:10px 32px 10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;appearance:none;-webkit-appearance:none;cursor:pointer}'
    + '.acm-select:focus{border-color:#EC4899}'
    /* Range chips */
    + '.acm-range-grid{display:flex;flex-wrap:wrap;gap:6px}'
    + '.acm-range-chip{padding:7px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.acm-range-chip:hover{background:var(--bg-phone-secondary)}'
    /* Rate input */
    + '.acm-rate-wrap{position:relative;display:flex;align-items:center}'
    + '.acm-rate-input{width:100%;box-sizing:border-box;padding:12px 36px 12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.acm-rate-input:focus{border-color:#EC4899}'
    + '.acm-rate-suffix{position:absolute;right:14px;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-muted);pointer-events:none}'
    /* Hint / Warn */
    + '.acm-hint{display:flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    + '.acm-warn{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:rgba(239,68,68,0.08);color:#EF4444;font:var(--fw-medium) 11px/1.3 var(--font)}'
    /* CTA */
    + '.acm-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#EC4899,#F43F5E);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:opacity .15s,transform .1s;box-shadow:0 4px 12px rgba(236,72,153,0.3)}'
    + '.acm-cta:hover{opacity:0.92}'
    + '.acm-cta:active{transform:scale(0.99)}'
    + '.acm-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.75}'
    + '.acm-secondary{width:100%;padding:11px;border:1px solid #EF4444;background:rgba(239,68,68,0.08);color:#EF4444;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}'
    + '.acm-secondary:hover{background:#EF4444;color:#fff}'
    /* Cancel section */
    + '.acm-cancel-sect{border-color:rgba(239,68,68,0.25)}'
    + '.acm-cancel-card{background:var(--bg-phone-secondary);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px;margin-top:6px}'
    + '.acm-cancel-head{display:flex;align-items:center;gap:10px}'
    + '.acm-cancel-icon{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.acm-cancel-meta{flex:1;min-width:0}'
    + '.acm-cancel-lbl{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}'
    + '.acm-cancel-desc{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.acm-cancel-val{padding:6px 12px;border-radius:var(--r-full);font:var(--fw-bold) var(--fs-sm)/1 var(--font);min-width:56px;text-align:center;flex-shrink:0}'
    + '.acm-cancel-controls{display:flex;flex-direction:column;gap:8px}'
    + '.acm-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:var(--r-full);background:var(--border-subtle);outline:none;cursor:pointer;--c:#EC4899}'
    + '.acm-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:var(--c);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2)}'
    + '.acm-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--c);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2)}'
    + '.acm-slider-row{display:flex;align-items:center;gap:6px;position:relative;width:120px}'
    + '.acm-cancel-input{padding:8px 32px 8px 12px;font:var(--fw-bold) var(--fs-sm)/1 var(--font)}'
    + '.acm-cancel-footer{display:flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:6px;padding-top:8px;border-top:1px solid var(--border-subtle)}';
  var s = document.createElement('style');
  s.id = 'acmStyles';
  s.textContent = css;
  document.head.appendChild(s);
}
