angular.module('security', ['ngRoute'])
.constant('security.urls', {
    site: 'http://localhost:80/',
    manage: '/manage',
    join: '//localhost:8081/api/account/register',
    login: '//localhost:8081/token',
    logout: '/api/account/logout',
    forgotPassword: '/api/account/forgotpassword',
    resetPassword: '/api/account/resetpassword',
    confirmEmail: '/api/account/confirmEmail',
    userInfo: '//localhost:8081/api/account/userInfo',
    changePassword: '/api/account/changePassword',
    externalLogins: '//localhost:8081/api/account/externalLogins',
    manageInfo: '/api/account/manageInfo',
    registerExternal: '//localhost:8081/api/account/registerExternal',
    addExternalLogin: '/api/account/addExternalLogin',
    removeLogin: '/api/account/removeLogin'
})
.factory('security.api', ['$http', 'security.urls', function ($http, apiUrls) {
    //Parameterize - Necessary for funky login expectations...
    var formdataHeader = { 'Content-Type': 'application/x-www-form-urlencoded' };
    var parameterize = function (data) {
        var param = function (obj) {
            var query = '';
            var fullSubName, innerObj, i;
            angular.forEach(obj, function (value, name) {
                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        var subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    angular.forEach(value, function (subValue, subName) {
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    });
                }
                else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            });

            return query.length ? query.substr(0, query.length - 1) : query;
        };
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    };

    var api = {
        getUserInfo: function (accessToken) {
            return $http({ url: apiUrls.userInfo, method: 'GET', headers: { 'Authorization': 'Bearer ' + accessToken } });
        },
        login: function (data) {
            return $http({ method: 'POST', url: apiUrls.login, data: parameterize(data), headers: formdataHeader });
        },
        logout: function () {
            return $http({ method: 'POST', url: apiUrls.logout });
        },
        register: function (data) {
            return $http({ method: 'POST', url: apiUrls.join, data: data });
        },
        forgotPassword: function (data) {
            return $http({ method: 'POST', url: apiUrls.forgotPassword, data: data });
        },
        resetPassword: function (data) {
            return $http({ method: 'POST', url: apiUrls.resetPassword, data: data });
        },
        confirmEmail: function (data) {
            return $http({ method: 'GET', url: apiUrls.confirmEmail + '?code=' + encodeURIComponent(data.code) + '&userId=' + encodeURIComponent(data.userId) });
        },
        changePassword: function (data) {
            return $http({ method: 'POST', url: apiUrls.changePassword, data: data });
        },
        getExternalLogins: function () {
            return $http({ method: 'GET', url: apiUrls.externalLogins + '?returnUrl=' + encodeURIComponent(apiUrls.site) + '&generateState=true', isArray: true });
        },
        manageInfo: function () {
            return $http({ method: 'GET', url: apiUrls.manageInfo + '?returnUrl=' + encodeURIComponent(apiUrls.site) + '&generateState=false' });
        },
        registerExternal: function (accessToken, data) {
            return $http({ method: 'POST', url: apiUrls.registerExternal, data: data, headers: { 'Authorization': 'Bearer ' + accessToken } });
        },
        addExternalLogin: function (accessToken, externalAccessToken) {
            return $http({ method: 'POST', url: apiUrls.addExternalLogin, data: { externalAccessToken: externalAccessToken }, headers: { 'Authorization': 'Bearer ' + accessToken } });
        },
        removeLogin: function (data) {
            return $http({ method: 'POST', url: apiUrls.removeLogin, data: data });
        }
    };

    return api;
}])
.provider('security', ['security.urls', function (apiUrls) {
    var securityProvider = this;
    //Options
    securityProvider.registerThenLogin = true;
    securityProvider.usePopups = false;
    securityProvider.states = {
        login: 'SignUp',
        registerExternal: 'RegisterExternal',
        postLogout: 'SignUp',
        home: 'Home'
    };
    securityProvider.apiUrls = apiUrls;
    securityProvider.events = {
        login: null,
        logout: null,
        register: null,
        reloadUser: null,
        closeOAuthWindow: null
    };

    securityProvider.$get = ['security.api', '$q', '$http', '$location', '$state', '$timeout', function (api, $q, $http, $location, $state, $timeout) {
        //Private Variables
        var externalLoginWindowTimer = null;

        //Private Methods
        var parseQueryString = function (queryString) {
            var data = {},
				pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

            if (queryString === null) {
                return data;
            }

            pairs = queryString.split("&");

            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i];
                separatorIndex = pair.indexOf("=");

                if (separatorIndex === -1) {
                    escapedKey = pair;
                    escapedValue = null;
                } else {
                    escapedKey = pair.substr(0, separatorIndex);
                    escapedValue = pair.substr(separatorIndex + 1);
                }

                key = decodeURIComponent(escapedKey);
                value = decodeURIComponent(escapedValue);

                data[key] = value;
            }

            return data;
        };
        var accessToken = function (accessToken, persist) {
            if (accessToken) {
                if (accessToken == 'clear') {
                    localStorage.removeItem('accessToken');
                    sessionStorage.removeItem('accessToken');
                    delete $http.defaults.headers.common.Authorization;
                } else {
                    if (persist) localStorage.accessToken = accessToken;
                    else sessionStorage.accessToken = accessToken;
                    $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
                }
            }
            return sessionStorage.accessToken || localStorage.accessToken;
        };
        var associating = function (newValue) {
            if (newValue == 'clear') {
                delete localStorage.associating;
                return null;
            }
            if (newValue) localStorage.associating = newValue;
            return localStorage.associating;
        };
        var redirectTarget = function (newTarget) {
            if (newTarget == 'clear') {
                delete localStorage.redirectTarget;
                return null;
            }
            if (newTarget) localStorage.redirectTarget = newTarget;
            return localStorage.redirectTarget;
        };
        var handleExternalData = function (externalData, provider, rememberMe) {
            var deferred = $q.defer();

            //Return if there was an error
            if (externalData.error) {
                deferred.reject({ message: externalData.error });
            } else {

                if (accessToken() && associating()) {
                    associating('clear');
                    redirectTarget('clear');
                    api.addExternalLogin(accessToken(), externalData.access_token).success(function () {
                        deferred.resolve();
                    });

                } else {
                    //Get user info and login or show external register screen
                    api.getUserInfo(externalData.access_token).success(function (user) {
                        if (user.hasRegistered) {
                            accessToken(externalData.access_token, rememberMe);
                            security.user = user;
                            security.redirectAuthenticated(redirectTarget() || $state.href(securityProvider.states.home));
                            if (securityProvider.events.login) securityProvider.events.login(security, user); // Your Login events
                            deferred.resolve(security.user);
                        } else {
                            security.externalUser = user;
                            security.externalUser.access_token = externalData.access_token;
                            security.externalUser.provider = provider;
                            if (rememberMe != null) localStorage.rememberMe = rememberMe;
                            $state.go(securityProvider.states.registerExternal);
                            deferred.reject();
                        }
                    });
                }
            }

            return deferred.promise;
        }
        var initialize = function () {
            //Check for external access token from 3rd party auth
            if ($location.path().indexOf('access_token') != -1) {
                var externalData = parseQueryString($location.path().substring(1));

                if (window.opener) {
                    window.opener.external_data = externalData;
                    window.close();
                } else {
                    var url = redirectTarget();
                    $location.path(url || $state.href(securityProvider.states.home));

                    var login = JSON.parse(localStorage.loginProvider);
                    var rememberMe = false;
                    if (localStorage.rememberMe) {
                        rememberMe = JSON.parse(localStorage.rememberMe);
                        delete localStorage.rememberMe;
                    }
                    delete localStorage.loginProvider;
                    handleExternalData(externalData, login, rememberMe);
                }
            }

            //Check for access token and get user info
            if (accessToken()) {
                accessToken(accessToken());
                api.getUserInfo(accessToken()).success(function (user) {
                    security.user = user;

                    if (securityProvider.events.reloadUser) securityProvider.events.reloadUser(security, user); // Your Register events
                });
            }

            //Fetch list of external logins
            api.getExternalLogins().success(function (logins) {
                security.externalLogins = logins;
            });


        };

        //Public Variables
        var security = this;
        security.user = null;
        security.externalUser = null;
        security.externalLogins = [];

        //Public Methods
        security.login = function (data) {
            var deferred = $q.defer();

            data.grant_type = 'password';
            api.login(data).success(function (user) {
                accessToken(user.access_token, data.rememberMe);
                security.user = user;
                security.redirectAuthenticated(redirectTarget() || $state.href(securityProvider.states.home));
                if (securityProvider.events.login) securityProvider.events.login(security, user); // Your Login events
                deferred.resolve(security.user);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.loginWithExternal = function (login, data) {
            var deferred = $q.defer();
            if (securityProvider.usePopups) {
                var loginWindow = window.open(login.url, 'frame', 'resizeable,height=510,width=380');

                //Watch for close
                $timeout.cancel(externalLoginWindowTimer);
                externalLoginWindowTimer = $timeout(function closeWatcher() {
                    if (!loginWindow.closed) {
                        externalLoginWindowTimer = $timeout(closeWatcher, 500);
                        return;
                    }
                    //closeOAuthWindow handler - passes external_data if there is any
                    if (securityProvider.events.closeOAuthWindow) securityProvider.events.closeOAuthWindow(security, window.external_data);

                    //Return if the window was closed and external data wasn't added
                    if (typeof (window.external_data) === 'undefined') {
                        deferred.reject();
                        return;
                    }

                    //Move external_data from global to local
                    var externalData = window.external_data;
                    delete window.external_data;

                    deferred.resolve(handleExternalData(externalData, login, data.rememberMe));
                }, 500);
            } else {
                if (data != null && data.rememberMe != null) localStorage.rememberMe = JSON.stringify(data.rememberMe);
                localStorage.loginProvider = JSON.stringify(login);
                window.location.href = login.url;
            }

            return deferred.promise;
        };

        security.logout = function () {
            var deferred = $q.defer();

            api.logout().success(function () {
                security.user = null;
                accessToken('clear');
                redirectTarget('clear');
                if (securityProvider.events.logout) securityProvider.events.logout(security); // Your Logout events
                $state.go(securityProvider.states.postLogout);
                deferred.resolve();
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.register = function (data) {
            var deferred = $q.defer();

            api.register(data).success(function () {
                if (securityProvider.events.register) securityProvider.events.register(security); // Your Register events
                if (securityProvider.registerThenLogin) {
                    security.login(data).then(function (user) {
                        deferred.resolve(user);
                    }, function (errorData) {
                        deferred.reject(errorData);
                    });
                } else {
                    deferred.resolve();
                }
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.registerExternal = function () {
            var deferred = $q.defer();

            if (!security.externalUser) {
                deferred.reject();
            } else {
                api.registerExternal(security.externalUser.access_token, security.externalUser).success(function () {
                    //Success
                    deferred.resolve(security.loginWithExternal(security.externalUser.provider));
                    security.externalUser = null;
                }).error(function (errorData) {
                    deferred.reject(errorData);
                });
            }

            return deferred.promise;
        };

        security.forgotPassword = function (data) {
            var deferred = $q.defer();

            api.forgotPassword(data).success(function (forgotPasswordResult) {
                deferred.resolve(forgotPasswordResult);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.resetPassword = function (data) {
            var deferred = $q.defer();

            api.resetPassword(data).success(function (resetPasswordResult) {
                deferred.resolve(resetPasswordResult);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.confirmEmail = function (data) {
            var deferred = $q.defer();

            api.confirmEmail(data).success(function (confirmEmailResult) {
                deferred.resolve(confirmEmailResult);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.mangeInfo = function () {
            var deferred = $q.defer();

            api.manageInfo().success(function (manageInfo) {
                deferred.resolve(manageInfo);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.changePassword = function (data) {
            var deferred = $q.defer();

            api.changePassword(data).success(function () {
                deferred.resolve();
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.addExternalLogin = function (externalAccessToken, data) {
            var deferred = $q.defer();

            api.addExternalLogin(externalAccessToken, data).success(function () {
                deferred.resolve();
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.associateExternal = function (login, returnUrl) {
            var deferred = $q.defer();
            if (securityProvider.usePopups) {
                var loginWindow = window.open(login.url, 'frame', 'resizeable,height=510,width=380');

                //Watch for close
                $timeout.cancel(externalLoginWindowTimer);
                externalLoginWindowTimer = $timeout(function closeWatcher() {
                    if (!loginWindow.closed) {
                        externalLoginWindowTimer = $timeout(closeWatcher, 500);
                        return;
                    }
                    //closeOAuthWindow handler - passes external_data if there is any
                    if (securityProvider.events.closeOAuthWindow) securityProvider.events.closeOAuthWindow(security, window.external_data);

                    //Return if the window was closed and external data wasn't added
                    if (typeof (window.external_data) === 'undefined') {
                        deferred.reject();
                        return;
                    }

                    //Move external_data from global to local
                    var externalData = window.external_data;
                    delete window.external_data;

                    deferred.resolve(handleExternalData(externalData, login, data.rememberMe));
                }, 500);
            } else {
                localStorage.loginProvider = JSON.stringify(login);
                associating(true);
                redirectTarget(returnUrl || "/");
                window.location.href = login.url;
            }

            return deferred.promise;
        };

        security.removeLogin = function (data) {
            var deferred = $q.defer();

            api.removeLogin(data).success(function (result) {
                deferred.resolve(result);
            }).error(function (errorData) {
                deferred.reject(errorData);
            });

            return deferred.promise;
        };

        security.authenticate = function () {
            if (accessToken()) return;
            if (!redirectTarget()) redirectTarget($location.path());
            $state.go(securityProvider.states.login);
        };

        security.redirectAuthenticated = function (url) {
            if (!accessToken()) return;
            if (redirectTarget()) redirectTarget('clear');
            $location.path(url);
        };
        // Initialize
        initialize();

        return security;
    }];
}]);