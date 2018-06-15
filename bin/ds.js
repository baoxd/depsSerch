#!/usr/bin/env node

const yargs = require('yargs');
const argv = require('./config')(yargs).argv;
const ds = require('../lib/ds');
// 扫描路径
const src = argv.path;
ds.search(src);