import { HttpConnection, BleConnection } from '@meshtastic/js'
import { NodeInfo, address, channels, connectionStatus, lastFromRadio, myNodeMetadata, myNodeNum, nodes, packets } from './vars'
import { beginScanning, bluetoothDevices, stopScanning } from './lib/bluetooth'
import exitHook from 'exit-hook'

let connection: HttpConnection | BleConnection
address.subscribe(connect)

connectionStatus.subscribe((value) => {
  if (value == 'disconnected' || value == 'searching') {
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

exitHook(() => {
  connectionStatus.set('disconnected')
  console.log('Disconnecting from device')
  connection?.disconnect()
})

/**
 * Connects to a MeshTastic Node using an HTTP connection.
 * @param {string} address - The IP address of the MeshTastic Node to connect to.
 */
async function connect(address: string) {
  console.log('[meshtastic] Calling connect', address)

  // Disconnect from any existing connection
  connectionStatus.set('disconnected')
  connection?.disconnect()
  myNodeNum.set(undefined)
  myNodeMetadata.set(undefined)

  if (!address) return

  if (validateMACAddress(address)) {
    connection = new BleConnection()
    connectionStatus.set('searching')

    /** Wait for device to appear if not present */
    beginScanning(address)
    while (!bluetoothDevices[address] && connectionStatus.value == 'searching') {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    /** If device never showed up, bail */
    if (!bluetoothDevices[address]) return
    stopScanning()
  } else {
    connection = new HttpConnection()
  }
  channels.set([])

  connection.events.onDeviceStatus.subscribe((e) => {
    console.log('[meshtastic] Device Status', e)
    if (e == 6) {
      connectionStatus.set('connecting')
    } else if (e == 7) {
      connectionStatus.set('connected')
    } else if (e == 2) {
      if (connectionStatus.value != 'disconnected') {
        console.warn('[Meshtastic] Unexpected disconnect, attempting to reconnect')
        connect(address)
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
    myNodeMetadata.set(e.data)
  })

  /** NODEINFO_APP */
  connection.events.onNodeInfoPacket.subscribe((e) => {
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
        'onRoutingPacket'
      ].includes(event)
    ) {
      continue
    }

    connection.events[event].subscribe((e: any) => {
      packets.push({ event, json: copy(e) } as any)
    })
  }

  connection.events.onFromRadio.subscribe((e) => {
    lastFromRadio.set(copy(e))
  })

  /** TRACEROUTE_APP */
  connection.events.onTraceRoutePacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id) packets.upsert({ id, trace: data })
    if (e.from && data) nodes.upsert({ num: e.from, trace: data })
  })

  /** ROUTING_APP */
  connection.events.onRoutingPacket.subscribe((e) => {
    let { id, data } = copy(e)
    if (id) packets.upsert({ id, routing: data })
  })

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address)
  if (connection instanceof BleConnection) {
    // console.log(bluetoothDevices[address])
    await connection.connect({ device: bluetoothDevices[address] })
  } else await connection.connect({ address, fetchInterval: 2000 })
}

export async function send({ message = '', destination, channel }) {
  if (connectionStatus.value != 'connected' || !message) return
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
