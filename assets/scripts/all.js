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

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', 
    function ($scope, $rootScope, TagService) {

        var linkedInId = getUrlVars()['view'] === 'shaopeng' && 'shaopeng' || 'me';
        var publicProfileUrl = encodeURIComponent('www.linkedin.com/in/shaopengzhang/');

        if(linkedInId === 'me') {
            $scope.staticApp = false;
            //$scope.getLinkedInData() will be called by loadData onAuth linkedIn handler
        }
        else if(linkedInId === 'shaopeng'){
            $scope.staticApp = true;
            getStaticData();
        } 

        //iphone: landspace 568x212, vertical 320x460
        $scope.possiblyOnMobile = window.innerWidth <= 568;

        $scope.getLinkedInData = function() {
            IN.API.Profile()
            .ids(linkedInId)
            .fields(['id', 'firstName', 'lastName', 'summary', 'educations', 'pictureUrls::(original)','headline','publicProfileUrl', 'skills', 'positions', 'projects'])
            .result(function(result) {
                console.log(result);
                profile = result.values[0];
                TagService.loadProfile(profile);
            });
        }

        function getStaticData() {
            TagService.loadProfile(null);
        }

        $scope.getPeopleData = function() {
            var rawUrl = '/people/id=' + linkedInId + ':(id,first-name,last-name,headline,picture-urls::(original),summary,educations,skills,positions,public-profile-url)';
            IN.API.Raw()
            .result(function(results) {
                console.log(results);
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
            //$scope.$apply(function() {
                $scope.loadPercentage.linkedIn = 100;
                $scope.completeSection(0);

                $scope.profile = TagService.profile;   
                $scope.summary = TagService.profile.summary;  
                $scope.educations = TagService.educations;   
                $scope.skills = TagService.skills;
                $scope.positions = TagService.positions;    
           // });
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

        // $scope.tagBaseHeight = function(value) {
        //     return Math.min(28, 8 + value * 32);
        // }

        $scope.completeSection = function(step) {
            $scope.completedSection = step;
        }


        $scope.scrollToSection = function(step) {
            //$('#step' + step).height(window.innerHeight);
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

    // this.SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';

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
        if(INProfile) {
            that.profile = INProfile;
            that.positions = groupPositionByYear(INProfile.positions);  

            that.skills = flattenSkills(INProfile.skills);
            that.educations = INProfile.educations.values;
            
            console.log(that.profile);
            getCompanyLogos(INProfile.positions).then(function(result){
                console.log(result);
                that.positions = groupPositionByYear(result);
                console.log(that.positions);
                // $rootScope.$broadcast('PROFILE_ALL', null);
            });

            $rootScope.$broadcast('PROFILE', null);
        }
        else if(INProfile === null) {
            $http.get('api/shaopeng_linkedin_profile.json').success(function(data){
                var INProfile = data;
                that.profile = INProfile;
                that.positions = groupPositionByYear(INProfile.positions);  

                that.skills = flattenSkills(INProfile.skills);
                that.educations = INProfile.educations.values;
                
                console.log(that.profile);
                that.positions = getStaticCompanyLogos(INProfile.positions);
                that.positions = groupPositionByYear(that.positions);
                console.log(that.positions);
                $rootScope.$broadcast('PROFILE', null);

                // $rootScope.$broadcast('PROFILE', null);
            });
        }
        
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

    function getStaticCompanyLogos(INPositions) {
        if(INPositions.values && angular.isArray(INPositions.values)) {
            for (var i = 0; i < INPositions.values.length; i++ ) {
                INPositions.values[i].logoUrl = that.companyUrlMap[INPositions.values[i].id];
            }
        }
        return INPositions;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlZGluLmpzIiwiYXBwLmpzIiwic2VydmljZS5qcyIsImhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZERhdGEoKSB7XHJcbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBCb2R5XCIpKS5zY29wZSgpLiRhcHBseShcclxuICAgICAgICBmdW5jdGlvbigkc2NvcGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmdldExpbmtlZEluRGF0YSgpO1xyXG4gICAgICAgIH0pO1xyXG59IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IDB9LCA0MDApO1xyXG4gICAgfSwgNDAwKTtcclxuICAgIFxyXG59KTtcclxuLy8gdmFyIFNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcclxudmFyIGFwcE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWdkZW1vJywgWyduZ1JvdXRlJ10pO1xyXG5cclxuYXBwTW9kdWxlLmNvbnRyb2xsZXIoJ0FwcENvbnRyb2xsZXInLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1RhZ1NlcnZpY2UnLCBcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsIFRhZ1NlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgdmFyIGxpbmtlZEluSWQgPSBnZXRVcmxWYXJzKClbJ3ZpZXcnXSA9PT0gJ3NoYW9wZW5nJyAmJiAnc2hhb3BlbmcnIHx8ICdtZSc7XHJcbiAgICAgICAgdmFyIHB1YmxpY1Byb2ZpbGVVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoJ3d3dy5saW5rZWRpbi5jb20vaW4vc2hhb3Blbmd6aGFuZy8nKTtcclxuXHJcbiAgICAgICAgaWYobGlua2VkSW5JZCA9PT0gJ21lJykge1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGljQXBwID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmdldExpbmtlZEluRGF0YSgpIHdpbGwgYmUgY2FsbGVkIGJ5IGxvYWREYXRhIG9uQXV0aCBsaW5rZWRJbiBoYW5kbGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobGlua2VkSW5JZCA9PT0gJ3NoYW9wZW5nJyl7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0aWNBcHAgPSB0cnVlO1xyXG4gICAgICAgICAgICBnZXRTdGF0aWNEYXRhKCk7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgLy9pcGhvbmU6IGxhbmRzcGFjZSA1Njh4MjEyLCB2ZXJ0aWNhbCAzMjB4NDYwXHJcbiAgICAgICAgJHNjb3BlLnBvc3NpYmx5T25Nb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA1Njg7XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRMaW5rZWRJbkRhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgSU4uQVBJLlByb2ZpbGUoKVxyXG4gICAgICAgICAgICAuaWRzKGxpbmtlZEluSWQpXHJcbiAgICAgICAgICAgIC5maWVsZHMoWydpZCcsICdmaXJzdE5hbWUnLCAnbGFzdE5hbWUnLCAnc3VtbWFyeScsICdlZHVjYXRpb25zJywgJ3BpY3R1cmVVcmxzOjoob3JpZ2luYWwpJywnaGVhZGxpbmUnLCdwdWJsaWNQcm9maWxlVXJsJywgJ3NraWxscycsICdwb3NpdGlvbnMnLCAncHJvamVjdHMnXSlcclxuICAgICAgICAgICAgLnJlc3VsdChmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBwcm9maWxlID0gcmVzdWx0LnZhbHVlc1swXTtcclxuICAgICAgICAgICAgICAgIFRhZ1NlcnZpY2UubG9hZFByb2ZpbGUocHJvZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0U3RhdGljRGF0YSgpIHtcclxuICAgICAgICAgICAgVGFnU2VydmljZS5sb2FkUHJvZmlsZShudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRQZW9wbGVEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciByYXdVcmwgPSAnL3Blb3BsZS9pZD0nICsgbGlua2VkSW5JZCArICc6KGlkLGZpcnN0LW5hbWUsbGFzdC1uYW1lLGhlYWRsaW5lLHBpY3R1cmUtdXJsczo6KG9yaWdpbmFsKSxzdW1tYXJ5LGVkdWNhdGlvbnMsc2tpbGxzLHBvc2l0aW9ucyxwdWJsaWMtcHJvZmlsZS11cmwpJztcclxuICAgICAgICAgICAgSU4uQVBJLlJhdygpXHJcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgLy8gUmVhZCBhIHBhZ2UncyBHRVQgVVJMIHZhcmlhYmxlcyBhbmQgcmV0dXJuIHRoZW0gYXMgYW4gYXNzb2NpYXRpdmUgYXJyYXkuXHJcbiAgICBmdW5jdGlvbiBnZXRVcmxWYXJzKClcclxuICAgIHtcclxuICAgICAgICB2YXIgdmFycyA9IFtdLCBoYXNoO1xyXG4gICAgICAgIHZhciBoYXNoZXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgIHZhcnMucHVzaChoYXNoWzBdKTtcclxuICAgICAgICAgICAgdmFyc1toYXNoWzBdXSA9IGhhc2hbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YXJzO1xyXG4gICAgfVxyXG59XSk7XHJcblxyXG5hcHBNb2R1bGUuY29udHJvbGxlcignVUlDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdUYWdTZXJ2aWNlJywgXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBUYWdTZXJ2aWNlKSB7XHJcbiAgICAgICAgJHNjb3BlLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9IFRhZ1NlcnZpY2UuU0hBT1BFTkdfTElOS0lFRElOX0lEO1xyXG4gICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZSA9IHtcclxuICAgICAgICAgICAgbGlua2VkSW46ICAgMCxcclxuICAgICAgICAgICAgc3VtbWFyeTogICAgMCxcclxuICAgICAgICAgICAgZWR1Y2F0aW9uczogMCxcclxuICAgICAgICAgICAgc2tpbGxzOiAgICAgMCxcclxuICAgICAgICAgICAgcG9zaXRpb25zOiAgMCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgaW1nTG9hZEludGVydmFsLCB0YWdMb2FkSW50ZXJ2YWwsIGFkdkxvYWRJbnRlcnZhbDtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZS5saW5rZWRJbiA9IDEwMDtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2ZpbGUgPSBUYWdTZXJ2aWNlLnByb2ZpbGU7ICAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3VtbWFyeSA9IFRhZ1NlcnZpY2UucHJvZmlsZS5zdW1tYXJ5OyAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZWR1Y2F0aW9ucyA9IFRhZ1NlcnZpY2UuZWR1Y2F0aW9uczsgICBcclxuICAgICAgICAgICAgICAgICRzY29wZS5za2lsbHMgPSBUYWdTZXJ2aWNlLnNraWxscztcclxuICAgICAgICAgICAgICAgICRzY29wZS5wb3NpdGlvbnMgPSBUYWdTZXJ2aWNlLnBvc2l0aW9uczsgICAgXHJcbiAgICAgICAgICAgLy8gfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignUFJPRklMRV9BTEwnLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUubGlua2VkSW5Mb2FkUGVyY2VudGFnZSA9IDEwMDtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlU2VjdGlvbigwKTtcclxuICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5maW5kU2Nob29sTG9nb1VybEZyb21Db21wYXkgPSBmdW5jdGlvbihzY2hvb2xOYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wYW55VXJsTWFwID0gVGFnU2VydmljZS5jb21wYW55VXJsTWFwO1xyXG4gICAgICAgICAgICBmb3IgKGtleSBpbiBjb21wYW55VXJsTWFwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29tcGFueSA9IGNvbXBhbnlVcmxNYXBba2V5XTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb29rIGZvcjogJywgY29tcGFueVVybE1hcFtrZXldKTtcclxuICAgICAgICAgICAgICAgIGlmKGNvbXBhbnkubmFtZSAmJiBjb21wYW55LmxvZ29VcmwgJiYgY29tcGFueS5uYW1lID09PSBzY2hvb2xOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhbnkubG9nb1VybDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuZGlzcGxheVNlY3Rpb25Db250ZW50ID0gZnVuY3Rpb24oc2VjdGlvbiwgY29udGVudFByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGVyY2VudGFnZVtjb250ZW50UHJvcGVydHldID0gMDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCRzY29wZVtjb250ZW50UHJvcGVydHldKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFBlcmNlbnRhZ2VbY29udGVudFByb3BlcnR5XSA9IDEwMDtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jb21wbGV0ZVNlY3Rpb24oc2VjdGlvbik7XHJcbiAgICAgICAgICAgICAgICAvLyAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5tYXhWYWx1ZSA9IGZ1bmN0aW9uKHRhZ3MpIHtcclxuICAgICAgICAgICAgaWYodGFncy5sZW5ndGggJiYgdGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF4ID0gLTk5OTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0YWdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ3NbaV0udmFsdWUgPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGFnc1tpXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAxMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS50d2lua2xlU3R5bGUgPSBmdW5jdGlvbih2YWx1ZSwgbG9hZFBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25TdHJpbmcgPSAndG9wIDAuNHMgZWFzZSAnICsgICh2YWx1ZSAqIDMpLnRvRml4ZWQoMikgKyAncycgKyAnLCcgKyAnb3BhY2l0eSAwLjRzIGVhc2UgJyArICB2YWx1ZSAqIDMgKyAncycgKyAnOyc7Ly8gKyAnLCcgKyAndHJhbnNmb3JtIDAuNHMgZWFzZSAnICsgJzsnO1xyXG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uRGVsYXlTdHJpbmcgPSAoMTAgKyB2YWx1ZSAqIDYpICsgJ3MnICsgJzsnOyBcclxuICAgICAgICAgICAgdmFyIHN0eWxlU3RyaW5nID0gJ2ZvbnQtc2l6ZTogJyArICgxNiArIHZhbHVlICogMTIpICsgJ3B4JyArICc7JyArXHJcbiAgICAgICAgICAgICdsaW5lLWhlaWdodDogJyArICcxLjUnICsgJzsnICtcclxuICAgICAgICAgICAgLyondG9wOiAnICsgKGxvYWRQZXJjZW50YWdlID09PSAxMDApICYmICcwJyB8fCAnMTBweCcgKyAnOycgKyovXHJcbiAgICAgICAgICAgICctd2Via2l0LXRyYW5zaXRpb246ICcgKyB0cmFuc2l0aW9uU3RyaW5nICtcclxuICAgICAgICAgICAgJy1tb3otdHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xyXG4gICAgICAgICAgICAndHJhbnNpdGlvbjogJyArIHRyYW5zaXRpb25TdHJpbmcgK1xyXG4gICAgICAgICAgICAnLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6ICcgKyBhbmltYXRpb25EZWxheVN0cmluZyArXHJcbiAgICAgICAgICAgICctbW96LWFuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nICtcclxuICAgICAgICAgICAgJ2FuaW1hdGlvbi1kZWxheTogJyArIGFuaW1hdGlvbkRlbGF5U3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0eWxlU3RyaW5nO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICRzY29wZS50YWdCYXNlSGVpZ2h0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIE1hdGgubWluKDI4LCA4ICsgdmFsdWUgKiAzMik7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAkc2NvcGUuY29tcGxldGVTZWN0aW9uID0gZnVuY3Rpb24oc3RlcCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29tcGxldGVkU2VjdGlvbiA9IHN0ZXA7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgJHNjb3BlLnNjcm9sbFRvU2VjdGlvbiA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICAgICAgICAgICAgLy8kKCcjc3RlcCcgKyBzdGVwKS5oZWlnaHQod2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBzY3JvbGxUb3A6ICQoJyNzdGVwJyArIHN0ZXApLm9mZnNldCgpLnRvcFxyXG4gICAgICAgICAgICB9LCA0MDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSBmdW5jdGlvbihpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgIGlmIChpZGVudGlmaWVyID09PSAnbGlua2VkSW4nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gICRzY29wZS5sb2FkUGVyY2VudGFnZVtpZGVudGlmaWVyXSA+IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5sb2FkUGVyY2VudGFnZVtpZGVudGlmaWVyXSA9PT0gMTAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XSk7XHJcblxyXG5cclxuIiwiYXBwTW9kdWxlLnNlcnZpY2UoJ1RhZ1NlcnZpY2UnLCBbJyRodHRwJywgJyRyb290U2NvcGUnLCAnJHEnLCBmdW5jdGlvbiAoJGh0dHAsICRyb290U2NvcGUsICRxKSB7XHJcbiAgICBcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAvLyB0aGlzLlNIQU9QRU5HX0xJTktJRURJTl9JRCA9ICdxQzcyZm1KR2xCJztcclxuXHJcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXAgPSB7fTtcclxuICAgIHRoaXMuY29tcGFueVVybE1hcFsxMDQzXSA9ICB7aWQ6IDEwNDMsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzMvMDA1LzA3Yi8wMGEvMDVkZWY0Mi5wbmdcIiwgbmFtZTogXCJTaWVtZW5zXCJ9O1xyXG4gICAgdGhpcy5jb21wYW55VXJsTWFwWzUwNzcyMF0gPSB7aWQ6IDUwNzcyMCwgbG9nb1VybDogXCJodHRwczovL21lZGlhLmxpY2RuLmNvbS9tcHIvbXByL3AvMy8wMDAvMDMyLzE0Yy8wZmFkNjM4LnBuZ1wiLCBuYW1lOiBcIkJlaWppbmcgSmlhb3RvbmcgVW5pdmVyc2l0eVwifSA7XHJcbiAgICB0aGlzLmNvbXBhbnlVcmxNYXBbMzQ2MV0gPSB7aWQ6IDM0NjEsIGxvZ29Vcmw6IFwiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vbXByL21wci9wLzcvMDAwLzJiNS8xYjMvMzdhZWVmZS5wbmdcIiwgbmFtZTogXCJVbml2ZXJzaXR5IG9mIFBpdHRzYnVyZ2hcIn07XHJcbiAgICBcclxuICAgIHRoaXMuZ2V0VGFncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAuZ2V0KCdhcGkvdGFncy5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdldFN0YXRpY0FkdnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCgnYXBpL2FkdnMuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2FkUHJvZmlsZSA9IGZ1bmN0aW9uKElOUHJvZmlsZSkge1xyXG4gICAgICAgIGlmKElOUHJvZmlsZSkge1xyXG4gICAgICAgICAgICB0aGF0LnByb2ZpbGUgPSBJTlByb2ZpbGU7XHJcbiAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihJTlByb2ZpbGUucG9zaXRpb25zKTsgIFxyXG5cclxuICAgICAgICAgICAgdGhhdC5za2lsbHMgPSBmbGF0dGVuU2tpbGxzKElOUHJvZmlsZS5za2lsbHMpO1xyXG4gICAgICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnByb2ZpbGUpO1xyXG4gICAgICAgICAgICBnZXRDb21wYW55TG9nb3MoSU5Qcm9maWxlLnBvc2l0aW9ucykudGhlbihmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcihyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5wb3NpdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdQUk9GSUxFX0FMTCcsIG51bGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnUFJPRklMRScsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKElOUHJvZmlsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS9zaGFvcGVuZ19saW5rZWRpbl9wcm9maWxlLmpzb24nKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgdmFyIElOUHJvZmlsZSA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnByb2ZpbGUgPSBJTlByb2ZpbGU7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdyb3VwUG9zaXRpb25CeVllYXIoSU5Qcm9maWxlLnBvc2l0aW9ucyk7ICBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGF0LnNraWxscyA9IGZsYXR0ZW5Ta2lsbHMoSU5Qcm9maWxlLnNraWxscyk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVkdWNhdGlvbnMgPSBJTlByb2ZpbGUuZWR1Y2F0aW9ucy52YWx1ZXM7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQucHJvZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc2l0aW9ucyA9IGdldFN0YXRpY0NvbXBhbnlMb2dvcyhJTlByb2ZpbGUucG9zaXRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRoYXQucG9zaXRpb25zID0gZ3JvdXBQb3NpdGlvbkJ5WWVhcih0aGF0LnBvc2l0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LnBvc2l0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ1BST0ZJTEUnLCBudWxsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZsYXR0ZW5Ta2lsbHMoSU5Ta2lsbHMpIHtcclxuICAgICAgICB2YXIgc2tpbGxzID0gSU5Ta2lsbHMudmFsdWVzIHx8IFtdO1xyXG4gICAgICAgIHZhciBhID0gW107XHJcblxyXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShza2lsbHMpKXtcclxuICAgICAgICAgICAgc2tpbGxzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICBpZihlbGVtZW50LnNraWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBlbGVtZW50LnNraWxsLm5hbWUsIHZhbHVlOiBNYXRoLnJhbmRvbSgpfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGljQ29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XHJcbiAgICAgICAgaWYoSU5Qb3NpdGlvbnMudmFsdWVzICYmIGFuZ3VsYXIuaXNBcnJheShJTlBvc2l0aW9ucy52YWx1ZXMpKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgSU5Qb3NpdGlvbnMudmFsdWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICAgICAgSU5Qb3NpdGlvbnMudmFsdWVzW2ldLmxvZ29VcmwgPSB0aGF0LmNvbXBhbnlVcmxNYXBbSU5Qb3NpdGlvbnMudmFsdWVzW2ldLmlkXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gSU5Qb3NpdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXN5bmNMb2dvVXJsKGlkKSB7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgaWYodGhhdC5jb21wYW55VXJsTWFwW2lkXSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHRoYXQuY29tcGFueVVybE1hcFtpZF07XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZYXkhIFNhdmVkIG9uZSBBUEkgY2FsbCwgZm91bmQgY29tcGFueSBvYmplY3QgaW4gY2FjaGU6ICcsIHJlc3VsdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgSU4uQVBJLlJhdygnL2NvbXBhbmllcy9pZD0nICsgaWQgKyAnOihpZCxuYW1lLGxvZ28tdXJsKScpXHJcbiAgICAgICAgICAgIC5yZXN1bHQoZnVuY3Rpb24ocmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubG9nb1VybCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uLmxvZ29VcmwgPSByZXN1bHRzLmxvZ29Vcmw7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FzeW5jTG9nb1VybCcsIHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGFueVVybE1hcFtpZF0gPSByZXN1bHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0cyk7ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgICAgICAvL2luIGNhc2Ugb2YgbmV0d29yayBlcnJvciwgdGhyb3R0bGUsIGV0Yy5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2FzeW5jTG9nb1VybCBlcnJvcjogJywgYW5ndWxhci50b0pzb24oZXJyb3IsIHRydWUpKVxyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q29tcGFueUxvZ29zKElOUG9zaXRpb25zKSB7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IElOUG9zaXRpb25zLnZhbHVlcyB8fCBbXTtcclxuICAgICAgICB2YXIgYiA9IFtdO1xyXG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXJyYXkpIHtcclxuICAgICAgICAgICAgaWYocG9zaXRpb24uY29tcGFueSAmJiBwb3NpdGlvbi5jb21wYW55LmlkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGFzeW5jTG9nb1VybChwb3NpdGlvbi5jb21wYW55LmlkKTtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdQcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sb2dvVXJsID0gc3VjY2Vzcy5sb2dvVXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYi5wdXNoKG5ld1Byb21pc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRxLmFsbChiKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnLS0tYWxsLS0tJywgcmVzdWx0KTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJy0tLWFsbC0tLScsIGFuZ3VsYXIudG9Kc29uKHJlc3VsdCwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdyb3VwUG9zaXRpb25CeVllYXIocG9zaXRpb25zQXJyYXkpIHtcclxuICAgICAgICB2YXIgcG9zaXRpb25zID0gW107XHJcblxyXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnNBcnJheSkpIHtcclxuICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zQXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYocG9zaXRpb25zQXJyYXkudmFsdWVzICYmIGFuZ3VsYXIuaXNBcnJheShwb3NpdGlvbnNBcnJheS52YWx1ZXMpKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9uc0FycmF5LnZhbHVlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGEgPSBbXTtcclxuXHJcbiAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHBvc2l0aW9ucykpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBldmVuID0gMDtcclxuICAgICAgICAgICAgcG9zaXRpb25zLmZvckVhY2goZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBhcnJheSkge1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3B1c2ggdGhpcyB5ZWFyIGZpcnN0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goe21hcms6IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBwb3NpdGlvbiwgcHVzaCBhIHllYXIgbWFyayBmaXJzdFxyXG4gICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5ldmVuID0gZXZlbjtcclxuICAgICAgICAgICAgICAgICAgICBhLnB1c2gocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW4gPSAxIC0gZXZlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9uZSBhbmQgb24sIGNvbXBhcmUgd2l0aCB0aGUgcHJldmlvdXMgb25lLCAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQb3NpdGlvbiA9IGFbYS5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0IHN0YXJ0cyBpbiB0aGUgbmV3IHllYXIsIHRoZW4gcHVzaCBhIHllYXIgbWFyayBmaXJzdFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UG9zaXRpb24uc3RhcnREYXRlLnllYXIgIT09IHBvc2l0aW9uLnN0YXJ0RGF0ZS55ZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucHVzaCh7bWFyazogcG9zaXRpb24uc3RhcnREYXRlLnllYXJ9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBpdCBpcyBpbiB0aGUgc2FtZSB5ZWFyLCBqdXN0IHB1c2ggdGhlIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uZXZlbiA9IGV2ZW47XHJcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBldmVuID0gMSAtIGV2ZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG59XHJcbnJldHVybiBhO1xyXG59XHJcblxyXG59XSk7IiwiXHJcblxyXG5hcHBNb2R1bGUuZGlyZWN0aXZlKCdsb2FkUHJvZ3Jlc3NJY29uJywgW2Z1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIGljb25jbGFzczogJ0AnLCBcclxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICdAJywgXHJcbiAgICAgICAgICAgIHJldmVyc2U6ICdAJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ2x5cGgtcHJvZ3Jlc3NcIiBuZy1jbGFzcz1cIntcXCdyZXZlcnNlXFwnOiByZXZlcnNlfVwiPiBcXFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnZmdcXCc6IHJldmVyc2UsIFxcJ2JnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgIFxcXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxyXG4gICAgICAgIDwvZGl2PicsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3Byb2dyZXNzJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZFByb2dyZXNzSWNvbi5wcm9ncmVzcyA9ICcsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZihwYXJzZUludChuZXdWYWx1ZSkgPT09IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbG9hZGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwxMDApXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKHBhcnNlSW50KG5ld1ZhbHVlKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnbG9hZGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7XHJcblxyXG4gLyp0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJnbHlwaC1wcm9ncmVzc1wiPiBcXFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIgdmlldy1wb3J0XCIgbmctY2xhc3M9XCJ7XFwnZmdcXCc6IHJldmVyc2UsIFxcJ2JnXFwnOiAhcmV2ZXJzZX1cIj48c3BhbiBjbGFzcz1cInt7aWNvbmNsYXNzfX1cIj48L3NwYW4+PC9kaXY+ICAgIFxcXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiB2aWV3LXBvcnRcIiBuZy1jbGFzcz1cIntcXCdiZ1xcJzogcmV2ZXJzZSwgXFwnZmdcXCc6ICFyZXZlcnNlfVwiIHN0eWxlPVwiaGVpZ2h0OiB7e3JldmVyc2UgJiYgcHJvZ3Jlc3MgfHwgKDEwMCAtIHByb2dyZXNzKX19JVwiPjxzcGFuIGNsYXNzPVwie3tpY29uY2xhc3N9fVwiPjwvc3Bhbj48L2Rpdj4gICBcXFxyXG4gICAgICAgIDwvZGl2PicsKi9cclxuXHJcblxyXG5hcHBNb2R1bGUuZmlsdGVyKCdpbnRUb01vbnRoJywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBtYXAgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XHJcbiAgICAgICAgaW5wdXQgPSBwYXJzZUludChpbnB1dCk7XHJcbiAgICAgICAgaWYgKGlucHV0ID4gMCAmJiBpbnB1dCA8IDEzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXBbaW5wdXQgLSAxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmFwcE1vZHVsZS5maWx0ZXIoJ2Zvckhvd0xvbmcnLCBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgaWYgKHBvc2l0aW9uLmlzQ3VycmVudCkge1xyXG4gICAgICAgICAgICAvLyByZXR1cm4gJ3RpbGwgbm93J1xyXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLmVuZERhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBub3cuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICAgICAgICAgIG1vbnRoOiBub3cuZ2V0TW9udGgoKSArIDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAocG9zaXRpb24uc3RhcnREYXRlICYmIHBvc2l0aW9uLmVuZERhdGUpIHtcclxuICAgICAgICAgICAgdmFyIHllYXJMb25nID0gcG9zaXRpb24uZW5kRGF0ZS55ZWFyIC0gcG9zaXRpb24uc3RhcnREYXRlLnllYXIsXHJcbiAgICAgICAgICAgIG1vbnRoTG9uZyA9IHBvc2l0aW9uLmVuZERhdGUubW9udGggLSBwb3NpdGlvbi5zdGFydERhdGUubW9udGg7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAobW9udGhMb25nIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsTG9uZ0luTW9udGggPSB5ZWFyTG9uZyAqIDEyICsgbW9udGhMb25nO1xyXG4gICAgICAgICAgICAgICAgeWVhckxvbmcgPSBNYXRoLmZsb29yKHRvdGFsTG9uZ0luTW9udGggLyAxMik7XHJcbiAgICAgICAgICAgICAgICBtb250aExvbmcgPSAxMiArIG1vbnRoTG9uZztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHllYXJVbml0ID0geWVhckxvbmcgPiAxID8gJ3llYXJzJyA6ICd5ZWFyJyxcclxuICAgICAgICAgICAgbW9udGhVbml0ID0gbW9udGhMb25nID4gMSA/ICdtb250aHMnIDogJ21vbnRoJztcclxuXHJcbiAgICAgICAgICAgIHZhciB5ZWFyU3RyaW5nID0geWVhckxvbmcgPiAwID8geWVhckxvbmcgKyAnICcgKyB5ZWFyVW5pdCArICcgJyA6ICcnLFxyXG4gICAgICAgICAgICBtb250aFN0cmluZyA9IG1vbnRoTG9uZyA+IDA/IG1vbnRoTG9uZyArICcgJyArIG1vbnRoVW5pdCA6ICcnO1xyXG5cclxuICAgICAgICAgICAgdmFyIHdob2xlU3RyaW5nID0geWVhclN0cmluZyArIG1vbnRoU3RyaW5nICsgKHBvc2l0aW9uLmlzQ3VycmVudCA/ICcgdGlsbCBub3cnIDogJycpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdob2xlU3RyaW5nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2JyZWFrQXROJywgW2Z1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdAJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG5cclxuICAgICAgICAgICAgLy9saW5rZWRpbiBBUEkgd2lsbCByZW1vdmUgbGluZSBicmVha3MsIGhlcmUgd2UgYWRkIHRoZW0gYmFjayBpbiBiZWZvcmUgXCIuLi4obilcIiB3aGVyZSBuID4gMVxyXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnY29udGVudCcsIGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgICAgICAgIC8vIHZhciBodG1sU3RyaW5nID0gdmFsdWUucmVwbGFjZSgvXFxzK1xcKFxcZCpcXCkvZywgZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiAnIDxicj4nICsgdjtcclxuICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICB2YXIgaHRtbFN0cmluZyA9IHZhbHVlLnJlcGxhY2UoL1xcbi9nLCBmdW5jdGlvbih2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyA8YnI+JztcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbFN0cmluZyk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibWFza1wiPjwvZGl2PicpO1xyXG4gICAgICAgIH0pOyAgICAgXHJcblxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKTtcclxuXHJcbmFwcE1vZHVsZS5kaXJlY3RpdmUoJ2NsaWNrQWRkQ2xhc3MnLCBbZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIHRvZ2dsZWNsYXNzOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2V4cGFuZGVkJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pO1xyXG5cclxuYXBwTW9kdWxlLmRpcmVjdGl2ZSgndmlzaWJsZU9uTWFyaycsIFtmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgbWFyazogJ0AnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnbWFyaycsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgPT09ICd0cnVlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygndmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1dKVxyXG5cclxuXHJcbi8qYXBwTW9kdWxlLmRpcmVjdGl2ZSgndHdpbmtsZVRhZycsIFtmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgbmFtZTogJ0AnLCBcclxuICAgICAgICAgICAgdmFsdWU6ICdAJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndHdpbmtsZVRhZycsIHNjb3BlLm5hbWUsIHNjb3BlLnZhbHVlKTtcclxuICAgICAgICAgICAgdmFyIG5hbWUgPSBzY29wZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzY29wZS52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnZm9udC1zaXplJzogKDE2ICsgc2tpbGwudmFsdWUgKiAyNCkgKyAncHgnLCBcclxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxLjUnLCBcclxuICAgICAgICAgICAgICAgICd0cmFuc2l0aW9uJzogJ3RvcCAwLjRzIGVhc2UgJyArICAoc2tpbGwudmFsdWUpICogMyArICdzJyArICcsJyArICdvcGFjaXR5IDAuNHMgZWFzZSAnICsgIHNraWxsLnZhbHVlICogMyArICdzJyArICcsJyArICd0cmFuc2Zvcm0gMC40cyBlYXNlICcsIFxyXG4gICAgICAgICAgICAgICAgJ3RvcCc6IChsb2FkUGVyY2VudGFnZS5za2lsbHMgPT09IDEwMCkgJiYgJzAnIHx8ICcxMHB4JywgXHJcbiAgICAgICAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogKDEwICsgc2tpbGwudmFsdWUgKiA2KSArICdzJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pKi8iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=