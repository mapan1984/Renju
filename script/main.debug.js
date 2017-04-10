// Mon Apr 10 22:30:50 CST 2017
// 棋盘每个位置的可选状态
const EMPTY = 0;
const BLACK = 1;
const WHITE = -1;

// 棋盘大小为15*15行列
const BOARD_SIZE = 15;
// 棋盘格大小为30*30的方格
const GRID_SIZE = 30;

// 博弈树探索深度
let LIMIT_DEPTH = 2;

// 搜索边界值
let i_min = 0;
let j_min = 0;
let i_max = BOARD_SIZE;
let j_max = BOARD_SIZE;

// 扩充边界值
const RANGE = 2;

// 根据第一次落子位置x, y初始搜索边界
function initBorder(x, y){
    if (x-RANGE >= 0)
        i_min = x - RANGE;
    if (x+RANGE <= 15)
        i_max = x + RANGE;
    if (y-RANGE >= 0)
        j_min = y - RANGE;
    if (y+RANGE <= 15)
        j_max = y + RANGE;
}

// 根据非第一次落子位置x, y重置边界
function resetBorder(x, y){
    if (x-RANGE >= 0)
        i_min = i_min < x-RANGE ? i_min : x-RANGE;
    if (x+RANGE <= 15)
        i_max = i_max > x+RANGE ? i_max : x+RANGE;
    if (y-RANGE >= 0)
        j_min = j_min < y-RANGE ? j_min : y-RANGE;
    if (y+RANGE <= 15)
        j_max = j_max > y+RANGE ? j_max : y+RANGE;
}

function setBorder(imin, imax, jmin, jmax) {
    i_min = imin;
    i_max = imax;
    j_min = jmin;
    j_max = jmax;
}

function getBorder(){
    return [i_min, i_max, j_min, j_max];
}




// 不同棋型的价值
const VALUE = {
    LIVE_ONE:   10,
    LIVE_TWO:   500,
    LIVE_THREE: 10000,
    LIVE_FOUR:  1000000,
    LIVE_FIVE:  100000000,
    SLEEP_ONE:   5,
    SLEEP_TWO:   100,
    SLEEP_THREE: 500,
    SLEEP_FOUR:  5000,
    SLEEP_FIVE:  100000000,
    BLOCKED_ONE:   1,
    BLOCKED_TWO:   10,
    BLOCKED_THREE: 200,
    BLOCKED_FOUR:  500,
    BLOCKED_FIVE:  100000000,
};

// 保存四个方向每一行的棋子情况
let row = [];
let col = [];
let leftSlash = [];
let rightSlash = [];

// 根据连子数和封堵数
// 给出一个评价值
function getValue(cnt, blk){
    if (blk === 0) { // 活棋
        switch (cnt) {
            case 1: return VALUE.LIVE_ONE;
            case 2: return VALUE.LIVE_TWO;
            case 3: return VALUE.LIVE_THREE;
            case 4: return VALUE.LIVE_FOUR;
            default: return VALUE.LIVE_FIVE;
        }
    } else if (blk === 1) { // 眠棋
        switch (cnt) {
            case 1: return VALUE.SLEEP_ONE;
            case 2: return VALUE.SLEEP_TWO;
            case 3: return VALUE.SLEEP_THREE;
            case 4: return VALUE.SLEEP_FOUR;
            default: return  VALUE.SLEEP_FIVE;
        }
    } else { // 死棋
        switch (cnt) {
            case 1: return VALUE.BLOCKED_ONE;
            case 2: return VALUE.BLOCKED_TWO;
            case 3: return VALUE.BLOCKED_THREE;
            case 4: return VALUE.BLOCKED_FOUR;
            default: return  VALUE.BLOCKED_FIVE;
        }
    }
}

