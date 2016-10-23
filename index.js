import * as _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

const COLOURS = {
	WHITE: 'white',
	BLUE: 'blue',
	LIGHTBLUE: 'lightblue'
};

function createBlock() {
	return {
		x: 0,
		y: 0,
		color: lightblue
	};
}

const SHAPES = {
	I: [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}],
	T: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 0, y: 2}]
};

function createShape() {

}

function createInitialState() {
	return {
		currentBlock: [],
		score: 0,
		otherBlocks: []
	};
}

function reduce(state, action) {
	if (typeof state === 'undefined') {
		return createInitialState();
	}
}

const store = createStore(reduce);

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
);
