<template>
  <div class="chatbot-wrapper">
  <!-- ====== FLOATING CHAT BUBBLE ====== -->
  <div
    v-show="!isOpen"
    class="chat-bubble"
    :style="bubbleStyle"
    @mousedown="startDrag"
    @click.stop="toggleChat"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="white">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
      <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
    </svg>
    <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
  </div>

  <!-- ====== CHAT WINDOW ====== -->
  <div
    v-show="isOpen"
    class="chat-window"
    :style="windowStyle"
  >
    <!-- HEADER -->
    <div class="chat-header" @mousedown="startDrag">
      <div class="chat-header-left">
        <div class="chat-avatar">🤖</div>
        <div>
          <div class="chat-title">MiniMart AI</div>
          <div class="chat-status">
            <span class="status-dot"></span> Trực tuyến
          </div>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="header-btn" @click="clearHistory" title="Xóa lịch sử">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
        <button class="header-btn" @click="toggleChat" title="Thu nhỏ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- MESSAGES AREA -->
    <div class="chat-messages" ref="messagesContainer">

      <!-- ====== WELCOME + CATEGORY BROWSER (khi chưa có tin nhắn) ====== -->
      <div v-if="messages.length === 0 && !loading" class="welcome-section">
        <div class="welcome-icon">👋</div>
        <div class="welcome-text">Xin chào! Tôi là trợ lý của MiniMart.</div>
        <div class="welcome-sub">Chọn chủ đề bên dưới hoặc nhập câu hỏi trực tiếp!</div>

        <!-- CATEGORY LIST VIEW -->
        <div v-if="!selectedCategory" class="category-list">
          <div
            v-for="(cat, idx) in categories"
            :key="idx"
            class="category-card"
            @click="selectCategory(cat)"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <div class="category-info">
              <div class="category-name">{{ cat.name }}</div>
              <div class="category-desc">{{ cat.description }}</div>
            </div>
            <span class="category-arrow">›</span>
          </div>
        </div>

        <!-- QUESTIONS INSIDE SELECTED CATEGORY -->
        <div v-else class="category-detail">
          <button class="back-btn" @click="selectedCategory = null">
            <span class="back-arrow">‹</span> Quay lại danh sách chủ đề
          </button>
          <div class="category-detail-header">
            <span class="category-icon-lg">{{ selectedCategory.icon }}</span>
            <span class="category-name-lg">{{ selectedCategory.name }}</span>
          </div>
          <div class="question-list">
            <button
              v-for="(q, qi) in selectedCategory.questions"
              :key="qi"
              class="question-item"
              @click="handleQuestionClick(q)"
            >
              <span class="question-bullet">💬</span>
              <span>{{ q.question || q }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ====== CHAT MESSAGES ====== -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']"
      >
        <div v-if="msg.role === 'bot'" class="bot-avatar-small">🤖</div>
        <div :class="['message-bubble', msg.role === 'user' ? 'user-bubble' : 'bot-bubble']">
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          <div class="message-meta">
            <span v-if="msg.intent && msg.role === 'bot'" class="intent-tag">{{ intentLabel(msg.intent) }}</span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="loading" class="message-row bot-row">
        <div class="bot-avatar-small">🤖</div>
        <div class="message-bubble bot-bubble typing-bubble">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== QUICK CATEGORIES BAR (sau khi đã chat) ====== -->
    <div v-if="messages.length > 0" class="categories-bar">
      <button
        v-for="(cat, i) in categories"
        :key="i"
        class="cat-tab"
        :class="{ active: expandedBarCategory === cat.name }"
        @click="toggleBarCategory(cat)"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- Expanded questions for selected bar category -->
    <div v-if="messages.length > 0 && expandedBarCategory" class="bar-questions">
      <button
        v-for="(q, qi) in barCategoryQuestions"
        :key="qi"
        class="bar-question-chip"
        @click="handleQuestionClick(q); expandedBarCategory = null"
      >
        {{ q.question || q }}
      </button>
    </div>

    <!-- INPUT AREA -->
    <div class="chat-input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendCurrentMessage"
        placeholder="Nhập câu hỏi của bạn..."
        :disabled="loading"
        class="chat-input"
        ref="chatInput"
      />
      <button
        @click="sendCurrentMessage"
        :disabled="loading || !inputMessage.trim()"
        class="send-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import chatbotService from '../services/chatbotService'

// ============ STATE ============
const isOpen = ref(false)
const loading = ref(false)
const inputMessage = ref('')
const messages = ref([])
const messagesContainer = ref(null)
const chatInput = ref(null)
const unreadCount = ref(0)
const selectedCategory = ref(null)
const expandedBarCategory = ref(null)
const sessionId = ref('chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6))

// ============ DATA QUERY CATEGORIES (câu hỏi truy vấn dữ liệu — gửi qua /message) ============
const DATA_CATEGORIES = [
  {
    icon: '📦', name: 'Sản phẩm', description: 'Tìm kiếm, thống kê sản phẩm', type: 'data',
    questions: [
      'Có bao nhiêu sản phẩm?',
      'Tìm sản phẩm sữa',
      'Sản phẩm nào sắp hết hàng?',
      'Top sản phẩm bán chạy nhất',
    ],
  },
  {
    icon: '💰', name: 'Doanh thu', description: 'Doanh thu, thống kê bán hàng', type: 'data',
    questions: [
      'Doanh thu hôm nay bao nhiêu?',
      'Tổng quan doanh thu',
      'Top sản phẩm bán chạy',
    ],
  },
  {
    icon: '👥', name: 'Khách hàng', description: 'Tra cứu thông tin khách hàng', type: 'data',
    questions: [
      'Có bao nhiêu khách hàng?',
      'Tìm khách hàng Nguyễn',
      'Top khách hàng mua nhiều nhất',
    ],
  },
  {
    icon: '🧾', name: 'Đơn hàng', description: 'Tra cứu đơn hàng', type: 'data',
    questions: [
      'Đơn hàng gần đây',
      'Thống kê đơn hàng hôm nay',
    ],
  },
  {
    icon: '📋', name: 'Tồn kho', description: 'Kiểm tra tồn kho, cửa hàng', type: 'data',
    questions: [
      'Kiểm tra tồn kho',
      'Tồn kho theo cửa hàng',
      'Danh sách cửa hàng',
    ],
  },
  {
    icon: '💵', name: 'Sổ quỹ', description: 'Thu chi, giao dịch sổ quỹ', type: 'data',
    questions: [
      'Tổng kết sổ quỹ hôm nay',
      'Giao dịch sổ quỹ gần đây',
    ],
  },
]

// ============ FAQ DATA (loaded from API /faq) ============
const CATEGORY_ICONS = {
  'Sản phẩm': '📦', 'Đơn hàng': '🧾', 'Tồn kho': '📋', 'Sổ quỹ': '💵',
  'Khách hàng': '👥', 'Danh mục': '📂', 'Bảng giá': '💰', 'Giảm giá': '🏷️',
  'Phân quyền': '🔒', 'Cửa hàng': '🏪', 'Nhà cung cấp': '🏭', 'Báo cáo': '📊',
  'Hệ thống': '⚙️', 'POS': '🛒', 'Chatbot': '🤖',
}

const faqCategories = ref([])
const categories = computed(() => [...DATA_CATEGORIES, ...faqCategories.value])

const barCategoryQuestions = computed(() => {
  if (!expandedBarCategory.value) return []
  const cat = categories.value.find(c => c.name === expandedBarCategory.value)
  return cat ? cat.questions : []
})

const INTENT_LABELS = {
  greeting: '👋 Chào hỏi',
  product_search: '🔍 Tìm SP',
  product_count: '📦 Số lượng SP',
  product_low_stock: '⚠️ Sắp hết hàng',
  product_info: '📋 Thông tin SP',
  revenue_today: '💰 DT hôm nay',
  revenue_overview: '📊 Tổng quan DT',
  top_products: '🏆 Top SP',
  top_customers: '👑 Top KH',
  inventory_check: '📦 Tồn kho',
  inventory_by_store: '🏪 Kho theo CH',
  transaction_summary: '💵 Tổng kết quỹ',
  transaction_recent: '💵 GD gần đây',
  customer_count: '👥 Số KH',
  customer_search: '🔍 Tìm KH',
  order_recent: '🧾 Đơn gần đây',
  order_stats: '📊 Thống kê đơn',
  store_list: '🏪 DS Cửa hàng',
  faq: '📖 Hướng dẫn',
  permission_denied: '🔒 Giới hạn',
  unknown: '❓ Không rõ',
  error: '❌ Lỗi',
}

function intentLabel(intent) {
  return INTENT_LABELS[intent] || intent
}

// ============ Load FAQ from API /faq ============
async function loadFAQ() {
  try {
    const { data } = await chatbotService.getFAQ()
    if (data.data && data.data.faqs && data.data.faqs.length > 0) {
      // Group by category
      const catMap = {}
      for (const faq of data.data.faqs) {
        if (!catMap[faq.category]) catMap[faq.category] = []
        catMap[faq.category].push({ question: faq.question, answer: faq.answer })
      }
      faqCategories.value = Object.entries(catMap).map(([name, questions]) => ({
        icon: CATEGORY_ICONS[name] || '📖',
        name: `📖 ${name}`,
        description: `${questions.length} câu hướng dẫn`,
        type: 'faq',
        questions,
      }))
    }
  } catch (e) {
    console.warn('[Chatbot] Không tải được FAQ từ server.')
  }
}

// ============ Handle FAQ question click — show answer directly ============
function handleQuestionClick(q) {
  // If q is a FAQ object with { question, answer } → show answer directly
  if (q && typeof q === 'object' && q.answer) {
    selectedCategory.value = null
    expandedBarCategory.value = null
    messages.value.push({ role: 'user', content: q.question, timestamp: new Date() })
    messages.value.push({
      role: 'bot',
      content: q.answer,
      intent: 'faq',
      type: 'faq',
      timestamp: new Date(),
    })
    scrollToBottom()
    return
  }
  // Fallback: plain text question → send to backend /message
  sendMessage(typeof q === 'string' ? q : q.question)
}

// ============ CATEGORY NAVIGATION ============
function selectCategory(cat) {
  selectedCategory.value = cat
}

function toggleBarCategory(cat) {
  expandedBarCategory.value = expandedBarCategory.value === cat.name ? null : cat.name
}

// ============ DRAG LOGIC ============
const position = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
const hasDragged = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })

