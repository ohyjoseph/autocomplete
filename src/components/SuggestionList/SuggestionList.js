import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SuggestionList.css';
import { Suggestion } from '../../suggestion/core';

class SuggestionList extends React.Component {
  static propTypes = {
    suggestions: PropTypes.arrayOf(PropTypes.instanceOf(Suggestion)).isRequired,
  };

  static defaultProps = {
    onClick: null,
  };
  render() {
    const { suggestions } = this.props;
    return (
      <ul className={s.root}>
        {suggestions.map(suggestion =>
          <li key={suggestion.snippet}>
            {suggestion.snippet}
          </li>,
        )}
      </ul>
    );
  }
}

export default withStyles(s)(SuggestionList);
