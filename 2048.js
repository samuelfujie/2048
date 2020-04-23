// ---------------------------------------------- Constants ----------------------------------------------
SPAN_FONT_WEIGHT = 'bold';
SPAN_FONT_SIZE = 'xxx-large';
SPAN_FONT_FAMILY = 'Courier';

BLOCK_SIZE = 120;
BLOCK_PLACEHOLDER_COLOR = '#555555';
BLOCK_BACKGROUND_COLOR = '#664455';

CANVAS_SIZE = 600;
CANVAS_BACKGROUNDCOLOR = '#333333';

ASLE_WIDTH = (CANVAS_SIZE - 4 * BLOCK_SIZE) / 5;

GAME_SIZE = 4;

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
                    tail += incr
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
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
        return arr;
    }

    // command in ['left', 'right', 'up', 'down']
    advance(command) {
        let reverse = (command == 'right' || command == 'down')
        // [
        //    [0,1], [0,3] 从0，1挪到了0，3
        // ]
        let moves = [[]];

        if (command == 'left' || command == 'right') {
            for (let i = 0; i < GAME_SIZE; i++) {
                this.shiftBlock(this.data[i], reverse);
            }
        } else if (command == 'up' || command == 'down') {
            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                this.shiftBlock(tmp, reverse);
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }
        }
        this.generateNewBlock();
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
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUNDCOLOR;
        this.container.style.position = 'relative';
        this.container.style.display = 'inline-block';
    }

    drawGame() {
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                if (this.game.data[i][j]) {
                    this.drawBlock(i, j, this.game.data[i][j]);
                }
            }
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
    }
}

// ---------------------------------------------- CONTROLLER 控制 ----------------------------------------------
var container = document.getElementById('game-container');
var game = new Game();
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    if (event.key == 'ArrowLeft') {
        game.advance('left');
    } else if (event.key == 'ArrowRight') {
        game.advance('right');
    } else if (event.key == 'ArrowUp') {
        game.advance('up');
    } else if (event.key == 'ArrowDown') {
        game.advance('down');
    }
    view.drawGame();
}