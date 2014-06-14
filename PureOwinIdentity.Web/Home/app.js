angular.module('app', ['security', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.router', 'kendo.directives'])
.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
    .state('Home', {
        url: "/",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/home"
            }
        }
    })
    .state('SignUp', {
        url: "/SignUp",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/signup",
                controller: "SignUpCtrl"
            }
        }
    })
    .state('SignIn', {
        url: "/SignIn",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/signin",
                controller: "SignInCtrl"
            }
        }
    })
    .state('RegisterExternal', {
        url: "/RegisterExternal",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/RegisterExternal",
                controller: "RegisterExternalCtrl"
            }
        }
    })
    .state('ManageProfile', {
        url: "/ManageProfile",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/ManageProfile",
                controller: "ManageProfileCtrl"
            }
        }
    })
    .state('NotFound', {
        url: "/NotFound",
        views: {
            "navbar": {
                templateUrl: "/navbar"
            },
            "pageContent": {
                templateUrl: "/NotFound"
            }
        }
    });
}])
    .run(['$rootScope', 'security', '$state', function ($rootScope, security, $state) {

        $rootScope.config = {
            showFooter: true
        };

        $rootScope.$safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $rootScope.security = security;

        $rootScope.goHome = function () {
            $state.go("Home");
        };

        $rootScope.getWrapperStyle = function () {
            return {
                "margin-bottom": $rootScope.getFooterHeight() * -1,
                "padding-bottom": $rootScope.getFooterHeight(),
            }
        };
    }]);