const CLIEngine = require('eslint').CLIEngine;
const fileUtil = require('../utils/file');
const path = require('path');

/**
 * 修正report的统计
 * @param report
 */
function fixAllStats(report) {
    report.errorCount = 0;
    report.warningCount = 0;
    report.fixableErrorCount = 0;
    report.fixableWarningCount = 0;

    report.results.forEach((result) => {
        report.errorCount += result.errorCount;
        report.warningCount += result.warningCount;
        report.fixableErrorCount += result.fixableErrorCount;
        report.fixableWarningCount += result.fixableWarningCount;
    })
}

/**
 * 修正文件的统计数字
 * @param fileResult
 */
function fixFileStats(fileResult) {
    fileResult.errorCount = 0;
    fileResult.warningCount = 0;
    fileResult.fixableErrorCount = 0;
    fileResult.fixableWarningCount = 0;

    return fileResult.messages.filter((message) => {
        if (message.fatal || message.severity === 2) {
            fileResult.errorCount++;
            if (message.fix) {
                fileResult.fixableErrorCount++;
            }
        } else {
            fileResult.warningCount++;
            if (message.fix) {
                fileResult.fixableWarningCount++;
            }
        }
        return message.ruleId === 'no-unused-vars';
    });

}

/**
 * 是否需要忽略的文件
 * @param result
 * @returns {boolean}
 */
function isIgnoreFile(result) {
    if (result.warningCount !== 1 || result.errorCount !== 0) {
        return false;
    }
    if (result.messages.length !== 1) {
        return false;
    }
    if (result.messages[0].message.indexOf('File ignored by default') !== 0) {
        return false;
    }
    return true;
}

/**
 * 获取错误信息
 * @param  {[type]} report [description]
 * @return {[type]}        [description]
 */
function getErrorReport(report) {
    const newReport = Object.assign({}, report);

    newReport.results = newReport.results.filter((result) => {
        if (isIgnoreFile(result)) {
            return false;
        }
        result.messages = fixFileStats(result);

        return result.messages.length !== 0;
    });

    fixAllStats(newReport);

    return newReport;
}

exports.search = function(argv) {
    const src = argv.p;
    const inputPath = path.join(process.cwd(), src);

    const files = fileUtil.getAllFile(inputPath);
    const jsFiles = files.filter((file) => {
        return  /(\.js|\.jsx|\.vue|\.ts|\.tsx)$/.test(file);
    });

    const cliEngine = new CLIEngine();
    let report = cliEngine.executeOnFiles(jsFiles);
    report = getErrorReport(report);
    // no-unused-vars

    report.results && report.results.forEach(result => {
        result.messages && result.messages.forEach(message => {
            console.log(message);
        })
    });

    // const formatter = cliEngine.getFormatter();
    // let formatterInfo = formatter(report.results);
    // console.log(typeof formatterInfo);
    // formatterInfo = formatterInfo.replace(/([^\n]*)potentially fixable with the `--fix` option./, '');
    // console.info(formatterInfo);

}






