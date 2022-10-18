const DBConnection = require('../../../config/databaseConfig')
const flash = require('connect-flash');

let loginView = (req, res) => {
    const {msg, message} = req.flash()
    return res.render('login', {
        msg: msg,
        message: message,
    })
}

let checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('message', 'Please Login')
        return res.redirect("/login");
    } else {
        next();
    }
};

let checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    } else {
        next();
    }
};

let checkIfAdmin = (req, res, next) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err, data) => {
        if (err) throw err;
        conn.destroy()
        if (data[0].isAdmin === 1) {
            req.flash('isAdmin', 'true')   
        }
        next()
    })
}

let adminOnlyRoute = (req, res, next) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err, data) => {
        if (err) throw err;
        conn.destroy()
        if (data[0].isAdmin === 0) {
            req.flash('message', 'You do not have permission to view this')
            return res.redirect('/', 401, conn.destroy())
        } else {
            req.flash('isAdmin', 'true')
            next()
        }
    })
}

let postLogOut = (req, res) => {
    req.session.destroy(function(err) {
        return res.redirect("/login");
    });
};

function ensureSecondFactor(req, res, next) {
    if (req.session.secondFactor == 'totp') { 
        return next(); 
    } else {
        res.redirect('/mfa')
    }
  }

module.exports = {
    loginView: loginView,
    checkLoggedIn: checkLoggedIn,
    checkLoggedOut: checkLoggedOut,
    postLogOut: postLogOut,
    checkIfAdmin: checkIfAdmin,
    adminOnlyRoute: adminOnlyRoute,
    ensureSecondFactor: ensureSecondFactor,
}