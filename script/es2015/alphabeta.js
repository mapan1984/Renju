import {EMPTY, LIMIT_DEPTH, resetBorder, setBorder, getBorder, i_min, i_max, j_min, j_max} from './gnum.js';
import {evaluateState} from './estimate.js'

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

export {nextPlace};

