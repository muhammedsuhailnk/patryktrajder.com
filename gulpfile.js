const gulp = require("gulp");
const sass = require("gulp-sass");
const shell = require("gulp-shell");

gulp.task("cursors", function () {
  return gulp.src("assets/cursors/**/*").pipe(gulp.dest("dist/assets/cursors"));
});

gulp.task("icons", function () {
  return gulp.src("assets/icons/**/*").pipe(gulp.dest("dist/assets/icons"));
});

gulp.task("images", function () {
  return gulp.src("assets/images/**/*").pipe(gulp.dest("dist/assets/images"));
});

gulp.task("styles", function () {
  return gulp
    .src("assets/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest("dist/assets/styles"));
});

gulp.task("html", function () {
  return new Promise(function (resolve, reject) {
    shell.task("eleventy");
    resolve();
  });
});

gulp.task(
  "dist",
  gulp.series(["cursors", "icons", "images", "styles", "html"])
);
