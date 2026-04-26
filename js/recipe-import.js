/* ═══════════════════════════════════════════════════════════
   RECIPE IMPORT — İnternetten Tarif Al (Magic AI Import)
   Akış:  URL → AI Analiz Animasyonu → Tarif Önizleme → Kayıt
   Kayıt: 1) Tarif Defteri (USER_PROFILE.importedRecipes)
          2) Taslak (USER_PROFILE.myRecipes, status:'draft')
   ═══════════════════════════════════════════════════════════ */

(function () {

  let _riStage = 'input';   // 'input' | 'analyzing' | 'preview'
  let _riUrl = '';
  let _riRecipe = null;
  let _riAnimTimers = [];

  /* ─── Stiller ─── */
  function _riInjectStyles() {
    if (document.getElementById('riStyles')) return;
    const s = document.createElement('style');
    s.id = 'riStyles';
    s.textContent = [
      '@keyframes riPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:1}}',
      '@keyframes riOrbit{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
      '@keyframes riShimmer{0%{background-position:-300px 0}100%{background-position:300px 0}}',
      '@keyframes riSlideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}',
      '@keyframes riCheck{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}',
      '@keyframes riFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',

      '.ri-hero{position:relative;border-radius:var(--r-xl);padding:22px 18px;background:linear-gradient(135deg,#312E81 0%,#7C3AED 50%,#EC4899 100%);box-shadow:0 8px 24px rgba(124,58,237,.28);overflow:hidden}',
      '.ri-hero::before{content:"";position:absolute;top:-30px;right:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 70%)}',
      '.ri-hero::after{content:"";position:absolute;bottom:-40px;left:-20px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.22) 0%,rgba(34,211,238,0) 70%)}',
      '.ri-hero-icon{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);position:relative;animation:riPulse 2.4s ease-in-out infinite}',
      '.ri-orbit{position:absolute;inset:-12px;border:1.5px dashed rgba(255,255,255,.45);border-radius:50%;animation:riOrbit 6s linear infinite}',

      '.ri-source-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:var(--r-full);background:var(--bg-phone);border:1px solid var(--border-subtle);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)}',

      '.ri-step{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);opacity:.45;transition:all .35s ease}',
      '.ri-step.active{opacity:1;border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}',
      '.ri-step.done{opacity:1}',
      '.ri-step-num{width:26px;height:26px;border-radius:50%;background:var(--bg-page);border:1.5px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 12px/1 var(--font);color:var(--text-muted);flex-shrink:0;transition:all .25s}',
      '.ri-step.active .ri-step-num{background:var(--primary);color:#fff;border-color:var(--primary);animation:riPulse 1s ease-in-out infinite}',
      '.ri-step.done .ri-step-num{background:#10B981;color:#fff;border-color:#10B981;animation:riCheck .3s ease}',
      '.ri-step-text{font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);flex:1}',

      '.ri-shimmer{background:linear-gradient(90deg,var(--glass-card,#f3f4f6) 0%,var(--bg-phone) 50%,var(--glass-card,#f3f4f6) 100%);background-size:600px 100%;animation:riShimmer 1.4s linear infinite;border-radius:var(--r-md)}',

      '.ri-preview-img{width:100%;aspect-ratio:1.6/1;object-fit:cover;border-radius:var(--r-xl);box-shadow:0 6px 18px rgba(0,0,0,.12)}',
      '.ri-meta-card{flex:1;padding:10px 6px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}',
      '.ri-meta-card iconify-icon{font-size:18px;color:var(--primary)}',
      '.ri-meta-label{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);letter-spacing:.3px;text-transform:uppercase}',
      '.ri-meta-val{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',

      '.ri-section-title{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin:18px 0 10px;display:flex;align-items:center;gap:8px}',

      '.ri-ing{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone);border:1px solid var(--border-subtle);font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)}',
      '.ri-ing strong{font-weight:var(--fw-semibold);color:var(--primary);min-width:64px;flex-shrink:0}',

      '.ri-step-item{display:flex;gap:12px;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle)}',
      '.ri-step-item-num{width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) var(--fs-xs)/1 var(--font);flex-shrink:0}',
      '.ri-step-item-text{font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-primary)}',

      '.ri-nutri-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}',
      '.ri-nutri{padding:12px 4px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);text-align:center}',
      '.ri-nutri-val{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--primary)}',
      '.ri-nutri-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:4px;text-transform:uppercase;letter-spacing:.3px}',

      '.ri-action-bar{position:sticky;bottom:0;left:0;right:0;display:flex;flex-direction:column;gap:8px;padding:14px 16px 16px;background:linear-gradient(180deg,transparent 0%,var(--bg-page) 22%);z-index:6}',
      '.ri-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:var(--r-lg);font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;border:none;transition:transform .12s, box-shadow .12s;width:100%}',
      '.ri-btn:active{transform:scale(.98)}',
      '.ri-btn-primary{background:var(--primary);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.08)}',
      '.ri-btn-secondary{background:transparent;color:var(--text-primary);border:1.5px solid var(--border-subtle)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ─── Public: Sayfayı Aç/Kapat ─── */
  function openRecipeImportPage() {
    _riInjectStyles();
    _riClearTimers();
    _riStage = 'input';
    _riUrl = '';
    _riRecipe = null;

    const existing = document.getElementById('recipeImportOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'recipeImportOverlay';
    overlay.className = 'prof-overlay open';
    overlay.style.display = 'flex';
    overlay.innerHTML =
      '<div class="prof-container">'
      + '<div class="prof-topbar">'
      +   '<div class="btn-icon" onclick="closeRecipeImportPage()" style="cursor:pointer"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
      +   '<span class="prof-topbar-name" id="riTopbarTitle">İnternetten Tarif Al</span>'
      +   '<div style="width:32px"></div>'
      + '</div>'
      + '<div id="riBody" style="flex:1;overflow-y:auto"></div>'
      + '</div>';

    const phone = document.getElementById('phone') || document.body;
    phone.appendChild(overlay);
    _riRenderInput();
  }

  function closeRecipeImportPage() {
    _riClearTimers();
    const el = document.getElementById('recipeImportOverlay');
    if (el) el.remove();
  }

  function _riClearTimers() {
    _riAnimTimers.forEach(function (t) { try { clearTimeout(t); } catch (_) {} });
    _riAnimTimers = [];
  }

  /* ─── 1) URL Giriş Ekranı ─── */
  function _riRenderInput() {
    const b = document.getElementById('riBody');
    if (!b) return;
    const t = document.getElementById('riTopbarTitle');
    if (t) t.textContent = 'İnternetten Tarif Al';

    let html = '<div style="padding:8px 16px 24px;display:flex;flex-direction:column;gap:18px">';

    // Hero
    html += '<div class="ri-hero" style="display:flex;gap:14px;align-items:center">';
    html +=   '<div style="position:relative">';
    html +=     '<div class="ri-hero-icon"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:26px;color:#fff"></iconify-icon></div>';
    html +=     '<div class="ri-orbit"></div>';
    html +=   '</div>';
    html +=   '<div style="flex:1;position:relative">';
    html +=     '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
    html +=       '<span style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:#fff">Magic Import</span>';
    html +=       '<span style="font:var(--fw-semibold) 9px/1 var(--font);color:#7C3AED;background:#fff;padding:3px 6px;border-radius:var(--r-full);letter-spacing:.4px">BETA</span>';
    html +=     '</div>';
    html +=     '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:rgba(255,255,255,.88)">Linki yapıştır, AI senin için tarifi ayıklasın.</div>';
    html +=   '</div>';
    html += '</div>';

    // Source chips
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    html +=   '<span class="ri-source-chip"><iconify-icon icon="skill-icons:instagram" style="font-size:14px"></iconify-icon>Instagram</span>';
    html +=   '<span class="ri-source-chip"><iconify-icon icon="ri:twitter-x-fill" style="font-size:14px"></iconify-icon>X</span>';
    html +=   '<span class="ri-source-chip"><iconify-icon icon="ri:tiktok-fill" style="font-size:14px"></iconify-icon>TikTok</span>';
    html +=   '<span class="ri-source-chip"><iconify-icon icon="ri:youtube-fill" style="font-size:14px;color:#EF4444"></iconify-icon>YouTube</span>';
    html +=   '<span class="ri-source-chip"><iconify-icon icon="solar:globe-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>Web</span>';
    html += '</div>';

    // Input + button
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    html +=   '<div class="g-input-wrap">';
    html +=     '<iconify-icon icon="solar:link-round-angle-linear" style="font-size:18px"></iconify-icon>';
    html +=     '<div class="g-input-content">';
    html +=       '<label>Tarif Linki</label>';
    html +=       '<input id="riUrlInput" type="url" inputmode="url" autocomplete="off" placeholder="https://..." style="border:none;outline:none;background:transparent;font:var(--fw-regular) var(--fs-md)/1.2 var(--font);color:var(--text-primary);width:100%;padding:0">';
    html +=     '</div>';
    html +=     '<iconify-icon id="riClearBtn" icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted);cursor:pointer;display:none"></iconify-icon>';
    html +=   '</div>';
    html +=   '<button class="ri-btn ri-btn-primary" id="riAnalyzeBtn" onclick="_riStartAnalysis()" disabled style="opacity:.5">';
    html +=     '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:18px"></iconify-icon>';
    html +=     'Tarifi İncele';
    html +=   '</button>';
    html += '</div>';

    // Demo paste tile
    html += '<div onclick="_riPasteDemo()" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px dashed var(--border-subtle);border-radius:var(--r-lg);cursor:pointer;background:transparent">';
    html +=   '<iconify-icon icon="solar:test-tube-bold" style="font-size:20px;color:var(--primary);flex-shrink:0"></iconify-icon>';
    html +=   '<div style="flex:1;min-width:0">';
    html +=     '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Demo URL\'sini Dene</div>';
    html +=     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">nefisyemektarifleri.com/...lazanya/</div>';
    html +=   '</div>';
    html +=   '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary);flex-shrink:0"></iconify-icon>';
    html += '</div>';

    // How it works
    html += '<div style="padding:14px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle)">';
    html +=   '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Nasıl çalışır?</div>';
    html +=   '<div style="display:flex;flex-direction:column;gap:6px">';
    [
      'Linki yapıştır',
      'AI malzeme ve adımları ayıklar',
      'Defterine kaydet veya kendi tarifin olarak düzenle'
    ].forEach(function (ln) {
      html += '<div style="display:flex;align-items:center;gap:8px;font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">'
        + '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#10B981"></iconify-icon>' + ln + '</div>';
    });
    html +=   '</div>';
    html += '</div>';

    html += '</div>';
    b.innerHTML = html;

    const input = document.getElementById('riUrlInput');
    const btn = document.getElementById('riAnalyzeBtn');
    const clearBtn = document.getElementById('riClearBtn');
    if (input) {
      input.addEventListener('input', function () {
        const v = input.value.trim();
        _riUrl = v;
        const ok = /^https?:\/\/.+/i.test(v);
        btn.disabled = !ok;
        btn.style.opacity = ok ? '1' : '.5';
        clearBtn.style.display = v ? 'inline-flex' : 'none';
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !btn.disabled) { e.preventDefault(); _riStartAnalysis(); }
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        try { input.focus(); } catch (_) {}
      });
    }
  }

  function _riPasteDemo() {
    const input = document.getElementById('riUrlInput');
    if (!input) return;
    input.value = 'https://www.nefisyemektarifleri.com/ev-yapimi-italyan-usulu-lazanya/';
    input.dispatchEvent(new Event('input'));
  }

  /* ─── 2) Analiz Animasyonu ─── */
  function _riStartAnalysis() {
    if (!/^https?:\/\/.+/i.test(_riUrl)) return;
    _riStage = 'analyzing';
    _riClearTimers();
    _riRenderAnalyzing();

    const stepIds = ['s1', 's2', 's3', 's4', 's5'];
    const offsets = [0, 600, 1250, 2000, 2800];

    stepIds.forEach(function (id, idx) {
      _riAnimTimers.push(setTimeout(function () {
        if (idx > 0) {
          const prev = document.getElementById('ri_' + stepIds[idx - 1]);
          if (prev) {
            prev.classList.remove('active');
            prev.classList.add('done');
            const n = prev.querySelector('.ri-step-num');
            if (n) n.innerHTML = '<iconify-icon icon="solar:check-bold" style="font-size:14px"></iconify-icon>';
          }
        }
        const cur = document.getElementById('ri_' + id);
        if (cur) cur.classList.add('active');
      }, offsets[idx]));
    });

    _riAnimTimers.push(setTimeout(function () {
      const last = document.getElementById('ri_s5');
      if (last) {
        last.classList.remove('active');
        last.classList.add('done');
        const n = last.querySelector('.ri-step-num');
        if (n) n.innerHTML = '<iconify-icon icon="solar:check-bold" style="font-size:14px"></iconify-icon>';
      }
      _riRecipe = _riMockParse(_riUrl);
      _riStage = 'preview';
      _riRenderPreview();
    }, 3700));
  }

  function _riRenderAnalyzing() {
    const b = document.getElementById('riBody');
    if (!b) return;
    const t = document.getElementById('riTopbarTitle');
    if (t) t.textContent = 'Analiz Ediliyor';

    let html = '<div style="padding:18px 16px 24px;display:flex;flex-direction:column;gap:16px">';

    // Hero (büyütülmüş)
    html += '<div class="ri-hero" style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 18px">';
    html +=   '<div style="position:relative;animation:riFloat 3s ease-in-out infinite">';
    html +=     '<div class="ri-hero-icon" style="width:64px;height:64px"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:32px;color:#fff"></iconify-icon></div>';
    html +=     '<div class="ri-orbit"></div>';
    html +=   '</div>';
    html +=   '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:#fff;text-align:center">AI tarifi okuyor…</div>';
    html +=   '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:rgba(255,255,255,.85);text-align:center;max-width:260px;word-break:break-all">' + _riEsc(_riUrl) + '</div>';
    html += '</div>';

    const steps = [
      { id: 's1', icon: 'solar:link-round-angle-linear', text: 'Sayfa yükleniyor' },
      { id: 's2', icon: 'solar:gallery-linear',           text: 'Görseller taranıyor' },
      { id: 's3', icon: 'solar:cart-large-2-linear',      text: 'Malzemeler ayıklanıyor' },
      { id: 's4', icon: 'solar:list-check-linear',        text: 'Hazırlanış adımları dönüştürülüyor' },
      { id: 's5', icon: 'solar:health-linear',            text: 'Besin değerleri hesaplanıyor' }
    ];
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    steps.forEach(function (s, idx) {
      html += '<div class="ri-step" id="ri_' + s.id + '">';
      html +=   '<div class="ri-step-num">' + (idx + 1) + '</div>';
      html +=   '<iconify-icon icon="' + s.icon + '" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>';
      html +=   '<div class="ri-step-text">' + s.text + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Skeleton
    html += '<div style="margin-top:8px;display:flex;flex-direction:column;gap:10px">';
    html +=   '<div class="ri-shimmer" style="height:140px;border-radius:var(--r-xl)"></div>';
    html +=   '<div class="ri-shimmer" style="height:14px;width:65%"></div>';
    html +=   '<div class="ri-shimmer" style="height:12px;width:40%"></div>';
    html += '</div>';

    html += '</div>';
    b.innerHTML = html;
  }

  /* ─── 3) Tarif Önizleme ─── */
  function _riRenderPreview() {
    const b = document.getElementById('riBody');
    if (!b || !_riRecipe) return;
    const r = _riRecipe;
    const t = document.getElementById('riTopbarTitle');
    if (t) t.textContent = 'Tarif Önizleme';

    let html = '<div style="padding:8px 16px 12px;display:flex;flex-direction:column;gap:12px;animation:riSlideIn .35s ease">';

    // AI banner
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(236,72,153,.06));border:1px solid rgba(124,58,237,.22)">';
    html +=   '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:18px;color:#7C3AED;flex-shrink:0"></iconify-icon>';
    html +=   '<div style="flex:1;min-width:0">';
    html +=     '<div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:#7C3AED">AI ile dönüştürüldü</div>';
    html +=     '<div style="font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px">' + _riEsc(_riUrl) + '</div>';
    html +=   '</div>';
    html +=   '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:#10B981;flex-shrink:0"></iconify-icon>';
    html += '</div>';

    // Image
    html += '<img class="ri-preview-img" src="' + _riEsc(r.img) + '" alt="' + _riEsc(r.name) + '">';

    // Title + meta
    html += '<div>';
    html +=   '<div style="font:var(--fw-bold) var(--fs-2xl)/1.2 var(--font);color:var(--text-primary)">' + _riEsc(r.name) + '</div>';
    html +=   '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">';
    html +=     '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--r-full);background:rgba(124,58,237,.1);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#7C3AED">' + _riEsc(r.category) + '</span>';
    if (r.cuisine) html += '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + _riEsc(r.cuisine) + ' Mutfağı</span>';
    html +=   '</div>';
    if (r.desc) html += '<div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary);margin-top:10px">' + _riEsc(r.desc) + '</div>';
    html += '</div>';

    // Meta row
    html += '<div style="display:flex;gap:8px">';
    html +=   '<div class="ri-meta-card"><iconify-icon icon="solar:clock-circle-linear"></iconify-icon><span class="ri-meta-val">' + _riEsc(r.prepTime) + '</span><span class="ri-meta-label">Hazırlık</span></div>';
    html +=   '<div class="ri-meta-card"><iconify-icon icon="solar:fire-linear"></iconify-icon><span class="ri-meta-val">' + _riEsc(r.cookTime) + '</span><span class="ri-meta-label">Pişirme</span></div>';
    html +=   '<div class="ri-meta-card"><iconify-icon icon="solar:chef-hat-linear"></iconify-icon><span class="ri-meta-val">' + _riEsc(r.difficulty) + '</span><span class="ri-meta-label">Zorluk</span></div>';
    html +=   '<div class="ri-meta-card"><iconify-icon icon="solar:users-group-rounded-linear"></iconify-icon><span class="ri-meta-val">' + r.servings + '</span><span class="ri-meta-label">Kişilik</span></div>';
    html += '</div>';

    // Ingredients
    html += '<div class="ri-section-title"><iconify-icon icon="solar:cart-large-2-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>Malzemeler<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:auto">' + r.ingredients.length + ' madde</span></div>';
    html += '<div style="display:flex;flex-direction:column;gap:6px">';
    r.ingredients.forEach(function (ing) {
      html += '<div class="ri-ing"><strong>' + _riEsc(ing.amount) + '</strong><span>' + _riEsc(ing.name) + '</span></div>';
    });
    html += '</div>';

    // Steps
    html += '<div class="ri-section-title"><iconify-icon icon="solar:list-check-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>Hazırlanış</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    r.steps.forEach(function (s, idx) {
      html += '<div class="ri-step-item">';
      html +=   '<div class="ri-step-item-num">' + (idx + 1) + '</div>';
      html +=   '<div class="ri-step-item-text">' + _riEsc(s.text) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Nutrition
    if (r.nutrition) {
      html += '<div class="ri-section-title"><iconify-icon icon="solar:health-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>Besin Değerleri<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:auto">porsiyon başına</span></div>';
      html += '<div class="ri-nutri-grid">';
      html +=   '<div class="ri-nutri"><div class="ri-nutri-val">' + r.nutrition.kalori + '</div><div class="ri-nutri-lbl">Kalori</div></div>';
      html +=   '<div class="ri-nutri"><div class="ri-nutri-val">' + r.nutrition.protein + 'g</div><div class="ri-nutri-lbl">Protein</div></div>';
      html +=   '<div class="ri-nutri"><div class="ri-nutri-val">' + r.nutrition.yag + 'g</div><div class="ri-nutri-lbl">Yağ</div></div>';
      html +=   '<div class="ri-nutri"><div class="ri-nutri-val">' + r.nutrition.karbonhidrat + 'g</div><div class="ri-nutri-lbl">Karbon.</div></div>';
      html += '</div>';
    }

    // Tips
    if (r.tips && r.tips.length) {
      html += '<div class="ri-section-title"><iconify-icon icon="solar:lightbulb-bolt-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>Püf Noktalar</div>';
      html += '<div style="display:flex;flex-direction:column;gap:6px">';
      r.tips.forEach(function (tip) {
        html += '<div style="display:flex;gap:10px;padding:10px 12px;border-radius:var(--r-md);background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.22)">';
        html +=   '<iconify-icon icon="solar:star-bold" style="font-size:16px;color:#F59E0B;flex-shrink:0;margin-top:2px"></iconify-icon>';
        html +=   '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary)">' + _riEsc(tip) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';

    // Sticky action bar
    html += '<div class="ri-action-bar">';
    html +=   '<button class="ri-btn ri-btn-primary" onclick="_riSaveToDefter()">';
    html +=     '<iconify-icon icon="solar:bookmark-bold" style="font-size:18px"></iconify-icon>';
    html +=     'Tarif Defterime Kaydet';
    html +=   '</button>';
    html +=   '<button class="ri-btn ri-btn-secondary" onclick="_riSaveAsDraft()">';
    html +=     '<iconify-icon icon="solar:document-add-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>';
    html +=     'Tarif Olarak Kaydet (Taslak)';
    html +=   '</button>';
    html +=   '<div style="font:var(--fw-regular) 10.5px/1.4 var(--font);color:var(--text-muted);text-align:center;margin-top:2px">Taslak: Tariflerim sekmesinde "Bekleniyor" durumunda görünür ve düzenlenebilir.</div>';
    html += '</div>';

    b.innerHTML = html;
  }

  /* ─── Kayıt: Tarif Defteri ─── */
  function _riSaveToDefter() {
    if (!_riRecipe) return;
    if (typeof window.USER_PROFILE === 'undefined') window.USER_PROFILE = {};
    if (!Array.isArray(USER_PROFILE.importedRecipes)) USER_PROFILE.importedRecipes = [];

    const entry = Object.assign({}, _riRecipe, {
      id: 'imp_' + Date.now(),
      savedAt: new Date().toISOString(),
      source: 'imported',
      sourceUrl: _riUrl,
      location: 'defter'
    });
    USER_PROFILE.importedRecipes.push(entry);

    if (typeof showToast === 'function') {
      showToast('Tarif defterine eklendi', { icon: 'solar:bookmark-bold', color: '#7C3AED' });
    }
    closeRecipeImportPage();
  }

  /* ─── Kayıt: Taslak (Tariflerim → Bekleniyor) ─── */
  function _riSaveAsDraft() {
    if (!_riRecipe) return;
    if (typeof window.USER_PROFILE === 'undefined') window.USER_PROFILE = {};
    if (!Array.isArray(USER_PROFILE.myRecipes)) USER_PROFILE.myRecipes = [];

    const r = _riRecipe;
    const now = new Date();
    const entry = {
      id: Date.now(),
      name: r.name,
      category: r.category,
      img: r.img,
      images: [r.img],
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      difficulty: r.difficulty,
      servings: r.servings,
      desc: r.desc,
      ingredients: r.ingredients.map(function (i) { return (i.amount + ' ' + i.name).trim(); }),
      steps: r.steps.map(function (s) { return { text: s.text, img: '' }; }),
      nutrition: r.nutrition || null,
      tips: r.tips || [],
      date: now.toISOString().slice(0, 10),
      status: 'draft',
      submittedAt: now.toISOString(),
      source: 'imported',
      sourceUrl: _riUrl
    };
    USER_PROFILE.myRecipes.push(entry);

    if (typeof _updateMyRecipeCount === 'function') {
      try { _updateMyRecipeCount(); } catch (_) {}
    }
    if (typeof showToast === 'function') {
      showToast('Tariflerim\'de taslak olarak kaydedildi', {
        icon: 'solar:document-add-bold',
        color: '#10B981',
        actionLabel: 'Aç',
        onAction: function () { if (typeof openMyRecipesPage === 'function') openMyRecipesPage(); }
      });
    }
    closeRecipeImportPage();
  }

  /* ─── HTML Escape ─── */
  function _riEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── Mock AI Parser ─── */
  function _riMockParse(url) {
    const u = String(url || '').toLowerCase();

    // Lazanya demo
    if (u.indexOf('lazanya') !== -1 || u.indexOf('lasagna') !== -1 || u.indexOf('lasagne') !== -1) {
      return {
        name: 'Ev Yapımı İtalyan Usulü Lazanya',
        category: 'Ana Yemek',
        cuisine: 'İtalyan',
        img: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=800&h=600&fit=crop',
        prepTime: '25 dk',
        cookTime: '40 dk',
        difficulty: 'Orta',
        servings: 6,
        desc: 'Bechamel ve domatesli kıymalı sosla katmanlanan, üzeri kaşar ile kızartılmış klasik İtalyan lazanya tarifi.',
        ingredients: [
          { amount: '12 adet',     name: 'Lazanya yufkası' },
          { amount: '500 gr',      name: 'Dana kıyma' },
          { amount: '1 adet',      name: 'Soğan (rendelenmiş)' },
          { amount: '3 diş',       name: 'Sarımsak' },
          { amount: '400 gr',      name: 'Domates sosu (passata)' },
          { amount: '2 yk',        name: 'Domates salçası' },
          { amount: '50 gr',       name: 'Tereyağı' },
          { amount: '3 yk',        name: 'Un' },
          { amount: '750 ml',      name: 'Süt' },
          { amount: '200 gr',      name: 'Rendelenmiş kaşar peyniri' },
          { amount: '50 gr',       name: 'Parmesan (opsiyonel)' },
          { amount: '1 tatlı k.',  name: 'Kuru fesleğen' },
          { amount: '1 tutam',     name: 'Tuz, karabiber, muskat' },
          { amount: '2 yk',        name: 'Zeytinyağı' }
        ],
        steps: [
          { text: 'Geniş bir tavada zeytinyağını kızdırın; soğan ve sarımsağı şeffaflaşana kadar kavurun.' },
          { text: 'Kıymayı ekleyip suyunu çekene dek pişirin, ardından salça ve domates sosunu ilave edin. Tuz, karabiber ve fesleğen ekleyip 10 dakika kısık ateşte kaynatın.' },
          { text: 'Bechamel için tereyağını eritin, unu ekleyip 1 dakika kavurun. Sütü yavaş yavaş ekleyerek topaklanmayı önleyin; muskat, tuz ve karabiber ile lezzetlendirin. Krema kıvamına gelene kadar karıştırın.' },
          { text: 'Lazanya yufkalarını paket talimatına göre haşlayın (gerekiyorsa).' },
          { text: 'Fırın kabının tabanına ince bir bechamel sürün. Yufka → kıymalı sos → bechamel → kaşar şeklinde 4 kat oluşturun.' },
          { text: 'En üste bol bechamel, kaşar ve parmesan serpin. Önceden ısıtılmış 200°C fırında 25–30 dakika, üzeri altın sarısı olana kadar pişirin.' },
          { text: 'Fırından çıkardıktan sonra 10 dakika dinlendirin; servis ederken dilimleyin.' }
        ],
        nutrition: { kalori: 520, protein: 28, yag: 26, karbonhidrat: 42 },
        tips: [
          'Bechamel\'i kıvama gelmeden ateşten almayın; aksi halde lazanya sulu olur.',
          'Yufkaları haşlamadan kullanıyorsanız sosu biraz daha sulu hazırlayın.',
          'Pişirmeden 1 saat önce buzdolabında dinlendirilirse katmanlar daha net olur.'
        ]
      };
    }

    // Generic fallback
    return {
      name: 'AI Tarafından Oluşturulan Tarif',
      category: 'Ana Yemek',
      cuisine: 'Karışık',
      img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
      prepTime: '20 dk',
      cookTime: '30 dk',
      difficulty: 'Kolay',
      servings: 4,
      desc: 'Verdiğin linkten AI tarafından çıkarılmış örnek tarif. Kaydedip Tariflerim altında istediğin gibi düzenleyebilirsin.',
      ingredients: [
        { amount: '300 gr', name: 'Ana malzeme' },
        { amount: '1 adet', name: 'Soğan' },
        { amount: '2 yk',   name: 'Zeytinyağı' },
        { amount: '1 tutam', name: 'Tuz, karabiber' }
      ],
      steps: [
        { text: 'Malzemeleri hazırlayın ve doğrayın.' },
        { text: 'Tavada zeytinyağını ısıtıp soğanı kavurun.' },
        { text: 'Ana malzemeyi ekleyip orta ateşte pişirin.' },
        { text: 'Baharatlarla tatlandırıp servis edin.' }
      ],
      nutrition: { kalori: 320, protein: 18, yag: 14, karbonhidrat: 28 },
      tips: ['Linkten gelen tarif eksikse Tariflerim üzerinden tamamlayabilirsin.']
    };
  }

  /* ─── Export ─── */
  window.openRecipeImportPage  = openRecipeImportPage;
  window.closeRecipeImportPage = closeRecipeImportPage;
  window._riStartAnalysis      = _riStartAnalysis;
  window._riPasteDemo          = _riPasteDemo;
  window._riSaveToDefter       = _riSaveToDefter;
  window._riSaveAsDraft        = _riSaveAsDraft;

})();
