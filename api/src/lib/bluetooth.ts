import { Bluetooth, bluetooth } from 'webbluetooth'
import { State } from './state'
import { BluetoothDeviceImpl } from 'webbluetooth/dist/device'

export let bluetoothDevices: Record<string, BluetoothDeviceImpl> = {}
let bluetoothDeviceList = new State('bluetoothDeviceList', [], { primaryKey: 'id', hideLog: true })

let scanning = false

/** Loop to show devices consistently */
export async function beginScanning() {
  if (scanning) throw 'Already Scanning'
  scanning = true

  while (true) {
    let device = await bluetooth.requestDevice({ acceptAllDevices: true }).catch((e) => console.error(e))
    if (!bluetoothDevices[device.id]) {
      console.log('[bluetooth] New Device Found |', device.id, device.name)
    }
    bluetoothDevices[device.id] = device
    let { id, name } = device
    bluetoothDeviceList.upsert({ id, name })
  }
}

beginScanning()

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
