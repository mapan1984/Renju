import {evaluateState} from './estimate.js'

// 博弈树探索深度
let LIMIT_DEPTH = 2

// 1. 记录搜索博弈树落子前旧的边界
// 2. 在 place 位置落子，并得到落子后的棋局估值
// 3. 恢复落子前的边界值与棋盘状态
function getWeight(chessBoard, alpha, beta, color, searchDepth, place, isMax) {
    // 保存旧边界
    let [old_i_min, old_i_max, old_j_min, old_j_max] = chessBoard.getBorder();

    // 落子并更新搜索边界
    let [i, j] = place;
    if (isMax) {
        // max 层，color 一方落子，取 color 能得到最大估值的情况
        chessBoard[i][j] = color;
    } else {
        // min 层，color 对方落子，取 color 能得到最小估值的情况
        chessBoard[i][j] = -color;
    }
    chessBoard.resetBorder(i, j);

    let weight = alphabeta(chessBoard, alpha, beta, color, searchDepth+1);

    // 恢复棋盘上一个状态与边界值
    chessBoard[i][j] = chessBoard.empty;
    chessBoard.setBorder(old_i_min, old_i_max, old_j_min, old_j_max);

    return weight;
}

// 从博弈树的 0 层进入，递归搜索可能的棋盘状态
// 其他层返回颜色为 color 的棋子在此层的估值( min 值或 max 值)
// 递归结束后回到 0 层，返回 color 棋子最优落子位置
function alphabeta(chessBoard, alpha, beta, color, searchDepth) {
    // 此层是取极大值还是极小值
    let isMin = searchDepth % 2 === 1
    let isMax = !isMin

    // 此层是否为 top 层（top 层也是 max 层）
    let isTop = searchDepth === 0

    // 到探索树叶子节点，直接返回 color 一方在这种情况下的估值
    if (searchDepth >= LIMIT_DEPTH) {
        // console.log(searchDepth, place)
        return evaluateState(chessBoard, color);
    }

    // 否则继续向下探索，估值由下层节点确定

    // top 层，color 一方落子，取 color 能得到最大估值的情况
    // 并返回 color 取得最大估值时的位置
    if (isTop) {
        let max = -Infinity;
        let maxPlace = null;
        for (let place of chessBoard.possiblePlaces()) {

            let weight = getWeight(chessBoard, alpha, beta, color, searchDepth, place, isMax);

            // top/max 层取最大值
            if (max < weight) {
                max = weight;

                alpha = max;
                maxPlace = place;
            }

            // if (alpha < max) {
            //     alpha = max;
            //     maxPlace = place;
            // }

            // top 层不存在上一层，所以这里不用剪枝
            // beta cut-off: 上一层的beta大于这层的alpha，则不用再继续搜索
            // if (beta <= alpha) {
            //     break;
            // }
        }
        return maxPlace;
    }

    // max 层，color 一方落子，取 color 能得到最大估值的情况
    if (isMax) {
        let max = -Infinity;
        for (let place of chessBoard.possiblePlaces()) {

            let weight = getWeight(chessBoard, alpha, beta, color, searchDepth, place, isMax);

            // max 层取最大值
            if (max < weight) {
                max = weight;
            }
            if (alpha < max) {
                alpha = max;
            }

            // beta cut-off: 上一层的 beta 大于这层的 alpha，则不用在继续搜索
            if (beta <= alpha) {
                break;
            }
        }
        return max;
    } else {
        // min 层，color 对方落子，取 color 能得到最小估值的情况
        let min = +Infinity;
        for (let place of chessBoard.possiblePlaces()) {

            let weight = getWeight(chessBoard, alpha, beta, color, searchDepth, place, isMax);

            // min 层取最小值
            if (min > weight) {
                min = weight;
            }
            if (beta > min) {
                beta = min;
            }

            // alpha cut-off: 上一层的 alpha 已经大于这层的 beta，则不用继续搜索
            if (beta <= alpha) {
                break;
            }

        }
        return min;
    }
}

// 根据棋盘情况
// 返回 color 棋子下一个应该落子的位置
function nextPlace(chessBoard, color) {
    let alpha = -Infinity;
    let beta = +Infinity;
    return alphabeta(chessBoard, alpha, beta, color, 0);
}

export default nextPlace;
