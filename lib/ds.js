const path = require('path');
const fs = require('fs');
const fileUtil = require('../utils/file');
const parse = require('./parse');
// 依赖数据
const dsData = {};
// 忽略扫描的文件夹
const ignorePaths = ['node_modules', '.git'];

exports.search = function (src) {
    const inputPath = path.join(src);
    const isExists = fs.existsSync(inputPath);

    if (!isExists) {
        console.warn('文件路径不存在');
        return;
    }

    // 判断文件路径是否是文件夹
    const state = fs.statSync(inputPath);
    if (!state.isDirectory() && !fileUtil.isIgnorePath(ignorePaths, inputPath)) {
        console.log('输入路径不是文件夹');
        return;
    }

    console.log('--------------------- 开始扫描 ---------------------');
    fileUtil.readDir(inputPath, (files) => {
        console.log(`DIR: ${inputPath}`);
        readDirCallback(files, inputPath);
    });
    console.log('--------------------- 开始结束 ---------------------');

    console.log('--------------------- 依赖情况 ---------------------');
    console.log(dsData);
}

/**
 * 文件夹读取回调
 * @param {*} files:
 * @param {*} sourcePath
 */
function readDirCallback(files, sourcePath) {
    if (files && files.length > 0) {
        files.forEach(file => {
            const filePath = path.join(sourcePath, file);
            // 判断文件是否是文件夹
            const fileSate  = fs.statSync(filePath);

            // 子文件夹
            if (fileSate.isDirectory() && !fileUtil.isIgnorePath(ignorePaths, filePath)) {
                console.log(`DIR: ${filePath}`);
                fileUtil.readDir(filePath, (files) => {
                    readDirCallback(files, filePath);
                });
            }
            // 文件
            if (fileSate.isFile()) {
                console.log(`FILE: ${filePath}`);
                fileUtil.readFile(filePath, (code) => {
                    readFileCallback(code, filePath);
                })
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
    let depsPath = parse.parseStr(code);
    depsPath = depsPath.map(val => {
        return path.join(path.dirname(file), val);
    });
    insert(file, depsPath);
}

/**
 * 插入依赖数据
 * @param {*} sourcePath: 依赖源文件路径
 * @param {*} deps: 依赖文件路径数组
 */
function insert(sourcePath, deps) {
    if (!sourcePath) {
        return;
    }
    let sourcePathNoExt = delFileExt(sourcePath);
    if (!dsData[sourcePathNoExt]) {
        dsData[sourcePathNoExt] = {
            // 依赖文件
            deps: [],
            // 被依赖文件
            beDeps: [],
        };
    }
    // 分析依赖文件
    if (deps && deps.length > 0) {
        dsData[sourcePathNoExt].deps = dsData[sourcePathNoExt].deps.concat(deps);

        deps.forEach(path => {
            let pathNoExt = delFileExt(path);
            // 缓存中是否存在
            if (!dsData[pathNoExt]) {
                dsData[pathNoExt] = {
                   deps: [],
                   beDeps: [], 
                }
            }
            dsData[pathNoExt].beDeps = dsData[pathNoExt].beDeps.concat([sourcePathNoExt]);
        })
    }
}

/**
 * 删除文件后缀
 * @param {*} file 
 */
function delFileExt(file) {
    if (!file) {
        return;
    }
    let ret = path.parse(file);
    return `${ret.dir}${path.sep}${ret.name}`;
}


