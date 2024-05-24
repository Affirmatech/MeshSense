import { HttpConnection } from '@meshtastic/js'
import { address, channels, connectionStatus, lastFromRadio } from './vars'

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

  connection.events.onFromRadio.subscribe((e) => {
    lastFromRadio.set(e)
  })

  // Attempt to connect to the specified MeshTastic Node
  console.log('[meshtastic] Connecting to Node', address)
  await connection.connect({ address, fetchInterval: 2000 })
}
