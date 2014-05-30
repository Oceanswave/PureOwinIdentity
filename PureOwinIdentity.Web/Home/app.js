angular.module('app', ['security', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.router', 'kendo.directives'])
.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
    .state('Home', {
        url: "/",
        views: {
            "navbar": {
                templateUrl: "/navbar.html"
            },
            "pageContent": {
                templateUrl: "/home.html"
            }
        }
    })
    .state('AboutUs', {
        url: "/AboutUs",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/AboutUs",
            }
        }
    })
    .state('SignUp', {
        url: "/SignUp",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/SignUp",
                controller: "SignUpCtrl"
            }
        }
    })
    .state('SignIn', {
        url: "/SignIn",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/SignIn",
                controller: "SignInCtrl"
            }
        }
    })
    .state('RegisterExternal', {
        url: "/RegisterExternal",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
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
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/ManageProfile",
                controller: "ManageProfileCtrl"
            }
        }
    })
    .state('CreateApp', {
        url: "/CreateApp",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/CreateApp",
                controller: "CreateAppCtrl"
            }
        }
    })
    .state('QuickStart', {
        url: "/QuickStart",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/QuickStart"
            }
        }
    })
    .state('Fiddle', {
        url: "/Fiddle",
        views: {
            "navbar": {
                templateUrl: "/FiddleNavBar",
                controller: "FiddleNavbarCtrl"
            },
            "pageContent": {
                templateUrl: "/Fiddle",
                controller: "FiddleCtrl"
            }
        }
    })
    .state('NotFound', {
        url: "/NotFound",
        views: {
            "navbar": {
                templateUrl: "/StandardNavBar"
            },
            "pageContent": {
                templateUrl: "/NotFound"
            }
        }
    });
}]).run(['$rootScope', 'security', '$state', function ($rootScope, security, $state) {

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

    $rootScope.getFooterHeight = function () {
        return jQuery("#footerWrapper").height();
    }
}]);