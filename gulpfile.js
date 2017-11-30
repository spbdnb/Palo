"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const prefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-minify-css');
const cmq = require('gulp-group-css-media-queries');
const gulpIf = require("gulp-if");
const nunjucks = require("gulp-nunjucks-render");
const del = require("del");
const browserSync = require("browser-sync");
const reload = browserSync.reload;

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV =="development";

gulp.task("scss", function() {
	return gulp.src("src/style/main.scss")
		.pipe(gulpIf(isDevelopment, sourcemaps.init()))
		.pipe(sass())
		.on("error", sass.logError)
		.pipe(cmq())
		.pipe(prefixer({ browsers: ['last 3 versions', 'safari 8'], cascade: false }))
		.pipe(gulpIf(isDevelopment, sourcemaps.write()))
		.pipe(gulpIf(!isDevelopment, cssmin()))
		.pipe(gulp.dest("build"))
		.pipe(reload({stream: true}));
});

gulp.task("assets", function() {
	return gulp.src("src/assets/**/*.*")
		.pipe(gulp.dest("build/assets"));
});

gulp.task("html", function() {
	return gulp.src("src/html/*.html")
		.pipe(gulp.dest("build"));
});

gulp.task("njk", function() {
	return gulp.src("src/templates/*.njk")
		.pipe(nunjucks({
			path: ['src/templates']
		}))
		.pipe(gulp.dest("build"))
		.on('end', reload);
});

gulp.task("clean", function() {
	return del("build");
});

gulp.task("build", gulp.series("scss", "njk", "assets", "html"));

gulp.task("watch", function() {
	gulp.watch("src/style/**/*.scss", gulp.series("scss"));
	gulp.watch("src/templates/**/*.njk", gulp.series("njk"));
	gulp.watch("src/html/**/*.html", gulp.series("html"));
});

gulp.task("webserver", function() {
	browserSync({
		server: {baseDir: "./build"}, // Comment if we already have dev server;
		//proxy: "truecourse.dev", // And call proxy to existing dev server domain;
		//tunnel: true,
		host: 'localhost',
		port: 9000,
		logPrefix: "Frontend_Log"
	});
});

gulp.task( "default", 
	gulp.series("build", gulp.parallel("webserver", "watch"))
);

