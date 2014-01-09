angular.module('transform').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('test/fixtures/one.html',
    "<h1>transformed</h1>"
  );

}]);