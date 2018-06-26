const CLIEngine = require('eslint').CLIEngine;
const fileUtil = require('../utils/file');
const path = require('path');


exports.search = function(argv) {
    const src = argv.p;
    const inputPath = path.join(process.cwd(), src);

    const files = fileUtil.getAllFile(inputPath);
    // console.log(files)
}

