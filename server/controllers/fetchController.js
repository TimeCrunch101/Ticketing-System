const express = require('express')
const path = require('path')
const templates = require('../emailTemplates')
const fs = require('fs')
const DBConnection = require('../../config/databaseConfig')

exports.deleteComment = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            conn = DBConnection()
            var commentID = req.params.commentID
            conn.query('SELECT * FROM dbo_ticket_comments WHERE commentID = ?', [commentID], (err, data) => {
                if (err) throw err
                if (data[0].attachment === null) {
                    conn.query('DELETE FROM dbo_ticket_comments WHERE commentID = ?', [commentID], (err) => {
                        if (err) throw err;
                        resolve(true)
                    })
                } else {
                    const file = data[0].attachment
                    const folderPath = process.env.UPLOAD_FOLDER
                    const fullPath = folderPath + file
                    fs.unlinkSync(fullPath)
                    conn.query('DELETE FROM dbo_ticket_comments WHERE commentID = ?', [commentID], (err) => {
                        if (err) throw err;
                        resolve(true)
                    })
                }
            })
        } catch (error) {
            resolve(error)            
        }
    })
}

exports.viewTicketFetch = (req, res) => {
    conn = DBConnection();
    conn.query('SELECT * FROM dbo_view_tickets WHERE ticket_id = ?', [req.params.ticket_id], (err, ticketData) => {
        if (err) throw err;
            conn.query("SELECT * FROM dbo_ticket_comments WHERE ticket_id = ?", [req.params.ticket_id], (err, comments) => {
                res.send(ticketData)
                conn.destroy()
            })
        
    })
}
exports.fetchEditTicket = (req, res) => {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_tickets WHERE ticket_id = ?", [req.params.ticket_id], (err, ticketIDs) => {
        if (err) throw err
        conn.query("SELECT * FROM dbo_view_tickets WHERE ticket_id = ?", [req.params.ticket_id], (err, ticketInfo) => {
            if (err) throw err
            conn.query("SELECT * FROM dbo_user_accounts", (err, resource) => {
                if (err) throw err
                conn.query('SELECT * FROM dbo_clients', (err, dbo_clients) => {
                    if (err) throw err
                    conn.query(`SELECT * FROM dbo_status_helper WHERE statusID != ${ticketIDs[0].status}`, (err, statusHelper) => {
                        if (err) throw err
                        conn.query("SELECT * FROM dbo_contacts WHERE (firstName) LIKE 'None' OR (account) LIKE ?", [ticketIDs[0].account], (err, contact) => {
                            if (err) throw err
                            const myObj = {
                                ticketInfo: ticketInfo[0],
                                resource: resource[0],
                                dbo_clients: dbo_clients[0],
                                ticketIDs: ticketIDs[0],
                                statusHelper: statusHelper[0],
                                contact: contact[0]
                            }
                            res.send(myObj)
                            conn.destroy()
                        })
                    })
                })

            })
        })
    })
}
exports.fetchComments = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_ticket_comments WHERE ticket_id = ? ORDER BY DATE DESC', [req.params.ticket_id], (err, data) => {
        if (err) throw err;
        res.send(data, 200, conn.destroy())
    })
}

exports.fetchSubIssueType = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_sub_issue_type WHERE issue_fk = ?', [req.params.issue_id], (err, data) => {
        if (err) throw err;
        const myObj = data
        res.send(myObj)
        conn.destroy()
    })
}
exports.deleteTicket = (req, res) => {
    conn = DBConnection()
    const ticket_id = req.params.ticket_id
    conn.query('SELECT * FROM dbo_ticket_comments WHERE ticket_id = ?', [ticket_id], (err, data) => {
        if (err) throw err;
        const folderPath = process.env.UPLOAD_FOLDER
        for (i in data) {
            if (data[i].attachment != null) {
                let fullPath = folderPath + data[i].attachment
                fs.unlinkSync(fullPath)
            }
        }
        conn.query('DELETE FROM dbo_tickets WHERE ticket_id = ?', [ticket_id], (err) => {
            if (err) throw err;
        })
    })
}
exports.fetchComment = (req, res) => {
    conn = DBConnection()
    conn.query('SELECT * FROM dbo_ticket_comments WHERE commentID = ?', [req.params.commentID], (err, data) => {
        if (err) throw err;
        if (data.length <= 0) {
            res.sendStatus(404);
            conn.destroy();
            return
        }
        res.send(data[0])
        conn.destroy();
    })
}
exports.noRouteFound = (req, res) => {
    res.status(200).send(templates.NotFound)
}