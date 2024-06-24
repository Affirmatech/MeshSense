import { accessKey, nodes, type NodeInfo } from 'api/src/vars'
import { tick } from 'svelte'
import { derived, writable } from 'svelte/store'

export const userKey = writable(localStorage.getItem('userKey') || '')
userKey.subscribe((value) => localStorage.setItem('userKey', value))
export const hasAccess = derived([accessKey, userKey], ([$accessKey, $userKey]) => $accessKey == $userKey)
window['userKey'] = userKey

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

export function isScrollAtEnd(element: HTMLElement) {
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
}

export function scrollToBottom(element: HTMLElement, force?, notifyUnseen: (recordsUnseen: boolean) => void = undefined) {
  if (!element) return
  let atEnd = isScrollAtEnd(element)
  tick().then(() => {
    if (atEnd || force) {
      element.scrollTop = element.scrollHeight
      if (notifyUnseen) notifyUnseen(false)
    } else {
      if (notifyUnseen) notifyUnseen(true)
    }
  })
}

export function getCoordinates(node: NodeInfo | number) {
  if (typeof node == 'number') node = getNodeById(node)
  return [node?.position?.longitudeI / 10000000, node?.position?.latitudeI / 10000000]
}

function getNodeById(num: number) {
  return nodes.value.find((n) => n.num == num)
}
