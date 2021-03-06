const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const scss = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const inject = require('gulp-inject');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const ghPages = require('gulp-gh-pages');

const buildPath = {
  html: ['build/'],
  scss: ['src/css'],
  css: ['build/'],
  scripts: ['build/'],
  img: ['build/media'],
};

const path = {
  html: ['src/*.html'],
  scss: ['src/scss/*.scss'],
  css: ['src/css/*.css'],
  img: ['src/media/*.jpg'],
  scripts: ['src/js/header.js', 'src/js/*.js'],
  build: 'build/**/*',
};

// Compile Sass files
gulp.task('scss', () =>
  gulp
    .src(path.scss)
    .pipe(scss())
    .on('error', scss.logError)
    .pipe(gulp.dest(buildPath.scss))
    .pipe(browserSync.stream()),
);

// Optimize images
gulp.task('imageMin', () => gulp.src(path.img).pipe(imagemin()).pipe(gulp.dest(buildPath.img)));

// Minify css files
gulp.task('css-minify', () => {
  return gulp
    .src(path.css)
    .pipe(concat('main.min.css'))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(buildPath.css));
});

// Minify js files
gulp.task('js-minify', () => {
  return gulp
    .src(path.scripts)
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(buildPath.scripts));
});

// Minify html files
gulp.task('html-minify', () => {
  // change the html to js template
  inject.transform.html.js = (filepath) => `<script src="${filepath}" defer></script>`;
  const sources = gulp.src(['build/*.css', 'build/*.js'], { read: false });

  return gulp
    .src(path.html)
    .pipe(gulp.dest(buildPath.html))
    .pipe(inject(sources, { relative: true }))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      }),
    )
    .pipe(gulp.dest(buildPath.html));
});

// Proxy browsersync and watch modified files
gulp.task('watch', () => {
  browserSync.init({
    notify: false,
    port: 3000,
    server: {
      baseDir: './src',
    },
  });

  gulp.watch(path.scss).on('change', gulp.series(['scss']));
  gulp.watch(path.css).on('change', browserSync.reload);
  gulp.watch(path.scripts).on('change', browserSync.reload);
  gulp.watch(path.html).on('change', browserSync.reload);
});

gulp.task('watch-prod', () => {
  browserSync.init({
    notify: false,
    port: 3000,
    server: {
      baseDir: './build',
    },
  });
});

gulp.task('deploy', () => {
  return gulp.src(path.build).pipe(ghPages());
});

gulp.task('default', gulp.series(['scss', 'watch']));
gulp.task('build', gulp.series(['imageMin', 'scss', 'css-minify', 'js-minify', 'html-minify']));
