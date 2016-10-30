import _ from 'lodash';
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
  return num === VISIBLE_BOARD_SIZE.x ? num : num + 1;
}

function moveRight(blocks) {
  return blocks.map(b => ({ ...b, location: { ...b.location, x: add(b.location.x) } }));
}

function moveLeft(blocks) {
  return blocks.map(b => ({ ...b, location: { ...b.location, x: subtract(b.location.x) } }));
}

function equalLocations(a, b) {
  return a.x === b.x && b.y === b.y;
}

function blockInTheWay(liveBlocks, deadBlocks) {
  return liveBlocks.some(liveB =>
    deadBlocks.some(deadB => equalLocations(moveDown(liveB.location), deadB.location))
  );
}

function blockAtBottom(blocks) {
  return blocks.some(b => b.location.y + 1 === VISIBLE_BOARD_SIZE.y);
}

function wouldHitSomething(liveBlocks, deadBlocks) {
  return blockAtBottom(liveBlocks) || blockInTheWay(liveBlocks, deadBlocks);
}

function tick(state) {
  if (wouldHitSomething(state.liveBlocks, state.deadBlocks)) {
    const newBlocks = createShape({
      name: 'I',
      colour: colours.BLUE,
    }, state.blockCount);

    return {
      ...state,
      liveBlocks: newBlocks,
      deadBlocks: state.deadBlocks.concat(state.liveBlocks),
      blockCount: state.blockCount + newBlocks.length,
    };
  }

  const liveBlocks = _.map(state.liveBlocks, b => ({ ...b, location: moveDown(b.location) }));
  return {
    ...state, liveBlocks,
  };
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

export default function(state, action) {
  if (typeof state === 'undefined') {
    return createInitialState();
  }

  switch (action.type) {
    case 'MOVE_LEFT':
      return { ...state, liveBlocks: moveLeft(state.liveBlocks) };
    case 'MOVE_RIGHT':
      return { ...state, liveBlocks: moveRight(state.liveBlocks) };
    case 'START_GAME':
      return { ...state, state: states.PLAYING };
    case 'TICK':
      return tick(state);
    default:
  }

  return state;
}
