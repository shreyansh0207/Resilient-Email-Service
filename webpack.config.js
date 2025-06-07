const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/public/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist/public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/public'),
    },
    compress: true,
    port: 3002,
    host: 'localhost',
    open: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    onListening: function(devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      console.log('Listening on port:', port);
    },
  },
}; 