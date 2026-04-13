/* ═══ BIZ AI COMPONENT ═══ */

let bizAiHasStarted = false;

function bizAiSend() {
  const input = document.getElementById('bizAiChatInput');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  bizAiAddUserMsg(text);
  bizAiProcessMessage(text);
}

function bizAiQuickAction(type) {
  const msgs = {
    daily: 'Bugünün raporunu göster',
    menu: 'Menüme ne eklemeliyim?',
    shift: 'Bu hafta vardiya planı öner',
    reviews: 'Son müşteri yorumlarını özetle'
  };
  const welcome = document.getElementById('bizAiWelcome');
  if (welcome) welcome.style.display = 'none';
  bizAiHasStarted = true;
  bizAiAddUserMsg(msgs[type] || type);
  bizAiProcessMessage(msgs[type] || type);
}

function bizAiAddUserMsg(text) {
  const welcome = document.getElementById('bizAiWelcome');
  if (welcome) welcome.style.display = 'none';
  bizAiHasStarted = true;

  const container = document.getElementById('bizAiChatMessages');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-user';
  div.innerHTML = `<div class="ai-msg-bubble ai-msg-user-bubble">${escHtml(text)}</div>`;
  container.appendChild(div);
  bizAiScrollBottom();
}

function bizAiAddBotMsg(html) {
  const container = document.getElementById('bizAiChatMessages');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-bot';
  div.innerHTML = `<div class="ai-msg-bubble ai-msg-bot-bubble">${html}</div>`;
  container.appendChild(div);
  bizAiScrollBottom();
}

function bizAiScrollBottom() {
  const c = document.getElementById('bizAiChatMessages');
  if (c) setTimeout(() => c.scrollTop = c.scrollHeight, 50);
}

function bizAiProcessMessage(text) {
  const lower = text.toLowerCase();
  setTimeout(() => {
    if (lower.includes('rapor') || lower.includes('bugün')) {
      const s = BIZ_DASHBOARD_STATS;
      bizAiAddBotMsg(`<strong>Günlük Rapor — ${getBizBranch().name}</strong><br><br>
        📊 <strong>Ciro:</strong> ₺${s.today.revenue.toLocaleString('tr-TR')} (dünden %${Math.round(((s.today.revenue - s.yesterday.revenue) / s.yesterday.revenue) * 100)} fazla)<br>
        🛒 <strong>Sipariş:</strong> ${s.today.orders} adet (ort. sepet ₺${s.today.avgBasket})<br>
        👥 <strong>Müşteri:</strong> ${s.today.newCustomers} yeni, ${s.today.returningCustomers} tekrar gelen<br>
        ⭐ <strong>Puan:</strong> ${s.thisMonth.avgRating}/5.0<br><br>
        En çok satan: <strong>${s.thisWeek.topItems[0].name}</strong> (${s.thisWeek.topItems[0].qty} adet)`);
    } else if (lower.includes('menü') || lower.includes('ekle')) {
      bizAiAddBotMsg(`Menü analizi yaptım. Birkaç öneri:<br><br>
        🔥 <strong>Trend:</strong> Bölgenizde sağlıklı bowl menüler %35 artış gösteriyor<br>
        📈 <strong>Öneri 1:</strong> Buddha Bowl — Protein bowl'lar çok talep görüyor<br>
        🥗 <strong>Öneri 2:</strong> Avokado Toast — Kahvaltı menünüze eklemeniz önerilir<br>
        🍰 <strong>Öneri 3:</strong> Protein tatlıları — Fit müşteri segmenti büyüyor<br><br>
        Bunlardan birini menünüze eklememi ister misiniz?`);
    } else if (lower.includes('vardiya') || lower.includes('plan')) {
      bizAiAddBotMsg(`Haftalık vardiya önerisi hazırladım:<br><br>
        📅 <strong>Pazartesi-Cuma:</strong><br>
        • Sabah (08-16): 2 garson, 1 şef, 1 kasiyer<br>
        • Akşam (16-00): 3 garson, 2 şef, 1 kasiyer<br><br>
        📅 <strong>Hafta sonu:</strong><br>
        • Tam gün: 4 garson, 2 şef, 1 kasiyer<br><br>
        ⚠️ Cuma akşamı yoğunluk %40 artıyor — ekstra garson önerilir.`);
    } else if (lower.includes('yorum') || lower.includes('müşteri')) {
      const reviews = BIZ_REVIEWS;
      const avg = BIZ_DASHBOARD_STATS.thisMonth.avgRating;
      bizAiAddBotMsg(`Son ${reviews.length} yorumun analizi:<br><br>
        ⭐ <strong>Ortalama:</strong> ${avg}/5.0<br>
        😊 <strong>Olumlu:</strong> ${reviews.filter(r => r.rating >= 4).length} yorum — Lezzet ve sunum öne çıkıyor<br>
        😐 <strong>Nötr:</strong> ${reviews.filter(r => r.rating === 3).length} yorum — Servis hızı eleştirisi var<br>
        😞 <strong>Olumsuz:</strong> ${reviews.filter(r => r.rating < 3).length} yorum<br><br>
        💡 <strong>Öneri:</strong> Servis süresini kısaltmak için garson eğitimi düzenleyin.`);
    } else {
      bizAiAddBotMsg(`Sorunuzu analiz ediyorum... İşletmeniz hakkında daha spesifik sorular sorabilirsiniz:<br><br>
        • "Bugünün raporu" — Günlük özet<br>
        • "En çok ne sattım?" — Satış analizi<br>
        • "Vardiya planı öner" — Personel planlaması<br>
        • "Yorumları özetle" — Müşteri memnuniyeti`);
    }
  }, 600);
}

