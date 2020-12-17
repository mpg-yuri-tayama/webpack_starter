/* globals __dirname module */
process.env.NODE_ENV = 'test'

const path = require('path')
const { merge } = require('webpack-merge')
const common = require('./common.js')

module.exports = merge(common, {
  mode: 'none',
  devtool: 'none',
  output: {
    path: path.resolve(__dirname, '..', 'public', 'packs-test'),
    publicPath: '/packs-test/',
  },
})
