angular.module('payPcApp')
.controller('accessCtrl', function($scope, AppConfig,$uibModal,accessConfigService,BillService,$rootScope) {
	
	$scope.roles = [];
	$scope.animationsEnabled = true;
	$scope.users = [];
	$scope.features =[];
	
	accessConfigService.getUsers().success(function(data){
		$scope.users = data;
	});
 
	accessConfigService.getRoles().success(function(data){
		$scope.roles = data;
	});
    $scope.details = [
        {
            id:0,
            Price:0.01
        },
        {
            id:0,
            Price:0.01
        },
        {
            id:0,
            Price:0.01
        }
    ];
    BillService.getForm().success(function (response) {
        if(response.Status == "SUCCESS"){
            $scope.details = JSON.parse(response.Data);
        }else{
            $scope.details = [
                {
                    id:0,
                    Price:0.01
                },
                {
                    id:0,
                    Price:0.01
                },
                {
                    id:0,
                    Price:0.01
                }
            ];
        }
    }).error(function(reason) {
        $rootScope.loading = false;
        swal('提示', '服务器出错啦！', 'error');
    });
    $scope.saveDetail = function(){
        $rootScope.loading = true;
        BillService.saveForm({
            UniversityId:AppConfig.get_universityId(),
            sid:$scope.details[0].id,
            spric:$scope.details[0].Price,
            did:$scope.details[1].id,
            dpric:$scope.details[1].Price,
            qid	:$scope.details[2].id,
            qpric:$scope.details[2].Price,
            CreatedBy:""
        }).success(function (response) {
            $rootScope.loading = false;
            if(response.Status == "SUCCESS"){
                swal('提示', '保存成功！', 'success');
            }else{
                swal('提示', '保存失败！', 'error');
            }
        }).error(function(reason) {
            $rootScope.loading = false;
            swal('提示', '服务器出错啦！', 'error');
        });
    }
	accessConfigService.getFeatures().success(function(data){
		$scope.features  = data;
	});
 
	$scope.resetPwd = function(user){
		swal({
			title: "请确认",
			text: "确认要重置该管理员的密码吗？",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			closeOnConfirm: false
		}, function(inputvalue) {
			if (inputvalue) {
				accessConfigService.resetPwd(user.UserName).success(function(data){
					if(data && data.Status === 'SUCCESS' && !data.Message)
					{
						swal("成功啦!", "密码重置成功", "success");
					}else{
						swal("消息", "网络错误，稍后重试", "error");
					}
				}).error(function(reason){
					swal("消息", "网络错误，稍后重试" + reason, "error");
				});
			}
		});
			
	};
 
	$scope.editUser = function(user){
		user.Mobile = user.MobileD;
		user.Email = user.EmailD;
		user.Status = user.StatusD;
		var u = {UserName:user.UserName,Mobile:user.Mobile,Email:user.Email,Status:user.Status};
		accessConfigService.updateUser(u).success(function(data){
			if(data && data.Status === 'SUCCESS')
			{
				swal("成功啦!", "修改成功", "success");
			}
		});
		user.edit = false;
	};
 
	$scope.cancelAdd = function() {
		$scope.addnewUser = false;
		$scope.newU = {};
	};
 
 $scope.cancelEdit = function(user)
 {
	  user.MobileD = '';
     user.EmailD = '';
	 user.edit = false;
 };
 
 $scope.startEditUser = function(user){
	 user.MobileD = user.Mobile;
     user.EmailD = user.Email;
	 user.StatusD = user.Status;
user.edit = true;	 
 };
 
 $scope.mapRole = function(user,size){//配置用户角色
	  var roles=[];
    _.each($scope.roles,function(element, index, list){//设置默认角色设定
		var find = _.find(user.Roles,function(r){
			return r.id === element.id;
		});
		var f;
		f = _.clone(element);
		if(find)
		{
			f.selected = true;
		}
		roles.push(f);
	});
    var modalUserRole = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'userRole.html',
      controller: 'userRoleCtrl',
      size: size,
      resolve: {
        data: function () {
          return {roles:roles,user:user};
        }
      }
    });

    modalUserRole.result.then(function (selectedItem) {
		var data={};
		data.UserName = user.UserName;
		data.Roles = [];
		for(var i in selectedItem)
		{
			data.Roles.push(selectedItem[i].id);
		}
      accessConfigService.updateUserRoleMap(data).success(function(data){
		  if(data && data === true)
		  {
			  swal("成功啦!", "修改成功", "success");
		  }
	  });
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
 };
  
  $scope.addUser = function() {
	  $scope.newU.UnivercityName = AppConfig.get_university();
	  $scope.newU.UnivercityCode = AppConfig.get_universityId();
	  accessConfigService.addUser( $scope.newU ).success(function(data){
		  if(data && data.Status === 'SUCCESS')
		  {
			 swal("成功啦!", "添加成功", "success");
		  }
	  });
	   $scope.users.push($scope.newU);
	   $scope.addnewUser = false;
  };
 
 $scope.startAdd = function()  {
	  $scope.addnewUser = true;
	   $scope.newU = {Status:true};
  };
  
  $scope.deleteitem = function(role){
	    role.Status = false;
	    accessConfigService.updateRole(role).success(function(data){
		  if(data && data.Status === 'SUCCESS' && !data.Message)
		  {
			   accessConfigService.getRoles().success(function(data){
	 $scope.roles = data;
 });
			  // swal("成功啦!", "修改成功", "success");
			   
		  }else
		  {
			   swal("消息", "网络错误，稍后重试", "error");
		  }
	  }).error(function(reason){
		   swal("消息", "网络错误，稍后重试", "error");
	  });
  };
  
  $scope.updateitem = function(role){
	  role.edit = false;
	  role.RoleName = role.nameD;
	  role.RoleDescription = role.descD;
	  role.Status = true;
	  if(!role.id || role.id < 1)
	  {
		  role.Universityid = AppConfig.get_universityId();
	  accessConfigService.addRole(role).success(function(data){
		    if(data && data.Status === 'SUCCESS' && !data.Message)
		  {
			   swal("成功啦!", "修改成功", "success");
		  }else
		  {
			   swal("消息", "网络错误，稍后重试", "error");
		  }
	  }).error(function(reason){
		  swal("消息", "网络错误，稍后重试", "error");
	  });
	  }
	  else{
		  accessConfigService.updateRole(role).success(function(data){
		  if(data && data.Status === 'SUCCESS' && !data.Message)
		  {
			   swal("成功啦!", "修改成功", "success");
		  }else
		  {
			   swal("消息", "网络错误，稍后重试", "error");
		  }
	  }).error(function(reason){
		   swal("消息", "网络错误，稍后重试", "error");
	  });}
	 accessConfigService.getRoles().success(function(data){
	 $scope.roles = data;
      });
  };
  
  $scope.startEdit = function(role){
	  role.edit = true;
	  role.nameD = role.RoleName;
	  role.descD = role.RoleDescription;
  };
  
  $scope.addRole = function(){
	 $scope.roles.push({nameD:'新角色',descD:'新建角色',edit:2}); 
  };
   $scope.cancelRoleEdit = function(role,i)
    {
        if(role.edit == 2){
            $scope.roles.splice(i,1);
        }
        role.edit = false;
    };
  $scope.open = function (role,size) {//配置角色权限
	  var features=[];
    _.each($scope.features,function(element, index, list){//默认角色权限设定
		var find = _.find(role.Features,function(f){
			return f.Id === element.Id;
		});
		var f;
		f = _.clone(element);
		if(find)
		{
			
			f.selected = true;
		}
		features.push(f);
	});
	
    var modalRoleFeature = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        data: function () {
          return {features:features,role:role};
        }
      }
    });
    modalRoleFeature.result.then(function (selectedItem) {
      accessConfigService.roleFeatureMap(role).success(function(data){
		  if(data &&　data === true)
		  {
			   swal("成功啦!", "修改成功", "success");
		  }else
		  {
			   swal("消息", "网络错误，稍后重试", "error");
		  }
	  }).error(function(reason){
		   swal("消息", "网络错误，稍后重试", "error");
	  });
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };
	}).controller('ModalInstanceCtrl',function($scope, $uibModalInstance, data){
		$scope.features = data.features;
		$scope.role = data.role;
		 $scope.ok = function () {
			 var selectedItems = _.filter($scope.features,function(f){return f.selected === true;});
			 data.role.Features = selectedItems;
			$uibModalInstance.close(selectedItems);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

	}).controller('userRoleCtrl',function($scope,$uibModalInstance, data)
	{
		$scope.roles = data.roles;
		$scope.user = data.user;
		$scope.ok = function()
		{
			 var selectedItems = _.filter($scope.roles,function(f){return f.selected === true;});
			 data.user.Roles = selectedItems;
             $uibModalInstance.close(selectedItems);
		};
		 $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
	}).factory('accessConfigService', ['$http', 'AppConfig',
		function($http, AppConfig) {
			
			var url = '';
			var getolddata = function() {
				return this.data;
			};
			
			var getUsers = function() {
				
				var url = AppConfig.WEB_ROOT + 'api/user/' + AppConfig.get_universityId() ;
				this.url = url;
				return $http.get(url, null, {

				});
			};
			
			var addUser = function(user)
			{
				var url = AppConfig.WEB_ROOT + '/api/user';
				return $http.post(url,user);
			};
			
			var updateUserRoleMap = function(data)
			{
				var url = AppConfig.WEB_ROOT + 'api/user/urm/' + data.UserName;
				return $http.post(url,data.Roles);
			};
			
			var updateUser = function(user)
			{
				var url = AppConfig.WEB_ROOT + '/api/user';
				return $http.put(url,user);
			};
			
			var resetPwd = function(username)
			{
				var url = AppConfig.WEB_ROOT + 'api/user/resetpwd/' + username;
				return $http.put(url);
			};
			
			var getRoles = function() {
				var url_back = AppConfig.WEB_ROOT + 'api/role/university/' + AppConfig.get_universityId() ;
				return $http.get(url_back, null, {

				});
			};
			
		var addRole = function(role){
			
			var url_back = AppConfig.WEB_ROOT + 'api/role';
				return $http.post(url_back, role, {
				});
		};
		
		var updateRole = function(role){
			var data = {RoleName:role.RoleName,RoleDescription:role.RoleDescription,Status:role.Status,id:role.id}
			var url_back = AppConfig.WEB_ROOT + 'api/role/ur';
				return $http.put(url_back, data, {
				});
		};
		
		var roleFeatureMap = function(role){			      
				var url_back = AppConfig.WEB_ROOT + 'api/role/rfm/' + role.id;
				var data = [];
				for(var i in role.Features){
					data.push(role.Features[i].Id);
				};
				return $http.post(url_back, data, {
				});
		}
		
			var getFeatures = function()
			{
				var url_back = AppConfig.WEB_ROOT + 'api/features/system/sdjf' ;
				return $http.get(url_back, null, {

				});
			}
			
			
			return {
				addUser:addUser,
				getUsers: getUsers,
				updateUser:updateUser,
				resetPwd:resetPwd,
				updateUserRoleMap: updateUserRoleMap,
				getRoles: getRoles,
				updateRole:updateRole,
				addRole:addRole,
				roleFeatureMap:roleFeatureMap,
				getFeatures: getFeatures
			};
		}
	])
;