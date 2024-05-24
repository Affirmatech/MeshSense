import { State } from './lib/state'

export let address = new State('address', '', { persist: 'api' })
export let connectionStatus = new State<'connected' | 'connecting' | 'disconnected'>('connectionStatus', 'disconnected')
export let lastFromRadio = new State('lastFromRadio')
