import 'dotenv/config'
import './lib/persistence'
import { app, finalize } from './lib/server'
import { State } from './lib/state'
import './meshtastic'
finalize()