// 根据一行棋的情况
// 给出color棋在这一行的评值
function evaluateLine(line, color){
    let value = 0;   // 评估值
    let cnt = 0;     // 连子数
    let blk = 0;     // 封闭数

    const MY = color;   // 己方
    const OT = -color;  // 对方

    // 从左向右扫描
    let lineLength = line.length;
    for (let i = 0; i < lineLength; i++) {
        if (line[i] === color) {  // 找到第一个己方的棋子
            // 还原计数
            cnt = 1;

            // 检查左侧是否封闭
            if (i === 0 || line[i-1] === OT) {
                // 如果棋子在棋盘的边界，或者上一个棋子为他方棋子
                blk = 1;
            } else {
                blk = 0;
            }

            // 计算连子数
            for (i = i+1; i < lineLength && line[i] == MY; i++) {
                cnt++;
            }

            // 看右侧是否封闭
            if (line[i] === OT || i === lineLength) {
                blk++;
            }

            // 计算评估值
            value += getValue(cnt, blk);
        }
    }

    return value;
}

// 根据棋盘chessBoard状况
// 给出棋子颜色为color在chessBoard的评值
function evaluateState(chessBoard, color){
    // 初始化(重置)行数组
    for (let i=0; i<BOARD_SIZE; i++) {
        row[i] = [];
        col[i] = [];
    }
    for (let i=0; i<BOARD_SIZE*2-1; i++) {
        leftSlash[i] = [];
        rightSlash[i] = [];
    }

    // 将chessBoard中的棋子分四个方向存储为单行值
    for (let i = 0; i < BOARD_SIZE; ++i){
        for (let j = 0; j < BOARD_SIZE; ++j){
            row[j].push(chessBoard[i][j]);
            col[i].push(chessBoard[i][j]);
            leftSlash[j-i+14].push(chessBoard[i][j]);
            rightSlash[i+j].push(chessBoard[i][j]);
        }
    }

    // 评值
    let colorValue = 0;
    let notColorValue = 0;

    // 累加行状态评估值
    for (let i=0; i<BOARD_SIZE; i++) {
        colorValue += evaluateLine(row[i], color);
        notColorValue += evaluateLine(row[i], -color);
        colorValue += evaluateLine(col[i], color);
        notColorValue += evaluateLine(col[i], -color);
    }
    for (let i=0; i<BOARD_SIZE*2-1; i++) {
        colorValue += evaluateLine(leftSlash[i], color);
        notColorValue += evaluateLine(leftSlash[i], -color);
        colorValue += evaluateLine(rightSlash[i], color);
        notColorValue += evaluateLine(rightSlash[i], -color);
    }
    return colorValue-1.1*notColorValue;
}

// 返回连子数
function victoryInLine(chessBoard, place, color, cx, cy) {
    let cnt = 1;
    let [i, j] = place;
    let [x, y] = [i+cx, j+cy];
    for (; chessBoard[x] && chessBoard[x][y] === color; x+=cx, y+=cy) {
        cnt++;
    }
    [x, y] = [i-cx, j-cy];
    for (; chessBoard[x] && chessBoard[x][y] === color; x-=cx, y-=cy) {
        cnt++;
    }
    if (cnt >= 5) {
        return true;
    } else {
        return false;
    }
}

// 判断chessBoard中位置在place位置的color棋是否取得胜利
function isVictory(chessBoard, place, color) {
    // 四个方向的连子数，初始为1
    let row = victoryInLine(chessBoard, place, color, 1, 0);
    let col = victoryInLine(chessBoard, place, color, 0, 1);
    let left = victoryInLine(chessBoard, place, color, 1, 1);
    let right = victoryInLine(chessBoard, place, color, -1, 1);
    if (row || col || left || right) {
        return true;
    } else {
        return false;
    }
}



// 根据棋盘情况
// 返回可以落子的位置
function possiblePlaces(chessBoard) {
    let places = [];
    for (let i = i_min; i < i_max; i++) {
        for (let j = j_min; j < j_max; j++) {
            if (chessBoard[i][j] === EMPTY) {
                places.push([i,j]);
            }
        }
    }
    return places;
}

