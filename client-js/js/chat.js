const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря']

const fs = require('fs')
const sendMsgBtn = document.getElementById('sendMsg')
const inputMsg = document.getElementById('inputMessage')
const username = document.getElementById('username')
const email = document.getElementById('email')
const date = document.getElementById('date')
const userAvatar = document.getElementById('userAvatar')
const updAvatarBtn = document.getElementById('updAvatar')
const formAvatar = document.getElementById('formAvatar')

username.innerHTML = localStorage.getItem('uname')
email.innerHTML = `Почта: ${localStorage.getItem('uemail')}`
var rdate = new Date(localStorage.getItem('date'))
date.innerHTML = `Дата регистрации: ${rdate.getDate()} ${months[rdate.getMonth()]} ${rdate.getFullYear()}`
let updAvatarPath = `./img/${localStorage.getItem('uid')}.png`
console.log(updAvatarPath)
if (fs.existsSync(updAvatarPath)) {
  userAvatar.src = updAvatarPath
}

connection.start()

function addMessage(message) {
  let _userSender = message.userSender
  var _msgTimestamp = new Date(message.timeStamp)
  let _msgText = message.text
  let _msgId = message.id

  var msgDiv = document.getElementById('messages')
  let mainMsg = document.createElement('div')
  let msg = document.createElement('div')
  let avatar = document.createElement('img')
  let pMsg = document.createElement('p')
  let pTime = document.createElement('p')
  let pUser = document.createElement('p')
  let msgTexts = document.createElement('div')
  let msgInfo = document.createElement('div')

  mainMsg.className = 'message d-flex mb-2 ps-2 pt-2'
  msg.className = 'd-flex flex-column'
  avatar.className = 'img-circle'
  pMsg.className = 'msgText ps-2'
  pTime.className = 'msgTime ps-2 pt-2'
  pUser.className = 'msgUserName ps-2 pt-1'
  msgTexts.className = 'd-flex flex-column pt-2'
  msgInfo.className = 'd-inline-flex justify-content-start'

  avatar.width = '50'
  avatar.height = '50'
  avatar.src = './img/0.png'
  let updAvatarPath = `./img/${_userSender.id}.png`
  if (fs.existsSync(updAvatarPath)) {
    avatar.src = updAvatarPath
  } else {
    fetch('http://localhost:5056/api/User/avatar/get', {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json',
        'uid': _userSender.id
      }
    }).then(res => res.json())
        .then (res => {
          let avb64 = res.avatarBase64
          if (avb64) {
            fs.writeFile(updAvatarPath, avb64, 'base64', function(){})
            avatar.src = updAvatarPath
          }
        })
  }

  var min = _msgTimestamp.getMinutes() > 9
    ? `${_msgTimestamp.getMinutes()}` : `0${_msgTimestamp.getMinutes()}`

  pMsg.innerHTML = _msgText;
  pTime.innerHTML = `${_msgTimestamp.getHours()}:${min}`
  pUser.innerHTML = _userSender.userName

  msgTexts.setAttribute('id', `lm-${_msgId}`)
  msg.setAttribute('id', _msgId)
  msgInfo.appendChild(pUser)
  msgInfo.appendChild(pTime)
  msgTexts.appendChild(pMsg)

  msg.appendChild(msgInfo)
  msg.appendChild(msgTexts)

  mainMsg.appendChild(avatar)
  mainMsg.appendChild(msg)

  msgDiv.appendChild(mainMsg)
  msgDiv.scrollIntoView({block: "end"})
}

connection.on("RecieveMessage", (message) => {
  addMessage(message)
})

fetch('http://localhost:5056/api/Message/load', {
  method: 'get',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(res => res.json())
    .then(res => {
      for (var i = res.length - 1; i >= 0; i--) {
        var _msg = res[i]
        var msgDiv = document.getElementById('messages')
        var _msgTimestamp = new Date(_msg.timeStamp)
        addMessage(_msg)

        if (i != res.length - 1) {
          var _prevMsg = res[i + 1]
          var _prevDate = new Date(_prevMsg.timeStamp)
          if (_prevDate.getDate() !== _msgTimestamp.getDate()) {
            let hr = document.createElement('div')
            let sp = document.createElement('span')
            hr.className = 'divHR mb-5 mt-3'
            sp.className = 'spanHR'
            sp.innerHTML = `${_msgTimestamp.getDate()} ${months[_msgTimestamp.getMonth()]} ${_msgTimestamp.getFullYear()}г.`
            hr.appendChild(sp)
            msgDiv.appendChild(hr)
          }
        }
        if (i === res.length - 1) {
          let hr = document.createElement('div')
          let sp = document.createElement('span')
          hr.className = 'divHR mb-5 mt-3'
          sp.className = 'spanHR'
          sp.innerHTML = `${_msgTimestamp.getDate()} ${months[_msgTimestamp.getMonth()]} ${_msgTimestamp.getFullYear()}г.`
          hr.appendChild(sp)
          msgDiv.appendChild(hr)
        }
      }
    })

sendMsgBtn.addEventListener('click', () => {
  let msg = inputMsg.value.toString()
  if (msg) {
    let uid = parseInt(localStorage.getItem('uid'))
    inputMsg.value = ""
    connection.invoke('RecieveMessage', msg, uid)
  }
})

updAvatarBtn.addEventListener('click', () => {
  if (formAvatar.files.length == 0) return
  var reader = new FileReader();
  reader.onloadend = function() {
    var base64data = reader.result.replace(/^data:image\/png;base64,/, '')
    fs.writeFile(`./img/${localStorage.getItem('uid')}.png`, base64data, 'base64', function(){})
    var _uid = parseInt(localStorage.getItem('uid'))
    fetch('http://localhost:5056/api/User/avatar/update', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({uid: _uid, avatarBase64: base64data})
    }).then(res => { console.log(res) })
  }
  reader.readAsDataURL(formAvatar.files[0]);
  formAvatar.value = ""
})

inputMsg.addEventListener('keypress', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    sendMsgBtn.click()
  }
})
