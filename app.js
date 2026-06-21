// ===== BANK PERTANYAAN (20) =====
const questionBank = [
  { emoji: '🍜', text: 'Resep ayam dengan bahan sederhana' },
  { emoji: '🍳', text: 'Resep sarapan sehat dan cepat' },
  { emoji: '🥘', text: 'Resep masakan tanpa santan yang enak' },
  { emoji: '🍱', text: 'Ide bekal makan siang bergizi' },
  { emoji: '🥩', text: 'Resep daging sapi yang empuk dan simpel' },
  { emoji: '🍚', text: 'Resep nasi goreng sehat rendah kalori' },
  { emoji: '🥗', text: 'Resep salad buah dan sayur segar' },
  { emoji: '💪', text: 'Menu diet untuk turun berat badan' },
  { emoji: '🌿', text: 'Makanan apa yang bagus untuk diet?' },
  { emoji: '🔥', text: 'Makanan tinggi protein untuk olahraga' },
  { emoji: '⚖️', text: 'Tips makan sehat tanpa rasa lapar' },
  { emoji: '🥦', text: 'Sayuran terbaik untuk program diet' },
  { emoji: '🕐', text: 'Aturan makan apa yang baik untuk kesehatan?' },
  { emoji: '🍎', text: 'Buah-buahan terbaik untuk diet sehat' },
  { emoji: '🧋', text: 'Rekomendasi minuman sehat untuk pagi hari' },
  { emoji: '🥤', text: 'Minuman apa yang bagus untuk metabolisme?' },
  { emoji: '🍵', text: 'Manfaat teh hijau untuk kesehatan' },
  { emoji: '🥛', text: 'Smoothie sehat dan enak untuk energi' },
  { emoji: '☕', text: 'Minuman kafe yang rendah gula dan sehat' },
  { emoji: '🍋', text: 'Minuman detox yang mudah dibuat di rumah' },
];

let conversation = [];
let activeFilter = '';
let calcItems = [];

// ===== DARK MODE =====
function toggleDarkMode() {
  const html = document.documentElement;
  const btn = document.getElementById('darkToggle');
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-theme', 'light');
    btn.textContent = '🌙';
    localStorage.setItem('nutribot-theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    btn.textContent = '☀️';
    localStorage.setItem('nutribot-theme', 'dark');
  }
}

// Load saved theme on startup
(function initTheme() {
  const saved = localStorage.getItem('nutribot-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('darkToggle').textContent = '☀️';
  }
})();

// ===== FILTER DIET =====
function setFilter(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ===== KALKULATOR KALORI =====
function addCalcItem() {
  const food = document.getElementById('calc-food').value.trim();
  const portion = document.getElementById('calc-portion').value.trim();
  if (!food) return;
  calcItems.push({ food, portion: portion ? `${portion} gram` : '1 porsi' });
  renderCalcList();
  document.getElementById('calc-food').value = '';
  document.getElementById('calc-portion').value = '';
  document.getElementById('calc-food').focus();
}

function removeCalcItem(idx) {
  calcItems.splice(idx, 1);
  renderCalcList();
}

function renderCalcList() {
  const list = document.getElementById('calcList');
  const btn = document.getElementById('calcSubmitBtn');
  list.innerHTML = '';
  calcItems.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.food} — ${item.portion}</span><button onclick="removeCalcItem(${i})">✕</button>`;
    list.appendChild(li);
  });
  btn.style.display = calcItems.length > 0 ? 'block' : 'none';
}

function submitCalories() {
  if (calcItems.length === 0) return;
  const items = calcItems.map(i => `- ${i.food} (${i.portion})`).join('\n');
  const prompt = `Tolong hitung estimasi total kalori untuk makanan berikut:\n${items}\n\nTampilkan kalori per item dan total keseluruhannya ya.`;
  document.getElementById('user-input').innerText = prompt;
  calcItems = [];
  renderCalcList();
  if (window.innerWidth <= 768) toggleSidebar();
  sendMessage();
}

// ===== MEAL PLANNER =====
function generateMealPlan() {
  const type = document.getElementById('mealPlanType').value;
  const labels = {
    sehat: 'makan sehat dan bergizi seimbang',
    diet: 'program diet penurunan berat badan',
    vegan: 'vegan (tanpa produk hewani sama sekali)',
    keto: 'keto (rendah karbo, tinggi lemak sehat)',
    bulking: 'bulking (tinggi kalori dan protein untuk menambah massa otot)',
  };
  const prompt = `Buatkan meal plan harian lengkap untuk pola makan ${labels[type]}. Sertakan menu sarapan, snack pagi, makan siang, snack sore, dan makan malam. Tambahkan estimasi kalori untuk setiap waktu makan dan total kalori harian.`;
  document.getElementById('user-input').innerText = prompt;
  if (window.innerWidth <= 768) toggleSidebar();
  sendMessage();
}

// ===== MARKDOWN PARSER =====
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}

function parseMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  html = html.split('\n\n').map(p => {
    p = p.replace(/\n/g, '<br>');
    return `<p>${p}</p>`;
  }).join('');
  html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  return html;
}

// ===== COPY TEXT =====
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✅ Disalin!';
    setTimeout(() => btn.textContent = '📋 Salin', 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✅ Disalin!';
    setTimeout(() => btn.textContent = '📋 Salin', 2000);
  });
}

// ===== EXPORT PDF =====
function exportPdf(text) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 15;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(58, 138, 42);
  doc.text('NutriBot – Less Effort, More Healthy', margin, 18);

  doc.setLineWidth(0.5);
  doc.setDrawColor(91, 184, 74);
  doc.line(margin, 22, doc.internal.pageSize.getWidth() - margin, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 20);

  const lines = doc.splitTextToSize(text, maxWidth);
  let y = 30;
  lines.forEach(line => {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(line, margin, y);
    y += 6;
  });

  const filename = `NutriBot-${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

// ===== RENDER QUICK QUESTIONS =====
function renderQuickQuestions() {
  const container = document.getElementById('quickQuestions');
  if (!container) return;
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 2);
  container.innerHTML = '';
  picked.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    btn.textContent = `${q.emoji} ${q.text}`;
    btn.onclick = () => {
      const input = document.getElementById('user-input');
      input.innerText = q.text;
      sendMessage();
    };
    container.appendChild(btn);
  });
}

