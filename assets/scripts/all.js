var appModule = angular.module('tagdemo', []);

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
			$scope.imgUrl = RandomImageGenerator.getUrl();
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


appModule.service('TagService', ['$http', function ($http) {
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
	
}]);

appModule.factory('RandomImageGenerator', [function () {
	

	return {

		getUrl: function() {
			return 'http://lorempixel.com/1024/768/cats/?dummy=' + Math.random();
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


$(document).ready(function(e) {
	$('.fold').on('click', function(e){
		$(this).addClass('toggled');
	});
});