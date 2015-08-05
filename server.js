// BASE SETUP
// ===================================================================

	// CALL PACKAGES -------------------------------------------------
		var express = require('express'); // call express.js
		var app = express(); // define our app using express.js
		var bodyParser = require('body-parser'); // get body-parser
		var morgan = require('morgan'); // used to see all requests
		var mongoose = require('mongoose'); // for working w/ DB
		var config = require('./config');
		var path = require('path');

	// APP CONFIGURATION ---------------------------------------------
		// use body parser so we can grab information from POST requests
			app.use(bodyParser.urlencoded({ extended: true }));
			app.use(bodyParser.json()); 

		// configure app to handle CORS requests
			app.use(function(req, res, next) {
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
				res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

				next();
			});

		// log all requests to the console
			app.use(morgan('dev'));

		// connect to the database
			mongoose.connect(config.database);

		// set static files location
			app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API
// ===================================================================

	// REGISTER ROUTES -----------------------------------------------
		var apiRoutes = require('./app/routes/api')(app, express);
		app.use('/api', apiRoutes);

	// MAIN CATCHALL ROUTE
		app.get('*', function(req, res) {
			res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
		});

// START SERVER
// ===================================================================

	app.listen(config.port);
	console.log('Magic happens towards the port ' + config.port);