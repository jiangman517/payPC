/* global dataName */
'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp').controller('BuildingCtrl', function($scope, TreeData, BuildingService, AppConfig,$rootScope) {
	var vm = $scope.vm = {};
    $scope.uni = AppConfig.get_university();
	vm.items = [{
		label: $scope.uni,
		items: []
	}];
	$scope.modePay = {},
	$scope.modeBill = {};
	
	//右一部分显示用的变量
	$scope.type = 0;
	$scope.idEdit = "";
	$scope.labelEdit = vm.items[0].label;
	$scope.paymodeEdit = 0;
	$scope.campusId = 0;
	$scope.show = function(type,item){
		$scope.type = type;
		switch(type){
            case 3:
                $scope.servers = {
                    address:item.ServerAddress || "",
                    name : item.DBName || "",
                    user : item.UserName || "",
                    pass : item.Password || "",
                    ID : item.ConfigId || 0,
                    idEdit : item.CampusId + ""
                }
            break;
            case 1:
                $scope.campusId = (item.CampusId || 0) + "";
			case 0:
			
			case 2:
				$scope.paymodeEdit = item.PayMode;
			default:
				$scope.labelEdit = type==0?vm.items[0].label:(type==1?item.AreaName:item.FlatName);
				$scope.idEdit = type==0?0:(type==1?item.AreaId:item.FlatId);
                
		}
	};
	$scope.edit = function(type,item,label){
        
		if(label.length<1){
			swal('提示', '没有输入！', 'error');
			return;
		}
        $rootScope.loading = true;
		item.label = label;
		if(type<3)
            BuildingService.operation(item,type,1,fresh);
        else if(type == 3){
            BuildingService.operation(item,type,1,freshCampus);
        }else if(type == 4){
            if($scope.servers.ID > 0)
                BuildingService.operation({
                    ConfigId:$scope.servers.ID,
                    CampusId:$scope.servers.idEdit ,
                    ServerAddress : $scope.servers.address ,
                    DBName : $scope.servers.name,
                    UserName: $scope.servers.user,
                    Password : $scope.servers.pass
                },4,1,freshCampus);
            else
                BuildingService.operation({
                    CampusId:$scope.servers.idEdit ,
                    ServerAddress : $scope.servers.address ,
                    DBName : $scope.servers.name,
                    UserName: $scope.servers.user,
                    Password : $scope.servers.pass
                },4,0,freshCampus);
        }
	}
    
    
	$scope.paymodeSave = function(paymode){
        $rootScope.loading = true;
		if($scope.paymodeEdit != paymode){
			BuildingService.operation({
				label:$scope.labelEdit,
				FlatId:$scope.idEdit,
				PayMode:paymode
			},2,1,fresh);
			$scope.paymodeEdit = paymode;
		}
	}
    
    
	$scope.delete = function(type,item){
		if(type<3)
		  BuildingService.operation(item,type,2,fresh);
        else
          BuildingService.operation(item,type,2,freshCampus);
	};
    
    
	$scope.campusSave = function(){
        $rootScope.loading = true;
        BuildingService.operation({
            label:$scope.labelEdit,
            AreaId:$scope.idEdit,
            campusId:$scope.campusId
        },1,1,fresh);
    }
    
    
    
	//add用的变量
	$scope.labelAdd = "";
	$scope.add = function(type,item,label){
		if(label.length<1){
			swal('提示', '没有输入！', 'error');
			return;
		}
        item.label = label;
        $rootScope.loading = true;
        if(type<3)
		  BuildingService.operation(item,type,0,fresh);
        else
          BuildingService.operation({label : label},type,0,freshCampus);
	};
	
    
    
    
    
	//刷新树
	var fresh = function(){
        $rootScope.loading = true;
		return BuildingService.getData().success(function(data) {
			//console.log(data);
            $rootScope.loading = false;
			if (data && data.Status === 'SUCCESS' && data.Data.PayModels && data.Data.PayModels.length > 0) {
				var _mode = data.Data.PayModels;
				for (var m in _mode) {
					if (_mode[m].Mode === 0 && _mode[m].Status === true) {
						$scope.modePay = _mode[m];
					} else if (_mode[m].Mode === 1 && _mode[m].Status === true) {
						$scope.modeBill = _mode[m];
					}
				}
			}
			
			if (data && data.Status === 'SUCCESS' && data.Data.Areas && data.Data.Areas.length > 0) {
				$scope.vm.items[0].items = data.Data.Areas;

			} else { //No data
				swal('提示', '获取楼栋信息失败：' + data.Message, 'error');
			}
		}).error(function(reason) {
            $rootScope.loading = false;
            console.log(reason) 
			swal('提示', '获取楼栋信息失败', 'error');
		});
	}
    var freshCampus = function(){
        $rootScope.loading = true;
		BuildingService.getCampus().success(function(data) {
            $rootScope.loading = false;
            $scope.campus = data.Data;
		}).error(function(reason) {
            $rootScope.loading = false;
            console.log(reason) 
			swal('提示', '获取楼栋信息失败' , 'error');
		});
	}
	fresh().then(function(){
        freshCampus();
    });
    
    
    
}).factory('BuildingService', ['$http', 'AppConfig',
	function($http, AppConfig) {
		var getData = function() {
			var url = AppConfig.WEB_ROOT + 'api/studentflat/la/' + AppConfig.get_universityId();
			return $http.get(url, null, {});
		};
        var getCampus = function(){
            var url = AppConfig.WEB_ROOT + 'api/campus/' + AppConfig.get_universityId();
			return $http.get(url, null, {});
        }
		var operation = function(item,type,status,other){
			//type 0学校1生活区2楼栋3校区4接口
			//status 0增1改2删
			var url ="",param = {};
			switch (status) {
				case 0:
					if(type == 1){
						url = AppConfig.WEB_ROOT + 'api/area',
						param = {
							areaName: item.label,
							universityId: AppConfig.get_universityId()
						};
					}
					else if(type == 2){
						url = AppConfig.WEB_ROOT + 'api/flat',
						param = {
							flatName: item.label,
							areaId: item.AreaId,
							universityId: AppConfig.get_universityId()
						};
					}
                    else if(type == 3){
						url = AppConfig.WEB_ROOT + 'api/campus/' + AppConfig.get_universityId() + '/' + item.label,
						param = {
							campusName: item.label,
							universityId: AppConfig.get_universityId()
						};
					}else if(type == 4){
						url = AppConfig.WEB_ROOT + 'api/interface/dbConfig',
						param = {
                            SchoolId:AppConfig.get_universityId(),
                            CampusId:item.CampusId,
                            ServerAddress : item.ServerAddress ,
                            DBName : item.DBName,
                            UserName: item.UserName,
                            Password : item.Password
						};
                        console.log(param);
					}else{
						swal('提示', '参数错误', 'error');
					}
					if(url.length > 0)
						$http.post(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS') {
								//item.id = data.Data;
								swal('成功啦!', '添加成功', 'success');
								other();
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
						});
					break;
				case 1:
					if(type == 1){
						url = AppConfig.WEB_ROOT + 'api/area/ua',
						param = {
							areaName: item.label,
							areaId: item.AreaId	
						};
                        if(item.campusId) param.campusId = item.campusId;
					}
					else if(type == 2){
						url = AppConfig.WEB_ROOT + 'api/flat/uf',
						param = {
							flatName: item.label,
							flatId: item.FlatId,
							PayMode:item.PayMode	
						};
					}
                    else if(type == 3){
						url = AppConfig.WEB_ROOT + 'api/campus',
						param = {
                            Id:item.Id,
							CampusName: item.label,
                            CampusNumber: item.CampusNumber,
                            UniversityId: item.UniversityId,
							CampusId: item.CampusId	
						};
					}else if(type == 4){
						url = AppConfig.WEB_ROOT + 'api/interface/dbConfig',
						param = {
                            Id:item.ConfigId,
                            CampusId:item.CampusId,
                            ServerAddress : item.ServerAddress ,
                            DBName : item.DBName,
                            UserName: item.UserName,
                            Password : item.Password
						};
                        console.log(param);
					}else{
						swal('提示', '参数错误', 'error');
					}
					if(url.length > 0)
						$http.put(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS') {
								swal('成功啦!', '修改成功', 'success');
								other();
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
						});
					break;
				case 2:
					if(type == 1){
						url = AppConfig.WEB_ROOT + 'api/area/da/' + item.AreaId;
					}
					else if(type == 2){
						url = AppConfig.WEB_ROOT + 'api/flat/df/' + item.FlatId;
					}
                    else if(type == 3){
						url = AppConfig.WEB_ROOT + 'api/campus?id=' + item.Id;
					}else{
						swal('提示', '参数错误', 'error');
					}
					if(url.length > 0)
						swal({
							title: "请确认",
							text: (type == 1)?"要删除的节点下面存在子节点，是否要删除？":"确认要删除吗？",
							type: "warning",
							showCancelButton: true,
							confirmButtonColor: "#DD6B55",
							confirmButtonText: "删除",
							cancelButtonText: "取消",
							closeOnConfirm: false
							}, function(inputvalue) {
								if (inputvalue) {
									$http.delete(url).success(function(data, status) {
										if (data && data.Status === 'SUCCESS') {
											swal('成功啦!', '删除成功', 'success');
											other();
										} else {
											swal('提示!', '网络错误，请稍后重试', 'error');
										}
									}).error(function(reason) {
										var message = '网络错误，请稍后重试';
										if (reason && reason.Status === 'FAIL') {
											message = message + reason.Message;
										}
										sweetAlert('提示', message, 'error');
									});
								}
						});
					break;
				default:
					break;
			}
		}
		return {
			getData: getData,
            getCampus:getCampus,
			operation:operation
		};
	}
]).directive('tree', function() {
    return {
        restrict: 'A',
        link:function(scope,iElement,iAttrs){
            iElement.click(function(){
                var e = event.target;
                $(".newing").removeClass("newing").addClass("new");
                $(".edit").removeClass("edit");
                if(/primary/.test(e.className)){
                    
                }else if(/default/.test(e.className)){
                    
                }
                else if(/fa-edit/.test(e.className)){
                    $(e).closest('a').addClass("edit").find("input").val($(e.parentNode.parentNode).text().trim()).focus();
                }
                else{
                    var a = $(event.target).closest("a").get(0);
                    var n = a.parentNode.className;
                    //$(".newing").removeClass("newing").addClass("new");
                    if(/branch/.test(a.className)){
                        if(/open/.test(n)){
                            $(a).siblings("ul").slideUp("fast",function(){$(a.parentNode).removeClass('open');});
                        }
                        else {
                            $(a).siblings("ul").slideDown("fast",function(){$(a.parentNode).addClass('open');});
                        }
                    }
                    else if(/leaf/.test(a.className)){
                        iElement.find("a.active").removeClass("active");
                        $(a).addClass("active");
                    }else if(/new/.test(a.className)){
                        $(a).addClass("newing").removeClass("new").find("input").focus();
                    }
                }
            })
        }
    };
});