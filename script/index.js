import ChessBoard from './chess-board.js'
import {isVictory} from './estimate.js'
import nextPlace from './alphabeta.js'


// 棋盘
let chessBoard = new ChessBoard()
chessBoard.init()
chessBoard.draw()

// 棋子颜色
const BLACK = chessBoard.black
const WHITE = chessBoard.white


// 游戏是否结束
let isOver = false
// 是否为第一步
let isFirstStep = true
// 双方棋子颜色
let [my, enemy] = [null,null]


let selectDiv = document.getElementById('select')
let whiteBtn = document.getElementById('white')
let blackBtn = document.getElementById('black')

let resetBtn = document.getElementById('reset')
resetBtn.style.display='none'


whiteBtn.onclick = function() {
    my = WHITE
    enemy = BLACK
    selectDiv.style.display='none'
    resetBtn.style.display='block'
    start()
}

blackBtn.onclick = function() {
    my = BLACK
    enemy = WHITE
    selectDiv.style.display='none'
    resetBtn.style.display='block'
    start()
}

function start() {
    if (my === WHITE) {
        chessBoard.oneStep(7, 7, BLACK)
        chessBoard.initBorder(7, 7)
        isFirstStep = false
    }

    chess.onclick = function(e) {
        if (isOver) {
            return
        }

        let i = Math.floor(e.offsetX / 30)
        let j = Math.floor(e.offsetY / 30)
        if (chessBoard.isEmpty(i, j)) {
            if (isFirstStep) {
                chessBoard.oneStep(i, j, BLACK)
                chessBoard.initBorder(i, j)
                isFirstStep = false
            } else {
                chessBoard.oneStep(i, j, my)
            }

            if (isVictory(chessBoard, [i, j], my)) {
                isOver = true
                // temp solve delay problem
                setTimeout("alert('my win')", 0)
            } else {
                [i, j] = nextPlace(chessBoard, enemy)
                chessBoard.oneStep(i, j, enemy)
                if (isVictory(chessBoard, [i, j], enemy)) {
                    isOver = true
                    // temp solve delay problem
                    setTimeout("alert('enemy win')", 0)
                }
            }
        }
    }
}

// 重新开始
resetBtn.onclick = function() {
    isOver = false
    isFirstStep = true
    [my, enemy] = [null, null]
    chess.onclick = null
    selectDiv.style.display='block'
    resetBtn.style.display='none'
    chessBoard.init()
    chessBoard.setBorder(0, 15, 0, 15)
    chessBoard.reDraw()
}
