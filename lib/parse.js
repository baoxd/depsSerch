/**
 * 代码分析
 * @param {*} code 
 */

const REQUIRE_REG = /require\(\s*["|']([\w|\d|\/]*)["|']\s*\)/;
const IMPORT_REG =  /import.*from.*["|']([\w|\d|\/]*)["|'].*/;
const SEP_REG = /(?=reqire|import|require)/g;

exports.parseStr = function(code) {

}

/**
 * 是否匹配require
 * @param {*} code 
 */
function isMatchRequire(code) {

}

/**
 * 是否匹配import
 * @param {*} code 
 */
function isMatchImport(code) {

}