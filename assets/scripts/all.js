function loadData() {
    angular.element(document.getElementById("appBody")).scope().$apply(
        function($scope) {
            $scope.getLinkedInData();
        });
}
$(document).ready(function(){
    setTimeout(function(){
        $('html,body').animate({scrollTop: 0}, 400);
    }, 400);
    
});
// var SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
var appModule = angular.module('tagdemo', ['ngRoute']);

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', '$routeParams', function ($scope, $rootScope, TagService, $routeParams) {

    $scope.getLinkedInData = function() {
        var linkedInId = getUrlVars()['view'] === 'me' && 'me' || TagService.SHAOPENG_LINKIEDIN_ID;
        IN.API.Profile()
        .ids(linkedInId)
        .fields(['id', 'firstName', 'lastName', 'summary', 'educations', 'pictureUrls::(original)','headline','publicProfileUrl', 'skills', 'positions', 'projects'])
        .result(function(result) {
            console.log(result);
            profile = result.values[0];

            TagService.loadProfile(profile);
        });
    }

    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
}]);

appModule.controller('UIController', ['$scope', '$rootScope', 'TagService', 
    function ($scope, $rootScope, TagService) {
        $scope.SHAOPENG_LINKIEDIN_ID = TagService.SHAOPENG_LINKIEDIN_ID;
        $scope.loadPercentage = {
            linkedIn:   0,
            summary:    0,
            educations: 0,
            skills:     0,
            positions:  0,
        };

        var imgLoadInterval, tagLoadInterval, advLoadInterval;

        $scope.$on('PROFILE', function(event, data) {
            $scope.$apply(function() {
                $scope.loadPercentage.linkedIn = 100;
                $scope.completeSection(0);

                $scope.profile = TagService.profile;   
                $scope.summary = TagService.profile.summary;  
                $scope.educations = TagService.educations;   
                $scope.skills = TagService.skills;
                $scope.positions = TagService.positions;    
            });
        });

        $scope.$on('PROFILE_ALL', function(event, data) {
            $scope.linkedInLoadPercentage = 100;
            $scope.completeSection(0);
            //$scope.$apply();
        });

        $scope.findSchoolLogoUrlFromCompay = function(schoolName) {
            var companyUrlMap = TagService.companyUrlMap;
            for (key in companyUrlMap) {
                var company = companyUrlMap[key];
                console.log('look for: ', companyUrlMap[key]);
                if(company.name && company.logoUrl && company.name === schoolName) {
                    return company.logoUrl;
                }
            }
            return false;
        }

        $scope.displaySectionContent = function(section, contentProperty) {
            $scope.loadPercentage[contentProperty] = 0;
            
            if($scope[contentProperty]) {
                $scope.loadPercentage[contentProperty] = 100;
                $scope.completeSection(section);
                // $scope.$apply();
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
        
        $scope.twinkleStyle = function(value, loadPercentage) {
            var transitionString = 'top 0.4s ease ' +  (value * 3).toFixed(2) + 's' + ',' + 'opacity 0.4s ease ' +  value * 3 + 's' + ';';// + ',' + 'transform 0.4s ease ' + ';';
            var animationDelayString = (10 + value * 6) + 's' + ';'; 
            var styleString = 'font-size: ' + (16 + value * 12) + 'px' + ';' +
            'line-height: ' + '1.5' + ';' +
            /*'top: ' + (loadPercentage === 100) && '0' || '10px' + ';' +*/
            '-webkit-transition: ' + transitionString +
            '-moz-transition: ' + transitionString +
            'transition: ' + transitionString +
            '-webkit-animation-delay: ' + animationDelayString +
            '-moz-animation-delay: ' + animationDelayString +
            'animation-delay: ' + animationDelayString;

            return styleString;

        }

        $scope.tagBaseHeight = function(value) {
            return Math.min(28, 8 + value * 32);
        }

        $scope.completeSection = function(step) {
            $scope.completedSection = step;
        }


        $scope.scrollToSection = function(step) {
            $('html,body').animate({
                scrollTop: $('#step' + step).offset().top
            }, 400);
        }

        $scope.visible = function(identifier) {
            if (identifier === 'linkedIn') {
                return  $scope.loadPercentage[identifier] > 0;
            }

            else {
                return $scope.loadPercentage[identifier] === 100;
            }
        }


    }]);



appModule.service('TagService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    
    var that = this;

    this.SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';

    this.companyUrlMap = {};
    this.companyUrlMap[1043] =  {id: 1043, logoUrl: "https://media.licdn.com/mpr/mpr/p/3/005/07b/00a/05def42.png", name: "Siemens"};
    this.companyUrlMap[507720] = {id: 507720, logoUrl: "https://media.licdn.com/mpr/mpr/p/3/000/032/14c/0fad638.png", name: "Beijing Jiaotong University"} ;
    this.companyUrlMap[3461] = {id: 3461, logoUrl: "https://media.licdn.com/mpr/mpr/p/7/000/2b5/1b3/37aeefe.png", name: "University of Pittsburgh"};
    
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
        that.positions = groupPositionByYear(INProfile.positions);  

        that.skills = flattenSkills(INProfile.skills);
        that.educations = INProfile.educations.values;
        
        console.log(that.profile);
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

        if(that.companyUrlMap[id]) {
            var results = that.companyUrlMap[id];
            deferred.resolve(results);
            console.log('Yay! Saved one API call, found company object in cache: ', results);
        }
        else {
            IN.API.Raw('/companies/id=' + id + ':(id,name,logo-url)')
            .result(function(results) {
                if (results.logoUrl) {
                    // position.logoUrl = results.logoUrl;
                    console.log('asyncLogoUrl', results);
                    this.companyUrlMap[id] = results;
                    deferred.resolve(results);
                }
                else {
                    deferred.reject(results);    
                }
                
            })
            .error(function(error){
                //in case of network error, throttle, etc.
                console.error('asyncLogoUrl error: ', angular.toJson(error, true))
                deferred.reject(error);
            });            
        }


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
        var positions = [];
        if(angular.isArray(positionsArray)) {
            positions = positionsArray;
        }
        else if(positionsArray.values && angular.isArray(positionsArray.values)) {
            positions = positionsArray.values;
        }
        
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


appModule.directive('loadProgressIcon', [function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            iconclass: '@', 
            progress: '@', 
            reverse: '@'
        },
        template: '<div class="glyph-progress" ng-class="{\'reverse\': reverse}"> \
        <div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>    \
        <div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}"><span class="{{iconclass}}"></span></div>   \
        </div>',
        link: function (scope, element, attrs) {
            scope.$watch('progress', function(newValue, oldValue) {
                console.log('loadProgressIcon.progress = ', newValue, oldValue);
                if(parseInt(newValue) === 100) {
                    setTimeout(function(){
                        element.addClass('loaded');
                    },100)
                    
                }
                else if(parseInt(newValue) === 0) {
                    setTimeout(function(){
                        element.removeClass('loaded');
                    }, 100);
                    
                }
            })
        }
    };
}]);

 /*template: '<div class="glyph-progress"> \
        <div class=" view-port" ng-class="{\'fg\': reverse, \'bg\': !reverse}"><span class="{{iconclass}}"></span></div>    \
        <div class=" view-port" ng-class="{\'bg\': reverse, \'fg\': !reverse}" style="height: {{reverse && progress || (100 - progress)}}%"><span class="{{iconclass}}"></span></div>   \
        </div>',*/


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
}]);

