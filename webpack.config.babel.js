const path = require('path')
const webpack = require('webpack')
const __DEV__ = process.env.NODE_ENV !== 'production'
const definePlugin = new webpack.DefinePlugin({
  __DEV__: __DEV__,
  __VERSION__: JSON.stringify(require('./package.json').version),
  __dirname__: `'${__dirname}'`,
})

export default {
  devtool: 'eval', // eval-source-map
  entry: [
    // 'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr&reload=true',
    './src/js/index.js',
  ],
  output: {
    path: __dirname,
    filename: 'app.bundle.js',
    publicPath: 'public'
  },
  module: {
    loaders: [
      // {
      //   test: /\.js$/,
      //   exclude: /(node_modules|bower_components)/,
      //   loader: 'babel-loader',
      //   query: {
      //     presets: ['react', 'es2015', 'stage-0'],
      //   }
      // },
      { test: /\.css$/, loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]-[local]!postcss-loader' },
      { test: /\.png/, loader: 'url-loader?limit=100000&minetype=image/png' },
      { test: /\.gif/, loader: 'url-loader?limit=100000&minetype=image/gif' },
      { test: /\.jpg/, loader: 'file-loader' },
      { test: /\.json$/, loaders: ['json-loader'] }
    ]
  },
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, 'src/js'),
      path.join(__dirname, 'src/css')
    ],
    alias: {
      'webpack-assets': path.join(__dirname, 'webpack-assets.json')
    }
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    definePlugin,
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: __DEV__
    }),
  ],
  devServer: {
    contentBase: 'public',
    publicPath: '/',
    port: __DEV__ ? 9494 : 80,
    hot: true,
    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a 'webpackHotUpdate' message is send to the content
    // Use 'webpack/hot/dev-server' as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    historyApiFallback: true,

    // rewrite for dev - point route to server for rendering
    proxy: {},

    // webpack-dev-middleware options
    quiet: false,
    noInfo: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    },
    stats: { colors: true }
  }
}
