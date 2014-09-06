'use strict';

var path = require('path'),
    gulp = require('gulp'),
    connect = require('gulp-connect'),
    traceur = require('gulp-traceur'),
    plumber = require('gulp-plumber');


var buildDir = path.join(__dirname, 'build');

var es6Files = [
  'src/**/*.js',
  'lib/di.js/*.js'
];

var copyFiles = [
  'index.html',
  'media/**/*',
  'maps/*',
  'lib/EventEmitter.js',
  'lib/howler.js',
  'lib/Shortcut.js',
  'lib/require.js',
  'lib/traceur-runtime.js',
  'lib/pixi.js',
  'lib/fpsmeter.js',
]

var traceurOptions = {
  modules: 'amd',
  types: true,
  annotations: true
}

// TODO gulp watch task will fail on traceur syntax error
gulp.task('build', function() {

  gulp.src(copyFiles, {base: __dirname}).pipe(gulp.dest(buildDir));

  return gulp
    .src(es6Files, {base: __dirname})
    .pipe(plumber())
    .pipe(traceur(traceurOptions))
    .pipe(gulp.dest(buildDir));
});

gulp.task('serve', function() {
  connect.server({
    root: 'build',
  });
});

gulp.task('watch', ['build'], function() {
  gulp.watch(es6Files.concat(copyFiles), ['build']);
});
