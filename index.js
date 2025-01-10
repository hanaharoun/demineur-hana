// 1 les diff dificultés du jeu 

const DIFFICULTY_SETTINGS = {
    beginner: { size: 9, bombs: 10 },
    intermediate: { size: 16, bombs: 40 },
    expert: { size: 22, bombs: 100 },

    // maaster : reste a faire !
};

// Varaibel comme le tableau, tailles nbr de bombes ect  

let board = [];
let size = 0;
let bombCount = 0;
let revealedCells = 0;
let timer = 0;
let interval;


const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const difficultySelector = document.getElementById('difficulty');

// tableau du jeu 

const Board = {
    create(size, bombs) {
        board = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({
                isBomb: false,
                revealed: false,
                flagged: false,
                adjacentBombs: 0,
            }))
        );
        this.placeBombs(size, bombs);
        this.calculateAdjacency(size);
    },

    //  les bombes aleatoirement 

    placeBombs(size, bombs) {
        let bombsPlaced = 0;
        while (bombsPlaced < bombs) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (!board[x][y].isBomb) {
                board[x][y].isBomb = true;
                bombsPlaced++;
            }
        }
    },

    // calcule des bombes autour 

    calculateAdjacency(size) {
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (!board[x][y].isBomb) {
                    board[x][y].adjacentBombs = this.getAdjacentCells(x, y)
                        .filter(([nx, ny]) => board[nx][ny].isBomb).length;
                }
            }
        }
    },

    getAdjacentCells(x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];
        return directions
            .map(([dx, dy]) => [x + dx, y + dy])
            .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size);
    },
};



// les diff actions de jeu 


const GameActions = {
    revealCell(x, y) {
        const cell = board[x][y];
        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        revealedCells++;

        
        const cellElement = this.getCellElement(x, y);
        cellElement.classList.add('revealed');
        cellElement.textContent = cell.isBomb ? '💣' : cell.adjacentBombs || '';


        // mettre fin si une bombe est trouve 

        if (cell.isBomb) {
            this.endGame(false);
            return;
        }

        if (cell.adjacentBombs === 0) {
            Board.getAdjacentCells(x, y).forEach(([nx, ny]) => this.revealCell(nx, ny));
        }

        if (revealedCells === size * size - bombCount) {
            this.endGame(true); // gagne le jeu si aucune bombe est cliquee 
        }
    },

    toggleFlag(x, y) {
        const cell = board[x][y];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        const cellElement = this.getCellElement(x, y);
        cellElement.classList.toggle('flagged');
        cellElement.textContent = cell.flagged ? '🚩' : '';
    },

    endGame(won) {
        clearInterval(interval);
        board.forEach((row, x) =>
            row.forEach((cell, y) => {
                const cellElement = this.getCellElement(x, y);
                if (cell.isBomb) {
                    cellElement.classList.add('bomb');
                    cellElement.textContent = '💣';
                }
            })
        );
        alert(won ? 'Félicitations, vous avez gagné !' : 'Dommage, vous avez perdu.');
    },

    getCellElement(x, y) {
        return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    },
};

// affichage 


const Display = {
    renderBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        gameBoard.style.gridTemplateRows = `repeat(${size}, 30px)`;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;

                cellElement.addEventListener('click', () => GameActions.revealCell(x, y));
                cellElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    GameActions.toggleFlag(x, y);
                });

                gameBoard.appendChild(cellElement);
            }
        }
    },

    updateTimer() {
        timerDisplay.textContent = timer;
    },
};

// fonctionnement de jeu 

const GameController = {
    startGame() {
        const { size: newSize, bombs } = DIFFICULTY_SETTINGS[difficultySelector.value];
        size = newSize;
        bombCount = bombs;
        revealedCells = 0;
        timer = 0;

        clearInterval(interval);
        Display.updateTimer();
        interval = setInterval(() => {
            timer++;
            Display.updateTimer();
        }, 1000);

        Board.create(size, bombCount);
        Display.renderBoard();
    },
};

//pour démarrer une partie
startButton.addEventListener('click', () => GameController.startGame());
