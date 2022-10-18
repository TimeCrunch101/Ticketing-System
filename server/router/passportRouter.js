const express = require("express");
const passport = require("passport");
const loginService = require("../controllers/auth/loginService");
const initPassportLocal = require("../controllers/auth/passportLocalController");
const MFAController = require('../controllers/auth/MFAController')
const passwordResetController = require('../controllers/passwordResetController')

initPassportLocal()

const passportRouter = express.Router();

let initAuthRouter = (app) => {
  passportRouter.get("/login", loginService.checkLoggedOut, loginService.loginView);
  passportRouter.get('/logout', loginService.checkLoggedIn, loginService.postLogOut);
  passportRouter.get('/mfa', loginService.checkLoggedIn, MFAController.getMFAPage)
  passportRouter.get('/mfa_setup', loginService.checkLoggedIn, MFAController.mfaSetup)
  passportRouter.post('/mfa/token/submit', loginService.checkLoggedIn, MFAController.mfaSubmit)
  passportRouter.post('/mfa/submit', loginService.checkIfAdmin, MFAController.mfaSubmit)  
  passportRouter.get('/delete/totp/key:resource_id', loginService.checkLoggedIn, loginService.adminOnlyRoute, MFAController.deleteSkey)
  passportRouter.get('/forgotPassword', loginService.checkLoggedOut, passwordResetController.getPasswordReset)
  passportRouter.post('/passwordReset/emailacct', loginService.checkLoggedOut, passwordResetController.sendPasswordResetLink)
  passportRouter.get('/password/reset/verify:resetToken', loginService.checkLoggedOut, passwordResetController.getPasswordResetView)
  passportRouter.post('/Password/Reset/verify:resetToken', loginService.checkLoggedOut, passwordResetController.resetPassword)
  passportRouter.post("/login", loginService.checkLoggedOut, passport.authenticate("local", {
    successRedirect: "/", 
    failureRedirect: "/login",
  }));
  return app.use("/", passportRouter);
};

module.exports = passportRouter;
module.exports = initAuthRouter;
