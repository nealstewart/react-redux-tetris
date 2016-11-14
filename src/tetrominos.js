import { difference, groupBy, compact, flatten, range, minBy, maxBy, map } from 'lodash';
import { List } from 'immutable';
import colours from './colours';
import boardSize from './board_size';

const SHAPES = {
  I: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  T: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  O: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  J: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }],
  L: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }],
  S: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  Z: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
};

function getBlockProperties(liveBlocks) {
  const minX = minBy(liveBlocks, b => b.location.x).location.x;
  const minY = minBy(liveBlocks, b => b.location.y).location.y;
  const width = (maxBy(liveBlocks, b => b.location.x).location.x - minX) + 1;
  const height = (maxBy(liveBlocks, b => b.location.y).location.y - minY) + 1;

  return { minX, minY, width, height };
}

export function moveToMiddle(shape) {
  const { width } = getBlockProperties(shape);
  const xMove = Math.floor(boardSize.x / 2) - Math.floor(width / 2);
  return map(shape, p => (
    {
      ...p,
      location: {
        ...p.location,
        x: xMove + p.location.x,
      },
    }
  ));
}

function createEmptyMultiDimensionalContainer(width, height) {
  return range(0, width).reduce((firstDim) => {
    const secondDim = range(0, height).reduce(dim => dim.push(null), new List());
    return firstDim.push(secondDim);
  }, new List());
}

function transpose(list) {
  return list.get(0).map((col, i) => list.map(row => row.get((row.size - 1) - i)));
}

function equalLocations(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function blockInTheWay(liveBlocks, deadBlocks) {
  return liveBlocks.some(liveB =>
    deadBlocks.some(deadB => equalLocations(liveB.location, deadB.location))
  );
}

export function clearLines(blocks) {
  const lineGroupedBlocks = map(
    groupBy(blocks, b => b.location.y),
    (lineBlocks, height) => ({ lineBlocks, height })
  );

  const fullLines = lineGroupedBlocks.filter(({ lineBlocks }) => lineBlocks.length === boardSize.x);

  const blocksToClear = flatten(map(fullLines, 'lineBlocks'));

  const remainingBlocks = difference(blocks, blocksToClear);

  const droppedRemainingBlocks = remainingBlocks.map((block) => {
    const linesBelow = fullLines.filter(({ height }) => block.location.y < height);
    return { ...block, location: { ...block.location, y: block.location.y + linesBelow.length } };
  });

  return {
    remaining: droppedRemainingBlocks,
    linesCleared: fullLines.length,
  };
}

export function rotate(liveBlocks, deadBlocks) {
  const { minX, minY, width, height } = getBlockProperties(liveBlocks);
  const liveBlockTwoDim = liveBlocks.reduce((container, block) =>
    container.set(
      block.location.x - minX,
      container.get(block.location.x - minX).set(block.location.y - minY, block)
    ),
    createEmptyMultiDimensionalContainer(width, height));

  const transposed = transpose(liveBlockTwoDim);

  const updated = transposed.map((row, x) =>
    row.map((b, y) => (b && { ...b, location: { x: x + minX, y: y + minY } })));
  const updatedLiveBlocks = compact(flatten(updated.toArray().map(row => row.toArray())));

  const overEdge = updatedLiveBlocks.some(b =>
    b.location.x < 0 || b.location.x >= boardSize.x ||
    b.location.y >= boardSize.y || b.location.y < 0);

  if (!overEdge && !blockInTheWay(updatedLiveBlocks, deadBlocks)) {
    return updatedLiveBlocks;
  }

  return liveBlocks;
}

export function createBlocks(shapeType, blockCount) {
  return map(SHAPES[shapeType.name].slice(),
    (location, i) => ({
      location,
      colour: shapeType.colour,
      key: `block-${blockCount + i}`,
    })
  );
}

function getSum(state) {
  return state.deadBlocks.length +
    state.liveBlocks.length +
    state.linesCleared +
    state.level +
    state.blockCount;
}

function getNextColourName(state) {
  const colourNames = Object.keys(colours);
  if (!state) {
    return colourNames[0];
  }
  const index = Math.floor(getSum(state)) % colourNames.length;
  return colourNames[index];
}

function getNextShapeName(state) {
  const shapeNames = Object.keys(SHAPES);
  if (!state) {
    return shapeNames[0];
  }

  const index = Math.floor(getSum(state)) % shapeNames.length;
  return shapeNames[index];
}

export function getNextShape(state) {
  const colour = getNextColourName(state);
  const name = getNextShapeName(state);

  return { name, colour };
}
