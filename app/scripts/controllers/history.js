'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
	.controller('HistoryCtrl', function ($scope, history_time, AppConfig, flatmodel, history_time_room, $rootScope, history_change, $filter) {
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


	    $scope.resultType = 1;
	    $scope.history_time_data = {};
	    $scope.history_time_data_room = {};
	    $scope.nav_data = {
	        now: 1,
	        total: 1,
	        firstPage: true,
	        lastPage: true
	    };
	    $scope.schoolarea = {};
	    $scope.schoolflat = {};
	    var today = new Date();

	    $scope.time_end = $filter('date')(today, 'yyyy-MM-dd');
	    $scope.time_start = today.setDate(today.getDate() - 7);//$filter('date')(today.setDate(today.getDate() - 7), 'yyyy-MM-dd');
	    flatmodel.getPrivate().success(function (response) {
	        console.log(response);
	        $scope.schoolarea = flatmodel.data = response.Data.Areas;
	    });
	    $scope.$watch('select_area', function (area) {
	        console.log($scope.schoolarea);
	        if (area != undefined) {
	            $scope.schoolflat = _.find($scope.schoolarea, function (detail) {
	                return detail.AreaId == area;
	            })['Flats'];
	        };

	    });
	    $scope.get_data = function (start, end, page, status) {
	        $rootScope.loading = true;
	        console.log(status);
	        page = page ? page : 1;
	        history_time.getPrivate({
	            universityId: AppConfig.get_universityId(),
	            bTime: $filter('date')(start, 'yyyy-MM-dd'),
	            eTime: $filter('date')(end, 'yyyy-MM-dd'),
	            currentPage: page,
	            size: 10,
	            status: status ? status : 0
	        }).success(function (response) {
	            console.log(response);
	            if (response && response.Data && response.Data.length > 0 && response.Data[0].list && response.Data[0].list.length > 0) {
					//console.log("get_data");console.log(response);
	                $scope.get_data_finish(response, status);
	                $scope.resultType = 2;
	            } else {
	                $scope.resultType = 1;
	            }
	            $rootScope.loading = false;
	        }).error(function (reason) {
	            $rootScope.loading = false;
	            var message = '网络错误，请稍后重试。';
	            if (reason && reason.Status === "FAIL") {
	                message = message + reason.Message;
	            }
	            sweetAlert('提示', message, 'error');
	        });
	    };
	    $scope.get_data_repeat = function () {
	        history_time.updatedata().success(function (response) {
	            if (response && response.Data && response.Data.length > 0 && response.Data[0].list && response.Data[0].list.length > 0) {
					//console.log(response);
	                $scope.get_data_finish(response, status);
	                $scope.resultType = 2;
					console.log($scope.resultType);
	            } else {
	                $scope.resultType = 1;
	            }
	            $rootScope.loading = false;
	        }).error(function (reason) {
	            $rootScope.loading = false;
	            var message = '网络错误，请稍后重试。';
	            if (reason && reason.Status === "FAIL") {
	                message = message + reason.Message;
	            }
	            sweetAlert('提示', message, 'error');
	        });
	    };
	    $scope.get_data_finish = function (response, status) {
	        $rootScope.loading = false;
	        $scope.all_check = false;
	        $scope.history_time_data = history_time.data = response.Data[0];
	        $scope.history_time_data.status = status ? status : 0;
	        $scope.nav_data = {
	            now: $scope.history_time_data.pageNumber,
	            total: $scope.history_time_data.totalPage,
	            firstPage: $scope.history_time_data.firstPage,
	            lastPage: $scope.history_time_data.lastPage
	        }

	    };
	    $scope.detail_order = function (flag) {
	        var orderNo = new Array();
	        if (flag) {
	            var checkdomlist = $(".history-first:checked");
	            console.log(checkdomlist);
	            for (var i = 0; i < checkdomlist.length; i++) {
	                if (!$(event.target).hasClass('closed')) {
	                    orderNo.push(checkdomlist[i]['value']);
	                }
	            };
	        } else {
	            if ($(event.target).hasClass('closed')) {
	                return;
	            } else {
	                orderNo.push($(event.target).attr('data-log'));
	            }

	        }
	        console.log(orderNo);
			if(orderNo.length < 1) return;
	        swal({
	            title: "提示?",
	            text: "您是否要处理该订单",
	            type: "info",
	            showCancelButton: true,
	            confirmButtonColor: "#AEDEF4",
	            confirmButtonText: "确定",
	            cancelButtonText: "取消",
	            closeOnConfirm: false
	        }, function () {
	            history_change.getPrivate({
	                userid: 'admin',
	                orderlists: orderNo
	            }).success(function (response) {
	                console.log(response);
	                if (response.Status == 'SUCCESS') {
	                    $scope.get_data_repeat();
	                    swal("成功啦!", "已处理该订单", "success");

	                } else {
	                    swal("警告!", "处理该订单失败", "error");
	                }

	            });

	        });

	    };



	    $scope.get_data_room = function (page) {
	        $rootScope.loading = true;
	       // console.log(status);
	        page = page ? page : 1;
	        history_time_room.getPrivate({
	            universityId: AppConfig.get_universityId(),
	            room: $scope.select_area + '-' + $scope.select_flat + '-' + $scope.select_room,
	            currentPage: page,
	            size: 10,
	            status: $scope.history_status_room ? $scope.history_status_room : 0
	        }).success(function (response) {
	            if (response && response.Data && response.Data.length > 0 && response.Data[0].list && response.Data[0].list.length > 0) {
	                $scope.get_data_room_finish(response, $scope.history_status_room);
	                $scope.resultType = 4;
	            } else {
	                $scope.resultType = 1;
	            }
	            $rootScope.loading = false;
	        }).error(function (reason) {
	            $rootScope.loading = false;
	            var message = '网络错误，请稍后重试。';
	            if (reason && reason.Status === "FAIL") {
	                message = message + reason.Message;
	            }
	            sweetAlert('提示', message, 'error');
	        });
	    };
	    $scope.get_data_room_repeat = function () {
	        history_time_room.updatedata().success(function (response) {
	            if (response && response.Data && response.Data.length > 0 && response.Data[0].list && response.Data[0].list.length > 0) {
	                $scope.get_data_room_finish(response);
	                $scope.resultType = 4;
	            } else {
	                $scope.resultType = 1;
	            }
	            $rootScope.loading = false;
	        }).error(function (reason) {
	            $rootScope.loading = false;
	            var message = '网络错误，请稍后重试。';
	            if (reason && reason.Status === "FAIL") {
	                message = message + reason.Message;
	            }
	            sweetAlert('提示', message, 'error');
	        });
	    };
	    $scope.get_data_room_finish = function (response, status) {
	        $rootScope.loading = false;
	        $scope.all_check = false;
	        //console.log(response);
	        $scope.history_time_data_room = history_time_room.data = response.Data[0];
	        $scope.history_time_data_room.status = status ? status : 0;
	        $scope.nav_data_room = {
	            now: $scope.history_time_data_room.pageNumber,
	            total: $scope.history_time_data_room.totalPage,
	            firstPage: $scope.history_time_data_room.firstPage,
	            lastPage: $scope.history_time_data_room.lastPage
	        }
	    }

	    $scope.detail_order_room = function (flag) {
	        var orderNo = new Array();
	        if (flag) {
	            var checkdomlist = $(".history-second:checked");
	            console.log(checkdomlist);
	            for (var i = 0; i < checkdomlist.length; i++) {
	                if (!$(event.target).hasClass('closed')) {
	                    orderNo.push(checkdomlist[i]['value']);
	                }
	            };
	        } else {
	            console.log($(event.target));
	            if ($(event.target).hasClass('closed')) {
	                return;
	            } else {
	                orderNo.push($(event.target).attr('data-log'));
	            }

	        }
	        console.log(orderNo);
	        swal({
	            title: "提示?",
	            text: "您是否要处理该订单",
	            type: "info",
	            showCancelButton: true,
	            confirmButtonColor: "#AEDEF4",
	            confirmButtonText: "确定",
	            cancelButtonText: "取消",
	            closeOnConfirm: false
	        }, function () {
	            history_change.getPrivate({
	                userid: 'admin',
	                orderlists: orderNo
	            }).success(function (response) {
	                console.log(response);
	                if (response.Status == 'SUCCESS') {
	                    $scope.get_data_room_repeat();
	                    swal("成功啦!", "已处理该订单", "success");
	                } else {
	                    swal("警告!", "处理该订单失败", "error");
	                }

	            });

	        });

	    };

	    $scope.get_data($scope.time_start, $scope.time_end, 0, '');
	})
	.factory('history_time', ['$http', 'AppConfig',
		function ($http, AppConfig) {
		    var data = angular.isDefined(data) ? data : {};
		    var url = '';
		    var getolddata = function () {
		        return this.data;
		    };
		    var getdata = function (param) {
		        console.log(param);
		        var url = AppConfig.WEB_ROOT + 'api/order/ordersbytime/' + param.universityId + '/' + param.bTime + '/' + param.eTime + '/' + param.currentPage + '/' + param.size + "?statusCode=" + param.status;
		        this.url = url;
		        return $http.get(url, null, {

		        });
		    };
		    var updatedata = function (param) {
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
    .factory('history_time_room', ['$http', 'AppConfig',
		function ($http, AppConfig) {
		    var data = angular.isDefined(data) ? data : {};
		    var url = '';
		    var getolddata = function () {
		        return this.data;
		    };
		    var getdata = function (param) {
		        console.log(param);
		        var url = AppConfig.WEB_ROOT + 'api/order/ordersbyroom/' + param.universityId + '/' + param.room + '/' + param.currentPage + '/' + param.size + "?statusCode=" + param.status;
		        this.url = url;
		        return $http.get(url, null, {

		        });
		    };
		    var updatedata = function (param) {
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
    .factory('history_change', ['$http', 'AppConfig',
		function ($http, AppConfig) {
		    var data = angular.isDefined(data) ? data : {};
		    var getolddata = function () {
		        return this.data;
		    };
		    var getdata = function (param) {
		        console.log(param);
		        var url = AppConfig.WEB_ROOT + 'api/order/payedconfirm/' + param.userid;
		        return $http.put(url, param.orderlists, {

		        });
		    };
		    return {
		        data: this.data,
		        getolddata: getolddata,
		        getPrivate: getdata
		    };
		}
])
   .directive('psDatetimePicker', function ($filter) {
	    var options = {
	        showTodayButton: true,
	        format: 'YYYY-MM-DD',
	        ignoreReadonly: true,
	        //keepOpen: false,
	        locale: 'zh-cn',
	        timeZone: ''
	        //debug: true
	      
                
	    };
	    return {
	        restrict: 'A',
	        require: 'ngModel',
	        link: function (scope, element, attributes, HistoryCtrl) {
	            element.datetimepicker(options);
	            var picker = element.data("DateTimePicker");

	            //ctrl.$formatters.push(function (value) {
	            //    var date = moment(value);
	            //    if (date.isValid()) {
	            //        return date.format(format);
	            //    }
	            //    return '';
	            //});

	            element.on('dp.hide', function (e) {
	                var $this = $(this);
	                scope.$apply(function () {
	                  //  scope[$this.attr('ng-model')] = $filter('date')(e.date, 'YYYY-MM-DD');
	                    //var date = e.date;
	                    //ctrl.$setViewValue(date);
	                });
	            });
	            element.on('dp.change', function (event) {
	                scope.$apply(function () {
	                   // var date = picker.getDate();
	                    HistoryCtrl.$setViewValue(event);
	                });
	            });
	        }
	    };
	});;