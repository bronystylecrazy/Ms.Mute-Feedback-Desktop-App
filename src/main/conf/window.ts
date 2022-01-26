import isDev from 'electron-is-dev'

const windowConf = {
    width: 1920,
    height: 1080,
    autoHideMenuBar: isDev,
    show: false
};

export default windowConf;