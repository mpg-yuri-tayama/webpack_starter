// glob: https://github.com/isaacs/node-glob#readme
// パターンマッチでファイルを取得する
const glob = require('glob')

// path: https://nodejs.org/api/path.html
// OSに依存せず、pathの解決をする
const path = require('path')

// webpack: https://webpack.js.org/
// モジュールをバンドルする
const webpack = require('webpack')

// webpack-assets-manifest: https://github.com/webdeveric/webpack-assets-manifest
// { "filename" : "filepath" }形式のJSONファイルを出力する
// Rails側が読み込むべきファイルを判定するために必要
const WebpackAssetsManifest = require('webpack-assets-manifest')

// mini-css-extract-plugin: https://github.com/webpack-contrib/mini-css-extract-plugin
// CSSを含むJSファイルごとにCSSファイルを作成する
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// vue-loader: https://vue-loader-v14.vuejs.org/ja/
// VueコンポーネントをプレーンなJSモジュールに変換する
const { VueLoaderPlugin } = require('vue-loader')

// __dirname: このスクリプトが存在するディレクトリ
const root = path.join(__dirname, '..')
const bundles = path.join(root, 'app', 'javascript', 'packs')
const targets = glob.sync(path.join(bundles, '**/*.{js,ts}'))
const entry = targets.reduce((entry, target) => {
  const bundle = path.relative(root, target)
  const filename = path.relative(bundles, target)
  const ext = path.extname(filename)

  return Object.assign({}, entry, {
    [filename.replace(ext, '')]: './' + bundle,
  })
}, {})

const publicPath = '/packs/'

module.exports = {
  entry: entry,
  output: {
    filename: 'js/[name]-[hash].js',
    chunkFilename: 'js/[name].bundle-[hash].js',
    // 
    path: path.resolve(root, 'public', 'packs'),
    publicPath,
  },
  plugins: [
    // 画像ファイルなどをソースコード外から取得できるよう、本番ビルド時に
    new WebpackAssetsManifest({ publicPath: true }),
    new MiniCssExtractPlugin({
      filename: 'style/[name]-[hash].css',
      chunkFilename: 'style/[name].bundle-[hash].css',
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.ROLLBAR_CLIENT_TOKEN': JSON.stringify(
        process.env.ROLLBAR_CLIENT_TOKEN
      ),
      'process.env.RAILS_ENV': JSON.stringify(
        process.env.RAILS_ENV || 'development'
      ),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 2 },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer')({ grid: true }),
                require('postcss-flexbugs-fixes'),
              ],
            },
          },
          { loader: 'sass-loader', options: {} },
        ],
      },
      {
        test: /\.(gif|png|jpg|eot|wof|woff|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name]-[hash].[ext]',
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@components': path.resolve(root, 'app/javascript/components'),
      '@images': path.resolve(root, 'app/javascript/images'),
      '@packs': path.resolve(root, 'app/javascript/packs'),
      '@styles': path.resolve(root, 'app/javascript/styles'),
      '@types': path.resolve(root, 'app/javascript/types'),
      '@utils': path.resolve(root, 'app/javascript/utils'),
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.vue', '.ts'],
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 250000,
    maxAssetSize: 250000,
  },
}
