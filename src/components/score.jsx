import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

function Score(props) {
  return (
    <div>
      <div>
        <span>Score: </span>
        <span>{props.score}</span>
      </div>
      <div>
        <span>Level: </span>
        <span>{props.level}</span>
      </div>
    </div>
  );
}

Score.propTypes = {
  score: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
};

const ScoreContainer = connect(
  state => ({ score: state.score, level: state.level })
)(Score);

export { Score, ScoreContainer };
