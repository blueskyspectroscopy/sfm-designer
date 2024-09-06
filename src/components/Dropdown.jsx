import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export default function Dropdown({ prefix, suffix, value, onCycle, options, ...props }) {
  // Handle the clicks of the cycle buttons.
  const [UP, DOWN] = ['UP', 'DOWN'];
  const handleClick = (direction) => {
    // Find the index of the value.
    let index = null;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value == value) {
        index = i;
        break;
      }
    }
    if (index == null) {
      return; // The value was not found.
    }
    // Find the next index.
    let next = index + (direction == DOWN ? 1 : -1);
    if (next < 0) {
      next = 0;
    } else if (next >= options.length) {
      next = options.length - 1;
    }
    onCycle(options[next].value);
  };
  return (
    <InputGroup className="my-3">
      <InputGroup.Text>{prefix}</InputGroup.Text>
      <Form.Select value={value} {...props}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
      </Form.Select>
      { suffix && <InputGroup.Text>{suffix}</InputGroup.Text> }
      { onCycle && (<>
        <Button
          variant="outline-secondary"
          onClick={() => handleClick(UP)}
          disabled={value == options[0].value}
          >
          <FaArrowUp />
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => handleClick(DOWN)}
          disabled={value == options[options.length - 1].value}
          >
          <FaArrowDown />
        </Button>
      </>)}
    </InputGroup>
  );
}

Dropdown.propTypes = {
  prefix: PropTypes.node.isRequired,
  suffix: PropTypes.node,
  value: PropTypes.node.isRequired,
  onCycle: PropTypes.func,
  options: PropTypes.array.isRequired,
};

Dropdown.defaultProps = {
  suffix: null,
  onCycle: null,
};
