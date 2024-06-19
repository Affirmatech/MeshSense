import { Bluetooth } from 'webbluetooth'
import { State } from './state'
import { BluetoothDeviceImpl } from 'webbluetooth/dist/device'
import { Constants } from '@meshtastic/js'

export let bluetoothDevices: Record<string, BluetoothDeviceImpl> = {}
let bluetoothDeviceList = new State('bluetoothDeviceList', [], { primaryKey: 'id', hideLog: true })

let scanning = false
let exitScanning = false
const bluetooth = new Bluetooth({ scanTime: 10 })

/** Loop to show devices consistently */
export async function scanForDevice() {
  if (exitScanning) return

  // console.log('scanning...')
  // let device = await bluetooth.requestDevice({ acceptAllDevices: true }).catch((e) => console.error(e))
  // let device = await bluetooth.requestDevice({ filters: [{ services: [Constants.ServiceUuid] }] }).catch((e) => console.error(e))
  // let device = await bluetooth.requestDevice({ filters: [{ serviceData: [] }] }).catch((e) => console.error(e))
  let device = await bluetooth
    .requestDevice({
      filters: [{ services: ['00001801-0000-1000-8000-00805f9b34fb'] }, { services: ['6ba1b218-15a8-461f-9fa8-5dcae273eafd'] }, { services: ['0000180f-0000-1000-8000-00805f9b34fb'] }]
    })
    .catch((e) => console.error(e))

  if (device) {
    const decoder = new TextDecoder()
    console.log('[bluetooth] Device Detected |', device.id, device.name)
    bluetoothDevices[device.id] = device
    let { id, name } = device
    bluetoothDeviceList.upsert({ id, name })
  }

  if (!exitScanning) setTimeout(scanForDevice, 100)
}

export function beginScanning() {
  if (scanning) throw 'Already Scanning'
  exitScanning = false
  scanning = true
  scanForDevice()
}

export function stopScanning() {
  exitScanning = true
  scanning = false
}

// console.log('BLUETOOTH', await bluetooth.getDevices())

// console.log('BLUETOOTH', await bluetooth.requestDevice({ filters: [{ services: '' }] }))

// console.log(
//   'BLUETOOTH aAD',
//   await bluetooth.requestDevice({
//     acceptAllDevices: true
//     // exclusionFilters: [{ services: [] }]
//   })
// )

/** Custom deviceFound logic. Seems to stop at first device **/
// let b = new Bluetooth({
//   scanTime: 60,
//   deviceFound(device, selectFn) {
//     console.log('DEVICEFOUND', device.id, device.name)
//     return true
//   },
//   allowAllDevices: true
// })
// console.log('REQUESTDEVICE', await b.requestDevice({ acceptAllDevices: true }))
