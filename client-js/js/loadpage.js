let tries = 0
const loadtitle = document.getElementById('loadtitle')
const loadstatus = document.getElementById('loadstatus')
const loadinfo = document.getElementById('loadinfo')

ipc.on('connection_check', () => {
  if (tries == 0) {
    loadinfo.innerHTML = 'Устанавливаем соединение с сервером...'
    loadinfo.style.color = '#584BBA'
  }
  if (tries >= 5) {
    loadinfo.innerHTML = 'Соединение не может быть установлено. Пожалуйста, попробуйте поздее.'
    loadtitle.innerHTML = 'Ошибка'
    loadtitle.style.color = '#BA1A25'
    loadstatus.remove()
    return
  }
  fetch('http://localhost:5056/api/ping')
    .then(response => {
      if (response.ok) {
        loadinfo.style.color = '#584BBA'
        loadinfo.innerHTML = 'Соединение установлено...'
        ipc.send('connection_established')
      }
    })
    .catch(error => {
      console.log(error)
      ipc.send('connection_error')
      tries++
      loadinfo.innerHTML = 'Произошла ошибка... повтор... (' + tries + ')'
      loadinfo.style.color = '#BA1A25'
    })

})

ipc.on('check_logged', () => {
  loadinfo.style.color = '#584BBA'
  loadinfo.innerHTML = 'Авторизация на сервере...'
  let token = localStorage.getItem('token')
  if (token != null && token != '') {
    start()
  } else {
    ipc.send('notlogged')
  }
})

ipc.on('logged_true', () => {
  loadinfo.style.color = '#5BC860'
  loadinfo.innerHTML = 'Соединение установлено.'
})
