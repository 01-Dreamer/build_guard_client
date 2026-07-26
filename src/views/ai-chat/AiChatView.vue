<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })
import { Promotion } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { askAiStream, type ChatMessage } from '../../api/chat'
import AppTopbar from '../../components/AppTopbar.vue'

const authStore = useAuthStore()

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<DisplayMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const messageListRef = ref<HTMLElement>()
const abortController = ref<AbortController | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function buildHistory(): ChatMessage[] {
  return messages.value.slice(-20).map((m) => ({
    role: m.role,
    content: m.content
  }))
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  const aiMsg: DisplayMessage = { role: 'assistant', content: '' }
  messages.value.push(aiMsg)
  loading.value = true

  const history = buildHistory().slice(0, -2)
  abortController.value = askAiStream(
    text,
    history,
    (chunk) => {
      aiMsg.content += chunk
      scrollToBottom()
    },
    () => {
      loading.value = false
      abortController.value = null
      if (!aiMsg.content) aiMsg.content = '（AI 未返回内容）'
    },
    (error) => {
      loading.value = false
      abortController.value = null
      if (!aiMsg.content) {
        aiMsg.content = '抱歉，请求失败：' + error
      } else {
        aiMsg.content += '\n\n（对话中断：' + error + '）'
      }
    }
  )
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function stopGeneration() {
  abortController.value?.abort()
  loading.value = false
  abortController.value = null
}

onBeforeUnmount(() => {
  abortController.value?.abort()
})

const quickQuestions = [
  '当前工地设备运行情况如何？',
  '有哪些设备正在报警？',
  '环境监测数据怎么样？PM2.5超标了吗？',
  '最近有什么AI风险识别？',
  '设备在线情况怎么样？'
]

function askQuick(question: string) {
  inputText.value = question
  sendMessage()
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  // 修复常见格式问题：##text → ## text（标题缺少空格 marked 无法识别）
  const fixed = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
  return marked.parse(fixed) as string
}
</script>

<template>
  <div class="ai-chat-page">
    <AppTopbar />

    <div class="chat-container">
      <aside class="chat-sidebar">
        <div class="sidebar-header">
          <el-icon :size="20"><Promotion /></el-icon>
          <span>BuildGuard 助手</span>
        </div>
        <p class="sidebar-desc">我是您的工地安全监控助手，可以帮您查询：</p>
        <ul class="capability-list">
          <li>设备状态与在线情况</li>
          <li>实时环境监测数据</li>
          <li>报警与预警记录</li>
          <li>AI 风险识别结果</li>
          <li>指定设备的遥测详情</li>
        </ul>
        <div class="quick-questions">
          <p class="quick-title">试试这些问题：</p>
          <button
            v-for="q in quickQuestions" :key="q"
            class="quick-btn" :disabled="loading" @click="askQuick(q)"
          >{{ q }}</button>
        </div>
      </aside>

      <div class="chat-main">
        <div ref="messageListRef" class="message-list">
          <div v-if="messages.length === 0" class="welcome">
            <el-icon :size="48" color="#94a3b8"><Promotion /></el-icon>
            <h2>您好，我是 BuildGuard 助手</h2>
            <p>可以问我关于工地设备、环境、报警等方面的任何问题</p>
          </div>

          <div
            v-for="(msg, idx) in messages" :key="idx"
            class="message-row" :class="msg.role"
          >
            <div class="message-avatar">
              <el-icon v-if="msg.role === 'assistant'" :size="18"><Promotion /></el-icon>
              <span v-else class="user-avatar">{{ authStore.user?.name?.slice(0, 1) || '管' }}</span>
            </div>
            <div class="message-bubble" :class="msg.role">
              <template v-if="msg.content">
                <p v-if="msg.role === 'user'" v-for="(line, i) in msg.content.split('\n')" :key="i">{{ line || '&nbsp;' }}</p>
                <div v-else class="markdown-body" v-html="renderMarkdown(msg.content)" />
              </template>
              <span v-else-if="msg.role === 'assistant'" class="typing-cursor">|</span>
            </div>
          </div>
        </div>

        <div class="input-area">
          <textarea
            v-model="inputText" class="chat-input" :disabled="loading"
            placeholder="输入您的问题，Enter 发送，Shift+Enter 换行" rows="2"
            @keydown="handleKeydown"
          />
          <button v-if="loading" class="send-btn stop-btn" @click="stopGeneration">停止</button>
          <button v-else class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-chat-page { display: flex; flex-direction: column; height: 100vh; background: #f1f5f9; }
.chat-container { display: flex; flex: 1; min-height: 0; max-width: 1400px; width: 100%; margin: 0 auto; }

/* 侧边栏 */
.chat-sidebar { width: 280px; flex-shrink: 0; padding: 24px 20px; background: #fff; border-right: 1px solid #e2e8f0; overflow-y: auto; }
.sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
.sidebar-desc { font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.6; }
.capability-list { list-style: none; padding: 0; margin: 0 0 20px 0; }
.capability-list li { padding: 4px 0 4px 16px; font-size: 13px; color: #475569; position: relative; }
.capability-list li::before { content: ''; position: absolute; left: 0; top: 10px; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }
.quick-questions { border-top: 1px solid #e2e8f0; padding-top: 16px; }
.quick-title { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
.quick-btn { display: block; width: 100%; text-align: left; padding: 8px 12px; margin-bottom: 6px; font-size: 13px; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.15s; line-height: 1.5; }
.quick-btn:hover:not(:disabled) { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
.quick-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 主聊天区 */
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #fff; }
.message-list { flex: 1; overflow-y: auto; padding: 24px 32px; }
.welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; }
.welcome h2 { margin: 16px 0 8px; font-size: 20px; font-weight: 600; color: #64748b; }
.welcome p { font-size: 14px; }

/* 消息气泡 */
.message-row { display: flex; gap: 12px; margin-bottom: 20px; max-width: 85%; }
.message-row.user { margin-left: auto; flex-direction: row-reverse; }
.message-avatar { flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e8f1ff; color: #3b82f6; }
.message-row.user .message-avatar { background: #3b82f6; color: #fff; }
.user-avatar { font-size: 14px; font-weight: 700; }
.message-bubble { padding: 10px 16px; border-radius: 12px; font-size: 14px; line-height: 1.7; word-break: break-word; }
.message-bubble p { margin: 0; }
.message-bubble p + p { margin-top: 4px; }
.message-bubble.assistant { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; border-top-left-radius: 4px; }
.message-bubble.user { background: #3b82f6; color: #fff; border-top-right-radius: 4px; }
.typing-cursor { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* 输入区 */
.input-area { display: flex; gap: 10px; align-items: flex-end; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #fafbfc; }
.chat-input { flex: 1; padding: 10px 14px; font-size: 14px; line-height: 1.6; color: #1e293b; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; resize: none; outline: none; font-family: inherit; transition: border-color 0.15s; }
.chat-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12); }
.chat-input:disabled { background: #f1f5f9; color: #94a3b8; }
.send-btn { padding: 10px 24px; font-size: 14px; font-weight: 600; color: #fff; background: #3b82f6; border: none; border-radius: 10px; cursor: pointer; white-space: nowrap; transition: background 0.15s; font-family: inherit; }
.send-btn:hover:not(:disabled) { background: #2563eb; }
.send-btn:disabled { background: #94a3b8; cursor: not-allowed; }
.stop-btn { background: #ef4444; }
.stop-btn:hover { background: #dc2626; }

@media (max-width: 768px) {
  .chat-sidebar { display: none; }
  .message-row { max-width: 95%; }
  .message-list { padding: 16px; }
}
</style>

<style>
/* 非 scoped — 对 v-html 渲染的表格/标题等生效 */
.markdown-body { font-size: 14px; line-height: 1.8; color: #1e293b; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { margin: 14px 0 6px; font-weight: 600; }
.markdown-body h1 { font-size: 18px; }
.markdown-body h2 { font-size: 16px; }
.markdown-body h3 { font-size: 15px; }
.markdown-body p { margin: 6px 0; }
.markdown-body strong { font-weight: 700; color: #0f172a; }
.markdown-body li { margin: 2px 0; padding-left: 4px; }
.markdown-body code { padding: 1px 5px; font-size: 13px; background: #f1f5f9; border-radius: 4px; color: #e11d48; }
.markdown-body table { width: 100%; margin: 10px 0; border-collapse: collapse; font-size: 13px; }
.markdown-body th { padding: 8px 12px; text-align: left; font-weight: 600; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; }
.markdown-body td { padding: 6px 12px; border: 1px solid #e2e8f0; color: #334155; }
.markdown-body tr:nth-child(even) td { background: #fafbfc; }
</style>
