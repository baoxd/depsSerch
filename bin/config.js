// yargs options
module.exports = function(yargs) {
	return yargs.usage('Usage: coan [options]')
        .command('ds','文件依赖检索',function(yargs){
            return yargs.reset().option('path', {
                    alias : 'p',
                    demand: true,
                    describe: '扫描路径',
                    type: 'string'
                }).option('aliaspath', {
                    alias: 'a',
                    describe: 'alias配置文件路径',
                    type: 'string'
                }).option('show', {
                    alias: 's',
                    describe: '信息显示类型',
                    type: 'string'
                });
        })
		.help('h')
		.alias('h', 'help');
}