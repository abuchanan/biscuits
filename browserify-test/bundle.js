//browserify -e test/run-tests.js -r ./src/notebook.js -r ./src/db.js -o test/test-bundle.js

var browserify = require('browserify');
var fs = require('fs');
var path = require('path');
//var through = require('through');

var preludePath = path.join(__dirname, 'mock_require.js');
var preludeContent = fs.readFileSync(preludePath, 'utf8');

var packOpts = {
  "raw": true,
  "sourceMapPrefix": '//@',
  "prelude": preludeContent,
  "preludePath": preludePath,
};
var browserPack = require('browser-pack');


var b = browserify({
  "pack": function(params) {
    return browserPack(packOpts);

    // TODO this shouldn't actually be needed now.
    /*
    p.pipe(through(function(data) {
      t.queue(data);
    }));

    var t = through(function(data) {
      //console.log('\n==========================\n');
      console.log(data);
      p.write(data);
    });
    return t;
    */
  },
});

// TODO find and add all tests as entry points
b.add([
  './test/suites/mockedModule.js',
  './test/suites/moduleCacheReset.js',
  './test/suites/moduleCacheReset2.js',
]);

b.bundle().pipe(process.stdout);
