// This initializes our requirejs config for testing.

(function(requirejs) {
  var testFiles = [];
  var testRx = /suites\/.*\.js$/; 

  var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  };

  Object.keys(window.__karma__.files).forEach(function(file) {
    console.log(file);
    if (testRx.test(file)) {
      // Normalize paths to RequireJS module names.
      var path = pathToModule(file);
      //var path = file;
      console.log(file, path);
      testFiles.push(path);
    }
  });

  requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {
      'test': '/base/test',
      'EventEmitter': '/base/bower_components/eventEmitter/EventEmitter',
    },

    shim: {
    },

    // ask Require.js to load these files (all our tests)
    deps: testFiles,

    // start test run, once Require.js is done
    callback: window.__karma__.start
  });

})(requirejs);
