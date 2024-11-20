/**
 * https://js.meshtastic.org/
 */

// import { HttpConnection, BleConnection } from '@meshtastic/js'
import { HttpConnection, BleConnection, Protobuf } from '../meshtastic'
import {
  NodeInfo,
  address,
  automaticTraceroutes,
  broadcastId,
  channels,
  connectionStatus,
  enableTLS,
  lastFromRadio,
  messagePrefix,
  messageSuffix,
  myNodeMetadata,
  myNodeNum,
  nodes,
  packetLimit,
  packets,
  pendingTraceroutes,
  tracerouteRateLimit
} from './vars'
import { beginScanning, bluetoothDevices, stopScanning } from './lib/bluetooth'
import exitHook from 'exit-hook'
import * as geolib from 'geolib'

let connection: HttpConnection | BleConnection
let connectionIntended = false
// address.subscribe(connect)

/** Tracks when nodes were last requested a traceroute: `traceRouteLog[nodeNum]` */
let traceRouteLog: Record<number, number> = {}

let globalTracerouteRateLimitSec = 30

export let deviceConfig: any = {}

/** Returns `true` if the node has not recently had a traceroute sent to it based on `tracerouteRateLimit` */
function isTracerouteAvailable(nodeNum: number) {
  if (!traceRouteLog[nodeNum]) return true
  let lastTracerouteRelativeTime = Date.now() - traceRouteLog[nodeNum]
  if (lastTracerouteRelativeTime > tracerouteRateLimit.value * 60000) return true
  console.log(`[meshtastic] Traceroute to ${nodeNum} already sent ${(lastTracerouteRelativeTime / 60000).toFixed(1)} minutes ago`)
  return false
}

packets.subscribe(() => {
  let limit = isNaN(packetLimit.value) ? 500 : packetLimit.value
  while (packets.value?.length > limit) packets.shift()
})

connectionStatus.subscribe((value) => {
  if (value == 'disconnected' || value == 'searching' || value == 'reconnecting') {
    beginScanning()
  } else stopScanning()
})

function copy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

function validateMACAddress(macAddress: string): boolean {
  const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  const macPattern = /^([^/W]*-){4}[^/W]{12}$/
  return pattern.test(macAddress) || macPattern.test(macAddress)
}

function disableReconnect() {
  connection.connect = async (args: any) => {
    console.log('[meshtastic] Preventing Automatic Reconnect')
  }
}

exitHook(() => {
  disconnect()
  // connectionStatus.set('disconnected')
  // console.log('Disconnecting from device')
  // connection?.disconnect()
})

/** Disconnect from any existing connection */
export async function disconnect(setIntent = true) {
  connectionStatus.set('disconnected')
  if (setIntent) connectionIntended = false
  console.log('Disconnecting from device')
  if (connection) {
    disableReconnect()
    connection.disconnect()
    clearTimeout(connection['timeout'])
  }
  if (setIntent) reset()
}

export function reset() {
  nodes.set([])
  packets.set([])
  myNodeNum.set(undefined)
  myNodeMetadata.set(undefined)
  deleteInProgress = false
  deviceConfig = {}
}

/**
 * Connects to a MeshTastic Node using an HTTP connection.
 * @param {string} address - The IP address of the MeshTastic Node to connect to.
 */
