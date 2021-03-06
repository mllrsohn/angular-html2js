var Html2js = require('../');
var test = require('tape');
var fs = require('fs');

var f = function (filename) {
  return fs.createReadStream(__dirname + '/' + filename);
};

var e = function (filename) {
  return fs.readFileSync(__dirname + '/' + filename).toString();
};

test('event_leak', function (t) {
    t.plan(1);
    var html2js = Html2js({
        module: 'event_leak'
    });
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.add('./test/fixtures/two.html');
    html2js.bundle(function (actual) {
        var matches = actual.match(/test\/fixtures\/two.html/g);
        t.equal(matches.length, 13);
    });
});
