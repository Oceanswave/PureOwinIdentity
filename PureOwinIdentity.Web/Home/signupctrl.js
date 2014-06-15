angular.module('app')
.controller('SignUpCtrl', ['$scope', 'security', function ($scope, security) {
    security.redirectAuthenticated('/');
    var user = function () {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    };

    $scope.registrationState = null;

    $scope.user = new user();
    $scope.join = function () {
        if (!$scope.signUpForm.$valid)
            return;

        $scope.registrationState = null;

        $scope.message = "Processing Registration...";
        security.register(angular.copy($scope.user)).then(function () {
            //Success
            $scope.message = null;
        }, function (data) {
            //Failed
            $scope.registrationState = data.modelState;
            $scope.message = null;
        });
    };
}]);