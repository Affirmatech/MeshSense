import { tick } from "svelte"

export function unixSecondsTimeAgo(seconds) {
  return seconds ? timeAgo(Date.now() / 1000 - seconds) : ''
}

export function timeAgo(seconds) {
  const intervals = [
    { value: 31536000, unit: 'y' },
    { value: 86400, unit: 'd' },
    { value: 3600, unit: 'h' },
    { value: 60, unit: 'm' }
  ]

  for (const interval of intervals) {
    const quotient = Math.floor(seconds / interval.value)
    if (quotient >= 1) {
      return `${quotient}${interval.unit}`
    }
  }

  return `now`
}

export function scrollToBottom(element) {
  if (!element) return
  tick().then(() => (element.scrollTop = element.scrollHeight))
}