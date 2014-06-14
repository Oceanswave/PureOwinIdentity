angular.module('app')
.controller('SignInCtrl', ['$scope', 'security', function ($scope, security) {
    security.redirectAuthenticated('/');

    var loginModel = function () {
        return {
            username: '',
            password: '',
            rememberMe: false
        }
    };

    $scope.tokenError = null;

    $scope.user = new loginModel();
    $scope.login = function () {
        if (!$scope.loginForm.$valid)
            return;

        $scope.tokenError = null;

        $scope.message = "Processing Login...";
        security.login(angular.copy($scope.user)).then(function () {
            //Success
            $scope.message = null;
        }, function (data) {
            //Failed
            $scope.tokenError = data;
            $scope.message = null;
        });
    }
}]);