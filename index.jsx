import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './src/reducer';
import { RootContainer } from './src/components/root';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

const origSetTimeout = window.setTimeout;
const origClearTimeout = window.clearTimeout;
window.setTimeout = function() {
  const timeoutId = origSetTimeout.apply(window, arguments);
  console.log(`timeout created: ${timeoutId}`);
  return timeoutId;
};

window.clearTimeout = function(timeoutId) {
  console.log(`timeout cleared: ${timeoutId}`);
  origClearTimeout.apply(window, arguments);
};


ReactDOM.render(
  <Provider store={store}>
    <RootContainer />
  </Provider>,
  document.getElementById('root')
);
