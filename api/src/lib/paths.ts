import url from 'url'
import { dirname, sep } from 'path'

const __filename = url.fileURLToPath(import.meta.url)

/** When in development, return the base `api` directory */
export const programDirectory = dirname(__filename).replace(`api${sep}src${sep}lib`, `api`)

console.log({ programDirectory })
