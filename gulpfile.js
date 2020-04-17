const exec = require("child_process").exec;
const gulp = require("gulp");
const sass = require("gulp-sass");

const distDir = "dist";
const deployBranch = "gh-pages";

function cname() {
  return gulp.src("CNAME").pipe(gulp.dest(distDir));
}

function cursors() {
  return gulp
    .src("assets/cursors/**/*")
    .pipe(gulp.dest(distDir + "/assets/cursors"));
}

function favicon() {
  return gulp.src("favicon.ico").pipe(gulp.dest(distDir));
}

function gitDelete(cb) {
  exec("git branch -D " + deployBranch, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function gitPush(cb) {
  exec("git push -f origin " + deployBranch + ":" + deployBranch, function (
    err,
    stdout,
    stderr
  ) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function gitSplit(cb) {
  exec(
    "git subtree split --prefix " + distDir + " -b " + deployBranch,
    function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    }
  );
}

function html(cb) {
  exec("eleventy", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function icons() {
  return gulp
    .src("assets/icons/**/*")
    .pipe(gulp.dest(distDir + "/assets/icons"));
}

function images() {
  return gulp
    .src("assets/images/**/*")
    .pipe(gulp.dest(distDir + "/assets/images"));
}

function scripts(cb) {
  exec("tsc", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function styles() {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest(distDir + "/src/styles"));
}

gulp.task("assets", gulp.parallel(cursors, favicon, icons, images));

gulp.task("deploy", gulp.series(gitSplit, gitPush, gitDelete));

gulp.task("src", gulp.parallel(html, scripts, styles));

gulp.task("dev", gulp.parallel("assets", "src"));

gulp.task("dist", gulp.series(gulp.parallel("assets", cname, "src"), "deploy"));
