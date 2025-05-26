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
