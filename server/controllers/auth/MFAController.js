const fetch = require('cross-fetch');
const DBConnection = require('../../../config/databaseConfig')
var axios = require("axios").default;

let MFAAPI = () => {
    return new Promise(async (resolve, reject) => {
        try {
            var options = {
                method: 'POST',
                url: 'https://easy-authenticator.p.rapidapi.com/newAuthKey',
                headers: {
                  'x-rapidapi-host': 'easy-authenticator.p.rapidapi.com',
                  'x-rapidapi-key': process.env.RAPID_API_KEY
                }
              };
              axios.request(options).then(function (response) {
                  const MFAData = {
                    skey: response.data.secretCode,
                    QRcode: response.data.imageData
                  }
                  resolve(MFAData)
            })
        } catch (e) {
            reject(e);
            }
        })
}


let getMFAPage = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT totp_skey FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err, data) => {
        conn.destroy()
        if (data[0].totp_skey === null) {
            return res.redirect('/mfa_setup')
        }
        res.render('mfa')
    })
}

let mfaSetup = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT email FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], async (err, data) => {
        if (err) throw err;
        let email = data[0].email
        let MFA_Obj = await MFAAPI()
        conn.query('UPDATE dbo_user_accounts SET totp_skey = ? WHERE resource_id = ?', [MFA_Obj.skey, req.session.passport.user], (err) => {
            conn.destroy()
            if (err) throw err;
            res.render('mfa_setup', {
                QRcode: MFA_Obj.QRcode,
                skey: MFA_Obj.skey,
                email: email
            })
        })

    })
}

let mfaSubmit = async (req, res, next) => {
    const {TOTP} = req.body
    conn = DBConnection()
    conn.query('SELECT totp_skey FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err, data) => {
        conn.destroy()                
        if (err) throw err;
        let user_skey = data[0].totp_skey;  
        var options = {
          method: 'POST',
          url: 'https://easy-authenticator.p.rapidapi.com/verify',
          params: {secretCode: `${user_skey}`, token: `${TOTP}`},
          headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'easy-authenticator.p.rapidapi.com',
          }
        };
        axios.request(options).then(function (response) {
            if (response.data.verify === true) {
                req.session.secondFactor = ['totp']
                return res.redirect('/', 200, conn.destroy())
            } else {
                return res.redirect('/logout', 200, conn.destroy())
            }
        }).catch(function (error) {
            console.error(error);
        });
    })
}

let deleteSkey = (req, res) => {
    conn = DBConnection()
    conn.query("UPDATE dbo_user_accounts SET totp_skey = null WHERE resource_id = ?", [req.params.resource_id], (err) => {
        conn.destroy()
        if (err) throw err;
        return res.redirect('/View/Users', 307, req.flash('msg', 'TOTP Key Removed'))
    })
}

module.exports = {
    getMFAPage: getMFAPage,
    mfaSetup: mfaSetup,
    mfaSubmit: mfaSubmit,
    deleteSkey: deleteSkey,
}
