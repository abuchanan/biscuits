// This initializes our requirejs config for testing.

(function(requirejs) {
  var testFiles = [];
  var testRx = /suites\/.*\.js$/; 

  var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  };

  Object.keys(window.__karma__.files).forEach(function(file) {
    if (testRx.test(file)) {
      // Normalize paths to RequireJS module names.
      var path = pathToModule(file);
      //var path = file;
      testFiles.push(path);
    }
  });

  requirejs.config({
    //context: 'test-loader',
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {
      'test': '/base/test',
      'EventEmitter': '/base/bower_components/eventEmitter/EventEmitter',

      // TODO I don't like exposing Squire to all the scripts
      'Squire': '/base/bower_components/squire/src/Squire',

      'injector': '/base/test/injector',
    },

    // ask Require.js to load these files (all our tests)
    deps: testFiles,

    // start test run, once Require.js is done
    callback: window.__karma__.start
  });

  requirejs.config({
    context: 'injector-context',
    baseUrl: '/base/src',

    // TODO this needs to match for every future external library
    //      which is not DRY
    paths: {
      'EventEmitter': '/base/bower_components/eventEmitter/EventEmitter',
    },
  });

  // TODO something here should havea setup() for all tests that clears
  //      the injector mocks

})(requirejs);
