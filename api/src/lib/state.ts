import EventEmitter from 'eventemitter3'

type ValueCallback<T> = (value: T, state: State<T>) => void
type ActionCallback<T> = (params: { state: State<T>; action?: string; args?: any[] }) => void
type ValueOf<T> = T[keyof T]

interface StateFlags {
  /** Persist state to disk and reload on next startup */
  persist?: boolean | 'api' | 'ui'
  primaryKey?: string
  hideLog?: boolean
  [e: string]: any
}

/**
 * Usage:
 * ```
  State.subscribe(({ state, action, param }) => {
    console.log(state.name, action, param)
  })

  State.defaults = { counter: 20 }

  let counter = new State<number>('counter')
  console.log(counter.value)
  ```
 */
export class State<T = any> {
  static states: Record<string, State> = {}
  static getStateData = () =>
    Object.values(this.states).reduce((obj, current) => {
      obj[current.name] = current.value
      return obj
    }, {})
  static allEvents = new EventEmitter()
  static defaults: Record<string, any> = {}

  name: string
  events = new EventEmitter()
  value: T
  flags: StateFlags = {}

  constructor(name: string, value?: T, flags: StateFlags = {}) {
    if (Object.hasOwn(State.states, name)) {
      // console.info(`State '${name}' is already defined`)
      return State.states[name]
    }
    State.states[name] = this
    this.name = name
    this.value = State.defaults[name] == undefined ? value : State.defaults[name]
    console.log('[State]', name, State.defaults[name] == undefined ? 'init' : 'loaded', this.value)
    this.flags = flags
  }

  notify(action?: string, ...args: any[]) {
    if (action) this.events.emit(action, { state: this, action, ...args })
    this.events.emit('notify', { state: this, action, args })
    State.allEvents.emit('notify', { state: this, action, args })
  }

  subscribe(callback: ValueCallback<T>): () => void {
    callback(this.value, this)
    this.events.on('notify', () => callback(this.value, this))
    return () => this.events.removeListener('notify', callback)
  }

  static subscribe<T = any>(callback: ActionCallback<T>) {
    this.allEvents.on('notify', callback)
    return () => this.allEvents.removeListener('notify', callback)
  }

  on(action: string, callback: (...args: any[]) => void) {
    this.events.on(action, callback)
    return () => this.events.removeListener(action, callback)
  }

  call(action: string, args?: any[]) {
    if (!this[action]) throw `State action ${action} is not defined`
    this[action](...args)
  }

  set(value: T) {
    if (this.value == value) return
    this.value = value
    this.notify('set', value)
  }

  add(value = 0) {
    this.value = ((this.value as number) + value) as any
    this.notify('add', value)
  }

  assign(value: any) {
    Object.assign(this.value, value)
    this.notify('assign', value)
  }

  push(value: ValueOf<T>) {
    ;(this.value as any).push(value)
    this.notify('push', value)
  }

  unshift(value: ValueOf<T>) {
    ;(this.value as any).unshift(value)
    this.notify('unshift', value)
  }

  /** Set or `objectAssign` Record key with value*/
  update(key: any, value: any, objectAssign = true) {
    this.value[key] = objectAssign ? Object.assign(this.value[key] || {}, value) : value
    this.notify('update', key, value)
  }

  /** Search array and run `Object.assign` on first match.  If no match, value will be appended */
  upsert(value: object, primaryKey: string = (this.flags.primaryKey as string) || 'id') {
    let match = (this.value as any[]).find((record: any) => record[primaryKey] == value[primaryKey] && record[primaryKey] != undefined)
    if (match) Object.assign(match, value)
    else (this.value as any[]).push(value)
    this.notify('upsert', value, primaryKey)
  }

  /** ```
   * nodeList.delete({ address }, 'address') // object
   * addressList.delete(address) // non-object
   * ```*/
  delete(value: any | [], primaryKey: string = this.flags.primaryKey || 'id') {
    // If the value being deleted is not an object, do a straight comparison
    if (typeof value !== 'object') {
      this.value = (this.value as []).filter((record: any) => record != value) as T
    }

    // Value is an object, delete by matching `primaryKey`
    else if (Array.isArray(value)) this.value = (this.value as []).filter((record: any) => !value.includes(record[primaryKey])) as T
    else this.value = (this.value as []).filter((record: any) => record[primaryKey] != value[primaryKey]) as T

    this.notify('delete', value, primaryKey)
  }

  /** Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified. */
  shift() {
    let value = (this.value as []).shift()
    this.notify('shift')
    return value
  }
}

State.subscribe(({ state, action, args }) => {
  if (!state.flags.hideLog) console.log('[State]', state.name, action, ...args)
})
