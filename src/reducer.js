import _ from 'lodash';
import states from './states';
import boardSize from './board_size';
import { blockInTheWay, rotate, getNextShape, createShape } from './tetrominos';

function moveDown(location) {
  return { ...location, y: location.y + 1 };
}

function subtract(num) {
  return num === 0 ? num : num - 1;
}

function add(num) {
  return num < boardSize.x - 1 ? num + 1 : num;
}

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

function clearLines(blocks) {
  const lineGroupedBlocks = _.map(
    _.groupBy(blocks, b => b.location.y),
    (lineBlocks, height) => ({ lineBlocks, height })
  );

  const fullLines = lineGroupedBlocks.filter(({ lineBlocks }) => lineBlocks.length === boardSize.x);

  const blocksToClear = _.flatten(_.map(fullLines, 'lineBlocks'));

  const remainingBlocks = _.difference(blocks, blocksToClear);

  const droppedRemainingBlocks = remainingBlocks.map((block) => {
    const linesBelow = fullLines.filter(({ height }) => block.location.y < height);
    return { ...block, location: { ...block.location, y: block.location.y + linesBelow.length } };
  });

  return {
    remaining: droppedRemainingBlocks,
    points: fullLines.length * 100,
  };
}

function tick(state) {
  const blocksDown = _.map(state.liveBlocks, b => ({ ...b, location: moveDown(b.location) }));

  if (blockAtBottom(state.liveBlocks) || blockInTheWay(blocksDown, state.deadBlocks)) {
    const newDeadBlocks = state.deadBlocks.concat(state.liveBlocks);

    const { remaining, points } = clearLines(newDeadBlocks);

    const nextShape = getNextShape(state.deadBlocks);
    const newBlocks = createShape(nextShape, state.blockCount);

    return {
      ...state,
      currentShape: nextShape,
      liveBlocks: newBlocks,
      deadBlocks: remaining,
      score: state.score + points,
      blockCount: state.blockCount + newBlocks.length,
    };
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
  const currentShape = getNextShape([]);
  const liveBlocks = createShape(currentShape, 0);

  return {
    state: states.IDLE,
    currentShape,
    liveBlocks,
    blockCount: liveBlocks.length,
    score: 0,
    deadBlocks: [],
  };
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
      return { ...state, state: states.PLAYING };
    default:
  }

  return state;
}
