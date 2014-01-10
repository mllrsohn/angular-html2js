var Html2js = require('../');
var test = require('tape');
var fs = require('fs');

var f = function (filename) {
  return fs.createReadStream(__dirname + '/' + filename);
};

var e = function (filename) {
  return fs.readFileSync(__dirname + '/' + filename).toString();
};

test('html5', function (t) {
    t.plan(1);
    var html2js = Html2js({module: 'html5'});
    html2js.add(f('fixtures/html5.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/html5.js'));
    });
});

test('custom_angular', function (t) {
    t.plan(1);
    var html2js = Html2js({module: 'custom_angular', angular: 'myAngular'});
    html2js.add(f('fixtures/one.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/custom_angular.js'));
    });
});

test('default_module', function (t) {
    t.plan(1);
    var html2js = Html2js();
    html2js.add(f('fixtures/two.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/default_module.js'));
    });
});

test('two_files', function (t) {
    t.plan(3);
    var html2js = Html2js();
    html2js.add(f('fixtures/two.html'));
    html2js.add(f('fixtures/one.html'));
    html2js.bundle(function (actual) {
      var one = e('expected/complied_one.js');
      var two = e('expected/complied_two.js');
      var header = actual.match(/angular.module\('templates'\).run\(\['\$templateCache'/g);
      // we can't use one expeced file,
      // because we don't know the order of the stream
      // So we use indexOf and match
      t.notEqual(actual.indexOf(one), -1);
      t.notEqual(actual.indexOf(two), -1);
      t.notEqual(header, null);
    });
});

test('custom_prefix', function (t) {
    t.plan(1);
    var html2js = Html2js({module: 'custom_prefix', prefix: '/static'});
    html2js.add(f('fixtures/one.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/custom_prefix.js'));
    });
});

test('transform', function (t) {
    t.plan(1);
    var html2js = Html2js({
      module: 'transform',
      transform: function(html, callback) {
        callback('<h1>transformed</h1>');
      }
    });
    html2js.add(f('fixtures/one.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/transform.js'));
    });
});


test('standalone', function (t) {
    t.plan(1);
    var html2js = Html2js({module: 'standalone', standalone: true});
    html2js.add(f('fixtures/two.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/standalone.js'));
    });
});

test('custom_replace', function (t) {
    t.plan(1);
    var html2js = Html2js({module: 'custom_replace', replace: 'fixtures'});
    html2js.add(f('fixtures/one.html'));
    html2js.bundle(function (actual) {
      t.equal(actual, e('expected/custom_replace.js'));
    });
});