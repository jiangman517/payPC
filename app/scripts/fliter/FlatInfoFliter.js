angular.module('payPcApp')
    .filter("flatinfo", function () {
        return function (flat, sep) {
            var flat_array = flat.split("-");
            var fin = '';
            if (sep === 'live') {
                fin = flat_array[0];
            } else if (sep === 'flat') {
                fin = flat_array[1];
            } else {
                fin = flat_array[2];
            }
            return fin;
        };
    })
     .filter("time_replace", function () {
         return function (detail) {
             var time = detail.UpdatedOn ? detail.UpdatedOn : detail.CreatedOn;
             var str = time.replace(/-/g, '/').replace("T", " ");
             var date = new Date(str);
             return date.format('MM-dd hh:mm');
         };
     })
     .filter('account_percent', function () {
         return function (detail) {
             var pre = Math.floor(detail / 5) * 5 / 100 * 360 + 90;
             console.log(pre);
             return pre + 'deg';
         };
     }).filter('userStatus', function () {
         return function (status) {
             return status === true ? '已激活' : '未激活';
         };
     }).filter('unixtimestamp', function ($filter) {
         return function (time) {
             if (!time)
             {
                 return '-';
             }
             var unixTimestamp = new Date(time * 1000);
             //var commonTime = unixTimestamp.setHours(unixTimestamp.getHours() + 8);
             //var d = new Date(commonTime);
             var commonTime = $filter('date')(unixTimestamp, 'yyyy-MM-dd HH:mm:ss');
             return commonTime;
         };
     });

