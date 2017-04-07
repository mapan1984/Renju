import {EMPTY, BLACK, WRITE, BOARD_SIZE} from './gnum.js';
import {nextPlace} from './alphabeta.js'
import {evaluateState, isVictory} from './estimate.js'

// 游戏是否结束
let OVER = false;

// 初始化棋盘中落子情况为空
let chessBoard = [];
for (let i=0; i<BOARD_SIZE; i++) {
    chessBoard[i] = [];
    for (let j=0; j<BOARD_SIZE; j++) {
        chessBoard[i][j] = EMPTY;
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
            console.log(i,j);
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
    context.beginPath();
    context.arc(15 + i*30, 15 + j*30, 13, 0, 2*Math.PI);
    context.closePath();
    let gradient = context.createRadialGradient(15 + i*30 + 2, 15 + j*30 - 2, 13,
                                                15 + i*30 + 2, 15 + j*30 - 2, 0);
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

// 鼠标绑定落黑子
chess.onclick = function(e) {
    if (OVER) {
        return null;
    }
    let x = e.offsetX;
    let y = e.offsetY;
    let i = Math.floor(x / 30);
    let j = Math.floor(y / 30);
    if (chessBoard[i][j] === EMPTY) {
        oneStep(i, j, BLACK);
        if (isVictory(chessBoard, BLACK)) {
            OVER = true;
            alert("black win");
        } else {
            [i, j] = nextPlace(chessBoard, WRITE);
            // console.log(i, j);
            oneStep(i, j, WRITE);
            if (isVictory(chessBoard, WRITE)) {
                OVER = true;
                alert("write win");
            }
        }
    }
};

