import React from 'react';
import blockSize from '../block_size';
import blockShape from '../shapes/block';

export default function Block(props) {
  const block = props.block;
  const style = {
    left: blockSize * block.location.x,
    top: blockSize * block.location.y,
    backgroundColor: block.colour,
  };
  return <div className="block" style={style} />;
}

Block.propTypes = {
  block: blockShape.isRequired,
};
