// yargs options
module.exports = function(yargs) {
	return yargs.usage('Usage: opm [options]')
		.option('path', {
            alias : 'p',
            demand: true,
            default: './',
            describe: '扫描路径',
            type: 'string'
        })
		.help('h')
		.alias('h', 'help');
}