const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;	 
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagecomp = require('compress-images');
const del = require('del');

function browsersync() {
	browserSync.init({ 
		server: { baseDir: 'src/' }, 
		notify: false, 
		online: true 
	})
}

function html() {
	return src('src/index.html')
		.pipe(dest('dist'))
}

function scripts() {
	return src([ 
		'src/assets/js/script.js', 
		])
	.pipe(concat('script.min.js')) 
	.pipe(uglify()) 
	.pipe(dest('src/assets/js/')) 
	.pipe(browserSync.stream()) 
}

function styles() {
	return src('src/assets/scss/main.scss')
	.pipe(sass({
		outputStyle: 'compressed',
		includePaths: require('node-normalize-scss').includePaths
	}).on('error', sass.logError))
	.pipe(concat('main.min.css')) 
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) 
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) 
	.pipe(dest('src/assets/css/'))
	.pipe(browserSync.stream())
}

async function images() {
	imagecomp(
		"src/assets/images/**/*", 
		"dist/assets/images",
		{ compress_force: false, statistic: true, autoupdate: true }, false, 
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } },
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { 
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

function cleanimg() {
	return del('src/assets/images/**/*', { force: true })
}

function startwatch() {
	watch(['src/**/*.js', '!src/**/*.min.js'], scripts);
    watch('src/**/scss/**/*', styles);
    watch('src/**/*.html').on('change', browserSync.reload);
    watch('src/assets/images/**/*', images);
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'src/assets/css/**/*.min.css',
		'src/assets/js/**/*.min.js',
		'src/assets/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) 
}

function cleandist() {
	return del('dist/**/*', { force: true }) // Удаляем все содержимое папки "dist/"
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.buildcopy = buildcopy;
exports.build = series(cleandist, html, styles, scripts, images, buildcopy);
exports.default = parallel(styles, scripts, browsersync, startwatch);