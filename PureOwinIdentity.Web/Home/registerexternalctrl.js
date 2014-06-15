angular.module('app')
.controller('RegisterExternalCtrl', ['$scope', 'security', function ($scope, Security) {

    if (!Security.externalUser)
        Security.authenticate();

    Security.redirectAuthenticated('/');

    $scope.registrationState = null;

    $scope.registerExternalUser = function () {
        if (!$scope.registerForm.$valid)
            return;

        $scope.registrationState = null;

        $scope.message = "Processing Login...";
        Security.registerExternal().then(function() {
            //Succeeded.
            $scope.message = null;
        }, function (data) {
            //Failed
            $scope.registrationState = data.modelState;
            $scope.message = null;
        });
    }
}]);