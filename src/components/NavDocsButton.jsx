import React from 'react';
import { Link } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import { TfiHelp } from "react-icons/tfi";

export default function NavDocsButton() {
  return (
    <Link to="/docs">
      <Button variant="outline-primary">
        <TfiHelp className="mb-1" /> How do I use this?
      </Button>
    </Link>
  );
}
