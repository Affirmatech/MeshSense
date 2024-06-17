import WebSocket, { WebSocketServer } from 'ws'
import { IncomingMessage, Server } from 'http'
import { parse } from 'url'
import EventEmitter from 'eventemitter3'

export interface MessageObject {
  event?: string
  data: any
}

export let events = new EventEmitter()

/**
 * ```
 * const wss = new WebSocketHTTPServer(app.listen(port))
 * ```
 * Raw message handling
 * ```
 * wss.on('connection', (socket) => {
 *    socket.on('message', (data) => {
 *       console.log(`Received: ${data}`)
 *    })
 * })
 * ```
 * Specific event handling
 * ```
 * wss.msg.on('greeting', (data, socket) => {
 *    wss.send('confirmation', "saluations", {to: socket})
 * })
 * ```
 *
 */
export class WebSocketHTTPServer extends WebSocketServer {
  msg = events

  constructor(server: Server, options?: WebSocket.ServerOptions<typeof WebSocket, typeof IncomingMessage>) {
    super({ noServer: true, ...options })
    this.attachHTTPServer(server, options?.path)
    this.on('connection', (socket, request) => {
      let remoteAddress = 'x-forwarded-for' in request.headers ? String(request.headers['x-forwarded-for']).split(',')[0].trim() : request.socket.remoteAddress

      remoteAddress = remoteAddress + ':' + request.socket['_peername']?.port

      console.log('[WSS]', `Connection from ${remoteAddress}`)
      socket['remoteAddress'] = remoteAddress

      socket.on('message', (message) => {
        this.processIncomingMessage(message, socket)
      })
    })
  }

  // TODO: Implement Authentication
  authenticate() {
    return true
  }

  attachHTTPServer(server: Server, path?: string) {
    server.on('upgrade', (request, socket, head) => {
      if (!this.authenticate()) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      const { pathname } = parse(request.url)
      if (!path || pathname == path) {
        this.handleUpgrade(request, socket, head, (socket) => {
          this.emit('connection', socket, request)
        })
      }
    })
  }

  processIncomingMessage(message: any, socket: WebSocket.WebSocket) {
    try {
      let messageObject: MessageObject = JSON.parse(message)
      console.log('[WSS]', socket['remoteAddress'], messageObject?.data)
      try {
        if (messageObject.event) this.msg.emit(messageObject.event, messageObject.data, socket)
      } catch (e) {
        console.log(`Unable to process event ${messageObject.event} | ${e}`)
      }
    } catch (e) {
      console.log(`Unable to parse data | ${e}`)
    }
  }

  /**
   * Options:
   * - `to` Socket to send data to, otherwise send to all
   * - `skip` Socket to skip
   */
  send(event: string, data?: any, options: { to?: WebSocket.WebSocket; skip?: WebSocket.WebSocket } = {}) {
    let message = JSON.stringify({ event, data })

    try {
      if (options.to) options.to.send(message)
      else {
        this.clients.forEach(function each(client) {
          if (client != options.skip && client.readyState === WebSocket.OPEN) client.send(message)
        })
      }
    } catch (e) {
      console.log(`Unable to send data | ${e}`)
    }
  }
}
