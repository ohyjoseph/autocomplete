/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';
import SuggestionList from './SuggestionList';

describe('SuggestionList', () => {
  test('renders empty correctly', () => {
    const wrapper = renderer
      .create(
        <App context={{ insertCss: () => {} }}>
          <SuggestionList suggestions={[]} />
        </App>,
      )
      .toJSON();

    expect(wrapper).toMatchSnapshot();
  });
});
