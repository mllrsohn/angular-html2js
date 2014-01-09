var fs = require('fs');
var es = require('event-stream');
var Url = require('url');
var Readable = require('stream').Readable;
var concat = require('concat-stream');
var path = require('path');

module.exports = function (opts, xopts) {
    //borrowed from substack/node-browserify
    if (opts === undefined) opts = {};
    if (typeof opts === 'string') opts = { entries: [ opts ] };
    if (isStream(opts)) opts = { entries: [ opts ] };
    if (Array.isArray(opts)) opts = { entries: opts };

    if (xopts) Object.keys(xopts).forEach(function (key) {
        opts[key] = xopts[key];
    });

    var b = new Html2js(opts);
    [].concat(opts.entries).filter(Boolean).forEach(b.add.bind(b));
    return b;
}

function Html2js (opts) {
    if (opts.module === undefined) opts.module = 'templates';
    if (opts.standalone === undefined) opts.standalone = false;
    if (opts.prefix === undefined) opts.prefix = '';
    this.opts = opts;

    var rs = new Readable();
    rs.push("angular.module('" + opts.module + "'" + (opts.standalone ? ", []" : "") + ").run(['$templateCache', function($templateCache) {");
    rs.push("\n  'use strict';\n");
    rs.push(null);

    this.output = es.through(function write(data) {
            this.queue(data);
        },
        function end() {
            this.queue("\n}]);");
            this.queue(null);
        });

    rs.pipe(this.output, { end: false });
};


Html2js.prototype.add = function (file) {
    var _path = this.opts.prefix,
        self = this;

    file = (!isStream(file) ? fs.createReadStream(file) : file),

    file.on('error', function() {
        throw new Error('Could not read file or stream: ' + file.path);
    });

    // Force trailing slash
    if (_path.length) {
        _path = path.replace(/\/?$/, '/');
    }
    var filePath = path.relative(process.cwd(), file.path);
    _path += Url.format(Url.parse(filePath.replace(/\\/g, '/')));

    var compileTemplate = function (content, path) {
        //borrowed from ericclemmons/grunt-angular-templates
        content = content.split(/^/gm).map(function(line) {
            return JSON.stringify(line);
        }).join(' +\n    ') || '""';

        return "\n  $templateCache.put('" + _path + "',\n    " + content + "\n  );\n";
    };

    file.pipe(es.through(function write(file) {
        var $this = this;
        if (typeof self.opts.transform === 'function') {
            self.opts.transform(file.toString(), function(content) {
                $this.queue(compileTemplate(content, path));
            });
        } else {
            this.queue(compileTemplate(file.toString(), path));
        }
    })).pipe(this.output);
    return this;
}

Html2js.prototype.bundle = function (cb) {
    var self = this;
    if (typeof cb === 'function') {
        this.output.pipe(concat(function(data) {
            cb(data.toString());
        }));
    } else {
        return this.output;
    }
};


function isStream (x) {
    return x && typeof x === 'object' && typeof x.pipe === 'function';
}