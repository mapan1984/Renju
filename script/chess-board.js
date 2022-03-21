class ChessBoard extends Array {
    constructor(...args) {
        super(...args)

        // 棋盘大小为 15*15 行列
        this.boardSize = 15
        // 棋格大小为 30*30 的方格
        this.gridSize = 30
        // 棋盘内边距（棋盘必须有内边距，
        // 不光是美观，同时可以为落子点判断提供左右范围）
        this.padding = this.gridSize / 2
        // 棋子半径
        this.pieceRadius = 13

        // 棋子颜色
        this.empty = 0
        this.black = 1
        this.white = -1

        // 搜索位置边界值
        this.i_min = 0
        this.j_min = 0
        this.i_max = this.boardSize
        this.j_max = this.boardSize

        // 搜索边界每次扩充大小
        this.range = 2

        this.chess = document.querySelector('#chess')
        this.context = this.chess.getContext('2d')
    }

    // 初始棋盘状态
    init() {
        for (let i = 0; i < this.boardSize; i++) {
            this[i] = new Array(this.boardSize)
            for (let j = 0; j < this.boardSize; j++) {
                this[i][j] = this.empty
            }
        }
    }

    show() {
        console.table(this)
    }

    // 绘制棋盘
    draw() {
        this.context.strokeStyle = "BFBFBF"
        for (let i = 0; i < this.boardSize; i++) {
            // 棋盘竖线
            this.context.moveTo(  // 起点
                this.padding + i * this.gridSize,
                this.padding
            )
            this.context.lineTo(  // 终点
                this.padding + i * this.gridSize,
                this.padding + (this.boardSize - 1) * this.gridSize
            )
            this.context.stroke()

            // 棋盘横线
            this.context.moveTo(
                this.padding,
                this.padding + i * this.gridSize
            )
            this.context.lineTo(
                this.padding + (this.boardSize - 1) * this.gridSize,
                this.padding + i * this.gridSize
            )
            this.context.stroke()
        }

        for (let i = 3; i < this.boardSize; i += 4) {
            for (let j = 3; j < this.boardSize; j += 4) {
                this.context.beginPath()
                this.context.arc(
                    this.padding + i * this.gridSize,  // x
                    this.padding + j * this.gridSize,  // y
                    this.gridSize / 6,                 // radius
                    0,                                 // startAngle
                    2 * Math.PI                        // endAngle
                )
                this.context.closePath()
                this.context.fill()
            }
        }
    }

    // 重新绘制棋盘
    reDraw() {
        this.chess.setAttribute('height', `${this.boardSize * this.gridSize}px`)
        this.draw()
    }

    // 在i, j位置落color棋子
    oneStep(i, j, color) {
        this.resetBorder(i, j)

        this.context.beginPath()
        this.context.arc(
            this.padding + i * this.gridSize,  // x 坐标
            this.padding + j * this.gridSize,  // y 坐标
            this.pieceRadius,                  // 半径
            0,                                 // startAngle
            2 * Math.PI                        // endAngle
        )
        this.context.closePath()

        let gradient = this.context.createRadialGradient(
            this.padding + i * this.gridSize + 2,  // x1
            this.padding + j * this.gridSize - 2,  // y1
            this.pieceRadius,                      // r1
            this.padding + i * this.gridSize + 2,  // x2
            this.padding + j * this.gridSize - 2,  // y2
            0                                      // r2
        )
        if (color == this.black) {
            gradient.addColorStop(0, "#0A0A0A")
            gradient.addColorStop(1, "#636766")
            this[i][j] = this.black
        } else if (color == this.white) {
            gradient.addColorStop(0, "#D1D1D1")
            gradient.addColorStop(1, "#F9F9F9")
            this[i][j] = this.white
        }

        this.context.fillStyle = gradient
        this.context.fill()
    }

    // 根据第一次落子位置x, y初始搜索边界
    initBorder(x, y) {
        if (x - this.range >= 0) {
            this.i_min = x - this.range
        }

        if (x + this.range <= this.boardSize) {
            this.i_max = x + this.range
        }

        if (y - this.range >= 0) {
            this.j_min = y - this.range
        }

        if (y + this.range <= this.boardSize) {
            this.j_max = y + this.range
        }
    }

    // 根据非第一次落子位置x, y重置边界
    resetBorder(x, y) {
        const [i_min, i_max, j_min, j_max] = this.getBorder()

        if (
            x - this.range >= 0
            && i_min > x - this.range
        ) {
            this.i_min = x - this.range
        }

        if (
            x + this.range <= this.boardSize
            && i_max < x + this.range
        ) {
            this.i_max = x + this.range
        }

        if (
            y - this.range >= 0
            && j_min > y - this.range
        ) {
            this.j_min = y - this.range
        }

        if (
            y + this.range <= this.boardSize
            && j_max < y + this.range
        ) {
            this.j_max = y + this.range
        }
    }

    setBorder(i_min, i_max, j_min, j_max) {
        this.i_min = i_min
        this.i_max = i_max
        this.j_min = j_min
        this.j_max = j_max
    }

    getBorder() {
        return [this.i_min, this.i_max, this.j_min, this.j_max]
    }

    is(i, j, color) {
        return this[i] && this[i][j] === color
    }

    isEmpty(i, j) {
        return this.is(i, j, this.empty)
    }

    isBlack(i, j) {
        return this.is(i, j, this.black)
    }

    isWhite(i, j) {
        return this.is(i, j, this.white)
    }

    // 根据棋盘情况
    // 返回可以落子的位置
    possiblePlaces() {
        let places = []
        let [i_min, i_max, j_min, j_max] = this.getBorder()
        for (let i = i_min; i < i_max; i++) {
            for (let j = j_min; j < j_max; j++) {
                if (this.isEmpty(i, j)) {
                    places.push([i, j])
                }
            }
        }
        return places
    }
}

export default ChessBoard;
