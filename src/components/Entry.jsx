import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Entry({
    prefix, suffix, automaticValue, onOverrideChange,
    value, onChange, ...props
  }) {
  const [override, setOverride] = useState(false);
  const handleOverride = () => {
    const newOverride = !override;
    setOverride(newOverride);
    onOverrideChange(newOverride); // Notify the new override value.
    if (!newOverride) {
      const event = new CustomEvent('automaticvalue', { detail: { value: automaticValue }});
      onChange(event);
    }
  };
  const handleChange = (e) => {
    if (automaticValue == null || override) {
      onChange(e)
    }
  };
  return (
    <InputGroup className="my-3">
      <InputGroup.Text>{prefix}</InputGroup.Text>
      <Form.Control
        disabled={automaticValue != null && !override}
        value={value} onChange={handleChange}
        {...props}
        />
      { suffix && <InputGroup.Text>{suffix}</InputGroup.Text> }
      { automaticValue != null &&
        <Button variant={override ? 'primary' : 'outline-secondary'} onClick={handleOverride}>
          Override
        </Button>
      }
    </InputGroup>
  );
}

Entry.propTypes = {
  prefix: PropTypes.node.isRequired,
  suffix: PropTypes.node,
  automaticValue: PropTypes.object,
  onOverrideChange: PropTypes.func,
  value: PropTypes.object,
  onChange: PropTypes.func,
};
