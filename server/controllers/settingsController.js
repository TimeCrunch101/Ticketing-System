require('dotenv').config();
const mail = require('./emailController')
const DBConnection = require('../../config/databaseConfig');
exports.settingsView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_settings', (err1, smtpServerData) => {
        if (err1) throw err1;
        conn.query('SELECT * FROM dbo_twilio_settings', (err2, twilioData) => {
            if (err2) throw err2;
            conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err3, userObj) => {
                if (err3) throw err3;
                var smtp_data = smtpServerData[0]
                var twilio = twilioData[0]
                const {isAdmin, msg, errMsg} = req.flash()
                const myData = {
                    name: smtp_data.name,
                    host: smtp_data.host,
                    port: smtp_data.port,
                    user: smtp_data.user,
                    pass: smtp_data.pass,
                    secure: smtp_data.secure,
                    require_tls: smtp_data.require_tls,
                    account_sid: twilio.account_sid,
                    auth_token: twilio.auth_token,
                    msg_service_sid: twilio.msg_service_sid,
                    isAdmin: isAdmin,
                    msg: msg,
                    errMsg: errMsg,
                }
                return res.render('viewSettings', myData, conn.destroy())
            })
        })
    })
}
exports.update_smtp = (req, res) => {
    conn = DBConnection()
    const {
        host: host,
        port: port,
        user: user,
        pass: pass,
        secure: secure,
        require_tls: require_tls,
    } = req.body
    conn.query('UPDATE dbo_settings SET ? WHERE name = "smtp_settings"', {
         host: host,
         port: port,
         user: user,
         pass: pass,
         secure: secure,
         require_tls: require_tls,
        }, (err) => {
        if (err) throw err;
        return res.redirect('/View/User-Settings', 200, req.flash('msg', 'SMTP Settings Saved'), conn.destroy());
    })
}
exports.update_twilio = (req, res) => {
    conn = DBConnection()
    const { 
        account_sid: account_sid,
        auth_token: auth_token,
        msg_service_sid: msg_service_sid,
     } = req.body
     conn.query("UPDATE dbo_twilio_settings SET ? WHERE id = '1'", {
        account_sid: account_sid,
        auth_token: auth_token,
        msg_service_sid: msg_service_sid,
     }, (err) => {
        if (err) throw err;
        return res.redirect('/View/User-Settings', 200, conn.destroy())
     })
}
exports.deleteSMTPinfo = (req, res) => {
    conn = DBConnection()
    conn.query('UPDATE dbo_settings SET host = null, port = null, user = null, pass = null, secure = 0, require_tls = 0 WHERE name = "smtp_settings"', (err) => {
        if (err) throw err;
        conn.destroy()
        return res.redirect('/View/User-Settings', 307, req.flash('msg', 'SMTP Settings Removed'))
    })
}
exports.sendTestEmail = (req, res) => {
    conn = DBConnection()
    const user = req.session.passport.user
    conn.query('SELECT email FROM dbo_user_accounts WHERE resource_id = ?', [user], async (err, data) =>  {
        if (err) throw err;
        const email = data[0].email
        await mail.sendEmail('Email Test', `<h1>This is a test Email!</h1>`, `${email}`).then(async (mailStatus) => {
            console.log(mailStatus)
            return res.redirect('/View/User-Settings', 307, req.flash('msg', `${mailStatus}`), conn.destroy())
        }).catch( (err) => {
            console.log(err)
            return res.redirect('/View/User-Settings', 307, req.flash('errMsg', `${err}`), conn.destroy())
        })
    })
}