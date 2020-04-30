// ---------------------------------------------- Constants ----------------------------------------------
SPAN_FONT_WEIGHT = 'bold';
SPAN_FONT_SIZE = 'xxx-large';
SPAN_FONT_FAMILY = 'Courier';

BLOCK_SIZE = 120;
BLOCK_PLACEHOLDER_COLOR = '555555';
BLOCK_BACKGROUND_COLOR = '664455';

CANVAS_SIZE = 600;
CANVAS_BACKGROUNDCOLOR = '333333';

ASLE_WIDTH = (CANVAS_SIZE - 4 * BLOCK_SIZE) / 5;

GAME_SIZE = 4;

FRAME_PER_SECOND = 30;
ANIMATION_LAST_TIME = 0.15;


// ---------------------------------------------- Global Utility ---------------------------------------------- 
randInt = function(a, b) {
    return a + Math.floor(Math.random() * (b+1-a));
}

randChoice = function(arr) {
    return arr[randInt(0, arr.length - 1)]
}


// ---------------------------------------------- MODEL 模型 ---------------------------------------------- 
class Game {
    constructor() {
        this.data = [];
        this.initializeData();
        this.generateNewBlock();
        this.generateNewBlock();
    }

    initializeData() {
        this.data = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null);
            }
            this.data.push(tmp);
        }
    }

    generateNewBlock() {
        let possiblePosiitons = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    possiblePosiitons.push([i, j]);
                }
            }
        }
        let position = randChoice(possiblePosiitons);
        this.data[position[0]][position[1]] = 2;
    }

    // arr == [2, nulll, 2, null]
    shiftBlock(arr, reverse = false) {
        let head = 0;
        let tail = 1;
        let incr = 1;
        let moves = [];
        let points = 0;

        if (reverse == true) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }

        while (0 <= tail && tail < arr.length) {
            if (arr[tail] == null) {
                tail += incr;
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    moves.push([tail, head]);
                    tail += incr;
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    points += arr[head];
                    moves.push([tail, head]);
                    head += incr;
                    tail += incr;
                } else {
                    head += incr;
                    if (head == tail) {
                        tail += incr;
                    }
                }
            }
        }
        return {
            'moves': moves,
            'points': points,
        }
    }

    // command in ['left', 'right', 'up', 'down']
    advance(command) {
        let reverse = (command == 'right' || command == 'down')
        let moves = [];
        let points = 0;

        if (command == 'left' || command == 'right') {
            for (let i = 0; i < GAME_SIZE; i++) {
                let result = this.shiftBlock(this.data[i], reverse);
                for (let move of result['moves']) {
                    moves.push([[i, move[0]], [i, move[1]]]);
                }
            }
        } else if (command == 'up' || command == 'down') {
            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                let result = this.shiftBlock(tmp, reverse);
                for (let move of result['moves']) {
                    moves.push([[move[0], j], [move[1], j]]);
                }
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }
        }

        if (moves.length != 0) {
            this.generateNewBlock();
        }

        return moves;
    }
}

class Test {
    static compareArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }
    
    static test_shiftBlock() {
        let gameTest = new Game();

        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, 8, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4 ,8], [8, 8, null, null]],
        ]

        let errFlag = false;
        for (let test of testCases) {
            for (let reverse of [true, false]) {
                let input = test[0].slice();
                let result = test[1].slice();
                if (reverse == true) {
                    input.reverse();
                    result.reverse();
                }
                gameTest.shiftBlock(input, reverse)
                if (!Test.compareArray(input, result)) {
                    errFlag = true;
                    console.log("Error!");
                }
            }
        }

        if (!errFlag) {
            console.log("Pass!");
        }
    }
}

// ---------------------------------------------- VIEW 视图 ----------------------------------------------
class View {
    constructor(game, container) {
        this.game = game;
        this.blocks = [];
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUNDCOLOR;
        this.container.style.position = 'relative';
        this.container.style.display = 'inline-block';
        this.container.style.borderRadius = '10px';
        this.container.style.zIndex = 1;
    }

    gridToPosition(i, j) {
        let top = ASLE_WIDTH + i * (ASLE_WIDTH + BLOCK_SIZE);
        let left = ASLE_WIDTH + j * (ASLE_WIDTH + BLOCK_SIZE);
        return [top, left];
    }

    animate(moves) {
        this.doFrame(moves, 0, ANIMATION_LAST_TIME);
    }

    // draw a singel frame
    doFrame(moves, currTime, totalTime) {
        if (currTime < totalTime) {
            // Draw animation
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PER_SECOND, totalTime);
            }, 1 / FRAME_PER_SECOND * 1000);

            for (let move of moves) {
                // moves -> [[start[i, j], end[i, j]], ...]
                // move -> [start[i, j], end[i, j]]
                let block = this.blocks[move[0][0]][move[0][1]];

                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1]);
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])
                ]

                block.style.top = currPosition[0];
                block.style.left = currPosition[1];
            }
        } else {
            view.drawGame();
        }
    }

    drawGame() {
        this.container.innerHTML = '';
        this.blocks = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                let block = null; 
                if (this.game.data[i][j]) {
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                tmp.push(block);
            }
            this.blocks.push(tmp);
        }
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");
        block.style.position = 'absolute';  // absolute: based on the position of its ancestor
        block.style.backgroundColor = color;

        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.top = ASLE_WIDTH + i * (ASLE_WIDTH + BLOCK_SIZE);
        block.style.left = ASLE_WIDTH + j * (ASLE_WIDTH + BLOCK_SIZE);
        block.style.borderRadius = '5px';
        block.style.zIndex = 3;

        this.container.append(block);

        return block;
    }

    drawBlock(i, j, number) {
        let text = document.createTextNode(number);
        let span = document.createElement('span');
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR)

        span.appendChild(text);
        span.style.lineHeight = block.style.height;
        span.style.fontSize = SPAN_FONT_SIZE;
        span.style.fontFamily = SPAN_FONT_FAMILY;
        span.style.fontWeight = SPAN_FONT_WEIGHT;

        block.appendChild(span);
        block.style.zIndex = 5;

        return block;
    }
}

// ---------------------------------------------- CONTROLLER 控制 ----------------------------------------------
var container = document.getElementById('game-container');
var game = new Game();
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    let moves = null; 

    if (event.key == 'ArrowLeft') {
        moves = game.advance('left');
    } else if (event.key == 'ArrowRight') {
        moves = game.advance('right');
    } else if (event.key == 'ArrowUp') {
        moves = game.advance('up');
    } else if (event.key == 'ArrowDown') {
        moves =  game.advance('down');
    }

    if (moves) {
        view.animate(moves);
    }
}