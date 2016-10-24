import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TickerContainer } from './ticker';
import { ScoreContainer } from './score';
import { TetrisBoardContainer } from './tetris_board';
import states from '../states';

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

export { GameScreen, GameScreenContainer };
