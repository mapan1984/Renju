## Renju

[![Build Status](https://travis-ci.org/mapan1984/Renju.svg?branch=master)](https://travis-ci.org/mapan1984/Renju)

用JavaScript完成的五子棋游戏，采用alpha-beta剪枝算法进行落子判断。

### 使用

这个游戏实际上只是一个静态页面，但使用了ES6语法，这要求在实际使用时将ES6代码转换为现在浏览器支持的代码。我选择使用webpack和babel对代码进行转换。

1. 安装Node.js，执行以下命令安装webpack和babel等工具

        $ npm install

2. 执行以下命令进行代码转换，这一步会将`script/es2015/`目录下的所有代码打包成`script/main.js`这一个文件

        $ npm run build

3. 现在，可以直接用浏览器打开`index.html`进行游戏(或者，也可以使用`npm start`开启webpack提供的本地服务器，在浏览器中访问`http://localhost:5000`，这样可以在代码变换后实时刷新，便于调试)

### 代码功能

`script/es2015/`目录下的代码是整个游戏的核心，其中:

1. `alphabeta.js`中完成alpha-beta算法；
2. `estimate.js`中完成对棋局的评估函数和胜负判断；
3. `gnum.js`中是对所有模块都要用到的公共变量的定义和一些对变量的修改操作接口；
4. `ui.js`中使用用cavans完成棋盘的绘制和落子的检测，同时界面的操作逻辑也在这部分。

在实际使用时，会将上述代码打包成`script/main.js`，被`index.html`直接引入。

