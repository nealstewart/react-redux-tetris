import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { startGame } from '../actions';

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

export { StartScreen, StartScreenContainer };
