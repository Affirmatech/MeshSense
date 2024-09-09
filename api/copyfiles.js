#!/usr/bin/env node

let copyfiles = require('copyfiles')
const { platform, arch } = require('os')

let serialPath = `node_modules/@serialport/bindings-cpp/prebuilds/${platform()}-*${arch()}/*`
console.log({serialPath})
copyfiles([serialPath, '.'], { up: 3 }, console.error)
copyfiles([serialPath, '../electron/resources/'], { up: 3 }, console.error)
copyfiles(['dist/**/*', '../electron/resources/api'], { up: 1 }, console.error)

