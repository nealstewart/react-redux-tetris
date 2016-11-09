import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { startGame } from '../actions';

function GameoverScreen(props) {
  return (
    <div className={'start-screen'}>
      <header>Gameover Screen</header>
      <button onClick={props.onStartClick}>Start Game</button>
    </div>
  );
}

GameoverScreen.propTypes = {
  onStartClick: PropTypes.func.isRequired,
};

const GameoverScreenContainer = connect(
  null,
  dispatch => ({ onStartClick: () => dispatch(startGame()) })
)(GameoverScreen);

export { GameoverScreen, GameoverScreenContainer };
