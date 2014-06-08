(function(requirejs) {

  System.baseURL = '/base/';

  window.__karma__.start = function() {

    System
      .import('test/suites/scenarios/playerMovement')
      .catch(function(err) {
        setTimeout(function() {
          //console.error(err);
          //console.log(err);
          //console.log(System.failed);
          throw err;
        });
      });
  };
})();

/*
// This initializes our requirejs config for testing.

(function(requirejs) {
  var testFiles = [];
  var testRx = /test\/suites\/.*\.js$/; 

  var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  };

  Object.keys(window.__karma__.files).forEach(function(file) {
    if (testRx.test(file)) {
      // Normalize paths to RequireJS module names.
      var path = pathToModule(file);
      testFiles.push(path);
    }
  });

  testFiles = ['test/suites/scenarios/playerMovement'];

  requirejs.config({
    baseUrl: '/base/build/',

    paths: {
    },

    // ask Require.js to load these files (all our tests)
    deps: testFiles,

    // start test run, once Require.js is done
    callback: window.__karma__.start
  });

})(requirejs);
*/
