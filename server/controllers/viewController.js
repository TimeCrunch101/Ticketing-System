require('dotenv').config();
const DBConnection = require('../../config/databaseConfig');
var axios = require("axios").default;
const flash = require('connect-flash');
const helperFuns = require('../helperFuns/helpers')
const io = require('../socket_server/main')

// BASIC VIEWS

exports.homeView = async (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_view_tickets', (err, data) => {
        if (err) throw err;
        conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS != 'Closed'", (err, NotClosed) => {
            if (err) throw err;
            conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS = 'Closed'", (err, closed) => {
                if (err) throw err;
                conn.query("SELECT * FROM dbo_tickets WHERE STATUS != 2 AND primaryResource = 1;", (err, notAssigned) => {
                    if (err) throw err;
                    conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS = 'NEEDS ATTENTION'", (err, NeedsAttention) => {
                        if (err) throw err;
                        conn.query('SELECT firstName, lastName, email, cellNum, isAdmin FROM dbo_user_accounts WHERE resource_id = ?', [req.session.passport.user], (err, userObj) => {
                            if (err) throw err;
                            const userObject = userObj[0]
                            const totalTickets = data.length
                            const OpenTickets = NotClosed.length
                            const MyClosedTickets = closed.length
                            const unassigned = notAssigned.length
                            const needsAttention = NeedsAttention.length
                            return res.render('home', {
                                totalTickets: totalTickets,
                                OpenTickets: OpenTickets,
                                MyClosedTickets: MyClosedTickets,
                                unassigned: unassigned,
                                needsAttention: needsAttention,
                                userObject: userObject,
                                message: req.flash().message,
                                isAdmin: userObject.isAdmin
                            }, conn.destroy())
                        })
                    })
                })
            })
        })
    })
}
exports.createAccountView = (req, res) => {
    res.render('createAccount')
}
exports.createResourceView = (req, res) => {
    res.render('createUser')
}

// DB INTEGRATIONS

exports.openTicketsView = (req, res) => {
    conn = DBConnection();
    conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS != 'Closed' ORDER BY dateCreated DESC", (err, tickets) => {
        if (err) throw err;
        io.emitMessage('Viewing Open Tickets..')
        res.render('viewOpenTickets', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        }, conn.destroy())
    })
};

exports.closedTicketsView = (req, res) => {
    conn = DBConnection();
    conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS = 'Closed' ORDER BY dateCreated ASC", (err, tickets) => {
        if (err) throw err;
        res.render('viewClosedTickets', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        }, conn.destroy())
    })
};
exports.createticketview = (req, res) => {
    conn = DBConnection();
    conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id != "1"', (err, dbo_user_accounts) => {
        if (err) throw err;
        conn.query('SELECT * FROM dbo_clients WHERE account_id != "1"', (err, dbo_clients) => {
            if (err) throw err;
            conn.query('SELECT * FROM dbo_status_helper', (err, dbo_status_helper) => {
                if (err) throw err;
                conn.query('SELECT * FROM dbo_issue_type', (err, dbo_issue_type) => {
                    if (err) throw err;
                    res.render('createTicket', {
                        dbo_user_accounts: dbo_user_accounts,
                        dbo_clients: dbo_clients,
                        dbo_status_helper: dbo_status_helper,
                        dbo_issue_type: dbo_issue_type,
                    })
                    conn.destroy()
                })

            })
        })
    })
}
exports.viewTicket = (req, res) => {
    conn = DBConnection();
    conn.query('SELECT * FROM dbo_view_tickets WHERE ticket_id = ?', [req.params.ticket_id], (err, ticket) => {
        if (err) throw err;
            conn.query("SELECT * FROM dbo_ticket_comments WHERE ticket_id = ? ORDER BY date DESC", [req.params.ticket_id], (err, comments) => {
                if (err) throw err;
                conn.query('SELECT * FROM accounts_view WHERE name = ?', [ticket[0].account], (err, client) => {
                    if (err) throw err;
                    conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", [req.params.ticket_id], (err, ticket_with_ids) => {
                        if (err) throw err;
                        const ticketClient = client
                        return res.render('viewTicket', {
                            ticket: ticket,
                            comments: comments,
                            ticketClient: ticketClient
                        }, conn.destroy())  
                    })
                })
            })
    })
}
exports.viewUsers = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id != 1', (err, dbo_user_accounts) => {
        if (err) throw err;
        const {isAdmin, msg} = req.flash()
        res.render('viewUsers', {
            dbo_user_accounts: dbo_user_accounts,
            isAdmin: isAdmin,
            delSelfError: msg,
        })
        conn.destroy()
    })
}

