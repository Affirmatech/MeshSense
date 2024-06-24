import 'dotenv/config'
import './lib/persistence'
import { app, finalize } from './lib/server'
import './meshtastic'
import { currentTime } from './vars'
import { requestPosition, send, traceRoute } from './meshtastic'
setInterval(() => currentTime.set(Date.now()), 15000)

app.post('/send', (req, res) => {
  let message = req.body.message
  let destination = req.body.destination
  let channel = req.body.channel
  send({ message, destination, channel })
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

finalize()
