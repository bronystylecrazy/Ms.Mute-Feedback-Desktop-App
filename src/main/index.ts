import os from 'os'
import { join } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import glob from 'glob';
import path from 'path';

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
    t: 360,
    color: '#fff'
  };
  /** Window and monitor windows. */
  const win = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.cjs'),
      enableRemoteModule: true,
      nodeIntegration: true,
      webSecurity: false
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

  /** LOAD PROJECT */
  ipcMain.on('load:project', (event, fileName) => {
    if(fs.existsSync(`${storagePath}/${fileName}/manifest.json`)){
      const json = JSON.parse(fs.readFileSync(`${storagePath}/${fileName}/manifest.json`,'utf-8'))
      const project = `${storagePath}/${fileName}/${json?.entry?.project || "project.json"}`;
      if(fs.existsSync(project)){
        const projectContent = JSON.parse(fs.readFileSync(project,'utf-8'));
        event.reply('load:project',projectContent)
      }
    }else{
      event.reply('load:project',false)
    }
  });

  const storagePath = path.join(app.getPath('userData'), '/storage');
  const textPath = path.join(app.getPath('userData'), '/texts');
  ipcMain.on('view:image', (event) => {
    glob(storagePath + '/**/manifest.json', (err, files) => {
      if(err) return;
      const manifests = [];
      for(var file of files){
        const json = JSON.parse(fs.readFileSync(file,'utf8'));
        const stats = fs.statSync(`${storagePath}/${json.name}/${json?.entry?.png}`);
        var fileSizeInBytes = stats.size;
      // Convert the file size to megabytes (optional)
      var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
        manifests.push({...json, author: json?.author || 'Anonymous' , size: fileSizeInMegabytes, project: `${storagePath}/${json.name}/${json?.entry?.project}`, preview: `${storagePath}/${json.name}/${json?.entry?.png}`});
      }
      broadcast([win, monitor], 'view:image:updated', JSON.stringify(manifests));
    });
  });

  ipcMain.on('view:text', (event) => {
    glob(textPath + '/**/manifest.json', (err, files) => {
      if(err) return;
      const manifests = [];
      for(var file of files){
        const json = JSON.parse(fs.readFileSync(file,'utf8'));
        const stats = fs.statSync(`${textPath}/${json.entry}`);
        var fileSizeInBytes = stats.size;
      // Convert the file size to megabytes (optional)
      var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
        manifests.push({...json, author: json?.author || 'Anonymous' , size: fileSizeInMegabytes, preview: `${textPath}/${json?.entry}`});
      }
      broadcast([win, monitor], 'view:text:updated', JSON.stringify(manifests));
    });
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

  /** SAVE IMAGES */
  ipcMain.on('save:image', (event, { dataURL, outPath}) => {
    try{
      var buffer = Buffer.from(dataURL.substring(`data:image/png;base64,`.length), 'base64');
      fs.writeFileSync(outPath, buffer);
      event.reply('save:image', true);
    }catch(e){
      event.reply('save:image', {
        success: false,
        message: (e as Error).message
      });
    }
  });

  ipcMain.on('save:text', (event) => {
    broadcast([monitor], 'save:text', appState.inputField);
  })

  /** OPEN ANOTHER WINDOW */
  ipcMain.on("monitor:open", async (event, arg) => {
    try{
      monitor = new BrowserWindow({
        webPreferences: {
          contextIsolation: true,
          preload: join(__dirname, '../preload/index.cjs'),
          enableRemoteModule: true,
          nodeIntegration: true,
          webSecurity: false
        },
        ...windowConf
      })
      if (app.isPackaged) {
        monitor.loadFile(join(__dirname, `../renderer/index.html`))
      }else{
        const pkg = await import('../../package.json')
        const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}${route.monitor}`
    
        monitor.loadURL(url)
      }
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
    win.loadFile(join(__dirname, `../renderer/index.html`))
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