exports.accountsView = (req, res) => {
    conn = DBConnection()
    conn.query("SELECT * FROM accounts_view WHERE account_id != 1", (err, dbo_clients) => {
        if (err) throw err;
        res.render('viewAccounts', {
            dbo_clients: dbo_clients,
            isAdmin: req.flash().isAdmin
        })
        conn.destroy()
    })
}

exports.allTicketsView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_view_tickets ORDER BY dateCreated DESC', (err, tickets) => {
        if (err) throw err;
        
        res.render('viewAllTickets', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        })
        conn.destroy()
    })
}

exports.createContactView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_clients WHERE account_id != "1"', (err, dbo_clients) => {
        if (err) throw err
        res.render("createContact", {
            dbo_clients: dbo_clients,
            isAdmin: req.flash().isAdmin
        })
        conn.destroy()
    })
}

exports.contactsview = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM contactsview WHERE contactID != "1"', (err, dbo_contacts) => {
        if (err) throw err;
        const {isAdmin, displayErr} = req.flash()
        res.render('viewContacts', {
            dbo_contacts: dbo_contacts,
            isAdmin: isAdmin,
            displayErr: displayErr,
        })
        conn.destroy()
    })
}

exports.unassignedTicketsView = (req, res) => {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS NOT LIKE 'Closed' AND primaryResource LIKE 'None  ';", (err, tickets) => {
        if (err) throw err;
        res.render('viewUnassignedTickets', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        })
        conn.destroy()
    })
}

exports.NeedsAttention = (req, res) => {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_view_tickets WHERE STATUS = 'NEEDS ATTENTION'", (err, tickets) => {
        if (err) throw err;
        res.render('needsAttentionView', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        })
        conn.destroy()
    })
}
exports.addCommentView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_view_tickets WHERE ticket_id = ?', [req.params.ticket_id], (err, data) => {
        if (err) throw err;
        return res.render('addComment', {ticket_id: data[0].ticket_id}, conn.destroy())
    })
}

exports.userAcceptTicket = (req, res) => {
    conn = DBConnection()
    const user = req.session.passport.user
    conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", [req.params.ticket_id], async (err, ticketData) =>  {
        if (err) throw err;
        primResource = ticketData[0].primaryResource
        secResource = ticketData[0].secondaryResource
        helperFuns.checkIfUserIsAssigned(user, primResource, secResource).then((result) => {
            if (result == true) {
                conn.query('UPDATE dbo_tickets SET primaryResource = ? WHERE ticket_id = ?', [user, ticketData[0].ticket_id], (err) => {
                    if (err) throw err;
                    return res.redirect(`/viewTicket${req.params.ticket_id}`, 200, conn.destroy())
                })
            }
        }).catch((err) => {
            return res.redirect(`/viewTicket${req.params.ticket_id}`, 200, conn.destroy())
        })
    })
}

exports.markTicketComplete = (req, res) => {
    conn = DBConnection()
    const ticket_id = req.params.ticket_id
    conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", [ticket_id], (err, data) => {
        if (err) throw err;
        if (data[0].status === 2) {
            return res.redirect(`/viewTicket${req.params.ticket_id}`, 200, conn.destroy())
        } else {
            conn.query('UPDATE dbo_tickets SET STATUS = 2 WHERE ticket_id = ?', [ticket_id], (err) => {
                if (err) throw err;
                return res.redirect(`/viewTicket${req.params.ticket_id}`, 200, conn.destroy())
            })
        }
    })
}

exports.editCommentView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_ticket_comments WHERE commentID = ?', [req.params.commentID], (err, data) => {
        if (err) throw err;
        var commentData = data[0]
        res.render('editComment', {commentData}, conn.destroy())
    })
}

exports.addAttachmentView = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_ticket_comments WHERE commentID = ?', [req.params.commentID], (err, data) => {
        if (err) throw err;
        res.render('addAttachment', {data}, conn.destroy())
    })
}

exports.viewOwnedTickets = (req, res) => {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_view_tickets", (err, data) => {
        if (err) throw err;
        const tickets = data
        res.render('myTickets', {
            tickets: tickets,
            technical_support: tickets.length,
            isAdmin: req.flash().isAdmin
        }, conn.destroy())
    })
}