function hideWelcome() {
  const box = document.getElementById('welcomeBox');
  if (box) box.style.display = 'none';
}

// ===== APPEND MESSAGE =====
function appendMessage(role, text, isThinking = false) {
  const chatBox = document.getElementById('chat-box');
  hideWelcome();

  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'bot' ? '🌿' : 'Kamu';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (isThinking) {
    bubble.classList.add('thinking-dots');
    bubble.innerHTML = '<span></span><span></span><span></span>';
    wrapper.id = 'thinking-msg';
  } else if (role === 'bot') {
    bubble.innerHTML = parseMarkdown(text);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'bubble-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.textContent = '📋 Salin';
    copyBtn.onclick = () => copyText(text, copyBtn);
    actions.appendChild(copyBtn);

    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'action-btn';
    pdfBtn.textContent = '📄 Export PDF';
    pdfBtn.onclick = () => {
      exportPdf(text);
      pdfBtn.textContent = '✅ Tersimpan!';
      setTimeout(() => pdfBtn.textContent = '📄 Export PDF', 2000);
    };
    actions.appendChild(pdfBtn);

    bubble.appendChild(actions);
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

function removeThinking() {
  const el = document.getElementById('thinking-msg');
  if (el) el.remove();
}

// ===== SEND MESSAGE =====
async function sendMessage() {
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  let userMessage = input.innerText.trim();
  if (!userMessage) return;

  // Apply diet filter if active
  if (activeFilter) {
    userMessage = `[Filter Diet: ${activeFilter}] ${userMessage}`;
  }

  input.innerText = '';
  sendBtn.disabled = true;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  appendMessage('bot', null, true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    removeThinking();

    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

    const data = await response.json();

    if (data && data.result) {
      appendMessage('bot', data.result);
      conversation.push({ role: 'model', text: data.result });
    } else {
      appendMessage('bot', 'Maaf, aku belum bisa menjawab sekarang. Coba tanya lagi ya~ 🌿');
    }

  } catch (error) {
    removeThinking();
    console.error('Fetch error:', error);
    appendMessage('bot', 'Waduh, gagal konek ke server nih. Coba lagi ya kak! 😅');
  } finally {
    sendBtn.disabled = false;
    input.focus();
    // Reset jika ada sisa HTML dari paste
    if (input.innerHTML && !input.innerText.trim()) input.innerHTML = '';
  }
}

// ===== SET CATEGORY =====
function setCategory(cat, e) {
  const labels = {
    resep: '🍜 Aku mau tanya soal resep masakan',
    diet: '🥗 Aku mau tanya soal rekomendasi diet',
    kafe: '🧋 Aku mau tanya soal menu kafe dan minuman',
  };
  const input = document.getElementById('user-input');
  input.innerText = labels[cat] || '';
  input.focus();
  // Pindah cursor ke akhir
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(input);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  if (window.innerWidth <= 768) toggleSidebar();
  document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
  e.currentTarget.classList.add('active');
}

// ===== TOGGLE SIDEBAR =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

// ===== ENTER KEY =====
document.getElementById('user-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Cegah paste HTML, konversi ke plain text
document.getElementById('user-input').addEventListener('paste', function(e) {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});

// ===== INIT =====
renderQuickQuestions();
