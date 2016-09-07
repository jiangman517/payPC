'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
    .controller('AsideCtrl', function($scope, $state,AppConfig) {
        $scope.name = $state.current.name;
        console.log($scope.name);
        $scope.validateAccess = function(feature)
        {
        	 var features = AppConfig.get_features();
        	 if(features && features.indexOf(feature)>=0)
        	 {
        	 	return true;
        	 }
        	 return false;
        }
    });
