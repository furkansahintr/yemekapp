/* ═══ BIZ DELIVERY SETTINGS COMPONENT ═══
 * İşletme Teslimat Alanı ve Maliyet Yönetimi (Merkez Odaklı Akış)
 *
 * Akış:
 * 1. Sistem, şubenin kayıtlı koordinatlarını referans alır.
 * 2. En yakın mahalleler otomatik listelenir.
 * 3. Mahalleler seçildikçe dış çember (daha uzak) mahalleler yüklenir.
 * 4. Seçilen mahalleler "Teslimat Bölgeleri" olarak gruplandırılır.
 * 5. Her bölgeye teslimat ücreti ve minimum sepet tutarı atanır.
 */

/* ═══ HAVERSINE DISTANCE HELPER (km) ═══ */
function _dsMesafeHesapla(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ═══ STATE ═══ */
let _dsCurrentBranchId = null;
let _dsVisibleRadius = 3;          // km — başlangıçta yakın mahalleler
let _dsMaxRadius = 15;             // km — maksimum genişleme sınırı
let _dsRadiusStep = 3;             // km — her "Daha Fazla" adımı
let _dsSelectedNeighborhoods = []; // geçici seçim listesi (henüz bölgeye atanmamış)

/* ═══ MAIN ENTRY: Teslimat Ayarları Sayfası ═══ */
function openBizDeliverySettings(branchId) {
  _dsCurrentBranchId = branchId;
  _dsVisibleRadius = 3;
  _dsSelectedNeighborhoods = [];

  _dsRenderPage();
}

/* ═══ GET SORTED NEIGHBORHOODS BY DISTANCE ═══ */
function _dsGetSortedNeighborhoods() {
  const coords = BIZ_BRANCH_COORDS[_dsCurrentBranchId];
  if (!coords) return [];

  return BIZ_NEIGHBORHOODS.map(mh => {
    const dist = _dsMesafeHesapla(coords.lat, coords.lng, mh.lat, mh.lng);
    return { ...mh, distance: dist };
  }).sort((a, b) => a.distance - b.distance);
}

/* ═══ GET NEIGHBORHOODS ALREADY ASSIGNED TO A ZONE ═══ */
function _dsGetAssignedIds() {
  const zones = BIZ_DELIVERY_ZONES.filter(z => z.branchId === _dsCurrentBranchId);
  const ids = new Set();
  zones.forEach(z => z.neighborhoodIds.forEach(id => ids.add(id)));
  return ids;
}

/* ═══ RENDER FULL PAGE ═══ */
function _dsRenderPage() {
  const branch = BIZ_BRANCHES.find(b => b.id === _dsCurrentBranchId);
  if (!branch) return;

  const zones = BIZ_DELIVERY_ZONES.filter(z => z.branchId === _dsCurrentBranchId);
  const coords = BIZ_BRANCH_COORDS[_dsCurrentBranchId];
  const assignedIds = _dsGetAssignedIds();
  const sorted = _dsGetSortedNeighborhoods();
  const visible = sorted.filter(mh => mh.distance <= _dsVisibleRadius);
  const hasMore = sorted.some(mh => mh.distance > _dsVisibleRadius && mh.distance <= _dsMaxRadius);

  // Toplam istatistikler
  const totalNeighborhoods = zones.reduce((sum, z) => sum + z.neighborhoodIds.length, 0);
  const avgFee = zones.length > 0 ? Math.round(zones.reduce((sum, z) => sum + z.deliveryFee, 0) / zones.length) : 0;

  const content = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Konum Özet Kartı -->
      <div style="background:linear-gradient(135deg,#F65013 0%,#D44410 100%);border-radius:var(--r-xl);padding:18px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-20px;top:-20px;opacity:0.1">
          <iconify-icon icon="solar:map-point-bold" style="font-size:120px"></iconify-icon>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <iconify-icon icon="solar:map-point-bold" style="font-size:22px"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font)">Şube Konumu</span>
        </div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);opacity:0.9;margin-bottom:4px">${escHtml(branch.address)}</div>
        <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.7">${coords ? coords.lat.toFixed(4) + '°N, ' + coords.lng.toFixed(4) + '°E' : 'Koordinat tanımlı değil'}</div>
      </div>

      <!-- Hızlı İstatistikler -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--primary)">${zones.length}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Bölge</div>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:#22C55E">${totalNeighborhoods}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Mahalle</div>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:#F59E0B">${avgFee}₺</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Ort. Ücret</div>
        </div>
      </div>

      <!-- Mevcut Teslimat Bölgeleri -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:map-arrow-square-bold" style="font-size:18px;color:#6366F1"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Teslimat Bölgeleri</span>
          </div>
          <div onclick="_dsOpenCreateZone()" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:3px">
            <iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon> Yeni Bölge
          </div>
        </div>

        ${zones.length === 0 ? `
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);padding:32px 16px;text-align:center">
          <iconify-icon icon="solar:map-linear" style="font-size:40px;color:var(--text-tertiary);margin-bottom:8px"></iconify-icon>
          <div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)">Henüz teslimat bölgesi tanımlı değil</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px">Hizmet alanınızı oluşturmak için "Yeni Bölge" butonuna tıklayın</div>
        </div>
        ` : `
        <div style="display:flex;flex-direction:column;gap:10px">
          ${zones.map(zone => {
            const mhNames = zone.neighborhoodIds.map(id => {
              const mh = BIZ_NEIGHBORHOODS.find(m => m.id === id);
              return mh ? mh.name : '';
            }).filter(Boolean);

            return `
            <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
              <div style="padding:14px 16px;display:flex;align-items:center;gap:12px">
                <div style="width:40px;height:40px;border-radius:50%;background:${zone.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <iconify-icon icon="solar:map-point-bold" style="font-size:20px;color:${zone.color}"></iconify-icon>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(zone.name)}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">
                    <span style="font:var(--fw-medium) 10px/1 var(--font);color:${zone.color};background:${zone.color}15;padding:3px 8px;border-radius:var(--r-full)">${zone.distanceLabel}</span>
                    <span style="font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)">${zone.neighborhoodIds.length} mahalle</span>
                  </div>
                </div>
                <div onclick="_dsOpenEditZone('${zone.id}')" class="btn-icon" style="flex-shrink:0">
                  <iconify-icon icon="solar:pen-2-linear" style="font-size:16px"></iconify-icon>
                </div>
              </div>
              <!-- Bölge Detayları -->
              <div style="padding:0 16px 14px;display:flex;gap:12px">
                <div style="flex:1;background:var(--bg-page);border-radius:var(--r-md);padding:10px;text-align:center">
                  <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${zone.deliveryFee}₺</div>
                  <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">Teslimat Ücreti</div>
                </div>
                <div style="flex:1;background:var(--bg-page);border-radius:var(--r-md);padding:10px;text-align:center">
                  <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${zone.minCartAmount}₺</div>
                  <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">Min. Sepet</div>
                </div>
                <div style="flex:1;background:var(--bg-page);border-radius:var(--r-md);padding:10px;text-align:center">
                  <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${zone.estimatedTime}</div>
                  <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">Tahmini Süre</div>
                </div>
              </div>
              <!-- Mahalle Listesi -->
              <div style="padding:0 16px 14px">
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  ${mhNames.map(name => `
                    <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);background:var(--bg-page);border:1px solid var(--border-subtle);padding:5px 10px;border-radius:var(--r-full)">${escHtml(name)}</span>
                  `).join('')}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
        `}
      </div>

      <!-- Mahalle Keşfi (Kademeli) -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:streets-map-point-bold" style="font-size:18px;color:#0EA5E9"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Yakın Mahalleler</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${_dsVisibleRadius} km çevre</span>
        </div>

        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          ${visible.map((mh, i) => {
            const isAssigned = assignedIds.has(mh.id);
            const isSelected = _dsSelectedNeighborhoods.includes(mh.id);
            const distText = mh.distance < 1 ? (mh.distance * 1000).toFixed(0) + ' m' : mh.distance.toFixed(1) + ' km';
            const statusIcon = isAssigned ? 'solar:check-circle-bold' : isSelected ? 'solar:check-square-bold' : 'solar:square-linear';
            const statusColor = isAssigned ? '#22C55E' : isSelected ? 'var(--primary)' : 'var(--text-tertiary)';
            return `
            <div onclick="${isAssigned ? '' : '_dsToggleNeighborhood(\'' + mh.id + '\')'}" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:${isAssigned ? 'default' : 'pointer'}${i < visible.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}${isAssigned ? ';opacity:0.6' : ''}">
              <iconify-icon icon="${statusIcon}" style="font-size:20px;color:${statusColor};flex-shrink:0"></iconify-icon>
              <div style="flex:1;min-width:0">
                <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(mh.name)}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${escHtml(mh.district)} · ${distText}</div>
              </div>
              ${isAssigned ? '<span style="font:var(--fw-medium) 10px/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.08);padding:3px 8px;border-radius:var(--r-full)">Atandı</span>' : ''}
            </div>`;
          }).join('')}

          ${visible.length === 0 ? `
          <div style="padding:24px 16px;text-align:center">
            <div style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted)">Bu yarıçapta mahalle bulunamadı</div>
          </div>
          ` : ''}
        </div>

        <!-- Kademeli Genişleme Butonu -->
        ${hasMore ? `
        <div onclick="_dsExpandRadius()" style="margin-top:10px;padding:14px;background:var(--bg-phone);border:1px dashed var(--border-subtle);border-radius:var(--r-xl);text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          <iconify-icon icon="solar:add-circle-linear" style="font-size:18px;color:var(--primary)"></iconify-icon>
          <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--primary)">Daha Uzak Mahalleleri Göster (+${_dsRadiusStep} km)</span>
        </div>
        ` : `
        <div style="margin-top:8px;padding:10px;text-align:center">
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">Tüm yakın mahalleler listelendi (${_dsVisibleRadius} km yarıçap)</span>
        </div>
        `}
      </div>

      <!-- Seçili Mahalleler Aksiyonu -->
      ${_dsSelectedNeighborhoods.length > 0 ? `
      <div style="position:sticky;bottom:0;background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--primary);box-shadow:var(--shadow-lg);padding:14px 16px;display:flex;align-items:center;gap:12px">
        <div style="flex:1">
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${_dsSelectedNeighborhoods.length} mahalle seçili</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Bir bölgeye atayın veya yeni bölge oluşturun</div>
        </div>
        <button onclick="_dsAssignToZonePrompt()" style="padding:10px 18px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;white-space:nowrap">
          Bölgeye Ata
        </button>
      </div>
      ` : ''}

      <!-- Bilgi Notu -->
      <div style="background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.2);border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;gap:10px">
        <iconify-icon icon="solar:info-circle-bold" style="font-size:18px;color:#0EA5E9;flex-shrink:0;margin-top:1px"></iconify-icon>
        <div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-secondary)">
          Müşteri adresini girdiğinde, sistem koordinatları karşılaştırır. Eğer adres tanımlı bölgelerden birindeyse sipariş başlar; aksi halde "İşletme bölgenize hizmet vermiyor" uyarısı döner.
        </div>
      </div>

      <div style="height:20px"></div>
    </div>
  `;

  const existing = document.getElementById('bizDeliverySettingsOverlay');
  if (existing) existing.remove();

  const overlay = createBizOverlay('bizDeliverySettingsOverlay', 'Teslimat Ayarları', content);
  document.getElementById('bizPhone').appendChild(overlay);
}

