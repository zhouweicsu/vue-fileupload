var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var vueLoader = require('vue-loader');

module.exports = {
    entry: {
        fileupload: "./demo/fileupload.js"
    },
    output: {
        filename: `./dist/js/[name].js`
    },
    module: {
        loaders: [
            {
                test: /.vue$/,
                loader: 'vue'
            },
            {
                test: /\.js?$/,
                exclude: /node_modules\//,
                loader: 'babel'
            }
        ],
        postLoaders: [
            {
                test: /\.js?$/,
                loader: 'es3ify-loader'
            }
        ]
    },
    devtool: 'sourcemap',
    babel: {
        presets: ['es2015', 'es2015-loose', 'stage-0'],
        plugins: ['transform-runtime']
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.js'
        }
    }

};
