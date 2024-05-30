import { HttpConnection } from '@meshtastic/js'
import { NodeInfo, address, channels, connectionStatus, lastFromRadio, nodes, packets } from './vars'
import { wss } from './lib/server'

let connection: HttpConnection
address.subscribe(connect)

/**
 * Connects to a MeshTastic Node using an HTTP connection.
 * @param {string} address - The IP address of the MeshTastic Node to connect to.
 */
async function connect(address: string) {
  console.log('[meshtastic] Calling connect', address)

  // Disconnect from any existing connection
  connection?.disconnect()
  connectionStatus.set('disconnected')

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

  connection.events.onChannelPacket.subscribe((e) => {
    channels.upsert(e)
  })

  // connection.events.onFromRadio.subscribe((e) => {
  //   lastFromRadio.set(e)
  //   if ('packet' in e) packets.push(e)
  // })

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
      packets.push(e)
    }
  })

  connection.events.onNodeInfoPacket.subscribe((e) => {
    nodes.upsert(e)
  })

  connection.events.onMessagePacket.subscribe((e) => {
    packets.upsert({ id: e.id, data: e.data })
  })

  connection.events.onTelemetryPacket.subscribe((e) => {
    packets.upsert({ id: e.id, telemetry: e.data })
    let deviceMetrics = e.data?.variant?.value
    if (deviceMetrics) nodes.upsert({ num: e.from, deviceMetrics } as NodeInfo)
  })

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address)
  await connection.connect({ address, fetchInterval: 2000 })
}
