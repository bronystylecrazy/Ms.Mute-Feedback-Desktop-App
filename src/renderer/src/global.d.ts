export { }

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import('fs')
    ipcRenderer: import('electron').IpcRenderer,
    remote: import('electron').Remote,
    app: import('electron').App,
    path: typeof import('path'),
    os: typeof import('os'),
    shell: import('electron').Shell,
    removeLoading: () => void
  }
}
