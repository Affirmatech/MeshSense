import { webcrypto } from 'crypto';

declare global {
  // Let TypeScript know about globalThis.crypto
  // eslint-disable-next-line no-var
  var crypto: typeof webcrypto;
}

globalThis.crypto = webcrypto;

import 'dotenv/config'
import './lib/persistence'
import { app, createRoutes, finalize, server } from './lib/server'
import './meshtastic'
import { connect, disconnect, deleteNodes, requestPosition, send, traceRoute, setPosition, deviceConfig } from './meshtastic'
import { address, apiPort, currentTime, apiHostname, accessKey, autoConnectOnStartup, meshSenseNewsDate, allowRemoteMessaging } from './vars'
import { hostname } from 'os'
import intercept from 'intercept-stdout'
import { createWriteStream } from 'fs'
import { dataDirectory } from './lib/paths'
import { join } from 'path'
import axios from 'axios'
import express from 'express';
import { nodeHistoryMap } from './nodeHistoryStore';
setInterval(() => currentTime.set(Date.now()), 15000)

process.on('uncaughtException', (err, origin) => {
  console.error('[system] Uncaught Exception', err)
})

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

function isAuthorized(req: any) {
  let token = req.headers['authorization']?.split(' ')[1]
  console.log('Remote Address', req.socket.remoteAddress)
  return (
    req.socket.remoteAddress.includes('127.0.0.1') ||
    req.socket.remoteAddress.includes('ffff') ||
    req.socket.remoteAddress.includes('localhost') ||
    req.socket.remoteAddress.includes('::1') ||
    (accessKey.value != '' && accessKey.value == token)
  )
}

createRoutes((app) => {
  app.post('/send', (req, res) => {
    if (!allowRemoteMessaging.value && !isAuthorized(req)) return res.sendStatus(403)
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
    if (!isAuthorized(req)) return res.sendStatus(403)
    let nodes = req.body.nodes
    await deleteNodes(nodes)
    return res.sendStatus(200)
  })

  app.post('/connect', async (req, res) => {
    if (!isAuthorized(req)) return res.sendStatus(403)
    console.log('[express]', '/connect')
    connect(req.body.address || address.value)
    return res.sendStatus(200)
  })

  app.post('/disconnect', async (req, res) => {
    if (!isAuthorized(req)) return res.sendStatus(403)
    console.log('[express]', '/disconnect')
    disconnect()
    return res.sendStatus(200)
  })

  app.get('/consoleLog', async (req, res) => {
    if (req.query.accessKey != accessKey.value && req.hostname.toLowerCase() != 'localhost') return res.sendStatus(403)
    return res.json(consoleLog)
  })

  app.get('/deviceConfig', async (req, res) => {
    if (req.query.accessKey != accessKey.value && req.hostname.toLowerCase() != 'localhost') return res.sendStatus(403)
    return res.json(deviceConfig)
  })

  app.post('/position', async (req, res) => {
    if (!isAuthorized(req)) return res.sendStatus(403)
    console.log('[express]', '/position', req.body)
    setPosition(req.body)
    return res.sendStatus(200)
  })

  app.get('/api/nodes/:nodeNum/history', (req, res) => {
    const nodeNum = Number(req.params.nodeNum); // Ensure this is a number
    if (isNaN(nodeNum)) {
      return res.status(400).json({ error: 'Invalid nodeNum' });
    }
    const history = nodeHistoryMap.get(nodeNum) || [];
    return res.json(history);
  });

  //** Set accessKey via environment variable */
  if (process.env.ACCESS_KEY) {
    accessKey.set(process.env.ACCESS_KEY)
  }

  if (process.env.ADDRESS) {
    address.set(process.env.ADDRESS)
  }

  //** Capture current hostname and port */
  apiHostname.set(hostname())
  apiPort.set((server.address() as any)?.port)

  // ** Check News Update */
  function checkForNews() {
    console.log('[news] Checking for news')
    axios
      .get('https://affirmatech.com/meshSenseNewsDate')
      .then((newDate) => {
        if (meshSenseNewsDate.value < newDate.data) {
          meshSenseNewsDate.set(newDate.data)
        }
      })
      .catch(() => {
        console.log('[news] Unable to get latest news')
      })
  }

  checkForNews()

  if ((process.env.ADDRESS || autoConnectOnStartup.value) && address.value) connect(address.value)
})
