const gulp = require("gulp"),
    sourcemaps = require("gulp-sourcemaps"),
    plumber = require("gulp-plumber"),
    webpack = require("webpack-stream"),
    rename = require("gulp-rename"),
    browserSync = require("browser-sync").create(),
    gulpif = require("gulp-if"),
    wait = require("gulp-wait"),
    cached = require("gulp-cached"),
    replace = require("gulp-replace"),
    pug = require("gulp-pug"),
    postcss = require("gulp-postcss"),
    flexBugs = require("postcss-flexbugs-fixes"),
    watch = require("gulp-watch"),
    gulp_watch_pug = require("gulp-watch-pug"),
    sass = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    sassInheritance = require("gulp-better-sass-inheritance"),
    multiDest = require("gulp-multi-dest"),
    htmlbeautify = require("gulp-html-beautify"),
    dotEnv = require('dotenv');

dotEnv.config();

const destOptions = { mode: "0777" };
const CSS_SRC = ["!./src/styles/{vendor, outputs}/**/*", "./src/styles/**/*.scss"];
const JS_SRC = ["src/scripts/**/*.js"];
const TEMPLATES_SRC = ["src/templates/**/*.pug"];

/*=============================================================*/
/* TASKS */

let isDevMode = function() {
    return process.env.ENV === "DEVELOP";
};

function sassTask(done) {
    let condition = function(file) {
        return !file.basename.startsWith("checkout");
    };

    gulp.src(CSS_SRC)
        .pipe(wait(200))
        .pipe(gulpif(isDevMode, cached("sass")))
        .pipe(
            sassInheritance({
                base: "src/styles/combos"
            })
        )
        .pipe(gulpif(isDevMode, sourcemaps.init()))
        .pipe(plumber())
        .pipe(
            sass({
                outputStyle: "compressed"
            }).on("error", sass.logError)
        )
        .pipe(autoprefixer({ grid: true }))
        .pipe(postcss([flexBugs]))
        .pipe(gulpif(condition, rename({ suffix: ".min"/*, prefix:"new-"*/ })))
        .pipe(gulpif(isDevMode, sourcemaps.write("./")))
        .pipe(multiDest(["src/styles/outputs", "dist/files/css"], destOptions))
        .pipe(gulpif(isDevMode, browserSync.stream()));
    done();
}

function vendorCSS(done) {
    gulp.src("./dist/files/css/*.css")
        .pipe(replace(/\images\//g, ""))
        .pipe(gulp.dest("dist/files/vendor"));
    done();
}

// Esta tarea usa Webpack, porque permite hacer un bundle de los js y manejar jQuery sin hacer conflicto con la versión vieja de jQuery en VTex.
function scripts(done) {
    return gulp
        .src(JS_SRC)
        .pipe(webpack(require(!isDevMode() ? "./config/webpack-prod.config.js" : "./config/webpack-dev.config.js")))
        .pipe(multiDest(["src/scripts/outputs", "dist/files/js"], destOptions))
        .pipe(gulpif(isDevMode, browserSync.stream()));
    done();
}

function browserSyncServer() {
    return browserSync.init({
        serveStatic: ["."],
        server: {
            baseDir: ["dist"],
            serveStaticOptions: {
                extensions: ["html", "js"]
            }
        },
        watchOptions: {
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }
        }
    });
}

function pugTask(done) {
    gulp.src("src/templates/**/*.pug")
        .pipe(plumber())
        .pipe(gulpif(isDevMode, watch("src/templates/**/*.pug")))
        .pipe(
            gulp_watch_pug("src/templates/**/*.pug", {
                delay: 100
            })
        )
        .pipe(
            pug({
                compileDebug: false,
                basedir: "src"
            })
        )
        .pipe(htmlbeautify({ indentSize: 4 }))
        .pipe(gulp.dest("dist"));
    done();
}

gulp.task("browserSync", function() {
    return browserSync.init({
        server: {
            baseDir: "./",
            index: "/dist/index.html"
        }
    });
});

// BrowserSync Reload
function browserSyncReload(done) {
    browserSync.reload();
    done();
}

gulp.task("sassTask", sassTask);
gulp.task("vendorCSS", vendorCSS);
gulp.task("scripts", scripts);
gulp.task("pug", pugTask);
gulp.task("watch", gulp.series(watchFiles, browserSyncServer));

/*=============================================================*/
/* WATCH */

function watchFiles() {
    gulp.watch(CSS_SRC, gulp.series(sassTask, vendorCSS));
    gulp.watch(JS_SRC, gulp.series(scripts));
    gulp.watch(TEMPLATES_SRC, gulp.series(pugTask, browserSyncReload));
}

/*=============================================================*/
/* DEFAULT TASK */

gulp.task("default", gulp.parallel(watchFiles, browserSyncServer));
gulp.task("build", gulp.series(pugTask, sassTask, vendorCSS, scripts));