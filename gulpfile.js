var gulp = require('gulp'),
    concat = require('gulp-concat'),
    karma = require('karma').server;

var buildDir = './build/';
var javascripts = [
  'bower_components/underscore/underscore.js',
  'bower_components/q/q.js',
  'bower_components/pixi/bin/pixi.dev.js',
  'bower_components/fpsmeter/dist/fpsmeter.js',
  'src/*.js',
];

var karmaConfigPath = __dirname + '/test/karma.conf.js';

gulp.task('default', function() {
  gulp.src(javascripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest(buildDir));

  gulp.src('index.html').pipe(gulp.dest(buildDir));
});

gulp.task('watch-test', function() {
  var errorHandler = function(exitCode) {
    console.log('Karma has exited with code ' + exitCode);
  };

  karma.start({configFile: karmaConfigPath}, errorHandler);
});
