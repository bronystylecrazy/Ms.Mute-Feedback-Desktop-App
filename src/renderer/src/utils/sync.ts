

export default function sync(field?){
    return field ? window.ipcRenderer.sendSync(':sync')[field] :  window.ipcRenderer.sendSync(':sync');
};