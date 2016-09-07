'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp').factory('TreeData', function($http, AppConfig) {
	/**
	 * 能够自动处理树形数据联动的类，子节点列表必须命名为items。同时，节点会被增加三个属性：checked, folded, intermediate
	 * @example
	 * var data = new TreeData([
	 *   {
	 *     label: 'a',
	 *     items: [
	 *       {
	 *         label: 'a1'
	 *       },
	 *       {
	 *         label: 'a2'
	 *       }
	 *     ]
	 *   },
	 *   {
	 *     label: 'b',
	 *     items: [
	 *       {
	 *         label: 'b1'
	 *       },
	 *       {
	 *         label: 'b2'
	 *       }
	 *     ]
	 *   }
	 * ]);
	 * @param tree {Array.<Object>}
	 * @param cbIsSame {function(Object, Object):boolean}
	 * @constructor
	 */
	function TreeData(tree, cbIsSame) {
		var _this = this;
		this.tree = tree;
		this.isSame = cbIsSame || function(item1, item2) {
			return item1 === item2
		};
		/**
		 * 折叠/展开
		 * @param item {Object}
		 * @param folded
		 * @private
		 */
		this._fold = function(item, folded) {
			item.folded = folded;
		};
		/**
		 * 折叠指定的节点
		 * @param item {Object}
		 */
		this.fold = function(item) {
			this._fold(item, true);
		};
		/**
		 * 展开指定的节点
		 * @param item {Object}
		 */
		this.unfold = function(item) {
			this._fold(item, false);
		};
		/**
		 * 切换节点的折叠状态
		 * @param item {Object}
		 */
		this.toggleFold = function(item) {
			this._fold(item, !item.folded);
		};
		/**
		 * 检查指定节点的折叠状态
		 * @param item {Object}
		 * @returns {boolean}
		 */
		this.isFolded = function(item) {
			return item.folded;
		};
		this.additem = function(item, level) {
			if (level === 3) {
				item.items.push({
					labelD: '新楼',
					label: '新楼',
					edit: true,
					paymode:_this.paymode
				})
			}
			if (level === 2) {
				item.items.push({
					labelD: '新生活区',
					label: '新生活区',
					edit: true,
					items: []
				})
			}

		};
		this.updateitem = function(item, level, liveArea,event) {
			if(!item.edit )
			{
				item.edit=item.showdelete = false;
				return;
			}
			
			if(event && event.keyCode!=13  )
			{
				return;
			}
			
			var url = '';
			var param = {};
			
			item.edit=item.showdelete = false;
			if (!item.labelD && item.labelD === '' && item.id) {
				return;
			}
			switch (level) {
				case 2:
					if (item.id) {
						url = AppConfig.WEB_ROOT + 'api/area/ua';
						param = {
							areaName: item.labelD,
							areaId: item.id,
							
						};
						$http.put(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS') {
								swal('成功啦!', '修改成功', 'success');
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
						});
					} else {
						url = AppConfig.WEB_ROOT + 'api/area';
						param = {
							areaName: item.label,
							universityId: AppConfig.get_universityId()
						};
						$http.post(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS' && data.Data) {
								item.id = data.Data;
								swal('成功啦!', '添加成功', 'success');
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
						});
					}
					break;
				case 3:
					if (item.id) {
						url = AppConfig.WEB_ROOT + 'api/flat/uf';
						param = {
							flatName: item.labelD,
							flatId: item.id,
							PayMode:item.paymode
						};
						$http.put(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS') {
								swal('成功啦!', '修改成功', 'success');
							}else
							{
								swal('提示', data.Message, 'error');
								item.edit=item.showdelete = true;
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 　'error');
						});
					} else {
						url = AppConfig.WEB_ROOT + 'api/flat';

						param = {
							flatName: item.labelD,
							areaId: liveArea.id,
							universityId: AppConfig.get_universityId()
						};
						$http.post(url, param, {}).success(function(data) {
							if (data && data.Status === 'SUCCESS' && data.Data) {
								item.id = data.Data;
								swal('成功啦!', '添加成功', 'success');
							}else
							{
								swal('提示', data.Message, 'error');
								item.edit=item.showdelete = true;
							}
						}).error(function(reason) {
							var message = '网络错误，请稍后重试。';
							if (reason && reason.Status === 'FAIL') {
								message = message + reason.Message;
							}
							sweetAlert('提示', message, 'error');
						});
					}
					break;
				default:
					break;
			}
			
			if(!item.edit)
			{
				if (item.labelD != item.label) {				
					item.label = item.labelD;
			    }
			   item.labelD = '';
		    }
		};
		this.startEdit = function(item) {
			if (item.edit) {
				return;
			}
			item.edit = true;
			item.labelD = item.label;
		};
		
		this._delete = function(url,item, parentitem) {
			$http.delete(url).success(function(data, status) {
				if (data && data.Status === 'SUCCESS') {
					parentitem.items = _.filter(parentitem.items, function(detail) {
						return detail.label != item.label;
					});
					swal('成功啦!', '删除成功', 'success');
				} else
				{
					swal('提示', data.Message, 'error');
				}
			}).error(function(reason) {
				var message = '网络错误，请稍后重试';
				if (reason && reason.Status === 'FAIL') {
					message = message + reason.Message;
				}
				sweetAlert('提示', message, 'error');
			});
		};
		
		this.deleteitem = function(item, parentitem, level) {
			if (!item) {
				return;
			}
			if(!item.id)
			{
				parentitem.items = _.filter(parentitem.items, function(detail) {
						return detail.id != item.id;
					});
				return;
			}
			var url = '';
			switch (level) {
				case 2:

					url = AppConfig.WEB_ROOT + 'api/area/da/' + item.id;
					break;
				case 3:
					url = AppConfig.WEB_ROOT + 'api/flat/df/' + item.id;
					break;
				default:
					break;

			}
			if (url === '') {
				return;
			}
			if (item.items && item.items.length > 0) {
				swal({
					title: "请确认",
					text: "要删除的节点下面存在子节点，是否要删除？",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "删除",
					cancelButtonText: "取消",
					closeOnConfirm: false
				}, function(inputvalue) {
					if (inputvalue === false) {
						return;
					}
					
					_this._delete(url,item, parentitem);
				});
			} else {
				swal({   
					title: "提示",   
					text: "确定要删除吗？",   
					type: "warning",   
					showCancelButton: true,   
					confirmButtonColor: "#DD6B55",   
					confirmButtonText: "确定删除",   
					cancelButtonText:"取消",
					closeOnConfirm: false 
					}, 
					function(){   
						_this._delete(url,item, parentitem);
					});
				
			}

		};
		
		
		/**
		 * 递归检查指定节点是否有选中状态的子节点，不检查当前节点状态
		 * @param item {Object} 起始节点
		 * @return {boolean}
		 */
		this.hasCheckedChildren = function(item) {
			return !!_.find(item.items, function(subItem) {
				return subItem.checked || _this.hasCheckedChildren(subItem);
			});
		};
		/**
		 * 递归检查指定节点是否有未选中状态的子节点，不检查当前节点状态
		 * @param item {Object} 起始节点
		 * @return {boolean}
		 */
		this.hasUncheckedChildren = function(item) {
			return !!_.find(item.items, function(subItem) {
				return !subItem.checked || _this.hasUncheckedChildren(subItem);
			});
		};
		/**
		 * 指定节点是否半选状态，但不检查当前节点。即：既有被选中的子节点，也有未选中的子节点
		 * @param item {Object} 起始节点
		 * @return {boolean}
		 */
		this.hasSemiCheckedChildren = function(item) {
			return this.hasCheckedChildren(item) && this.hasUncheckedChildren(item);
		};
		/**
		 * 当前节点是否半选状态，hasSemiCheckedChildren的别名
		 * @param item {Object}
		 * @returns {boolean}
		 */
		this.isSemiChecked = function(item) {
			return this.hasSemiCheckedChildren(item);
		};
		/**
		 * 更新item的父级节点，重新检查它们的checked和semiChecked状态
		 * @param items
		 * @param item
		 * @private
		 */
		this._updateParents = function(items, item) {
			_.each(items, function(subItem) {
				if (_this.hasChildren(subItem, item)) {
					// 先要递归更新子级，否则中间节点的状态可能仍然处于选中状态，会影响当前节点的判断
					_this._updateParents(subItem.items, item);
					subItem.checked = _this.hasCheckedChildren(subItem);
					subItem.semiChecked = _this.isSemiChecked(subItem);
				}
			});
		};
		this.updateChecked = function(item) {
			this._updateParents(this.tree, item);
		};
		/**
		 * 选中/反选指定节点
		 * @param item {Object}
		 * @param checked {boolean}
		 * @private
		 */
		this._check = function(item, checked) {
			item.checked = checked;
			// 把当前节点的选中状态应用到所有下级
			_.each(item.items, function(subItem) {
				_this._check(subItem, checked);
			});
			// 自动更新所有上级的状态
			this._updateParents(this.tree, item);
		};
		this._find = function(items, item) {
			if (!items)
				return null;
			// 在子节点中查找
			for (var i = 0; i < items.length; ++i) {
				var subItem = items[i];
				// 如果找到了则直接返回
				if (this.isSame(subItem, item))
					return subItem;
				// 否则递归查找
				var subResult = _this._find(subItem.items, item);
				if (subResult)
					return subResult;
			}
			return null;
		};
		/**
		 * 查找指定的节点，会使用cbIsSame参数
		 * @param item
		 * @returns {Object}
		 */
		this.find = function(item) {
			return this._find(this.tree, item);
		};
		/**
		 * parent及其子节点中有没有指定的subItem节点
		 * @param parent {Object}
		 * @param subItem {Object|Array}
		 * @returns {boolean}
		 */
		this.hasChildren = function(parent, subItem) {
			var subItems = _.isArray(subItem) ? subItem : [subItem];
			return !!_.find(subItems, function(subItem) {
				return _this._find(parent.items, subItem);
			});
		};
		/**
		 * 选中节点
		 * @param item {Object}
		 * @param checked {boolean}
		 */
		this.check = function(item, checked) {
			item = this.find(item);
			this._check(item, checked || angular.isUndefined(checked));
		};
		/**
		 * 反选节点
		 * @param item {Object}
		 */
		this.uncheck = function(item) {
			item = this.find(item);
			this._check(item, false);
		};
		/**
		 * 切换节点的选中状态
		 * @param item {Object}
		 */
		this.toggleCheck = function(item) {
			item = this.find(item);
			this._check(item, !item.checked);
		};
		/**
		 * 指定节点是否被选中
		 * @param item {Object}
		 * @returns {boolean}
		 */
		this.isChecked = function(item) {
			item = this.find(item);
			return item.checked;
		};
	}
	return TreeData;
});