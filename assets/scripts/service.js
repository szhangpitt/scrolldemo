appModule.service('TagService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    
    var that = this;

    this.SHAOPENG_LINKIEDIN_ID = 'qC72fmJGlB';
    
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
        /*getCompanyLogos(INProfile.positions).then(function(result){
            console.log(result);
            that.positions = groupPositionByYear(result);
            console.log(that.positions);
            $rootScope.$broadcast('PROFILE_ALL', null);
        });*/

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