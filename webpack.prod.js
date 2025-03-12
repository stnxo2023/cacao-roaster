// webpack.prod.js
const webpackCommon = require('./webpack.common.cjs');

module.exports = {
  ...webpackCommon,
  mode: 'production',
};
