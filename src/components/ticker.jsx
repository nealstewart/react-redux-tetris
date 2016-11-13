import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import * as actions from '../actions';


const minTime = (1000 / 20);

function calcTiming(level) {
  return Math.max(minTime, Math.floor(1000 / (level + 1)));
}

class Ticker extends React.Component {
  componentDidMount() {
    const myTick = () => {
      this.props.tick();
      this.timeout = setTimeout(myTick, calcTiming(this.props.level));
    };
    this.timeout = setTimeout(myTick, calcTiming(this.props.level));
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
  level: PropTypes.number.isRequired,
};

const TickerContainer = connect(
  state => ({ level: state.level }),
  dispatch => ({ tick: () => dispatch(actions.tick()) })
)(Ticker);

export { Ticker, TickerContainer };
