import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TickerContainer } from './ticker';
import { ScoreContainer } from './score';
import { TetrisBoardContainer } from './tetris_board';
import { moveLeft, moveRight, tick } from '../actions';

function isArrowEvent(code) {
  return code === 'ArrowLeft' ||
    code === 'ArrowRight' ||
    code === 'ArrowDown';
}

class GameScreen extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (isArrowEvent(e.code)) {
        e.preventDefault();

        switch (e.code) {
          case 'ArrowRight':
            this.props.moveRight();
            break;
          case 'ArrowDown':
            this.props.moveDown();
            break;
          case 'ArrowLeft':
            this.props.moveLeft();
            break;
          default:
        }
      }
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <div className={'game-screen'}>
        <header>Game Screen</header>
        <ScoreContainer />
        <TetrisBoardContainer />
        <TickerContainer />
      </div>
    );
  }
}

GameScreen.propTypes = {
  moveRight: PropTypes.func.isRequired,
  moveLeft: PropTypes.func.isRequired,
  moveDown: PropTypes.func.isRequired,
};

const GameScreenContainer = connect(
  state => ({ state: state.state }),
  dispatch => ({
    moveLeft: () => dispatch(moveLeft()),
    moveRight: () => dispatch(moveRight()),
    moveDown: () => dispatch(tick()),
  })
)(GameScreen);

export { GameScreen, GameScreenContainer };
