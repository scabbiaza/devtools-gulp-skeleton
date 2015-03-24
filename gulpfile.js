// DEFAULTS ========================================================================================
var exitOnError = false;

// IMPORTS =========================================================================================
var runSequence = require("run-sequence");
var gulp = require("gulp");
var gulpReplace = require("gulp-replace");
var gulpSourcemaps = require("gulp-sourcemaps");
var gulpLess = require("gulp-less");
var gulpConcat = require("gulp-concat");
var gulpPlumber = require("gulp-plumber");
var gulpLivereload = require('gulp-livereload');
var gulpConnect = require('gulp-connect');

// CONFIG ==========================================================================================
var paths = { src: "static/src", dist: "static/dist" };
var urls = { src: "/static/src", dist: "/static/dist" };

// TASKS ===========================================================================================

// Compile less to css, add sourcemaps
gulp.task("compile-styles", function() {
  return gulp.src([paths.src + "/styles/theme.less"])
    .pipe(gulpSourcemaps.init())
      .pipe(gulpPlumber({errorHandler: !exitOnError}))
      .pipe(gulpLess())
    .pipe(gulpSourcemaps.write("/maps", {
      includeContent: false,
      sourceMappingURLPrefix: urls.dist + "/styles"
    }))
    .pipe(gulp.dest(paths.dist + "/styles"));
});

// Remove absolute pathes from sourcemaps
// TODO: this is needed only for styles task. Don't have this issue with scripts. why?
gulp.task("clean-styles-sourcemaps", ["compile-styles"], function() {
  return gulp.src([paths.dist + "/styles/maps/*.map"])
      .pipe(gulpReplace(__dirname, ""))
      .pipe(gulp.dest(paths.dist + "/styles/maps/"));
});


// Compile & concat js, add sourcemaps
gulp.task("compile-scripts", function() {
  return gulp.src([paths.src + "/scripts/**/*.js"], {base: paths.src})
    .pipe(gulpSourcemaps.init())
      .pipe(gulpPlumber({errorHandler: !exitOnError}))
      .pipe(gulpConcat("theme.js"))
    .pipe(gulpSourcemaps.write("/maps", {
      includeContent: false,
      sourceMappingURLPrefix: urls.dist + "/scripts",
      sourceRoot: urls.src
    }))
    .pipe(gulp.dest(paths.dist + "/scripts"))
    .pipe(gulpLivereload());
});

// GENERAL TASKS ===================================================================================
gulp.task("styles", function() {
  return runSequence(
    ["compile-styles", "clean-styles-sourcemaps"]
  );
});

gulp.task("scripts", function() {
  return runSequence(
    ["compile-scripts"]
  );
});

gulp.task("watch", function() {
  gulpLivereload.listen();
  gulp.watch(paths.src + "/scripts/**/*.js", ["scripts"]);
  gulp.watch(paths.src + "/styles/**/*.less", ["styles"]);
});

gulp.task('webserver', function() {
  gulpConnect.server({
    livereload: false
  });
});

gulp.task("default", ["styles", "scripts"]);
