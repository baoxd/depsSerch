module.exports = function() {
    return {
        alias: {
            module: path.resolve(APP_PATH, 'module'),
            service: path.resolve(APP_PATH, 'service'),
            component: path.resolve(APP_PATH, 'component'),
            page: path.resolve(APP_PATH, 'page'),
            reactPage: path.resolve(APP_PATH, 'reactPage'),
            reactComponent: path.resolve(APP_PATH, 'reactComponent'),
            reactModule: path.resolve(APP_PATH, 'reactModule'),
            reactTools: path.resolve(APP_PATH, 'reactTools'),
            node_modules: path.resolve(ROOT_PATH, 'node_modules'),
        },

    };
}
