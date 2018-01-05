const path = require("path");

module.exports = {
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
  }
};
