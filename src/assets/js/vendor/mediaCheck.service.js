(function() {
	'use strict';

	angular.module('mediaCheck', []);

	angular.module('mediaCheck').service('mediaCheck', ['$window', '$timeout', function($window, $timeout) {
		var self = this;

		var hasMatchMedia = $window.matchMedia !== undefined && !!$window.matchMedia('!').addListener;

		// set up matchCurrent() method
		self.matchCurrent = null;

		/**
		 * Wrap handlers in $timeout
		 * to prevent $digest errors
		 *
		 * @param fn {function}
		 * @param mq {object} matchMedia query
		 * @private
		 */
		function _timeoutFn(fn, mq) {
			if (typeof fn === 'function') {
				$timeout(function() {
					fn(mq);
				});
			}
		}

		/**
		 * INIT method
		 *
		 * @param options {object}
		 * @returns {*}
		 * @public
		 */
		self.init = function(options) {
			// general
			var query = options['mq'];
			var mqChange = void 0;
			var $scope = options['scope'];
			var $win = angular.element($window);

			// media query changing functions
			var enterFn = options.enter;
			var exitFn = options.exit;
			var changeFn = options.change;

			// matchMedia supported
			var mmListener;
			var mq = void 0;
			var createListener = void 0;
			var mqListListener;

			// matchMedia not supported
			var debounce = options['debounce'];
			var breakpoints;
			var debounceResize;
			var debounceSpeed = !!debounce || debounce === 0 ? debounce : 250;

			// set shared options
			var matchCurrent = null;

			/**
			 * Convert ems to px
			 *
			 * @param value {number}
			 * @returns {number}
			 * @private
			 */
			function _convertEmToPx(value) {
				var emElement = document.createElement('div');

				emElement.style.width = '1em';
				emElement.style.position = 'absolute';
				document.body.appendChild(emElement);
				document.body.removeChild(emElement);

				return value * emElement.offsetWidth;
			}

			/**
			 * Get pixel value
			 *
			 * @param width {number}
			 * @param unit {string}
			 * @returns {string}
			 * @private
			 */
			function _getPXValue(width, unit) {
				var value;
				value = void 0;
				switch (unit) {
					case 'em':
						value = _convertEmToPx(width);
						break;
					default:
						value = width;
				}
				return value;
			}

			if (hasMatchMedia) {
				// Modern browser supports matchMedia

				/**
				 * Check for matches
				 * Run functions appropriately
				 *
				 * @param mq {object} MediaQueryList object
				 */
				mqChange = function(mq) {
					if (mq.matches) {
						_timeoutFn(enterFn, mq);
					} else {
						_timeoutFn(exitFn, mq);
					}
					_timeoutFn(changeFn, mq);
				};

				mq = $window.matchMedia(query);

				/**
				 * Set up matchCurrent (matchMedia supported)
				 * Run proper function for current breakpoint
				 * Run mqChange on-demand
				 */
				matchCurrent = function() {
					mqChange(mq);
				};

				// SET PUBLIC matchCurrent method
				self.matchCurrent = matchCurrent;

				/**
				 * Create listener for media query changes
				 * Bind to orientation change
				 * Unbind on $scope destruction
				 */
				createListener = function() {
					mqListListener = function() { return mqChange(mq) };

					mq.addListener(mqListListener);

					// bind to the orientationchange event and fire mqChange
					$win.bind('orientationchange', mqListListener);

					// cleanup listeners when $scope is $destroyed
					if ($scope) {
						$scope.$on('$destroy', function() {
							mq.removeListener(mqListListener);
							$win.unbind('orientationchange', mqListListener);
						});
					}

					return mqChange(mq);
				};

				return createListener();

			} else {
				// Browser does not support matchMedia (<=IE9, IE Mobile)

				breakpoints = {};

				/**
				 * Check for matches
				 * Run functions appropriately
				 *
				 * @param mq {object}
				 * @returns {*} set breakpoint matching boolean
				 */
				mqChange = function(mq) {
					if (mq.matches) {
						if (!!breakpoints[query] === false) {
							_timeoutFn(enterFn, mq);
						}
					} else {
						if (breakpoints[query] === true || breakpoints[query] == null) {
							_timeoutFn(exitFn, mq);
						}
					}

					if ((mq.matches && (!breakpoints[query]) || (!mq.matches && (breakpoints[query] === true || breakpoints[query] == null)))) {
						_timeoutFn(changeFn, mq);
					}

					return breakpoints[query] = mq.matches;
				};

				breakpoints[query] = null;

				/**
				 * Create matchMedia listener when matchMedia not supported
				 *
				 * @returns {*} mqChange function
				 */
				mmListener = function() {
					var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/);
					var constraint = parts[1];
					var value = _getPXValue(parseInt(parts[2], 10), parts[3]);
					var fakeMatchMedia = {};
					var windowWidth = $window.innerWidth || document.documentElement.clientWidth;

					fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

					return mqChange(fakeMatchMedia);
				};

				/**
				 * Window resized
				 */
				var fakeMatchMediaResize = function() {
					$timeout.cancel(debounceResize);
					debounceResize = $timeout(mmListener, debounceSpeed);
				};

				$win.bind('resize', fakeMatchMediaResize);

				if ($scope) {
					$scope.$on('$destroy', function() {
						$win.unbind('resize', fakeMatchMediaResize);
					});
				}

				/**
				 * Set up matchCurrent (matchMedia not supported)
				 * Run proper function for current breakpoint
				 */
				matchCurrent = function() {
					mq = {
						media: query,
						matches: breakpoints[query]
					};

					if (breakpoints[query]) {
						_timeoutFn(enterFn, mq);
					} else {
						_timeoutFn(exitFn, mq);
					}
					_timeoutFn(changeFn, mq);
				};

				// SET PUBLIC matchCurrent method
				self.matchCurrent = matchCurrent;

				return mmListener();
			}
		};
	}]);
})();