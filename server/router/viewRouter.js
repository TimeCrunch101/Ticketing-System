const express = require('express');
const viewController = require('../controllers/viewController')
const databaseController = require('../controllers/databaseController')
const settingsController = require('../controllers/settingsController')
const SMScontroller = require('../controllers/SMScontroller');
const loginService = require('../controllers/auth/loginService');
const viewRouter = express.Router();
let initViewRouter = (app) => {
    // VIEW CONTROLLER
    viewRouter.get('/', loginService.checkLoggedIn, loginService.ensureSecondFactor, viewController.homeView);
    viewRouter.get('/addAttachment:commentID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.addAttachmentView)
    viewRouter.get('/Ticket/View/OpenTickets', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.openTicketsView);
    viewRouter.get('/Ticket/View/OpenTickets/Unassigned', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.unassignedTicketsView);
    viewRouter.get('/Ticket/View/OpenTickets/NeedsAttention', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.NeedsAttention);
    viewRouter.get('/Ticket/View/ClosedTickets', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.closedTicketsView)
    viewRouter.get('/Ticket/View/AllTickets', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.allTicketsView)
    viewRouter.get('/Create/Ticket', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.createticketview);
    viewRouter.get('/Create/Account', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.createAccountView);
    viewRouter.get('/Create/User', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.createResourceView);
    viewRouter.get('/Create/Contact', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.createContactView)
    viewRouter.get('/View/Clients', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.accountsView)
    viewRouter.get('/viewTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, loginService.checkIfAdmin, viewController.viewTicket)
    viewRouter.get('/View/Contacts', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.contactsview)
    viewRouter.get('/viewTicket/Add/Comment/ticket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.addCommentView)
    viewRouter.get('/user/accept/ticket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.userAcceptTicket)
    viewRouter.get('/user/mark/ticket/complete:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.markTicketComplete)
    viewRouter.get('/viewTicket/Edit/CommentID:commentID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.editCommentView)
    viewRouter.get('/Ticket/View/Owned', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, viewController.viewOwnedTickets)
    // DATABASE CONTROLLER
    viewRouter.get('/editTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.editTicket)
    viewRouter.get('/changePassword:resource_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, databaseController.renderPasswordUpdatePage)
    // Needs to be admin only routes
    viewRouter.get('/deleteContact:contactID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.deleteContact)
    viewRouter.get('/deleteAccount:account_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, databaseController.deleteAccount)
    viewRouter.get('/sendTestTxtMsg', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, SMScontroller.testSMS_Settings)
    viewRouter.get('/sendTestEmail', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, settingsController.sendTestEmail)
    //Admin only routes
    viewRouter.get('/deleteResource:resource_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, databaseController.deleteResource)
    viewRouter.get('/View/Users', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, viewController.viewUsers)
    viewRouter.get('/View/User-Settings', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, settingsController.settingsView);
    viewRouter.get('/deleteSMTPinfo', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, settingsController.deleteSMTPinfo)
    return app.use('/', viewRouter)
};
module.exports = viewRouter;
module.exports = initViewRouter;