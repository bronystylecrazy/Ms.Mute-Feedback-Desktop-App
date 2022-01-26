import { BrowserWindow } from "electron";

export default function broadcast(windows: BrowserWindow[]=[],event="message", value="hi", sender?: Electron.WebContents,){
    for(var window of windows){
        if(window && !window.isDestroyed()){
            if(window.webContents.id === sender?.id) continue;
            window.webContents.send(event, value);
        }
    }
}