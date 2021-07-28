const path = require("path");
const uglifyjs = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const Dotenv = require("dotenv-webpack");

const entry = require("./webpack-entry");

module.exports = {
    mode: "development",
    entry,
    output: { // solo se puede especificar una carpeta output
        filename: "[name].bundle.min.js",
        path: path.resolve(__dirname, "src/scripts/outputs"),
        jsonpFunction: "wpBsipJsonp",
    },
    externals: {
        jquery: "jQuery",
    },
    resolve: {
        extensions: [".js", ".jsx"],
        modules: [path.resolve(__dirname, "src/scripts"), "node_modules"],
        alias: {
            react: "preact/compat",
            "react-dom": "preact/compat",
        },
    },
    devtool: "source-map",
    watch: true,
    module: {
        rules: [
            {
                test: require.resolve("jquery"),
                use: [
                    {
                        loader: "expose-loader",
                        options: "jQuery",
                    },
                    {
                        loader: "expose-loader",
                        options: "$",
                    },
                ],
            },
            {
                test: /\.(js|jsx)?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            {
                                plugins: ["@babel/plugin-proposal-class-properties"],
                            },
                        ],
                    },
                },
            },
            { test: /jquery-mousewheel/, loader: "imports-loader?define=>false&this=>window" },
            { test: /malihu-custom-scrollbar-plugin/, loader: "imports-loader?define=>false&this=>window" },
        ],
    },
    plugins: [
        new Dotenv({ path: "./config/dev.env" }),
        new uglifyjs({
            sourceMap: true,
        }),
        new BundleAnalyzerPlugin({
            analyzerPort: 5000,
        }),
        new webpack.ProvidePlugin({
            Promise: "es6-promise",
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: "all",
            minSize: 30000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "bc-vendors",
                    filename: "[name].bundle.min.js",
                    priority: -10,
                },
                default: {
                    name: "bc-commons",
                    filename: "[name].bundle.min.js",
                    minChunks: 3,
                    priority: -20,
                },
            },
        },
    },
};
