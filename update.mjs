#!/usr/bin/env node
import { spawn } from 'child_process'
import { argv } from 'process';
import { styleText } from 'util';

let runCmd = (commandString) => new Promise((resolve, reject) => {
  let cmd = spawn(commandString, { shell: true, env: process.env })
  let stdoutData = '';

  cmd.stdout.on('data', (data) => {
    stdoutData += data
    process.stdout.write(data)
})
  cmd.stderr.on('data', (data) => process.stderr.write(data))
  cmd.on('error', (e) => reject(e))
  cmd.on('close', (e) => e == 0 ? resolve(stdoutData) : reject(`Return code: ${e}`))
})

let platform = process.platform.replace(/32$/, '').replace('darwin', 'mac')

console.log(styleText(['magenta', 'bold'], 'Updating Project'))
await runCmd('git pull')

console.log(styleText(['magenta', 'bold'], 'Updating UI'))
process.chdir('ui')
await runCmd('npm i')

console.log(styleText(['magenta', 'bold'], 'Updating API'))
process.chdir('../api')
await runCmd('npm i')

console.log(styleText(['magenta', 'bold'], 'Updating Electron'))
process.chdir('../electron')
await runCmd(`npm i`)
process.chdir('..')
