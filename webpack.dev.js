const path = require('path');
var APP_PATH = path.resolve(__dirname);;

module.exports = function() {
    return {
        alias: {
            app: APP_PATH
        },
        vendor: ['app/test/common.js'],
    };
}
