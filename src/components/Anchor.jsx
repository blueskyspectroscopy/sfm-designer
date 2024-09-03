import React from 'react';
import PropTypes from 'prop-types';

export default function Anchor({ href, children, ...props }) {
   
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

Anchor.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
