#!/usr/bin/env node

const yargs = require('yargs');
const argv = require('./config')(yargs).argv;
const ds = require('../lib/ds');
// 子命令
var command = argv._[0];
if (!command) {
    yargs.showHelp();
    return;
}
if (command === 'ds') {
    ds.search(argv.p);
} else {
    console.log('别的命令...');
}
