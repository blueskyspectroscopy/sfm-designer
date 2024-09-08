import React from 'react';

import Stack from 'react-bootstrap/Stack';
import { FaGithub } from 'react-icons/fa';

import Anchor from './Anchor';

// Note that these must use http and not https. The server will automatically
// switch to https upon connecting.
//
// The id is essentially a slug of the name, consisting of only lowercase
// letters.
const socialData = [
  {
    name: 'GitHub',
    id: 'github',
    url: 'https://github.com/adamchristiansen/sfm-designer',
    icon: FaGithub,
  },
];

export default function Footer() {
  return (
    <>
      <hr className="user-select-none mt-5" />
      <Stack className="justify-content-between text-muted mb-4 user-select-none" direction="horizontal">
        <div className="flex-grow-0 fs-3">
          <Stack className="justify-content-center" direction="horizontal" gap={2}>
            {socialData.map((social) => (
              <Anchor key={social.id} href={social.url} className="text-muted text-primary-hover">
                <social.icon />
              </Anchor>
            ))}
          </Stack>
        </div>
        <div className="flex-grow-0">
          <small>
            Copyright ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Adam Christiansen
          </small>
        </div>
      </Stack>
    </>
  );
}
