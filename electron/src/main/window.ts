import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { keyFileStorage } from 'key-file-storage'

const userDataPath = app.getPath('userData')
const windowStateKfs = keyFileStorage(join(userDataPath, 'window-state'))

export interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized?: boolean
}

export function getWindowState(): WindowState {
  try {
    const state = windowStateKfs['window-state']
    return state || { width: 1300, height: 900 }
  } catch {
    return { width: 1300, height: 900 }
  }
}

export function saveWindowState(window: BrowserWindow): void {
  try {
    const bounds = window.getBounds()
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized()
    }
    windowStateKfs['window-state'] = state
  } catch (error) {
    console.error('[electron] Failed to save window state:', error)
  }
}
