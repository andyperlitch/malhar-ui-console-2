'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var dev = {
  scripts: [
    'app/*.js',
    'app/components/**/*.js',
    'app/pages/**/*.js',
    'app/vendor/**/*.js'
  ]
};

gulp.task('scripts', function () {
  return gulp.src(dev.scripts)
    .pipe($.size());
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(connect.static('app'))
    .use(connect.static('.tmp'))
    .use(connect.directory('app'))
    .use(require('./gateway'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect'], function () {
  require('opn')('http://localhost:9000');
});

gulp.task('watch', ['connect', 'serve'], function () {
  var server = $.livereload();

  gulp.watch([
    'app/**/*.html',
    'app/**/*.js'
  ]).on('change', function (file) {
    server.changed(file.path);
  });
});
