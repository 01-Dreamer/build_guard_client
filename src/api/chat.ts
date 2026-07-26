import { API_BASE_URL } from './http'

export interface ChatMessage {
  role: string
  content: string
}

/**
 * 发送消息并返回 SSE 流读取器。
 * 不通过 http.ts 封装，因为需要使用 ReadableStream 处理流式响应。
 */
export function askAiStream(
  message: string,
  history: ChatMessage[],
  onText: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): AbortController {
  const controller = new AbortController()
  const token = localStorage.getItem('build_guard_token')

  fetch(`${API_BASE_URL}/ai-chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, history }),
    signal: controller.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text()
        let msg = `请求失败 (${response.status})`
        try {
          const json = JSON.parse(text)
          msg = json.message || msg
        } catch { /* ignore */ }
        onError(msg)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        onError('浏览器不支持流式读取')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // SSE 事件按双换行分隔
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n')
          let eventType = ''
          let data = ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              const raw = line.slice(5)
              // SSE 标准：data: 后可选一个空格作为值。空 data: 行 = 换行符
              if (raw === '') {
                data += '\n'
              } else {
                data += raw.startsWith(' ') ? raw.slice(1) : raw
              }
            }
          }

          if (eventType === 'text' && data !== '') {
            onText(data)
          } else if (eventType === 'done') {
            onDone()
          } else if (eventType === 'error') {
            onError(data || '未知错误')
          }
        }
      }

      // 处理剩余 buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n')
        let eventType = ''
        let data = ''
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            const raw = line.slice(5)
            if (raw === '') {
              data += '\n'
            } else {
              data += raw.startsWith(' ') ? raw.slice(1) : raw
            }
          }
        }
        if (eventType === 'text' && data !== '') {
          onText(data)
        } else if (eventType === 'done') {
          onDone()
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message || '网络错误')
      }
    })

  return controller
}
