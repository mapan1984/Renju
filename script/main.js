// 棋盘每个位置的可选状态
const EMPTY = 0;
const BLACK = 1;
const WRITE = -1;

// 棋盘大小
const BOARD_SIZE = 15
// 棋盘格大小为30*30的方格
const GRID_SIZE = 30

// 博弈树探索深度
let LIMIT_DEPTH = 2

// 初始化棋盘中落子情况
let chessBoard = [];
for (let i=0; i<BOARD_SIZE; i++) {
    chessBoard[i] = [];
    for (let j=0; j<BOARD_SIZE; j++) {
        chessBoard[i][j] = EMPTY;
    }
}

// 帮助方法，展示棋盘
let showChessBoard = function(){
    for (let i=0; i<BOARD_SIZE; i++) {
        line = [];
        for (let j=0; j<BOARD_SIZE; j++) {
            line.push(chessBoard[j][i]);
        }
        console.log(line.join('|'));
    }
}

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
};

drawChessBoard();

// 进行一步落子
let oneStep = function(i, j, color) {
    context.beginPath();
    context.arc(15 + i*30, 15 + j*30, 13, 0, 2*Math.PI);
    context.closePath();
    let gradient = context.createRadialGradient(15 + i*30 + 2, 15 + j*30 -2, 13,
                                                15 + i*30 + 2, 15 + j*30 -2, 0);
    if (color == BLACK) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
        chessBoard[i][j] = BLACK;
    } else if (color == WRITE) {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
        chessBoard[i][j] = WRITE;
    }
    context.fillStyle = gradient;
    context.fill();
};

let over = false;
// 鼠标绑定落黑子
chess.onclick = function(e) {
    if (over) {
        return null;
    }
    let x = e.offsetX;
    let y = e.offsetY;
    let i = Math.floor(x / 30);
    let j = Math.floor(y / 30);
    if (chessBoard[i][j] === EMPTY) {
        oneStep(i, j, BLACK);
    }

    if (evaluateState(chessBoard, BLACK) === +Infinity) {
        over = true;
        alert("black win");
    }
    if (!over) {
        [i, j] = nextPlace(chessBoard, BLACK);
        console.log(i, j);
        oneStep(i, j, WRITE);
    }
    if (evaluateState(chessBoard, WRITE) === +Infinity) {
        over = true;
        alert("write win");
    }
};

/*
 * 棋型表示
 * 用一个6位数表示棋型，从高位到低位分别表示
 * 连五，活四，眠四，活三，活二/眠三，活一/眠二, 眠一
 */
const VALUE = {
    LIVE_ONE:   100,
    LIVE_TWO:   10000,
    LIVE_THREE: 10000000,
    LIVE_FOUR:  10000000000,
    LIVE_FIVE:  +Infinity,
    SLEEP_ONE:   10,
    SLEEP_TWO:   1000,
    SLEEP_THREE: 1000000,
    SLEEP_FOUR:  10000000000,
    SLEEP_FIVE:  +Infinity,
    BLOCKED_ONE:   1,
    BLOCKED_TWO:   10,
    BLOCKED_THREE: 100,
    BLOCKED_FOUR:  1000,
    BLOCKED_FIVE:  +Infinity,
}

