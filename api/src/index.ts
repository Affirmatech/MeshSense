import 'dotenv/config'
import './lib/persistence'
import { app, createRoutes, finalize, server } from './lib/server'
import './meshtastic'
import { connect, disconnect, deleteNodes, requestPosition, send, traceRoute } from './meshtastic'
import { address, apiPort, currentTime, apiHostname, accessKey, autoConnectOnStartup } from './vars'
import { hostname } from 'os'
import intercept from 'intercept-stdout'
import { createWriteStream } from 'fs'
import { dataDirectory } from './lib/paths'
import { join } from 'path'
setInterval(() => currentTime.set(Date.now()), 15000)

let consoleLog = []
let logSize = 1000

let lastLogStream = createWriteStream(join(dataDirectory, 'lastLog.txt'))
intercept(
  (text) => {
    lastLogStream.write(text)
    consoleLog.push(text)
    while (consoleLog.length >= logSize) consoleLog.shift()
  },
  (err) => {
    if (err.includes('Possible EventTarget memory leak detected')) return
    consoleLog.push(err)
    while (consoleLog.length >= logSize) consoleLog.shift()
  }
)

createRoutes((app) => {
  app.post('/send', (req, res) => {
    let message = req.body.message
    let destination = req.body.destination
    let channel = req.body.channel
    let wantAck = req.body.wantAck
    send({ message, destination, channel, wantAck })
    return res.sendStatus(200)
  })

  app.post('/traceRoute', async (req, res) => {
    let destination = req.body.destination
    await traceRoute(destination)
    return res.sendStatus(200)
  })

  app.post('/requestPosition', async (req, res) => {
    let destination = req.body.destination
    await requestPosition(destination)
    return res.sendStatus(200)
  })

  app.post('/deleteNodes', async (req, res) => {
    let nodes = req.body.nodes
    await deleteNodes(nodes)
  })

  app.post('/connect', async (req, res) => {
    console.log('[express]', '/connect')
    connect(req.body.address || address.value)
    return res.sendStatus(200)
  })

  app.post('/disconnect', async (req, res) => {
    console.log('[express]', '/disconnect')
    disconnect()
    return res.sendStatus(200)
  })

  app.get('/consoleLog', async (req, res) => {
    if (req.query.accessKey != accessKey.value && req.hostname.toLowerCase() != 'localhost') return res.sendStatus(403)
    return res.json(consoleLog)
  })

  apiHostname.set(hostname())
  apiPort.set((server.address() as any)?.port)

  if (autoConnectOnStartup.value && address.value) connect(address.value)
})
