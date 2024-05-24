import './app.css'
import './lib/persistence'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!
})

export default app
