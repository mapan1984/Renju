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


export {EMPTY, BLACK, WHITE, BOARD_SIZE, LIMIT_DEPTH, initBorder, resetBorder, setBorder, getBorder, i_min, i_max, j_min, j_max};

