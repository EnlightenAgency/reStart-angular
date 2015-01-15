var myApp = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck']);

// routes
myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'ng-app/ui/view/HomeView.html'
		})
		.when('/subpage', {
			templateUrl: 'ng-app/ui/view/SubView.html'
		})
		.otherwise({
			redirectTo: '/'
		});
	$locationProvider
		.html5Mode({
			enabled: true
		})
		.hashPrefix('!');
}]);

// media query constants
myApp.constant('MQ', {
	SMALL: '(max-width: 640px)',
	LARGE: '(min-width: 641px)'
});
