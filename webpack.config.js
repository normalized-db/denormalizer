const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const env = process.env.WEBPACK_ENV;
const plugins = [];

const libraryName = 'normalized-db';

const isProd = env === 'prod';
if (isProd) {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
}

module.exports = {
  devtool: 'source-map',
  entry: {
    'index': ['./src/index.ts']
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
    modules: ['./node_modules']
  },
  resolveLoader: {
    modules: ['./node_modules']
  },
  output: {
    path: path.join(process.cwd(), 'lib'),
    filename: '[name]' + (isProd ? '.min' : '') + '.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: plugins
};
