import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

function Score(props) {
  return <div>{props.score}</div>;
}

Score.propTypes = {
  score: PropTypes.number.isRequired,
};

const ScoreContainer = connect(
  state => ({ score: state.score })
)(Score);

export { Score, ScoreContainer };
