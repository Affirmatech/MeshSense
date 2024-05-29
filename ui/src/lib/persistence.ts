import { State } from 'api/src/lib/state'
import { entries, get, set } from 'idb-keyval'

// State.defaults = (await entries()).reduce((obj: Record<string, any>, [key, value]) => {
//   obj[key as string] = value
//   State.states[key as string]?.set(value)
//   return obj
// }, {})

for (let [key, value] of await entries()) {
  console.log('[Persistence]', key, value)
  State.defaults[key as string] = value
  // let state = State.states[key as string]
  // if (state?.flags?.persist == 'ui') state.set(value)
}

State.subscribe(({ state, action, args }) => {
  if (state.flags.persist == 'ui') {
    set(state.name, state.value)
  }
})
