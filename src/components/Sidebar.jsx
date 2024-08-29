import React from 'react';
import { Link } from 'react-router-dom';

import Logo from '../assets/logo.svg?react';

export default function Sidebar() {
  return (
    <nav className="d-block user-select-none">
      <Link to="/" className="text-decoration-none text-body">
        <h1 className="fs-3">
          <Logo className="d-inline me-3" style={{height: '1.5em', marginBottom: '0.2em'}} />
          SFM Designer
        </h1>
      </Link>
      <p className="text-muted">
        A calculator for sinusoidal frequency modulation (SFM) interferometer layouts.
      </p>
    </nav>
  );
}
