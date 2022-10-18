require('dotenv').config();
const mail = require('./emailController')
const DBConnection = require('../../config/databaseConfig');
const bcrypt = require('bcryptjs');
const val = require('../controllers/validator')
const txt = require('../controllers/SMScontroller')
const emailTemplates = require('../emailTemplates')
const io = require('../socket_server/main')

// INSERTS

exports.createTicket = async (req, res) => {
    conn = DBConnection();
    const {
        ticket_title, 
        ticket_description_input, 
        priority, 
        secondaryResource, 
        primaryResource, 
        issue_type,
        sub_issue_type,
        account,
        source,
        STATUS } = req.body;
        if (process.env.PROD !== 'false') {
            txt.makeTxtMsg(process.env.PHONENUM, `A ticket titled "${ticket_title}" has been made.`)
            var destEmail = process.env.EMAIL
            await mail.sendEmail('New Ticket Created', emailTemplates.newTicketEmail, `${destEmail}`).then(async (mailStatus) => {
                console.log(mailStatus)            
            }).catch(err => {
                console.log(err)
            })
        }
        conn.query("SELECT * FROM dbo_tickets ORDER BY dateCreated DESC LIMIT 1;", (err2, lastTicket) => {
            if (err2) throw err2;
            let ts = Date.now();
            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            if (lastTicket.length === 0) {
                // NO TICKETS
                let ticketNUM = 1
                const ticket_num = `T${year}${month}${date}.${ticketNUM}`
                conn.query("INSERT INTO dbo_tickets SET ?", {
                    ticket_num: ticket_num,
                    title: ticket_title,
                    description: ticket_description_input,
                    priority: priority,
                    status: STATUS,
                    primaryResource: primaryResource,
                    secondaryResource: 1,
                    primaryContact: 1,
                    account: account,
                    source: source,
                    issue_type: issue_type,
                    sub_issue_type: sub_issue_type
                }, (err1) => {
                    if (err1) throw err1;
                    io.emitMessage('New Ticket Added..')
                    return res.redirect(`/viewTicket${ticketNUM}`, 200, conn.destroy());
                })
            } else {
                // TICKETS FOUND This happens when there are tickets in the DB already.
                let ticketNUM = lastTicket[0].ticket_id + 1;                
                const ticket_num = `T${year}${month}${date}.${ticketNUM}`
                conn.query("INSERT INTO dbo_tickets SET ?", {
                    ticket_num: ticket_num,
                    title: ticket_title,
                    description: ticket_description_input,
                    priority: priority,
                    status: STATUS,
                    primaryResource: primaryResource,
                    secondaryResource: 1,
                    primaryContact: 1,
                    account: account,
                    source: source,
                    issue_type: issue_type,
                    sub_issue_type: sub_issue_type
                }, (err1) => {
                    if (err1) throw err1;
                    conn.query("SELECT ticket_id FROM dbo_tickets WHERE ticket_num = ?", [ticket_num], (err, ticketID) => {
                        if (err) throw err;
                        io.emitMessage('New Ticket Added..')
                        return res.redirect(`/viewTicket${ticketID[0].ticket_id}`, 200, conn.destroy());
                    })
            })
        }
    })
}

exports.addComment = (req, res) => {
    conn = DBConnection();
    const { comment_post_value } = req.body;
    const ticketNum = req.params.ticket_id
    conn.query('INSERT INTO dbo_ticket_comments SET ?', {comment: comment_post_value, ticket_id: ticketNum}, (err) => {
        if (err) throw err;
        return res.redirect(`/viewTicket${ticketNum}`, 200, conn.destroy())
    })
}
exports.accountCreate = (req, res) => {
    conn = DBConnection()
    const {accountName, street, city, state, zip, phone, fax, service_plan, current_contract} = req.body;
    let formattedPhoneNumber = val.formatPhoneNumber(phone)
    let formattedFaxNumber = val.formatPhoneNumber(fax)
    conn.query('INSERT INTO dbo_clients SET ?', {
        name: accountName,
        street: street,
        city: city,
        state: state,
        zip: zip,
        phone: formattedPhoneNumber,
        fax: formattedFaxNumber,
        service_plan: service_plan,
        current_contract: current_contract
    }, (err) => {
        if (err) throw err;
        return res.render('_popupMsgRender', {
            var: 'Account',
            isAdmin: req.flash().isAdmin
        }, conn.destroy());
    })
}
exports.resourceCreate = (req, res) => {
    conn = DBConnection();
    const {firstName, lastName, email, password, cellNum, isAdmin} = req.body;
    if (typeof(req.body.isAdmin) === 'undefined') {
        let formattedCellNumber = val.formatPhoneNumber(cellNum)
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        conn.query("SELECT email FROM dbo_user_accounts WHERE email = (?)", [email], (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                return res.render('createResource_password', conn.destroy()); // FIX THIS
            } else {
                conn.query("INSERT INTO dbo_user_accounts SET ?", {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                    cellNum: formattedCellNumber,
                    isAdmin: 0,
                }, (err) => {
                    if (err) throw err;
                    return res.render('_popupMsgRender', {
                        var: 'Resource',
                        isAdmin: req.flash().isAdmin
    
                    },conn.destroy());
                })
            }
        })
    } else {
        let formattedCellNumber = val.formatPhoneNumber(cellNum)
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        conn.query("SELECT email FROM dbo_user_accounts WHERE email = (?)", [email], (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                return res.render('createResource_password', conn.destroy()); // FIX THIS
            } else {
                conn.query("INSERT INTO dbo_user_accounts SET ?", {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                    cellNum: formattedCellNumber,
                    isAdmin: 1,
                }, (err) => {
                    if (err) throw err;
                    return res.render('_popupMsgRender', {
                        var: 'Resource',
                        isAdmin: req.flash().isAdmin
    
                    },conn.destroy());
                })
            }
        })
    }
}
exports.createContact = (req, res) => {
    conn = DBConnection()
    const {firstName, lastName, email, primaryPhone, cellPhone, account} = req.body;
    let formattedPrimNumber = val.formatPhoneNumber(primaryPhone)
    let formattedCellNumber = val.formatPhoneNumber(cellPhone)
    conn.query('INSERT INTO dbo_contacts SET ?', {
        firstName: firstName, 
        lastName: lastName, 
        email: email, 
        primaryPhone: formattedPrimNumber, 
        cellPhone: formattedCellNumber, 
        account: account}, (err) => {
        if (err) throw err;
        return res.render('_popupMsgRender', {
            var: 'Contact',
            isAdmin: req.flash().isAdmin
        },conn.destroy())
    })
}
// DELETES

