const DBConnection = require('../../../config/databaseConfig')
const bcrypt = require('bcryptjs')

let findUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            conn = DBConnection()
            conn.query('SELECT * FROM dbo_user_accounts WHERE email = ?', [ email ], (err, userObj) => {
            conn.destroy()
            if (err) {
                reject(err)
                return res.redirect('/login')
            } else {
                resolve(userObj[0], conn.destroy())
            }
                }
            )

        } catch (err) {
            reject(err)            
        }
    })
}

let findUserById = (resource_id) => {
    return new Promise((resolve, reject) => {
        try {
            let conn = DBConnection()
            conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id = ?', resource_id, (err, rows) => { 
                conn.destroy()
                if (err) {
                    reject(err)
                } else {
                    let user = rows[0];
                    resolve(user, conn.destroy());
                }
            })
        } catch (err) {
            reject(err);
        }
    })
}

let comparePassword = (password, userObj) => {
    return new Promise(async (resolve, reject) => {
        try {
            await bcrypt.compare(password, userObj.password).then((isMatch) => {
                if (isMatch) {
                    resolve(true);
                } else {
                    resolve('That password is incorrect')
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    comparePassword: comparePassword,
}