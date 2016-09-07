    angular.module('payPcApp')
        .factory('flatmodel', ['$http', 'AppConfig', function($http, AppConfig) {
            var data = angular.isDefined(data) ? data : {};

            var getolddata = function() {
                return this.data;
            };
            var getdata = function() {
                var url = AppConfig.WEB_ROOT + 'api/studentflat/la/' + AppConfig.get_universityId();
                return $http.get(url, null, {

                });
            };
            var updatedata = function(param) {
                return $http.post('http://test.houqinbao.com/index.php?s=/addon/Apiout/Apiout/bijiao4', param, {
                    headers: {
                        "Content-Type": 'application/x-www-form-urlencoded;charset=UFT-8'
                    }
                });
            };

            return {
                data: this.data,
                getolddata: getolddata,
                getPrivate: getdata,
                updatedata: updatedata
            };
        }]);
