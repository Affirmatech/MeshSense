<script lang="ts">
  import axios from 'axios'
  import { events } from './wsc'
  import { hasAccess } from './util'

  export let status = ''
  export let progress = 0

  let exampleMessages = [
    {
      event: 'checking-for-update',
      data: 'Checking for update'
    },
    {
      event: 'update-available',
      data: {
        version: '0.3.14',
        files: [
          {
            url: 'n3fjp-universal-x86_64.AppImage',
            sha512: 'qBI3W7iHTU1g1cO09+quqzp5hDqVzCz3CXxXesfanKB7JdHnduUv9dv7dc3D89m+VTUQ0kLlM54/BU83en1K5g==',
            size: 110380053,
            blockMapSize: 115753
          }
        ],
        path: 'n3fjp-universal-x86_64.AppImage',
        sha512: 'qBI3W7iHTU1g1cO09+quqzp5hDqVzCz3CXxXesfanKB7JdHnduUv9dv7dc3D89m+VTUQ0kLlM54/BU83en1K5g==',
        releaseDate: '2023-10-18T19:28:02.980Z'
      }
    },
    {
      event: 'download-progress',
      data: {
        total: 110380053,
        delta: 60436707,
        transferred: 60436707,
        percent: 54.75328680989128,
        bytesPerSecond: 60195923
      }
    },
    {
      event: 'download-progress',
      data: {
        total: 110380053,
        delta: 49943346,
        transferred: 110380053,
        percent: 100,
        bytesPerSecond: 67059570
      }
    },
    {
      event: 'update-downloaded',
      data: {
        version: '0.3.14',
        files: [
          {
            url: 'n3fjp-universal-x86_64.AppImage',
            sha512: 'qBI3W7iHTU1g1cO09+quqzp5hDqVzCz3CXxXesfanKB7JdHnduUv9dv7dc3D89m+VTUQ0kLlM54/BU83en1K5g==',
            size: 110380053,
            blockMapSize: 115753
          }
        ],
        path: 'n3fjp-universal-x86_64.AppImage',
        sha512: 'qBI3W7iHTU1g1cO09+quqzp5hDqVzCz3CXxXesfanKB7JdHnduUv9dv7dc3D89m+VTUQ0kLlM54/BU83en1K5g==',
        releaseDate: '2023-10-18T19:28:02.980Z',
        downloadedFile: '/home/chris/.cache/n3fjp-universal-updater/pending/n3fjp-universal-x86_64.AppImage'
      }
    }
  ]

  function runExample() {
    let msg = exampleMessages.shift()
    if (msg) {
      console.log(msg)
      events.emit(msg.event, msg.data)
      setTimeout(runExample, 2000)
    }
  }

  events.on('update-available', (e) => {
    status = 'New update!'
  })

  events.on('download-progress', (e) => {
    status = 'Downloading Update'
    progress = e.percent
  })

  events.on('update-downloaded', (e) => {
    status = 'Update Ready'
  })

  // $: document.title = `MeshSense ${$version ?? 'Development'}`

  function installUpdate() {
    axios.get('/installUpdate')
  }

  // runExample()
</script>

{#if status && $hasAccess}
  <div class="fixed top-12 right-5 p-2 w-40 bg-slate-900 rounded-xl z-[99]">
    <div class="text-xs grid items-center h-10">
      {#if status == 'Update Ready'}
        <button class="btn btn-xs btn-primary h-full" on:click={installUpdate}>Install MeshSense Update</button>
      {:else}
        <div class="flex flex-col">
          {status}
          {#if progress > 0}
            <progress class="progress" value={progress} max="100" />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
