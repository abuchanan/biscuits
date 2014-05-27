'use strict';

var fs = require('fs');
var path = require('path');

var browserify = require('browserify');
var browserPack = require('browser-pack');
var browserResolve = require('browser-resolve');

var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var through = require('through');
var exorcist = require('exorcist');

var globule = require('globule');
var source = require('vinyl-source-stream');
var karma = require('karma').server;

var karmaConfigPath = path.join(__dirname, 'test/karma.conf.js');
var preludePath = path.join(__dirname, 'mock_require.js');
var preludeContent = fs.readFileSync(preludePath, 'utf8');

var buildDir = path.join(__dirname, 'build');

var browserPackOpts = {
  "raw": true,
  "sourceMapPrefix": '//@',
  "prelude": preludeContent,
  "preludePath": preludePath,
};

function browserPackFunction(params) {
  return browserPack(browserPackOpts);
}

function browserResolveFunction(pkg, opts, cb) {
  opts.paths = [__dirname];
  return browserResolve(pkg, opts, cb);
}

// TODO rename/reorganize
var fooFiles = [
  './src/**/*.js',
  './test/suites/**/*.js',
  './test/utils/**/*.js',
  './test/mocks/**/*.js',
  './lib/*.js'
];

var testBundleName = 'test-bundle.js';
var testBundlePath = path.join(buildDir, testBundleName);
var sourceMapFile = path.join(buildDir, 'test-bundle.js.map');

// TODO if the browserify build fails on a simple syntax error,
//      the gulp process dies...lame!
gulp.task('build-test-bundle', function() {

  var files = globule.find({
    src: fooFiles,
  });

  var b = browserify({
    pack: browserPackFunction,
    resolve: browserResolveFunction,
  });

  b.add(files)
    .bundle({debug: true})
    .on('error', function(msg) {
      gutil.log(gutil.colors.red(msg));
    })
    .pipe(exorcist(sourceMapFile))
    .pipe(source(testBundleName))
    .pipe(gulp.dest(buildDir));
});


var karmaStarted = false;

gulp.task('karma', function() {
  if (karmaStarted) {
    return;
  }

  var errorHandler = function(exitCode) {
    console.log('Karma has exited with code ' + exitCode);

    // TODO figure out how to stop gulp nicely on Ctrl + C
    if (exitCode == 0) {
      process.kill();
    }
  };

  var karmaConfig = {
    configFile: karmaConfigPath,
    basePath: __dirname,
    files: [testBundlePath],
  };

  karma.start(karmaConfig, errorHandler);
  karmaStarted = true;
});


gulp.task('test', ['build-test-bundle', 'karma']);

gulp.task('watch-test', function() {
  var toWatch = fooFiles;

  // TODO this is firing twice for some odd reason
  //      this was because of how vim was saving.
  //      put a note in some dev docs about this, solution was
  //      set backupcopy=yes
  //gulp.start('build-test-bundle', 'karma');

  gulp.src(toWatch, {read: false})
    .pipe(watch({emit: 'all'}, function(files) {
      gulp.start('build-test-bundle', 'karma');
    }));
});
