export function envStatusClass(status: string) {
  if (status === '启动' || status === '已处理') return 'good'
  if (status === '处理中') return 'warning'
  return 'danger'
}
