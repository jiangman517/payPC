'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */

// 路径配置

angular.module('payPcApp')
    .controller('StatisticsCtrl', function($scope, CityData) {
        console.log('StatisticsCtrl');
        require.config({
            paths: {
                echarts: 'http://echarts.baidu.com/build/dist'
            }
        });
        var vm = $scope.vm = {};
        vm.countries = CityData;
        // 更换国家的时候清空省
        $scope.$watch('vm.country', function(country) {
            vm.province = null;
        });
        // 更换省的时候清空城市
        $scope.$watch('vm.province', function(province) {
            vm.city = null;
        });


        $scope.get_data = function() {
            require(
                [
                    'echarts',
                    'echarts/chart/line',
                    'echarts/chart/bar' // 使用柱状图就加载bar模块，按需加载
                ],
                function(ec) {
                    // 基于准备好的dom，初始化echarts图表
                    var myChart = ec.init(document.getElementById('main'));

                    var option = {
                        title: {
                            text: '某地区蒸发量和降水量',
                            subtext: '纯属虚构'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            data: ['蒸发量', '降水量']
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                mark: {
                                    show: true
                                },
                                dataView: {
                                    show: true,
                                    readOnly: false
                                },
                                magicType: {
                                    show: true,
                                    type: ['line', 'bar']
                                },
                                restore: {
                                    show: true
                                },
                                saveAsImage: {
                                    show: true
                                }
                            }
                        },
                        calculable: true,
                        xAxis: [{
                            type: 'category',
                            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                        }],
                        yAxis: [{
                            type: 'value'
                        }],
                        series: [{
                            name: '蒸发量',
                            type: 'bar',
                            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
                            markPoint: {
                                data: [{
                                    type: 'max',
                                    name: '最大值'
                                }, {
                                    type: 'min',
                                    name: '最小值'
                                }]
                            },
                            markLine: {
                                data: [{
                                    type: 'average',
                                    name: '平均值'
                                }]
                            }
                        }, {
                            name: '降水量',
                            type: 'bar',
                            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
                            markPoint: {
                                data: [{
                                    name: '年最高',
                                    value: 182.2,
                                    xAxis: 7,
                                    yAxis: 183,
                                    symbolSize: 18
                                }, {
                                    name: '年最低',
                                    value: 2.3,
                                    xAxis: 11,
                                    yAxis: 3
                                }]
                            },
                            markLine: {
                                data: [{
                                    type: 'average',
                                    name: '平均值'
                                }]
                            }
                        }]
                    };

                    // 为echarts对象加载数据 
                    myChart.setOption(option);
                }
            );
        }



    })
    .constant('CityData', [{
        label: '钱江湾',
        provinces: [{
            label: '1号楼',
            cities: [{
                label: '101'
            }, {
                label: '102'
            }, {
                label: '103'
            }]
        }, {
            label: '2号楼',
            cities: [{
                label: '101'
            }, {
                label: '102'
            }, {
                label: '103'
            }]
        }]
    }, {
        label: '金沙港',
        provinces: [{
            label: '31号楼',
            cities: [{
                label: '101'
            }, {
                label: '102'
            }]
        }, {
            label: '32号楼',
            cities: [{
                label: '101'
            }, {
                label: '102'
            }]
        }]
    }]);
