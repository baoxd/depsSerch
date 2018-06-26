module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: 'airbnb-base',
    rules: {
        indent: [2, 4, { SwitchCase: 1 }], // 使用4个空格缩进
        complexity: [2, 10], // 函数内条件的数量
        'no-console': [2], // 禁止使用console
        'max-statements': [2, 50], // 函数最多可包含表达式的数量
        'max-depth': [2, 5], // 最大语句嵌套的深度
        'max-nested-callbacks': [2, 3], // 最大函数嵌套的深度
        'max-params': [2, 5], // 函数参数最大数量
        'max-len': [2, 120, 4], // 行最大长度
        'max-lines': [2, 400], //文件最大行数
        'class-methods-use-this': [0], // 类的实例方法可以不用this
        'no-underscore-dangle': [0], // 标识符允许使用下划线
        'import/no-unresolved': [2, { commonjs: false }], // 禁止使用commonjs规范
    },
    globals: {
        window: true,
        Promise: true,
    },
};
