<script context="module" lang="ts">
  let permissionStatus = window.Notification ? Notification.permission : 'Unsupported'

  export function requestPermission() {
    if (!('Notification' in window)) {
      alert('Notification API not supported!')
      return
    }
    Notification.requestPermission((result) => (permissionStatus = result))
  }

  export function sendNotification() {
    try {
      var notification = new Notification('Hi there - non-persistent!')
    } catch (err) {
      alert('Notification API error: ' + err)
    }
  }

  const registerServiceWorker = async () => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register(`${import.meta.env.VITE_PATH || ''}/sw.js`)
        .then(function (registration) {
          console.log('Service worker registration successful:', registration)
        })
        .catch(function (error) {
          console.warn('Service worker registration failed:', error)
        })
    }
  }

  registerServiceWorker()

  async function persistentNotification() {
    navigator.serviceWorker.controller.postMessage({ type: 'buttonClicked' })
  }
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
</svelte:head>

<!-- <div class="w-full grid content-start gap-1">
  <div>Current permission: {permissionStatus}</div>
  <div>Controller: {navigator?.serviceWorker?.controller?.state}</div>
  <button class="btn w-[90%] mx-auto" on:click={requestPermission}>Request Permission</button>
  <button class="btn w-[90%] mx-auto" on:click={sendNotification}>Send Notification</button>
  <button class="btn w-[90%] mx-auto" on:click={persistentNotification}>Send Persistent Notification</button>
</div> -->
