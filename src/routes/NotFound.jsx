import React from 'react';
import { Link } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import { TfiArrowLeft } from "react-icons/tfi";

export default function NotFound() {
  return (
    <>
      <h1 className="mt-5 pt-5">Oops!</h1>
      <p className="mt-3 mb-4">This page does not exist.</p>
      <Link to="/">
        <Button variant="outline-primary" className="mb-5">
          <TfiArrowLeft className="mb-1" /> Back to app
        </Button>
      </Link>
    </>
  );
}
