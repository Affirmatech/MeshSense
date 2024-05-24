import { State } from 'api/src/lib/state'
import { entries, set } from 'idb-keyval'

State.defaults = (await entries()).reduce((obj: Record<string, any>, [key, value]) => {
  obj[key as string] = value
  State.states[key as string]?.set(value)
  return obj
}, {})

State.subscribe(({ state, action, args }) => {
  if (state.flags.persist) {
    set(state.name, state.value)
  }
})
