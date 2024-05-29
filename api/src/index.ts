import 'dotenv/config'
import './lib/persistence'
import { app, finalize } from './lib/server'
import { State } from './lib/state'
import './meshtastic'
import { currentTime } from './vars'
setInterval(() => currentTime.set(Date.now()), 15000)
finalize()
