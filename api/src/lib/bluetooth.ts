import { Bluetooth } from 'webbluetooth'
import { TransportWebBluetooth } from '@meshtastic/transport-web-bluetooth'
import { State } from './state'

export let bluetoothDevices: Record<string, any> = {}
let bluetoothDeviceList = new State('bluetoothDeviceList', [], { primaryKey: 'id', hideLog: true })

let scanning = false
let exitScanning = false
let deviceTargetId = ''
const bluetooth = new Bluetooth({ scanTime: 10 })

/** Loop to show devices consistently */
export async function scanForDevice() {
  if (exitScanning) return

  console.log('[bluetooth] scanning...')

  try {
    let device: any = await bluetooth.requestDevice({
      filters: [{ services: [TransportWebBluetooth.ServiceUuid] }]
    }).catch((e) => console.warn(e))

    if (device) {
      console.log('[bluetooth] Device Detected |', device.id, device.name)
      bluetoothDevices[device.id] = device
      let { id, name } = device
      bluetoothDeviceList.upsert({ id, name })
      if (device.id == deviceTargetId) stopScanning()
    }

    if (!exitScanning) setTimeout(scanForDevice, 500)
  } catch (e) {
    console.error('[bluetooth], Error encountered during scan', e)
  }
}

export async function beginScanning(targetId?: string) {
  deviceTargetId = targetId
  delete bluetoothDevices[targetId]
  if (scanning) {
    console.warn('Already Scanning')
    return
  }
  console.log('[bluetooth] Begin Scanning')

  let adapterAvailable = false

  /** Look for an available bluetooth adapter */
  try {
    adapterAvailable = await bluetooth.getAvailability()
  } catch (e) {
    console.warn('[bluetooth] Unable to detect Bluetooth adapters')
  }

  console.log('[bluetooth] Adapter available:', adapterAvailable)
  if (adapterAvailable) {
    scanning = true
    exitScanning = false
    scanForDevice()
  }
}

export function stopScanning() {
  if (scanning) console.log('[bluetooth] Stop Scanning')
  exitScanning = true
  scanning = false
}
