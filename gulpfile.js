var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins(),
    argv            = require('yargs').argv,
    bower           = require('bower'),
    mainBowerFiles  = require('main-bower-files'),
    browserSync     = require('browser-sync'),
    reload          = browserSync.reload;


// Define main
var jsexp = new RegExp(/^.*\.js$/);
var cssexp = new RegExp(/^.*\.s*css$/);
var jsFiles = mainBowerFiles({filter: jsexp}).concat(['src/templates.js', 'src/*/**/*.js', 'src/app.js']);
var cssFiles = mainBowerFiles({filter: cssexp}).concat(['src/**/*.scss']);

gulp.task('print', function() {
    console.log(jsFiles);
    console.log(cssFiles);
});

// Run a local web server
gulp.task('connect', function() {
  $.connect.server({
    root: [__dirname]
  });
});

// Task for live injection
gulp.task('browser-sync', function() {
    return browserSync({
      proxy: 'localhost:8080',
      open: false,
      minify: false,
      files: ['*.html', 'script.js'],
      injectChanges: true
    });
});


// Javascript build
gulp.task('build:js', function() {
    gulp.src(jsFiles)
        .pipe($.uglify())
        .pipe($.concat('script.js'))
        .pipe(gulp.dest('build/'));
});

// Javascript build development
gulp.task('develop:js', function() {
    gulp.src(jsFiles)
        .pipe($.uglify({
            'mangle': false,
            'compress': false,
            'output': {
                'beautify': true
            }
        }))
        .pipe($.concat('script.js'))
        .pipe(gulp.dest('build/'));
});



// SASS build
gulp.task('build:sass', function () {
    gulp.src(cssFiles)
        .pipe($.cssGlobbing({
            extensions: ['.css', '.scss']
        }))
        .pipe($.sass())
        .pipe($.concat('style.css'))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe($.minifyCss())
        .pipe(gulp.dest('build/'));
});

// SASS Development
gulp.task('develop:sass', function () {
    gulp.src(cssFiles)
        .pipe($.plumber({
            errorHandler: $.notify.onError("<%= error.message %>")}))
        .pipe($.cssGlobbing({
            extensions: ['.css', '.scss']
        }))
        .pipe($.sass())
        .pipe($.concat('style.css'))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('build/'))
        .pipe($.filter('*.css'))
        .pipe(browserSync.reload({stream:true}));
});

// Generate index slim
gulp.task('slim', function () {
    gulp.src("src/**/*.slim")
        .pipe($.plumber({
            errorHandler: $.notify.onError("<%= error.message %>")}))
        .pipe($.slim({
            pretty: true,
            options: ":attr_list_delims={'(' => ')', '[' => ']'}"
        }))
        .pipe(gulp.dest('./build'));
});

// Set up watchers
gulp.task('default', ['connect', 'develop:sass', 'develop:js', 'slim', 'browser-sync'], function() {
    gulp.watch(cssFiles, ['develop:sass']);
    gulp.watch(jsFiles, ['develop:js']);
    gulp.watch(["src/**/*.slim"], ['slim']);
});

// Build JS and SASS
gulp.task('build', ['build:js', 'build:sass', 'slim']);
