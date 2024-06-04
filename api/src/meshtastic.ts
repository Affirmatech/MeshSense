import { HttpConnection } from '@meshtastic/js'
import { NodeInfo, address, channels, connectionStatus, lastFromRadio, myNodeNum, nodes, packets } from './vars'

let connection: HttpConnection
address.subscribe(connect)

function copy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Connects to a MeshTastic Node using an HTTP connection.
 * @param {string} address - The IP address of the MeshTastic Node to connect to.
 */
async function connect(address: string) {
  console.log('[meshtastic] Calling connect', address)

  // Disconnect from any existing connection
  connection?.disconnect()
  connectionStatus.set('disconnected')
  myNodeNum.set(undefined)

  if (!address) return

  // Create a new HttpConnection with a unique identifier
  connection = new HttpConnection()
  channels.set([])

  connection.events.onDeviceStatus.subscribe((e) => {
    console.log('[meshtastic] Device Status', e)
    if (e == 6) {
      connectionStatus.set('connecting')
    } else if (e == 7) {
      connectionStatus.set('connected')
    }
  })

  /** Channel Info */
  connection.events.onChannelPacket.subscribe((e) => {
    channels.upsert(copy(e))
  })

  /** All packets */
  connection.events.onMeshPacket.subscribe((e) => {
    if (e.from) {
      let updates = {
        num: e.from,
        lastHeard: e.rxTime
      }

      if (e.hopStart) {
        Object.assign(updates, {
          snr: e.rxSnr,
          rssi: e.rxRssi,
          hopsAway: e.hopStart - e.hopLimit
        })
      }

      nodes.upsert(updates)
      packets.push(copy(e))
    }
  })

  /** MyNodeInfo ID on Connection */
  connection.events.onMyNodeInfo.subscribe((e) => {
    myNodeNum.set(e.myNodeNum)
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

  // /** Subscribe to all events */
  // for (let event in connection.events) {
  //   console.log(event)
  //   if ([''])
  //   connection.events[event].subscribe((e: any) => {
  //     packets.push({ event, json: copy(e) })
  //   })
  // }

  connection.events.onFromRadio.subscribe((e) => {
    lastFromRadio.set(copy(e))
  })

  /** TRACEROUTE_APP */

  /** ROUTING_APP */

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address)
  await connection.connect({ address, fetchInterval: 2000 })
}

export async function send({ message = '', destination, channel }) {
  if (connectionStatus.value != 'connected' || !message) return
  console.log('Sending', { message, destination, channel })
  return connection.sendText(message, destination, false, channel)
}
