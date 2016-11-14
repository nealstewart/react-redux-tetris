import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TickerContainer } from './ticker';
import { TetrisBoardContainer } from './tetris_board';
import { NextTetrominoContainer } from './next_tetromino';
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
        <div className="left">
          <div className="statistics" />
        </div>
        <div className="middle">
          <TetrisBoardContainer />
          { this.props.state === states.PAUSED && <div className="pause-text">PAUSED</div> }
        </div>
        <div className="right">
          <NextTetrominoContainer />
          <div className="stats">
            <div className="score-container">
              <div>Score</div>
              <div>{this.props.score}</div>
            </div>
            <div className="line-count">
              <div>Lines Cleared</div>
              <div>{this.props.linesCleared}</div>
            </div>
            <div className="level">
              <div>Level</div>
              <div>{this.props.level}</div>
            </div>
          </div>
        </div>
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
  level: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  linesCleared: PropTypes.number.isRequired,
};

const GameScreenContainer = connect(
  ({ state, level, score, linesCleared }) => ({ state, level, score, linesCleared }),
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
