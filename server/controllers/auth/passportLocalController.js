var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy
var DB = require('./DB')

let initPassportLocal = () => {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                await DB.findUserByEmail(email).then(async (userObj) => {
                    if (!userObj) {
                        return done(null, false, req.flash('message', 'Incorrect Username or Password'))
                    }
                    if (userObj) {
                        let match = await DB.comparePassword(password, userObj);
                        if (match === true) {
                            return done(null, userObj, null)
                        } else {
                            return done(null, false, req.flash('message', 'Incorrect Username or Password'))
                        }
                    }
                });
            } catch (err) {
                console.log(err);
                return done(null, false, { message: err })
            }
        }));
};

passport.serializeUser((userObj, done) => {
    return done(null, userObj.resource_id)
});
passport.deserializeUser((resource_id, done) => {
    DB.findUserById(resource_id).then((userObj) => {
        return done(null, userObj)
    }).catch(error => {
        return done(error, null)
    });
});

module.exports = initPassportLocal;