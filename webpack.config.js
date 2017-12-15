module.exports = {             // __dirname 指webpack.config.js所在目录
  devtool: 'eval-source-map',  // 配置生成Source Maps

  entry: __dirname + '/script/es2015/ui-logic.js',  // 唯一打包入口文件
  output: {
    path: __dirname + '/script',  // 打包后文件存放的地方
    filename: 'main.js'                  // 打包后输出文件的文件名
  },

  module: {
    loaders: [
      {
        test: /\.js$/,  // 匹配loaders所处理文件的扩展名的正则表达式(必须)
        exclude: /node_modules/,  // 不需要打包的文件夹(可选)
        loader: 'babel-loader',  // loader的名称(必须)
        query: {  // 为loaders提供的额外的设置选项(可选)，也可在项目目录下使用.babelrc进行配置
          presets: ['es2015']
        }
      }
    ]
  },

  devServer: {
    contentBase: __dirname,  // 本地服务器所加载页面所在的目录
    historyApiFallback: true,  // 单页面应用，不跳转
    inline: true,  // 实时刷新
    port: 5000
  }
}
