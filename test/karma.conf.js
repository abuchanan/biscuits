// Karma configuration
// Generated on Wed May 14 2014 23:23:53 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // frameworks to use
    frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],

    client: {
      mocha: {
        ui: 'tdd',
      },
    },

    // list of files / patterns to load in the browser
    files: [
      'bower_components/requirejs/require.js',
      {pattern: 'bower_components/eventEmitter/EventEmitter.js', included: false},
      //'../bower_components/underscore/underscore.js',
      //'../bower_components/q/q.js',
      //'../bower_components/pixi/bin/pixi.dev.js',

      //'../src/*',

      // This format, with "included: false", is important because
      // we need to let Requirejs do the loading. Without this,
      // Karma loads the scripts outside of Requirejs and causes errors,
      // like http://requirejs.org/docs/errors.html#mismatch
      {pattern: 'src/QuadTree.js', included: false},
      {pattern: 'src/World.js', included: false},

      {pattern: 'src/ImageGrid.js', included: false},
      {pattern: 'src/ActiveBackgroundRegion.js', included: false},

      {pattern: 'test/suites/*.js', included: false},

      'test/init-require.js',
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: [],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
