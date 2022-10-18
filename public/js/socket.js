const socket = io("https://socket.cincitechlabs.com/")


socket.on('server-msg', data => {
    document.getElementById('inner_toast').innerHTML = `${data}`
    const htmlToast = document.getElementById('toast')
    const toast = new bootstrap.Toast(htmlToast)
    toast.show()
})