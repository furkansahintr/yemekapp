/* ═══════════════════════════════════════════════════════════
   BIZ RESERVATION SETTINGS — Şube Rezervasyon Ayarları
   Toggle + minimum/maksimum planlama + token bloke (sabit/kişi başı)
   ═══════════════════════════════════════════════════════════ */

var _rs = {
  branchId: null,
  draft: null  // unsaved form state (derin kopya)
};

function openBizReservationSettings(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  _rs.branchId = branchId;
  var saved = bizReservationSettings(branchId);
  _rs.draft = Object.assign({}, saved);
  _rsInjectStyles();
  _rsRender();
}

function _rsBranchName() {
  var b = BIZ_BRANCHES.find(function(x){ return x.id === _rs.branchId; });
  return b ? b.name : 'Şube';
}

function _rsRender() {
  var overlay = createBizOverlay('bizReservationSettingsOverlay', 'Rezervasyon Ayarları · ' + _rsBranchName(), _rsBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _rsBody() {
  var d = _rs.draft;
  var hasUnsaved = !_rsIsSameAsSaved();

  var summary = (d.enabled) ? _rsSummaryText(d) : '';

  return '<div class="rs-wrap">'
    // Aktivasyon Card
    + '<div class="rs-card">'
    +   '<div class="rs-row">'
    +     '<div class="rs-row-ico" style="background:rgba(34,197,94,0.12);color:#16A34A"><iconify-icon icon="solar:calendar-mark-bold" style="font-size:22px"></iconify-icon></div>'
    +     '<div class="rs-row-text">'
    +       '<div class="rs-row-title">Rezervasyon Kabul Et</div>'
    +       '<div class="rs-row-sub">Kapalıyken müşteriler bu şube için masa ayırtamaz</div>'
    +     '</div>'
    +     _rsSwitch(d.enabled, '_rsToggle()')
    +   '</div>'
    + '</div>'

    // Alt ayarlar — sadece aktifken
    + (d.enabled ? _rsActiveSettings(d) : '')

    // Yasal uyarı — hep görünür
    + '<div class="rs-legal">'
    +   '<iconify-icon icon="solar:shield-check-bold" style="font-size:16px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>'
    +   '<div>'
    +     '<div style="font:var(--fw-bold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">İptal ve Değişiklik Kuralı</div>'
    +     '<span>Kullanıcılar rezervasyonlarına <b>24 saat</b> kalana kadar ücretsiz iptal veya tarih/saat değişikliği yapabilir. Son 24 saat içerisinde sistem değişiklik veya iptal işlemine izin vermez.</span>'
    +   '</div>'
    + '</div>'

    + (summary ? '<div class="rs-summary"><iconify-icon icon="solar:info-circle-bold" style="font-size:16px;color:var(--primary);flex-shrink:0;margin-top:2px"></iconify-icon><span>' + summary + '</span></div>' : '')

    // Kaydet
    + '<button class="rs-save" onclick="_rsSave()"' + (hasUnsaved ? '' : ' disabled') + '>'
    +   '<iconify-icon icon="solar:diskette-bold" style="font-size:18px"></iconify-icon>'
    +   'Rezervasyon Ayarlarını Kaydet'
    + '</button>'

    + '</div>';
}

function _rsActiveSettings(d) {
  var earliestOpts = ['now','30m','1h','2h','6h','1day'];
  return '<div class="rs-card">'
    + '<div class="rs-section-lbl">Planlama Süresi</div>'

    // Minimum (earliest)
    + '<label class="rs-field-lbl">En erken ne zaman rezervasyon yapılabilir?</label>'
    + '<div class="rs-chip-grid">'
    +   earliestOpts.map(function(k){
          var active = d.earliestBooking === k;
          return '<div class="rs-chip' + (active ? ' active' : '') + '" onclick="_rsSetEarliest(\'' + k + '\')">' + BIZ_EARLIEST_BOOKING_LABELS[k] + '</div>';
        }).join('')
    + '</div>'

    // Maksimum
    + '<label class="rs-field-lbl" style="margin-top:14px">En fazla kaç gün sonrasına rezervasyon yapılabilir?</label>'
    + '<div class="rs-input-wrap">'
    +   '<input type="number" min="1" max="365" value="' + d.maxDaysAhead + '" oninput="_rs.draft.maxDaysAhead=parseInt(this.value)||1;_rsRerender()" class="rs-input">'
    +   '<span class="rs-input-suffix">gün</span>'
    + '</div>'

    + '</div>'

    // Token Bloke
    + '<div class="rs-card">'
    +   '<div class="rs-section-lbl">Token Bloke (Güvence)</div>'

    //   Bloke tipi
    +   '<label class="rs-field-lbl">Bloke Tipi</label>'
    +   '<div class="rs-seg">'
    +     '<div class="rs-seg-opt' + (d.blockType === 'fixed' ? ' active' : '') + '" onclick="_rsSetBlockType(\'fixed\')">'
    +       '<iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:18px"></iconify-icon>'
    +       '<div class="rs-seg-opt-lbl">Sabit Tutar</div>'
    +       '<div class="rs-seg-opt-sub">Rezervasyon başına</div>'
    +     '</div>'
    +     '<div class="rs-seg-opt' + (d.blockType === 'perPerson' ? ' active' : '') + '" onclick="_rsSetBlockType(\'perPerson\')">'
    +       '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:18px"></iconify-icon>'
    +       '<div class="rs-seg-opt-lbl">Kişi Başı</div>'
    +       '<div class="rs-seg-opt-sub">Her kişi için</div>'
    +     '</div>'
    +   '</div>'

    //   Miktar + tooltip
    +   '<div style="display:flex;align-items:center;gap:6px;margin-top:14px;margin-bottom:6px">'
    +     '<label class="rs-field-lbl" style="margin:0">Bloke Miktarı</label>'
    +     '<div style="position:relative;margin-left:auto">'
    +       '<iconify-icon icon="solar:info-circle-linear" onclick="_rsToggleTip(event)" style="font-size:17px;color:var(--text-muted);cursor:pointer"></iconify-icon>'
    +       '<div id="rsTip" class="rs-tooltip">Bu belirleyeceğiniz token, kullanıcının rezervasyona gelmemesi halinde işletmenizin cüzdanına aktarılacaktır. Bu bloke işletmeyi korumayı hedeflemektedir. Ancak bloke miktarının, kullanıcıların işletmenize gelmesini engelleyecek kadar yüksek olmamasına dikkat ediniz. Kullanıcı, rezervasyona 24 saat kala iptal veya değişiklik yapabilir; 24 saatten az süre kala yapılan iptallerde veya gelinmemesi durumunda bloke tutarı işletmeye devredilir.</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="rs-input-wrap">'
    +     '<input type="number" min="0" max="9999" value="' + d.blockAmount + '" oninput="_rs.draft.blockAmount=parseInt(this.value)||0;_rsRerender()" class="rs-input">'
    +     '<span class="rs-input-suffix">' + (d.blockType === 'perPerson' ? 'token / kişi' : 'token') + '</span>'
    +   '</div>'

    //   Kişi başı örnek
    +   (d.blockType === 'perPerson' ? '<div class="rs-example">Örnek: 10 kişilik grup için <b>' + (d.blockAmount * 10) + ' token</b> bloke edilir.</div>' : '')

    + '</div>';
}

function _rsSummaryText(d) {
  var earliest = BIZ_EARLIEST_BOOKING_LABELS[d.earliestBooking] || 'Hemen';
  return 'Şu anki ayarlara göre müşterileriniz; en erken <b>' + earliest + '</b> sonra, en geç <b>' + d.maxDaysAhead + ' gün</b> sonrasına kadar rezervasyon oluşturabilir.';
}

function _rsSwitch(on, handler) {
  return '<div class="rs-switch' + (on ? ' on' : '') + '" onclick="' + handler + '"><div class="rs-switch-dot"></div></div>';
}

function _rsRerender() {
  var overlay = document.getElementById('bizReservationSettingsOverlay');
  if (!overlay) return;
  var content = overlay.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _rsBody();
}

function _rsToggle() {
  _rs.draft.enabled = !_rs.draft.enabled;
  _rsRerender();
}
function _rsSetEarliest(key) { _rs.draft.earliestBooking = key; _rsRerender(); }
function _rsSetBlockType(t)  { _rs.draft.blockType = t; _rsRerender(); }

function _rsToggleTip(e) {
  if (e) e.stopPropagation();
  var tip = document.getElementById('rsTip');
  if (!tip) return;
  var open = tip.classList.contains('open');
  if (!open) {
    tip.classList.add('open');
    setTimeout(function(){
      document.addEventListener('click', function close(){
        tip.classList.remove('open');
        document.removeEventListener('click', close);
      }, { once: true });
    }, 0);
  } else {
    tip.classList.remove('open');
  }
}

function _rsIsSameAsSaved() {
  var s = bizReservationSettings(_rs.branchId);
  var d = _rs.draft;
  return s.enabled === d.enabled
    && s.earliestBooking === d.earliestBooking
    && s.maxDaysAhead === d.maxDaysAhead
    && s.blockType === d.blockType
    && s.blockAmount === d.blockAmount;
}

function _rsSave() {
  var d = _rs.draft;
  if (d.enabled) {
    if (!d.blockAmount || d.blockAmount < 0) {
      if (typeof _admToast === 'function') _admToast('Bloke miktarı boş veya geçersiz olamaz', 'err');
      else alert('Bloke miktarı boş veya geçersiz olamaz');
      return;
    }
    if (!d.maxDaysAhead || d.maxDaysAhead < 1) {
      if (typeof _admToast === 'function') _admToast('Maksimum planlama süresi en az 1 gün olmalı', 'err');
      else alert('Maksimum planlama süresi en az 1 gün olmalı');
      return;
    }
  }
  BIZ_RESERVATION_SETTINGS[_rs.branchId] = Object.assign({}, d, { updatedAt: new Date().toISOString() });
  if (typeof _admToast === 'function') _admToast('Rezervasyon ayarları kaydedildi', 'ok');
  var o = document.getElementById('bizReservationSettingsOverlay');
  if (o) o.remove();
  // Şube detay ekranı açıksa refresh et (tile alt metni güncellensin)
  if (typeof openBizBranchDetail === 'function' && document.getElementById('bizBranchDetailOverlay')) {
    openBizBranchDetail(_rs.branchId);
  }
}

function _rsInjectStyles() {
  if (document.getElementById('rsStyles')) return;
  var s = document.createElement('style');
  s.id = 'rsStyles';
  s.textContent = [
    '.rs-wrap{display:flex;flex-direction:column;gap:14px;padding-bottom:24px}',
    '.rs-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:16px}',
    '.rs-row{display:flex;align-items:center;gap:12px}',
    '.rs-row-ico{width:42px;height:42px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.rs-row-text{flex:1;min-width:0}',
    '.rs-row-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.rs-row-sub{font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px}',
    '.rs-switch{width:46px;height:26px;border-radius:var(--r-full);background:var(--glass-card-strong);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}',
    '.rs-switch.on{background:var(--primary)}',
    '.rs-switch-dot{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left .2s}',
    '.rs-switch.on .rs-switch-dot{left:23px}',
    '.rs-section-lbl{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:12px}',
    '.rs-field-lbl{display:block;font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);margin-bottom:8px}',
    '.rs-chip-grid{display:flex;flex-wrap:wrap;gap:6px}',
    '.rs-chip{padding:8px 12px;border:1.5px solid var(--border-subtle);border-radius:var(--r-full);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .15s}',
    '.rs-chip:hover{background:var(--bg-btn)}',
    '.rs-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.rs-input-wrap{display:flex;align-items:center;gap:8px;padding:0 12px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone)}',
    '.rs-input{flex:1;padding:12px 0;border:none;background:transparent;font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none;min-width:0}',
    '.rs-input-suffix{font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted);flex-shrink:0}',
    '.rs-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.rs-seg-opt{padding:12px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .15s;color:var(--text-secondary)}',
    '.rs-seg-opt.active{border-color:var(--primary);background:var(--primary-light);color:var(--primary)}',
    '.rs-seg-opt-lbl{font:var(--fw-bold) var(--fs-sm)/1 var(--font);margin-top:2px}',
    '.rs-seg-opt-sub{font:var(--fw-regular) 10px/1 var(--font);opacity:.75}',
    '.rs-example{margin-top:10px;padding:10px 12px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.22);border-radius:var(--r-md);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-primary)}',
    '.rs-example b{font-weight:700;color:#7C3AED}',
    '.rs-legal{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.22);border-radius:var(--r-xl);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.rs-legal b{color:#2563EB}',
    '.rs-summary{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--r-xl);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-primary)}',
    '.rs-summary b{color:var(--primary);font-weight:700}',
    '.rs-save{width:100%;padding:14px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,var(--primary),var(--primary-deep));color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(246,80,19,.3);transition:transform .15s, opacity .15s}',
    '.rs-save:active{transform:scale(.98)}',
    '.rs-save:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}',
    '.rs-tooltip{display:none;position:absolute;top:24px;right:0;width:260px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);box-shadow:var(--shadow-lg);font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary);z-index:80}',
    '.rs-tooltip.open{display:block;animation:rsTipIn .18s ease}',
    '@keyframes rsTipIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}'
  ].join('\n');
  document.head.appendChild(s);
}
