'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./webpack.common');

module.exports = merge(
    commonConfig,
    {
        devtool: 'eval-source-map',
        devServer: {
            contentBase: './lib/static',
            inline: true,
            hot: true,
            index: 'gui.html'
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    }
);
