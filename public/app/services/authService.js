/**
* authService Module
*
*/
angular.module('authService', [])

	// Auth FACTORY to login and get information
	// Inject $http for communicating with the API
	// Inject $q to return promise objects
	// Inject AuthToken to manage tokens

	.factory('Auth', function($http, $q, AuthToken){
		var authFactory = {};

		// login
		authFactory.login = function(username, password) {
			return $http.post('/api/authenticate', {
				username: username,
				password: password
			}).success(function(data) {
				AuthToken.setToken(data.token);
				return data;
			});
		};

		// logout
		authFactory.logout = function() {
			AuthToken.setToken();
		};

		// check if a user is logged in
		authFactory.isLoggedIn = function() {
			if (AuthToken.getToken()) {
				return true;
			} else {
				return false;
			}
		};

		// get the user info
		authFactory.getUser = function() {
			if (AuthToken.getToken()) {
				return $http.get('/api/me', { cache: true });
			} else {
				return $q.reject({ message: 'User has no token.' });
			}
		};

		// return auth factory object
		return authFactory;
	})

	// factory for handling tokens
	// inject $window to store token client-side

	.factory('AuthToken', function($window) {
		var authTokenFactory = {};

		// get the token
		authTokenFactory.getToken = function() {
			return $window.localStorage.getItem('token');
		};

		// set the token or clear the token
		authTokenFactory.setToken = function(token) {
			if (token) {
				$window.localStorage.setItem('token', token);
			} else {
				$window.localStorage.removeItem('token');
			}
		};

		// return
		return authTokenFactory;
	})

	// factory for integrate token into requests
	.factory('AuthInterceptor', function($q, $location, AuthToken){
		var authInterceptorFactory = {};

		// attach the token
		authInterceptorFactory.request = function(config) {
			var token = AuthToken.getToken();

			if (token) {
				config.headers['x-access-token'] = token;
			}

			return config;
		};
		
		// redirect if a token doesn't match
		authInterceptorFactory.responseError = function(response) {
			if (response.status == 403) {
				AuthToken.setToken();
				$location.path('/login');
			}

			return $q.reject(response);
		};

		// return
		return authInterceptorFactory;
	});