'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var plumber = require('gulp-plumber');
var jetpack = require('fs-jetpack');
var bundle = require('./bundle');
var utils = require('./utils');

var projectDir = jetpack;
var srcDir = jetpack.cwd('./src');
var destDir = jetpack.cwd('./app');
var contentDir = jetpack.cwd('./content');
var resourceDir = jetpack.cwd('./resources');
var serviceDir = jetpack.cwd('./service');
var fontDir = jetpack.cwd('./fonts');

gulp.task('bundle', function () {
    return Promise.all([
        bundle(srcDir.path('background.js'), destDir.path('background.js')),
        bundle(srcDir.path('app.js'), destDir.path('app.js')),
    ]);
});

gulp.task('template', function () {
    return gulp.src(contentDir.cwd() + '/**/*.html')
        .pipe(gulp.dest(destDir.path('content')));
});

gulp.task('resources', function () {
    return gulp.src(resourceDir.cwd() + '/**/*')
        .pipe(gulp.dest(destDir.path('resources')));
});

gulp.task('service', function () {
    return gulp.src(serviceDir.cwd() + '/**/*')
        .pipe(gulp.dest(destDir.path('service')));
});

gulp.task('fonts', function () {
    return gulp.src(fontDir.cwd() + '/**/*')
        .pipe(gulp.dest(destDir.path('fonts')));
});

gulp.task('less', function () {
    return gulp.src(srcDir.path('stylesheets/main.less'))
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(destDir.path('stylesheets')));
});

gulp.task('environment', function () {
    var configFile = 'config/env_' + utils.getEnvName() + '.json';
    projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});

gulp.task('watch', function () {
    var beepOnError = function (done) {
        return function (err) {
            if (err) {
                utils.beepSound();
            }
            done(err);
        };
    };

    watch('src/**/*.js', batch(function (events, done) {
        gulp.start('bundle', beepOnError(done));
    }));
    watch('src/**/*.less', batch(function (events, done) {
        gulp.start('less', beepOnError(done));
    }));
});

gulp.task('build', ['bundle', 'template', 'resources', 'service', 'fonts', 'less', 'environment']);
