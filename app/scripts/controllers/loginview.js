'use strict';

/**
 * @ngdoc function
 * @name payPcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the payPcApp
 */
angular.module('payPcApp')
    .controller('LoginViewCtrl', function($scope, $http, loginservice,$rootScope) {
        $scope.remember = getCookie('rmbUserInHQB')?true:false;
        $scope.username = getCookie('userNameInHQB')||"";
        $scope.recover = function(){
            sweetAlert("提示","忘记密码请致电 0571-28256212","info");
        }
        $scope.myKeyup = function(e){
            var keycode = window.event?e.keyCode:e.which;
            if(keycode==13){
                $scope.login($scope.username,$scope.password)
            }
        };
        $scope.login = function(username, password) {
            //console.log(username);
            //console.log(password);
            if($scope.remember){
                setCookie('rmbUserInHQB','true');
                setCookie('userNameInHQB',$scope.username);
            }
            else{
                delCookie('rmbUserInHQB');
                delCookie('userNameInHQB');
            }
            $rootScope.loading = true;
            loginservice.getPrivate({
                username: username,
                password: password,
                callback:function(){
                    $rootScope.loading = false;
                }
            });
        }
        
        //写cookies 
        function setCookie(name,value) 
        { 
            var Days = 30; 
            var exp = new Date(); 
            exp.setTime(exp.getTime() + Days*24*60*60*1000); 
            document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
        } 
        //读取cookies 
        function getCookie(name) 
        { 
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        
            if(arr=document.cookie.match(reg))
        
                return unescape(arr[2]); 
            else 
                return null; 
        } 
        //删除cookies 
        function delCookie(name) 
        { 
            var exp = new Date(); 
            exp.setTime(exp.getTime() - 1); 
            var cval=getCookie(name); 
            if(cval!=null) 
                document.cookie= name + "="+cval+";expires="+exp.toGMTString(); 
        } 
    });
    
