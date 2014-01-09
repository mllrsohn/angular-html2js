var Html2js = require('../');
var test = require('tape');
var fs = require('fs');
var minify = require('html-minifier').minify;

var f = function (filename) {
  return fs.createReadStream(__dirname + '/' + filename);
};

var e = function (filename) {
  return fs.readFileSync(__dirname + '/' + filename).toString();
};

test('task_htmlmin', function (t) {
    t.plan(1);
    var html2js = Html2js({
        module: 'task_htmlmin',
        transform: function (html, callback) {
            callback(minify(html, {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true,
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }));
        }
    });
    html2js.add(f('fixtures/two.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/task_htmlmin.js'));
    });
});
