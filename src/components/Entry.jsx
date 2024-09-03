import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Entry({ prefix, suffix, ...props }) {
  return (
    <InputGroup className="my-3">
      <InputGroup.Text>{prefix}</InputGroup.Text>
      <Form.Control {...props} />
      { suffix && <InputGroup.Text>{suffix}</InputGroup.Text> }
    </InputGroup>
  );
}

Entry.propTypes = {
  prefix: PropTypes.node.isRequired,
  suffix: PropTypes.node,
};
