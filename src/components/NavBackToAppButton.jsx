import React from 'react';
import { Link } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import { TfiArrowLeft } from "react-icons/tfi";

export default function NavBackToAppButton() {
  return (
    <Link to="/">
      <Button variant="outline-primary">
        <TfiArrowLeft className="mb-1" /> Back to app
      </Button>
    </Link>
  );
}
