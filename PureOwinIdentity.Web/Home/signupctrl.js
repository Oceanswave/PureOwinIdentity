angular.module('app')
.controller('SignUpCtrl', ['$scope', 'security', '$modal', function ($scope, Security, $modal) {
    Security.redirectAuthenticated('/');
    var User = function () {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    };

    $scope.registrationState = null;

    $scope.user = new User();
    $scope.join = function () {
        if (!$scope.signUpForm.$valid)
            return;

        $scope.registrationState = null;

        $scope.message = "Processing Registration...";
        Security.register(angular.copy($scope.user)).then(function () {
            //Success
            $scope.message = null;
        }, function (data) {
            //Failed
            $scope.registrationState = data.modelState;
            $scope.message = null;
        });
    };
}]);