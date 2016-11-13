import _ from 'lodash';
import states from './states';
import boardSize from './board_size';
import {
  clearLines,
  blockInTheWay,
  rotate,
  getNextShape,
  createBlocks,
  moveToMiddle,
} from './tetrominos';

function createBlocksForPlay(shape, blockCount) {
  return moveToMiddle(createBlocks(shape, blockCount));
}

function moveDown(location) {
  return { ...location, y: location.y + 1 };
}

function subtract(num) {
  return num === 0 ? num : num - 1;
}

function add(num) {
  return num < boardSize.x - 1 ? num + 1 : num;
}

const DEATH_LINE = 4;

const atRightEdge = blocks => blocks.some(b => b.location.x === boardSize.x - 1);

function moveRight(blocks, deadBlocks) {
  if (atRightEdge(blocks)) {
    return blocks;
  }
  const moved = blocks.map(b => ({ ...b, location: { ...b.location, x: add(b.location.x) } }));
  if (!blockInTheWay(moved, deadBlocks)) {
    return moved;
  }

  return blocks;
}

function moveLeft(blocks, deadBlocks) {
  const atEdge = blocks.some(b => b.location.x === 0);
  if (atEdge) {
    return blocks;
  }
  const moved = blocks.map(b => ({ ...b, location: { ...b.location, x: subtract(b.location.x) } }));
  if (!blockInTheWay(moved, deadBlocks)) {
    return moved;
  }

  return blocks;
}

function blockAtBottom(blocks) {
  return blocks.some(b => b.location.y + 1 === boardSize.y);
}

function getNewState(deadBlocks, newBlocks) {
  if (deadBlocks.some(b => b.location.y < DEATH_LINE) || blockInTheWay(deadBlocks, newBlocks)) {
    return states.GAMEOVER;
  }

  return states.PLAYING;
}

const linesClearedPoints = [
  0,
  50,
  150,
  350,
  1000,
];

function calcClearedPoints(levelForCalculating, newDeadBlocks) {
  return !newDeadBlocks.length ? 2000 * levelForCalculating : 0;
}

function calcClearedLinesPoints(levelForCalculating, linesCleared) {
  return levelForCalculating * linesClearedPoints[linesCleared];
}

function calcAddedBlocksPoints(levelForCalculating, liveBlocks) {
  return levelForCalculating * liveBlocks.length * 10;
}

function calcPoints(level, linesCleared, newDeadBlocks, liveBlocks) {
  const levelForCalculating = level + 1;
  return calcClearedLinesPoints(levelForCalculating, linesCleared) +
    calcAddedBlocksPoints(levelForCalculating, liveBlocks) +
    calcClearedPoints(levelForCalculating, newDeadBlocks);
}

const levelClearAmount = 10;

function calcLevel(level, linesCleared) {
  if (linesCleared >= levelClearAmount) {
    return level + 1;
  }

  return level;
}

function addNextBlocks(state) {
  const nextShape = getNextShape(state);
  const nextBlocks = createBlocks(nextShape, state.blockCount);

  return {
    ...state,
    nextBlocks,
    blockCount: state.blockCount + nextBlocks.length,
  };
}

function tick(state) {
  const blocksDown = _.map(state.liveBlocks, b => ({ ...b, location: moveDown(b.location) }));

  if (blockAtBottom(state.liveBlocks) || blockInTheWay(blocksDown, state.deadBlocks)) {
    const newDeadBlocks = state.deadBlocks.concat(state.liveBlocks);

    const { remaining, linesCleared } = clearLines(newDeadBlocks);
    const newBlocks = moveToMiddle(state.nextBlocks);
    const points = calcPoints(state.level, linesCleared, newDeadBlocks, state.liveBlocks);

    return addNextBlocks({
      ...state,
      state: getNewState(newDeadBlocks, newBlocks),
      liveBlocks: newBlocks,
      deadBlocks: remaining,
      score: state.score + points,
      linesCleared: (state.linesCleared + linesCleared) % levelClearAmount,
      level: calcLevel(state.level, linesCleared + state.linesCleared),
    });
  }

  return {
    ...state, liveBlocks: blocksDown,
  };
}

function moveDownUntilBottom(state) {
  let stateAfterTick = state;
  do {
    stateAfterTick = tick(stateAfterTick);
  } while (stateAfterTick.deadBlocks === state.deadBlocks);

  return stateAfterTick;
}

function createInitialState() {
  const currentShape = getNextShape(null);
  const liveBlocks = createBlocksForPlay(currentShape, 0);
  return addNextBlocks({
    state: states.IDLE,
    liveBlocks,
    level: 0,
    linesCleared: 0,
    blockCount: liveBlocks.length,
    score: 0,
    deadBlocks: [],
    actionCount: 0,
  });
}

export default function(state, action) {
  if (typeof state === 'undefined') {
    return createInitialState();
  }

  switch (action.type) {
    case 'PAUSE':
      return { ...state, state: states.PAUSED };
    case 'UNPAUSE':
      return { ...state, state: states.PLAYING };
    case 'MOVE_DOWN':
    case 'TICK':
      return tick(state);
    case 'ROTATE':
      return { ...state, liveBlocks: rotate(state.liveBlocks, state.deadBlocks) };
    case 'MOVE_LEFT':
      return { ...state, liveBlocks: moveLeft(state.liveBlocks, state.deadBlocks) };
    case 'MOVE_RIGHT':
      return { ...state, liveBlocks: moveRight(state.liveBlocks, state.deadBlocks) };
    case 'DROP':
      return moveDownUntilBottom(state);
    case 'START_GAME':
      return { ...createInitialState(), state: states.PLAYING };
    default:
  }

  return state;
}
