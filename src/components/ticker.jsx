import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import * as actions from '../actions';

class Ticker extends React.Component {
  componentDidMount() {
    const myTick = () => {
      this.props.tick();
      this.timeout = setTimeout(myTick, Math.floor(1000 / (this.props.level + 1)));
    };
    this.timeout = setTimeout(myTick, Math.floor(1000 / (this.props.level + 1)));
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
