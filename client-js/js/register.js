const { ipcRenderer } = require('electron')
const ipc = ipcRenderer
const registerBtn = document.getElementById('registerBtn')

registerBtn.addEventListener('click', function (event) {
  event.preventDefault()
  let email = document.getElementById('email').value
  let uname = document.getElementById('uname').value
  let pwd = document.getElementById('pwd').value
  if (!email || !uname || !pwd) return;
  fetch('http://localhost:5056/api/User/register?username=' + uname + '&email=' + email + '&password=' + pwd)
    .then(response => {
      if (response.ok) {
        alert('Вы успешно зарегистрированы! Теперь Вы можете войти.', 'Messenger by st-georgy')
        ipc.send('logRedirect')
      }
    })
    .catch(error => {
      console.log(error)
    })
})
