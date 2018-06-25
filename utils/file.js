const fs = require('fs');
/**
 * 文件夹
 * @param {*} path 
 */
exports.readDir = function(path, cb) {
    try{
        const files = fs.readdirSync(path);
        cb && cb(files);
    } catch(e) {
        console.log('文件夹读取错误');
        console.log(e);
    }
}

exports.readFile = function(file, cb) {
    try{
        const code = fs.readFileSync(file, 'utf-8');
        cb && cb(code);
    } catch(e) {
        console.log('文件读取错误');
        console.log(e);
    }
}

/**
 * @param {*} dirs 
 * @param {*} path 
 */
exports.isIgnorePath = function(dirs, path) {
    let ret = false;
    if (dirs.length > 0 && path) {
        dirs.forEach(dir => {
            if (path.indexOf(dir) >= 0) {
                ret = true;
            }
        })
    }
    return ret;
}

