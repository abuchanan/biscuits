// TODO custom karma reporter
//TODO file bug with es6-module-loader about instanceof bug

/*
  System.config({
    baseURL: '/base/',
    map: {
      'di': 'lib/di.js/index',
    },
  });
  //System.baseURL = '/base/';

  window.__karma__.start = function() {

    System
      .import('test/suites/scenarios/playerMovement')
      .catch(function(err) {
        setTimeout(function() {
          //console.error(err.stack);
          //console.log(err);
          //console.log(System.failed);
          throw err;
        });
      });
  };
  */

var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    //'rtts-assert': './node_modules/rtts-assert/dist/amd/assert'
  },

  map: {
    '*': {
      'di': 'lib/di.js/index'
    }
  },

  // dynamically load all test files
  deps: ['test/suites/scenarios/sceneLoad'],

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

window.__karma__.start = function() {};
