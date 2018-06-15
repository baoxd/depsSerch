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
        cb && cb(code, file);
    } catch(e) {
        console.log('文件读取错误');
        console.log(e);
    }
}