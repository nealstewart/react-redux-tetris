import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import states from './src/states';
import * as actions from './src/actions';
import reducer from './src/reducer';
import { TetrisBoardContainer } from './src/components/tetris_board';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

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
