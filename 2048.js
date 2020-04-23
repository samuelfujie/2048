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
    shiftBlock(arr) {

        //arr == [4, null, null, null]
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
