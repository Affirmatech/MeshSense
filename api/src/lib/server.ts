import express, { type Express } from 'express'
import { WebSocketHTTPServer } from './wss'
import { State } from './state'
import https from 'https'
import pem from 'pem'
import { store } from './persistence'

async function createCertificate(options: pem.CertificateCreationOptions, originalKeys?: any): Promise<pem.CertificateCreationResult> {
  return new Promise((success, fail) => {
    if (originalKeys) {
      pem.checkCertificate(originalKeys?.certificate || {}, (error, valid) => {
        if (error || !valid) {
          console.log('Creating updated Self-Signed Certificate')
          pem.createCertificate(options, (error, keys) => {
            if (error) return fail(error)
            success(keys)
          })
        }
        console.log('Current Certificate is valid')
        return success(originalKeys)
      })
    } else {
      console.log('Creating new Self-Signed Certificate')
      pem.createCertificate(options, (error, keys) => {
        if (error) return fail(error)
        success(keys)
      })
    }
  })
}

export let app: Express = express()
let originalKeys = store['keys']

/** Create Self Signed Certificate */
let keys = await createCertificate({ days: 365 * 5, selfSigned: true }, originalKeys)
store['keys'] = keys

/** Begin Listening for connections */
let httpsServer = https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app)
export let server = httpsServer.listen(Number(process.env.PORT) || 5920)
export let wss = new WebSocketHTTPServer(server, { path: '/' })

process.on('unhandledRejection', (reason, promise) => {
  console.error(promise)
})

app.use(express.json({ limit: '500mb' }))

State.subscribe(({ state, action, args }) => {
  wss.send('state', { name: state.name, action, args }, { skip: state.flags.socket })
})

wss.msg.on('state', ({ name, action, args }, socket) => {
  State.states[name].flags.socket = socket
  State.states[name].call(action, args)
  delete State.states[name].flags.socket
})

wss.on('connection', (socket) => {
  wss.send('initState', State.getStateData(), { to: socket })
})

// Enable CORS (https://stackoverflow.com/a/18311469)
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 1)

  // Pass to next layer of middleware
  next()
})

app.get('/state', (_, res) => res.json(State.getStateData()))

export async function createRoutes(callback: (app: Express) => void) {
  await callback(app)
  finalize()
}

/** Enable user interface and error-handling (Should be after routes!) */
export function finalize() {
  app.use((err, _req, res, _next) => {
    console.error('Error', err)
    wss.send('error', String(err))
    return res.status(500).json(String(err))
  })

  console.log('Server listening', server.address())
}

export default { app, server, wss, finalize }
