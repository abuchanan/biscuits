module.exports = function(config) {
  config.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['requirejs', 'sinon', 'traceur'],

    basePath: '..',

    files: [
      'test/lib/assert.js',
      'test/bootstrap.js',
      {pattern: 'test/runner.js', included: false},
      {pattern: 'test/annotations.js', included: false},
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false},
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'lib/di.js/**/*.js': ['traceur'],
      'src/**/*.js': ['traceur'],
      'test/runner.js': ['traceur'],
      'test/annotations.js': ['traceur'],
      'test/utils/**/*.js': ['traceur'],
      'test/suites/**/*.js': ['traceur'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    traceurPreprocessor: {
      options: {
        "modules": "amd",
        "sourceMap": true,
        "types": true,
        //"typeAssertions": true,
        //"typeAssertionModule": "rtts-assert",
        "annotations": true
      }
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    //logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    client: {
      mocha: {
        ui: 'tdd',
      },
    }
  });
};
