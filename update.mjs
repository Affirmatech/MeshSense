#!/usr/bin/env node
import { spawn } from 'child_process'
import { argv } from 'process';
import chalk from 'chalk'; // ✅ Buraya dikkat

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

console.log(chalk.magenta.bold('Updating Project')) // ✅ styleText yerine
await runCmd('git pull')
await runCmd('git submodule update --init --recursive')

console.log(chalk.magenta.bold('Updating UI'))
process.chdir('ui')
await runCmd('npm i')

console.log(chalk.magenta.bold('Updating API'))
process.chdir('../api')
await runCmd('npm i')

console.log(chalk.magenta.bold('Updating Electron'))
process.chdir('../electron')
await runCmd(`npm i`)
process.chdir('..')

if (argv.includes('--webbluetooth')) {
  console.log(chalk.magenta.bold('Updating Subproject webbluetooth'))
  process.chdir('api/webbluetooth')
  await runCmd('npm i')
  await runCmd('npm run build:all')
  process.chdir('../..')
}

console.log(chalk.magenta.bold('Updating Subproject meshtastic-js'))
process.chdir('api/meshtastic-js')
await runCmd('npm i')
await runCmd('npm run build')
process.chdir('../..')