export async function connect(address?: string) {
  console.log('[meshtastic] Calling connect', address)

  await disconnect(false)
  connectionIntended = true
  if (!address || address == '') return

  if (validateMACAddress(address)) {
    /** Bluetooth Device */
    connection = new BleConnection()
    connectionStatus.set('searching')

    /** Scan and wait for device to appear if not present */
    beginScanning(address)
    while (!bluetoothDevices[address] && connectionStatus.value == 'searching') {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    /** If device never showed up, bail */
    if (!bluetoothDevices[address]) return
    stopScanning()
  } else {
    /** HTTP Endpoint */
    connection = new HttpConnection()
  }

  connectionStatus.set('connecting')
  channels.set([])
  updateTimeout()

  //   DeviceRestarting = 1,
  //   DeviceDisconnected = 2,
  //   DeviceConnecting = 3,
  //   DeviceReconnecting = 4,
  //   DeviceConnected = 5,
  //   DeviceConfiguring = 6,
  //   DeviceConfigured = 7,
  connection.events.onDeviceStatus.subscribe(async (e) => {
    console.log('[meshtastic] Device Status', e)
    if (e == 6) {
      connectionStatus.set('configuring')
    } else if (e == 3) {
      connectionStatus.set('connecting')
    } else if (e == 7) {
      connectionStatus.set('connected')
      setTime()
      // } else if (e == 4) {
      // await disconnect()
    } else if (e == 2) {
      console.log('Connection Intended', connectionIntended)
      if (connectionIntended) {
        connectionStatus.set('reconnecting')
        connect(address)
      } else {
        connectionStatus.set('disconnected')
        reset()
      }
    }
  })

  /** Channel Info */
  connection.events.onChannelPacket.subscribe((e) => {
    channels.upsert(copy(e))
  })

  /** All packets */
  connection.events.onMeshPacket.subscribe((e) => {
    if (e.from) {
      let updates: any = {
        num: e.from,
        lastHeard: Date.now() / 1000
      }

      if (e.hopStart) {
        Object.assign(updates, {
          snr: e.rxSnr,
          rssi: e.rxRssi,
          hopsAway: e.hopStart - e.hopLimit
        })
      }

      let originalNodeRecord = nodes.value.find((n) => n.num == updates.num)
      if (updates.hopsAway == 0) updates.trace = null
      else if (automaticTraceroutes.value && originalNodeRecord?.position?.latitudeI && updates.hopsAway && (!originalNodeRecord.trace || originalNodeRecord?.hopsAway != updates.hopsAway)) {
        if (isTracerouteAvailable(updates.num)) traceRoute(updates.num)
      }

      nodes.upsert(updates)
      packets.push(copy(e))
    }
  })

  /** MyNodeInfo ID on Connection */
  connection.events.onMyNodeInfo.subscribe((e) => {
    myNodeNum.set(e.myNodeNum)
  })

  connection.events.onDeviceMetadataPacket.subscribe((e) => {
    myNodeMetadata.set(e.data as any)
  })

  /** NODEINFO_APP */
  connection.events.onNodeInfoPacket.subscribe((e) => {
    let existingNode = nodes.value.find((n) => e.num == n.num)
    if (existingNode?.lastHeard > e.lastHeard) e.lastHeard = existingNode.lastHeard
    nodes.upsert(copy(e))
  })

  /** Update Node User data */
  connection.events.onUserPacket.subscribe((e) => {
    let { id, from, data } = copy(e)
    if (id) packets.upsert({ id, user: data })
    if (from) nodes.upsert({ num: from, user: data })
  })

  /** TEXT_MESSAGE_APP */
  connection.events.onMessagePacket.subscribe((e) => {
    let message = copy(e)
    message.show = true
    packets.upsert({ id: message.id, message })
  })

  /** TELEMETRY_APP */
  connection.events.onTelemetryPacket.subscribe((e) => {
    let { id, data } = copy(e)
    let telemetry: Record<string, any> = {}
    for (let key of ['deviceMetrics', 'environmentMetrics', 'airQualityMetrics', 'powerMetrics', 'localStats', 'healthMetrics']) {
      if (data[key]) telemetry[key] = data[key]
    }
    packets.upsert({ id, ...telemetry })
    if (Object.keys(telemetry).length) nodes.upsert({ num: e.from, ...telemetry })
  })

  /** POSITION_APP */
  connection.events.onPositionPacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id && data.latitudeI) packets.upsert({ id, position: data })
    if (e.from && data.latitudeI) nodes.upsert({ num: e.from, position: data })
  })

  /** DETECTION_SENSOR_APP */
  connection.events.onDetectionSensorPacket.subscribe((e) => {
    let { id, data } = copy(e)
    packets.upsert({ id, detectionSensor: String(data) })
  })

  /** onChannelPacket */
  connection.events.onChannelPacket.subscribe((e) => {
    // Object.assign(deviceConfig, copy(e))
    // deviceConfig
    // console.log('CHANNEL', copy(e))
  })

  connection.events.onConfigPacket.subscribe((e) => {
    Object.assign(deviceConfig, copy(e))
  })

  connection.events.onModuleConfigPacket.subscribe((e) => {
    Object.assign(deviceConfig, copy(e))
  })

  // /** Subscribe to all events */
  for (let event in connection.events) {
    if (
      [
        'onPendingSettingsChange',
        'onUserPacket',
        'onFromRadio',
        'onNodeInfoPacket',
        'onDeviceStatus',
        'onPositionPacket',
        'onChannelPacket',
        'onMyNodeInfo',
        'onConfigPacket',
        'onModuleConfigPacket',
        'onDeviceMetadataPacket',
        'onMeshPacket',
        'onQueueStatus',
        'onMeshHeartbeat',
        'onTelemetryPacket',
        'onMessagePacket',
        'onDetectionSensorPacket',
        'onTraceRoutePacket',
        'onRoutingPacket',
        'onNeighborInfoPacket',
        'onSimulatorPacket',
        'onStoreForwardPacket' // Not parsed
      ].includes(event)
    ) {
      continue
    }

    connection.events[event].subscribe((e: any) => {
      packets.push({ event, json: copy(e) } as any)
    })
  }

  function updateTimeout() {
    if (connectionStatus.value == 'connected') return

    // console.log('[meshtastic]', 'Updating timeout')
    clearTimeout(connection['timeout'])
    connection['timeout'] = setTimeout(() => {
      if (connectionStatus.value != 'connected') {
        console.log('[meshtastic]', 'No recent data from device, assuming disconnected')
        disconnect(false)
      }
    }, 120000)
  }

  connection.events.onFromRadio.subscribe((e) => {
    updateTimeout()
    lastFromRadio.set(copy(e))
  })

  /** TRACEROUTE_APP */
  connection.events.onTraceRoutePacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id) packets.upsert({ id, trace: data })
    if (e.from && data) {
      nodes.upsert({ num: e.from, trace: data })

      // Update lastHeard of all nodes in the traceroute chain
      for (let num of data.route) {
        // if (num != broadcastId) {
        nodes.upsert({ num, lastHeard: Date.now() / 1000, approximatePosition: getApproximatePosition(num) })
        // }
      }
    }
  })

  /** ROUTING_APP */
  connection.events.onRoutingPacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id) packets.upsert({ id, routing: data })
  })

  /** NEIGHBORINFO_APP */
  connection.events.onNeighborInfoPacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id) packets.upsert({ id, neighbors: data?.neighbors || [] })
    if (data?.neighbors) {
      for (let neighbor of data.neighbors) {
        nodes.upsert({ num: neighbor.nodeId, snr: neighbor.snr, lastHeard: Date.now() / 1000 })
      }
    }
  })

  /** SIMULATOR_APP */
  connection.events.onSimulatorPacket.subscribe((e) => {
    let message = copy(e)
    message.decoded = String.fromCharCode.apply(null, Object.values(message.data))
    if (message.decoded.includes('\x01\x12')) {
      message.show = true
      message.readable = message.decoded.replace(/[^\x20-\x7E]/g, '')
    }
    packets.upsert({ id: message.id, message })
  })

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address, connection instanceof BleConnection ? 'via Bluetooth' : 'via IP')
  if (connection instanceof BleConnection) {
    // console.log(bluetoothDevices[address])
    await connection.connect({ device: bluetoothDevices[address] })
  } else {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    await connection.connect({ address, fetchInterval: 2000, tls: enableTLS.value })
  }
}

