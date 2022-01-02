const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const sendMsgBtn = document.getElementById('sendMsg')
const inputMsg = document.getElementById('inputMessage')
const fs = require('fs')
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

connection.on("RecieveMessage", (message) => {
  var msgDiv = document.getElementById('messages')
  var _userSender = message.userSender
  var _msgTimestamp = new Date(message.timeStamp)
  var _msgText = message.text
  var _msgId = message.id

  let mainMsg = document.createElement('div')
  mainMsg.className = 'd-flex message ps-2 pt-2'

  let avatar = document.createElement('img')
  avatar.className = 'img-circle mb-2'
  avatar.width = '50'
  avatar.height = '50'
  avatar.src = './img/0.png'
  let updAvatarPath = `./img/${_userSender.id}.png`
  if (fs.existsSync(updAvatarPath)) {
    avatar.src = updAvatarPath
  }

  let msg = document.createElement('div')
  msg.className = 'd-flex flex-column'

  let pMsg = document.createElement('p')
  pMsg.className = 'msgText ps-2'
  pMsg.innerHTML = _msgText;

  let pTime = document.createElement('p')
  pTime.className = 'msgTime ps-2 pt-2'
  var min = _msgTimestamp.getMinutes() > 9 ? `${_msgTimestamp.getMinutes()}` : `0${_msgTimestamp.getMinutes()}`
  pTime.innerHTML = `${_msgTimestamp.getHours()}:${min}`

  let pUser = document.createElement('p')
  pUser.className = 'msgUserName ps-2 pt-1'
  pUser.innerHTML = _userSender.userName

  let msgTexts = document.createElement('div')
  msgTexts.className = 'd-flex flex-column pt-2'
  msgTexts.setAttribute('id', `lm-${_msgId}`)

  let msgInfo = document.createElement('div')
  msgInfo.className = 'd-inline-flex justify-content-start'

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
})

fetch('http://localhost:5056/api/Message/load?startId=1', {
  method: 'get',
  headers: {
    'Authorization': JSON.parse(localStorage.getItem('token'))
  }
})
  .then(res => res.json())
    .then(res => {
      for (var i = res.length - 1; i >= 0; i--) {
        var _msg = res[i]
        var _userSender = _msg.userSender
        var _msgTimestamp = new Date(_msg.timeStamp)
        var _msgText = _msg.text
        var _msgId = _msg.id
        var msgDiv = document.getElementById('messages')

        let mainMsg = document.createElement('div')
        mainMsg.className = 'message d-flex mb-2 ps-2 pt-2'

        let msg = document.createElement('div')
        msg.className = 'd-flex flex-column'

        let avatar = document.createElement('img')
        avatar.className = 'img-circle'
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
              'Authorization': JSON.parse(localStorage.getItem('token')),
              'uid': _userSender.id
            },
          })
            .then(res => res.json())
              .then (res => {
                let avb64 = res.avatarBase64
                if (avb64) {
                  fs.writeFile(updAvatarPath, avb64, 'base64', function(){})
                  avatar.src = updAvatarPath
                }
              })
        }

        let pMsg = document.createElement('p')
        pMsg.className = 'msgText ps-2'
        pMsg.innerHTML = _msgText;

        let pTime = document.createElement('p')
        pTime.className = 'msgTime ps-2 pt-2'
        var min = _msgTimestamp.getMinutes() > 9 ? `${_msgTimestamp.getMinutes()}` : `0${_msgTimestamp.getMinutes()}`
        pTime.innerHTML = `${_msgTimestamp.getHours()}:${min}`

        let pUser = document.createElement('p')
        pUser.className = 'msgUserName ps-2 pt-1'
        pUser.innerHTML = _userSender.userName

        let msgTexts = document.createElement('div')
        msgTexts.className = 'd-flex flex-column pt-2'
        msgTexts.setAttribute('id', `lm-${_msgId}`)

        let msgInfo = document.createElement('div')
        msgInfo.className = 'd-inline-flex justify-content-start'

        msg.setAttribute('id', _msgId)
        msgInfo.appendChild(pUser)
        msgInfo.appendChild(pTime)
        msgTexts.appendChild(pMsg)

        msg.appendChild(msgInfo)
        msg.appendChild(msgTexts)

        mainMsg.appendChild(avatar)
        mainMsg.appendChild(msg)

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

        msgDiv.appendChild(mainMsg)
        msgDiv.scrollIntoView({block: "end"})
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
        'Authorization': JSON.parse(localStorage.getItem('token')),
        'uid': _uid
      },
      body: JSON.stringify({avatarBase64: base64data})
    })
      .then(res => {
        console.log(res)
      })
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