/* ═══ TOGGLE NEIGHBORHOOD SELECTION ═══ */
function _dsToggleNeighborhood(mhId) {
  const idx = _dsSelectedNeighborhoods.indexOf(mhId);
  if (idx > -1) {
    _dsSelectedNeighborhoods.splice(idx, 1);
  } else {
    _dsSelectedNeighborhoods.push(mhId);
  }
  _dsRenderPage();
}

/* ═══ EXPAND RADIUS (Kademeli Keşif) ═══ */
function _dsExpandRadius() {
  _dsVisibleRadius = Math.min(_dsVisibleRadius + _dsRadiusStep, _dsMaxRadius);
  _dsRenderPage();
}

/* ═══ ASSIGN SELECTED NEIGHBORHOODS TO ZONE ═══ */
function _dsAssignToZonePrompt() {
  const zones = BIZ_DELIVERY_ZONES.filter(z => z.branchId === _dsCurrentBranchId);
  const selectedNames = _dsSelectedNeighborhoods.map(id => {
    const mh = BIZ_NEIGHBORHOODS.find(m => m.id === id);
    return mh ? mh.name : id;
  });

  const existingModal = document.getElementById('dsAssignModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'dsAssignModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:90;display:flex;align-items:flex-end;justify-content:center;padding:0';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:20px;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:14px;max-height:80vh;overflow-y:auto">
      <div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle);margin:0 auto"></div>

      <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Mahalleleri Bölgeye Ata</div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">
        <strong>${selectedNames.length}</strong> mahalle seçili: ${selectedNames.join(', ')}
      </div>

      ${zones.length > 0 ? `
      <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Mevcut Bölgelere Ekle</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${zones.map(z => `
          <div onclick="_dsAssignToExistingZone('${z.id}')" style="padding:14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);cursor:pointer;display:flex;align-items:center;gap:12px">
            <div style="width:32px;height:32px;border-radius:50%;background:${z.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <iconify-icon icon="solar:map-point-bold" style="font-size:16px;color:${z.color}"></iconify-icon>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(z.name)}</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${z.distanceLabel} · ${z.neighborhoodIds.length} mahalle · ${z.deliveryFee}₺</div>
            </div>
            <iconify-icon icon="solar:add-circle-linear" style="font-size:18px;color:var(--primary)"></iconify-icon>
          </div>
        `).join('')}
      </div>
      <div style="border-top:1px solid var(--border-subtle);margin:4px 0"></div>
      ` : ''}

      <div onclick="document.getElementById('dsAssignModal').remove();_dsOpenCreateZone()" style="padding:14px;background:var(--primary-soft);border:1px solid var(--primary);border-radius:var(--r-lg);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        <iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--primary)">Yeni Bölge Oluştur</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

/* ═══ ASSIGN TO EXISTING ZONE ═══ */
function _dsAssignToExistingZone(zoneId) {
  const zone = BIZ_DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return;

  _dsSelectedNeighborhoods.forEach(id => {
    if (!zone.neighborhoodIds.includes(id)) {
      zone.neighborhoodIds.push(id);
    }
  });

  _dsSelectedNeighborhoods = [];
  document.getElementById('dsAssignModal')?.remove();
  _dsRenderPage();
}

/* ═══ OPEN CREATE ZONE FORM ═══ */
function _dsOpenCreateZone() {
  const existingModal = document.getElementById('dsCreateZoneModal');
  if (existingModal) existingModal.remove();
  document.getElementById('dsAssignModal')?.remove();

  const colors = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6'];
  const zones = BIZ_DELIVERY_ZONES.filter(z => z.branchId === _dsCurrentBranchId);
  const nextNum = zones.length + 1;
  const defaultColor = colors[(nextNum - 1) % colors.length];

  const modal = document.createElement('div');
  modal.id = 'dsCreateZoneModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:90;display:flex;align-items:flex-end;justify-content:center;padding:0';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:20px;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:14px;max-height:85vh;overflow-y:auto">
      <div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle);margin:0 auto"></div>

      <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Yeni Teslimat Bölgesi</div>

      <!-- Bölge Adı -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Bölge Adı</label>
        <input id="dsZoneName" type="text" value="Bölge ${nextNum}" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Mesafe Etiketi -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Mesafe Aralığı</label>
        <input id="dsZoneDistance" type="text" placeholder="Örn: 0-3 km" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Teslimat Ücreti & Min Sepet -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Teslimat Ücreti (₺)</label>
          <input id="dsZoneFee" type="number" value="30" min="0" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
        </div>
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Min. Sepet (₺)</label>
          <input id="dsZoneMinCart" type="number" value="200" min="0" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
        </div>
      </div>

      <!-- Tahmini Süre -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Tahmini Teslimat Süresi</label>
        <input id="dsZoneTime" type="text" placeholder="Örn: 20-35 dk" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Renk Seçimi -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:8px">Bölge Rengi</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="dsColorPicker">
          ${colors.map(c => `
            <div onclick="_dsSelectColor('${c}')" data-color="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c === defaultColor ? 'var(--text-primary)' : 'transparent'};box-sizing:border-box"></div>
          `).join('')}
        </div>
        <input type="hidden" id="dsZoneColor" value="${defaultColor}" />
      </div>

      ${_dsSelectedNeighborhoods.length > 0 ? `
      <div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:10px 12px;display:flex;align-items:center;gap:8px">
        <iconify-icon icon="solar:check-circle-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>
        <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">${_dsSelectedNeighborhoods.length} seçili mahalle bu bölgeye otomatik eklenecek</span>
      </div>
      ` : ''}

      <!-- Kaydet -->
      <button onclick="_dsCreateZone()" style="width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        <iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon> Bölgeyi Oluştur
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

/* ═══ COLOR PICKER HELPER ═══ */
function _dsSelectColor(color) {
  document.getElementById('dsZoneColor').value = color;
  document.querySelectorAll('#dsColorPicker > div').forEach(el => {
    el.style.border = el.dataset.color === color ? '3px solid var(--text-primary)' : '3px solid transparent';
  });
}

/* ═══ CREATE ZONE ═══ */
function _dsCreateZone() {
  const name = document.getElementById('dsZoneName')?.value?.trim();
  const distance = document.getElementById('dsZoneDistance')?.value?.trim() || '';
  const fee = parseInt(document.getElementById('dsZoneFee')?.value) || 0;
  const minCart = parseInt(document.getElementById('dsZoneMinCart')?.value) || 0;
  const time = document.getElementById('dsZoneTime')?.value?.trim() || '';
  const color = document.getElementById('dsZoneColor')?.value || '#22C55E';

  if (!name) {
    alert('Lütfen bölge adını girin.');
    return;
  }

  const newZone = {
    id: 'dz_' + Date.now(),
    branchId: _dsCurrentBranchId,
    name: name,
    distanceLabel: distance,
    deliveryFee: fee,
    minCartAmount: minCart,
    estimatedTime: time,
    color: color,
    neighborhoodIds: [..._dsSelectedNeighborhoods]
  };

  BIZ_DELIVERY_ZONES.push(newZone);
  _dsSelectedNeighborhoods = [];

  document.getElementById('dsCreateZoneModal')?.remove();
  _dsRenderPage();
}

/* ═══ EDIT ZONE ═══ */
function _dsOpenEditZone(zoneId) {
  const zone = BIZ_DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return;

  const existingModal = document.getElementById('dsEditZoneModal');
  if (existingModal) existingModal.remove();

  const mhNames = zone.neighborhoodIds.map(id => {
    const mh = BIZ_NEIGHBORHOODS.find(m => m.id === id);
    return mh ? { id: mh.id, name: mh.name, district: mh.district } : null;
  }).filter(Boolean);

  const colors = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6'];

  const modal = document.createElement('div');
  modal.id = 'dsEditZoneModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:90;display:flex;align-items:flex-end;justify-content:center;padding:0';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:20px;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:14px;max-height:85vh;overflow-y:auto">
      <div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle);margin:0 auto"></div>

      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Bölge Düzenle</div>
        <div onclick="_dsDeleteZoneConfirm('${zoneId}')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#EF4444;cursor:pointer;display:flex;align-items:center;gap:4px">
          <iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:14px"></iconify-icon> Sil
        </div>
      </div>

      <!-- Bölge Adı -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Bölge Adı</label>
        <input id="dsEditZoneName" type="text" value="${escHtml(zone.name)}" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Mesafe -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Mesafe Aralığı</label>
        <input id="dsEditZoneDistance" type="text" value="${escHtml(zone.distanceLabel)}" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Teslimat Ücreti & Min Sepet -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Teslimat Ücreti (₺)</label>
          <input id="dsEditZoneFee" type="number" value="${zone.deliveryFee}" min="0" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
        </div>
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Min. Sepet (₺)</label>
          <input id="dsEditZoneMinCart" type="number" value="${zone.minCartAmount}" min="0" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
        </div>
      </div>

      <!-- Tahmini Süre -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Tahmini Teslimat Süresi</label>
        <input id="dsEditZoneTime" type="text" value="${escHtml(zone.estimatedTime)}" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <!-- Renk -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:8px">Bölge Rengi</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="dsEditColorPicker">
          ${colors.map(c => `
            <div onclick="_dsSelectEditColor('${c}')" data-color="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c === zone.color ? 'var(--text-primary)' : 'transparent'};box-sizing:border-box"></div>
          `).join('')}
        </div>
        <input type="hidden" id="dsEditZoneColor" value="${zone.color}" />
      </div>

      <!-- Mahalleler -->
      <div>
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:8px">Bölgedeki Mahalleler (${mhNames.length})</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${mhNames.map(m => `
            <div style="display:flex;align-items:center;gap:4px;background:var(--bg-phone);border:1px solid var(--border-subtle);padding:5px 8px 5px 10px;border-radius:var(--r-full)">
              <span style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)">${escHtml(m.name)}</span>
              <iconify-icon onclick="_dsRemoveFromZone('${zoneId}','${m.id}')" icon="solar:close-circle-bold" style="font-size:14px;color:var(--text-tertiary);cursor:pointer"></iconify-icon>
            </div>
          `).join('')}
          ${mhNames.length === 0 ? '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">Bu bölgede henüz mahalle yok</span>' : ''}
        </div>
      </div>

      <!-- Kaydet -->
      <button onclick="_dsSaveEditZone('${zoneId}')" style="width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        <iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon> Kaydet
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

function _dsSelectEditColor(color) {
  document.getElementById('dsEditZoneColor').value = color;
  document.querySelectorAll('#dsEditColorPicker > div').forEach(el => {
    el.style.border = el.dataset.color === color ? '3px solid var(--text-primary)' : '3px solid transparent';
  });
}

/* ═══ SAVE EDITED ZONE ═══ */
function _dsSaveEditZone(zoneId) {
  const zone = BIZ_DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return;

  const name = document.getElementById('dsEditZoneName')?.value?.trim();
  if (!name) { alert('Lütfen bölge adını girin.'); return; }

  zone.name = name;
  zone.distanceLabel = document.getElementById('dsEditZoneDistance')?.value?.trim() || '';
  zone.deliveryFee = parseInt(document.getElementById('dsEditZoneFee')?.value) || 0;
  zone.minCartAmount = parseInt(document.getElementById('dsEditZoneMinCart')?.value) || 0;
  zone.estimatedTime = document.getElementById('dsEditZoneTime')?.value?.trim() || '';
  zone.color = document.getElementById('dsEditZoneColor')?.value || zone.color;

  document.getElementById('dsEditZoneModal')?.remove();
  _dsRenderPage();
}

/* ═══ REMOVE NEIGHBORHOOD FROM ZONE ═══ */
function _dsRemoveFromZone(zoneId, mhId) {
  const zone = BIZ_DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return;
  zone.neighborhoodIds = zone.neighborhoodIds.filter(id => id !== mhId);
  // Re-render the edit modal
  _dsOpenEditZone(zoneId);
}

/* ═══ DELETE ZONE ═══ */
function _dsDeleteZoneConfirm(zoneId) {
  if (confirm('Bu teslimat bölgesini silmek istediğinize emin misiniz?')) {
    BIZ_DELIVERY_ZONES = BIZ_DELIVERY_ZONES.filter(z => z.id !== zoneId);
    document.getElementById('dsEditZoneModal')?.remove();
    _dsRenderPage();
  }
}