appModule.directive('visibleOnMark', [function () {
    return {
        restrict: 'A',
        scope: {
            mark: '@'
        },
        link: function (scope, element, attrs) {
            scope.$watch('mark', function(newValue, oldValue) {
                if(newValue === 'true') {
                    setTimeout(function() {
                        element.addClass('visible');
                    }, 100);
                }
                else {
                    setTimeout(function() {
                        element.removeClass('visible');
                    }, 100);
                }
            });
        }
    };
}])


/*appModule.directive('twinkleTag', [function () {
    return {
        restrict: 'A',
        scope: {
            name: '@', 
            value: '@'
        },
        link: function (scope, element, attrs) {
            console.log('twinkleTag', scope.name, scope.value);
            var name = scope.name,
                value = parseInt(scope.value);

            element.css({
                'font-size': (16 + skill.value * 24) + 'px', 
                'line-height': '1.5', 
                'transition': 'top 0.4s ease ' +  (skill.value) * 3 + 's' + ',' + 'opacity 0.4s ease ' +  skill.value * 3 + 's' + ',' + 'transform 0.4s ease ', 
                'top': (loadPercentage.skills === 100) && '0' || '10px', 
                'animation-delay': (10 + skill.value * 6) + 's'
            });

        }
    };
}])*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZERhdGEoKSB7XG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwQm9keVwiKSkuc2NvcGUoKS4kYXBwbHkoXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSgpO1xuICAgICAgICB9KTtcbn0iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiAwfSwgNDAwKTtcbiAgICB9LCA0MDApO1xuICAgIFxufSk7XG4vLyB2YXIgU0hBT1BFTkdfTElOS0lFRElOX0lEID0gJ3FDNzJmbUpHbEInO1xudmFyIGFwcE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWdkZW1vJywgWyduZ1JvdXRlJ10pO1xuXG5hcHBNb2R1bGUuY29udHJvbGxlcignQXBwQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnVGFnU2VydmljZScsICckcm91dGVQYXJhbXMnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBUYWdTZXJ2aWNlLCAkcm91dGVQYXJhbXMpIHtcblxuICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxpbmtlZEluSWQgPSBnZXRVcmxWYXJzKClbJ3ZpZXcnXSA9PT0gJ21lJyAmJiAnbWUnIHx8IFRhZ1NlcnZpY2UuU0hBT1BFTkdfTElOS0lFRElOX0lEO1xuICAgICAgICBJTi5BUEkuUHJvZmlsZSgpXG4gICAgICAgIC5pZHMobGlua2VkSW5JZClcbiAgICAgICAgLmZpZWxkcyhbJ2lkJywgJ2ZpcnN0TmFtZScsICdsYXN0TmFtZScsICdzdW1tYXJ5JywgJ2VkdWNhdGlvbnMnLCAncGljdHVyZVVybHM6OihvcmlnaW5hbCknLCdoZWFkbGluZScsJ3B1YmxpY1Byb2ZpbGVVcmwnLCAnc2tpbGxzJywgJ3Bvc2l0aW9ucycsICdwcm9qZWN0cyddKVxuICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgIHByb2ZpbGUgPSByZXN1bHQudmFsdWVzWzBdO1xuXG4gICAgICAgICAgICBUYWdTZXJ2aWNlLmxvYWRQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZWFkIGEgcGFnZSdzIEdFVCBVUkwgdmFyaWFibGVzIGFuZCByZXR1cm4gdGhlbSBhcyBhbiBhc3NvY2lhdGl2ZSBhcnJheS5cbiAgICBmdW5jdGlvbiBnZXRVcmxWYXJzKClcbiAgICB7XG4gICAgICAgIHZhciB2YXJzID0gW10sIGhhc2g7XG4gICAgICAgIHZhciBoYXNoZXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICB2YXJzLnB1c2goaGFzaFswXSk7XG4gICAgICAgICAgICB2YXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFycztcbiAgICB9XG59XSk7XG5cbmFwcE1vZHVsZS5jb250cm9sbGVyKCdVSUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1RhZ1NlcnZpY2UnLCBcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBUYWdTZXJ2aWNlKSB7XG4gICAgICAgICRzY29wZS5TSEFPUEVOR19MSU5LSUVESU5fSUQgPSBUYWdTZXJ2aWNlLlNIQU9QRU5HX0xJTktJRURJTl9JRDtcbiAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlID0ge1xuICAgICAgICAgICAgbGlua2VkSW46ICAgMCxcbiAgICAgICAgICAgIHN1bW1hcnk6ICAgIDAsXG4gICAgICAgICAgICBlZHVjYXRpb25zOiAwLFxuICAgICAgICAgICAgc2tpbGxzOiAgICAgMCxcbiAgICAgICAgICAgIHBvc2l0aW9uczogIDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGltZ0xvYWRJbnRlcnZhbCwgdGFnTG9hZEludGVydmFsLCBhZHZMb2FkSW50ZXJ2YWw7XG5cbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZS5saW5rZWRJbiA9IDEwMDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uKDApO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2ZpbGUgPSBUYWdTZXJ2aWNlLnByb2ZpbGU7ICAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLnN1bW1hcnkgPSBUYWdTZXJ2aWNlLnByb2ZpbGUuc3VtbWFyeTsgIFxuICAgICAgICAgICAgICAgICRzY29wZS5lZHVjYXRpb25zID0gVGFnU2VydmljZS5lZHVjYXRpb25zOyAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5za2lsbHMgPSBUYWdTZXJ2aWNlLnNraWxscztcbiAgICAgICAgICAgICAgICAkc2NvcGUucG9zaXRpb25zID0gVGFnU2VydmljZS5wb3NpdGlvbnM7ICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJ1BST0ZJTEVfQUxMJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICRzY29wZS5saW5rZWRJbkxvYWRQZXJjZW50YWdlID0gMTAwO1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbigwKTtcbiAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZmluZFNjaG9vbExvZ29VcmxGcm9tQ29tcGF5ID0gZnVuY3Rpb24oc2Nob29sTmFtZSkge1xuICAgICAgICAgICAgdmFyIGNvbXBhbnlVcmxNYXAgPSBUYWdTZXJ2aWNlLmNvbXBhbnlVcmxNYXA7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBjb21wYW55VXJsTWFwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBhbnkgPSBjb21wYW55VXJsTWFwW2tleV07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvb2sgZm9yOiAnLCBjb21wYW55VXJsTWFwW2tleV0pO1xuICAgICAgICAgICAgICAgIGlmKGNvbXBhbnkubmFtZSAmJiBjb21wYW55LmxvZ29VcmwgJiYgY29tcGFueS5uYW1lID09PSBzY2hvb2xOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wYW55LmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmRpc3BsYXlTZWN0aW9uQ29udGVudCA9IGZ1bmN0aW9uKHNlY3Rpb24sIGNvbnRlbnRQcm9wZXJ0eSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQZXJjZW50YWdlW2NvbnRlbnRQcm9wZXJ0eV0gPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZigkc2NvcGVbY29udGVudFByb3BlcnR5XSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZVtjb250ZW50UHJvcGVydHldID0gMTAwO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgLy8gJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1heFZhbHVlID0gZnVuY3Rpb24odGFncykge1xuICAgICAgICAgICAgaWYodGFncy5sZW5ndGggJiYgdGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1heCA9IC05OTk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRhZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ3NbaV0udmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHRhZ3NbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50d2lua2xlU3R5bGUgPSBmdW5jdGlvbih2YWx1ZSwgbG9hZFBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uU3RyaW5nID0gJ3RvcCAwLjRzIGVhc2UgJyArICAodmFsdWUgKiAzKS50b0ZpeGVkKDIpICsgJ3MnICsgJywnICsgJ29wYWNpdHkgMC40cyBlYXNlICcgKyAgdmFsdWUgKiAzICsgJ3MnICsgJzsnOy8vICsgJywnICsgJ3RyYW5zZm9ybSAwLjRzIGVhc2UgJyArICc7JztcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25EZWxheVN0cmluZyA9ICgxMCArIHZhbHVlICogNikgKyAncycgKyAnOyc7IFxuICAgICAgICAgICAgdmFyIHN0eWxlU3RyaW5nID0gJ2ZvbnQtc2l6ZTogJyArICgxNiArIHZhbHVlICogMTIpICsgJ3B4JyArICc7JyArXG4gICAgICAgICAgICAnbGluZS1oZWlnaHQ6ICcgKyAnMS41JyArICc7JyArXG4gICAgICAgICAgICAvKid0b3A6ICcgKyAobG9hZFBlcmNlbnRhZ2UgPT09IDEwMCkgJiYgJzAnIHx8ICcxMHB4JyArICc7JyArKi9cbiAgICAgICAgICAgICctd2Via2l0LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICctbW96LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcbiAgICAgICAgICAgICd0cmFuc2l0aW9uOiAnICsgdHJhbnNpdGlvblN0cmluZyArXG4gICAgICAgICAgICAnLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnLW1vei1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXG4gICAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5OiAnICsgYW5pbWF0aW9uRGVsYXlTdHJpbmc7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZVN0cmluZztcblxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnRhZ0Jhc2VIZWlnaHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKDI4LCA4ICsgdmFsdWUgKiAzMik7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlZFNlY3Rpb24gPSBzdGVwO1xuICAgICAgICB9XG5cblxuICAgICAgICAkc2NvcGUuc2Nyb2xsVG9TZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjc3RlcCcgKyBzdGVwKS5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgIH0sIDQwMCk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IGZ1bmN0aW9uKGlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGlmIChpZGVudGlmaWVyID09PSAnbGlua2VkSW4nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbaWRlbnRpZmllcl0gPiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmxvYWRQZXJjZW50YWdlW2lkZW50aWZpZXJdID09PSAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfV0pO1xuXG5cbiIsImFwcE1vZHVsZS5zZXJ2aWNlKCdUYWdTZXJ2aWNlJywgWyckaHR0cCcsICckcm9vdFNjb3BlJywgJyRxJywgZnVuY3Rpb24gKCRodHRwLCAkcm9vdFNjb3BlLCAkcSkge1xuICAgIFxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMuU0hBT1BFTkdfTElOS0lFRElOX0lEID0gJ3FDNzJmbUpHbEInO1xuXG4gICAgdGhpcy5jb21wYW55VXJsTWFwID0ge307XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzEwNDNdID0gIHtpZDogMTA0MywgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvMy8wMDUvMDdiLzAwYS8wNWRlZjQyLnBuZ1wiLCBuYW1lOiBcIlNpZW1lbnNcIn07XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzUwNzcyMF0gPSB7aWQ6IDUwNzcyMCwgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvMy8wMDAvMDMyLzE0Yy8wZmFkNjM4LnBuZ1wiLCBuYW1lOiBcIkJlaWppbmcgSmlhb3RvbmcgVW5pdmVyc2l0eVwifSA7XG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzM0NjFdID0ge2lkOiAzNDYxLCBsb2dvVXJsOiBcImh0dHBzOi8vbWVkaWEubGljZG4uY29tL21wci9tcHIvcC83LzAwMC8yYjUvMWIzLzM3YWVlZmUucG5nXCIsIG5hbWU6IFwiVW5pdmVyc2l0eSBvZiBQaXR0c2J1cmdoXCJ9O1xuICAgIFxuICAgIHRoaXMuZ2V0VGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL3RhZ3MuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRTdGF0aWNBZHZzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAuZ2V0KCdhcGkvYWR2cy5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRQcm9maWxlID0gZnVuY3Rpb24oSU5Qcm9maWxlKSB7XG4gICAgICAgIHRoYXQucHJvZmlsZSA9IElOUHJvZmlsZTtcbiAgICAgICAgdGhhdC5wb3NpdGlvbnMgPSBncm91cFBvc2l0aW9uQnlZZWFyKElOUHJvZmlsZS5wb3NpdGlvbnMpOyAgXG5cbiAgICAgICAgdGhhdC5za2lsbHMgPSBmbGF0dGVuU2tpbGxzKElOUHJvZmlsZS5za2lsbHMpO1xuICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnByb2ZpbGUpO1xuICAgICAgICBnZXRDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucykudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihyZXN1bHQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFX0FMTCcsIG51bGwpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmbGF0dGVuU2tpbGxzKElOU2tpbGxzKSB7XG4gICAgICAgIHZhciBza2lsbHMgPSBJTlNraWxscy52YWx1ZXMgfHwgW107XG4gICAgICAgIHZhciBhID0gW107XG5cbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHNraWxscykpe1xuICAgICAgICAgICAgc2tpbGxzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC5za2lsbCkge1xuICAgICAgICAgICAgICAgICAgICBhLnB1c2goe25hbWU6IGVsZW1lbnQuc2tpbGwubmFtZSwgdmFsdWU6IE1hdGgucmFuZG9tKCl9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIFxuXG4gICAgZnVuY3Rpb24gYXN5bmNMb2dvVXJsKGlkKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYodGhhdC5jb21wYW55VXJsTWFwW2lkXSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGF0LmNvbXBhbnlVcmxNYXBbaWRdO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZYXkhIFNhdmVkIG9uZSBBUEkgY2FsbCwgZm91bmQgY29tcGFueSBvYmplY3QgaW4gY2FjaGU6ICcsIHJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgSU4uQVBJLlJhdygnL2NvbXBhbmllcy9pZD0nICsgaWQgKyAnOihpZCxuYW1lLGxvZ28tdXJsKScpXG4gICAgICAgICAgICAucmVzdWx0KGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sb2dvVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uLmxvZ29VcmwgPSByZXN1bHRzLmxvZ29Vcmw7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3luY0xvZ29VcmwnLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wYW55VXJsTWFwW2lkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0cyk7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgICAgIC8vaW4gY2FzZSBvZiBuZXR3b3JrIGVycm9yLCB0aHJvdHRsZSwgZXRjLlxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2FzeW5jTG9nb1VybCBlcnJvcjogJywgYW5ndWxhci50b0pzb24oZXJyb3IsIHRydWUpKVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IElOUG9zaXRpb25zLnZhbHVlcyB8fCBbXTtcbiAgICAgICAgdmFyIGIgPSBbXTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBhcnJheSkge1xuICAgICAgICAgICAgaWYocG9zaXRpb24uY29tcGFueSAmJiBwb3NpdGlvbi5jb21wYW55LmlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBhc3luY0xvZ29VcmwocG9zaXRpb24uY29tcGFueS5pZCk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1Byb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sb2dvVXJsID0gc3VjY2Vzcy5sb2dvVXJsO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYi5wdXNoKG5ld1Byb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkcS5hbGwoYikudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCctLS1hbGwtLS0nLCByZXN1bHQpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIGFuZ3VsYXIudG9Kc29uKHJlc3VsdCwgdHJ1ZSkpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBncm91cFBvc2l0aW9uQnlZZWFyKHBvc2l0aW9uc0FycmF5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHBvc2l0aW9uc0FycmF5KSkge1xuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zQXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihwb3NpdGlvbnNBcnJheS52YWx1ZXMgJiYgYW5ndWxhci5pc0FycmF5KHBvc2l0aW9uc0FycmF5LnZhbHVlcykpIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9uc0FycmF5LnZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGEgPSBbXTtcblxuICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkocG9zaXRpb25zKSkge1xuXG4gICAgICAgICAgICB2YXIgZXZlbiA9IDA7XG4gICAgICAgICAgICBwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbihwb3NpdGlvbiwgaW5kZXgsIGFycmF5KSB7XG5cblxuICAgICAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvL3B1c2ggdGhpcyB5ZWFyIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyICE9PSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgcG9zaXRpb24sIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHttYXJrOiBwb3NpdGlvbi5zdGFydERhdGUueWVhcn0pO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5ldmVuID0gZXZlbjtcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbiA9IDEgLSBldmVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9zZWNvbmQgb25lIGFuZCBvbiwgY29tcGFyZSB3aXRoIHRoZSBwcmV2aW91cyBvbmUsICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQb3NpdGlvbiA9IGFbYS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBzdGFydHMgaW4gdGhlIG5ldyB5ZWFyLCB0aGVuIHB1c2ggYSB5ZWFyIG1hcmsgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQb3NpdGlvbi5zdGFydERhdGUueWVhciAhPT0gcG9zaXRpb24uc3RhcnREYXRlLnllYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0IGlzIGluIHRoZSBzYW1lIHllYXIsIGp1c3QgcHVzaCB0aGUgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XG4gICAgICAgICAgICAgICAgICAgIGEucHVzaChwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBldmVuID0gMSAtIGV2ZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG59XG5yZXR1cm4gYTtcbn1cblxufV0pOyIsIlxuXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdsb2FkUHJvZ3Jlc3NJY29uJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgaWNvbmNsYXNzOiAnQCcsIFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICdAJywgXG4gICAgICAgICAgICByZXZlcnNlOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIiBuZy1jbGFzcz1cIntcXCdyZXZlcnNlXFwnOiByZXZlcnNlfVwiPiBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2JnXFwnOiByZXZlcnNlLCBcXCdmZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgIFxcXG4gICAgICAgIDwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgncHJvZ3Jlc3MnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZFByb2dyZXNzSWNvbi5wcm9ncmVzcyA9ICcsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYocGFyc2VJbnQobmV3VmFsdWUpID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sMTAwKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihwYXJzZUludChuZXdWYWx1ZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufV0pO1xuXG4gLyp0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJnbHlwaC1wcm9ncmVzc1wiPiBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2ZnXFwnOiByZXZlcnNlLCBcXCdiZ1xcJzogIXJldmVyc2V9XCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgICBcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiIHZpZXctcG9ydFwiIG5nLWNsYXNzPVwie1xcJ2JnXFwnOiByZXZlcnNlLCBcXCdmZ1xcJzogIXJldmVyc2V9XCIgc3R5bGU9XCJoZWlnaHQ6IHt7cmV2ZXJzZSAmJiBwcm9ncmVzcyB8fCAoMTAwIC0gcHJvZ3Jlc3MpfX0lXCI+PHNwYW4gY2xhc3M9XCJ7e2ljb25jbGFzc319XCI+PC9zcGFuPjwvZGl2PiAgIFxcXG4gICAgICAgIDwvZGl2PicsKi9cblxuXG5hcHBNb2R1bGUuZmlsdGVyKCdpbnRUb01vbnRoJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG1hcCA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXTtcbiAgICAgICAgaW5wdXQgPSBwYXJzZUludChpbnB1dCk7XG4gICAgICAgIGlmIChpbnB1dCA+IDAgJiYgaW5wdXQgPCAxMykge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFtpbnB1dCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59KTtcblxuYXBwTW9kdWxlLmZpbHRlcignZm9ySG93TG9uZycsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbi5pc0N1cnJlbnQpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiAndGlsbCBub3cnXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcG9zaXRpb24uZW5kRGF0ZSA9IHtcbiAgICAgICAgICAgICAgICB5ZWFyOiBub3cuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAgICAgICBtb250aDogbm93LmdldE1vbnRoKCkgKyAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChwb3NpdGlvbi5zdGFydERhdGUgJiYgcG9zaXRpb24uZW5kRGF0ZSkge1xuICAgICAgICAgICAgdmFyIHllYXJMb25nID0gcG9zaXRpb24uZW5kRGF0ZS55ZWFyIC0gcG9zaXRpb24uc3RhcnREYXRlLnllYXIsXG4gICAgICAgICAgICBtb250aExvbmcgPSBwb3NpdGlvbi5lbmREYXRlLm1vbnRoIC0gcG9zaXRpb24uc3RhcnREYXRlLm1vbnRoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobW9udGhMb25nIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbExvbmdJbk1vbnRoID0geWVhckxvbmcgKiAxMiArIG1vbnRoTG9uZztcbiAgICAgICAgICAgICAgICB5ZWFyTG9uZyA9IE1hdGguZmxvb3IodG90YWxMb25nSW5Nb250aCAvIDEyKTtcbiAgICAgICAgICAgICAgICBtb250aExvbmcgPSAxMiArIG1vbnRoTG9uZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHllYXJVbml0ID0geWVhckxvbmcgPiAxID8gJ3llYXJzJyA6ICd5ZWFyJyxcbiAgICAgICAgICAgIG1vbnRoVW5pdCA9IG1vbnRoTG9uZyA+IDEgPyAnbW9udGhzJyA6ICdtb250aCc7XG5cbiAgICAgICAgICAgIHZhciB5ZWFyU3RyaW5nID0geWVhckxvbmcgPiAwID8geWVhckxvbmcgKyAnICcgKyB5ZWFyVW5pdCArICcgJyA6ICcnLFxuICAgICAgICAgICAgbW9udGhTdHJpbmcgPSBtb250aExvbmcgPiAwPyBtb250aExvbmcgKyAnICcgKyBtb250aFVuaXQgOiAnJztcblxuICAgICAgICAgICAgdmFyIHdob2xlU3RyaW5nID0geWVhclN0cmluZyArIG1vbnRoU3RyaW5nICsgKHBvc2l0aW9uLmlzQ3VycmVudCA/ICcgdGlsbCBub3cnIDogJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gd2hvbGVTdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2JyZWFrQXROJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY29udGVudDogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcblxuICAgICAgICAgICAgLy9saW5rZWRpbiBBUEkgd2lsbCByZW1vdmUgbGluZSBicmVha3MsIGhlcmUgd2UgYWRkIHRoZW0gYmFjayBpbiBiZWZvcmUgXCIuLi4obilcIiB3aGVyZSBuID4gMVxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbnRlbnQnLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgLy8gdmFyIGh0bWxTdHJpbmcgPSB2YWx1ZS5yZXBsYWNlKC9cXHMrXFwoXFxkKlxcKS9nLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiAnIDxicj4nICsgdjtcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIHZhciBodG1sU3RyaW5nID0gdmFsdWUucmVwbGFjZSgvXFxuL2csIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyA8YnI+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgnPGRpdiBjbGFzcz1cIm1hc2tcIj48L2Rpdj4nKTtcbiAgICAgICAgfSk7ICAgICBcblxuICAgICAgICB9XG4gICAgfTtcbn1dKTtcblxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgnY2xpY2tBZGRDbGFzcycsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHRvZ2dsZWNsYXNzOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH07XG59XSk7XG5cbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ3Zpc2libGVPbk1hcmsnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtYXJrOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdtYXJrJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3Zpc2libGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XSlcblxuXG4vKmFwcE1vZHVsZS5kaXJlY3RpdmUoJ3R3aW5rbGVUYWcnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBuYW1lOiAnQCcsIFxuICAgICAgICAgICAgdmFsdWU6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndHdpbmtsZVRhZycsIHNjb3BlLm5hbWUsIHNjb3BlLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBuYW1lID0gc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHNjb3BlLnZhbHVlKTtcblxuICAgICAgICAgICAgZWxlbWVudC5jc3Moe1xuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAoMTYgKyBza2lsbC52YWx1ZSAqIDI0KSArICdweCcsIFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxLjUnLCBcbiAgICAgICAgICAgICAgICAndHJhbnNpdGlvbic6ICd0b3AgMC40cyBlYXNlICcgKyAgKHNraWxsLnZhbHVlKSAqIDMgKyAncycgKyAnLCcgKyAnb3BhY2l0eSAwLjRzIGVhc2UgJyArICBza2lsbC52YWx1ZSAqIDMgKyAncycgKyAnLCcgKyAndHJhbnNmb3JtIDAuNHMgZWFzZSAnLCBcbiAgICAgICAgICAgICAgICAndG9wJzogKGxvYWRQZXJjZW50YWdlLnNraWxscyA9PT0gMTAwKSAmJiAnMCcgfHwgJzEwcHgnLCBcbiAgICAgICAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogKDEwICsgc2tpbGwudmFsdWUgKiA2KSArICdzJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH07XG59XSkqLyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==