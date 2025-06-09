import { app, Menu, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export function buildMenu() {
  if (process.platform !== 'darwin') return

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      role: 'appMenu',
      submenu: [
        {
          label: 'About',
          role: 'about'
        },
        {
          label: 'Check for Updates...',
          click: () => {
            autoUpdater.checkForUpdates()
          }
        },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            win?.webContents.send('open-settings')
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      role: 'fileMenu',
    },
    {
      role: 'editMenu',
      submenu: [
        {
          label: 'Filter Nodes',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            win?.webContents.send('focus-node-filter')
          }
        },
        { type: 'separator' },
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      role: 'viewMenu',
    },
    {
      role: 'windowMenu',
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Version: ' + app.getVersion(),

        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
