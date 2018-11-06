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

//My code

const getAllColumns = (tables) => {
  const columns = [];
  for (let table in tables) {
    for (let column of tables[table]) {
      columns.push(new Suggestion(SuggestionType.COLUMN, column.toUpperCase()));
    }
  }
  return columns;
}

const getTableNames = (tables) => {
  const tableNames = [];
  for (let table in tables) {
    tableNames.push(new Suggestion(SuggestionType.TABLE, table.toUpperCase()));
  }
  return tableNames;
}

const filterSuggestions = (suggestions, query = '') => {
  let filteredSuggestions = suggestions.filter((suggestion) => {
    return checkWordsMatch(query, suggestion.snippet);
  });
  return filteredSuggestions;
}

// const filterTables = (query)

const sortByIdentifiers = (identifiers, suggestions) => {
  const indentifierSet = new Set();
  for (let indentifier of identifiers) {
    identifier = identifier.toUpperCase();
    if (!identifierSet.has(identifier)) {
      identifierSet.add(identifier);
    }
  }
  
  return suggestions.sort((suggestion) => {
    if (identifierSet.has(suggestion.toUpperCase())) {
      return -1;
    }
    return 1;
  });
}

const sortTablesByColumns = (suggestions, tables, columnNames) => {
  let columnSet = new Set();
  for (let columnName of columnNames) {
    columnSet.add(columnName);
  }
  for (tableName in tables) {
    let columns = tables[tableName];
    for (let column of columns) {
      if (columnSet.has(column)) {

      }
    }
  }
}

const checkWordsMatch = (query, key) => {
  if (query.length > key.length) return false;
  for (let i = 0; i < query.length; i++) {
    let char1 = query[i];
    let char2 = key[i];
    if (char1 !== char2) return false;
  }
  return true;
}

const getTokensBeforeCursor = (tokens, cursorPosition) => {
  let filteredTokens = tokens.filter((token) => {
    console.log('tk', token)
    return token.startPosition <= cursorPosition;
  });
  return filteredTokens;
}

const findLatestTokenClause = (tokens) => {
  for (let i = tokens.length-1; i >= 0; i--) {
    let clauseType = tokens[i].clauseType;
    if (clauseType) return clauseType;
  }
  return null;
}
//end

class Suggester {
  constructor(tables) {
    this.tables = tables;
  }

  getSuggestions(statement, cursorPosition, tables) {
    let suggestions = [];
    let relevantTokens = getTokensBeforeCursor(statement.getTokens()[2], cursorPosition);
    let select = statement.getSelectClause();
    let from = statement.getFromClause();
    console.log('tables', tables);
    let revelantClause = findLatestTokenClause(relevantTokens);
    if (relevantTokens && relevantTokens.length) {
      var cursorTokenText = relevantTokens[relevantTokens.length-1].text.toUpperCase();
      var cursorTokenType = relevantTokens[relevantTokens.length-1].tokenType.toUpperCase();
    }
    console.log('relevantTokens', relevantTokens);
    console.log('clause', revelantClause);
    if (!revelantClause) {
      suggestions = StartingKeywords;
      suggestions = filterSuggestions(suggestions, cursorTokenText);
    } else if (revelantClause === 'SELECT') {
      suggestions = getAllColumns(tables);
      console.log(suggestions)
      console.log('latest Text', cursorTokenText)
      if (cursorTokenType === 'IDENTIFIER') {
        suggestions = filterSuggestions(suggestions, cursorTokenText);
        if (from) {
          sortByIdentifiers(from.columns ,suggestions);
        }
      }
    } else if (revelantClause === 'FROM') {
      suggestions = getTableNames(tables);
      if (cursorTokenType === 'IDENTIFIER') {
          suggestions = filterSuggestions(suggestions, cursorTokenText);
          if (select) {
            // sortByIdentifiers(select.columns ,suggestions);
            // sortTablesByColumns(suggestions, select.columns);
          }
      }
    }
    return suggestions;
  }
}

export { Suggester, Suggestion, SuggestionType };
