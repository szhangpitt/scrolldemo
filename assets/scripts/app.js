$(document).ready(function(){
	$("html,body").animate({scrollTop: 0}, 400);
});
var SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
var appModule = angular.module('tagdemo', []);

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', function ($scope, $rootScope, TagService) {
	
	$scope.getLinkedInData = function() {
		IN.API.Profile()
		.ids(SHAOPENG_LINKIEDIN_ID)
		.fields(["id", "firstName", "lastName", "pictureUrl","headline","publicProfileUrl", 'skills', 'positions'])
		.result(function(result) {
			profile = result.values[0];
			
			TagService.loadProfile(profile);
		});
	}

	$scope.$on('PROFILE', function(event, data) {
		$scope.$apply(function() {
			$scope.positions = TagService.positions;	
			$scope.profile = TagService.profile;		
		});
	})

}]);

appModule.controller('UIController', ['$scope', '$rootScope', 'TagService', 'RandomImageGenerator',
	function ($scope, $rootScope, TagService, RandomImageGenerator) {

		$scope.imageLoadPercentage = 0;
		$scope.tagLoadPercentage = 0;
		$scope.advLoadPercentage = 0;
		var imgLoadInterval, tagLoadInterval, advLoadInterval;

		$scope.visible = function(identifier) {
			if (identifier === 'progress') {
				return  $scope.imageLoadPercentage > 0;
			}
			else if (identifier === 'image') {
				return $scope.imageLoadPercentage === 100;
			}
			else if (identifier === 'tag') {
				return $scope.tagLoadPercentage === 100;
			}
			else if (identifier === 'adv') {
				return $scope.advLoadPercentage === 100;
			}
		}

		$scope.tagBaseHeight = function(value) {
			return Math.min(28, 16 + value * 48);
		}

		$scope.completeSection = function(step) {
			$scope.completedSection = step;
		}

		$scope.resetAll = function(exceptImgUrl) {
			$scope.completedSection = 0;
			
			if(!exceptImgUrl){
				$scope.imgUrl = null;
			}
			
			$scope.tags = null;
			$scope.advs = null;
			$scope.imageLoadPercentage = 0;
			$scope.tagLoadPercentage = 0;
			$scope.advLoadPercentage = 0;
			clearInterval(imgLoadInterval);
			clearInterval(tagLoadInterval);
			clearInterval(advLoadInterval);
		}

		$scope.scrollToSection = function(step) {
			$('html,body').animate({
				scrollTop: $('#step' + step).offset().top
			}, 400);
		}

		$scope.getTags = function() {	
			clearInterval(tagLoadInterval);
			tagLoadPercentage = 20;

			tagLoadInterval = setInterval(function() {
				$scope.tagLoadPercentage = $scope.tagLoadPercentage < 49 ? $scope.tagLoadPercentage + 1 : 49; 
				$scope.$apply();
			}, 50);

			TagService.getTags().then(function(data) {
				console.log('getTags: ', data);

				$scope.tags = data;

				setTimeout(function() {
					console.log('1s after getTags data: ', data);

					$scope.tagLoadPercentage = 100;
					clearInterval(tagLoadInterval);
					$scope.completeSection(2);
					$scope.$apply();		
				}, 1000);
			});
		}

		$scope.maxValue = function(tags) {
			if(tags.length && tags.length > 0) {
				var max = -999;
				for (var i = 0, len = tags.length; i < len; i++) {
					if (tags[i].value > max) {
						max = tags[i].value;
					}
				}
				return max;
			}
			return 100;
		}

		$scope.getAdvs = function() {	
			clearInterval(advLoadInterval);
			advLoadPercentage = 20;

			advLoadInterval = setInterval(function() {
				$scope.advLoadPercentage = $scope.advLoadPercentage < 49 ? $scope.advLoadPercentage + 1 : 49; 
				$scope.$apply();
			}, 50);

			TagService.getAdvs().then(function(data) {
				console.log('getAdvs: ', data);
				
				if(angular.isArray(data)) {
					data.forEach(function(element, index, array) {
						element.value = element.value + 0.3 * (Math.random() - 0.5);
					});
				}
				$scope.advs = data;


				setTimeout(function() {
					console.log('1s after getTags data: ', data);

					$scope.advLoadPercentage = 100;
					clearInterval(advLoadInterval);
					// $scope.completeSection(3);
					$scope.$apply();		
				}, 1000);
			});
		}


		$scope.inputRandomImage = function() {
			// $scope.imgUrl = null;
			$scope.imgUrl = RandomImageGenerator.getShaopengUrl();
			// $scope.$apply();

		}

		
		$rootScope.$on('ImageStartToLoad', function(event, imgNewSrc) {
			$scope.resetAll(true);
			$scope.imageLoadPercentage = 0;
			console.log('ImageStartToLoad');

			clearInterval(imgLoadInterval);
			imgLoadInterval = setInterval(function() {
				$scope.imageLoadPercentage = $scope.imageLoadPercentage < 49 ? $scope.imageLoadPercentage + 1 : 49; 
				$scope.$apply();
			}, 500);

			console.log('imgLoadInterval: ' + imgLoadInterval);

		});

		$rootScope.$on('ImageLoaded', function(event, imgTarget) {
			clearInterval(imgLoadInterval);
			$scope.imageLoadPercentage = 100;
			$scope.completeSection(1);

			$scope.$apply();
		});

	}]);


