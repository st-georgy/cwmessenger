const authBtn = document.getElementById('authBtn')

authBtn.addEventListener('click', function (event) {
  let email = document.getElementById('email').value
  let pwd = document.getElementById('pwd').value
  if (email && pwd) event.preventDefault()
  if (!email || !pwd) return;
  var user = {
    email: email,
    password: pwd
  }
  fetch('http://localhost:5056/api/User/auth', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  }).then(res => res.json())
      .then(res => {
        let token = res.token
        let user = res.user
        localStorage.setItem('token', token)
        localStorage.setItem('uid', user.id)
        localStorage.setItem('uemail', user.email)
        localStorage.setItem('uname', user.userName)
        localStorage.setItem('date', user.registerDate)
        start()
      })
})