// [包装函数]
// 1. 处理搜索博弈树落子前旧的边界与棋盘情况
// 2. 得到落子后的棋局估值
// 3. 恢复落子前的边界值与棋盘情况
function getWeight(alphabeta, chessBoard, alpha, beta, color, searchDepth, place, isMax){
    // 得到落子位置
    let [i, j] = place;
    // 落子
    if (isMax) {
        chessBoard[i][j] = color;
    } else {
        chessBoard[i][j] = -color;
    }
    // 保存旧边界
    let [old_i_min, old_i_max, old_j_min, old_j_max] = getBorder();
    // 更新边界
    resetBorder(i, j);

    let weight = alphabeta(chessBoard, alpha, beta, color, searchDepth+1);

    // 恢复棋盘上一个状态
    chessBoard[i][j] = EMPTY;
    // 恢复边界
    setBorder(old_i_min, old_i_max, old_j_min, old_j_max);
    // 返回值
    return weight;
}

// 根据棋盘、落子位置、当前深度，alpha，beta
// 返回颜色为color的棋子在此层的估值(min值或max值)
function alphabeta(chessBoard, alpha, beta, color, searchDepth) {
    // 此层是取极大值还是极小值
    let isMin = searchDepth % 2 === 1 ? true : false;
    let isTop = searchDepth === 0 ? true : false;
    let isMax = !isMin;

    if (searchDepth >= LIMIT_DEPTH) {  // 到探索的叶子节点，直接返回估值
        // console.log(searchDepth, place)
        return evaluateState(chessBoard, color);
    } else if (isMax) {  // 否则继续向下探索，估值由下层节点确定
        if (isTop) {
            let max = -Infinity;
            let maxPlace = null;
            for (let place of possiblePlaces(chessBoard)) {

                let weight = getWeight(alphabeta, chessBoard, alpha, beta, color, searchDepth, place, isMax);

                // max层取最大值
                if (max < weight) {
                    max = weight;
                    maxPlace = place;
                }
                if (alpha < max) {
                    alpha = max;
                    maxPlace = place;
                }

                // beta cut-off: 上一层的beta大于这层的alpha，则不用在继续搜索
                if (beta <= alpha) {
                    break;
                }
            }
            return maxPlace;
        } else {
            let max = -Infinity;
            for (let place of possiblePlaces(chessBoard)) {

                let weight = getWeight(alphabeta, chessBoard, alpha, beta, color, searchDepth, place, isMax);

                // max层取最大值
                if (max < weight) {
                    max = weight;
                }
                if (alpha < max) {
                    alpha = max;
                }

                // beta cut-off: 上一层的beta大于这层的alpha，则不用在继续搜索
                if (beta <= alpha) {
                    break;
                }
            }
            return max;
        }
    } else {
        let min = +Infinity;
        for (let place of possiblePlaces(chessBoard)) {

            let weight = getWeight(alphabeta, chessBoard, alpha, beta, color, searchDepth, place, isMax);

            // min层取最小值
            if (min > weight) {
                min = weight;
            }
            if (beta > min) {
                beta = min;
            }

            // alpha cut-off: 上一层的alpha已经大于这层的beta，则不用继续搜索
            if (beta <= alpha) {
                break;
            }

        }
        return min;
    }
}

// [alpha-beta]
// 根据棋盘情况
// 返回下一个color棋应该下的位置
function nextPlace(chessBoard, color) {
    let alpha = -Infinity;
    let beta = +Infinity;
    return alphabeta(chessBoard, alpha, beta, color, 0);
}



// 初始化棋盘中落子情况为空
let chessBoard = [];

// 初始化棋盘
function initChessBoard(){
    for (let i=0; i<BOARD_SIZE; i++) {
        chessBoard[i] = [];
        for (let j=0; j<BOARD_SIZE; j++) {
            chessBoard[i][j] = EMPTY;
        }
    }
}

// [帮助方法]：展示棋盘
let showChessBoard = function(){
    for (let i=0; i<BOARD_SIZE; i++) {
        line = [];
        for (let j=0; j<BOARD_SIZE; j++) {
            line.push(chessBoard[j][i]);
        }
        console.log(line.join('|'));
    }
};

