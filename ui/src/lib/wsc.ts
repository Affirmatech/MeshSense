import { State } from 'api/src/lib/state'
import EventEmitter from 'eventemitter3'

export let events = new EventEmitter()
events.on('error', (e) => console.error(e))

interface MessageObject {
  event: string
  data: any
}

export let defaultEndpoint: string = document.URL.replace('http', 'ws').replace(/\?.*/, '') + 'api'
export let socket: WebSocket | undefined = undefined
export let status: 'Ready' | 'Connecting' | 'Connected' | 'Disconnected' | 'Closed' = 'Ready'

let pendingMessages: MessageObject[] = []
let reconnectTimeout: number

export class WebSocketClient {
  constructor(endpoint?: string, syncStates = true) {
    if (endpoint) this.connect(endpoint)
    if (syncStates) {
      State.subscribe(({ state, action, args }) => {
        if (!state.flags.fromRemote) this.send('state', { name: state.name, action, args })
      })

      function setState(name, action, args) {
        if (!State.states[name]) return
        State.states[name].flags.fromRemote = true
        State.states[name].call(action, args)
        State.states[name].flags.fromRemote = false
      }

      events.on('state', ({ name, action, args }) => setState(name, action, args))
      events.on('initState', (stateData) => {
        State.defaults = stateData
        if (stateData) console.log('[ws] Received current state')
        for (let [name, value] of Object.entries(stateData)) {
          setState(name, 'set', [value])
        }
      })
    }
  }

  connect(endpoint = defaultEndpoint, reconnectDelay = 500) {
    endpoint = endpoint.replace('{{hostname}}', document.location.hostname).replace('http', 'ws').replace('https', 'wss')
    //if (!browser) return // SvelteKit SSR
    try {
      status = 'Connecting'
      console.log(`Connecting to ${endpoint}`)
      socket = new WebSocket(endpoint)

      socket.onclose = (e) => {
        console.log(`Connection closed with ${endpoint}`)
        status = 'Closed'
        reconnectTimeout = setTimeout(() => this.connect(endpoint), reconnectDelay + 500)
      }

      socket.onopen = (e) => {
        console.log(`Connected to ${endpoint}`)
        status = 'Connected'
        events.emit('connect', e)
        for (let message of pendingMessages) this.send(message.event, message.data)
      }
      socket.onerror = (e) => {
        console.error(`Failed websocket connection to ${endpoint}`)
        status = 'Disconnected'
        events.emit('disconnect', e)
      }
      socket.onmessage = ({ data }) => {
        try {
          let messageObject: MessageObject = JSON.parse(data)
          try {
            if (messageObject.event) {
              events.emit(messageObject.event, messageObject.data)
            }
          } catch (e) {
            console.log(`Unable to process event ${messageObject.event}`)
            console.error(e)
          }
        } catch (e) {
          console.error(`Unable to parse message | ${data} | ${e}`)
        }
      }
    } catch (e) {
      console.error(`Unable to connect to ${endpoint} | ${e}`)
    }
  }

  send(event: string, data?: any) {
    let message = JSON.stringify({ event, data })
    try {
      if (socket?.readyState === WebSocket.OPEN) socket.send(message)
      else pendingMessages.push({ event, data })
    } catch (e) {
      console.log(`Unable to send data | ${e}`)
    }
  }
}

// export let wsc = new WebSocketClient()
// wsc.connect()
