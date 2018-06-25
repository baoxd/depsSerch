
/**
 * 字节转为Kb
 * @return {[type]} [description]
 */
exports.byteToKb = function(size) {
    if (!size) {
        return 0;
    }
    return size / 1024;
}

/**
 * Kb转M
 * @return {[type]} [description]
 */
exports.kbToM = function(size) {
    if (!size) {
        return 0;
    }
    return size / 1024;
}

/**
 * 是否是数组
 * @param  {[type]}  arr [description]
 * @return {Boolean}     [description]
 */
exports.isArray = function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
 * 是否是对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
exports.isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}