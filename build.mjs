#!/usr/bin/env node
import { spawn } from 'child_process'
//import { styleText } from 'util';
import './api/node_modules/dotenv/config.js'

let runCmd = (commandString) => new Promise((resolve, reject) => {
  let cmd = spawn(commandString, { shell: true, env: process.env })
  cmd.stdout.on('data', (data) => process.stdout.write(data))
  cmd.stderr.on('data', (data) => process.stderr.write(data))
  cmd.on('error', (e) => reject(e))
  cmd.on('close', (e) => e == 0 ? resolve() : reject(`Return code: ${e}`))
})

let platform = process.platform.replace(/32$/, '').replace('darwin', 'mac')

console.log(styleText(['magenta', 'bold'], 'Building UI'))
process.chdir('ui')
await runCmd('npm run build')

console.log(styleText(['magenta', 'bold'], 'Building API'))
process.chdir('../api')
await runCmd('npm run build')

console.log(styleText(['magenta', 'bold'], 'Building Electron'))
process.chdir('../electron')
await runCmd(`npm run build:${platform} --c.extraMetadata.version=2.0.0`)