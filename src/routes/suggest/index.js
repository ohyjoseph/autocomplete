import React from 'react';
import Suggest from './Suggest';

const title = 'Alation Suggest';

function action() {
  return {
    title,
    component: <Suggest />,
  };
}

export default action;
