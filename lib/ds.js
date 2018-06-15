const path = require('path');
const fs = require('fs');
// 依赖数据
const dsData = {};

exports.search = function (src) {
    const src = path.join(src);
    const isExists = fs.existsSync(src);

    if (!isExists) {
        console.warn('文件路径不存在');
        return;
    }

    // 判断文件路径是否是文件夹
    const state = fs.statSync(src);
    if (!state.isDirectory()) {
        console.log('输入路径不是文件夹');
        return;
    }

    

}