export async function send({ message = '', destination, channel, wantAck = true }) {
  if (connectionStatus.value != 'connected' || !message) return
  message = `${messagePrefix.value || ''} ${message} ${messageSuffix.value || ''}`.trim()
  console.log('Sending', { message, destination, channel, wantAck })
  return connection.sendText(message, destination, wantAck, channel)
}

export function traceRoute(destination: number) {
  traceRouteLog[destination] = Date.now()
  if (!pendingTraceroutes.value.includes(destination)) {
    pendingTraceroutes.push(destination)
    if (!queueProcessing) processTraceRoutes()
  }
}

let queueProcessing = false
async function processTraceRoutes() {
  queueProcessing = true
  let destination = pendingTraceroutes.value[0]
  console.log('[meshtastic] Sending Traceroute for', destination)
  packets.push({
    from: myNodeNum.value,
    to: destination,
    rxTime: Date.now() / 1000,
    channel: '',
    decoded: { portnum: 'TRACEROUTE' }
  } as any)
  connection.traceRoute(destination)
  pendingTraceroutes.shift()
  setTimeout(() => {
    pendingTraceroutes.value.length ? processTraceRoutes() : (queueProcessing = false)
  }, globalTracerouteRateLimitSec * 1000)
}

export async function requestPosition(destination: number) {
  console.log('[Meshtastic] Requesting Position for', destination)
  return connection.requestPosition(destination)
}

