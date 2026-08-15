// The board is laid out as an horizontal array (x) of vertical arrays (y)


const INVALID_CELL = -1;
const EMPTY = 0;

const WHITE = 1;
const WHITE_SELECTED = 2;

const BLACK = 3;
const BLACK_SELECTED = 4;

const LEGAL_MOVE = 5;
const LEGAL_JUMP = 6;


const WHITE_TURN = 0;
const BLACK_TURN = 1;

const WHITE_REMOVE = 2; // When a white token jumps an opponnents token they choose another of the opponents tokens to remove
const BLACK_REMOVE = 3;

const DRAW = 4;
const WIN = 5;


const canvas = document.getElementById("canvas");
canvas.addEventListener("click", clickHandler);

let cellSize = canvas.height/6;

const message = document.getElementById("message");

const whiteHand = document.getElementById("whiteHand");
const blackHand = document.getElementById("blackHand");

const drawButton = document.getElementById("drawButton");
drawButton.addEventListener("click", drawButtonClick);


const ctx = canvas.getContext("2d");
ctx.lineWidth = 5;


function createBoard() {
    let board = [];

    while (board.length < 5) { // x
        let list = [];
        list.length = 6; // y
        list.fill(0);
        board.push(list);
    }

    return board;
}


function initialise() {
    board = createBoard();

    tokens = [12, 12];
    hands = [12, 12];

    turn = WHITE_TURN;
    
    updateUI();
    drawBoard();
    drawTokens();

}


function updateUI() {

    let messageText;
    let playerColour = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? "white" : "black";
    let opponentsColour = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? "black" : "white";

    switch (turn) {
        case WHITE_TURN: case BLACK_TURN:
            if (!selected.state) {

                messageText = "Select a " + playerColour + " token to move";

                if (hands[turn] > 0) {
                    messageText = messageText + " or place a token";
                }

            } else {
                messageText = "Move your " + playerColour + " token to a square or jump";
            }
            break;


        case WHITE_REMOVE: case BLACK_REMOVE:
            messageText = "Choose an opponents " + opponentsColour + " token to remove it";
            break;


        case DRAW:
            messageText = "It's a draw";
            break;

        
        case WIN:
            let winningColour = (tokens[WHITE_TURN] === 0) ? "Black" : "White";
            messageText = winningColour + " wins"
            break;

    }

    if (tokens[0] <= 3 && tokens[1] <= 3 && turn < DRAW) {
        messageText = messageText + " or draw.";
        drawButton.disabled = false;
    } else {
        messageText = messageText + ".";
        drawButton.disabled = true;
    }
    
    whiteHand.innerText = hands[WHITE_TURN];
    blackHand.innerText = hands[BLACK_TURN];
    
    message.innerText = messageText;
}


function drawBoard() {
    ctx.clearRect(0, 0, cellSize*5, cellSize*6);

    ctx.fillStyle = "#11111155";
    ctx.strokeStyle = "#A9A9C7";
    ctx.fillRect(0, 0, cellSize*5, cellSize*6);
    ctx.strokeRect(0, 0, cellSize*5, cellSize*6);

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {

            if (board[i][j] !== INVALID_CELL) {
                
                ctx.fillStyle = "#1f150850";

                ctx.beginPath();
                ctx.arc(
                    i*cellSize + cellSize/2,
                    j*cellSize + cellSize/2,
                    cellSize/3,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }

        }
    }
}


function drawTokens() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {

            let tokenSize;

            switch (board[i][j]) {
                case WHITE:
                    ctx.fillStyle = "#FFFFFF";
                    ctx.strokeStyle = "#E8E8E8";
                    tokenSize = cellSize/3;
                    break;

                case WHITE_SELECTED:
                    ctx.fillStyle = "#FFFFFF";
                    ctx.strokeStyle = "#FFFF00";
                    tokenSize = cellSize/3;
                    break;

                case BLACK:
                    ctx.fillStyle = "#181818";
                    ctx.strokeStyle = "#000000";
                    tokenSize = cellSize/3;
                    break;

                case BLACK_SELECTED:
                    ctx.fillStyle = "#181818";
                    ctx.strokeStyle = "#FFFF00";
                    tokenSize = cellSize/3;
                    break;

                case LEGAL_MOVE:
                    ctx.fillStyle = "#7171FF";
                    ctx.strokeStyle = "#0000";
                    tokenSize = cellSize/6;
                    break;
                    
                case LEGAL_JUMP:
                    ctx.fillStyle = "#FF7171";
                    ctx.strokeStyle = "#0000";
                    tokenSize = cellSize/6;
                    break;

                default:
                    continue;
                    break;
            }

            ctx.beginPath();
            ctx.arc(
                i*cellSize + cellSize/2,
                j*cellSize + cellSize/2,
                tokenSize,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();

        }
    }
}


