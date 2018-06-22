const path = require('path');
const fs = require('fs');
const fileUtil = require('../utils/file');
const parse = require('./parse');
// 依赖数据
const dsData = {};
let alias;
// a: 显示所有依赖关系， o: 只显示没有被依赖的文件
let showType = 'a';
// 入口文件夹路径
let entryPath;
// 忽略扫描的文件夹
const ignorePaths = ['node_modules', '.git', 'adocs', '.eslintrc', '.eslintignore',
    'README', '.gitignore', '.cache-loader', '.DS_Store', 'awletdist', 'manifest', 'build',
    'awlet.entry.json', 'package-lock', 'package'];

exports.search = function (argv) {
    const src = argv.p;
    const aliaspath = argv.a;
    const enPath = argv.i;
    const inputPath = path.join(process.cwd(), src);
    // const inputPath = path.join(src);
    const isExists = fs.existsSync(inputPath);

    if (!isExists) {
        console.warn('文件路径不存在');
        return;
    }

    // 存在aliaspath
    if (aliaspath) {
        try {
            let wepackConfig = require(path.join(process.cwd(), aliaspath));

            if (wepackConfig && typeof wepackConfig === 'function') {
                wepackConfig = wepackConfig();
            }

            if (wepackConfig) {
                alias = wepackConfig.alias;
            }
        } catch(e) {
            console.log(e);
            console.log('获取alias失败!');
        }
    }

    if (argv.s) {
        showType = argv.s;
    }

    if (enPath) {
        entryPath = path.join(process.cwd(), enPath);
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
    console.log('--------------------- 扫描结束 ---------------------');

    // 存在入口文件夹路径
    if (entryPath) {
        // 设置入口文件
        setEntry();
        // 分析依赖关系
        const noBeDepPaths = [];
        const keys = Object.keys(dsData);
        keys.forEach(key => {
            const pathObj = dsData[key];
            if (!pathObj.beDeps || pathObj.beDeps.length === 0) {
                noBeDepPaths.push(key);
                // 可删除文件
                if (!dsData[key].isEntry) {
                    dsData[key].canDel = true;
                }
            }
        });
        analysisDeps(noBeDepPaths);
    }
    // 打印依赖关系
    writeDepsInfo();
}

/**
 * 设置入口文件不可删除
 */
function setEntry() {
    const keys = Object.keys(dsData);
    if (keys) {
        keys.forEach(key => {
            // 入口文件
            if (key.indexOf(entryPath) >= 0) {
                dsData[key].isEntry = true;
            }
        });
    }
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

            if (!fileUtil.isIgnorePath(ignorePaths, filePath)) {
                // 子文件夹
                if (fileSate.isDirectory()) {
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
    let depsPath = parse.parseStr(code, file);
    if (!depsPath) {
        depsPath = [];
    }

    depsPath = depsPath.map(val => {
        let depPath;
        // 使用了alias
        if (val.indexOf('.') !== 0 && val.indexOf('/') > 0) {
            if (alias) {
                const aliasKeys = Object.keys(alias);

                aliasKeys.forEach(key => {
                    if (val.indexOf(key) === 0) {
                        depPath = path.join(alias[key].replace(key, ''), val);
                    }
                });
            }
        } else {
            depPath = path.join(path.dirname(file), val);
        }
        return depPath;
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

/**
 * 文件树递归依赖查询
 * @param  {[type]} noBeDepPaths [description]
 * @return {[type]}              [description]
 */
function analysisDeps(noBeDepPaths) {
    // 下一级可删除的嫌疑文件
    const nextLevelPaths = [];

    noBeDepPaths.forEach(path => {
        const deps = dsData[path].deps;

        if (deps && deps.length > 0) {
            deps.forEach();
        }
    });
}

/**
 * 获取可删除嫌疑文件
 * paths: 已确定的可删除文件
 * 返回不可确定删除的文件
 */
function getSuspicionPaths(paths) {
    const ret = [];

    if (paths && paths.length > 0) {
        paths.forEach(path => {
            // 获取可删除文件的依赖
            const deps = dsData[path].deps;
            if (deps && deps.length > 0) {
                deps.forEach(dep => {

                });
            }
        });
    }

    return ret;

}

/**
 * 判断一个路径是否被依赖
 * @param  {[type]}  path [description]
 * @return {Boolean}      [description]
 */
function isNoBeDeps(path) {
    if (path && dsData[path]) {
        if (!dsData[path].beDeps || dsData[path].beDeps.length === 0) {
            return true;
        }
        return false;
    }
    return false;
}

/**
 * 打印依赖情况
 */
function writeDepsInfo() {
    console.log('--------------------- 依赖情况 ---------------------');
    console.log('没有被依赖的文件: ');
    const keys = Object.keys(dsData);

    keys.forEach(key => {
        const pathObj = dsData[key];
        if (!pathObj.beDeps || pathObj.beDeps.length === 0) {
            console.log(`  ${key}`);
        }
    });

    if (showType === 'a') {
        console.log('被依赖的情况：');

        keys.forEach(key => {
            const pathObj = dsData[key];
            if (pathObj.beDeps && pathObj.beDeps.length > 0) {
                console.log(`  ${key}`);
                pathObj.beDeps.forEach(dep => {
                    console.log(`       ${dep}`);
                })
            }
        });
        console.log('文件依赖情况:');

        keys.forEach(key => {
            const pathObj = dsData[key];
            if (pathObj.deps && pathObj.deps.length > 0) {
                console.log(`  ${key}`);
                pathObj.deps.forEach(dep => {
                    console.log(`       ${dep}`);
                })
            }
        });

    }
}


