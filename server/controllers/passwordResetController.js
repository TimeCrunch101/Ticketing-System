const mail = require('./emailController')
const DBConnection = require('../../config/databaseConfig')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const url = require('url')
const util = require('../helperFuns/helpers')
exports.getPasswordReset = (req, res) => {
    res.render('_forgotPassword')
}
exports.sendPasswordResetLink = (req, res) => {
    conn = DBConnection()
    const {email} =req.body
    conn.query('SELECT email FROM dbo_user_accounts WHERE email = ?', [email], (err, data) => {
        if (err) throw err; 
        res.render('_forgotPassword', {msg: 'If your email exists, then you will get a password reset link.'})
        if (typeof(data[0]) == 'undefined') {
            return console.log('no email found')
        } else {
            let randomNumber = Math.floor((Math.random() * 100000) + 1)
            let concat = randomNumber + data[0].email
            const resetToken = crypto.createHash('sha256').update(concat).digest('hex')
            conn.query('SELECT resource_id FROM dbo_user_accounts WHERE email = ?', [email], (err, resourceID) => {
                if (err) throw err;
                const userID = resourceID[0].resource_id
                conn.query("UPDATE dbo_user_accounts SET resetToken = ? WHERE resource_id = ?", [resetToken, userID], async (err) => {
                    if (err) throw err;
                    await mail.sendEmail('Password Reset Link', `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Bootstrap demo</title>
                    <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx"
                    crossorigin="anonymous"
                    />
                    </head>
                    <body>
                    <div id="resetCard" class="card" style="width: 18rem">
                    <div class="card-body">
                    <h5 class="card-title">Password Reset</h5>
                    <p class="card-text">
                    You received this email because you initiated a password reset for your
                    Rectifyd Account. If you did not initiate this, you can just ignore.
                    This link will expire in 10 minutes.
                    </p>
                    <a href="https://app.cincitechlabs.com/password/reset/verify${resetToken}" class="btn btn-primary"
                    >Click to reset password</a
                    >
                    </div>
                    </div>
                    <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa"
                    crossorigin="anonymous"
                    ></script>
                    </body>
                    <style>
                    html body {
                    background-color: hsl(221, 40%, 31%);
                    }
                    #resetCard {     
                    margin: 5em auto
                    }
                    </style>
                    </html>
                    `, email).then(async (mailStatus) => {
                        console.log(mailStatus)
                        new util.ResetToken(userID, 300000).timeoutTick()
                        conn.destroy()
                    }).catch((err) => {
                        conn.query("UPDATE dbo_user_accounts SET resetToken = NULL WHERE resource_id = ?", [userID], (err) => {
                            if (err) throw err;
                            conn.destroy()
                        })
                    })
                })
            })
        }
    })

}
exports.getPasswordResetView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_user_accounts WHERE resetToken = ?', [req.params.resetToken], (err, data) => {
        if (err) throw err;
        const reqURL = req.url
        const token = reqURL.substr(22)
        if (data.length === 0) {
            req.flash('msg', 'That password reset link has expired')
            res.redirect('/login', 401, conn.destroy())
        } else {
            res.render('_newPassword', {passResetToken: token}, conn.destroy())
        }
    })
}
exports.resetPassword = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_user_accounts WHERE resetToken = ?', [req.params.resetToken], (err, data) => {
        if (err) throw err;
        const verify = data[0]
        if (typeof(verify) == 'undefined') {
            return res.redirect('/', 200, conn.destroy())
        } else {
            const userID = data[0].resource_id
            const { password } = req.body
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            conn.query('UPDATE dbo_user_accounts SET password = ? WHERE resource_id = ?', [hash, userID], (err) => {
                if (err) throw err;
                conn.query('UPDATE dbo_user_accounts SET resetToken = NULL WHERE resource_id = ?', [userID], (err) => {
                    if (err) throw err;
                    return res.redirect('/', 200, conn.destroy())
                })
            })
        }
    })
}