function clickHandler(event) {

    let rectangle = canvas.getBoundingClientRect(); // Get the position and size of the canvas

    let relativeX = event.clientX - rectangle.left; // Get the position of the click starting from the top left
    let relativeY = event.clientY - rectangle.top;

    let canvasX = relativeX * (canvas.width / rectangle.width); // Scale the position based on the size difference between the canvas resolution and its actual size on the screen
    let canvasY = relativeY * (canvas.height / rectangle.height);

    let x = Math.floor(canvasX/cellSize);
    let y = Math.floor(canvasY/cellSize);

    let playerColour = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? WHITE : BLACK;
    let opponentColour = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? BLACK : WHITE;

    let opponentTurn = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? BLACK_TURN : WHITE_TURN;


    switch (turn) {

        case WHITE_TURN: case BLACK_TURN:

            switch (board[x][y]) {
                    
                case EMPTY:
                    
                    if (!selected.state) {
                        if (hands[turn] > 0) {
                            board[x][y] = playerColour;
                            hands[turn]--;
                            turn = opponentTurn;
                        }
                        break; // If there is a piece selected then it falls through to deselect it
                    }
                
                case INVALID_CELL: case opponentColour:
                    selected.state = false;
                    cleanBoard();
                    break;


                case playerColour:

                    if (!selected.state) {
                        selected.state = true;
                        selected.x = x;
                        selected.y = y;
                        board[x][y] = playerColour + 1;
                        checkLegalMoves();
                    } else {
                        cleanBoard();

                        selected.x = x;
                        selected.y = y;
                        board[x][y] = playerColour + 1;
                        checkLegalMoves();
                    }
                    break;

                case LEGAL_MOVE:

                    selected.state = false;
                    board[selected.x][selected.y] = EMPTY;
                    board[x][y] = playerColour;
                    cleanBoard();

                    turn = opponentTurn;
                    break;

                case LEGAL_JUMP:

                    selected.state = false;

                    board[selected.x][selected.y] = EMPTY;

                    board[(selected.x + x)/2][(selected.y + y)/2] = EMPTY;
                    tokens[opponentTurn]--;

                    board[x][y] = playerColour;
                    cleanBoard();

                    if (tokens[opponentTurn] !== hands[opponentTurn]) { // If these are equal then the opponent has no tokens left to remove - prevents a soft lock
                        turn = (turn === WHITE_TURN) ? WHITE_REMOVE : BLACK_REMOVE;
                    } else {
                        turn = opponentTurn;
                    }
                    checkWin();

                    break;
            }
            break;
            

        case WHITE_REMOVE: case BLACK_REMOVE:
            if (board[x][y] === opponentColour) {
                board[x][y] = EMPTY;
                tokens[opponentTurn]--;
                turn = opponentTurn;
                
                checkWin();
            }
            break;


        case DRAW: case WIN:
            break;
    }
    
    updateUI();
    drawBoard();
    drawTokens();
}


function checkWin() {
    if (tokens[WHITE_TURN] === 0 || tokens[BLACK_TURN] === 0) {
        turn = WIN;
    }
}


function drawButtonClick(event) {
    turn = DRAW;

    cleanBoard();

    updateUI();
    
    drawBoard();
    drawTokens();
}


function cleanBoard () {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {

            switch (board[i][j]) {
                case WHITE_SELECTED:
                    board[i][j] = WHITE;
                    break;

                case BLACK_SELECTED:
                    board[i][j] = BLACK;
                    break;

                case LEGAL_MOVE:
                    board[i][j] = EMPTY;
                    break;

                case LEGAL_JUMP:
                    board[i][j] = EMPTY;
                    break;
                
                default:
                    break;
            }
        }
    }
}


function checkLegalMoves() {
    let opponentColour = (turn === WHITE_TURN || turn === WHITE_REMOVE) ? BLACK : WHITE;

    //Move
    // North
    if ((selected.y > 0) && (board[selected.x][selected.y - 1] === EMPTY)) {
        board[selected.x][selected.y - 1] = LEGAL_MOVE;
    }

    // East
    if ((selected.x < (board.length - 1)) && (board[selected.x + 1][selected.y] === EMPTY)) {
        board[selected.x + 1][selected.y] = LEGAL_MOVE;
    }

    // South
    if ((selected.y < (board[0].length - 1)) && (board[selected.x][selected.y + 1] === EMPTY)) {
        board[selected.x][selected.y + 1] = LEGAL_MOVE;
    }

    // West
    if ((selected.x > 0) && (board[selected.x - 1][selected.y] === EMPTY)) {
        board[selected.x - 1][selected.y] = LEGAL_MOVE;
    }


    //Jump
    // North
    if ((selected.y > 1) && (board[selected.x][selected.y - 1] === opponentColour) && (board[selected.x][selected.y - 2] === EMPTY)) {
        board[selected.x][selected.y - 2] = LEGAL_JUMP;
    }

    // East
    if ((selected.x < (board.length - 2)) && (board[selected.x + 1][selected.y] === opponentColour) && (board[selected.x + 2][selected.y] === EMPTY)) {
        board[selected.x + 2][selected.y] = LEGAL_JUMP;
    }

    // South
    if ((selected.y < (board[0].length - 2)) && (board[selected.x][selected.y + 1] === opponentColour) && (board[selected.x][selected.y + 2] === EMPTY)) {
        board[selected.x][selected.y + 2] = LEGAL_JUMP;
    }

    // West
    if ((selected.x > 1) && (board[selected.x - 1][selected.y] === opponentColour) && (board[selected.x - 2][selected.y] === EMPTY)) {
        board[selected.x - 2][selected.y] = LEGAL_JUMP;
    }
}


let selected = {
    state: false,
    x: -1,
    y: -1
};

let turn = -1;

let board;
let tokens;
let hands; // Tokens the player hasn't placed yet
let messages

initialise();