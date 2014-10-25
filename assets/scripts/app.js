$(document).ready(function(){
    $('html,body').animate({scrollTop: 0}, 400);
});
// var SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
var appModule = angular.module('tagdemo', []);

appModule.controller('AppController', ['$scope', '$rootScope', 'TagService', '$q', function ($scope, $rootScope, TagService, $q) {

    $scope.getLinkedInData = function() {
        IN.API.Profile()
        .ids(TagService.SHAOPENG_LINKIEDIN_ID)
        .fields(['id', 'firstName', 'lastName', 'summary', 'educations', 'pictureUrls::(original)','headline','publicProfileUrl', 'skills', 'positions', 'projects'])
        .result(function(result) {
            console.log(result);
            profile = result.values[0];

            TagService.loadProfile(profile);
        });
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
            $scope.$apply();
        });


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


