const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ipc = ipcMain

const createWindow = () => {
  const win = new BrowserWindow({
    width: 650,
    height: 480,
    show: false,
    resizable: false,
    minWidth: 0,
    minHeight: 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'js/preload.js')
    }
  })

  win.removeMenu();
  win.loadFile('index.html')

  win.once('ready-to-show', () => {
    win.show()
    win.webContents.send('connection_check')
  })

  ipc.on('connection_established', () => {
    win.webContents.send('check_logged')
  })

  ipc.on('connection_error', () => {
    setTimeout(() => { win.webContents.send('connection_check') }, 2000)
  })

  ipc.on('logged', () => {
    win.webContents.send('logged_true')
    win.setSize(800, 600)
    win.resizable = true
    win.loadFile('chat.html')
  })
  ipc.on('notlogged', () => {
    win.setSize(400, 600)
    win.loadFile('login.html')
  })

  ipc.on('logRedirect', () => {
    win.setSize(400, 600)
    win.loadFile('login.html')
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
