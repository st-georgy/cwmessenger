const authBtn = document.getElementById('authBtn')

authBtn.addEventListener('click', function (event) {
  let email = document.getElementById('email').value
  let pwd = document.getElementById('pwd').value
  if (email && pwd) event.preventDefault()
  if (!email || !pwd) return;
  fetch('http://localhost:5056/api/User/auth?email=' + email + '&password=' + pwd)
    .then(res => res.json())
      .then(res => {
        let token = res.token
        let user = res.user
        console.log(res.token)
        localStorage.setItem('token', JSON.stringify(token))
        localStorage.setItem('uid', user.id)
        localStorage.setItem('uemail', user.email)
        localStorage.setItem('uname', user.userName)
        localStorage.setItem('date', user.registerDate)
        start()
      })
})
