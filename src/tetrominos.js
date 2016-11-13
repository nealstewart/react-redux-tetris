import { difference, groupBy, compact, flatten, range, minBy, maxBy, map } from 'lodash';
import { List } from 'immutable';
import colours from './colours';
import boardSize from './board_size';

const SHAPES = {
  I: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }],
  T: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  O: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  J: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
  L: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  S: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  Z: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
};

function getBlockProperties(liveBlocks) {
  const minX = minBy(liveBlocks, b => b.location.x).location.x;
  const minY = minBy(liveBlocks, b => b.location.y).location.y;
  const width = (maxBy(liveBlocks, b => b.location.x).location.x - minX) + 1;
  const height = (maxBy(liveBlocks, b => b.location.y).location.y - minY) + 1;

  return { minX, minY, width, height };
}

function moveToMiddle(shape) {
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

export function createShape(shapeType, blockCount) {
  return moveToMiddle(map(SHAPES[shapeType.name].slice(),
    (location, i) => ({
      location,
      colour: shapeType.colour,
      key: `block-${blockCount + i}`,
    })
  ));
}

export function getNextShape(deadBlocks) {
  const shapeNames = Object.keys(SHAPES);
  const colourNames = Object.keys(colours);
  return {
    name: shapeNames[Math.floor(deadBlocks.length / 2) % shapeNames.length],
    colour: colourNames[Math.floor(deadBlocks.length / 2) % colourNames.length],
  };
}
