'use strict';

/**
 * @ngdoc overview
 * @name payPcApp
 * @description
 * # payPcApp
 *
 * Main module of the application.
 */
angular
	.module('payPcApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'ui.router',
        'ui.bootstrap'

	])
	.constant('AppConfig', {
		WEB_ROOT: 'http://pay.houqinbao.com:8089/',
		//WEB_ROOT: 'http://localhost:9289/',
		//WEB_ROOT: 'http://121.41.82.81:8090/',
		 
		// WEB_ROOT:'http://120.26.48.150:8089/',
		AUTH_URL:'http://121.40.49.110/Token',
		//AUTH_URL:'http://localhost:44023/Token',
		data: {},
		get_access_token: function() {
			var time = this.get_time();
			var now_time = Math.round(new Date().getTime() / 1000);
			if (time > now_time) {
				return this.data.access_token ? this.data.access_token : localStorage['APP_access_token'];
			} else {
				return '';
			}
		},
		get_time: function() {
			return this.data['.expires'] ? this.data['.expires'] : localStorage['APP_.expires'];
		},
		get_refresh_token: function() {
			return this.data.refresh_token ? this.data.refresh_token : localStorage['APP_refresh_token'];
		},
		get_features: function() {
			if (this.data) {
				//this.data.features = "meterreading,history,account,payset,accessconfig,building,manage";  //测试代码
				return this.data.features ? this.data.features : localStorage['APP_features'];
			}
			return '';
		},
		get_universityId: function() {
			if (this.data) {
				return this.data.universityId ? this.data.universityId : localStorage['APP_university'];
			}
			return '';
		},
		get_university: function() {
			if (this.data) {
				var name = localStorage['APP_universityName'];
				return name ? name : this.get_universityId();
			}
			return '';
		},
		get_username:function(){
            if(this.data){
            	return this.data.userName?this.data.userName:localStorage['APP_userName'];
            }
            return '';
		},
		canAccess: function(feature) {
			if (feature === 'login') {
				return true;
			}
			/*//王正扬测试用
			if (feature == 'meterreading') {
				return true;
			}*/
			var features = this.get_features();
			if (features && features.indexOf(feature) >= 0) {
				return true;
			}
			return false;
		}
	})
	.run(['$rootScope', '$location', 'AppConfig', 'loginservice', 'AuthService',
		function($rootScope, $location, AppConfig, loginservice, AuthService) {
			$rootScope.refresh = false;
			$rootScope.$on('$stateChangeStart',
				function(event, toState, toParams, fromState, fromParams) {

					console.log(fromState);
					console.log(toState);
					if (!AppConfig.get_access_token()) {
						$location.path('/login');
						return;
					}
					if (!AuthService.hasAuth(toState.name)) {
						sweetAlert('提示', '你请求的页面不存在。', 'error');
						//$location.path('/');
						event.preventDefault();
					}
				});
			$rootScope.$watch('refresh', function(newValue, oldValue) {
				if (newValue) {
					loginservice.updatedata();
					$rootScope = false;
				}

			});
		}
	])
	.config(function($stateProvider, $urlRouterProvider) {
		// $urlRouterProvider.otherwise('/notFound');
		$stateProvider
			.state('meterreading', {
				url: "/meterreading",
				views: {
					"": {
						templateUrl: 'views/meterreading.html',
						controller: 'MeterreadingCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			}) 
			.state('surplus', {
				url: "/meterreadingsurplus",
				views: {
					"": {
						templateUrl: 'views/meterreadingsurplus.html',
						controller: 'MeterreadingsurplusCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			  
			.state('history', {
				url: '/history',
				views: {
					"": {
						templateUrl: 'views/history.html',
						controller: 'HistoryCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('account', {
				url: "/account",
				views: {
					"": {
						templateUrl: 'views/account.html',
						controller: 'AccountCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('payset', {
				url: "/payset",
				views: {
					"": {
						templateUrl: 'views/payset.html',
						controller: 'PaySetCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('statistics', {
				url: "/statistics",
				views: {
					"": {
						templateUrl: 'views/statistics.html',
						controller: 'StatisticsCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('building', {
				url: "/building",
				views: {
					"": {
						templateUrl: 'views/building.html',
						controller: 'BuildingCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('accessconfig', {
				url: "/accessconfig",
				views: {
					"": {
						templateUrl: 'views/user.html',
						controller: 'accessCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})
			.state('manage', {
				url: "/manage",
				views: {
					"": {
						templateUrl: 'views/manage.html',
						controller: 'ManageCtrl'
					},
					"aside": {
						templateUrl: "views/aside.html",
						controller: 'AsideCtrl'
					},
					"header": {
						templateUrl: "views/header.html",
					}
				}

			})

			.state('login', {
				url: "/login",
				views: {
					"login": {
						templateUrl: 'views/login.html',
						controller: 'LoginViewCtrl',
					}
				}
			});
		$urlRouterProvider.otherwise('/login');
		// .otherwise({
		//     redirectTo: '/'
		// });
	}).controller('headerCtrl',function($scope,$location,AppConfig,$http){
		$scope.logout = function()
		{
			localStorage.clear();
			$location.path('#/login');
		}
		$scope.oldPassword="";
		$scope.newPassword="";
		$scope.confirmPassword="";
		$scope.changePassword = function(){
			if($scope.oldPassword.length < 1){
				swal("错误!", "请输入原密码！", "error"); 
				return;
			}
			if($scope.newPassword.length < 1){
				swal("错误!", "请输入新密码！", "error"); 
				return;
			}
			if($scope.confirmPassword.length < 1){
				swal("错误!", "请输入确认密码！", "error"); 
				return;
			}
			if($scope.confirmPassword != $scope.newPassword){
				swal("错误!", "请确认密码！", "error"); 
				return;
			}
			var url = AppConfig.WEB_ROOT + 'api/user/changepwd/';
			var pwdChange = {
				OldPassword:$scope.oldPassword,
				NewPassword:$scope.newPassword,
				UserName: AppConfig.get_username()
			};
		    $http.put(url,pwdChange).success(function(data){
				$("#newPassword").modal("hide");
		    });
			
		}
	});