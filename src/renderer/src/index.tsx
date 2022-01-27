import React from 'react'
import ReactDOM from 'react-dom'

import './styles/index';

import App from './App'

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
  () => {
    const loader = document.getElementById('app-loading-style');
    if(loader) document.head.removeChild(loader)
  }
)
