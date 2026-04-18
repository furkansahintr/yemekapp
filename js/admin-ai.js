/* ═══════════════════════════════════════════════════════════
   ADMIN AI — Yapay Zeka Asistanı
   Chat tabanlı komut arayüzü · analiz · onaylı aksiyon
   ═══════════════════════════════════════════════════════════ */

var _aai = {
  messages: [],           // {role:'user'|'ai', text, analysis?, action?, pending?}
  isTyping: false,
  input: ''
};

function _admOpenAI() {
  _aaiInjectStyles();
  var host = document.getElementById('adminPhone');
  if (!host) return;
  var existing = host.querySelector('.aai-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open aai-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease';
  overlay.id = 'aaiOverlay';
  host.appendChild(overlay);

  // Karşılama
  if (_aai.messages.length === 0) {
    _aai.messages.push({
      role:'ai',
      text:'Merhaba! Ben platformun yapay zeka asistanıyım. Sana verileri analiz edip aksiyon önerileri sunabilirim. Aşağıdaki hızlı komutları kullanabilir ya da dilediğini yazabilirsin.'
    });
  }

  _aaiRender();
}

function _aaiClose() {
  var o = document.getElementById('aaiOverlay');
  if (o) o.remove();
}

/* ── Helpers ── */
function _aaiEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _aaiMatchScenario(text) {
  var q = text.toLowerCase();
  for (var i = 0; i < ADMIN_AI_SCENARIOS.length; i++) {
    var sc = ADMIN_AI_SCENARIOS[i];
    for (var j = 0; j < sc.keywords.length; j++) {
      if (q.indexOf(sc.keywords[j].toLowerCase()) > -1) return sc;
    }
  }
  return null;
}

/* ── Render ── */
function _aaiRender() {
  var o = document.getElementById('aaiOverlay');
  if (!o) return;

  var h = '<div class="aai-header">'
    + '<div class="aai-back" onclick="_aaiClose()"><iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon></div>'
    + '<div class="aai-avatar"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1">'
    + '<div class="aai-title">Yapay Zeka Asistanı</div>'
    + '<div class="aai-sub"><span class="aai-dot"></span>Çevrimiçi · Veri erişimi aktif</div>'
    + '</div>'
    + '<button class="aai-reset" onclick="_aaiReset()" title="Sohbeti sıfırla"><iconify-icon icon="solar:restart-bold" style="font-size:15px"></iconify-icon></button>'
    + '</div>';

  // Prompt helpers
  h += '<div class="aai-prompt-bar">';
  for (var i = 0; i < ADMIN_AI_PROMPTS.length; i++) {
    var p = ADMIN_AI_PROMPTS[i];
    h += '<button class="aai-prompt-chip" onclick="_aaiUsePrompt(\'' + _aaiEsc(p.prompt).replace(/'/g,"\\'") + '\')">'
      + '<iconify-icon icon="' + p.icon + '" style="font-size:13px"></iconify-icon>'
      + _aaiEsc(p.label) + '</button>';
  }
  h += '</div>';

  // Messages
  h += '<div class="aai-messages" id="aaiMessages">';
  for (var m = 0; m < _aai.messages.length; m++) {
    h += _aaiMessageBubble(_aai.messages[m], m);
  }
  if (_aai.isTyping) {
    h += '<div class="aai-msg aai-msg--ai"><div class="aai-bubble aai-bubble--ai"><div class="aai-typing"><span></span><span></span><span></span></div></div></div>';
  }
  h += '</div>';

  // Input bar
  h += '<div class="aai-input-bar">'
    + '<input type="text" class="aai-input" id="aaiInput" placeholder="Sormak istediğin komutu yaz..." value="' + _aaiEsc(_aai.input) + '" '
    + 'oninput="_aai.input=this.value" onkeydown="if(event.key===\'Enter\'){_aaiSend()}">'
    + '<button class="aai-send" onclick="_aaiSend()">'
    + '<iconify-icon icon="solar:square-arrow-up-bold" style="font-size:22px"></iconify-icon>'
    + '</button>'
    + '</div>';

  o.innerHTML = h;
  _aaiScroll();
  var inp = document.getElementById('aaiInput');
  if (inp && !_aai.isTyping) inp.focus();
}

function _aaiMessageBubble(msg, idx) {
  var isUser = msg.role === 'user';
  var h = '<div class="aai-msg aai-msg--' + (isUser ? 'user' : 'ai') + '">';
  if (!isUser) {
    h += '<div class="aai-msg-avatar"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:13px;color:#fff"></iconify-icon></div>';
  }
  h += '<div class="aai-bubble aai-bubble--' + (isUser ? 'user' : 'ai') + '">';
  h += '<div class="aai-bubble-text">' + _aaiFormatText(msg.text) + '</div>';

  if (msg.analysis) {
    h += '<div class="aai-analysis">'
      + '<div class="aai-analysis-head">'
      + '<iconify-icon icon="solar:chart-square-bold" style="font-size:13px;color:#8B5CF6"></iconify-icon>'
      + _aaiEsc(msg.analysis.title)
      + '</div>'
      + '<div class="aai-analysis-rows">';
    for (var i = 0; i < msg.analysis.rows.length; i++) {
      var r = msg.analysis.rows[i];
      h += '<div class="aai-arow">'
        + '<div class="aai-arow-lbl">' + _aaiEsc(r.label) + '</div>'
        + '<div class="aai-arow-val">' + _aaiEsc(r.value) + '</div>'
        + (r.note ? '<div class="aai-arow-note">' + _aaiEsc(r.note) + '</div>' : '')
        + '</div>';
    }
    h += '</div></div>';
  }

  if (msg.action) {
    var actIcon = msg.action.type === 'sms' ? 'solar:letter-bold'
      : msg.action.type === 'notification' ? 'solar:bell-bing-bold'
      : msg.action.type === 'campaign' ? 'solar:gift-bold'
      : msg.action.type === 'token_grant' ? 'solar:dollar-minimalistic-bold'
      : 'solar:bolt-bold';
    var actLabel = msg.action.type === 'sms' ? 'SMS'
      : msg.action.type === 'notification' ? 'BİLDİRİM'
      : msg.action.type === 'campaign' ? 'KAMPANYA'
      : msg.action.type === 'token_grant' ? 'TOKEN TRANSFERİ'
      : 'AKSİYON';

    h += '<div class="aai-action">'
      + '<div class="aai-action-head">'
      + '<iconify-icon icon="' + actIcon + '" style="font-size:14px;color:#F59E0B"></iconify-icon>'
      + '<span class="aai-action-type">' + actLabel + '</span>'
      + '<span class="aai-action-channel">' + _aaiEsc(msg.action.channel) + '</span>'
      + '</div>'
      + '<div class="aai-action-target"><b>Hedef:</b> ' + _aaiEsc(msg.action.target) + '</div>'
      + '<div class="aai-action-preview">"' + _aaiEsc(msg.action.preview) + '"</div>';

    if (msg.pending) {
      h += '<div class="aai-confirm">'
        + '<div class="aai-confirm-q"><iconify-icon icon="solar:shield-warning-bold" style="font-size:14px;color:#F59E0B"></iconify-icon> İşlemi onaylıyor musunuz?</div>'
        + '<div class="aai-confirm-btns">'
        + '<button class="aai-btn-ghost" onclick="_aaiRejectAction(' + idx + ')">Vazgeç</button>'
        + '<button class="aai-btn-primary" onclick="_aaiApproveAction(' + idx + ')">'
        + '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px"></iconify-icon>'
        + _aaiEsc(msg.action.label) + '</button>'
        + '</div></div>';
    } else if (msg.executed) {
      h += '<div class="aai-executed"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon> İşlem gerçekleştirildi</div>';
    } else if (msg.rejected) {
      h += '<div class="aai-rejected"><iconify-icon icon="solar:close-circle-bold" style="font-size:14px;color:#EF4444"></iconify-icon> İşlem iptal edildi</div>';
    }

    h += '</div>';
  }

  h += '</div></div>';
  return h;
}

function _aaiFormatText(t) {
  if (!t) return '';
  // **bold** → <b>
  var s = _aaiEsc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  return s;
}

function _aaiScroll() {
  var box = document.getElementById('aaiMessages');
  if (box) box.scrollTop = box.scrollHeight;
}

/* ── Actions ── */
function _aaiUsePrompt(p) {
  _aai.input = p;
  _aaiSend();
}

function _aaiSend() {
  var text = (_aai.input || '').trim();
  if (!text || _aai.isTyping) return;
  _aai.messages.push({ role:'user', text: text });
  _aai.input = '';

  var scenario = _aaiMatchScenario(text);
  _aai.isTyping = true;
  _aaiRender();

  // Typing ilk cevap
  setTimeout(function() {
    if (scenario) {
      _aai.messages.push({ role:'ai', text: scenario.intro });
      _aaiRender();
      setTimeout(function() {
        var res = scenario.buildResponse();
        _aai.isTyping = false;
        _aai.messages.push({
          role:'ai',
          text: res.text,
          analysis: res.analysis,
          action: res.action,
          pending: !!res.action
        });
        _aaiRender();
      }, 1100);
    } else {
      _aai.isTyping = false;
      _aai.messages.push({
        role:'ai',
        text:'Bu konuda elimde hazır veri yok. Şu an desteklenen komutlar: günün özeti, sorunlu işletmeler, bölgesel düşüş, trend menü, pasif kullanıcı kampanyası, sadık müşteri ödülü. Yukarıdaki hızlı butonları da kullanabilirsin.'
      });
      _aaiRender();
    }
  }, 650);
}

function _aaiApproveAction(idx) {
  var m = _aai.messages[idx];
  if (!m || !m.pending) return;
  m.pending = false;
  m.executed = true;

  // Aksiyon toast
  if (typeof _admToast === 'function') {
    _admToast(m.action.label + ' tamamlandı · ' + m.action.target, 'ok');
  }

  // AI takip mesajı
  _aai.messages.push({
    role:'ai',
    text:'İşlem başarılı! **' + m.action.target + '** için ' + (m.action.type === 'sms' ? 'SMS gönderildi' : m.action.type === 'notification' ? 'bildirim iletildi' : m.action.type === 'token_grant' ? 'token transferi yapıldı' : 'aksiyon tetiklendi') + '. Başka bir şeyde yardımcı olmamı ister misin?'
  });
  _aaiRender();
}

function _aaiRejectAction(idx) {
  var m = _aai.messages[idx];
  if (!m || !m.pending) return;
  m.pending = false;
  m.rejected = true;
  _aai.messages.push({ role:'ai', text:'Tamam, işlemi iptal ettim. İstersen başka bir senaryo deneyelim.' });
  _aaiRender();
}

function _aaiReset() {
  _aai.messages = [];
  _aai.input = '';
  _aai.isTyping = false;
  _admOpenAI();
}

/* ── Styles ── */
function _aaiInjectStyles() {
  if (document.getElementById('aaiStyles')) return;
  var s = document.createElement('style');
  s.id = 'aaiStyles';
  s.textContent = [
    '.aai-overlay{color:var(--text-primary);display:flex;flex-direction:column}',
    '/* Header */',
    '.aai-header{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);flex-shrink:0}',
    '.aai-back{width:32px;height:32px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);flex-shrink:0}',
    '.aai-back:active{transform:scale(.94)}',
    '.aai-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6 0%,#3B82F6 50%,#06B6D4 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;box-shadow:0 2px 10px rgba(139,92,246,.35)}',
    '.aai-avatar::before{content:"";position:absolute;inset:-2px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#EC4899,#06B6D4);z-index:-1;opacity:.35;filter:blur(6px)}',
    '.aai-title{font-size:14px;font-weight:800;background:linear-gradient(135deg,#8B5CF6,#3B82F6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.aai-sub{font-size:10.5px;color:var(--text-muted);margin-top:1px;display:flex;align-items:center;gap:4px}',
    '.aai-dot{width:6px;height:6px;border-radius:50%;background:#22C55E;display:inline-block;box-shadow:0 0 6px rgba(34,197,94,.6);animation:aaiPulse 1.6s ease-in-out infinite}',
    '@keyframes aaiPulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '.aai-reset{width:32px;height:32px;border-radius:10px;background:var(--bg-phone-secondary);border:none;color:var(--text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.aai-reset:active{transform:scale(.94)}',
    '/* Prompt bar */',
    '.aai-prompt-bar{display:flex;gap:6px;overflow-x:auto;padding:10px 14px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);flex-shrink:0;scrollbar-width:none}',
    '.aai-prompt-bar::-webkit-scrollbar{display:none}',
    '.aai-prompt-chip{flex-shrink:0;padding:7px 11px;border:1px solid var(--border-soft);background:var(--bg-phone-secondary);color:var(--text-primary);border-radius:999px;font-size:11.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .15s;white-space:nowrap}',
    '.aai-prompt-chip:hover{border-color:#8B5CF6;color:#8B5CF6}',
    '.aai-prompt-chip:active{transform:scale(.96)}',
    '/* Messages */',
    '.aai-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--bg-phone-secondary)}',
    '.aai-msg{display:flex;gap:7px;max-width:100%;animation:aaiFade .3s ease}',
    '@keyframes aaiFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '.aai-msg--user{flex-direction:row-reverse}',
    '.aai-msg-avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#3B82F6);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px}',
    '.aai-bubble{max-width:84%;border-radius:16px;padding:10px 13px;font-size:13px;line-height:1.5}',
    '.aai-bubble--user{background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border-bottom-right-radius:4px;box-shadow:0 2px 6px rgba(139,92,246,.25)}',
    '.aai-bubble--ai{background:var(--bg-phone);color:var(--text-primary);border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.04);border:1px solid var(--border-soft)}',
    '.aai-bubble-text{white-space:pre-wrap;word-wrap:break-word}',
    '.aai-bubble-text b{font-weight:700}',
    '/* Typing */',
    '.aai-typing{display:flex;gap:4px;padding:4px 2px}',
    '.aai-typing span{width:7px;height:7px;border-radius:50%;background:#8B5CF6;animation:aaiTyping 1.3s ease-in-out infinite}',
    '.aai-typing span:nth-child(2){animation-delay:.15s}',
    '.aai-typing span:nth-child(3){animation-delay:.3s}',
    '@keyframes aaiTyping{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}',
    '/* Analysis panel */',
    '.aai-analysis{margin-top:10px;padding:10px 12px;background:var(--bg-phone-secondary);border-radius:12px;border:1px dashed rgba(139,92,246,.3)}',
    '.aai-analysis-head{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:700;letter-spacing:.4px;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px}',
    '.aai-analysis-rows{display:flex;flex-direction:column;gap:6px}',
    '.aai-arow{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;gap:2px 10px;padding:6px 8px;background:var(--bg-phone);border-radius:8px}',
    '.aai-arow-lbl{font-size:11.5px;font-weight:600;color:var(--text-primary);grid-column:1}',
    '.aai-arow-val{font-size:12.5px;font-weight:800;color:#8B5CF6;grid-column:2;grid-row:1;font-variant-numeric:tabular-nums;text-align:right}',
    '.aai-arow-note{grid-column:1/3;font-size:10px;color:var(--text-muted);margin-top:1px}',
    '/* Action card */',
    '.aai-action{margin-top:10px;padding:10px 12px;background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(236,72,153,.05));border:1px solid rgba(245,158,11,.3);border-radius:12px}',
    '.aai-action-head{display:flex;align-items:center;gap:6px;margin-bottom:6px}',
    '.aai-action-type{font-size:10px;font-weight:800;letter-spacing:.6px;color:#F59E0B}',
    '.aai-action-channel{font-size:10px;color:var(--text-muted);margin-left:auto;padding:2px 7px;background:var(--bg-phone);border-radius:6px;font-weight:600}',
    '.aai-action-target{font-size:11.5px;color:var(--text-primary);margin-bottom:4px}',
    '.aai-action-target b{font-weight:700}',
    '.aai-action-preview{font-size:11.5px;color:var(--text-primary);font-style:italic;padding:7px 10px;background:var(--bg-phone);border-radius:8px;line-height:1.5}',
    '.aai-confirm{margin-top:10px;padding-top:10px;border-top:1px dashed rgba(245,158,11,.35)}',
    '.aai-confirm-q{font-size:11.5px;color:var(--text-primary);font-weight:600;display:flex;align-items:center;gap:5px;margin-bottom:8px}',
    '.aai-confirm-btns{display:flex;gap:7px}',
    '.aai-btn-ghost{flex:1;padding:9px;border:1px solid var(--border-soft);background:transparent;color:var(--text-primary);border-radius:10px;font-size:12px;font-weight:600;cursor:pointer}',
    '.aai-btn-ghost:active{transform:scale(.97)}',
    '.aai-btn-primary{flex:1.4;padding:9px;border:none;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 2px 8px rgba(139,92,246,.3)}',
    '.aai-btn-primary:active{transform:scale(.97)}',
    '.aai-executed,.aai-rejected{margin-top:8px;padding:7px 10px;border-radius:8px;font-size:11.5px;font-weight:600;display:flex;align-items:center;gap:5px}',
    '.aai-executed{background:rgba(34,197,94,.1);color:#166534;border:1px solid rgba(34,197,94,.2)}',
    '.aai-rejected{background:rgba(239,68,68,.1);color:#991B1B;border:1px solid rgba(239,68,68,.2)}',
    '/* Input bar */',
    '.aai-input-bar{display:flex;gap:8px;padding:10px 14px;background:var(--bg-phone);border-top:1px solid var(--border-soft);flex-shrink:0;align-items:center}',
    '.aai-input{flex:1;padding:11px 14px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);color:var(--text-primary);border-radius:999px;font-size:13px;outline:none;transition:border-color .18s}',
    '.aai-input:focus{border-color:#8B5CF6}',
    '.aai-send{width:44px;height:44px;border:none;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(139,92,246,.35);flex-shrink:0}',
    '.aai-send:active{transform:scale(.92)}',
    '/* Tile gradient badge */',
    '.aai-tile-badge{background:linear-gradient(135deg,#8B5CF6 0%,#3B82F6 50%,#06B6D4 100%)!important}'
  ].join('\n');
  document.head.appendChild(s);
}
