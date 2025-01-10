const DIFFICULTY_SETTINGS = {
    beginner: { size: 9, bombs: 10 },
    intermediate: { size: 16, bombs: 40 },
    expert: { size: 22, bombs: 100 },
    master: { size: 30, bombs: 250 },
  };
  
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
  
  // Utility functions
  function createBoard(size, bombs) {
    board = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ isBomb: false, revealed: false, flagged: false, adjacentBombs: 0 }))
    );
  
    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced < bombs) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
  
      if (!board[x][y].isBomb) {
        board[x][y].isBomb = true;
        bombsPlaced++;
      }
    }
  
    // Calculate adjacent bombs
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (!board[x][y].isBomb) {
          board[x][y].adjacentBombs = getAdjacentCells(x, y).filter(([nx, ny]) => board[nx][ny].isBomb).length;
        }
      }
    }
  }
  
  function getAdjacentCells(x, y) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
  
    return directions
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size);
  }
  
  function revealCell(x, y) {
    if (board[x][y].revealed || board[x][y].flagged) return;
    const cell = board[x][y];
    cell.revealed = true;
    revealedCells++;
  
    const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    cellElement.classList.add('revealed');
    cellElement.textContent = cell.isBomb ? '💣' : cell.adjacentBombs || '';
  
    if (cell.isBomb) {
      endGame(false);
      return;
    }
  
    if (cell.adjacentBombs === 0) {
      getAdjacentCells(x, y).forEach(([nx, ny]) => revealCell(nx, ny));
    }
  
    if (revealedCells === size * size - bombCount) {
      endGame(true);
    }
  }
  
  function toggleFlag(x, y) {
    const cell = board[x][y];
    if (cell.revealed) return;
  
    cell.flagged = !cell.flagged;
    const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    cellElement.classList.toggle('flagged');
    cellElement.textContent = cell.flagged ? '🚩' : '';
  }
  
  function endGame(won) {
    clearInterval(interval);
    board.forEach((row, x) =>
      row.forEach((cell, y) => {
        const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (cell.isBomb) {
          cellElement.classList.add('bomb');
          cellElement.textContent = '💣';
        }
      })
    );
    alert(won ? 'Félicitations, vous avez gagné !' : 'Dommage, vous avez perdu.');
  }
  
  function startGame() {
    const { size: newSize, bombs } = DIFFICULTY_SETTINGS[difficultySelector.value];
    size = newSize;
    bombCount = bombs;
    revealedCells = 0;
    timer = 0;
  
    clearInterval(interval);
    timerDisplay.textContent = '0';
    interval = setInterval(() => {
      timer++;
      timerDisplay.textContent = timer;
    }, 1000);
  
    createBoard(size, bombCount);
    renderBoard();
  }
  
  function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 30px)`;
    gameBoard.style.gridTemplateRows = `repeat(${size}, 30px)`;
  
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;
  
        cellElement.addEventListener('click', () => revealCell(x, y));
        cellElement.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleFlag(x, y);
        });
  
        gameBoard.appendChild(cellElement);
      }
    }
  }
  
  startButton.addEventListener('click', startGame);
  