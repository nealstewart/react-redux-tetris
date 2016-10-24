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

function reduceTick(state) {
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
    case 'START_GAME':
      return { ...state, state: states.PLAYING };
    case 'TICK':
      console.log('hihihi');
      return reduceTick(state);
    default:
  }

  return state;
}
