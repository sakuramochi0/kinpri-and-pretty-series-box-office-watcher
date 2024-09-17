export function formatDate(dateString: string, includeTime: Boolean = false) {
  const date = new Date(dateString);
  const day = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short' }).format(date)
  const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date)
  const time = new Intl.DateTimeFormat('ja', {
    timeStyle: 'long'
  }).format(date)
  return `${day}(${weekday})${includeTime ? ` ${time}` : ''}`
}
