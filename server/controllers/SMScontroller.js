const DBConnection = require('../../config/databaseConfig')
var twilio = require('twilio');
function makeTxtMsg(num, msg) {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_twilio_settings", (err, data) => {
        if (err) throw err;
        const handleSIDerror = data[0].account_sid
        if (handleSIDerror === null) {
            return
        } else {
            if (handleSIDerror.substring(0, 2) != 'AC') {
                console.log('AC ERROR!')
                return
            } else {
                var client = twilio(data[0].account_sid, data[0].auth_token);
                    client.messages.create({
                        body: msg,
                        messagingServiceSid: data[0].msg_service_sid,
                        to: num,
                    }, function(err, message) {
                        if (err) {
                            console.log(err.status)
                        } else {
                            console.log(`SMS Sent to: ${num}`)
                        }
                    })
            }
        }
    })
} 
function testSMS_Settings(req, res) {
    conn = DBConnection()
    conn.query("SELECT * FROM dbo_twilio_settings", (err, data) => {
        if (err) throw err;
        if (data[0].account_sid === null) {
            return res.sendStatus(404)
        } else {
            const handleSIDerror = data[0].account_sid
            if (handleSIDerror.substring(0, 2) != 'AC') {
                console.log('AC ERROR!')
                return res.sendStatus(406)
            } else {           
                var client = twilio(data[0].account_sid, data[0].auth_token);
                client.messages.create({
                    body:'This is a test from your Ticketing System',
                    messagingServiceSid: data[0].msg_service_sid,
                    to: process.env.PHONENUM,
                }, function(err, message) {
                    if (err) {
                        console.log(err.status)
                        return res.sendStatus(err.status)
                    } else {
                        return res.sendStatus(200)
                    }
                })
            }
        }


    })
} 
module.exports = {
    makeTxtMsg: makeTxtMsg,
    testSMS_Settings: testSMS_Settings,
}