// SELECTS
exports.editTicket = (req, res) => {
    conn = DBConnection()
    const ticket_id = req.params.ticket_id
    conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", ticket_id, (err, ticket_with_ids) => {
        if (err) throw err;
        conn.query("SELECT * FROM dbo_view_tickets WHERE ticket_id = ?", [ticket_id], (err, ticket_normalized) => {
            if (err) throw err;
            conn.query("SELECT * FROM dbo_user_accounts WHERE resource_id = ?", [ticket_with_ids[0].primaryResource], (err, primaryResource) => {
                if (err) throw err;
                conn.query("SELECT * FROM dbo_user_accounts WHERE resource_id = ?", [ticket_with_ids[0].secondaryResource], (err, secondaryResource) => {
                if (err) throw err;
                conn.query("SELECT * FROM dbo_user_accounts", (err, allResources) => {
                    if (err) throw err;
                    conn.query("SELECT * FROM dbo_contacts WHERE contactID = ?", [ticket_with_ids[0].primaryContact], (err, primaryContact) => {
                        if (err) throw err;
                        conn.query("SELECT * FROM dbo_contacts WHERE contactID != ? AND account = ?", [ticket_with_ids[0].primaryContact, ticket_with_ids[0].account], (err, allContacts) => {
                            if (err) throw err;
                            conn.query("SELECT * FROM dbo_clients WHERE account_id != ?", [ticket_with_ids[0].account], (err, allAccounts) => {
                                if (err) throw err;
                                conn.query("SELECT * FROM accounts_view WHERE account_id = ?", [ticket_with_ids[0].account], (err, ticketAccount) => {
                                    if (err) throw err;
                                    conn.query("SELECT * FROM dbo_status_helper WHERE statusID = ?", [ticket_with_ids[0].status], (err, currentStatus) => {
                                        if (err) throw err;
                                        conn.query("SELECT * FROM dbo_status_helper WHERE statusID != ?", [ticket_with_ids[0].status], (err, allStatus) => {
                                            if (err) throw err;
                                            conn.query("SELECT * FROM dbo_issue_type WHERE row_id != ?", [ticket_with_ids[0].issue_type], (err, allIssueTypes) => {
                                                if (err) throw err;
                                                conn.query("SELECT * FROM dbo_sub_issue_type WHERE row_id != ? AND issue_fk = ?", [ticket_with_ids[0].sub_issue_type, ticket_with_ids[0].issue_type], (err, allSubIssueTypes) => {
                                                    if (err) throw err;
                                                    res.render('editTicket', {
                                                        ticket_with_ids: ticket_with_ids[0],
                                                        primaryResource: primaryResource[0],
                                                        secondaryResource: secondaryResource[0],
                                                        ticket_normalized: ticket_normalized[0],
                                                        primaryContact: primaryContact[0],
                                                        allContacts: allContacts,
                                                        ticketAccount: ticketAccount[0],
                                                        allAccounts: allAccounts,
                                                        currentStatus: currentStatus[0],
                                                        allStatus: allStatus,
                                                        allIssueTypes: allIssueTypes,
                                                        allSubIssueTypes: allSubIssueTypes,
                                                        allResources: allResources
                                                        }, conn.destroy())
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}
// SELECT FROM SEARCH
exports.searchTickets = (req, res) => {
    conn = DBConnection()
    const {searchParams} = req.body
    conn.query(`SELECT * FROM dbo_view_tickets WHERE 
    (ticket_num) LIKE ? OR 
    (title) LIKE ? OR 
    (priority) LIKE ? OR 
    (STATUS) LIKE ? OR 
    (primaryResource) LIKE ? OR 
    (secondaryResource) LIKE ? OR 
    (primaryContact) LIKE ? OR 
    (account) like ? ORDER BY ticket_id ASC`, 
    ['%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%', 
    '%' + searchParams + '%'], (err, tickets) => {     
        if (err) throw err;
        res.render('viewAllTickets', {
            tickets: tickets,
            isAdmin: req.flash().isAdmin
        }, conn.destroy())    
    })
}
// UPDATES
exports.updateTicket = (req, res) => {
    conn = DBConnection();
    const {ticketTitle, 
        ticketDescription, 
        ticketPriority, 
        status, 
        secondaryResource, 
        primaryResource, 
        ticketContact, 
        ticketAccount} = req.body;
    conn.query(`UPDATE dbo_tickets SET ? WHERE ticket_id = ${req.params.ticket_id}`, {
        title: ticketTitle, 
        description: ticketDescription, 
        priority: ticketPriority, 
        status: status, 
        primaryResource: primaryResource, 
        secondaryResource: secondaryResource, 
        primaryContact: ticketContact, 
        account: ticketAccount
    }, (err) => {
        if (err) throw err;
        conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", [req.params.ticket_id], (err, data) => {
            if (err) throw err;
            res.redirect(`/viewTicket${req.params.ticket_id}`, 200, {data})
            conn.destroy();
        })
    })
}
exports.assignContact = (req, res) => {
    conn = DBConnection()
    var contactID = req.body.contact
    conn.query('SELECT * FROM dbo_contacts WHERE contactID = ?', [contactID], (err, contactINFO) => {
        if (err) throw err;
        var accountID = contactINFO[0].account
        conn.query(`UPDATE dbo_clients SET ? WHERE account_id = ${accountID}`, {poc: contactID}, (err) => {
            if (err) throw err;
            return res.redirect('/View/Accounts', 200, conn.destroy())
        })
    })
}
exports.renderPasswordUpdatePage = (req, res) => {
    conn = DBConnection()
    var resource_id = req.params.resource_id
    conn.query('SELECT * FROM dbo_user_accounts WHERE resource_id = ?', [resource_id], (err, resource) => {
        if (err) throw err;
        var myResource = resource[0]
        res.render('updatePasswordView', {myResource}, conn.destroy())
    })
}
exports.updateUserPassword = (req, res) => {
    conn = DBConnection()
    const { email, resource_id, password } = req.body
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const resourceToUpdate = req.params.resource_id
    conn.query(`UPDATE dbo_user_accounts SET password = '${hash}' WHERE resource_id = ${resourceToUpdate}`, (err) => {
        if (err) throw err;
        return res.redirect('/', 200, conn.destroy())
    })
}
exports.deleteResource = (req, res) => {
    conn = DBConnection()
    var resourceID = req.params.resource_id
    var requester = req.session.passport.user
    if (resourceID == requester) {
        return res.redirect('/View/Users', 307, req.flash('msg', "You Can't Delete Yourself!"))
    } else {
        conn.query('DELETE FROM dbo_user_accounts WHERE resource_id = ?', [resourceID], (err) => {
            if (err) throw err;
            res.redirect('/View/Users', 200, conn.destroy())
        })
    }
}
exports.deleteContact = (req, res) => {
    conn = DBConnection()
    var contactID = req.params.contactID
    conn.query('DELETE FROM dbo_contacts WHERE contactID = ?', [contactID], (err) => {
        if (err) throw err;
        res.redirect('/View/Contacts', 200, conn.destroy())
    })
}
exports.deleteAccount = (req, res) => {
    conn = DBConnection()
    var account_id = req.params.account_id
    conn.query('DELETE FROM dbo_clients WHERE account_id = ?', [account_id], (err) => {
        if (err) throw err;
        res.redirect('/View/Accounts', 200, conn.destroy())
    })
}
exports.editCommentPost = (req, res) => {
    conn = DBConnection()
    conn.query("UPDATE dbo_ticket_comments SET comment = ? WHERE commentID = ?", [req.body.comment_post_value ,req.params.commentID], (err) => {
        if (err) throw err;
        return res.redirect('/', 200, conn.destroy())
    })
}
exports.addCommentAttachment = (req, res) => {
    conn = DBConnection()
    const uploadPath = '/uploads/'
    const fullPath = uploadPath + req.file.filename
    conn.query('UPDATE dbo_ticket_comments SET attachment = ? WHERE commentID = ?', [fullPath, req.params.commentID], (err) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.sendStatus(200)
        }
        conn.destroy()
    })
}