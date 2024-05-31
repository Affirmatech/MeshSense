import 'dotenv/config'
import './lib/persistence'
import { app, finalize } from './lib/server'
import { State } from './lib/state'
import './meshtastic'
import { currentTime } from './vars'
import { send } from './meshtastic'
setInterval(() => currentTime.set(Date.now()), 15000)

app.post('/send', (req, res) => {
  let message = req.body.message
  let destination = req.body.destination
  let channel = req.body.channel
  send({ message, destination, channel })
  return res.sendStatus(200)
})

finalize()
