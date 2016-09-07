angular.module('payPcApp')
    .config(function($httpProvider, AppConfig) {
        var interceptor = function($q, $rootScope) {
            return {
                'request': function(req) {
                    if (req.url.indexOf('/api/') > 0) {
                        var access_token = AppConfig.get_access_token();
                        var time = AppConfig.get_time();
                        var now_time = Math.round(new Date().getTime() / 1000);
                        if (time - 600 < now_time) {
                            $rootScope.refresh = true;
                        }
                        var authorization = 'Bearer ';
                        req.headers.Authorization = authorization + access_token;       
                    }
                    return req;
                },
                'response': function(resp) {
                    return resp;
                }
            };
        };
        $httpProvider.interceptors.push(interceptor);
    });
