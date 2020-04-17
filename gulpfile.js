const { spawn } = require("child_process");
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

function html(cb) {
  const process = spawn("eleventy", [], { shell: true, stdio: "inherit" });
  process.on("exit", cb);
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
  const process = spawn("tsc", [], { shell: true, stdio: "inherit" });
  process.on("exit", cb);
}

function styles() {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest(distDir + "/src/styles"));
}

gulp.task("assets", gulp.parallel(cursors, favicon, icons, images));

gulp.task("deploy", function (cb) {
  const process = spawn(
    "cd " +
      distDir +
      " && git init" +
      " && git add ." +
      ' && git commit -m "deploy"' +
      " && git remote add origin https://github.com/JakubJanowski/patryktrajder.com.git" +
      " && git push --force origin master:" +
      deployBranch +
      " && rimraf .git" +
      " && cd ..",
    [],
    { shell: true, stdio: "inherit" }
  );
  process.on("exit", cb);
});

gulp.task("src", gulp.parallel(html, scripts, styles));

gulp.task("dev", gulp.parallel("assets", "src"));

gulp.task("dist", gulp.series(gulp.parallel("assets", cname, "src"), "deploy"));
