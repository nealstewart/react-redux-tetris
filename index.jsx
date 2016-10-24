import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

const BOARD_SIZE = {
  x: 10,
  y: 22,
};

const VISIBLE_BOARD_SIZE = {
  x: 10,
  y: 20,
};

const STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
};

const BLOCK_SIZE = 20;

const COLOURS = {
  WHITE: 'white',
  BLUE: 'blue',
  LIGHTBLUE: 'lightblue',
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

function moveToMiddle(shape) {
  return _.map(shape, p => (
    {
      ...p,
      location: {
        ...p.location,
        x: (p.location.x + BOARD_SIZE.x) / 2,
      },
    }
  ));
}

function createInitialState() {
  const liveBlocks = moveToMiddle(createShape({
    name: 'I',
    colour: COLOURS.LIGHTBLUE,
  }, 0));

  return {
    state: STATES.IDLE,
    liveBlocks,
    blockCount: liveBlocks.length,
    score: 0,
    deadBlocks: [],
  };
}

function reduce(state, action) {
  if (typeof state === 'undefined') {
    return createInitialState();
  }

  switch (action.type) {
    case 'START_GAME':
      return { ...state, state: STATES.PLAYING };
    default:
  }

  return state;
}

function startGame() {
  return {
    type: 'START_GAME',
  };
}


const store = createStore(reduce);

const BLOCK_SHAPE = PropTypes.shape({
  location: {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  },
  key: PropTypes.string.isRequired,
  colour: PropTypes.oneOf(_.values(COLOURS)),
});

function Block(props) {
  const block = props.block;
  const style = {
    left: BLOCK_SIZE * block.location.x,
    top: BLOCK_SIZE * block.location.y,
    backgroundColor: block.colour,
  };
  return <div className="block" style={style} />;
}

Block.propTypes = {
  block: BLOCK_SHAPE.isRequired,
};

function TetrisBoard(props) {
  const blocks = _.map(props.blocks, block => <Block key={block.key} block={block} />);
  return (
    <div className="tetris-board">
      {blocks}
    </div>
  );
}

TetrisBoard.propTypes = {
  blocks: PropTypes.arrayOf(BLOCK_SHAPE).isRequired,
};

function Score(props) {
  return <div>{props.score}</div>;
}

Score.propTypes = {
  score: PropTypes.number.isRequired,
};

const ScoreContainer = connect(
  state => ({ score: state.score })
)(Score);

const TetrisBoardContainer = connect(
  state => ({ blocks: state.liveBlocks.concat(state.deadBlocks) })
)(TetrisBoard);

function StartScreen(props) {
  return (
    <div className={'start-screen'}>
      <header>Start Screen</header>
      <button onClick={props.onStartClick}>Start Game</button>
    </div>
  );
}

StartScreen.propTypes = {
  onStartClick: PropTypes.func.isRequired,
};

const StartScreenContainer = connect(
  null,
  dispatch => ({ onStartClick: () => dispatch(startGame()) })
)(StartScreen);

function GameScreen() {
  return (
    <div className={'game-screen'}>
      <header>Game Screen</header>
      <ScoreContainer />
      <TetrisBoardContainer />
    </div>
  );
}

GameScreen.propTypes = {
  state: PropTypes.oneOf(_.values(STATES)).isRequired,
};

const GameScreenContainer = connect(
  state => ({ state: state.state })
)(GameScreen);

function Root(props) {
  return (
    <div>
      {props.state === STATES.IDLE && <StartScreenContainer />}
      {props.state === STATES.PLAYING && <GameScreenContainer />}
    </div>
  );
}

Root.propTypes = {
  state: PropTypes.oneOf(_.values(STATES)).isRequired,
};

const RootContainer = connect(
  state => ({ state: state.state })
)(Root);

ReactDOM.render(
  <Provider store={store}>
    <RootContainer />
  </Provider>,
  document.getElementById('root')
);
