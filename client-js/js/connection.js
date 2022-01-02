const { ipcRenderer } = require('electron')
const ipc = ipcRenderer

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5056/chathub", {
    accessTokenFactory: () => JSON.parse(localStorage.getItem('token'))
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();


async function start() {
  try {
    await connection.start()
    ipc.send('logged')
  } catch (err) {
    console.log(err)
    ipc.send('notlogged')
  }
}
