import * as _ from 'lodash';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import blockShape from '../shapes/block';
import Block from './block';
import blockSize from '../block_size';

export function NextTetromino(props) {
  const style = {
    width: `${4 * blockSize}px`,
    height: `${2 * blockSize}px`,
    padding: `${1 * blockSize}px`,
    marginLeft: `${1 * blockSize}px`,
  };
  const blocks = _.map(props.blocks, block => <Block key={block.key} block={block} />);
  return (
    <div style={style} className="next-tetromino">
      <div className="next-tetromino-blocks">
        {blocks}
      </div>
    </div>
  );
}

NextTetromino.propTypes = {
  blocks: PropTypes.arrayOf(blockShape).isRequired,
};

const NextTetrominoContainer = connect(
  state => ({ blocks: state.nextBlocks })
)(NextTetromino);

export { NextTetrominoContainer };
