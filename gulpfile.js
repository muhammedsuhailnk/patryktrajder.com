const exec = require("child_process").exec;
const gulp = require("gulp");
const sass = require("gulp-sass");

gulp.task("cursors", function () {
  return gulp.src("assets/cursors/**/*").pipe(gulp.dest("dist/assets/cursors"));
});

gulp.task("html", function (cb) {
  exec("eleventy", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task("icons", function () {
  return gulp.src("assets/icons/**/*").pipe(gulp.dest("dist/assets/icons"));
});

gulp.task("images", function () {
  return gulp.src("assets/images/**/*").pipe(gulp.dest("dist/assets/images"));
});

gulp.task("scripts", function (cb) {
  exec("tsc", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task("styles", function () {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest("dist/src/styles"));
});

gulp.task("favicon", function () {
  return gulp.src("favicon.ico").pipe(gulp.dest("dist/favicon.ico"));
});

gulp.task("assets", gulp.series(["cursors", "favicon", "icons", "images"]));

gulp.task("src", gulp.series(["html", "scripts", "styles"]));

gulp.task("dev", gulp.series(["assets", "src"]));
