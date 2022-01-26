import React from 'react'
import ReactDOM from 'react-dom'

import './styles/index';

import App from './App'

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)
console.log(window.removeLoading)
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
  () => document.head.removeChild(document.getElementById('app-loading-style'))
)
