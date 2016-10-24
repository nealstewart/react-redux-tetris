import _ from 'lodash';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import states from '../states';
import { GameScreenContainer } from './game_screen';
import { StartScreenContainer } from './start_screen';

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

export { Root, RootContainer };
