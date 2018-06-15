const path = require('path');
const fs = require('fs');
const fileUtil = require('../utils/file');
// 依赖数据
const dsData = {};

exports.search = function (src) {
    const inputPath = path.join(src);
    const isExists = fs.existsSync(inputPath);

    if (!isExists) {
        console.warn('文件路径不存在');
        return;
    }

    // 判断文件路径是否是文件夹
    const state = fs.statSync(inputPath);
    if (!state.isDirectory()) {
        console.log('输入路径不是文件夹');
        return;
    }

    fileUtil.readDir(inputPath, (files) => {
        readDirCallback(files);
    });

}

/**
 * 文件夹读取回调
 * @param {*} files 
 */
function readDirCallback(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            const filePath = path.join(inputPath, file);
            // 判断文件是否是文件夹
            const fileSate  = fs.statSync(filePath);

            // 子文件夹
            if (fileSate.isDirectory()) {
                fileUtil.readDir(filePath, readDirCallback);
            }
            // 文件
            if (fileSate.isFile()) {
                fileUtil.readFile(filePath, readFileCallback)
            }
        });
    } 
}

/**
 * 文件读取回调
 * @param {*} code: 源文件内容
 * @param {*} file: 源文件路径
 */
function readFileCallback(code, file) {

}

