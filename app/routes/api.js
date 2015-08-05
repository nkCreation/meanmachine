var User = require('../models/user');
var bodyParser = require('body-parser'); // get body-parser
var jwt = require('jsonwebtoken');
var config = require('../../config');

var secretPart = config.secret;

module.exports = function(app, express) {
	// get an instance of the express router
		var apiRouter = express.Router();

	// login route
		apiRouter.post('/authenticate', function(req, res) {
			User.findOne({
				username: req.body.username
			})
			.select('name username password')
			.exec(function(err, user) {
				if (err) throw err;

				// no user with the requested username
				if (!user) {
					res.json({
						success: false,
						message: 'Authentication failed. User not found.'
					});
				} else if (user) {
					var validPassword = user.comparePassword(req.body.password);

					if (!validPassword) {
						res.json({
							success: false,
							message: 'Authentication failed. Wrong password.'
						});
					} else {
						// user is found, password is right
						var token = jwt.sign({
							name: user.name,
							username: user.username
						}, secretPart, {
							expiresInMinutes: 1440
						});

						res.json({
							success: true,
							message: 'Welcome to our API',
							token: token
						});
					}
				}
			});
		});

	// middleware to use for all requests
		apiRouter.use(function(req, res, next) {
			//  get the token
			var token = req.body.token || req.query.token || req.headers['x-access-token'];

			if (token) {
				// check the token
				jwt.verify(token, secretPart, function(err, decoded) {
					if (err) {
						return res.status(403).send({
							success: false,
							message: 'failed to authenticate token.'
						});
					} else {
						// everything is good
						req.decoded = decoded;

						next();
					}
				});
			} else {
				// if there is no token
				// return an HTTP response 403 (forbidden)

				return res.status(403).send({
					success: false,
					message: 'No token provided.'
				});
			}
		});

	// test route to make sure everything's fine
	// accessed at GET http://localhost:8080/api
		apiRouter.get('/', function(req, res) {
			res.json({ message: 'Yiihhaaaa, welcome to our API !' });
		});

		apiRouter.route('/users')
			.post(function(req, res) {
				// create instance of the user model
				var user = new User();

				// sets the users information (comes from the request)
				user.name = req.body.name;
				user.username = req.body.username;
				user.password = req.body.password;

				// save the user and check for errors
				console.log('ok');
				user.save(function(err) {
					if (err) {
						// duplicate entry
						if (err.code == 11000) {
							return res.json({ success: false, message: 'A user with that username already exists. '});
						} else {
							return res.send(err);
						}
					}

					res.json({ message: 'User created!'});
				});
			})

			.get(function(req, res) {
				User.find(function(err, users) {
					if (err) {
						res.send(err);
					}

					res.json(users);
				});
			});

		apiRouter.route('/users/:user_id')
			.get(function(req, res) {
				User.findById(req.params.user_id, function(err, user) {
					if (err) res.send(err);

					res.json(user);
				});
			})
			.put(function(req, res) {
				User.findById(req.params.user_id, function(err, user) {
					if (err) res.send(err);

					if (req.body.name) user.name = req.body.name;
					if (req.body.username) user.username = req.body.username;
					if (req.body.password) user.password = req.body.password;

					user.save(function(err) {
						if (err) res.send(err);

						res.json({ message: 'User updated!'});
					});
				});
			})
			.delete(function(req, res) {
				User.remove({
					_id: req.params.user_id
				}, function(err, user) {
					if (err) return res.send(err);

					res.json({ message: 'Successfully deleted!'});
				});
			});

	return apiRouter;
};