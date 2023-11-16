import randomColor from 'randomcolor';
import rowClearSound from '../sounds/clear_row.mp3';
import gameOverSound from '../sounds/game_over.mp3';

const playGameOverSound = () => new Audio(gameOverSound).play();

const playRowClearSound = () => new Audio(rowClearSound).play();

const calculateScore = (removedRows) => removedRows.length * 100;

const handleRowClear = (removedRows) => {
  if (removedRows.length > 0) playRowClearSound();
};

const createTetromino = (shapes, startRow, startCol) => ({
  shapes: shapes.map((shape) => shape.map((row) => [...row])),
  startRow,
  startCol,
});

const tetrominoes = {
  I: createTetromino([
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
  ], -1, 3),
  L: createTetromino([
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  ], 0, 4),
  O: createTetromino([[[1, 1], [1, 1]]], 0, 4),
  T: createTetromino([[[0, 1, 0], [1, 1, 1], [0, 0, 0]]], 0, 4),
  Z: createTetromino([
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  ], 0, 4),
};

const isCellOccupied = (board, row, col) => board[row] && board[row][col] !== null;

const isMoveOutOfRange = (row, col, numRows, numCols) => row < 0
  || row >= numRows || col < 0 || col >= numCols;

const isValidMove = (board, piece, newPosition) => {
  if (!board || !piece) return false;

  const numRows = board.length;
  const numCols = board[0].length;

  return !piece.some((row, rowIndex) => row.some((cell, colIndex) => {
    const newRow = newPosition.row + rowIndex;
    const newCol = newPosition.col + colIndex;

    const isRowOutOfRange = isMoveOutOfRange(newRow, 0, numRows);
    const isColOutOfRange = isMoveOutOfRange(newCol, 0, numCols);
    const isCellOccupiedFlag = isCellOccupied(board, newRow, newCol);

    return cell && (isRowOutOfRange || isColOutOfRange || isCellOccupiedFlag);
  }));
};

const copyBoardWithColors = (board) => board
  .map((row) => row.map((cell) => (cell?.color ? { color: cell.color } : null)));

const placePieceOnBoard = (board, piece, position, pieceColor) => {
  piece.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell && position.row + rowIndex >= 0) {
        const newCol = position.col + colIndex;
        board[position.row + rowIndex][newCol] = { color: pieceColor };
      }
    });
  });
};

const isRowFull = (row) => row.every((cell) => cell !== null);

const removeRow = (board, rowIndex) => {
  board.splice(rowIndex, 1);
  board.unshift(Array(board[0].length).fill(null));
};

const findFullRows = (board) => board.reduce((fullRows, row, rowIndex) => {
  if (isRowFull(row)) fullRows.push(rowIndex);

  return fullRows;
}, []);

const removeFullRows = (board) => {
  const removedRows = findFullRows(board);
  let removedRowCount = 0;

  removedRows.forEach((rowIndex) => {
    removeRow(board, rowIndex);
    removedRowCount += 1;
  });

  return { removedRows, removedRowCount };
};

const processDrop = (board, piece, position, pieceColor, score) => {
  const newBoard = copyBoardWithColors(board);
  let newScore = score;

  placePieceOnBoard(newBoard, piece, position, pieceColor);

  const { removedRows, removedRowCount } = removeFullRows(newBoard);

  if (removedRowCount > 0) {
    newScore += 100 * removedRowCount;
  }

  return { newBoard, removedRows, newScore };
};

const rotatePieceClockwise = (tetromino) => {
  const rows = tetromino.shape.length;
  const cols = tetromino.shape[0].length;
  const rotatedPiece = Array.from({ length: cols }, () => Array.from({ length: rows }, () => 0));

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      rotatedPiece[col][rows - 1 - row] = tetromino.shape[row][col];
    }
  }

  return rotatedPiece;
};

const getRandomKey = (tetrominoKeys) => {
  if (tetrominoKeys.length === 0) {
    console.error('No tetrominoes defined.');
    return null;
  }

  return tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
};

const getRandomOrientationIndex = (isIPiece, shapes) => (
  isIPiece
    ? 0
    : Math.floor(Math.random() * shapes.length)
);

const getRandomTetromino = (isFirstPiece) => {
  const tetrominoKeys = Object.keys(tetrominoes);
  const randomKey = getRandomKey(tetrominoKeys);
  const initialOrientations = tetrominoes[randomKey];
  const isIPiece = randomKey === 'I';
  const isFirstIPiece = isIPiece ? -1 : 0;

  if (!initialOrientations || !initialOrientations.shapes
      || initialOrientations.shapes.length === 0) {
    console.error(`No orientations defined for ${randomKey}.`);
    return null;
  }

  const randomOrientationIndex = getRandomOrientationIndex(isIPiece, initialOrientations.shapes);
  const randomTetromino = {
    shape: initialOrientations.shapes[randomOrientationIndex],
    color: randomColor(),
    startRow: isFirstPiece ? initialOrientations.startRow : isFirstIPiece,
    startCol: initialOrientations.startCol,
  };

  return randomTetromino;
};

const resetGame = (initialState, lastScore) => {
  playGameOverSound();

  return {
    ...initialState,
    started: false,
    gameIsOver: true,
    lastScore,
  };
};

const updateGameState = (state, newBoard, removedRows, newPiece) => {
  const newScore = state.score + calculateScore(removedRows);

  return {
    ...state,
    board: newBoard,
    score: newScore,
    piecePosition: { row: newPiece.startRow, col: newPiece.startCol },
    currentPiece: newPiece,
  };
};

const handleInvalidMove = (state, initialState) => {
  const { newBoard, removedRows } = processDrop(
    state.board,
    state.currentPiece.shape,
    state.piecePosition,
    state.currentPiece.color,
    state.score,
  );

  const newPiece = getRandomTetromino(false);

  if (!isValidMove(newBoard, newPiece.shape, newPiece)) resetGame(state.score);

  handleRowClear(removedRows);

  const finalState = updateGameState(state, newBoard, removedRows, newPiece);

  return isValidMove(newBoard, newPiece.shape, finalState.piecePosition)
    ? finalState
    : resetGame(initialState, state.score);
};

const handleValidMove = (state, newPosition, initialState) => {
  if (isValidMove(state.board, state.currentPiece.shape, newPosition)) {
    return { ...state, piecePosition: newPosition };
  }

  return handleInvalidMove(state, initialState);
};

const speedMap = {
  1000: 700,
  2000: 600,
  3000: 500,
  4000: 400,
  6000: 300,
  8000: 250,
  10000: 200,
  12000: 150,
  14000: 100,
};

export {
  tetrominoes, isValidMove, processDrop, calculateScore, rotatePieceClockwise, getRandomTetromino,
  speedMap, resetGame, playGameOverSound, handleRowClear, handleValidMove,
};