import {EMPTY, BLACK, WHITE, BOARD_SIZE, initBorder, setBorder, resetBorder} from './gnum.js';
import {nextPlace} from './alphabeta.js'
import {isVictory} from './estimate.js'

// 初始化棋盘中落子情况为空
let chessBoard = [];

// 初始化棋盘
function initChessBoard() {
    for (let i=0; i<BOARD_SIZE; i++) {
        chessBoard[i] = [];
        for (let j=0; j<BOARD_SIZE; j++) {
            chessBoard[i][j] = EMPTY;
        }
    }
}

// [帮助方法]：展示棋盘
let showChessBoard = function() {
    for (let i=0; i<BOARD_SIZE; i++) {
        let line = [];
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

// 重新绘制棋盘
function reDrawChess() {
    chess.setAttribute('height', '450px');
    drawChessBoard();
}

// 在chessBoard[i][j]落color棋子
let oneStep = function(i, j, color) {
    // 重置边界
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
let isOver = false;
// 是否为第一步
let isFirstStep = true;
// 双方棋子颜色
let [my, enemy] = [null,null];
// 初始棋盘数据
initChessBoard();
// 绘制棋盘
drawChessBoard();

let selectDiv = document.getElementById('select');
let whiteBtn = document.getElementById('white');
let blackBtn = document.getElementById('black');

let resetBtn = document.getElementById('reset');
resetBtn.style.display='none';

whiteBtn.onclick = function() {
    my = WHITE;
    enemy = BLACK;
    selectDiv.style.display='none';
    resetBtn.style.display='block';
    start();
};

blackBtn.onclick = function() {
    my = BLACK;
    enemy = WHITE;
    selectDiv.style.display='none'
    resetBtn.style.display='block';
    start();
};

function start() {
    if (my === WHITE) {
        oneStep(7, 7, BLACK);
        initBorder(7, 7);
        isFirstStep = false;
    }

    chess.onclick = function(e) {
        if (isOver) {
            return null;
        }
        let i = Math.floor(e.offsetX / 30);
        let j = Math.floor(e.offsetY / 30);
        if (chessBoard[i][j] === EMPTY) {
            if (isFirstStep) {
                oneStep(i, j, BLACK);
                initBorder(i, j);
                isFirstStep = false;
            } else {
                oneStep(i, j, my);
            }
            if (isVictory(chessBoard, [i, j], my)) {
                isOver = true;
                alert("my win");
            } else {
                [i, j] = nextPlace(chessBoard, enemy);
                // console.log(i, j);
                oneStep(i, j, enemy);
                if (isVictory(chessBoard, [i, j], enemy)) {
                    isOver = true;
                    alert("enemy win");
                }
            }
        }
    };
}

// 重新开始
resetBtn.onclick = function() {
    isOver = false;
    isFirstStep = true;
    [my, enemy] = [null, null];
    chess.onclick = null;
    selectDiv.style.display='block';
    resetBtn.style.display='none';
    initChessBoard();
    setBorder(0, BOARD_SIZE, 0, BOARD_SIZE);
    reDrawChess();
};
