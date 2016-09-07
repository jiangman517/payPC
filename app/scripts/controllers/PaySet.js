'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
	.controller('PaySetCtrl', function($http, AppConfig, $scope, paySetService) {
		$scope.config = {};
		$scope.billconfig = {};
		$scope.save = function(mode) {
			var config;
			if (mode === 0) {
				config = $scope.config;
			} else if (mode === 1) {
				config = $scope.billconfig;
			}
			config.PayMode = mode;
			config.SchoolId = AppConfig.get_universityId();
			paySetService.updatedata(config).success(function(data) {
				if(data && data.Status === 'SUCCESS')
				{
					swal('成功啦!', '保存成功', 'success');
				}
			}).error(function(reason){
				var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
			});
		};
		paySetService.getdata().success(function(data) {
			if (data && data.Status === 'SUCCESS' && data.Data && data.Data.length > 0)
			{
				for(var i in data.Data)
				{
					if(data.Data[i].PayMode === 0)
					{
						$scope.config = data.Data[i];
					}
					else if(data.Data[i].PayMode === 1)
					{
						$scope.billconfig = data.Data[i];
					}
				}
			}
		});
	}).factory('paySetService', ['$http', 'AppConfig',
		function($http, AppConfig) {

			var url = '';
			var getdata = function() {
				var url_back = AppConfig.WEB_ROOT + 'api/billingMode/' + AppConfig.get_universityId();
				return $http.get(url_back);
			};

			var updatedata = function(param) {
				var url_back = AppConfig.WEB_ROOT + 'api/billingMode';
				return $http.post(url_back, param, {

				});
			};
			return {
				getdata: getdata,
				updatedata: updatedata
			};
		}
	]);