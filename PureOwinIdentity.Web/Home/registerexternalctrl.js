angular.module('app')
.controller('RegisterExternalCtrl', ['$scope', 'security', function ($scope, security) {

    if (!security.externalUser)
        security.authenticate();

    security.redirectAuthenticated('/');

    $scope.registrationState = null;

    $scope.registerExternalUser = function () {
        if (!$scope.registerForm.$valid)
            return;

        $scope.registrationState = null;

        $scope.message = "Processing Login...";
        security.registerExternal().then(function() {
            //Succeeded.
            $scope.message = null;
        }, function (data) {
            //Failed
            $scope.registrationState = data.modelState;
            $scope.message = null;
        });
    }
}]);