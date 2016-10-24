import * as _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import states from './src/states';
import reducer from './src/reducer';
import { GameScreenContainer } from './src/components/game_screen';
import { StartScreenContainer } from './src/components/start_screen';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

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
