import { State } from './lib/state'

export let address = new State('address', '', { persist: 'api' })
export let connectionStatus = new State<'connected' | 'connecting' | 'disconnected'>('connectionStatus', 'disconnected')
export let lastFromRadio = new State('lastFromRadio')
export let channels = new State<Channel[]>('channels', [], { primaryKey: 'index' })
export let packets = new State<MeshPacket[]>('packets', [])
export let nodes = new State<NodeInfo[]>('nodes', [], { primaryKey: 'num' })
export let currentTime = new State<number>('currentTime', Date.now(), { hideLog: true })

export type Message = {
  id: number
  rxTime: string
  type: string
  from: number
  to: number
  channel: number
  data: string
}

export type User = {
  id: string
  longName: string
  shortName: string
  macaddr: Uint8Array
  hwModel: string
  isLicensed: boolean
  role: number
}

export type Position = {
  latitudeI: number
  longitudeI: number
  altitude: number
  time: number
  locationSource: number
  altitudeSource: number
  timestamp: number
  timestampMillisAdjust: number
  altitudeHae: number
  altitudeGeoidalSeparation: number
  PDOP: number
  HDOP: number
  VDOP: number
  gpsAccuracy: number
  groundSpeed: number
  groundTrack: number
  fixQuality: number
  fixType: number
  satsInView: number
  sensorId: number
  nextUpdate: number
  seqNumber: number
  precisionBits: number
}

export type DeviceMetrics = {
  batteryLevel: number
  voltage: number
  channelUtilization: number
  airUtilTx: number
}

export type NodeInfo = {
  num: number
  snr: number
  lastHeard: number
  channel: number
  viaMqtt: boolean
  hopsAway: number
  isFavorite: boolean
  user: User
  position: Position
  deviceMetrics: DeviceMetrics
  rssi?: number
}

export type ChannelSettings = {
  channelNum: number
  psk: Uint8Array
  name: string
  id: number
  uplinkEnabled: boolean
  downlinkEnabled: boolean
  moduleSettings: { positionPrecision: number }
}

export type Channel = {
  index: number
  role: 'PRIMARY' | 'SECONDARY' | 'DISABLED'
  settings: ChannelSettings
}

export type MeshPacket = {
  from: number
  to: number
  channel: number
  encrypted?: string
  decoded?: any
  payloadVariant: any
  // {
  // case: 'decoded',
  // value: Data {
  //   portnum: 1,
  //   payload: [Uint8Array],
  //   wantResponse: false,
  //   dest: 0,
  //   source: 0,
  //   requestId: 0,
  //   replyId: 0,
  //   emoji: 0
  // }
  id: number
  rxTime: number
  rxSnr: number
  hopLimit: number
  wantAck: boolean
  priority: number
  rxRssi: number
  delayed: number
  viaMqtt: boolean
  hopStart: number
  data?: string
  message?: Message
  deviceMetrics?: DeviceMetrics
}
