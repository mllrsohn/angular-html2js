angular-html2js [![Build Status][travis-image]][travis-url]
=======

> Standalone script to turn Angular template into js that supports streams.
> 
> Note: This is a standalone tool.
> If you need a grunt-task use the excellent
> [grunt-angular-templates](https://github.com/ericclemmons/grunt-angular-templates). (The test suite and output are almost the same)

Install
-----
```
$ npm install angular-html2js
```

Usage
-----
```javascript
Html2js = require('angular-html2js');

var html2js = Html2js();
html2js.add('path/to/template1.html');
html2js.add('path/to/template2.html');
html2js.bundle().pipe(process.stdout);

// or use the entries option
var fs = require('fs');
var html2js = Html2js({
    module: 'myTempaltes',
    entries: ['path/to/template1.html', 'path/to/template2.html'],
}).bundle().pipe(fs.createWriteStream('myTemplates.js'));

// or add a stream
var html2js = Html2js({ module: 'myTempaltes'})
  .add(fs.createReadStream('path/to/template2.html'))
  .bundle()
  .pipe(process.stdout);

// or use the html-minifier to transform your stuff
var minify = require('html-minifier').minify;
Html2js({
    entries: ['./test.html', './test2.html'],
    standalone: true,
    module: 'Test',
    transform: function (html, callback) {
        html = minify(html, { removeComments: true });
        callback(html);
    }
}).bundle().pipe(process.stdout);

```

## Options

### angular

> Global namespace for Angular.

If you use `angular.noConflict()`, then set this value to whatever you
re-assign angular to.  Otherwise, it defaults to `angular`.

### prefix

> `String` to prefix template URLs with.
Defaults to `''`

### standalone

> Boolean indicated if the templates are part of an existing module or a standalone.
Defaults to `false`.

### replace

> `String` will be replaced with `''`
Defaults to `''`

### transform

> Callback to modify a single entry. Requires a callback. Example

```js
transform: function(html, callback) {
  callback(html.toUpperCase());
}
```



ToDo
-----
- Impement empty file
- Impement empty result if there is no file
- Cleanup

[travis-url]: http://travis-ci.org/mllrsohn/angular-html2js
[travis-image]: https://secure.travis-ci.org/mllrsohn/angular-html2js.png?branch=master
