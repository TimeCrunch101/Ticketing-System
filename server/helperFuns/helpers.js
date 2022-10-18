const DBconnection = require('../../config/databaseConfig')

let checkIfUserIsAssigned = (user, primUser, secUser) => {
    return new Promise((resolve, reject) => {
        if (user !== primUser) {
            if (user !== secUser) {
                resolve(true)
            } else {
                reject(false)
            }
        } else {
            reject(false)
        }
    })
}

class ResetToken {
    constructor(user, timeout) {
        this.user = user;
        this.timeout = timeout;
    }
    timeoutTick() {
        setTimeout(() => {
            DBconnection().query('UPDATE dbo_user_accounts SET resetToken = NULL WHERE resource_id = ?', [this.user], (err) => {
                if (err) throw err;
                DBconnection().destroy()
            })
        }, this.timeout);
    }
    
}

module.exports = {
    checkIfUserIsAssigned,
    ResetToken
}