let deleteInProgress = false
export async function deleteNodes(nodeList: NodeInfo[]) {
  if (deleteInProgress) return
  deleteInProgress = true
  try {
    for (let node of nodeList) {
      await connection.removeNodeByNum(node.num)
      nodes.delete(node)
    }
  } catch (e) {
    console.error(e)
  }
  deleteInProgress = false
}

function getNodeById(num: number) {
  return nodes.value.find((n) => n.num == num) || ({ num } as NodeInfo)
}

export function getApproximatePosition(num: number) {
  let connectedNodes = nodes.value.filter((node) => node.trace?.route?.includes(num))
  if (connectedNodes.length == 0) return null

  let sourceNode = getNodeById(myNodeNum.value)

  let possibleCoordinates = []
  // Check each trace route where this node is in the path
  for (let node of connectedNodes) {
    // For a given trace route, whereabouts is this node located?
    let coord = estimatePositionFromTrace(num, [sourceNode, ...node.trace?.route?.map(getNodeById), node])
    if (coord) possibleCoordinates.push(coord)
  }

  // Average out all possible coordinates
  console.log('[meshtastic] Approximate Location for', num, possibleCoordinates)
  let center = geolib.getCenter(possibleCoordinates)
  return center
}

export function getNodeCoordinates(node: NodeInfo) {
  return {
    latitude: node?.position?.latitudeI / 10000000,
    longitude: node?.position?.longitudeI / 10000000
  }
}

export function estimatePositionFromTrace(num: number, trace: NodeInfo[]) {
  let indexOfTarget = trace.findIndex((n) => n?.num == num)
  let peerCoordinates = []

  let startNode: any, endNode: any

  // console.log(
  //   'Got trace',
  //   trace.map((n) => n?.num)
  // )
  for (let index = indexOfTarget - 1; index >= 0; index--) {
    if (trace[index]?.position?.latitudeI) {
      startNode = { node: trace[index], distance: indexOfTarget - index }
      // for (index; index < indexOfTarget; index++) {
      //   peerCoordinates.push(getNodeCoordinates(trace[index]))
      // }
      break
    }
  }

  // console.log('startNode', startNode?.node?.num, startNode?.distance, getNodeCoordinates(startNode?.node))
  if (!startNode) return false

  for (let index = indexOfTarget + 1; index <= trace.length; index++) {
    if (trace[index]?.position?.latitudeI) {
      endNode = { node: trace[index], distance: index - indexOfTarget }
      // for (index; index > indexOfTarget; index--) {
      //   peerCoordinates.push(getNodeCoordinates(trace[index]))
      // }
      break
    }
  }

  // console.log('endNode', endNode?.node?.num, endNode?.distance, getNodeCoordinates(endNode?.node))
  if (!endNode) return false

  // Weight calculation if there are intermediary nodes without a known position
  Array.from({ length: startNode.distance }, () => peerCoordinates.push(getNodeCoordinates(endNode.node)))
  Array.from({ length: endNode.distance }, () => peerCoordinates.push(getNodeCoordinates(startNode.node)))

  return geolib.getCenter(peerCoordinates)
}

export async function setPosition(position) {
  position.time = Math.round(Date.now() / 1000)
  position.precisionBits = position.precisionBits ?? 32
  console.log('setPosition', position)
  if (connectionStatus.value != 'connected' || !position) return
  await connection.setChannel(
    new Protobuf.Channel.Channel({
      index: 0,
      settings: {
        moduleSettings: {
          positionPrecision: position.precisionBits
        }
      }
    })
  )
  await connection.setConfig(
    new Protobuf.Config.Config({
      payloadVariant: {
        case: 'position',
        value: { fixedPosition: false }
      }
    })
  )

  setTimeout(async () => {
    let data = new Protobuf.Mesh.Position(position)
    await connection.setPosition(data)

    await connection.setConfig(
      new Protobuf.Config.Config({
        payloadVariant: {
          case: 'position',
          value: { fixedPosition: true }
        }
      })
    )
  }, 1000)
}

export async function setTime(seconds?: number) {
  console.log('[meshtastic]', 'Updating Device Time')
  return connection.setPosition(new Protobuf.Mesh.Position({ time: seconds }))
}
