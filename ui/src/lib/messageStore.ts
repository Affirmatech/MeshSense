import { writable } from 'svelte/store'
import type { MeshPacket } from 'api/src/vars'

export const messages = writable<MeshPacket[]>([])