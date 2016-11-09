import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import * as actions from '../actions';

class Ticker extends React.Component {
  componentDidMount() {
    const myTick = () => {
      this.props.tick();
      this.timeout = setTimeout(myTick, 1000);
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

export { Ticker, TickerContainer };
