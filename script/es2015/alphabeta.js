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
                // max层，落已方的子到达下一层
                let [i, j] = place;
                chessBoard[i][j] = color;

                // console.log(searchDepth, place)
                let weight = alphabeta(chessBoard, alpha, beta, color, searchDepth+1);

                // 恢复棋盘上一个状态
                chessBoard[i][j] = EMPTY;

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
                // max层，落已方的子到达下一层
                let [i, j] = place;
                chessBoard[i][j] = color;

                // console.log(searchDepth, place)
                let weight = alphabeta(chessBoard, alpha, beta, color, searchDepth+1);

                // 恢复棋盘上一个状态
                chessBoard[i][j] = EMPTY;

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
            // min层，落对方的子到达下一层
            let [i, j] = place;
            chessBoard[i][j] = -color;

            // console.log(searchDepth, place)
            let weight = alphabeta(chessBoard, alpha, beta, color, searchDepth+1);

            // 恢复状态
            chessBoard[i][j] = EMPTY;

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

export {nextPlace};

