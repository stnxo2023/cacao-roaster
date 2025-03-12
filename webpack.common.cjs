// webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const vmBrowserify = require.resolve('vm-browserify');
const bufferPolyfill = require.resolve('buffer/');
const streamBrowserify = require.resolve('stream-browserify');
const cryptoBrowserify = require.resolve('crypto-browserify');

module.exports = {
  entry: path.resolve(__dirname, './src/index.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "vm": vmBrowserify,
      "buffer": bufferPolyfill,
      "stream": streamBrowserify,
      "crypto": cryptoBrowserify,
      "process": require.resolve("process/browser")
    },
  },
  output: {
    filename: 'bundle.[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/public/index.html'),
    }),
  ],
};
