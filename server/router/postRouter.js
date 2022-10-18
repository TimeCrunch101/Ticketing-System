const express = require('express');
const databaseController = require('../controllers/databaseController');
const settingsController = require('../controllers/settingsController');
const webHookController = require('../controllers/webHookController');
const loginService = require('../controllers/auth/loginService');

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' +extension)
    }
  })
const upload = multer({ storage: storage })

const postRouter = express.Router();
let initPostRouter = (app) => {
    // WEBHOOK CONTROLLER
    postRouter.post('/webhook/sms/api/endpoint', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, webHookController.gotTXTmsg);
    // DATABASE CONTROLLER
    postRouter.post('/changePassword:resource_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.updateUserPassword);
    postRouter.post('/createTicket', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.createTicket);
    postRouter.post('/updateTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.updateTicket);
    postRouter.post('/Account/Create', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.accountCreate);
    postRouter.post('/Add/Comment:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.addComment);
    postRouter.post('/Create/New/Contact', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.createContact);
    postRouter.post('/Search/Tickets', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.searchTickets);
    postRouter.post('/Edit/Comment:commentID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.editCommentPost);
    postRouter.post('/addAttachment:commentID', upload.single('file'), loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.addCommentAttachment);
    
    // SETTINGS CONTROLLER
    // NEEDS TO BE ADMIN ONLY
    postRouter.post('/settings/update/smtp', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, settingsController.update_smtp);
    postRouter.post('/update/twilioAPI', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, settingsController.update_twilio);
    //Admin Only
    postRouter.post('/User/Create', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, databaseController.resourceCreate);
    return app.use('/', postRouter);
};
module.exports = postRouter;
module.exports = initPostRouter;