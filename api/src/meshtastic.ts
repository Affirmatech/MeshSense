/**
 * https://js.meshtastic.org/
 */

import { HttpConnection, BleConnection } from '../meshtastic'
import { NodeInfo, address, channels, connectionStatus, enableTLS, lastFromRadio, messagePrefix, messageSuffix, myNodeMetadata, myNodeNum, nodes, packetLimit, packets } from './vars'
import { beginScanning, bluetoothDevices, stopScanning } from './lib/bluetooth'
import exitHook from 'exit-hook'

let connection: HttpConnection | BleConnection
let connectionIntended = false
// address.subscribe(connect)

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
  return pattern.test(macAddress)
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
  reset()
}

export function reset() {
  myNodeNum.set(undefined)
  myNodeMetadata.set(undefined)
  deleteInProgress = false
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
      if (updates.hopsAway && (!originalNodeRecord.trace || originalNodeRecord?.hopsAway != updates.hopsAway)) {
        traceRoute(updates.num)
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
    packets.upsert({ id: e.id, message: copy(e) })
  })

  /** TELEMETRY_APP */
  connection.events.onTelemetryPacket.subscribe((e) => {
    let { id, data } = copy(e)
    packets.upsert({ id, deviceMetrics: data.deviceMetrics })
    if (data.deviceMetrics) nodes.upsert({ num: e.from, deviceMetrics: data.deviceMetrics })
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

  // /** Subscribe to all events */
  for (let event in connection.events) {
    if (
      [
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
    }, 30000)
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
        nodes.upsert({ num, lastHeard: Date.now() / 1000 })
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

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address)
  if (connection instanceof BleConnection) {
    // console.log(bluetoothDevices[address])
    await connection.connect({ device: bluetoothDevices[address] })
  } else {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    await connection.connect({ address, fetchInterval: 2000, tls: enableTLS.value })
  }
}

export async function send({ message = '', destination, channel }) {
  if (connectionStatus.value != 'connected' || !message) return
  message = `${messagePrefix.value || ''} ${message} ${messageSuffix.value || ''}`.trim()
  console.log('Sending', { message, destination, channel })
  return connection.sendText(message, destination, false, channel)
}

export async function traceRoute(destination: number) {
  console.log('[Meshtastic] Requesting Traceroute for', destination)
  packets.push({
    from: myNodeNum.value,
    to: destination,
    rxTime: Date.now() / 1000,
    channel: '',
    decoded: { portnum: 'TRACEROUTE' }
  } as any)
  return connection.traceRoute(destination)
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
