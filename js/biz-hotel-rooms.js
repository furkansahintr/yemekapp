/* ═══════════════════════════════════════════════════════════
   BIZ HOTEL ROOMS — Otel Odaları İçin (In-Room Dining)
   - Onboarding (özelliği aktif et) + profesyonel bilgilendirme
   - Yönetim sayfası: Odalar | QR Kodlar | Menü
   - Müşteri akışı simülasyonu (QR → menü → sepet → oda # → tracking)
   - Sipariş BIZ_ORDERS'a roomNumber + orderSource:'in-room-dining' ile düşer
   ═══════════════════════════════════════════════════════════ */

(function () {

  let _bhr = {
    branchId: null,
    tab: 'rooms',                                 // 'rooms' | 'qr' | 'menu'
    cust: { stage: 'scan', cart: [], room: '', orderId: null, trackStep: 0, orderTimer: null }
  };

  function _bhrConfig(branch) {
    if (!branch.hotelRooms) {
      branch.hotelRooms = {
        enabled: false,
        qrMode: 'perRoom',                        // 'generic' | 'perRoom'
        rooms: [],                                // [{ number, label, floor }]
        surcharge: 10,                            // % oda servisi farkı
        deliveryNote: 'Görevli kapıyı çalıp oda hizmetinde olduğunu bildirir.',
        activatedAt: null
      };
    }
    return branch.hotelRooms;
  }

  function _bhrInjectStyles() {
    if (document.getElementById('bhrStyles')) return;
    const s = document.createElement('style');
    s.id = 'bhrStyles';
    s.textContent = [
      '@keyframes bhrFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
      '@keyframes bhrPulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.45)}50%{box-shadow:0 0 0 14px rgba(124,58,237,0)}}',
      '@keyframes bhrTick{0%{transform:scale(.4);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}',
      '.bhr-hero{position:relative;border-radius:var(--r-xl);padding:24px 20px;background:linear-gradient(135deg,#0F172A 0%,#312E81 50%,#831843 100%);color:#fff;overflow:hidden;box-shadow:0 12px 36px rgba(15,23,42,.32)}',
      '.bhr-hero::before{content:"";position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(244,114,182,.22) 0%,rgba(244,114,182,0) 70%)}',
      '.bhr-hero::after{content:"";position:absolute;bottom:-40px;left:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.22) 0%,rgba(99,102,241,0) 70%)}',
      '.bhr-hero-icon{width:60px;height:60px;border-radius:18px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);animation:bhrFloat 3.4s ease-in-out infinite;position:relative;z-index:1}',
      '.bhr-bullet{display:flex;gap:12px;align-items:flex-start;padding:10px 0}',
      '.bhr-bullet-dot{width:34px;height:34px;border-radius:10px;background:rgba(124,58,237,.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.bhr-tabs{display:flex;gap:4px;padding:4px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-full)}',
      '.bhr-tab{flex:1;padding:10px 8px;border-radius:var(--r-full);text-align:center;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px}',
      '.bhr-tab.active{background:var(--text-primary);color:#fff}',
      '.bhr-card{border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);padding:14px 16px;display:flex;align-items:center;gap:12px}',
      '.bhr-room{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);transition:transform .12s}',
      '.bhr-room-num{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#312E81,#831843);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) var(--fs-md)/1 var(--font);flex-shrink:0;letter-spacing:.4px}',
      '.bhr-qr-card{border-radius:var(--r-xl);background:#fff;border:1px solid #E5E7EB;padding:16px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#111}',
      '.bhr-cust-banner{padding:14px 16px;border-radius:var(--r-lg);background:linear-gradient(135deg,#312E81,#831843);color:#fff;display:flex;align-items:center;gap:10px}',
      '.bhr-track-row{display:flex;align-items:flex-start;gap:14px;padding:10px 0}',
      '.bhr-track-dot{width:34px;height:34px;border-radius:50%;background:var(--bg-page);border:2px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text-muted);transition:all .25s}',
      '.bhr-track-dot.active{background:#7C3AED;border-color:#7C3AED;color:#fff;animation:bhrPulse 1.6s ease-out infinite}',
      '.bhr-track-dot.done{background:#10B981;border-color:#10B981;color:#fff;animation:bhrTick .35s ease}',
      '.bhr-track-line{width:2px;flex:0 0 2px;background:var(--border-subtle);align-self:stretch;margin:2px 0;min-height:24px}',
      '.bhr-track-line.done{background:#10B981}',
      '.bhr-cta{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:var(--r-lg);font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;border:none;width:100%;transition:transform .12s}',
      '.bhr-cta:active{transform:scale(.98)}',
      '.bhr-cta-primary{background:linear-gradient(135deg,#7C3AED,#EC4899);color:#fff;box-shadow:0 6px 18px rgba(124,58,237,.32)}',
      '.bhr-cta-ghost{background:transparent;color:var(--text-primary);border:1.5px solid var(--border-subtle)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ═══ ENTRY ═══ */
  function openBizHotelRooms(branchId) {
    _bhrInjectStyles();
    _bhr.branchId = branchId;
    _bhr.tab = 'rooms';

    const branch = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.find(b => b.id === branchId) : null;
    if (!branch) return;

    const cfg = _bhrConfig(branch);
    if (!cfg.enabled) _bhrRenderOnboarding(branch);
    else _bhrRenderMain(branch);
  }

  /* ═══ ONBOARDING ═══ */
  function _bhrRenderOnboarding(branch) {
    const content =
      '<div style="display:flex;flex-direction:column;gap:16px;padding-bottom:8px">'

      + '<div class="bhr-hero" style="display:flex;flex-direction:column;align-items:flex-start;gap:14px">'
      +   '<div class="bhr-hero-icon"><iconify-icon icon="solar:bed-bold" style="font-size:30px;color:#fff"></iconify-icon></div>'
      +   '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;position:relative;z-index:1">'
      +     '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:var(--r-full);background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22);font:var(--fw-semibold) 10px/1 var(--font);letter-spacing:.4px;text-transform:uppercase">In-Room Dining</span>'
      +     '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:var(--r-full);background:rgba(255,255,255,.08);font:var(--fw-medium) 10px/1 var(--font);color:rgba(255,255,255,.85)">Yeni Modül</span>'
      +   '</div>'
      +   '<div style="font:var(--fw-bold) var(--fs-2xl)/1.15 var(--font);position:relative;z-index:1">Otel Odaları İçin<br>Oda Servisi</div>'
      +   '<div style="font:var(--fw-regular) var(--fs-sm)/1.6 var(--font);color:rgba(255,255,255,.88);position:relative;z-index:1">Konuklarınız restoranınızı odalarından ayrılmadan keşfetsin. Tek bir QR koddan başlayan, kusursuz bir oda servisi deneyimi.</div>'
      + '</div>'

      + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:18px">'
      +   '<div style="font:var(--fw-semibold) var(--fs-md)/1.4 var(--font);color:var(--text-primary);margin-bottom:6px">Değerli işletme sahibi,</div>'
      +   '<div style="font:var(--fw-regular) var(--fs-sm)/1.65 var(--font);color:var(--text-secondary)">Bu modül; <strong>otel, butik pansiyon ve apart konaklamaların</strong> salonunu doğrudan konuğun odasına taşımak için tasarlandı. Konuklarınız restoranınıza inmek zorunda kalmadan, odalarındaki QR\'ı okutarak menünüzü görür, sipariş verir ve sıcak yemek odalarının kapısında karşılanır. Siz; mutfak ekranınızda <strong>oda numarasıyla</strong> birlikte düşen siparişi <strong>30 saniye içinde</strong> görürsünüz.<br><br>Bir QR ile başlar; konuğun favori anısına dönüşür.</div>'
      + '</div>'

      + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:8px 18px 18px">'
      +   '<div class="bhr-bullet"><div class="bhr-bullet-dot"><iconify-icon icon="solar:qr-code-bold" style="font-size:18px"></iconify-icon></div><div><div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Genel veya odaya özel QR</div><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">Tek bir lobi QR\'ı veya her oda için ayrı kod üretebilirsiniz.</div></div></div>'
      +   '<div class="bhr-bullet"><div class="bhr-bullet-dot"><iconify-icon icon="solar:dish-bold" style="font-size:18px"></iconify-icon></div><div><div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Oda servisine özel menü</div><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">Restoran menünüzden farklı fiyat veya ürün listesi tanımlayın.</div></div></div>'
      +   '<div class="bhr-bullet"><div class="bhr-bullet-dot"><iconify-icon icon="solar:bell-bing-bold" style="font-size:18px"></iconify-icon></div><div><div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Mutfağa oda numarası ile düşer</div><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">KDS ekranınızda "Oda 304" etiketiyle anında görünür.</div></div></div>'
      +   '<div class="bhr-bullet"><div class="bhr-bullet-dot"><iconify-icon icon="solar:chart-2-bold" style="font-size:18px"></iconify-icon></div><div><div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Oda bazlı performans raporu</div><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">Hangi odadan kaç sipariş geldiğini saatlik takip edin.</div></div></div>'
      + '</div>'

      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-tertiary);text-align:center;padding:0 4px">Modülü dilediğiniz zaman pasif edebilirsiniz. Konuk verileri kullanılmaz; her sipariş yalnızca oda numarası ile eşleştirilir.</div>'

      + '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">'
      +   '<button class="bhr-cta bhr-cta-primary" onclick="_bhrActivate(\'' + branch.id + '\')"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:18px"></iconify-icon>Özelliği Aktif Et</button>'
      +   '<button class="bhr-cta bhr-cta-ghost" onclick="document.getElementById(\'bizHotelRoomsOverlay\').remove()">Daha Sonra</button>'
      + '</div>'

      + '</div>';

    const overlay = createBizOverlay('bizHotelRoomsOverlay', 'Otel Odaları İçin', content);
    document.getElementById('bizPhone').appendChild(overlay);
  }

  function _bhrActivate(branchId) {
    const branch = BIZ_BRANCHES.find(b => b.id === branchId);
    if (!branch) return;
    const cfg = _bhrConfig(branch);
    cfg.enabled = true;
    cfg.activatedAt = new Date().toISOString();
    cfg.qrMode = cfg.qrMode || 'perRoom';
    if (!cfg.rooms || cfg.rooms.length === 0) {
      cfg.rooms = [
        { number: '101', label: 'Standart Oda', floor: 1 },
        { number: '102', label: 'Standart Oda', floor: 1 },
        { number: '201', label: 'Deluxe Oda',   floor: 2 },
        { number: '304', label: 'Suite',        floor: 3 }
      ];
    }
    _bhrRenderMain(branch);
    if (typeof showToast === 'function') showToast('Oda servisi modülü aktif', { icon: 'solar:check-circle-bold', color: '#10B981' });
  }

  /* ═══ MAIN: yönetim sayfası ═══ */
  function _bhrRenderMain(branch) {
    const cfg = _bhrConfig(branch);

    let content = '<div style="display:flex;flex-direction:column;gap:14px">';

    content +=
      '<div class="bhr-hero" style="padding:16px 18px;display:flex;align-items:center;gap:14px">'
      + '<div class="bhr-hero-icon" style="width:44px;height:44px;border-radius:14px"><iconify-icon icon="solar:bed-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
      + '<div style="flex:1;position:relative;z-index:1">'
      +   '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font)">Oda Servisi Aktif</div>'
      +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:rgba(255,255,255,.85);margin-top:3px">' + (cfg.rooms || []).length + ' oda · ' + (cfg.qrMode === 'perRoom' ? 'odaya özel QR' : 'tek genel QR') + '</div>'
      + '</div>'
      + '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:var(--r-full);background:rgba(34,197,94,.16);color:#86EFAC;font:var(--fw-bold) 10px/1 var(--font);letter-spacing:.3px;position:relative;z-index:1">AKTİF</span>'
      + '</div>';

    content +=
      '<div class="bhr-tabs">'
      +   _bhrTabBtn('rooms', 'solar:bed-linear',     'Odalar')
      +   _bhrTabBtn('qr',    'solar:qr-code-linear', 'QR Kodlar')
      +   _bhrTabBtn('menu',  'solar:dish-linear',    'Menü')
      + '</div>';

    content += '<div id="bhrTabBody"></div>';

    content +=
      '<div style="margin-top:8px;padding:14px;border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05));border:1px dashed rgba(124,58,237,.32);display:flex;align-items:center;gap:12px;cursor:pointer" onclick="_bhrCustomerDemo(\'' + branch.id + '\')">'
      + '<iconify-icon icon="solar:smartphone-2-bold" style="font-size:22px;color:#7C3AED;flex-shrink:0"></iconify-icon>'
      + '<div style="flex:1">'
      +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Müşteri Akışını Önizle</div>'
      +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:2px">QR okutulduğunda konuğun göreceği menü, sepet ve teslimat akışı.</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>'
      + '</div>';

    content += '</div>';

    const overlay = createBizOverlay('bizHotelRoomsOverlay', 'Oda Servisi Yönetimi', content);
    document.getElementById('bizPhone').appendChild(overlay);
    _bhrRenderTab(branch);
  }

  function _bhrTabBtn(id, icon, label) {
    const active = (_bhr.tab === id);
    return '<div class="bhr-tab' + (active ? ' active' : '') + '" onclick="_bhrSetTab(\'' + id + '\')"><iconify-icon icon="' + icon + '" style="font-size:14px"></iconify-icon>' + label + '</div>';
  }

  function _bhrSetTab(id) {
    _bhr.tab = id;
    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    if (!branch) return;
    _bhrRenderMain(branch);
  }

  function _bhrRenderTab(branch) {
    const body = document.getElementById('bhrTabBody');
    if (!body) return;
    const cfg = _bhrConfig(branch);
    if (_bhr.tab === 'rooms')      body.innerHTML = _bhrRoomsTab(branch, cfg);
    else if (_bhr.tab === 'qr')    body.innerHTML = _bhrQRTab(branch, cfg);
    else if (_bhr.tab === 'menu')  body.innerHTML = _bhrMenuTab(branch, cfg);
  }

  /* ── ROOMS TAB ── */
  function _bhrRoomsTab(branch, cfg) {
    let html = '<div style="display:flex;flex-direction:column;gap:8px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;margin-bottom:4px">';
    html +=   '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Odalar (' + (cfg.rooms || []).length + ')</div>';
    html +=   '<div onclick="_bhrAddRoom()" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:var(--r-full);background:rgba(124,58,237,.1);color:#7C3AED;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer"><iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon>Yeni Oda</div>';
    html += '</div>';
    (cfg.rooms || []).forEach(function (r) {
      html += '<div class="bhr-room">';
      html +=   '<div class="bhr-room-num">' + r.number + '</div>';
      html +=   '<div style="flex:1">';
      html +=     '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + r.label + '</div>';
      html +=     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Kat ' + r.floor + (cfg.qrMode === 'perRoom' ? ' · odaya özel QR' : ' · genel QR ile bağlı') + '</div>';
      html +=   '</div>';
      html +=   '<iconify-icon onclick="event.stopPropagation();_bhrShowRoomQR(\'' + r.number + '\')" icon="solar:qr-code-linear" style="font-size:18px;color:var(--primary);cursor:pointer;padding:6px"></iconify-icon>';
      html += '</div>';
    });
    if ((cfg.rooms || []).length === 0) {
      html += '<div style="text-align:center;padding:36px 0"><iconify-icon icon="solar:bed-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:10px">Henüz oda eklemediniz</div></div>';
    }
    html += '</div>';
    return html;
  }

  /* ── QR TAB ── */
  function _bhrQRTab(branch, cfg) {
    const baseUrl = 'https://lufga.app/h/' + branch.id;
    const isPerRoom = cfg.qrMode === 'perRoom';
    let html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:6px;display:flex;gap:6px">';
    html +=   '<div onclick="_bhrSetQRMode(\'perRoom\')" style="flex:1;padding:10px 6px;text-align:center;border-radius:calc(var(--r-lg) - 4px);font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);cursor:pointer;background:' + (isPerRoom ? 'var(--text-primary)' : 'transparent') + ';color:' + (isPerRoom ? '#fff' : 'var(--text-secondary)') + '"><iconify-icon icon="solar:bed-bold" style="font-size:14px;vertical-align:-2px;margin-right:4px"></iconify-icon>Odaya Özel<div style="font:var(--fw-regular) 10px/1.3 var(--font);margin-top:3px;opacity:.85">Her oda ayrı QR</div></div>';
    html +=   '<div onclick="_bhrSetQRMode(\'generic\')" style="flex:1;padding:10px 6px;text-align:center;border-radius:calc(var(--r-lg) - 4px);font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);cursor:pointer;background:' + (!isPerRoom ? 'var(--text-primary)' : 'transparent') + ';color:' + (!isPerRoom ? '#fff' : 'var(--text-secondary)') + '"><iconify-icon icon="solar:globe-bold" style="font-size:14px;vertical-align:-2px;margin-right:4px"></iconify-icon>Tek Genel<div style="font:var(--fw-regular) 10px/1.3 var(--font);margin-top:3px;opacity:.85">Lobi/her oda aynı</div></div>';
    html += '</div>';

    if (!isPerRoom) {
      const data = baseUrl + '?q=generic';
      html += '<div class="bhr-qr-card">';
      html +=   '<img src="' + _bhrQrImg(data, 220) + '" width="220" height="220" alt="QR" style="background:#fff">';
      html +=   '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#111;margin-top:6px">Genel Oda Servisi QR</div>';
      html +=   '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:#555;text-align:center;max-width:240px">Lobiye veya her odaya yapıştırabilirsiniz. Konuk QR\'ı okuttuktan sonra oda numarasını kendisi seçer.</div>';
      html += '</div>';
      html += '<button class="bhr-cta bhr-cta-primary"><iconify-icon icon="solar:download-bold" style="font-size:18px"></iconify-icon>QR\'ı PDF Olarak İndir</button>';
    } else {
      html += '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);padding:0 4px;display:flex;align-items:center;justify-content:space-between"><span>Oda QR\'ları</span><span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + (cfg.rooms || []).length + ' adet</span></div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
      (cfg.rooms || []).forEach(function (r) {
        const data = baseUrl + '?room=' + encodeURIComponent(r.number);
        html += '<div class="bhr-qr-card" style="padding:12px;gap:6px">';
        html +=   '<img src="' + _bhrQrImg(data, 130) + '" width="130" height="130" alt="QR" style="background:#fff">';
        html +=   '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#111">Oda ' + r.number + '</div>';
        html +=   '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:#666">' + r.label + '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '<button class="bhr-cta bhr-cta-primary"><iconify-icon icon="solar:download-bold" style="font-size:18px"></iconify-icon>Tüm QR\'ları PDF Olarak İndir</button>';
    }
    html += '</div>';
    return html;
  }

  function _bhrSetQRMode(mode) {
    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    if (!branch) return;
    _bhrConfig(branch).qrMode = mode;
    _bhrRenderTab(branch);
  }

  function _bhrAddRoom() {
    const num = prompt('Yeni oda numarası:');
    if (!num) return;
    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    if (!branch) return;
    const cfg = _bhrConfig(branch);
    cfg.rooms.push({ number: String(num).trim(), label: 'Standart Oda', floor: 1 });
    _bhrRenderTab(branch);
    if (typeof showToast === 'function') showToast('Oda ' + num + ' eklendi', { icon: 'solar:check-circle-bold', color: '#10B981' });
  }

  function _bhrShowRoomQR(roomNum) {
    if (typeof showToast === 'function') showToast('Oda ' + roomNum + ' QR kodu hazır', { icon: 'solar:qr-code-bold', color: '#7C3AED' });
  }

  /* ── MENU TAB ── */
  function _bhrMenuTab(branch, cfg) {
    const total = (typeof BIZ_MENU_ITEMS !== 'undefined') ? BIZ_MENU_ITEMS.filter(m => m.branchId === branch.id).length : 24;
    const inRoomItems = Math.max(8, Math.round(total * 0.7));
    let html = '<div style="display:flex;flex-direction:column;gap:10px">';

    html += '<div class="bhr-card">';
    html +=   '<iconify-icon icon="solar:dish-bold" style="font-size:22px;color:#F59E0B"></iconify-icon>';
    html +=   '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Oda Servisi Menüsü</div><div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + inRoomItems + '/' + total + ' ürün · özel fiyat aktif</div></div>';
    html +=   '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#16A34A;background:rgba(34,197,94,.14);padding:5px 10px;border-radius:var(--r-full)">AÇIK</div>';
    html += '</div>';

    html += '<div class="bhr-card">';
    html +=   '<iconify-icon icon="solar:tag-bold" style="font-size:20px;color:#7C3AED"></iconify-icon>';
    html +=   '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Oda Servisi Ek Ücreti</div><div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Her sipariş için ara toplama eklenir</div></div>';
    html +=   '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#7C3AED">%' + (cfg.surcharge || 10) + '</div>';
    html += '</div>';

    html += '<div class="bhr-card">';
    html +=   '<iconify-icon icon="solar:cup-hot-bold" style="font-size:22px;color:#EA580C"></iconify-icon>';
    html +=   '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Servis Saatleri</div><div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">07:00 — 23:00 · Geç saat menüsü 23:00 sonrası</div></div>';
    html +=   '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>';
    html += '</div>';

    html += '<button class="bhr-cta bhr-cta-ghost" onclick="if(typeof bizActiveBranch!==\'undefined\'){bizActiveBranch=\'' + branch.id + '\';}if(typeof openBizMenuMgmt===\'function\')openBizMenuMgmt(\'full\')"><iconify-icon icon="solar:pen-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>Menüyü Düzenle</button>';

    html += '</div>';
    return html;
  }

  /* ── QR helper ── */
  function _bhrQrImg(data, size) {
    size = size || 220;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&margin=8&data=' + encodeURIComponent(data);
  }

  /* ═══ CUSTOMER FLOW SIMULATION ═══ */
  function _bhrCustomerDemo(branchId) {
    const branch = BIZ_BRANCHES.find(b => b.id === branchId);
    if (!branch) return;
    if (_bhr.cust.orderTimer) { try { clearInterval(_bhr.cust.orderTimer); } catch (_) {} }
    _bhr.cust = { stage: 'scan', cart: [], room: '', orderId: null, trackStep: 0, orderTimer: null };
    _bhrCustRender();
  }

  function _bhrCustRender() {
    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    if (!branch) return;
    const c = _bhr.cust;

    let body = '';
    body += '<div class="bhr-cust-banner" style="margin-bottom:14px">';
    body += '<iconify-icon icon="solar:bed-bold" style="font-size:18px;color:#fff"></iconify-icon>';
    body += '<div style="flex:1"><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font)">' + branch.name + ' · Oda Servisi</div><div style="font:var(--fw-regular) 10.5px/1.3 var(--font);color:rgba(255,255,255,.85);margin-top:2px">Müşteri Akışı Önizleme</div></div>';
    body += '</div>';

    if (c.stage === 'scan')          body += _bhrCustScanScreen();
    else if (c.stage === 'menu')     body += _bhrCustMenuScreen();
    else if (c.stage === 'cart')     body += _bhrCustCartScreen();
    else if (c.stage === 'room')     body += _bhrCustRoomScreen();
    else if (c.stage === 'tracking') body += _bhrCustTrackingScreen();

    const existing = document.getElementById('bhrCustOverlay');
    if (existing) existing.remove();
    const overlay = createBizOverlay('bhrCustOverlay', 'Müşteri Akışı (Demo)', body);
    document.getElementById('bizPhone').appendChild(overlay);
  }

  function _bhrCustScanScreen() {
    return ''
      + '<div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:16px 0">'
      +   '<div style="background:#fff;padding:18px;border-radius:var(--r-xl);box-shadow:0 6px 18px rgba(0,0,0,.08)">'
      +     '<img src="' + _bhrQrImg('https://lufga.app/h/demo?room=304', 200) + '" width="200" height="200" alt="QR">'
      +   '</div>'
      +   '<div style="text-align:center"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">QR\'ı Kameraya Tut</div><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:6px;max-width:280px">Konuk odasındaki QR kodu okutuyor. <strong>Oda 304</strong> algılandı.</div></div>'
      +   '<button class="bhr-cta bhr-cta-primary" style="max-width:280px" onclick="_bhrCustNext(\'menu\',\'304\')"><iconify-icon icon="solar:scanner-bold" style="font-size:18px"></iconify-icon>Demoda Tara</button>'
      + '</div>';
  }

  function _bhrCustNext(stage, room) {
    if (room) _bhr.cust.room = room;
    _bhr.cust.stage = stage;
    _bhrCustRender();
  }

  function _bhrCustMenuScreen() {
    const items = [
      { id: 'm1', name: 'Karışık Mezeler',      price: 95,  img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
      { id: 'm2', name: 'Sezar Salata',         price: 85,  img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
      { id: 'm3', name: 'Burger & Patates',     price: 130, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
      { id: 'm4', name: 'Izgara Levrek',        price: 185, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop' },
      { id: 'm5', name: 'Tiramisu',             price: 65,  img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop' },
      { id: 'm6', name: 'Türk Kahvesi',         price: 35,  img: 'https://images.unsplash.com/photo-1579992357154-faf4e039e3a4?w=200&h=200&fit=crop' }
    ];
    const cartCount = _bhr.cust.cart.reduce((s, i) => s + i.qty, 0);
    const cartTotal = _bhr.cust.cart.reduce((s, i) => s + i.qty * i.price, 0);

    let html = '<div style="display:flex;flex-direction:column;gap:12px;padding-bottom:80px">';
    html += '<div style="background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05));border:1px solid rgba(124,58,237,.18);border-radius:var(--r-lg);padding:12px 14px;display:flex;align-items:center;gap:10px"><iconify-icon icon="solar:bed-bold" style="font-size:18px;color:#7C3AED"></iconify-icon><div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#7C3AED">Oda ' + _bhr.cust.room + '</div><div style="font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted);margin-top:2px">Sipariş odanıza teslim edilecek</div></div></div>';

    html += '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:4px">Oda Servisi Menüsü</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    items.forEach(function (it) {
      const inCart = _bhr.cust.cart.find(c => c.id === it.id);
      html += '<div class="bhr-card" style="gap:12px">';
      html +=   '<img src="' + it.img + '" style="width:54px;height:54px;border-radius:12px;object-fit:cover">';
      html +=   '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + it.name + '</div><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);margin-top:4px">₺' + it.price + '</div></div>';
      if (inCart) {
        html += '<div style="display:flex;align-items:center;gap:8px"><div onclick="_bhrCustCart(\'' + it.id + '\',-1)" style="width:28px;height:28px;border-radius:50%;background:var(--bg-page);border:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;font:var(--fw-bold) var(--fs-md)/1 var(--font)">−</div><span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);min-width:14px;text-align:center">' + inCart.qty + '</span><div onclick="_bhrCustCart(\'' + it.id + '\',1)" style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font:var(--fw-bold) var(--fs-md)/1 var(--font)">+</div></div>';
      } else {
        html += '<div onclick="_bhrCustAdd(\'' + it.id + '\',\'' + it.name + '\',' + it.price + ')" style="padding:7px 14px;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer">+ Sepete</div>';
      }
      html += '</div>';
    });
    html += '</div>';

    if (cartCount > 0) {
      html += '<div style="position:sticky;bottom:0;background:linear-gradient(180deg,transparent,var(--bg-page) 30%);padding:14px 0 8px"><button class="bhr-cta bhr-cta-primary" onclick="_bhrCustNext(\'cart\')"><iconify-icon icon="solar:cart-large-bold" style="font-size:18px"></iconify-icon>Sepete Git · ' + cartCount + ' ürün · ₺' + cartTotal.toFixed(0) + '</button></div>';
    }
    html += '</div>';
    return html;
  }

  function _bhrCustAdd(id, name, price) {
    _bhr.cust.cart.push({ id: id, name: name, price: price, qty: 1 });
    _bhrCustRender();
  }

  function _bhrCustCart(id, delta) {
    const item = _bhr.cust.cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) _bhr.cust.cart = _bhr.cust.cart.filter(c => c.id !== id);
    _bhrCustRender();
  }

  function _bhrCustCartScreen() {
    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    const cfg = _bhrConfig(branch);
    const subtotal = _bhr.cust.cart.reduce((s, i) => s + i.qty * i.price, 0);
    const surchargeRate = (cfg.surcharge || 10) / 100;
    const surchargeAmount = Math.round(subtotal * surchargeRate);
    const total = subtotal + surchargeAmount;

    let html = '<div style="display:flex;flex-direction:column;gap:12px">';
    html += '<div onclick="_bhrCustNext(\'menu\')" style="display:inline-flex;align-items:center;gap:4px;color:var(--primary);cursor:pointer;font:var(--fw-medium) var(--fs-sm)/1 var(--font)"><iconify-icon icon="solar:arrow-left-outline" style="font-size:16px"></iconify-icon>Menüye Dön</div>';
    html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Sepetiniz</div>';

    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    _bhr.cust.cart.forEach(function (it) {
      html += '<div class="bhr-card"><div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + it.name + '</div><div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + it.qty + ' × ₺' + it.price + '</div></div><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">₺' + (it.qty * it.price).toFixed(0) + '</div></div>';
    });
    html += '</div>';

    html += '<div class="bhr-card" style="flex-direction:column;align-items:stretch;gap:8px">';
    html +=   '<div style="display:flex;justify-content:space-between"><span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">Ara Toplam</span><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">₺' + subtotal.toFixed(0) + '</span></div>';
    html +=   '<div style="display:flex;justify-content:space-between"><span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">Oda Servisi (%' + (cfg.surcharge || 10) + ')</span><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#7C3AED">+ ₺' + surchargeAmount + '</span></div>';
    html +=   '<div style="height:1px;background:var(--border-subtle);margin:4px 0"></div>';
    html +=   '<div style="display:flex;justify-content:space-between"><span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Toplam</span><span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)">₺' + total + '</span></div>';
    html += '</div>';

    html += '<button class="bhr-cta bhr-cta-primary" onclick="_bhrCustNext(\'room\')"><iconify-icon icon="solar:arrow-right-bold" style="font-size:18px"></iconify-icon>Devam Et · Oda Bilgisi</button>';
    html += '</div>';
    return html;
  }

  function _bhrCustRoomScreen() {
    let html = '<div style="display:flex;flex-direction:column;gap:14px">';
    html += '<div onclick="_bhrCustNext(\'cart\')" style="display:inline-flex;align-items:center;gap:4px;color:var(--primary);cursor:pointer;font:var(--fw-medium) var(--fs-sm)/1 var(--font)"><iconify-icon icon="solar:arrow-left-outline" style="font-size:16px"></iconify-icon>Sepete Dön</div>';
    html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Oda Bilgileri</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">Siparişiniz <strong>' + _bhr.cust.room + '</strong> numaralı odaya teslim edilecek. Farklı bir oda için aşağıdan değiştirin.</div>';
    html += '<div class="g-input-wrap"><iconify-icon icon="solar:bed-bold" style="font-size:18px;color:#7C3AED"></iconify-icon><div class="g-input-content"><label>Oda Numarası</label><input id="bhrRoomInput" value="' + _bhr.cust.room + '" style="border:none;outline:none;background:transparent;font:var(--fw-regular) var(--fs-md)/1.2 var(--font);color:var(--text-primary);width:100%;padding:0"></div></div>';
    html += '<div class="g-input-wrap"><iconify-icon icon="solar:notes-bold" style="font-size:18px"></iconify-icon><div class="g-input-content"><label>Not (opsiyonel)</label><input id="bhrNoteInput" placeholder="Örn: kapıyı çalmadan bırakın" style="border:none;outline:none;background:transparent;font:var(--fw-regular) var(--fs-md)/1.2 var(--font);color:var(--text-primary);width:100%;padding:0"></div></div>';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--r-lg);background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.18)"><iconify-icon icon="solar:wallet-bold" style="font-size:18px;color:#7C3AED;flex-shrink:0"></iconify-icon><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">Ödeme oda hesabınıza işlenir. Çıkışta resepsiyondan görüntüleyebilirsiniz.</div></div>';
    html += '<button class="bhr-cta bhr-cta-primary" onclick="_bhrCustPlaceOrder()"><iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon>Siparişi Onayla</button>';
    html += '</div>';
    return html;
  }

  function _bhrCustPlaceOrder() {
    const input = document.getElementById('bhrRoomInput');
    const note  = document.getElementById('bhrNoteInput');
    if (input) _bhr.cust.room = input.value.trim() || _bhr.cust.room;
    const noteVal = (note && note.value.trim()) || null;

    const branch = BIZ_BRANCHES.find(b => b.id === _bhr.branchId);
    const cfg = _bhrConfig(branch);
    const subtotal = _bhr.cust.cart.reduce((s, i) => s + i.qty * i.price, 0);
    const surchargeAmount = Math.round(subtotal * ((cfg.surcharge || 10) / 100));
    const total = subtotal + surchargeAmount;
    const orderId = '#H' + Math.floor(1000 + Math.random() * 9000);

    if (typeof BIZ_ORDERS !== 'undefined') {
      BIZ_ORDERS.unshift({
        id: orderId,
        branchId: branch.id,
        type: 'hotel-room',
        orderSource: 'in-room-dining',
        tableId: null,
        tableNumber: null,
        roomNumber: _bhr.cust.room,
        customerName: 'Oda ' + _bhr.cust.room + ' Konuğu',
        customerPhone: null,
        customerAddress: branch.name + ' · Oda ' + _bhr.cust.room,
        customerNote: noteVal,
        items: _bhr.cust.cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
        total: total,
        paymentMethod: 'room-charge',
        status: 'pending',
        createdAt: new Date().toISOString(),
        prepStartedAt: null,
        completedAt: null,
        waiterName: null
      });
    }

    _bhr.cust.orderId = orderId;
    _bhr.cust.stage = 'tracking';
    _bhr.cust.trackStep = 0;
    _bhrCustRender();

    if (_bhr.cust.orderTimer) clearInterval(_bhr.cust.orderTimer);
    let step = 0;
    _bhr.cust.orderTimer = setInterval(function () {
      step++;
      _bhr.cust.trackStep = step;
      if (document.getElementById('bhrCustOverlay')) _bhrCustRender();
      if (step >= 3) { clearInterval(_bhr.cust.orderTimer); _bhr.cust.orderTimer = null; }
    }, 2200);
  }

  function _bhrCustTrackingScreen() {
    const steps = [
      { icon: 'solar:check-circle-bold', title: 'Siparişiniz Alındı',   desc: 'Mutfağa iletildi · oda numarası eklendi' },
      { icon: 'solar:cup-hot-bold',      title: 'Hazırlanıyor',          desc: 'Şefimiz siparişinize başladı' },
      { icon: 'solar:running-2-bold',    title: 'Yola Çıktı',            desc: 'Görevli odanıza doğru geliyor' },
      { icon: 'solar:bed-bold',          title: 'Odaya Teslim Edildi',   desc: 'Afiyet olsun!' }
    ];
    const cur = _bhr.cust.trackStep || 0;

    let html = '<div style="display:flex;flex-direction:column;gap:14px">';
    html += '<div class="bhr-hero" style="display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 18px">';
    html +=   '<div class="bhr-hero-icon" style="width:48px;height:48px;border-radius:14px"><iconify-icon icon="solar:bell-bing-bold" style="font-size:24px;color:#fff"></iconify-icon></div>';
    html +=   '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:#fff;position:relative;z-index:1">Sipariş ' + _bhr.cust.orderId + '</div>';
    html +=   '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:rgba(255,255,255,.85);position:relative;z-index:1">Oda ' + _bhr.cust.room + ' · canlı takip</div>';
    html += '</div>';

    html += '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px 18px">';
    steps.forEach(function (s, idx) {
      const state = idx < cur ? 'done' : idx === cur ? 'active' : '';
      const isLast = idx === steps.length - 1;
      html += '<div class="bhr-track-row">';
      html +=   '<div style="display:flex;flex-direction:column;align-items:center;align-self:stretch">';
      html +=     '<div class="bhr-track-dot ' + state + '"><iconify-icon icon="' + s.icon + '" style="font-size:16px"></iconify-icon></div>';
      if (!isLast) html += '<div class="bhr-track-line ' + (idx < cur ? 'done' : '') + '"></div>';
      html +=   '</div>';
      html +=   '<div style="flex:1;padding:6px 0 14px">';
      html +=     '<div style="font:var(--fw-' + (state === 'active' ? 'bold' : 'semibold') + ') var(--fs-sm)/1.2 var(--font);color:' + (state ? 'var(--text-primary)' : 'var(--text-muted)') + '">' + s.title + '</div>';
      html +=     '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:3px">' + s.desc + '</div>';
      html +=   '</div>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--r-lg);background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22)"><iconify-icon icon="solar:bell-bing-bold" style="font-size:18px;color:#16A34A;flex-shrink:0"></iconify-icon><div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary)">Görevli kapıyı çalıp oda hizmetinde olduğunu bildirir.</div></div>';

    html += '<button class="bhr-cta bhr-cta-ghost" onclick="document.getElementById(\'bhrCustOverlay\').remove()">Demoyu Kapat</button>';
    html += '</div>';
    return html;
  }

  /* ═══ EXPORTS ═══ */
  window.openBizHotelRooms  = openBizHotelRooms;
  window._bhrActivate       = _bhrActivate;
  window._bhrSetTab         = _bhrSetTab;
  window._bhrSetQRMode      = _bhrSetQRMode;
  window._bhrAddRoom        = _bhrAddRoom;
  window._bhrShowRoomQR     = _bhrShowRoomQR;
  window._bhrCustomerDemo   = _bhrCustomerDemo;
  window._bhrCustNext       = _bhrCustNext;
  window._bhrCustAdd        = _bhrCustAdd;
  window._bhrCustCart       = _bhrCustCart;
  window._bhrCustPlaceOrder = _bhrCustPlaceOrder;

})();
