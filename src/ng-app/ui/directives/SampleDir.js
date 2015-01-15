// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directives, and $apply should never be used in a controller! Simpler DOM manipulation should be in the view.

/*--- Sample Directive with a $watch ---*/
app.directive('directiveName', function() {
	function directiveNameLink($scope, $element, $attrs) {
		// watch for async data to become available and update
		$scope.$watch('json', function(json) {
			if (json) {	// safeguard against watched data being undefined

			}
		}, true);
	}

	return {
		restrict: 'A',
		templateUrl: 'ng-app/ui/view/tpl/TemplateTpl.html',
		transclude: true,
		link: directiveNameLink
	};
});