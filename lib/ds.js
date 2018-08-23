const path = require('path');
const fs = require('fs');
const fileUtil = require('../utils/file');
const utils = require('../utils/utils');
const parse = require('./parse');
const config = require('./config');
// 依赖数据
const dsData = {};
let alias;
// 打包配置信息
let webpackConfig;
// webpack路径
let webpackPath;
// a: 显示所有依赖关系， o: 只显示没有被依赖的文件
let showType = 'a';
// 入口文件夹路径
let entryPath;
// 忽略扫描的文件夹
const ignorePaths = config.ignorePaths;
// 文件后缀
const EXT_LIST = config.extList;
// 入口文件如果是多个的分隔符
const ENTRY_PATH_SEPARATOR = ',';
// 如果是react-native引入的图片，需要忽略分辨率
const RN_IMAGE_SUFFIX = /\@\dx/g;
let parse_num = 0;

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
            webpackPath = path.join(process.cwd(), aliaspath);
            webpackConfig = require(webpackPath);

            if (webpackConfig && typeof webpackConfig === 'function') {
                webpackConfig = webpackConfig();
            }

            if (webpackConfig) {
                alias = webpackConfig.alias;
                // 转换为绝对路径
                // if (alias) {
                //     for(let key of alias) {
                //         alias[key] = path.resolve();
                //     }
                // }
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
        let tmpArr = enPath.split(ENTRY_PATH_SEPARATOR);
        if (tmpArr && tmpArr.length) {
            entryPath = tmpArr.map(v => path.join(process.cwd(), v));
        }

        // entryPath = path.join(process.cwd(), enPath);
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
        const keys = Object.keys(dsData);

        // console.log(dsData)
        // return;
        // 默认所有文件都是嫌疑文件
        analysisDeps(keys);
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
            // if (key.indexOf(entryPath) >= 0) {
            //     dsData[key].isEntry = true;
            // }
            entryPath && entryPath.forEach(v => {
                if (key.indexOf(v) >= 0) {
                    dsData[key].isEntry = true;
                }
            })
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
        return getFileWithExt(depPath);
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
    // let sourcePathNoExt = delFileExt(sourcePath);
    let sourcePathNoExt = getFileWithExt(sourcePath);
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
            // let pathNoExt = delFileExt(path);
            let pathNoExt = getFileWithExt(path);
            if (pathNoExt !== sourcePathNoExt) {
                // 缓存中是否存在
                if (!dsData[pathNoExt]) {
                    dsData[pathNoExt] = {
                       deps: [],
                       beDeps: [], 
                    }
                }
                dsData[pathNoExt].beDeps = dsData[pathNoExt].beDeps.concat([sourcePathNoExt]);
            }
        })
    }
    // 获取文件大小
    let sourceStat = fs.statSync(sourcePath);
    if (sourceStat) {
        dsData[sourcePathNoExt].size = utils.byteToKb(sourceStat.size);
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
 * 获取文件后缀的路径
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function getFileWithExt(file) {
    if (!file) {
        return;
    }
    let parseObj = path.parse(file);

    if (!parseObj.ext) {
        EXT_LIST.forEach(ext => {
            if (fs.existsSync(`${file}${ext}`)) {
                file = `${file}${ext}`;
            }
        })
    }

    if (parseObj.ext && (parseObj.ext.toLocaleUpperCase() === '.PNG' || 
        parseObj.ext.toLocaleUpperCase() === '.JPG' || parseObj.ext.toLocaleUpperCase() === '.GIF')
        && parseObj.name && !RN_IMAGE_SUFFIX.test(parseObj.name)) {
        const ext = parseObj.ext;
        const filename = delFileExt(file);
        let flag = false;

        ['', '@2x', '@3x', '@4x', '@5x', '@6x'].forEach(v => {
            const fullFilePath = filename + v + ext;

            if (fs.existsSync(fullFilePath)) {

                const fileSate = fs.statSync(fullFilePath);

                if (!flag && fileSate.isFile()) {
                    flag = true;
                    file = fullFilePath;
                }
            }
        })
    }
    return file;
}

/**
 * 文件递归判断，递归结束的条件是嫌疑文件为空
 * @param  {[type]} paths    嫌疑文件
 */
function analysisDeps(paths) {
    parse_num++;
    const susPaths = [];

    if (paths && paths.length > 0) {
        paths.forEach(path => {
            // 获取被依赖文件
            const depStatus = getFileStatus(path);

            // 可以删除
            if (depStatus === 1) {
                setCanDel(path, true)
            } else if (depStatus === 2) {
                // 不可删除
                setCanDel(path, false);
            } else {
                // 嫌疑文件
                susPaths.push(path);
            }
        });
    }

    if (susPaths && susPaths.length > 0) {
        analysisDeps(susPaths);
    }
}


/**
 * 获取文件状态
 * 一个文件可以删除的唯一条件是：所有的被依赖的文件都可以删除
 * @param  {[type]}  path [description]
 * @return 1: 可删除 2: 不可删除 3: 嫌疑文件
 */
function getFileStatus(path) {
    // 被依赖的文件
    const beDeps = dsData[path].beDeps;
    const isEntry = dsData[path].isEntry;
    let ret = 3;
    let cyclicRef = false;


    if (!path || !dsData[path]) {
        return ret;
    }
    // 没有被依赖文件并且不是入口文件
    if (isEntry || isRequireedByWebPack(path)) {
        return 2;
    }

    if ((!beDeps || beDeps.length === 0)) {
        ret = 1;
    } else {
        let num = 0;

        beDeps && beDeps.forEach(beDep => {

            // 如果是入口文件或者已经被标志为不可删除
            if (!dsData[beDep] || (dsData[beDep].hasOwnProperty('canDel') && dsData[beDep].canDel  === false) || dsData[beDep].isEntry) {
                ret = 2;
            } else if (!dsData[beDep] || dsData[beDep].canDel === true) {
                num++;
            }

            // 判断是否有循环引用
            const beDepOfBeDeps = dsData[beDep].beDeps;

            if (beDepOfBeDeps && beDepOfBeDeps.length) {
                beDepOfBeDeps.forEach(v => {
                    if (v === path) {
                        cyclicRef = true;
                        setCanDel(beDep, false);
                    }
                })
            }

        });
        if (cyclicRef) {
            ret = 2;
        } else {
            // 可删除
            if (num === beDeps.length) {
                ret = 1;
            }
        }
    }
    return ret;
}

/**
 * 设置文件可删除
 * @param {[type]} path [description]
 */
function setCanDel(path, canDel) {
    if (path && dsData[path]) {
        dsData[path].canDel = canDel;
    }
}

/**
 * 是否被webpack文件依赖
 * @param  {[type]}  dep  [description]
 * @return {Boolean}      [description]
 */
function isRequireedByWebPack(dep) {
    if (!webpackConfig) {
        return false;
    }

    let entry = webpackConfig.entry;
    let vendor = webpackConfig.vendor;

    function _getAbsolutelyPath(filepath) {
        // 使用了alias
        if(isUseAlias(filepath)) {
            filepath = aliasPathReplace(filepath);
        } else {
            filepath = path.join(path.dirname(webpackPath), filepath);
        }
        return filepath;
    }

    function _isRequired(entry) {
        if (!entry) {
            return false;
        }

        if (utils.isArray(entry) && entry.length > 0) {
            for (let i = 0 ; i < entry.length; i++) {
                let filepath = _getAbsolutelyPath(entry[i]);

                if (filepath.indexOf(dep) >= 0) {
                    return true;
                }
            }
        }
        if (utils.isObject(entry)) {
            for (let key of entry) {
                let filepath = _getAbsolutelyPath(entry[key]);
                if (filepath.indexOf(dep) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

    return _isRequired(vendor) || _isRequired(entry);
}



/**
 * 是否使用了alias
 * @param  {[type]}  filepath [description]
 * @return {Boolean}      [description]
 */
function isUseAlias(filepath) {
    if (!filepath) {
        return false;
    }
    return filepath.indexOf('.') !== 0 && filepath.indexOf('/') > 0;
}

/**
 * 替换alias路径为绝对路径
 * @return {[type]} [description]
 */
function aliasPathReplace(filepath) {
    if (!filepath) {
        return;
    }

    if (alias) {
        const aliasKeys = Object.keys(alias);

        aliasKeys.forEach(key => {
            if (filepath.indexOf(key) === 0) {
                filepath = path.join(alias[key].replace(key, ''), filepath);
            }
        });
    }
    return filepath;
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

    if (entryPath) {
        let sizeTotal = 0;
        let num = 0;
        console.log('可删除的文件');
        keys.forEach(key => {
            if (!key) {
                return;
            }
            const pathObj = dsData[key];
            if (pathObj.canDel) {
                console.log(`  ${key}`);
                sizeTotal += dsData[key].size || 0;
                num++;
            }
        });
        console.log('可删除文件数:' + num);
        console.log('可删除文件大小:' + sizeTotal + 'KB');
    }

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


