import {EMPTY, BOARD_SIZE, LIMIT_DEPTH} from './gnum.js';
import {evaluateState} from './estimate.js'

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

// 根据棋盘、落子位置、当前深度
// 返回颜色为color的棋子在此层的估值(min值或max值)
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
            let weight = minmax(chessBoard, place, color, searchDepth+1);

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

// [min-max]
// 根据棋盘情况
// 返回下一个color棋应该下的位置
function nextPlace(chessBoard, color) {
    // 在所有可能值中取最大的值
    let max = -Infinity;
    let maxPlace = null;
    for (let place of possiblePlaces(chessBoard)) {
        let weight = minmax(chessBoard, place, color, 1);

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

export {nextPlace};

