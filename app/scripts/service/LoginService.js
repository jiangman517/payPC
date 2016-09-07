angular.module('payPcApp')
	.factory('loginservice', ['$http', 'AppConfig', '$location',
		function($http, AppConfig, $location) {
			var data = angular.isDefined(data) ? data : {};

			var getolddata = function() {
				return this.data;
			};
			var getdata = function(param) {
				var data = "grant_type=password&username=" + param.username + "&password=" + param.password + "&client_id=sdjf";
				$http({
					method: 'post',
					url: AppConfig.AUTH_URL,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: data
				}).then(function(response) {
					console.log(response);
					response.data['.expires'] = Math.round(new Date(response.data['.expires']).getTime() / 1000);
					AppConfig.data = response.data;
					_.each(response.data, function(v, k) {
						var key = 'APP_' + k;
						localStorage[key] = v;
					});
					
					var features = AppConfig.get_features();
					if (features && features.length > 0) {
						var parts = features.split(',');
						if (parts && parts.length > 0) {
							$location.path('/' + parts[0]);
						}
					}else
					{
												sweetAlert('提示','你没有使用本系统的权限，请联系管理员。', 　'error');
					}
					param.callback();
					return response;
				}, function(error) {
					var msg='';
					if(error && error.data && error.data.error ==='invalid_grant')
					{
						msg = '账号或密码错误，请检查后重试';
					}else
					{
						msg = '网络异常，请稍后重试';
					}
					sweetAlert('提示', msg, 　'error');
					param.callback();
					return error;
				}, function(progress) {
					param.callback();
					return progress;
				});
			};

			var updatedata = function() {
				var data = "grant_type=refresh_token&refresh_token=" + AppConfig.get_refresh_token() + "&client_id=sdjf";
				$http({
					method: 'post',
					url: AppConfig.AUTH_URL,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: data
				}).then(function(response) {
					console.log(response);
					response.data['.expires'] = Math.round(new Date(response.data['.expires']).getTime() / 1000);
					AppConfig.data = response.data;
					_.each(response.data, function(v, k) {
						var key = 'APP_' + k;
						localStorage[key] = v;
					});
					AppConfig.universityId = 'gh_0b2f868ef759';
					return response;
				}, function(error) {
					console.log(error);
					return error;
				}, function(progress) {
					return progress;
				});
			};
			return {
				data: this.data,
				getolddata: getolddata,
				getPrivate: getdata,
				updatedata: updatedata
			};
		}
	])
	.factory('AuthService', function(AppConfig) {
		var hasAuth = function(routename) {
			console.log(routename);
			return AppConfig.canAccess(routename);
		};
		return {
			hasAuth: hasAuth
		};
	});