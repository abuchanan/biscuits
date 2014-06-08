'use strict';

var fs = require('fs'),
    path = require('path'),
    browserify = require('browserify'),
    browserPack = require('browser-pack'),
    browserResolve = require('browser-resolve'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    watch = require('gulp-watch'),
    through = require('through'),
    traceurRuntimePath = require('traceur').RUNTIME_PATH,
    traceur = require('gulp-traceur'),
    exorcist = require('exorcist'),
    mold = require('mold-source-map'),
    globule = require('globule'),
    source = require('vinyl-source-stream'),
    karma = require('karma');


var karmaConfigPath = path.join(__dirname, 'test/karma.conf.js');
var preludePath = path.join(__dirname, 'mock_require.js');
var preludeContent = fs.readFileSync(preludePath, 'utf8');

var buildDir = path.join(__dirname, 'build');

var browserPackOpts = {
  "raw": true,
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
  //'./lib/*.js'
];

var testBundleName = 'test-bundle.js';
var testBundlePath = path.join(buildDir, testBundleName);
var sourceMapFile = path.join(buildDir, 'test-bundle.js.map');


gulp.task('browserify-test-bundle', function() {

  var files = globule.find({
    src: fooFiles,
  });

  var b = browserify({
    pack: browserPackFunction,
    resolve: browserResolveFunction,
  });

  function errorLogger(msg) {
    gutil.log(gutil.colors.red(msg));
  }

  return b
    .add(files)
    .bundle({debug: true})
    .on('error', errorLogger)
    .pipe(mold.transformSourcesRelativeTo(__dirname))
    .pipe(exorcist(sourceMapFile))
    .pipe(source(testBundleName))
    .pipe(gulp.dest(buildDir));
});


gulp.task('browserify-karma-start', function() {

  var karmaConfig = {
    configFile: karmaConfigPath,
    basePath: __dirname,
    autoWatch: true,
    files: [
      {pattern: sourceMapFile, included: false},
      {pattern: testBundlePath, sourceMap: sourceMapFile}
    ],
  };
  karma.server.start(karmaConfig);
});


gulp.task('build', function() {

  gulp.src('./lib/*.js', {base: __dirname}).pipe(gulp.dest(buildDir));

  return gulp
    .src(fooFiles, {base: __dirname})
    .pipe(traceur({modules: 'amd'}))
    .pipe(gulp.dest(buildDir));
});


gulp.task('karma-start', function() {

  var karmaConfig = {
    configFile: karmaConfigPath,
    basePath: __dirname,
    autoWatch: true,
    files: [
      //'node_modules/traceur/bin/traceur-runtime.js',
      //'lib/require.js',
      //{pattern: 'build/**/*.js', included: false},

      'node_modules/traceur/bin/traceur.js',
      'lib/es6-module-loader.js',
      //'node_modules/systemjs/dist/system.js',
      'test/bootstrap.js',
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false},
    ],
  };
  karma.server.start(karmaConfig);
});


// TODO does the watch process die on syntax error?
gulp.task('watch-test', ['karma-start'], function() {
  var toWatch = fooFiles;

  gulp.src(toWatch, {read: false})
    .pipe(watch(function(files) {
      gulp.start('build');
    }));
});