onMounted(() => {
  position.x = window.innerWidth - 80
  position.y = window.innerHeight - 80
  loadFAQ()
})

const bubbleStyle = computed(() => ({
  left: `${position.x}px`,
  top: `${position.y}px`,
  /* fallback: luôn đảm bảo hiển thị */
  right: 'auto',
  bottom: 'auto',
}))

const windowStyle = computed(() => {
  const w = 528
  const h = 744
  let x = position.x - w + 70
  let y = position.y - h
  x = Math.max(8, Math.min(x, window.innerWidth - w - 8))
  y = Math.max(8, Math.min(y, window.innerHeight - h - 8))
  return { left: `${x}px`, top: `${y}px`, right: 'auto', bottom: 'auto' }
})

function startDrag(e) {
  if (e.button !== 0) return
  isDragging.value = true
  hasDragged.value = false
  dragOffset.x = e.clientX - position.x
  dragOffset.y = e.clientY - position.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

function onDrag(e) {
  if (!isDragging.value) return
  hasDragged.value = true
  let newX = e.clientX - dragOffset.x
  let newY = e.clientY - dragOffset.y
  newX = Math.max(0, Math.min(newX, window.innerWidth - 60))
  newY = Math.max(0, Math.min(newY, window.innerHeight - 60))
  position.x = newX
  position.y = newY
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

// ============ CHAT LOGIC ============

function toggleChat() {
  if (hasDragged.value) { hasDragged.value = false; return }
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    nextTick(() => { chatInput.value?.focus(); scrollToBottom() })
  }
}

function sendCurrentMessage() {
  const msg = inputMessage.value.trim()
  if (!msg || loading.value) return
  inputMessage.value = ''
  sendMessage(msg)
}

async function sendMessage(text) {
  // Reset category selections
  selectedCategory.value = null
  expandedBarCategory.value = null

  messages.value.push({ role: 'user', content: text, timestamp: new Date() })
  scrollToBottom()
  loading.value = true

  try {
    const { data } = await chatbotService.sendMessage(text, sessionId.value)
    const reply = data.data

    messages.value.push({
      role: 'bot',
      content: reply.reply,
      intent: reply.intent,
      type: reply.type,
      timestamp: new Date(),
    })

    if (reply.session_id) sessionId.value = reply.session_id
    if (!isOpen.value) unreadCount.value++
  } catch (err) {
    console.error('[Chatbot]', err)
    const errorMsg = err.response?.data?.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!'
    messages.value.push({
      role: 'bot', content: '❌ ' + errorMsg, intent: 'error', timestamp: new Date(),
    })
  } finally {
    loading.value = false
    scrollToBottom()
    nextTick(() => chatInput.value?.focus())
  }
}

async function clearHistory() {
  if (!confirm('Xóa toàn bộ lịch sử chat?')) return
  try { await chatbotService.deleteHistory(sessionId.value) } catch { /* ignore */ }
  messages.value = []
  selectedCategory.value = null
  expandedBarCategory.value = null
  sessionId.value = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
}

// ============ HELPERS ============

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatMessage(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '&bull; ')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
</script>

<style scoped>
/* ============ FLOATING BUBBLE ============ */
.chat-bubble {
  position: fixed;
  z-index: 99999;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}
.chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}
.unread-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #ef4444;
  color: white;
  font-size: 13px; font-weight: 700;
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

