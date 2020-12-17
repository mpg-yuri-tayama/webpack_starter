/* globals module */
process.env.NODE_ENV = 'development'
const { merge } = require('webpack-merge')
const common = require('./common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
})
