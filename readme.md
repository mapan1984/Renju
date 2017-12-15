## Renju

用JavaScript完成的五子棋游戏，采用alpha-beta剪枝算法进行落子判断。

### 代码功能

`script`目录下的代码是整个游戏的核心，其中:

1. `alphabeta.js`中完成alpha-beta算法；
2. `estimate.js`中完成对棋局的评估函数和胜负判断；
3. `global-num.js`中完成公共变量的定义；
4. `chess-board`中完成对棋盘的抽象；
5. `ui-logic.js`中完成棋盘的绘制和落子的检测，同时界面的操作逻辑也在这部分。
