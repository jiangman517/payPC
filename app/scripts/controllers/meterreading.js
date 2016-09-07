'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
	.controller('MeterreadingCtrl', function($scope, AppConfig,$http,BillService, $timeout,BuildingService,$rootScope) {
		//树状图
		var vm = $scope.vm = {};
		vm.items = [{
			label: AppConfig.get_university(),
			items: []
		}];
		//刷新树
		var fresh = function(){
			BuildingService.getData().success(function(data) {
				//console.log(data);
				if (data && data.Status === 'SUCCESS' && data.Data.Areas && data.Data.Areas.length > 0) {
					$scope.vm.items[0].items = data.Data.Areas;
				} else { //No data
		
				}
			}).error(function(reason) {
				swal('提示', '获取楼栋信息失败', 'error');
			});
		}
		fresh();
		
		
		//查询列表 与前端显示关联的变量
		$scope.select = {
			type:0,//0全部 1未缴 2缴费成功 3未发布 88错误日志
			BatchNo:'',//错误日志编号
			typechange : function(n){
				this.type = n;
				getList(1);
			},
			year : new Date().getFullYear(),
			yearNow : new Date().getFullYear(),
			month : new Date().getMonth()+1,
			monthNow : new Date().getMonth()+1,
			season:0,
			seasonNow:(new Date().getMonth())/3 +1,
			area:null,
			flat:null,
			unvsty:{
				label:$scope.vm.items[0].label
			},
			choose : function(type,area,flat){
				if(type==0 && !this.flat && !this.area)return;
				if(flat){
					if(this.flat && flat.FlatId == this.flat.FlatId) return;
					this.flat = flat;
				}else
					this.flat = null;
				if(area){
					if(this.area && area.AreaId == this.area.AreaId && this.flat == null) return;
					this.area = area;
				}else
					this.area = null;
				$scope.publish.type = type;
				getList(1);
			},
			title:function(){
				if(this.type==88) return '导入 ' + this.peroid() + ' 的错误日志';
				return this.year+ "年" + (this.month?(this.month + "月"):(this.season + '季度')) + " " 
				+ this.unvsty.label + (this.area?this.area.AreaName:"") + (this.flat?this.flat.FlatName:"");
			},
			peroid:function(){
				return this.year+ "年" + (this.month?(this.month + "月"):(this.season + '季度'));
			},
			plusing:false,
			yearPlus:function(n){
				if(this.year + n > this.yearNow || this.plusing) return;
				this.plusing = true;
				var that = this,start = this.month?this.month:this.season,plus;
				if(this.month){
					plus = function() {
						that.month += n;
						if(that.month > 12) {
							that.month = 1;
							that.year += n;
						}
						if(that.month < 1) {
							that.month = 12;
							that.year += n;
						}
						if(that.year == that.yearNow && that.month > that.monthNow){
							that.month--;that.plusing = false;
							getList(1);
						}
						else if(that.month != start){
							$timeout(plus,50);
						}else{
							that.plusing = false;getList(1);
						}
					};
						
				}else{
					plus = function() {
						that.season += n;
						if(that.season > 4) {
							that.season = 1;
							that.year += n;
						}
						if(that.season < 1) {
							that.season = 4;
							that.year += n;
						}
						if(that.year == that.yearNow && that.season > that.seasonNow){
							that.season--;that.plusing = false;
							getList(1);
						}
						else if(that.season != start){
							$timeout(plus,80);
						}else{
							that.plusing = false;getList(1);
						}
					};
				}
				plus();
			},
			setMonth : function(n){
				if(this.year == this.yearNow && n > this.monthNow)
					return;
				this.month= n;
				this.season = 0;
				getList(1);
			},
			setSeason:function(n){
				if(this.year == this.yearNow && n > this.seasonNow)
					return;
				this.season = n;
				this.month= 0;
				getList(1);
			},
			monthSetting : function(n){
				if(this.year > this.yearNow || (this.year==this.yearNow && this.monthNow<n))
					return 'disable';
				else if(this.month == n)
					return 'active';
				//else if(parseInt((n-1)/3) + 1 == this.season)
				//	return 'active';
				else return "";
			},
			seasonSetting : function(n){
				if(this.year > this.yearNow || (this.year==this.yearNow && this.seasonNow<n))
					return 'disable';
				else if(this.season == n)
					return 'active';
				else return "";
			}
		};
		//查询和取得列表
		$scope.dataList = [];
		$scope.logList = [
			{
				Amount:0,
				AreaName: "路北片区",
				BillPeroid: "2015年9月",
				Comments: "已支付，不能做批量导入",
				FlatName: "15号楼",
				Room: "1522"
			}
		];
		
		//翻页
		$scope.pageInfo = {
			pageSize:10,
			pageIndex:1,
			total:0,
			pagePlus : function(n){
				if((n>0 && this.pageIndex + n-1 > this.total/this.pageSize) ||(n<0 && this.pageIndex + n<1))
					return;
				this.pageIndex += n;
				getList();
			},
			sizeChange:function(n){
				if(n != this.pageSize){
					this.pageSize = n;
					getList(1);
				}
			}
		};
		var getList = function(pageIndex){
			//console.log($scope.select);
			if(pageIndex) $scope.pageInfo.pageIndex = pageIndex;
			$rootScope.loading = true;
			if($scope.select.type ==88){
				BillService.getLog($scope.select.BatchNo).success(function (response) {
					$rootScope.loading = false;
                    $scope.pageInfo.total = 0;
                    
					if(response.Status == "SUCCESS"){
						$scope.logList = response.Data.Logs;
						$scope.pageInfo.total = response.Data.TotalCount || 0;
					}else{
						$scope.logList = [];
					}
				}).error(function(reason) {
					$rootScope.loading = false;
					swal('提示', '服务器出错啦！', 'error');
				});
			}else
			BillService.getData({
				date:$scope.select.peroid(),
				type:$scope.select.type,
				area:$scope.select.area?$scope.select.area.AreaId:null,
				flat:$scope.select.flat?$scope.select.flat.FlatId:null,
				pageIndex:$scope.pageInfo.pageIndex,
				pageSize:$scope.pageInfo.pageSize
			}).success(function (response) {
	        	$scope.pageInfo.total = 0;
				$rootScope.loading = false;
				if(response.Status == "SUCCESS"){
					$scope.dataList = response.Data.Bills;
					$scope.pageInfo.total = response.Data.TotalCount;
				}else{
					//swal('提示', '没有查询到信息', 'error');
					$scope.dataList = [];
				}
	    	}).error(function(reason) {
				swal('提示', '服务器出错！', 'error');
				$rootScope.loading = false;
				$scope.dataList = [];
			});
		}
		getList();
		//发布功能
		$scope.publish = {
			type:0,
			save:function(){
				var param = $scope.select.peroid(),msg = "";
				switch(this.type){
					case 0:
						msg = '确定要向全校发布吗？';
					break;
					case 1:
						msg = '确定要向本生活区发布吗？';
						if($scope.select.area){
							param += '/' + $scope.select.area.AreaId;
						}else{
							swal('提示', '请在左侧选择生活区后重试！', 'error');
							return;
						}
						
					break;
					case 2:
						msg = '确定要向本楼发布吗？';
						if($scope.select.area){
							param += '/' + $scope.select.area.AreaId;
							if($scope.select.flat){
								param += '/' + $scope.select.flat.FlatId;
							}else{
								swal('提示', '请在左侧选择楼栋后重试！', 'error');
								return;
							}
						}else{
							swal('提示', '请在左侧选择生活区后重试！', 'error');
							return;
						}
					break;
				}
				//alert(param);
				swal({
					title: "请确认",
					text: msg,
					type: "info",
					showCancelButton: true,
					confirmButtonColor: "#26be4a",
					confirmButtonText: "发布",
					cancelButtonText: "取消",
					closeOnConfirm: false
					}, function(inputvalue) {
						if (inputvalue) {
							$rootScope.loading = true;
							BillService.publish(param).success(function (response) {
								$rootScope.loading = false;
								if(response.Status == "SUCCESS"){
									swal('成功啦!', '发布成功', 'success');
									getList();
								}else{
									swal('提示', '发布失败！', 'error');
								}
							}).error(function(reason) {
								$rootScope.loading = false;
								swal('提示', '服务器出错啦！', 'error');
							});
						}
				});
			}
		};
		//编辑
		$scope.edit = {
			item:null,
			editOn : function(item){
				$scope.dataList.forEach(function(record){
					record.edit = false;
				})
				item.edit = true;
				this.item = {Details:[]};
				this.item = _.extend(this.item,item);
				this.item.Details = [];
				for(var i=0;i<item.Details.length;i++){
					this.item.Details[i] = {};
					 _.extend(this.item.Details[i],item.Details[i]);
				}
			},
			editOff:function(item){
				item.edit = false;
			},
			save:function(){
				console.log(this.item);
				if(this.item.BStatus!='未发布' && this.item.BStatus!='未缴费'){
					swal('提示', this.item.BStatus + '不可修改！', 'error');
					return;
				}
				for(var i=0;i<this.item.Details.length;i++){
					
					if(this.item.Details[i].QEnd < this.item.Details[i].QStart){
						swal('提示', '终止数量不可以小于起始始量', 'error');
						return;
					}
				}
				$rootScope.loading = true;
				BillService.updateData({
					Id:this.item.Id,
					UniversityId:AppConfig.get_universityId(),
					//Flat:$scope.select.flat.FlatId?$scope.select.flat.FlatId:this.find(),
					Room:this.item.Room,
					Amount:this.item.TotalAmount,
					BillPeroid:$scope.select.peroid(),
					BillDetails:this.item.Details
				}).success(function (response) {
					$rootScope.loading = false;
					if(response.Status == "SUCCESS"){
						swal('成功啦!', '修改成功！', 'success');
						getList();
					}else{
						swal('提示', '修改失败！', 'error');
					}
				}).error(function(reason) {
					$rootScope.loading = false;
					swal('提示', '服务器出错啦！', 'error');
				});
			},
			compute:function(i){
				if(this.item.Details[i].QEnd - this.item.Details[i].QStart >0)
					this.item.Details[i].Quantity = this.item.Details[i].QEnd - this.item.Details[i].QStart;
				else this.item.Details[i].Quantity=0; 
				this.count(i);
			},
			count:function(i){
				//浮点小数精度处理
				this.item.Details[i].Amount = parseInt( 10000 * this.item.Details[i].UnitPrice * this.item.Details[i].Quantity,10)/10000;
				this.sum();
			},
			sum:function(){
				this.item.TotalAmount = 0;
				for(var detail in this.item.Details){
					this.item.TotalAmount += this.item.Details[detail].Amount;
				}
			},
		};
		//添加
		$scope.add = {
			item:{
				Area:{},
				Flat:{},
				Room:'',
				Amount:0,
				Details:[]
			},
			off:function(){
				this.edit = false;	
			},
			edit:false,
			details:null,
			addOn : function(){
				var that = this,reset = function(){
					that.item.Amount = 0;
					that.item.Room = '';
					if($scope.select.area){
						that.item.area = $scope.select.area;
						if($scope.select.flat)
							that.item.flat = $scope.select.flat;
						else
							that.item.flat = $scope.select.area.Flats[0];
					}else{
						that.item.area = $scope.vm.items[0].items[0];
						that.item.flat = $scope.vm.items[0].items[0].Flats[0];
					}
					for(var detail in that.details){
						that.item.Details[detail] = {
							BillItemId:that.details[detail].id,
							BillItem:that.details[detail].Desc,
							UnitPrice:parseFloat(that.details[detail].Price),
							Amount:0,
							QEnd:0,
							QStart:0,
							Quantity:0
						};
					}
					that.edit = true;
				}
				if(!this.details){
					$rootScope.loading = true;
					BillService.getForm().success(function (response) {
						$rootScope.loading = false;
						if(response.Status == "SUCCESS"){
							that.details = JSON.parse(response.Data);
							reset();
						}else{
							swal('提示', '没有读取到水电费配置', 'error');
						}
						console.log(that.details);
					}).error(function(reason) {
						$rootScope.loading = false;
						swal('提示', '服务器出错啦！', 'error');
					});
				}else{
					reset();
				}
				//console.log(this.item);
			},
			compute:function(i){
				if(this.item.Details[i].QEnd - this.item.Details[i].QStart >0)
					this.item.Details[i].Quantity = this.item.Details[i].QEnd - this.item.Details[i].QStart;
				else this.item.Details[i].Quantity=0; 
				this.count(i);
			},
			count:function(i){
				//浮点小数精度处理
				this.item.Details[i].Amount = parseInt( 10000 * this.item.Details[i].UnitPrice * this.item.Details[i].Quantity,10)/10000;
				this.sum();
			},
			sum:function(){
				this.item.Amount = 0;
				for(var detail in this.item.Details){
					this.item.Amount += this.item.Details[detail].Amount;
				}
			},
			addArea:function(area){
				this.item.area = area;
				this.item.flat = area.Flats[0];
			},
			addFlat:function(flat){
				this.item.flat = flat;
			},
			save:function(){
				var that = this;
				if(this.item.Room.length<1){
					swal('提示', '寝室名不可为空', 'error');
					document.getElementById('newItem').getElementsByTagName("input")[0].focus();
					return;
				}
				for(var i=0;i<this.item.Details.length;i++){
					
					if(this.item.Details[i].QEnd < this.item.Details[i].QStart){
						swal('提示', '终止数量不可以小于起始数量', 'error');
						return;
					}
				}
				$rootScope.loading = true;
				BillService.addData({
					UniversityId:AppConfig.get_universityId(),
					Flat:this.item.flat.FlatId,
					Room:this.item.Room,
					Amount:this.item.Amount,
					BillPeroid:$scope.select.peroid(),//$scope.select,
					BillDetails:this.item.Details
				}).success(function (response) {
					$rootScope.loading = false;
					if(response.Status == "SUCCESS"){
						swal('成功啦!', '添加成功', 'success');
						that.edit = false;
						getList();
					}else{
						swal('提示', '添加失败', 'error');
					}
				}).error(function(reason) {
					$rootScope.loading = false;
					swal('提示', '服务器出错啦！', 'error');
				});
			}
		};
		$scope.delete = function(item){
			if(item.BStatus!='未发布' && item.BStatus!='未缴费'){
					swal('提示', item.BStatus + '不可删除！', 'error');
					return;
				}
			if(item.BStatus !='已代扣'){
				swal({
					title: "请确认",
					text: "确认要删除吗？",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "删除",
					cancelButtonText: "取消",
					closeOnConfirm: false
					}, function(inputvalue) {
						if (inputvalue) {
							$rootScope.loading = true;
							BillService.deleteData(item.Id).success(function (response) {
								$rootScope.loading = false;
								if(response.Status == "SUCCESS"){
									swal('成功啦!', '删除成功', 'success');
									getList();
								}else{
									swal('提示', '删除失败！', 'error');
								}
							}).error(function(reason) {
								$rootScope.loading = false;
								swal('提示', '服务器出错啦！', 'error');
							});
						}
				});
				
			}
		};
		$scope.uploadFile = function(event){
        	var files = event.target.files;
			//console.log(files);
			if(files[0].name.split(".").pop() != "xls" && files[0].name.split(".").pop() != "xlsx"){
				swal('提示', '文件格式不正确！请上传*.xls或*.xlsx文件', 'error'); 
				return false;
			}
			var data = new FormData();
			if (!data) { swal('提示', '你的浏览器不支持文件上传！', 'error'); return false; };
			data.append('file', files[0]);
			var url = AppConfig.WEB_ROOT + "api/bill/import/" + $scope.select.peroid();
			swal({
				title: "请确认",
				text: "确认要导入 " + $scope.select.peroid() + " 的记录吗？",
				type: "info",
				showCancelButton: true,
				confirmButtonColor: "#5d9cec",
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				closeOnConfirm: false
				}, function(inputvalue) {
					if (inputvalue) {
						$rootScope.loading = true;
						swal({
							title: "请等待",
							text: "正在解析...（数据量太大时，需要较久的时间）",
							imageUrl: "../images/loading.gif",
							confirmButtonColor: "#ccc",
							confirmButtonText: "等待",
							closeOnConfirm: false
							},function(){}
						);
						$http.post(url,data,{ headers: { 'Content-Type': undefined }})
						.success(function (response) {
							$rootScope.loading = false;
							if(response.Status == "SUCCESS"){
								console.log(response.Data);
								var msg = "共从Excel文件中解析到" + response.Data.RecordCountInFile + '条记录，'
								+"成功向系统中导入了" + response.Data.ImportedRecords + '条记录';
								if(response.Data.NotImportedRecords>0){
									msg += "，有" + (response.Data.NotImportedRecords) + '条记录导入失败，详情请查看错误日志';
									swal({
										title: "导入完成",
										type:'success',
										text: msg,
										showCancelButton:true,
										confirmButtonColor: "#AEDEF4",
										confirmButtonText: "确定",
										cancelButtonText:'错误日志'
										},function(inputvalue){
											if (!inputvalue) {
												$scope.select.BatchNo = response.Data.BatchNo;
												$scope.select.typechange(88);
											}
											else{
												getList(1);
											}
										}
									);
								}else{
									swal('导入完成', msg, 'success');
									getList(1);
								}
								
							}else{
								swal('提示', response.Message, 'error');
							}
						}).error(function(reason) {
							$rootScope.loading = false;
							swal('提示', '服务器出错啦！', 'error');
						});
					}
			});
			
    	};
	})
	.factory('BillService', ['$http', 'AppConfig',
		function($http, AppConfig) {
			var url = AppConfig.WEB_ROOT + 'api/bill';
			var getData = function(param){
				var myUrl = url + '/' + param.date + '/' + (param.pageIndex) + '/' + param.pageSize + '/' + param.type;
		        if(param.area){
					myUrl += '/' + param.area;
					if(param.flat){
						myUrl += '/' + param.flat;
					}
				}
		        return $http.get(myUrl, null, {});
			}
			var getForm = function(){
				var myUrl = url + '/products';
				return $http.get(myUrl, null, {});
			}
            var saveForm = function(param){
				var myUrl = url + '/saveproducts';
				return $http.post(myUrl, param, {});
			}
			var addData = function(param){
				var myUrl = url;
				return $http.post(myUrl, param, {});
			}
			var updateData = function(param){
				var myUrl = url;
				return $http.put(myUrl, param, {});
			}
			var deleteData = function(param){
				var myUrl = url + '/' + param;
				return $http.delete(myUrl);
			}
			var publish = function(param){
				var myUrl = url + '/publish/' + param;
				return $http.put(myUrl);
			}
			var getLog = function(param){
				var myUrl = url + '/importlog/1/10/' + param;
				return $http.get(myUrl);
			}
			return {
				getData:getData,
				getForm:getForm,
                saveForm:saveForm,
				addData:addData,
				updateData:updateData,
				deleteData:deleteData,
				publish:publish,
				getLog:getLog
			};
		}
	]).directive('customOnChange', function() {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
			var onChangeHandler = scope.$eval(attrs.customOnChange);
			element.bind('change', onChangeHandler);
			}
		};
	});