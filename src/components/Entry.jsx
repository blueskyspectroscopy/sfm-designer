import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Entry({
    prefix, suffix = null,
    value, onChange = null,
    overrideState = null,
    ...props
  }) {
  const handleOverride = () => {
    const newOverride = !overrideState.override;
    overrideState.setOverride(newOverride);
    if (!newOverride) {
      const event = new CustomEvent('overridevalue', { detail: { value: overrideState.overrideValue }});
      onChange(event);
    }
  };
  const handleChange = (e) => {
    if (overrideState == null || overrideState.override) {
      onChange(e)
    }
  };
  return (
    <InputGroup className="my-3">
      <InputGroup.Text>{prefix}</InputGroup.Text>
      <Form.Control
        disabled={overrideState != null && !overrideState.override}
        value={value} onChange={handleChange}
        {...props}
        />
      { suffix && <InputGroup.Text>{suffix}</InputGroup.Text> }
      { overrideState != null &&
        <Button variant={overrideState.override ? 'primary' : 'outline-secondary'} onClick={handleOverride}>
          Override
        </Button>
      }
    </InputGroup>
  );
}

Entry.propTypes = {
  onChange: PropTypes.func,
  overrideState: PropTypes.shape({
    override: PropTypes.bool.isRequired,
    setOverride: PropTypes.func.isRequired,
    overrideValue: PropTypes.node.isRequired,
  }),
  prefix: PropTypes.node.isRequired,
  suffix: PropTypes.node,
  value: PropTypes.node,
};
