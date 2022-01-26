import os from 'os'
import { join } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'

import './samples/electron-store'
import windowConf from './conf/window'
import broadcast from './util/broadcast'

import fs from 'fs'
import dataURLtoFile from './util/dataUrlToFile'

const isWin7 = os.release().startsWith('6.1')
const isDev = true;

const route = {
  'home': '/#/text',
  'monitor': '/#/monitor',
  'drawmode': '/#/drawmode',
};

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

async function createWindow() {
  let appState = {
    inputField: "Fuck you float",
    t: 360
  };
  /** Window and monitor windows. */
  const win = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.cjs')
    },
    ...windowConf
  })
  let monitor: BrowserWindow;

  // win.loadURL( isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}` )
  
  
  /** SET STATE THROUGH ALL WINDOWS */
  ipcMain.on('setState', (event, arg) => {
    if(arg.data) appState = { ...appState, ...arg.data };
    appState[arg.field] = arg.value;
    broadcast([win,monitor], 'sync', {...appState})
  });

  ipcMain.on('setState:broadcast', (event, arg) => {
    if(arg.data) appState = { ...appState, ...arg.data };
    appState[arg.field] = arg.value;
    console.log(`set: ${arg.field} = ${arg.value}`);
    broadcast([win,monitor], 'sync', {...appState}, event.sender)
  });

  /** SYNC STATE FOR WHEN WINDOWS ARE OPENED */
  ipcMain.on('sync', (event) => {
    event.reply('sync',appState);
  });

  ipcMain.on('sync:canvas', (event,json) => {
    console.log('syncing up with these two!')
    broadcast([monitor],'sync:canvas',json);
  });

  ipcMain.on('mouse:up', (event,json) => {
    broadcast([monitor],'mouse:up',json);
  });

  ipcMain.on('mouse:down', (event,json) => {
    broadcast([monitor],'mouse:down',json);
  });

  ipcMain.on('mouse:move', (event,json) => {
    broadcast([monitor],'mouse:move',json);
  });

  ipcMain.on(':sync', (event) => {
    event.returnValue = appState;
  });

  /** SAVE MESSAGE */
  ipcMain.on('save:message', (event, arg) => {
    broadcast([monitor], 'save:message', arg);
  })
  ipcMain.on('save:message-result', (event, arg) => {
    // console.log(arg)
    dataURLtoFile(arg, 'message.png')
    broadcast([win], 'save:message-result', arg);
  })

  /** OPEN ANOTHER WINDOW */
  ipcMain.on("monitor:open", async (event, arg) => {
    try{
      monitor = new BrowserWindow({
        webPreferences: {
          contextIsolation: true,
          preload: join(__dirname, '../preload/index.cjs')
        },
        ...windowConf
      })
      const pkg = await import('../../package.json')
      const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}${route.monitor}`
  
      monitor.loadURL(url)

      monitor.on('ready-to-show', () => monitor.show());
      event.returnValue = {
        status: "success",
        message: "Monitor window opened"
      }
    }catch(e){
      event.returnValue = {
        status: "error",
        message: "Monitor window failed to open",
        error: e
      }
    }
  })

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    const pkg = await import('../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}${route.home}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }
  
  win.on('ready-to-show', () => {win.show(); win.maximize();})
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
