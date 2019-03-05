/**
 * 代码分析
 * @param {*} code 
 */
const path = require('path');
const REQUIRE_REG = /require\(\s*["|']([\w|\d|\/|\.|\-|\$\@]*)["|']\s*\)/;
const IMPORT_REG =  /import.*(from)?.*["|']([\w|\d|\/|\.|\-|\$\@]*)["|'].*/;
const EXPORT_REG =  /export.*(from)?.*["|']([\w|\d|\/|\.|\-|\$\@]*)["|'].*/;

const SEP_REG = /(?=reqire|import|require|import|export)/g;


exports.parseStr = function(code, file, alias) {
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
            if (!execArr || execArr.length < 2) {
                return;
            }
            requirePath = execArr[1];
        } else if (isMatchImport(item)) {
            execArr = IMPORT_REG.exec(item);
            if (!execArr || execArr.length < 3) {
                return;
            }
            requirePath = execArr[2];
        } else if (isMatchExport(item)) {
            execArr = EXPORT_REG.exec(item);
            if (!execArr || execArr.length < 3) {
                return;
            }
            requirePath = execArr[2];
        }
        
        let isAlias = false;
        if (alias && requirePath) {
            const aliasKeys = Object.keys(alias);
            aliasKeys.forEach(key => {
                if (requirePath.indexOf(key) === 0) {
                    isAlias = true;
                }
            });
        }
        // 是否是node_modules依赖
        if ((!requirePath || isNodeModule(requirePath)) && !isAlias) {
            return;
        }
        if (requirePath) {
            depsPath.push(requirePath);
        }
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
 * 是否匹配import
 * @param  {[type]}  item
 * 例子：export { default } from './base-modal';
 */
function isMatchExport(item) {
    return EXPORT_REG.test(item);
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