/* ============ CHAT WINDOW ============ */
.chat-window {
  position: fixed;
  z-index: 99999;
  width: 528px;
  height: 744px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ============ HEADER ============ */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 18px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.chat-header:active { cursor: grabbing; }
.chat-header-left { display: flex; align-items: center; gap: 12px; }
.chat-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
}
.chat-title { font-size: 18px; font-weight: 600; }
.chat-status { font-size: 14px; opacity: 0.85; display: flex; align-items: center; gap: 5px; }
.status-dot {
  width: 8px; height: 8px;
  background: #34d399; border-radius: 50%;
}
.chat-header-actions { display: flex; gap: 5px; }
.header-btn {
  background: rgba(255,255,255,0.15);
  border: none; color: white;
  width: 36px; height: 36px; border-radius: 9px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.header-btn:hover { background: rgba(255,255,255,0.3); }

/* ============ MESSAGES ============ */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f7f8fc;
}
.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-thumb { background: #c4c8d4; border-radius: 4px; }

/* ============ WELCOME SECTION ============ */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}
.welcome-icon { font-size: 44px; margin-bottom: 10px; }
.welcome-text { font-size: 19px; font-weight: 600; color: #1e293b; }
.welcome-sub { font-size: 15px; color: #64748b; margin-top: 5px; margin-bottom: 18px; text-align: center; }

/* --- Category List --- */
.category-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.category-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.category-card:hover {
  border-color: #667eea;
  background: #f0f2ff;
  transform: translateX(3px);
}
.category-icon { font-size: 28px; flex-shrink: 0; }
.category-info { flex: 1; min-width: 0; }
.category-name { font-size: 16px; font-weight: 600; color: #1e293b; }
.category-desc { font-size: 13px; color: #94a3b8; margin-top: 2px; }
.category-arrow {
  font-size: 26px;
  color: #cbd5e1;
  font-weight: 300;
  flex-shrink: 0;
  transition: color 0.2s;
}
.category-card:hover .category-arrow { color: #667eea; }

/* --- Category Detail (questions) --- */
.category-detail { width: 100%; }
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 5px 0;
  margin-bottom: 12px;
  transition: color 0.2s;
}
.back-btn:hover { color: #4f46e5; }
.back-arrow { font-size: 22px; font-weight: 600; }
.category-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8ecf1;
}
.category-icon-lg { font-size: 34px; }
.category-name-lg { font-size: 20px; font-weight: 700; color: #1e293b; }

.question-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.question-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 13px 16px;
  cursor: pointer;
  font-size: 16px;
  color: #334155;
  text-align: left;
  transition: all 0.2s;
}
.question-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}
.question-bullet { font-size: 16px; flex-shrink: 0; }
.question-item:hover .question-bullet { filter: brightness(2); }

/* ============ MESSAGE ROWS ============ */
.message-row { display: flex; align-items: flex-end; gap: 10px; }
.user-row { justify-content: flex-end; }
.bot-row { justify-content: flex-start; }

.bot-avatar-small {
  width: 34px; height: 34px;
  border-radius: 50%; background: #eef2ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
}
.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}
.bot-bubble {
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.message-meta { display: flex; align-items: center; gap: 7px; margin-top: 5px; flex-wrap: wrap; }
.message-time { font-size: 12px; opacity: 0.5; }
.intent-tag {
  font-size: 12px;
  background: #eef2ff; color: #667eea;
  padding: 3px 8px; border-radius: 7px;
  font-weight: 500;
}

/* Typing */
.typing-bubble { padding: 14px 22px; }
.typing-indicator { display: flex; gap: 5px; }
.typing-indicator span {
  width: 9px; height: 9px;
  background: #94a3b8; border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ============ CATEGORIES BAR (scrollable tabs after messages) ============ */
.categories-bar {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  flex-shrink: 0;
  background: #f0f2fa;
  border-top: 1px solid #e2e8f0;
}
.categories-bar::-webkit-scrollbar { height: 4px; }
.categories-bar::-webkit-scrollbar-thumb { background: #c4c8d4; border-radius: 4px; }
.cat-tab {
  white-space: nowrap;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.cat-tab:hover, .cat-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Questions dropdown from bar */
.bar-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #f7f8fc;
  border-top: 1px solid #eef0f4;
  max-height: 108px;
  overflow-y: auto;
  flex-shrink: 0;
}
.bar-question-chip {
  background: white;
  border: 1px solid #dde2ea;
  border-radius: 16px;
  padding: 5px 14px;
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}
.bar-question-chip:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* ============ INPUT AREA ============ */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid #e2e8f0;
  background: white;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  padding: 12px 18px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.chat-input:focus { border-color: #667eea; }
.chat-input:disabled { background: #f1f5f9; }
.send-btn {
  width: 48px; height: 48px;
  border-radius: 50%; border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { transform: scale(1.08); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ============ RESPONSIVE ============ */
@media (max-width: 600px) {
  .chat-window {
    width: calc(100vw - 16px);
    height: calc(100vh - 80px);
    border-radius: 14px;
  }
}
</style>
