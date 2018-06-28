const fs = require('fs');
const path = require('path');
const ignorePaths = require('../lib/config').ignorePaths;

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

exports.writeFile = function(file, code, cb) {
    try{
        fs.chmodSync(file, parseInt('0755', 8));
        fs.writeFileSync(file, code);
        cb && cb();
    }catch(e) {
        console.log('文件写入出错');
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

/**
 * 获取路径下所有文件
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
exports.getAllFile = function(sourcepath) {
    if (!sourcepath || exports.isIgnorePath(ignorePaths, sourcepath)) {
        return [];
    }
    let ret = [];
    const stat = fs.statSync(sourcepath);


    if (stat.isFile()) {
        ret.push(sourcepath);
    } else if (stat.isDirectory()) {
        exports.readDir(sourcepath, (files) => {
            if (files && files.length > 0) {

                files.forEach(file => {
                    const currFilePath = path.join(sourcepath, file)
                    const fileStat = fs.statSync(currFilePath);

                    if (fileStat.isFile() && !exports.isIgnorePath(ignorePaths, currFilePath)) {
                        ret.push(currFilePath);
                    } else if (fileStat.isDirectory()) {
                        ret = ret.concat(exports.getAllFile(currFilePath));
                    }
                })
            }
        })
    }
    return ret;
}


