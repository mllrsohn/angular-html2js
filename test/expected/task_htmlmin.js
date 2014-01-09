angular.module('task_htmlmin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('test/fixtures/two.html',
    "<h2>Two</h2><textarea readonly>We are two.</textarea>"
  );

}]);