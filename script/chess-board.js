class ChessBoard extends Array {
    constructor(...args) {
        super(...args)

        // 棋盘大小为15*15行列
        this.boardSize = 15
        // 棋盘格大小为30*30的方格
        this.gridSize = 30

        // 棋子颜色
        this.empty = 0
        this.black = 1
        this.white = -1

        // 搜索边界值
        this.i_min = 0
        this.j_min = 0
        this.i_max = this.boardSize
        this.j_max = this.boardSize

        // 扩充边界值
        this.range = 2

        this.chess = document.querySelector('#chess')
        this.context = this.chess.getContext('2d')
    }

    // 初始棋盘数据
    init() {
        for (let i=0; i<this.boardSize; i++) {
            this[i] = new Array(this.boardSize)
            for (let j=0; j<this.boardSize; j++) {
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
        for (let i=0; i<this.boardSize; i++) {
            this.context.moveTo(15 + i*30, 15)   // 起点
            this.context.lineTo(15 + i*30, 435)  // 终点
            this.context.stroke()
            this.context.moveTo(15, 15 + i*30)
            this.context.lineTo(435, 15 + i*30)
            this.context.stroke()
        }

        for (let i=3; i<this.boardSize; i+=4) {
            for (let j=3; j<this.boardSize; j+=4) {
                this.context.beginPath()
                this.context.arc(15 + i*30, 15 + j*30, 5, 0, 2*Math.PI)
                this.context.closePath()
                this.context.fill()
            }
        }
    }

    // 重新绘制棋盘
    reDraw() {
        this.chess.setAttribute('height', '450px')
        this.draw()
    }

    // 在i, j位置落color棋子
    oneStep(i, j, color) {
        this.resetBorder(i, j)

        this.context.beginPath()
        this.context.arc(15 + i*30, 15 + j*30, 13, 0, 2*Math.PI)
        this.context.closePath()
        let gradient = this.context.createRadialGradient(
                                    15 + i*30 + 2, 15 + j*30 - 2, 13,
                                    15 + i*30 + 2, 15 + j*30 - 2, 0
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
        const RANGE = this.range

        if (x-RANGE >= 0)
            this.i_min = x - RANGE
        if (x+RANGE <= this.boardSize)
            this.i_max = x + RANGE
        if (y-RANGE >= 0)
            this.j_min = y - RANGE
        if (y+RANGE <= this.boardSize)
            this.j_max = y + RANGE
    }

    // 根据非第一次落子位置x, y重置边界
    resetBorder(x, y) {
        const RANGE = this.range
        const [i_min, i_max, j_min, j_max] = this.getBorder()

        if (x-RANGE >= 0)
            this.i_min = i_min < x-RANGE ? i_min : x-RANGE
        if (x+RANGE <= this.boardSize)
            this.i_max = i_max > x+RANGE ? i_max : x+RANGE
        if (y-RANGE >= 0)
            this.j_min = j_min < y-RANGE ? j_min : y-RANGE
        if (y+RANGE <= this.boardSize)
            this.j_max = j_max > y+RANGE ? j_max : y+RANGE
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
                    places.push([i,j])
                }
            }
        }
        return places
    }
}

// export {ChessBoard};