// 绘制棋盘
let chess = document.getElementById('chess');
let context = chess.getContext('2d');
context.strokeStyle = "BFBFBF";

let drawChessBoard = function() {
    for (let i=0; i<BOARD_SIZE; i++) {
        context.moveTo(15 + i*30, 15);   // 起点
        context.lineTo(15 + i*30, 435);  // 终点
        context.stroke();
        context.moveTo(15, 15 + i*30);
        context.lineTo(435, 15 + i*30);
        context.stroke();
    }

    for (let i=3; i<BOARD_SIZE; i+=4) {
        for (let j=3; j<BOARD_SIZE; j+=4) {
            context.beginPath();
            context.arc(15 + i*30, 15 + j*30, 5, 0, 2*Math.PI);
            context.closePath();
            context.fill();
        }
    }
};

drawChessBoard();

// 在chessBoard[i][j]落color棋子
let oneStep = function(i, j, color) {
    resetBorder(i, j);
    // console.log(i_min, i_max, j_min, j_max);
    context.beginPath();
    context.arc(15 + i*30, 15 + j*30, 13, 0, 2*Math.PI);
    context.closePath();
    let gradient = context.createRadialGradient(15 + i*30 + 2, 15 + j*30 - 2, 13,
                                                15 + i*30 + 2, 15 + j*30 - 2, 0);
    if (color == BLACK) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
        chessBoard[i][j] = BLACK;
    } else if (color == WHITE) {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
        chessBoard[i][j] = WHITE;
    }
    context.fillStyle = gradient;
    context.fill();
};

// 游戏是否结束
let OVER = false;

let firstStep = true;

let canStart = true;

let [my, enemy] = [null,null];

let whiteBtn = document.getElementById('white');
let blackBtn = document.getElementById('black');
let startBtn = document.getElementById('start');

whiteBtn.onclick = function(){
    my = WHITE;
    enemy = BLACK;
    this.setAttribute('class', 'btn btn-primary');
    this.setAttribute('disabled', 'disabled');
    blackBtn.setAttribute('disabled', 'disabled');
};

blackBtn.onclick = function(){
    my = BLACK;
    enemy = WHITE;
    this.setAttribute('class', 'btn btn-primary');
    this.setAttribute('disabled', 'disabled');
    whiteBtn.setAttribute('disabled', 'disabled');
};

function reStart(){
    canStart = true;
    OVER = false;
    [my, enemy] = [null, null];
    whiteBtn.removeAttribute('disabled');
    blackBtn.removeAttribute('disabled');
    startBtn.removeAttribute('disabled');
    whiteBtn.setAttribute('class', 'btn btn-default');
    blackBtn.setAttribute('class', 'btn btn-default');
    reDrawChess();
    setBorder(0, BOARD_SIZE, 0, BOARD_SIZE);
}

function start(){
    canStart = false;
    initChessBoard();
    if (my === WHITE) {
        initBorder(7, 7);
        oneStep(7, 7, BLACK);
        firstStep = false;
    }
    chess.onclick = function(e) {
        if (OVER) {
            return null;
        }
        let i = Math.floor(e.offsetX / 30);
        let j = Math.floor(e.offsetY / 30);
        if (chessBoard[i][j] === EMPTY) {
            if (firstStep) {
                initBorder(i, j);
                oneStep(i, j, BLACK);
                firstStep = false;
            } else {
                oneStep(i, j, my);
            }
            if (isVictory(chessBoard, [i, j], my)) {
                OVER = true;
                alert("my win");
            } else {
                [i, j] = nextPlace(chessBoard, enemy);
                // console.log(i, j);
                oneStep(i, j, enemy);
                if (isVictory(chessBoard, [i, j], enemy)) {
                    OVER = true;
                    alert("enemy win");
                }
            }
        }
    };
}

function reDrawChess(){
    chess.setAttribute('height', '451px');
    chess.setAttribute('height', '450px');
    drawChessBoard();
}

startBtn.onclick = function(){
    if (canStart) {
        this.innerText = "重新开始";
        start();
    } else {
        this.innerText = "开始";
        reStart();
    }
};
