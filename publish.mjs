#!/usr/bin/env node
import { spawn } from 'child_process'
import { styleText } from 'util';
import './api/node_modules/dotenv/config.js'
import config from './electron/package.json' with { type: "json" }

let runCmd = (commandString) => new Promise((resolve, reject) => {
  let cmd = spawn(commandString, { shell: true, env: process.env })
  cmd.stdout.on('data', (data) => process.stdout.write(data))
  cmd.stderr.on('data', (data) => process.stderr.write(data))
  cmd.on('error', (e) => reject(e))
  cmd.on('close', (e) => e == 0 ? resolve() : reject(`Return code: ${e}`))
})

if (!process.env.DEPLOY_LOCATION) {
  console.error('Please set environment variable DEPLOY_LOCATION.  Will check .env!')
  console.error('Example: DEPLOY_LOCATION = "app@cloud:/path/download/meshsense/"')
  process.exit(-1)
}
await runCmd(`rsync -av --include '${config.name}-arm64*' --exclude '*-unpacked' --exclude 'mac*' --exclude '*-mac.zip' --exclude '*-mac.zip.blockmap' --exclude '*arm64.dmg*' electron/dist/ ${process.env.DEPLOY_LOCATION}`)