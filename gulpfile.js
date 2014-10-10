var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');


var jsSource = ['./assets/scripts/app.js', './assets/scripts/tag.js'];

var libJSSource = ['./assets/libs/**/*.js'];

var sassSource = ['./assets/styles/main.scss'];


//Concat lib js and css task
gulp.task('concatlib', function() {
    gulp.src(libJSSource)
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./assets/libs'));
});

//Concat task
gulp.task('concatjs', function() {
    gulp.src(jsSource)
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./assets/scripts'));
  
});

//Sass Task
gulp.task('sass', function() {
    return gulp.src(sassSource)
        .pipe(sass({errLogToConsole: true}))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./assets/styles'));
});

//Watch task
gulp.task('watch', function(){
    gulp.watch(jsSource, ['concatjs']);
    gulp.watch(sassSource, ['sass']);
});


gulp.task('default', ['concatlib', 'concatjs', 'sass', 'watch']);