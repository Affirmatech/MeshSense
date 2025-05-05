import { accessKey, apiHostname, broadcastId, lastFromRadio, nodes, packets, type NodeInfo } from 'api/src/vars'
import { tick } from 'svelte'
import { derived, get, writable } from 'svelte/store'
import { enableAudioAlerts } from '../Settings.svelte'
import axios from 'axios'

export let blockUserKey = writable(false)
export const userKey = writable(localStorage.getItem('userKey') || '')

export const hasAccess = derived([accessKey, userKey], ([$accessKey, $userKey]) => window.location.hostname == 'localhost' || ($accessKey != '' && $accessKey == $userKey))

let failedUserKeyAttempts = 0
userKey.subscribe(async (value) => {
  axios.defaults.headers['authorization'] = `Bearer ` + value
  await tick()

  if (get(hasAccess)) {
    failedUserKeyAttempts = 0
  } else {
    failedUserKeyAttempts += 1
    blockUserKey.set(true)
    setTimeout(() => {
      blockUserKey.set(false)
    }, Math.min(1000 * failedUserKeyAttempts, 10000))
  }

  // console.log({ failedUserKeyAttempts })
  localStorage.setItem('userKey', value)
})

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
  if (!node?.position?.longitudeI) return [node?.approximatePosition?.longitude, node?.approximatePosition?.latitude]
  return [node?.position?.longitudeI / 10000000, node?.position?.latitudeI / 10000000]
}

export function getNodeById(num: number) {
  return nodes.value.find((n) => n.num == num) || ({ num } as NodeInfo)
}

export let audioNewMessage = new Audio(`${import.meta.env.VITE_PATH || ''}/audioNewMessage.mp3`)

packets.on('upsert', (e) => {
  if (get(enableAudioAlerts) && e[0].message?.show) audioNewMessage.play()
})

export function getNodeNameById(id: number) {
  if (id == broadcastId) return 'all'
  if (id == undefined) return 'unknown'
  let node = nodes.value.find((node) => node.num == id)
  return node ? getNodeName(node) : `!${id?.toString(16)}`
}

export function getNodeName(node: NodeInfo) {
  return node?.user?.shortName || node?.user?.id || '!' + node?.num?.toString(16)
}

export function setPosition(latitude: number, longitude: number) {
  let latitudeI = Math.round(latitude * 10000000)
  let longitudeI = Math.round(longitude * 10000000)
  let position = { latitudeI, longitudeI }
  console.log('Updating position', position)
  axios.post('/position', position, { timeout: 3000 })
}

export function testPacket() {
  packets.push({
    from: 2171857383,
    to: 4294967295,
    channel: 0,
    decoded: {
      portnum: 'TELEMETRY_APP',
      payload: 'DTHrB2cSFQhlFXnpgkAd6LSBPyXxhoc/KNjmCA==',
      wantResponse: false,
      dest: 0,
      source: 0,
      requestId: 0,
      replyId: 0,
      emoji: 0
    },
    id: 1727925148,
    rxTime: 1728572132,
    rxSnr: 6,
    hopLimit: 7,
    wantAck: false,
    priority: 'UNSET',
    rxRssi: -84,
    delayed: 'NO_DELAY',
    viaMqtt: false,
    hopStart: 7,
    publicKey: '',
    pkiEncrypted: false,
    // deviceMetrics: {
    //   batteryLevel: 101,
    //   voltage: 4.091000080108643,
    //   channelUtilization: 1.0133333206176758,
    //   airUtilTx: 1.0588055849075317,
    //   uptimeSeconds: 144216
    // }
    environmentMetrics: {
      temperature: 15.008466720581055,
      relativeHumidity: 53.141929626464844,
      barometricPressure: 1004.330810546875,
      gasResistance: 624.9585571289062,
      iaq: 133
    }
  })

  // nodes.upsert({
  //   num: 2171857383,
  //   environmentMetrics: {
  //     temperature: 15.008466720581055,
  //     relativeHumidity: 53.141929626464844,
  //     barometricPressure: 1004.330810546875,
  //     gasResistance: 624.9585571289062,
  //     iaq: 133
  //   }
  // })
}
