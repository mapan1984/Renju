import {EMPTY, BLACK, WHITE, BOARD_SIZE, initBorder, resetBorder} from './gnum.js';
import {nextPlace} from './alphabeta.js'
import {isVictory} from './estimate.js'

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