appModule.service('TagService', ['$http', '$rootScope', function ($http, $rootScope) {
	var that = this;

	this.getTags = function() {
		var promise = $http.get('api/tags.json').then(function(response) {
			return response.data;
		});
		return promise;
	}

	this.getAdvs = function() {
		var promise = $http.get('api/advs.json').then(function(response) {
			return response.data;
		});
		return promise;
	}

	this.loadSkills = function(INSkills) {
		that.skills = INSkills;
	}

	this.loadProfile = function(INProfile) {
		that.profile = INProfile;
		that.positions = groupPositionByYear(INProfile.positions);		
		$rootScope.$broadcast('PROFILE', null)
	}

	function groupPositionByYear(INPositions) {
		var positions = INPositions.values || [];
		if(angular.isArray(positions)) {
			var a = [];
			var even = 0;
			positions.forEach(function(position, index, array) {
				
				if (a.length === 0) {
					//push this year first
					if(position.startDate.year !== new Date().getFullYear()) {
						a.push({mark: new Date().getFullYear()});
					}
					//on the first position, push a year mark first
					a.push({mark: position.startDate.year});
					position.even = even;
					a.push(position);
					even = 1 - even;
				}
				else {
					//second one and on, compare with the previous one,					
					var lastPosition = a[a.length - 1];
					//if it starts in the new year, then push a year mark first
					if (lastPosition.startDate.year !== position.startDate.year) {
						a.push({mark: position.startDate.year});

					}
					//if it is in the same year, just push the position
					position.even = even;
					a.push(position);
					even = 1 - even;
				}
			});

			return a;
		}
	}
	
}]);

appModule.factory('RandomImageGenerator', [function () {
	

	return {

		getUrl: function() {
			return 'http://lorempixel.com/1024/768/cats/?dummy=' + Math.random();
		},

		getShaopengUrl: function() {
			return 'http://shaopeng.us/images/banner800.jpg?' + Math.random();
		}

	};
}])

appModule.directive('loadProgressIcon', [function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			iconclass: '@', 
			progress: '@', 
			reverse: '@'
		},
		template: '<div class="glyph-progress">	\
		<div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>	\
		<div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}" style="height: {{reverse && progress || (100 - progress)}}%"><span class="{{iconclass}}"></span></div>	\
		</div>',
		link: function (scope, iElement, iAttrs) {
			
		}
	};
}])

appModule.directive('fadeInOnLoad', ['$rootScope', function ($rootScope) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {


			attrs.$observe('ngSrc', function(value) {
				console.log('observe ' + value);
				if(value) {
					$rootScope.$broadcast('ImageStartToLoad', value);	
				}
				
			});

			element.on('load', function(e){
				console.log('load', e);
				$rootScope.$broadcast('ImageLoaded', e.target);
			});


		}
	};
}]);

appModule.filter('intToMonth', function(){
	return function(input) {
		var map = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		input = parseInt(input);
		if (input > 0 && input < 13) {
			return map[input - 1];
		}
		return '';
	}
});

appModule.filter('forHowLong', function(){
	return function(position) {
		if (position.isCurrent) {
			// return 'till now'
			var now = new Date();

			position.endDate = {
				year: now.getFullYear(),
				month: now.getMonth() + 1
			}
		}
		
		if (position.startDate && position.endDate) {
			var yearLong = position.endDate.year - position.startDate.year,
				monthLong = position.endDate.month - position.startDate.month;
			
			if (monthLong < 0) {
				var totalLongInMonth = yearLong * 12 + monthLong;
				yearLong = Math.floor(totalLongInMonth / 12);
				monthLong = 12 + monthLong;
			}

			var yearUnit = yearLong > 1 ? 'years' : 'year',
				monthUnit = monthLong > 1 ? 'months' : 'month';

			var yearString = yearLong > 0 ? yearLong + ' ' + yearUnit + ' ' : '',
				monthString = monthLong > 0? monthLong + ' ' + monthUnit : '';

			var wholeString = yearString + monthString;

			return wholeString;
		}
		return '';
	}
});

appModule.directive('breakAtNumber', [function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			content: '@'
		},
		link: function (scope, element, attrs) {

			//linkedin API will remove line breaks, here we add them back in before "...(n)" where n > 1
			attrs.$observe('content', function(value){
				var htmlString = value.replace(/\s+\(\d*\)/g, function(v) {
					return ' <br>' + v;
				});
				element.html(htmlString);
			});		
				
		}
	};
}]);
