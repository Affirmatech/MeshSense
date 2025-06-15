import { app, shell, BrowserWindow, ipcMain, utilityProcess } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import { buildMenu } from './menu'

process.on('uncaughtException', (error: any) => {
  // Ignore EIO errors during shutdown, these are expected when child processes are exiting
  if (error?.code === 'EIO') {
    return
  }

  console.error('[electron] Uncaught Exception:', error)
  process.exit(10)  // Using an unambiguous exit code here to indicate a crash
})

let apiProcess: Electron.UtilityProcess
let apiPort: any = 9999

/** asnyc needed for updateCheckLoop to allow electron to launch main window */
async function updateCheckLoop() {
  console.log('[electron] Checking for updates on channel', autoUpdater.channel)
  autoUpdater.checkForUpdates()
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 7.2e6)
  // autoUpdater.checkForUpdatesAndNotify({ title: 'MeshSense', body: 'MeshSense has an update!' })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
  //   mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  // }

  mainWindow.loadURL(`http://localhost:${apiPort}`)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  console.log(`DIRNAME`, __dirname)
  let apiPath = join(__dirname, '../../resources/api/index.cjs').replace('app.asar', 'app.asar.unpacked')
  console.log(`API_PATH`, apiPath)

  apiProcess = utilityProcess.fork(apiPath, process.argv, { stdio: 'pipe' })
  apiProcess.stdout?.on('data', (e) => process.stdout.write(e))
  apiProcess.stderr?.on('data', (e) => process.stderr.write(e))
  apiProcess.on('exit', (code) => {
    console.log('API PROCESS EXITED!', code)
    app.exit(code)
  })

  function createWindowOnServerListening(e: any) {
    if (String(e).startsWith('Server listening')) {
      apiPort = String(e).match(/port: (?<port>\d*)/)?.groups?.['port']
      console.log('CREATING WINDOW')
      apiProcess.stdout?.removeListener('data', createWindowOnServerListening)
      createWindow()
    }
  }

  console.log('[electron] Arguments', process.argv)
  let headless = process.argv.includes('--headless')
  if (!headless) {
    apiProcess.stdout?.on('data', createWindowOnServerListening)
  }
  apiProcess.postMessage({ event: 'version', body: app.getVersion() })
  apiProcess.postMessage({ event: 'headless', body: headless })
  // apiProcess.postMessage({ event: 'updateChannel', body: autoUpdater.channel })

  apiProcess.on('message', (e) => {
    console.log('[api to electron]', e)
    if (e.event == 'installUpdate') {
      autoUpdater.autoRunAppAfterInstall = !headless
      autoUpdater.quitAndInstall()
    } else if (e.event == 'checkUpdate') autoUpdater.checkForUpdates()
    else if (e.event == 'setUpdateChannel') {
      console.log('[electron] Set update channel', e.body)
      autoUpdater.channel = e.body
    }
  })

  // autoUpdater.channel = 'beta'
  autoUpdater.on('checking-for-update', () => {
    apiProcess.postMessage({ event: 'checking-for-update', body: 'Checking for update' })
  })
  autoUpdater.on('update-available', (e) => {
    apiProcess.postMessage({ event: 'update-available', body: e })
  })
  autoUpdater.on('update-not-available', (e) => {
    apiProcess.postMessage({ event: 'update-not-available', body: e })
  })
  autoUpdater.on('error', (e) => {
    apiProcess.postMessage({ event: 'error', body: e })
  })
  autoUpdater.on('download-progress', (e) => {
    apiProcess.postMessage({ event: 'download-progress', body: e })
  })
  autoUpdater.on('update-downloaded', (e) => {
    apiProcess.postMessage({ event: 'update-downloaded', body: e })
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  buildMenu()
  updateCheckLoop()
  // setTimeout(() => {
  //   autoUpdater.quitAndInstall()
  // }, 3000)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  apiProcess?.kill()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
