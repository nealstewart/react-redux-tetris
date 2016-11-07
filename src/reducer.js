import _ from 'lodash';
import * as immutable from 'immutable';
import states from './states';
import colours from './colours';


const VISIBLE_BOARD_SIZE = {
  x: 10,
  y: 20,
};

const SHAPES = {
  I: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  T: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
};

function createShape(shapeType, blockCount) {
  return _.map(SHAPES[shapeType.name].slice(),
    (location, i) => ({
      location,
      colour: shapeType.colour,
      key: `block-${blockCount + i}`,
    })
  );
}

function moveDown(location) {
  return { ...location, y: location.y + 1 };
}

function subtract(num) {
  return num === 0 ? num : num - 1;
}

function add(num) {
  return num < VISIBLE_BOARD_SIZE.x - 1 ? num + 1 : num;
}

function equalLocations(a, b) {
  return a.x === b.x && a.y === b.y;
}

function blockInTheWay(liveBlocks, deadBlocks) {
  return liveBlocks.some(liveB =>
    deadBlocks.some(deadB => equalLocations(liveB.location, deadB.location))
  );
}

function moveRight(blocks, deadBlocks) {
  const moved = blocks.map(b => ({ ...b, location: { ...b.location, x: add(b.location.x) } }));
  if (!blockInTheWay(moved, deadBlocks)) {
    return moved;
  }

  return blocks;
}

function moveLeft(blocks, deadBlocks) {
  const moved = blocks.map(b => ({ ...b, location: { ...b.location, x: subtract(b.location.x) } }));
  if (!blockInTheWay(moved, deadBlocks)) {
    return moved;
  }

  return blocks;
}

function blockAtBottom(blocks) {
  return blocks.some(b => b.location.y + 1 === VISIBLE_BOARD_SIZE.y);
}

function clearLines(blocks) {
  const lineGroupedBlocks = _.map(
    _.groupBy(blocks, b => b.location.y),
    (lineBlocks, height) => ({ lineBlocks, height })
  );

  const fullLines = lineGroupedBlocks.filter(({ lineBlocks }) => lineBlocks.length === VISIBLE_BOARD_SIZE.x);

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

    const newBlocks = createShape({
      name: 'I',
      colour: colours.BLUE,
    }, state.blockCount);

    return {
      ...state,
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

const BOARD_SIZE = {
  x: 10,
  y: 22,
};

function moveToMiddle(shape) {
  const xMove = Math.floor((BOARD_SIZE.x) / 2);
  return _.map(shape, p => (
    {
      ...p,
      location: {
        ...p.location,
        x: xMove + p.location.x,
      },
    }
  ));
}

function createInitialState() {
  const liveBlocks = moveToMiddle(createShape({
    name: 'I',
    colour: colours.LIGHTBLUE,
  }, 0));

  return {
    state: states.IDLE,
    liveBlocks,
    blockCount: liveBlocks.length,
    score: 0,
    deadBlocks: [],
  };
}

function createEmptyMultiDimensionalContainer(width, height) {
  return _.range(0, width).reduce((firstDim) => {
    const secondDim = _.range(0, height).reduce(dim => dim.push(null), new immutable.List());
    return firstDim.push(secondDim);
  }, new immutable.List());
}

function transpose(list) {
  return list.get(0).map((col, i) => list.map(row => row.get(i)));
}

function rotate(liveBlocks, deadBlocks) {
  const minX = _.minBy(liveBlocks, b => b.location.x).location.x;
  const minY = _.minBy(liveBlocks, b => b.location.y).location.y;
  const width = (_.maxBy(liveBlocks, b => b.location.x).location.x - minX) + 1;
  const height = (_.maxBy(liveBlocks, b => b.location.y).location.y - minY) + 1;

  const translatedList = liveBlocks.map(b => ({ ...b, location: { x: b.location.x - minX, y: b.location.y - minY } }));

  const liveBlockTwoDim = translatedList.reduce((container, block) =>
    container.set(block.location.x, container.get(block.location.x).set(block.location.y, block)),
    createEmptyMultiDimensionalContainer(width, height));

  const transposed = transpose(liveBlockTwoDim);
  const updated = transposed.map((row, x) => row.map((b, y) => ({ ...b, location: { x: x + minX + 1, y: y + minY + 1 } })));
  const updatedLiveBlocks = _.flatten(updated.toArray().map(row => row.toArray()));

  if (!blockInTheWay(updatedLiveBlocks, deadBlocks)) {
    return updatedLiveBlocks;
  }

  return liveBlocks;
}

export default function(state, action) {
  if (typeof state === 'undefined') {
    return createInitialState();
  }

  switch (action.type) {
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
