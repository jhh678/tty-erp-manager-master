var fileinclude = require('gulp-file-include'),
  markdown = require('markdown'),
  gulp = require('gulp'),
  clean = require('gulp-clean'), // 清理文件
  copy2 = require('gulp-copy2'), // 复制文件
  gulpSequence = require('gulp-sequence'), // 串行执行任务
  concat = require('gulp-concat'), // 文件合并
  sass = require('gulp-sass'), // 获取 gulp-sass 模块
  sourcemaps = require('gulp-sourcemaps'), // map调试
  autoprefixer = require('gulp-autoprefixer'), // css前缀自动补全
  browserSync = require('browser-sync').create(),
  browserSyncReload = browserSync.reload;

/* ---------------------------------------------------- dev task start ----------------------------------------------- */
gulp.task('fileinclude-dev', function () {
  return gulp.src(['./src/html/**/*.html'])
    .pipe(fileinclude({
      filters: {
        markdown: markdown.parse
      }
    }))
    .pipe(gulp.dest('./dist/dev/html'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyCss-dev', function () {
  return gulp.src(['./src/css/**/*.css', '!./src/css/common/common.scss', './src/css/**/*.scss', '!./src/css/demo/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
      cascade: false
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/dev/css'));
});

gulp.task('concatCss-dev', function () {
  return gulp.src(['./src/css/common/common.scss', './src/css/demo/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
      cascade: false
    }))
    .pipe(concat('common.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/dev/css/common'));
});

gulp.task('copyJs-dev', function () {
  return gulp.src(['./src/js/**/*.js', '!./src/js/common/common.js', '!./src/js/demo/*.js'])
    .pipe(gulp.dest('./dist/dev/js'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('concatJs-dev', function () {
  return gulp.src(['./src/js/common/common.js', './src/js/demo/*.js'])
    .pipe(concat('common.js'))
    .pipe(gulp.dest('./dist/dev/js/common'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyImage-dev', function () {
  return gulp.src(['./src/image/**/*'])
    .pipe(gulp.dest('./dist/dev/image'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyFavicon-dev', function () {
  return gulp.src(['./favicon.ico'])
    .pipe(gulp.dest('./dist/dev'));
});

// 清理目标目录
gulp.task('clean-dev', function () {
  return gulp.src('./dist/dev')
    .pipe(clean({
      force: true
    }));
});

// 监听文件变化-开发环境
gulp.task('watch', function () {
  // 监控html文件
  gulp.watch('./src/html/**/*', ['fileinclude-dev']);

  // 监控css文件
  gulp.watch('./src/css/**/*', ['copyCss-dev', 'concatCss-dev']);

  // 监控js文件
  gulp.watch('./src/js/**/*', ['copyJs-dev', 'concatJs-dev']);

  // 监控image文件
  gulp.watch('./src/image/**/*', ['copyImage-dev']);
});

// Static server
gulp.task('browser-sync', function () {
  var files = [
    '**/*.html',
    '**/*.css',
    '**/*.js'
  ];
  browserSync.init(files, {
    watchTask: true,
    server: {
      baseDir: './dist/dev',
      index: 'html/index.html'
    }
  });
});

// 定义开发任务
gulp.task('dev', gulpSequence('clean-dev', ['fileinclude-dev', 'copyCss-dev', 'concatCss-dev', 'copyJs-dev', 'concatJs-dev', 'copyImage-dev', 'copyFavicon-dev'], 'browser-sync', 'watch'));
/* -------------------------------------------------- dev task end ---------------------------------------------------------------------- */

/* -------------------------------------------------- build task start ------------------------------------------------------------------ */
gulp.task('fileinclude-build', function () {
  return gulp.src(['./src/html/**/*.html'])
    .pipe(fileinclude({
      filters: {
        markdown: markdown.parse
      }
    }))
    .pipe(gulp.dest('./dist/build/html'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyCss-build', function () {
  return gulp.src(['./src/css/**/*.css', '!./src/css/common/common.scss', './src/css/**/*.scss', '!./src/css/demo/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
      cascade: false
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/build/css'));
});

gulp.task('concatCss-build', function () {
  return gulp.src(['./src/css/common/common.scss', './src/css/demo/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
      cascade: false
    }))
    .pipe(concat('common.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/build/css/common'));
});

gulp.task('copyJs-build', function () {
  return gulp.src(['./src/js/**/*.js', '!./src/js/common/common.js', '!./src/js/demo/*.js'])
    .pipe(gulp.dest('./dist/build/js'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('concatJs-build', function () {
  return gulp.src(['./src/js/common/common.js', './src/js/demo/*.js'])
    .pipe(concat('common.js'))
    .pipe(gulp.dest('./dist/build/js/common'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyImage-build', function () {
  return gulp.src(['./src/image/**/*'])
    .pipe(gulp.dest('./dist/build/image'))
    .pipe(browserSyncReload({
      stream: true
    }));
});

gulp.task('copyFavicon-build', function () {
  return gulp.src(['./favicon.ico'])
    .pipe(gulp.dest('./dist/build'));
});

// 清理目标目录
gulp.task('clean-build', function () {
  return gulp.src('./dist/build')
    .pipe(clean({
      force: true
    }));
});

// 复制文件到.net开发环境
gulp.task('copy2net', function () {
  var paths = [{
      src: './dist/build/css/common/*.css',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/styles/common/'
    },
    {
      src: './dist/build/css/plugins/*.css',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/styles/plugins/'
    },
    {
      src: './dist/build/js/libs/*.js',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/scripts/libs/'
    },
    {
      src: './dist/build/js/common/*.js',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/scripts/common/'
    },
    {
      src: './dist/build/js/plugins/*.js',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/scripts/plugins/'
    },
    {
      src: './dist/build/image/*',
      dest: '../TTY.Application/TTY.Application.Web/TTYContent/images/'
    }
  ];
  return copy2(paths);
});

// 定义发布任务
gulp.task('build', gulpSequence('clean-build', ['fileinclude-build', 'copyCss-build', 'concatCss-build', 'copyJs-build', 'concatJs-build', 'copyImage-build', 'copyFavicon-build']));
/* -------------------------------------------------- build task end ------------------------------------------------------------------ */
