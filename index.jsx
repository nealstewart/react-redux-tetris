import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import states from './src/states';
import * as actions from './src/actions';
import colours from './src/colours';
import reducer from './src/reducer';

const BLOCK_SIZE = 20;

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

const BLOCK_SHAPE = PropTypes.shape({
  location: {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  },
  key: PropTypes.string.isRequired,
  colour: PropTypes.oneOf(_.values(colours)),
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

const TetrisBoardContainer = connect(
  state => ({ blocks: state.liveBlocks.concat(state.deadBlocks) })
)(TetrisBoard);

function Score(props) {
  return <div>{props.score}</div>;
}

Score.propTypes = {
  score: PropTypes.number.isRequired,
};

const ScoreContainer = connect(
  state => ({ score: state.score })
)(Score);

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
  dispatch => ({ onStartClick: () => dispatch(actions.startGame()) })
)(StartScreen);

class Ticker extends React.Component {
  componentDidMount() {
    const myTick = () => {
      this.props.tick();
      setTimeout(myTick, 1000);
    };
    this.timeout = setTimeout(myTick, 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return <div />;
  }
}

Ticker.propTypes = {
  tick: PropTypes.func.isRequired,
};

const TickerContainer = connect(
  null,
  dispatch => ({ tick: () => dispatch(actions.tick()) })
)(Ticker);

function GameScreen() {
  return (
    <div className={'game-screen'}>
      <header>Game Screen</header>
      <ScoreContainer />
      <TetrisBoardContainer />
      <TickerContainer />
    </div>
  );
}

GameScreen.propTypes = {
  state: PropTypes.oneOf(_.values(states)).isRequired,
};

const GameScreenContainer = connect(
  state => ({ state: state.state })
)(GameScreen);

function Root(props) {
  return (
    <div>
      {props.state === states.IDLE && <StartScreenContainer />}
      {props.state === states.PLAYING && <GameScreenContainer />}
    </div>
  );
}

Root.propTypes = {
  state: PropTypes.oneOf(_.values(states)).isRequired,
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
