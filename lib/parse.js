/**
 * 代码分析
 * @param {*} code 
 */
const path = require('path');
const REQUIRE_REG = /require\(\s*["|']([\w|\d|\/|\.]*)["|']\s*\)/;
const IMPORT_REG =  /import.*from.*["|']([\w|\d|\/|\.]*)["|'].*/;
const SEP_REG = /(?=reqire|import|require)/g;


exports.parseStr = function(code) {
    if (!code) {
        return;
    }
    // 分割文件内容为数组，每个数据元素包含一个require或者import内容
    const codeArr = code.split(SEP_REG);
    const depsPath = [];
    if (!codeArr || codeArr.length === 0) {
        return;
    }

    codeArr.forEach(item => {
        if (!item) {
            return;
        }
        let requirePath;
        let execArr;
        // require语句
        if (isMatchRequire(item)) {
            execArr = REQUIRE_REG.exec(item);
        } else if (isMatchImport(item)) {
            execArr = IMPORT_REG.exec(item);
        }
        if (!execArr || execArr.length < 2) {
            return;
        }
        requirePath = execArr[1];
        // 是否是node_modules依赖
        if (isNodeModule(requirePath)) {
            return;
        }
        depsPath.push(requirePath);
    });
    return depsPath;
}

/**
 * 是否匹配require
 * @param {*} item 
 */
function isMatchRequire(item) {
    return REQUIRE_REG.test(item);
}

/**
 * 是否匹配import
 * @param {*} item 
 */
function isMatchImport(item) {
    return IMPORT_REG.test(item);
}

/**
 * 是否是node包
 * @param {*} path 
 */
function isNodeModule(path) {
    if (path.indexOf('.') >= 0 || path.indexOf('/') > 0) {
        return false;
    }
    return true;
}