import kfs from 'key-file-storage'
import { State } from './state'
import { programDirectory } from './paths'
import { join } from 'path'

export let store = kfs(join(programDirectory, '.store'))
store.version = 0.1

/** Return key-values as a `Record` object */
export function getAllKeyValues(): Record<string, any> {
  return store['/'].reduce((obj: Record<string, any>, key: string) => {
    obj[key] = store[key]
    return obj
  }, {})
}

State.defaults = store
State.subscribe(({ state, action, args }) => {
  if (state.flags.persist) store(state.name, state.value)
})
