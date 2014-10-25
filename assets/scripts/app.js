$(document).ready(function(){
    $("html,body").animate({scrollTop: 0}, 400);
});
var SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
var appModule = angular.module('tagdemo', []);

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', '$q', function ($scope, $rootScope, TagService, $q) {


    $scope.getLinkedInData = function() {
        IN.API.Profile()
        .ids(SHAOPENG_LINKIEDIN_ID)
        .fields(["id", "firstName", "lastName", 'summary', 'educations', "pictureUrl","headline","publicProfileUrl", 'skills', 'positions'])
        .result(function(result) {
            console.log(result);
            profile = result.values[0];

            TagService.loadProfile(profile);
        });

        $scope.$on('PROFILE', function(event, data) {
            $scope.$apply(function() {
                $scope.positions = TagService.positions;    
                $scope.profile = TagService.profile;   
                $scope.summary = TagService.profile.summary;  
                $scope.educations = TagService.educations;   
            });
        });
    }
}]);

appModule.controller('UIController', ['$scope', '$rootScope', 'TagService', 'RandomImageGenerator',
    function ($scope, $rootScope, TagService, RandomImageGenerator) {
        $scope.linkedInLoadPercentage = 0;
        $scope.imageLoadPercentage = 0;
        $scope.tagLoadPercentage = 0;
        $scope.advLoadPercentage = 0;
        $scope.jobLoadPercentage = 0;
        var imgLoadInterval, tagLoadInterval, advLoadInterval;

        $scope.visible = function(identifier) {
            /*if (identifier === 'progress') {
                return  $scope.imageLoadPercentage > 0;
            }
            else*/ if (identifier === 'image') {
                return $scope.imageLoadPercentage === 100;
            }
            else if (identifier === 'tag') {
                return $scope.tagLoadPercentage === 100;
            }
            else if (identifier === 'adv') {
                return $scope.advLoadPercentage === 100;
            }
            else if (identifier === 'jobs') {
                return $scope.jobLoadPercentage === 100;
            }
        }

        $scope.tagBaseHeight = function(value) {
            return Math.min(28, 16 + value * 32);
        }

        $scope.completeSection = function(step) {
            $scope.completedSection = step;
        }

        $scope.resetAll = function(exceptImgUrl) {
            $scope.completedSection = -1;
            
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

            if (TagService.educations){
                $scope.educations = TagService.educations;
                setTimeout(function() {
                    $scope.tagLoadPercentage = 100;
                    $scope.completeSection(2);
                    $scope.$apply();        
                }, 1000);
            }

            else {
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



        $scope.$on('PROFILE', function(event, data) {
            $scope.linkedInLoadPercentage = 100;
            $scope.completeSection(0);
            $scope.skills = TagService.skills;
        });

        $scope.$on('PROFILE_ALL', function(event, data) {
            $scope.linkedInLoadPercentage = 100;
            $scope.completeSection(0);
        });





        $scope.getAdvs = function() {   
            clearInterval(advLoadInterval);
            $scope.advLoadPercentage = 20;



            if (TagService.skills){
                $scope.skills = TagService.skills;
                setTimeout(function() {
                    $scope.advLoadPercentage = 100;
                    clearInterval(advLoadInterval);
                    $scope.completeSection(3);
                    $scope.$apply();        
                }, 1000);
            }

            else {
                TagService.getStaticAdvs().then(function(data) {
                    console.log('getStaticAdvs: ', data);

                    if(angular.isArray(data)) {
                        data.forEach(function(element, index, array) {
                            element.value = element.value + 0.3 * (Math.random() - 0.5);
                        });
                    }
                    $scope.advs = data;

                    setTimeout(function() {
                        $scope.advLoadPercentage = 100;
                        clearInterval(advLoadInterval);
                        $scope.completeSection(3);
                        $scope.$apply();        
                    }, 1000);
                });

            }
        }

        $scope.getJobs = function() {
            $scope.jobLoadPercentage = 20;

            if (TagService.positions){
                $scope.positions = TagService.positions;
                setTimeout(function() {
                    $scope.jobLoadPercentage = 100;
                    // clearInterval(advLoadInterval);
                    $scope.completeSection(4);
                    $scope.$apply();        
                }, 1000);
            }

        }


        $scope.inputRandomImage = function() {
            $scope.imgUrl = RandomImageGenerator.getShaopengUrl();
        }

        
        $rootScope.$on('ImageStartToLoad', function(event, imgNewSrc) {
            //$scope.resetAll(true);
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


appModule.service('TagService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    var that = this;

    this.getTags = function() {
        var promise = $http.get('api/tags.json').then(function(response) {
            return response.data;
        });
        return promise;
    }

    this.getStaticAdvs = function() {
        var promise = $http.get('api/advs.json').then(function(response) {
            return response.data;
        });
        return promise;
    }

    this.loadProfile = function(INProfile) {
        that.profile = INProfile;
        // that.positions = groupPositionByYear(INProfile.positions);  

        that.skills = flattenSkills(INProfile.skills);
        that.educations = INProfile.educations.values;
        
        console.log(that.positions);
        getCompanyLogos(INProfile.positions).then(function(result){
            console.log(result);
            that.positions = groupPositionByYear(result);
            console.log(that.positions);
            $rootScope.$broadcast('PROFILE_ALL', null);
        });

        $rootScope.$broadcast('PROFILE', null);
    }

    function flattenSkills(INSkills) {
        var skills = INSkills.values || [];
        var a = [];

        if(angular.isArray(skills)){
            skills.forEach(function(element, index, array) {
                if(element.skill) {
                    a.push({name: element.skill.name, value: Math.random()});
                }
            });
        }

        return a;
    }

    function asyncLogoUrl(id) {
        var deferred = $q.defer();

        IN.API.Raw('/companies/id=' + id + ':(id,name,logo-url)')
        .result(function(results) {
            if (results.logoUrl) {
                // position.logoUrl = results.logoUrl;
                deferred.resolve(results);
            }
            else {
                deferred.reject(results);    
            }
            
        });

        return deferred.promise;
    }

    function getCompanyLogos(INPositions) {
        var deferred = $q.defer();

        var positions = INPositions.values || [];
        var b = [];
        positions.forEach(function(position, index, array) {
            if(position.company && position.company.id) {
                var promise = asyncLogoUrl(position.company.id);
                var newPromise = promise.then(function(success) {
                    position.logoUrl = success.logoUrl;
                    return position;
                });
                b.push(newPromise);
            }
        });

        $q.all(b).then(function(result) {
            // console.log('---all---', result);
            // console.log('---all---', angular.toJson(result, true));
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    function groupPositionByYear(positionsArray) {
        var positions = positionsArray || [];
        var a = [];

        if(angular.isArray(positions)) {

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
}
return a;
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
        template: '<div class="glyph-progress"> \
        <div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>    \
        <div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}" style="height: {{reverse && progress || (100 - progress)}}%"><span class="{{iconclass}}"></span></div>   \
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

            var wholeString = yearString + monthString + (position.isCurrent ? ' till now' : '');

            return wholeString;
        }

        return '';
    }
});

appModule.directive('breakAtN', [function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            content: '@'
        },
        link: function (scope, element, attrs) {

            //linkedin API will remove line breaks, here we add them back in before "...(n)" where n > 1
            attrs.$observe('content', function(value){
                // var htmlString = value.replace(/\s+\(\d*\)/g, function(v) {
                //     return ' <br>' + v;
                // });
            var htmlString = value.replace(/\n/g, function(v) {
                return ' <br>';
            });

            element.html(htmlString);
            element.append('<div class="mask"></div>');
        });     

        }
    };
}]);

appModule.directive('clickAddClass', [function () {
    return {
        restrict: 'A',
        scope: {
            toggleclass: '@'
        },
        link: function (scope, element, attrs) {
            element.on('click', function(e){
                element.addClass('expanded');
            })
        }
    };
}])
