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
                    describe: '信息显示类型, a: 显示所有；o: 是显示没有被依赖的文件',
                    type: 'string'
                }).option('input', {
                    alias: 'i',
                    describe: '项目入口文件文件夹路径',
                    type: 'string'
                });
        })
        .command('anu', '变量定义没有被使用检索', function(yargs){
            return yargs.reset().option('path', {
                alias : 'p',
                demand: true,
                describe: '扫描路径',
                type: 'string'
            })
        })
		.help('h')
		.alias('h', 'help');
}