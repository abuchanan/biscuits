'use strict';

var path = require('path'),
    gulp = require('gulp'),
    traceur = require('gulp-traceur'),
    karma = require('karma');


var karmaConfigPath = path.join(__dirname, 'test/karma.conf.js');
var buildDir = path.join(__dirname, 'build');

// TODO rename/reorganize
var files = [
  './src/**/*.js',
  './test/suites/**/*.js',
  './test/utils/**/*.js',
  './test/mocks/**/*.js',
];


gulp.task('build', function() {

  gulp.src('./lib/*.js', {base: __dirname}).pipe(gulp.dest(buildDir));

  return gulp
    .src(files, {base: __dirname})
    .pipe(traceur({modules: 'amd'}))
    .pipe(gulp.dest(buildDir));
});


gulp.task('karma-start', function() {

  var karmaConfig = {
    configFile: karmaConfigPath,
    basePath: __dirname,
    autoWatch: true,
    files: [
      'node_modules/traceur/bin/traceur.js',
      'lib/es6-module-loader.js',
      'test/bootstrap.js',
      // TODO how are libs like EventEmitter and underscore working without SystemJS?
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false},
    ],
  };
  karma.server.start(karmaConfig);
});
