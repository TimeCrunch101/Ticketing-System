
const DBConnection = require('../../config/databaseConfig');

const txt = require('./SMScontroller')

exports.gotTXTmsg = (req, res) => {
    var msg = 'We have received your request, Someone will be in touch shortly. Please do not reply to this message. Thank you!'
    txt.makeTxtMsg(req.body.From, msg)
    conn = DBConnection()
        conn.query('SELECT * FROM dbo_tickets ORDER BY dateCreated DESC LIMIT 1;', (err, lastTicket) => {
            if (err) throw err;
            let ts = Date.now();
            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let ticketNUM = lastTicket[0].ticket_id + 1;                
            const ticket_num = `T${year}${month}${date}.${ticketNUM}`
            conn.query('INSERT INTO dbo_tickets SET ?', {
                title: `Received from ${req.body.From}`,
                description: req.body.Body,
                ticket_num: ticket_num,
                source: 3
            })
        })
}