## Renju

用 JavaScript 完成的五子棋游戏，采用 alpha-beta 剪枝算法进行落子决策。

### 代码功能

`script` 目录下的代码是整个游戏的核心，其中:

1. `alphabeta.js` 中完成 alpha-beta 算法；
2. `estimate.js` 中完成对棋局的评估函数和胜负判断；
4. `chess-board` 中完成对棋盘的抽象；
5. `index.js` 中完成棋盘的绘制和落子的检测，同时界面的操作逻辑也在这部分。
