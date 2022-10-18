// Dependencies
require('dotenv').config();
const express = require('express');
const {engine} = require('express-handlebars');
const path = require('path');
const initViewRouter = require('./server/router/viewRouter')
const initAuthRouter = require('./server/router/passportRouter')
const initPostRouter = require('./server/router/postRouter')
const initFetchRouter = require('./server/router/fetchRouter')
const socketIO = require('./server/socket_server/main').startSocketServer()
var flash = require('connect-flash');

var passport = require('passport');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
// Create Express Server
const app = express();
const PORT = process.env.PORT || 5000;
// Express Session Setup
var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_RECTIFYD,
	createDatabaseTable: false,
};
var sessionStore = new MySQLStore(options);
app.set('trust proxy', 1) 
if (process.env.PROD === 'false') {
	console.log('This is a dev system')
	app.use(session({
		key: process.env.SESSION_KEY,
		secret: process.env.SESSION_SECRETE,
		store: sessionStore,
		resave: true,
		saveUninitialized: false,
		cookie: {
			httpOnly: false, // <=== Still need to test this out
			secure: false, //<=== Turn this on for production 
			maxAge: 1000 * 60 * 60 * 24 // 1 Day
		}
	}));
} else {
	console.log('This is a PROD System')
	app.use(session({
		key: process.env.SESSION_KEY,
		secret: process.env.SESSION_SECRETE,
		store: sessionStore,
		resave: true,
		saveUninitialized: false,
		cookie: {
			httpOnly: false, // <=== Still need to test this out
			secure: true, //<=== Turn this on for production 
			maxAge: 1000 * 60 * 60 * 24 // 1 Day
		}
	}));
}

// Use Passport Session
app.use(passport.authenticate('session'));

// Cookie Parser
// Use JSON Format
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash());
// Static Files
app.use(express.static(path.join(__dirname, "./public")));
app.use("/bs", express.static(path.join(__dirname, "./node_modules/bootstrap")));
app.use('/bs-icons', express.static(path.join(__dirname, "./node_modules/bootstrap-icons")))
app.use("/jq", express.static(path.join(__dirname, "./node_modules/jquery")))
app.use("/quill", express.static(path.join(__dirname, "./node_modules/quill")))
app.use("/chartjs", express.static(path.join(__dirname, "./node_modules/chart.js")))
// Template Engine Setup
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');
// Router setup
initViewRouter(app);
initAuthRouter(app);
initPostRouter(app);
initFetchRouter(app);

app.listen(PORT, () => console.log(`Express Server Running http://127.0.0.1:${PORT}/`));
