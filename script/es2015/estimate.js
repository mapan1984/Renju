import {BOARD_SIZE} from './gnum.js';

// 不同棋型的价值
const VALUE = {
    LIVE_ONE:   10,
    LIVE_TWO:   500,
    LIVE_THREE: 10000,
    LIVE_FOUR:  1000000,
    LIVE_FIVE:  +Infinity,
    SLEEP_ONE:   5,
    SLEEP_TWO:   100,
    SLEEP_THREE: 500,
    SLEEP_FOUR:  5000,
    SLEEP_FIVE:  +Infinity,
    BLOCKED_ONE:   1,
    BLOCKED_TWO:   10,
    BLOCKED_THREE: 200,
    BLOCKED_FOUR:  500,
    BLOCKED_FIVE:  +Infinity,
};

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

    // 存储chessBoard四个方向的棋子
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
    return colorValue-1.1*notColorValue;
}

export {evaluateState};

