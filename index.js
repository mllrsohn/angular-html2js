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
    if (opts.angular === undefined) opts.angular = 'angular';
    if (opts.standalone === undefined) opts.standalone = false;
    if (opts.prefix === undefined) opts.prefix = '';
    this.opts = opts;

    var rs = new Readable();
    rs.push(opts.angular+".module('" + opts.module + "'" + (opts.standalone ? ", []" : "") + ").run(['$templateCache', function($templateCache) {");
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


    this.generatePath = function (filePath) {
        var _path = opts.prefix;

        // Force trailing slash
        if (_path.length) {
            _path = _path.replace(/\/?$/, '/');
        }

        filePath = path.relative(process.cwd(), filePath);
        _path += Url.format(Url.parse(filePath.replace(/\\/g, '/')));

        return _path;
    };

    this.compileTemplate = function (content, path) {
        //borrowed from ericclemmons/grunt-angular-templates
        content = content.split(/^/gm).map(function(line) {
            return JSON.stringify(line);
        }).join(' +\n    ') || '""';

        return "\n  $templateCache.put('" + path + "',\n    " + content + "\n  );\n";
    };
}


Html2js.prototype.add = function (file) {
    var self = this;

    file = (!isStream(file) ? fs.createReadStream(file) : file),
    file.on('error', function() {
        throw new Error('Could not read file or stream: ' + file.path);
    });

    if(!file.path) {
        throw new Error('Could not reading the stream');
    }

    var filePath = self.generatePath(file.path);
    file.pipe(es.through(function write(file) {
        var $this = this,
            html = file.toString();

        if (typeof self.opts.transform === 'function') {
            self.opts.transform(html, function(transformedContent) {
                $this.queue(self.compileTemplate(transformedContent, filePath));
            });
        } else {
            this.queue(self.compileTemplate(html, filePath));
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