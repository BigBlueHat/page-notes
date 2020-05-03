const path = require("path");

const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  context: path.resolve(__dirname, "."),
  entry: {
    background: "./src/background.js",
    annotate: "./src/annotate.js",
    highlighter: "./src/highlighter.js",
    popup: "./src/popup.js",
    list: "./src/list.js",
    "debug-list": "./src/debug-list.js",
  },
  output: {
    path: path.resolve(__dirname, "extension/dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
