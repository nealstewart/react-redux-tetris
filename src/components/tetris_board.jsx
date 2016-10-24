import * as _ from 'lodash';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import blockShape from '../shapes/block';
import Block from './block';

export function TetrisBoard(props) {
  const blocks = _.map(props.blocks, block => <Block key={block.key} block={block} />);
  return (
    <div className="tetris-board">
      {blocks}
    </div>
  );
}

TetrisBoard.propTypes = {
  blocks: PropTypes.arrayOf(blockShape).isRequired,
};

const TetrisBoardContainer = connect(
  state => ({ blocks: state.liveBlocks.concat(state.deadBlocks) })
)(TetrisBoard);

export { TetrisBoardContainer };
