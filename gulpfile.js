'use strict';

//TODO
/*
- multiple karma configurations
- fix rimraf
- don't use template.js in dev
- fix less and themes, load bootstrap theme
- watch on ngtemplates
*/

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
require('./gulp/gateway');

var dev = {
  dir: 'app',
  index: 'app/index.html',
  less: 'app/styles/main.less',
  scripts: [
    'app/*.js',
    'app/components/**/*.js',
    'app/pages/**/*.js'
  ],
  images: 'app/images/*',
  fonts: 'app/bower_components/bootstrap/fonts/*',
  templates: [
    'app/pages/**/*.html',
    'app/components/**/*.html'
  ]
};

var prod = {
  dir: 'dist',
  images: 'dist/images',
  styles: 'dist/styles',
  fonts: 'dist/fonts'
};

var options = {
  clean: { read: false },
  uglify: { mangle: false }
};

gulp.task('jshint', function () {
  var testFileCondition = /_test\.js/;

  gulp.src(dev.scripts)
    .pipe($.ignore.include(testFileCondition))
    .pipe($.jshint('test/.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'));

  return gulp.src(dev.scripts)
    .pipe($.ignore.exclude(testFileCondition))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('test', function () {
  return gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-unit.conf.js',
      //configFile: 'test/karma-coverage.conf.js',
      action: 'run',
      //browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
      browsers: ['PhantomJS']
    }))
    .on('error', function (err) {
      throw err;
    });
});

gulp.task('karma:watch', [], function () {
  gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-coverage.conf.js',
      action: 'watch',
      //browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
      browsers: ['PhantomJS', 'Chrome']
    }));
});

gulp.task('less', function () {
  return gulp.src('app/styles/main.less')
    .pipe($.less({
      paths: ['app/styles']
    }))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('ngtemplates', function () {
  return gulp.src(dev.templates, { base: dev.dir })
    .pipe($.ngtemplate({
      module: 'app'
    }))
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('serve', ['connect', 'watch']);

gulp.task('serve:dist', ['connect:dist']);

gulp.task('watch', ['less', 'ngtemplates', 'karma:watch'], function () {
  var server = $.livereload();

  gulp.watch([
    dev.index,
    '.tmp/styles/main.css',
    '.tmp/templates.js',
    dev.scripts
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch(['app/styles/**/*.less'], ['less']);
  gulp.watch(dev.templates, ['ngtemplates']);
});

gulp.task('clean', function() {
  return gulp.src(prod.dir, options.clean)
    .pipe($.rimraf({ force: true }));
});

gulp.task('copy', function () {
  gulp.src(dev.fonts)
    .pipe(gulp.dest(prod.fonts));

  gulp.src(dev.images)
    .pipe(gulp.dest(prod.images));
});

gulp.task('usemin', function () {
  gulp.src(dev.index)
    .pipe($.usemin({
      css: [
        $.minifyCss({ relativeTo: 'app/styles'}),
        'concat',
        $.rev()
      ],
      js: [
        $.uglify(options.uglify),
        $.rev()
      ]
    }))
    .pipe(gulp.dest(prod.dir));
});

gulp.task('build', ['clean', 'jshint', 'ngtemplates', 'test', 'less', 'copy', 'usemin']);

gulp.task('travis', ['jshint', 'test']);

gulp.task('default', [], function () {
  gulp.start('build');
});