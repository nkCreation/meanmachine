/**
* userApp Module
*
* A CRM Application using a MEAN stack.
*/
angular.module('userApp', [
	'ngAnimate',
	'ngMaterial',
	'app.routes',
	'authService',
	'mainCtrl',
	'userCtrl',
	'userService'
])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});