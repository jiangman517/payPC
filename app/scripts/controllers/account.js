'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
	.controller('AccountCtrl', function($scope, billsumm, AppConfig, tpbill, $filter, $rootScope) {
		$scope.resultType = 0; //默认
		$scope.accountinfo = {};
		$scope.checkinfo = {};
        $scope.typeOfBillDateSetting = 1;
		$scope.today = function () {
	        $scope.time_start = new Date();
	    };
	    $scope.today();

	    $scope.clear = function () {
	        $scope.time_start = null;
	    };

	    // Disable weekend selection
	    $scope.disabled = function (date, mode) {
	        return false;//(mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
	    };

	    $scope.toggleMin = function () {
	        $scope.minDate = $scope.minDate ? null : new Date();
	    };
	    $scope.toggleMin();
	    $scope.maxDate = new Date();

	    $scope.open = function ($event) {
	        $scope.status.opened = true;
	    };

	    $scope.setDate = function (year, month, day) {
	        $scope.time_start = new Date(year, month, day);
	    };

	    $scope.dateOptions = {
	        formatYear: 'yyyy',
	        startingDay: 1,
	        formatMonth:'MM',
	        formatDayTitle: 'yyyy-MM',
	        showWeeks: 0	        
	    };

	    $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	    $scope.format = $scope.formats[0];

	    $scope.status = {
	        opened: false
	    };

		$scope.get_account = function(start, end) {
			$rootScope.loading = true;
			billsumm.getPrivate({
				bTime: $filter('date')(start, 'yyyy-MM-dd'),
	            eTime: $filter('date')(end, 'yyyy-MM-dd'),
			}).success(function(response) {
				$rootScope.loading = false;
				console.log(response);
				if (response.Status === 'SUCCESS') {
					$scope.resultType = 2; //有充值缴费记录
					$scope.accountinfo = response.Data;
					$scope.accountinfo.percent = $scope.accountinfo.ProcessedAmount / $scope.accountinfo.TotalAmount * 100;
					$scope.accountinfo.bTime = start;
					$scope.accountinfo.eTime = end;
				} else if (response.Status === 'FAIL' && response.Message === 'NOTFOUND') {
					$scope.resultType = 1; //无充值缴费记录
					//sweetAlert('提示', '所选日期无充值缴费记录');
				} else if (response.Status === 'FAIL') {
					sweetAlert('提示', '系统出现错误，请联系技术支持人员。错误代码：' + response.Message, 'error');
				}
			}).error(function(result) {
				$rootScope.loading = false;
				var message = '网络错误，请稍后重试。';
				if (result && result.Message) {
					message = message + '错误代码：' + result.Message;
				}
				sweetAlert('提示', message, 　'error');
			});
		};
		$scope.dowmload_local_account = function(start, end) {
			var defaultFileName = '账单.xls';
			start  = $filter('date')(start, 'yyyy-MM-dd');
	        end  = $filter('date')(end, 'yyyy-MM-dd');
	        
			var url = AppConfig.WEB_ROOT + 'api/order/' + AppConfig.get_universityId() + '/downloadbill/' + start + '/' + end;
			swal({
				title: '保存文件',
				text: '账单明细保存为:',
				type: 'input',
				showCancelButton: true,
				confirmButtonText: '继续',
				cancelButtonText: '取消',
				closeOnConfirm: true,
				animation: 'lide-from-top',
				inputPlaceholder: '请给你的账单文件取个名字'
			}, function(inputValue) {
				if (inputValue === false) {
					return;
				}
				if (inputValue) {
					defaultFileName = inputValue;
				}
				if (!defaultFileName.endsWith('.xls')) {
					defaultFileName = defaultFileName + '.xls';
				}
				$rootScope.loading = true;
				tpbill.download(url, defaultFileName).error(function(reason) {
					$rootScope.loading = false;
					var message = '网络错误，请稍后重试。';
					if (reason && reason.Status === "FAIL") {
						message = '暂无对账单资料。';
					}
					sweetAlert('提示', message, 　'error');
				}).success(function() {
					$rootScope.loading = false;
				});

			});

		};
		$scope.check_account = function(stime, etime) {
			
			var today = $filter('date')(new Date(), 'yyyyMMdd');
			stime = $filter('date')(stime, 'yyyyMMdd');
			etime = $filter('date')(etime, 'yyyyMMdd');
			if(stime >= today || etime >= today)
			{
				sweetAlert('提示', "微信账单存在1-2天延时,如需对账请修改查询日期。", 　'error');
				return;
			}
			$rootScope.loading = true;
			tpbill.getPrivate({
				StartDay: stime,
	            EndDay: etime
			}).success(function(response) {
				$rootScope.loading = false;
				console.log(response);
				if (response.Status === 'SUCCESS') {
					if (response.Message === 'FAIL') {
						$scope.resultType = 3; //对账失败
						$scope.checkinfo = response.Data;
					}else if (response.Message === 'NOTFOUND')
					{
						$scope.resultType = 4; //无对账记录
					}
					else if (response.Data && response.Data.length === 0) {
						$scope.resultType = 4; //对账成功
					}else{
						$scope.resultType = 0; 
					}
				}
			}).error(function() {
				$rootScope.loading = false;
			});
		};
		$scope.dowmload_check_account = function(stime, etime) {
			var defaultFileName = '对账单.xls';
				stime = $filter('date')(stime, 'yyyy-MM-dd');
	            etime = $filter('date')(etime, 'yyyy-MM-dd');
	            var today = $filter('date')(new Date(), 'yyyy-MM-dd');
	        if(stime >= today || etime >= today)
			{
				sweetAlert('提示', "微信账单存在1-2天延时,如需对账请修改查询日期。", 　'error');
				return;
			}
			var url = AppConfig.WEB_ROOT + 'api/order/' + AppConfig.get_universityId()+ '/3pbill/' + stime + '/' + etime;
			$rootScope.loading = true;
			swal({
				title: '保存文件',
				text: '对账单保存为:',
				type: 'input',
				showCancelButton: true,
				confirmButtonText: '继续',
				cancelButtonText: '取消',
				closeOnConfirm: true,
				animation: 'lide-from-top',
				inputPlaceholder: '请给你的对账单文件取个名字'
			}, function(inputValue) {
				if (inputValue === false) {
					return;
				}
				if (inputValue) {
					defaultFileName = inputValue;
				}
				if (!defaultFileName.endsWith('.xls')) {
					defaultFileName = defaultFileName + '.xls';
				}
				
				tpbill.download(url, defaultFileName).error(function(reason) {
					$rootScope.loading = false;
					var message = '网络错误，请稍后重试。';
					if (reason && reason.Status === "FAIL") {
						message = '暂无对账单资料。';
					}
					sweetAlert('提示', message, 　'error');
				}).success(function(){$rootScope.loading = false;});

			});


		};
		
		$scope.setBillDate = function(type) {
			$scope.typeOfBillDateSetting = type;
			var today ;
			switch (type) {
				case 1: //当天
					today = new Date();
					$scope.time_start = $filter('date')(today, 'yyyy-MM-dd');
					$scope.time_end = $scope.time_start;
					break;
				case 2: //昨天
					today = new Date();					
					$scope.time_start = $filter('date')(today.setDate(today.getDate() - 1), 'yyyy-MM-dd');
					$scope.time_end = $scope.time_start;
					break;
				case 3: //7天
					today = new Date();					
                    var WeekFirstDay=new Date(today-(today.getDay()-1)*86400000);                   
					$scope.time_end = $filter('date')(new Date(WeekFirstDay-86400000) , 'yyyy-MM-dd');
					$scope.time_start = $filter('date')(new Date(WeekFirstDay-86400000*7) , 'yyyy-MM-dd');
					break;
				case 4: //上月        		
					today = new Date();
					var firstdaythismonth = new Date(today.getFullYear(),today.getMonth(),1);
					var lastdaylastmonth = new Date(firstdaythismonth-86400000);
					var firstdaylastmonth = new Date(lastdaylastmonth.getFullYear(),lastdaylastmonth.getMonth(),1);
					$scope.time_end = $filter('date')(lastdaylastmonth, 'yyyy-MM-dd');
					$scope.time_start = $filter('date')(firstdaylastmonth, 'yyyy-MM-dd');
					break;
				default:
					break;
			}
			$scope.get_account($scope.time_start, $scope.time_end);
		};
		$scope.setBillDate(1);
	})
	.factory('billsumm', ['$http', 'AppConfig',
		function($http, AppConfig) {
			var data = angular.isDefined(data) ? data : {};
			
			var getolddata = function() {
				return this.data;
			};
			var getdata = function(param) {
				console.log(param);
				var url = AppConfig.WEB_ROOT + 'api/order/' + AppConfig.get_universityId() + '/billsumm/' + param.bTime + '/' + param.eTime;
				this.url = url;
				return $http.get(url, null, {

				});
			};
			var updatedata = function(param) {
				var url_back = this.url;
				return $http.get(url_back, null, {

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
	.factory('tpbill', ['$http', 'AppConfig',
		function($http, AppConfig) {
			var data = angular.isDefined(data) ? data : {};
			var getolddata = function() {
				return this.data;
			};
			var getdata = function(param) {
				console.log(param);
				param.UniversityId = AppConfig.get_universityId();
				var url = AppConfig.WEB_ROOT + 'api/order/validatebill/';
				return $http.post(url, param, {

				});
			};
			var downloadBill = function(url, defaultFileName) {
				return $http.post(url, null, {
					responseType: 'arraybuffer',
					headers: {
						'Content-type': 'application/json',
						'Accept': 'application/vnd.ms-excel'
					},
					timeout:30000
				}).success(function(data, status, headers) {
					var type = headers('Content-Type');

					var blob = new Blob([data], {
						type: type
					});
					var objectUrl = URL.createObjectURL(blob);

					var anchor = angular.element('<a/>');
					anchor.attr({
						href: objectUrl,
						target: '_blank',
						download: defaultFileName
					})[0].click();
					//saveAs(blob, defaultFileName);
					//deferred.resolve(defaultFileName);
				});
			};
			return {
				data: this.data,
				getolddata: getolddata,
				getPrivate: getdata,
				download: downloadBill
			};
		}
	]);