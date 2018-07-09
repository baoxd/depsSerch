const CLIEngine = require('eslint').CLIEngine;
const fileUtil = require('../utils/file');
const path = require('path');
const fs = require('fs');
// 获取变量名
const REG_GET_VAR = /\'(.*)\'/;
// 是否替换函数
let isFuncReplace;
// 总数量
let totalNum = 0;

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
        if (message.ruleId === 'no-unused-vars') {
            const msg = message.message;
            const regArr = REG_GET_VAR.exec(msg);
            if (regArr && regArr.length >= 2) {
                message.unUsedVar = regArr[1];
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
    isFuncReplace = argv.f;

    const files = fileUtil.getAllFile(inputPath);
    const jsFiles = files.filter((file) => {
        return  /(\.js|\.jsx|\.vue|\.ts|\.tsx)$/.test(file);
    });

    const cliEngine = new CLIEngine();
    let report = cliEngine.executeOnFiles(jsFiles);
    report = getErrorReport(report);

    // no-unused-vars
    // const formatter = cliEngine.getFormatter();
    // let formatterInfo = formatter(report.results);
    // console.log(typeof formatterInfo);
    // formatterInfo = formatterInfo.replace(/([^\n]*)potentially fixable with the `--fix` option./, '');
    // console.info(formatterInfo);
    
    execRemove(report.results);
    console.log(`共删除${totalNum}个无用变量`);
}

/**
 * 删除无用变量
 * @param  {[type]} results [description]
 * @return {[type]}         [description]
 */
function execRemove(results) {
    if (!results) {
        return;
    }
    results.forEach(result => {
        const filePath = result.filePath;
        const messages = result.messages;

        if (messages && messages.length > 0 && fs.existsSync(filePath)) {
            fileUtil.readFile(filePath, code => {
                remove(filePath, code, messages);
            });
        }
    });
}

/**
 * 删除无用变量
 * @param  {[type]} filePath [description]
 * @param  {[type]} code     [description]
 * @param  {[type]} messages [description]
 * @return {[type]}          [description]
 */
function remove(filePath, code, messages) {
    let writeCode = code;
    let replaceCodeArr = [];

    messages.forEach(message => {
        const unUsedVar = message.unUsedVar;
        const line = message.line;
        const endLine = message.endLine;
        const source = message.source;
        // const reg_fun = getFunctionReg(unUsedVar);
        const reg_var = getVarReg(unUsedVar);
        let regArr;
        let replaceCode = '';
        
        // 函数变量
        if (/^function.*/.test(source) && isFuncReplace) {
            var codeArr = writeCode.split(/\n/);
            // 遇到"{" 加一， 遇到"}"减一
            let stackNum = 0;
            codeArr.map((item, index) => {
                // /^\s*(\/|\*).*/
                if ((index + 1) == line && item.indexOf(source) >= 0) {
                    replaceCode += source + '\n';
                    stackNum++;
                }
                if ((index + 1) > line && stackNum > 0) {
                    const leftBrackets = item.match(/\{/g);
                    const rightBrackets = item.match(/\}/g);
                    if (leftBrackets && leftBrackets.length > 0) {
                        stackNum += leftBrackets.length;
                    } 
                    if (rightBrackets && rightBrackets.length > 0) {
                        stackNum -= rightBrackets.length;
                    }
                    if (stackNum >= 0) {
                        replaceCode += item + '\n';
                    } else {
                        stackNum += rightBrackets.length;
                        while(stackNum > 0) {
                            let indexBracket = item.indexOf("}");
                            let sliceCode = item.slice(0, indexBracket);
                            replaceCode += sliceCode;
                            item = item.replace(sliceCode, '');
                            stackNum--;
                        }
                    }
                }
            })
        }
        // 非函数定义
        if (reg_var.test(source)) {
            regArr = reg_var.exec(code);
        }
        if (regArr && regArr.length >= 2) {
            replaceCode = regArr[2];
        }

        if (replaceCode) {
            replaceCodeArr.push(replaceCode);
            writeCode = writeCode.replace(replaceCode, '');
        }
    });

    totalNum += replaceCodeArr.length;

    fileUtil.writeFile(filePath, writeCode, function() {
        console.log(filePath);
        console.log('删除的内容：');
        console.log(replaceCodeArr.join('\n'));
        console.log(`  删除${replaceCodeArr.length}个无用变量`);
    });

}

/**
 * 获取匹配某个函数的正则
 * @param  {[type]} unUsedVar [description]
 * @return {[type]}           [description]
 */
function getFunctionReg(unUsedVar) {
    return new RegExp(`(function\\s*${unUsedVar}\(.*\){((\\s|\\S)*{[^{}]*}(\\s|\\S)*)+})`)
}

/**
 * 获取匹配某个变量的正则
 * @param  {[type]} unUsedVar [description]
 * @return {[type]}           [description]
 */
function getVarReg(unUsedVar) {
    return new RegExp(`(\\s|\\S)*?((const|let|var|import).*?${unUsedVar}.*?=?.*?(;|$))`);
}









