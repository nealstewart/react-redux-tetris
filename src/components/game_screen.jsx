import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TickerContainer } from './ticker';
import { ScoreContainer } from './score';
import { TetrisBoardContainer } from './tetris_board';
import { moveLeft, moveRight, tick, drop, rotate, pause, unpause } from '../actions';
import states from '../states';

function isArrowEvent(code) {
  return code === 'ArrowLeft' ||
    code === 'ArrowRight' ||
    code === 'ArrowDown';
}

class GameScreen extends React.Component {
  componentDidMount() {
    _.bindAll(this, 'mapKeycodeToAction');
    document.addEventListener('keydown', this.mapKeycodeToAction);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.mapKeycodeToAction);
  }

  checkForUnpause(e) {
    if (e.code === 'KeyP') {
      this.props.unpause();
    }
  }

  mapKeycodeToAction(e) {
    if (isArrowEvent(e.code)) {
      e.preventDefault();
    }

    if (this.props.state === states.PAUSED) {
      this.checkForUnpause(e);
      return;
    }

    switch (e.code) {
      case 'ArrowRight':
        this.props.moveRight();
        break;
      case 'ArrowDown':
        this.props.moveDown();
        break;
      case 'ArrowUp':
        this.props.rotate();
        break;
      case 'ArrowLeft':
        this.props.moveLeft();
        break;
      case 'Space':
        this.props.drop();
        break;
      case 'KeyP':
        this.props.pause();
        break;
      default:
    }
  }

  render() {
    return (
      <div className={'game-screen'}>
        <header>Game Screen</header>
        <ScoreContainer />
        <TetrisBoardContainer />
        { this.props.state === states.PLAYING && <TickerContainer /> }
      </div>
    );
  }
}

GameScreen.propTypes = {
  moveRight: PropTypes.func.isRequired,
  moveLeft: PropTypes.func.isRequired,
  moveDown: PropTypes.func.isRequired,
  drop: PropTypes.func.isRequired,
  rotate: PropTypes.func.isRequired,
  pause: PropTypes.func.isRequired,
  unpause: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
};

const GameScreenContainer = connect(
  state => ({ state: state.state }),
  dispatch => ({
    moveLeft: () => dispatch(moveLeft()),
    moveRight: () => dispatch(moveRight()),
    moveDown: () => dispatch(tick()),
    drop: () => dispatch(drop()),
    rotate: () => dispatch(rotate()),
    pause: () => dispatch(pause()),
    unpause: () => dispatch(unpause()),
  })
)(GameScreen);

export { GameScreen, GameScreenContainer };
