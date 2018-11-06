import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import SuggestionList from '../../components/SuggestionList';
import s from './Suggest.css';
import { Suggester } from '../../suggestion/core';
import { Statement } from '../../suggestion/parsing';

class Suggest extends React.Component {
  constructor(props) {
    super(props);
    this.suggester = new Suggester({
      table1: ['col1', 'col2', 'col3'],
      foo_table: ['fc1', 'fc2'],
    });
    this.state = { suggestions: this.getSuggestions('', 0) };
  }

  onSQLChange(e) {
    if (this.editor) {
      const suggestions = this.getSuggestions(
        e.target.value,
        this.editor.selectionStart,
      );
      this.setState({ suggestions });
    } else {
      this.setState({ suggestions: [] });
    }
    console.log('this', this);
  }

  getSuggestions(sql, selectionStart) {
    const statement = new Statement(sql);
    return this.suggester.getSuggestions(statement, selectionStart, this.suggester.tables);
  }

  render() {
    return (
      <div className={s.main}>
        <h1>¿Hablo SQL?</h1>
        <textarea
          ref={editor => {
            this.editor = editor;
          }}
          className={s.editor}
          onChange={e => this.onSQLChange(e)}
        />
        <SuggestionList suggestions={this.state.suggestions} />
      </div>
    );
  }
}

export default withStyles(s)(Suggest);
