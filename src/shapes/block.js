import * as _ from 'lodash';
import { PropTypes } from 'react';
import colours from '../colours';

export default PropTypes.shape({
  location: {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  },
  key: PropTypes.string.isRequired,
  colour: PropTypes.oneOf(_.values(colours)),
});
