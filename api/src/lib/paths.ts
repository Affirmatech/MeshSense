import url from 'url'
import { dirname, sep, join } from 'path'
import envPaths from 'env-paths'
import { existsSync, fstat, mkdirSync } from 'fs'

const userPaths = envPaths('meshsense', { suffix: '' })
const __filename = url.fileURLToPath(import.meta.url)

/** When in development, return the base `api` directory */

export const programDirectory = dirname(__filename).replace(`api${sep}src${sep}lib`, `api`)
export const staticDirectory = join(programDirectory, 'static')
export const dataDirectory = userPaths.data

if (!existsSync(dataDirectory)) {
    mkdirSync(dataDirectory, {recursive: true})
}

console.log({ programDirectory, staticDirectory, dataDirectory })
