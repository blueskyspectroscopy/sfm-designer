import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Dropdown({ prefix, suffix, children, ...props }) {
  return (
    <InputGroup className="my-3">
      <InputGroup.Text>{prefix}</InputGroup.Text>
      <Form.Select {...props}>
        {children}
      </Form.Select>
      { suffix && <InputGroup.Text>{suffix}</InputGroup.Text> }
    </InputGroup>
  );
}

Dropdown.propTypes = {
  prefix: PropTypes.node.isRequired,
  suffix: PropTypes.node,
  children: PropTypes.node,
};
