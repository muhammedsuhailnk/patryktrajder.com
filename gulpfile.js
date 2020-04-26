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

function html() {
  return spawn("eleventy", [], { shell: true, stdio: "inherit" });
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

function scripts() {
  return spawn("tsc", [], { shell: true, stdio: "inherit" });
}

function typescripts() {
  return gulp
    .src("src/scripts/**/*.ts")
    .pipe(gulp.dest(distDir + "/src/scripts"));
}

function styles() {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest(distDir + "/src/styles"));
}

gulp.task("assets", gulp.parallel(cursors, favicon, icons, images));

gulp.task("clean", function () {
  return spawn("rimraf " + distDir, [], {
    shell: true,
    stdio: "inherit"
  });
});

gulp.task("deploy", function () {
  return spawn(
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
});

gulp.task("src", gulp.parallel(html, scripts, styles));

gulp.task(
  "dev",
  gulp.series("clean", gulp.parallel("assets", "src", typescripts))
);

gulp.task(
  "dist",
  gulp.series("clean", gulp.parallel("assets", cname, "src"), "deploy")
);
