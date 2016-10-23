import * as _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

`
	OK so the board is totally huge. It's like..

	10 x 22
`;

const BOARD_SIZE = {
  x: 10,
  y: 22,
};

const COLOURS = {
  WHITE: 'white',
  BLUE: 'blue',
  LIGHTBLUE: 'lightblue',
};

function createBlock() {
  return {
    x: 0,
    y: 0,
    color: COLOURS.LIGHTBLUE,
  };
}

const SHAPES = {
  I: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  T: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
};

function createShape() {
  return SHAPES.I.slice();
}

function moveToMiddle(shape) {
  return _.map(shape, p => (
    { ...p, x: (p.x + BOARD_SIZE.x) / 2 }
  ));
}

function createInitialState() {
  return {
    currentBlock: moveToMiddle(createShape()),
    score: 0,
    otherBlocks: [],
  };
}

function reduce(state, action) {
  if (typeof state === 'undefined') {
    return createInitialState();
  }

  return state;
}

const store = createStore(reduce);

function Root() {
  return (
    <div>
      poop
    </div>
  );
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