// 根据连字数和封堵数
// 给出一个评价值
function getValue(cnt, blk)
{
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
// 给出评值
function evaluateLine(line, color){
    let value = 0;   // 评估值
    let cnt = 0;     // 连子数
    let blk = 0;     // 封闭数

    const MY = color;   // 己方
    const OT = -color;  // 对方

    // 从左向右扫描
    let lineLength = line.length;
    for (let i = 0; i < lineLength; i++) {
        if (line[i] === color) {// 找到第一个己方的棋子
            // 还原计数
            cnt = 1;

            // 看左侧是否封闭
            if (i === 0 || line[i-1] === OT) {
                // 如果棋子在棋盘的边界,或者上一个棋子为他方棋子
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

// 根据棋盘状况
// 给出棋子颜色为color的评值
function evaluateState(chessBoard, color){
    // 保存四个方向每一行的棋子情况
    let row = [];
    let col = [];
    for (let i=0; i<BOARD_SIZE; i++) {
        row[i] = [];
        col[i] = [];
    }

    let leftSlash = [];
    let rightSlash = [];
    for (let i=0; i<BOARD_SIZE*2-1; i++) {
        leftSlash[i] = [];
        rightSlash[i] = [];
    }

    for (let i = 0; i < BOARD_SIZE; ++i){
        for (let j = 0; j < BOARD_SIZE; ++j){
            row[i].push(chessBoard[i][j]);
            col[j].push(chessBoard[i][j]);
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

    return colorValue-notColorValue;
}

// 根据棋盘情况
// 返回可以落子的位置
function possiblePlaces(chessBoard) {
    let places = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (chessBoard[i][j] === EMPTY) {
                places.push([i,j]);
            }
        }
    }
    return places;
}

// 根据棋盘、落子位置、颜色、深度
// 返回min或max
function minmax(chessBoard, place, color, searchDepth) {
    // 此层是取极大值还是极小值
    let isMin = searchDepth % 2 === 1 ? true : false;

    // 初始化
    let min = +Infinity;
    let max = -Infinity;

    // 落子
    let [i, j] = place;
    if (isMin) {  // min层，落己方的子到达
        chessBoard[i][j] = color;
    } else {  // max层，落对方的子到达
        chessBoard[i][j] = -color;
    }

    if (searchDepth >= LIMIT_DEPTH) {  // 如果到探索的叶子节点，直接返回估值
        // console.log(searchDepth, place)
        return evaluateState(chessBoard, color);
    } else {  // 否则继续向下探索，估值由下层节点确定
        for (let place of possiblePlaces(chessBoard)) {
            // console.log(searchDepth, place)
            weight = minmax(chessBoard, place, color, searchDepth+1);

            // 恢复状态
            let [i, j] = place;
            chessBoard[i][j] = EMPTY;

            // 更新min与max
            if (min > weight) {
                min = weight;
            }
            if (max < weight) {
                max = weight;
            }
        }
        if (isMin) {  // 如果当前层是min，返回min
            return min;
        } else {      // 否则返回max
            return max;
        }
    }
}

function alphabeta(chessBoard, place, alpha, beta, color, searchDepth) {
    // 此层是取极大值还是极小值
    let isMin = searchDepth % 2 === 1 ? true : false;
    let isMax = !isMin;

    // 初始化
    let min = +Infinity;
    let max = -Infinity;

    // 落子
    let [i, j] = place;
    if (isMin) {  // min层，落己方的子到达
        chessBoard[i][j] = color;
    } else {  // max层，落对方的子到达
        chessBoard[i][j] = -color;
    }

    //oldChessBoard = copy(chessBoard);

    if (searchDepth >= LIMIT_DEPTH) {  // 到探索的叶子节点，直接返回估值
        // console.log(searchDepth, place)
        return evaluateState(chessBoard, color);
    } else if (isMax) {  // 否则继续向下探索，估值由下层节点确定
        let max = -Infinity;
        for (let place of possiblePlaces(chessBoard)) {
            // console.log(searchDepth, place)
            weight = alphabeta(chessBoard, place, min, max, color, searchDepth+1);

            // 恢复状态
            let [i, j] = place;
            chessBoard[i][j] = EMPTY;

            max = max > weight ? max : weight;
            alpha = max > alpha ? max : alpha;

            // beta cut-off
            if (beta <= alpha) {
                break;
            }

        }
        return max;
    } else {
        let min = +Infinity;
        for (let place of possiblePlaces(chessBoard)) {
            // console.log(searchDepth, place)
            weight = alphabeta(chessBoard, place, min, max, color, searchDepth+1);

            // 恢复状态
            let [i, j] = place;
            chessBoard[i][j] = EMPTY;

            min = min < weight ? min : weight;
            beta = min < beta ? min : beta;

            // alpha cut-off
            if (beta <= alpha) {
                break;
            }

        }
        return min;
    }
}

// 根据棋盘情况
// 返回下一个color棋应该下的位置
function nextPlace(chessBoard, color) {
    // 在所有可能值中取最大的值
    let max = -Infinity;
    let min = +Infinity;
    let maxPlace = null;
    for (let place of possiblePlaces(chessBoard)) {

        weight = alphabeta(chessBoard, place, max, min, color, 1);

        // 恢复
        let [i, j] = place;
        chessBoard[i][j] = EMPTY;

        if (max < weight) {
            max = weight;
            maxPlace = place;
        }
    }
    return maxPlace;
}

// 根据棋盘情况
// 返回下一个color棋应该下的位置
function minMaxNextPlace(chessBoard, color) {
    // 在所有可能值中取最大的值
    let max = -Infinity;
    let maxPlace = null;
    for (let place of possiblePlaces(chessBoard)) {
        weight = minmax(chessBoard, place, color, 1);

        // 恢复棋盘
        let [i, j] = place;
        chessBoard[i][j] = EMPTY;

        if (max < weight) {
            max = weight;
            maxPlace = place;
        }
    }
    return maxPlace;
}

