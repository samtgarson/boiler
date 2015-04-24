var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins(),
    argv            = require('yargs').argv,
    bower           = require('bower'),
    mainBowerFiles  = require('main-bower-files'),
    browserSync     = require('browser-sync'),
    reload          = browserSync.reload;


// Define main 
var jsFiles = mainBowerFiles().concat(['src/*/**/*.js']);

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
      files: ['script.js'],
      injectChanges: true
    });
});


// Javascript build
gulp.task('js', function() {
    gulp.src(jsFiles)
        .pipe($.uglify())
        .pipe($.concat('script.js'))
        .pipe(gulp.dest('/build/'));
});

// Javascript build development
gulp.task('jsDev', function() {
    gulp.src(jsFiles)
        .pipe($.uglify({
            'mangle': false,
            'compress': false,
            'output': {
                'beautify': true
            }
        }))
        .pipe($.concat('script.js'))
        .pipe(gulp.dest('/build/'));
});



// SASS build
gulp.task('sass', function () {
    gulp.src('src/**/*.scss')
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
        .pipe(gulp.dest('/build/'));
});

// SASS Development
gulp.task('sassDev', function () {
    gulp.src('src/**/*.scss')
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
        .pipe(gulp.dest('/build/'))
        .pipe($.filter('*.css'))
        .pipe(browserSync.reload({stream:true}));
});

// Set up watchers
gulp.task('default', ['connect', 'sassDev', 'jsDev', 'browser-sync'], function() {
    gulp.watch('./src/**/*.scss', ['sassDev']);
    gulp.watch(jsFiles, ['jsDev']);
});

// Build JS and SASS
gulp.task('build', ['js', 'sass']);

// Build then add and commit
gulp.task('commit', ['build'], function(){
    gulp.src(['build/script.js', 'build/style.css'])
        .pipe($.git.add())
        .pipe($.git.commit('Build'));
});

// Clear the git repo
gulp.task('clean-git', function() {
    gulp.src('.git')
        .pipe($.clean());
});

// Make new repo with initial commit
gulp.task('init', ['clean-git'], function() {
    gulp.src('*')
        .pipe($.git.init())
        .pipe($.git.add())
        .pipe($.git.comiit('init'));
});