/* eslint-disable */

const SuggestionType = Object.freeze({
  TABLE: 'TABLE',
  COLUMN: 'COLUMN',
  KEYWORD: 'KEYWORD',
});

class Suggestion {
  constructor(type, snippet) {
    this.type = type;
    this.snippet = snippet;
  }
}

const StartingKeywords = [
  new Suggestion(SuggestionType.KEYWORD, 'SELECT'),
  new Suggestion(SuggestionType.KEYWORD, 'CREATE'),
  new Suggestion(SuggestionType.KEYWORD, 'ALTER'),
  new Suggestion(SuggestionType.KEYWORD, 'INSERT'),
  new Suggestion(SuggestionType.KEYWORD, 'UPDATE'),
];

class Suggester {
  constructor(tables) {
    this.tables = tables;
  }

  getSuggestions(statement, cursorPosition) {
    return StartingKeywords;
  }
}

export { Suggester, Suggestion, SuggestionType };
