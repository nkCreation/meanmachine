/**
* mainController Module
*
* main controller of the application
*/
angular.module('mainCtrl', [])
	.controller('mainController', function($rootScope, $location, Auth){
		var vm = this;

		vm.loggedIn = Auth.isLoggedIn();

		$rootScope.$on('$routeChangeStart', function() {
			vm.loggedIn = Auth.isLoggedIn();

			Auth.getUser()
				.success(function(data) {
					vm.user = data;
				});
		});


		vm.doLogin = function() {
			vm.procesing = true;

			vm.error = '';

			Auth.login(vm.loginData.username, vm.loginData.password)
				.success(function(data) {

					vm.procesing = false;

					if (data.success) {					
						$location.path('/users');
					} else {
						vm.error = data.message;
					}
				});
		};

		vm.doLogout = function() {
			Auth.logout();

			vm.user = {};

			$location.path('/login');
		};
	});