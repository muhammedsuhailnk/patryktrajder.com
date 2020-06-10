const { spawn } = require("child_process");
const gulp = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const webpack = require("webpack-stream");

const distDir = "dist";
const deployBranch = "gh-pages";

function cname() {
  return gulp.src("CNAME").pipe(gulp.dest(distDir));
}

function cnameAcc() {
  return gulp
    .src("CNAME-acceptance")
    .pipe(rename("CNAME"))
    .pipe(gulp.dest(distDir));
}

function cursors() {
  return gulp
    .src("assets/cursors/**/*")
    .pipe(gulp.dest(distDir + "/assets/cursors/"));
}

function favicon() {
  return gulp.src("favicon.ico").pipe(gulp.dest(distDir));
}

function googleYTAuth() {
  return gulp.src("googleea67cce430aa48a1.html").pipe(gulp.dest(distDir));
}

function html() {
  return spawn("eleventy", [], { shell: true, stdio: "inherit" });
}

function icons() {
  return gulp
    .src("assets/icons/**/*")
    .pipe(gulp.dest(distDir + "/assets/icons/"));
}

function images() {
  return gulp
    .src("assets/images/**/*")
    .pipe(gulp.dest(distDir + "/assets/images/"));
}

function notFoundPage() {
  return gulp.src("src/404.html").pipe(gulp.dest(distDir));
}

function notFoundStyles() {
  return gulp
    .src("src/styles/404.scss")
    .pipe(sass())
    .pipe(gulp.dest(distDir + "/src/"));
}

function robots() {
  return gulp.src("robots.txt").pipe(gulp.dest(distDir));
}

function scripts() {
  return gulp
    .src("src/scripts/**/*.ts")
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest(distDir + "/src/"));
}

function scriptsDev() {
  let config = require("./webpack.config.js");

  config.mode = "development";
  config.devtool = "inline-source-map";
  config.optimization = {
    minimize: false
  };

  return gulp
    .src("src/scripts/**/*.ts")
    .pipe(webpack(config))
    .pipe(gulp.dest(distDir + "/src/"));
}

function sitemap() {
  return gulp.src("sitemap.xml").pipe(gulp.dest(distDir));
}

function styles() {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sass())
    .pipe(gulp.dest(distDir + "/src/"));
}

gulp.task("assets", gulp.parallel(cursors, favicon, icons, images));

gulp.task("clean", function () {
  return spawn("rimraf " + distDir, [], {
    shell: true,
    stdio: "inherit"
  });
});

gulp.task("deploy-acc", function () {
  return spawn(
    "cd " +
      distDir +
      " && git init" +
      " && git add ." +
      ' && git commit -m "deploy"' +
      " && git remote add origin https://github.com/JakubJanowski/acceptance.git" +
      " && git push --force origin master:" +
      deployBranch +
      " && rimraf .git" +
      " && cd ..",
    [],
    { shell: true, stdio: "inherit" }
  );
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

gulp.task("rootfiles", gulp.parallel(cname, googleYTAuth, robots, sitemap));

gulp.task(
  "src",
  gulp.parallel(html, notFoundPage, notFoundStyles, scripts, styles)
);

gulp.task(
  "srcDev",
  gulp.parallel(html, notFoundPage, notFoundStyles, scriptsDev, styles)
);

gulp.task("dev", gulp.series("clean", gulp.parallel("assets", "srcDev")));

gulp.task(
  "acc",
  gulp.series("clean", gulp.parallel("assets", cnameAcc, "src"), "deploy-acc")
);

gulp.task(
  "dist",
  gulp.series("clean", gulp.parallel("assets", "rootfiles", "src"), "deploy")
);
