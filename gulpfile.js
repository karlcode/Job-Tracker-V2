var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    del = require('del');

gulp.task('css', function() {
  return gulp.src('src/css/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(gulp.dest('dist/js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('jsLibraries', function() {
  return gulp.src('src/js/libraries/*.js')
    .pipe(gulp.dest('dist/js'))
});

gulp.task('html', function () {
    return gulp.src('src/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
    return gulp.src('src/images/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('manifest', function(){
    return gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

gulp.task('watch', ['css', 'html', 'js', 'images', 'manifest', 'jsLibraries'], function() {
    gulp.watch('src/css/*.scss', ['css']);
    gulp.watch('src/*.pug', ['html']);
    gulp.watch('src/js/*.js', ['js']);
    gulp.watch('src/js/libraries/*.js', ['jsLibraries']);
    gulp.watch('src/images/*', ['images']);
    gulp.watch('src/manifest.json', ['manifest']);
})

gulp.task('default', function (callback) {
    runSequence('clean:dist', ['sass', 'pug', 'js', 'images'],
        callback
    )
})