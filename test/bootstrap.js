(function(karma) {

  var allTestFiles = [];
  var SUITE_REGEXP = /test\/suites\/.*\.js/i;
  var TEST_FUNC_REGEXP = /^test/;

  var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  };

  Object.keys(window.__karma__.files).forEach(function(file) {
    if (SUITE_REGEXP.test(file)) {
      // Normalize paths to RequireJS module names.
      allTestFiles.push(pathToModule(file));
    }
  });

  // TODO(abuchanan) dev/debugging only
  allTestFiles = ['test/suites/keyboardInput'];

  console.log(allTestFiles);

  // Extend a given object with all the properties in passed-in object(s).
  function extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }

  function skipTest(testFunc) {
    // TODO(abuchanan) support annotation, testFunc.skip = true
    // TODO(abuchanan) support skip entire suite
    return false;
  }

  function runTest(testFunc) {
    var skipped = false;
    var success = true;
    var log = [];
    var time = 0;

    if (skipTest(testFunc)) {
      skipped = true;
    } else {
      var start = Date.now();
      try {
        testFunc();
      } catch (e) {
        success = false;
        log.push(e.stack);
      }
      time = Date.now() - start;
    }

    return {
      skipped: skipped,
      success: success,
      log: log,
      time: time,
    };
  }

  karma.start = function(config) {

    var testNames = [];
    var tests = [];

    allTestFiles.forEach(function(filename) {
      var mod = require(filename);
      for (var key in mod) {
        if (TEST_FUNC_REGEXP.test(key) && typeof mod[key] == 'function') {
          testNames.push(key);
          tests.push({
            id: key,
            // TODO description
            suite: [filename],
            func: mod[key]
          });
        }
      }
    });

    karma.info({
      total: tests.length,
      specs: testNames,
    });

    var resultDefaults = {
      id: 'unknown',
      description: '',
      suite: [],
      log: [],
      skipped: false,
      success: false,
      time: 0,
    };

    tests.forEach(function(test) {
      var result = extend({}, resultDefaults, test, runTest(test.func));
      karma.result(result);
    });

    karma.complete();
  };

  require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',
    deps: allTestFiles,
    callback: karma.start,

    map: {
      '*': {
        'di': 'lib/di.js/index'
      }
    },
  });

})(window.__karma__);
