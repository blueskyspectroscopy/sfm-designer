import React from 'react';

import NavBackToAppButton from  '../components/NavBackToAppButton';
import DocsContent from '../DocsContent.mdx';

export default function Docs() {
  return (
    <>
      <div className="mb-4">
        <NavBackToAppButton />
      </div>
      <DocsContent />
    </>
  );
}
