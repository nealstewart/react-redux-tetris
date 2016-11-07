import _ from 'lodash';
import * as immutable from 'immutable';
import states from './states';
import colours from './colours';
import boardSize from './board_size';

const SHAPES = {
  I: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  T: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  O: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  J: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
  L: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  S: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  Z: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
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
  return num < boardSize.x - 1 ? num + 1 : num;
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
  const atEdge = blocks.some(b => b.location.x === boardSize.x - 1);
  if (atEdge) {
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

function getNextShape(lastShape) {
  const shapeNames = Object.keys(SHAPES);
  const colourNames = Object.keys(colours);
  const lastShapeIndex = shapeNames.indexOf(lastShape.name);
  const lastColourIndex = colourNames.indexOf(lastShape.colour);

  const nextShapeIndex = lastShapeIndex < shapeNames.length - 1 ? lastShapeIndex + 1 : 0;
  const nextColourIndex = lastColourIndex < colourNames.length - 1 ? lastColourIndex + 1 : 0;
  return {
    name: shapeNames[nextShapeIndex],
    colour: colours[colourNames[nextColourIndex]],
  };
}

function tick(state) {
  const blocksDown = _.map(state.liveBlocks, b => ({ ...b, location: moveDown(b.location) }));

  if (blockAtBottom(state.liveBlocks) || blockInTheWay(blocksDown, state.deadBlocks)) {
    const newDeadBlocks = state.deadBlocks.concat(state.liveBlocks);

    const { remaining, points } = clearLines(newDeadBlocks);

    const nextShape = getNextShape(state.currentShape);
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

function moveToMiddle(shape) {
  const xMove = Math.floor((boardSize.x) / 2);
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
  const currentShape = {
    name: 'I',
    colour: colours.LIGHTBLUE,
  };
  const liveBlocks = moveToMiddle(createShape(currentShape, 0));

  return {
    state: states.IDLE,
    currentShape,
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

  const liveBlockTwoDim = liveBlocks.reduce((container, block) =>
    container.set(
      block.location.x - minX,
      container.get(block.location.x - minX).set(block.location.y - minY, block)
    ),
    createEmptyMultiDimensionalContainer(width, height));

  const transposed = transpose(liveBlockTwoDim);
  const updated = transposed.map((row, x) =>
    row.map((b, y) => (b && { ...b, location: { x: x + minX, y: y + minY } })));
  const updatedLiveBlocks = _.compact(_.flatten(updated.toArray().map(row => row.toArray())));

  const overEdge = updatedLiveBlocks.some(b =>
    b.location.x < 0 || b.location.x >= boardSize.x ||
    b.location.y >= boardSize.y || b.location.y < 0);

  if (!overEdge && !blockInTheWay(updatedLiveBlocks, deadBlocks)) {
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
