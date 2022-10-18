const express = require('express');
const loginService = require('../controllers/auth/loginService');
const fetchController = require('../controllers/fetchController')
const fetchRouter = express.Router();
let initFetchRouter = (app) => {
    fetchRouter.get('/delete/comment:commentID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.deleteComment);
    fetchRouter.get('/fetch/viewTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.viewTicketFetch)
    fetchRouter.get('/fetch/editTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.fetchEditTicket)
    fetchRouter.get('/fetch/viewComments:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.fetchComments)
    fetchRouter.get('/fetch/sub_issue_type:issue_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.fetchSubIssueType)
    fetchRouter.get('/fetch/comment:commentID', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.checkIfAdmin, fetchController.fetchComment)
    //Admin Only Fetch
    // fetchRouter.get('deleteTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, fetchController.deleteTicket)
    fetchRouter.get('/deleteTicket:ticket_id', loginService.checkLoggedIn, loginService.ensureSecondFactor, loginService.adminOnlyRoute, fetchController.deleteTicket)
    fetchRouter.get('*', fetchController.noRouteFound)
    return app.use('/', fetchRouter)
};
module.exports = fetchRouter;
module.exports = initFetchRouter;