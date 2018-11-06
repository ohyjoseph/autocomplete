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

const getColumnSuggestions = (tables) => {
  const columns = [];
  for (let table in tables) {
    for (let column of tables[table]) {
      columns.push(new Suggestion(SuggestionType.COLUMN, column));
    }
  }
  return columns;
}

const getTableSuggestions = (tables) => {
  const tableNames = [];
  for (let table in tables) {
    tableNames.push(new Suggestion(SuggestionType.TABLE, table));
  }
  return tableNames;
}

const filterSuggestions = (suggestions, query = '') => {
  let filteredSuggestions = suggestions.filter((suggestion) => {
    return checkWordsMatch(suggestion.snippet, query);
  });
  return filteredSuggestions;
}

const filterTables = (tables, query) => {
  let copiedTables = JSON.parse(JSON.stringify(tables));
  for (let tableName in copiedTables) {
    if (!checkWordsMatch(tableName, query)) {
      delete copiedTables[tableName];
    }
  }
  return copiedTables;
}

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

const sortTableSuggestionsByColumns = (tableNames, tables, columnNames) => {
  console.log('HHHHH', tableNames, tables, columnNames)
  let columnSet = new Set();
  for (let columnName of columnNames) {
    columnSet.add(columnName.toUpperCase());
  }
  tableNames.sort((tableName) => {
    let columns = tables[tableName.snippet];
    for (let column of columns) {
      if (columnSet.has(column.toUpperCase())) {
        return -1;
      }
    }
    return 1;
  });
  console.log('HEYYYY', tableNames)
}

const checkWordsMatch = (key, query) => {
  if (query.length > key.length) return false;
  for (let i = 0; i < query.length; i++) {
    let char1 = query[i].toUpperCase();
    let char2 = key[i].toUpperCase();
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
  for (let i = tokens.length - 1; i >= 0; i--) {
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
      var cursorTokenText = relevantTokens[relevantTokens.length - 1].text.toUpperCase();
      var cursorTokenType = relevantTokens[relevantTokens.length - 1].tokenType.toUpperCase();
    }
    console.log('relevantTokens', relevantTokens);
    console.log('clause', revelantClause);
    if (!revelantClause) {
      suggestions = StartingKeywords;
      suggestions = filterSuggestions(suggestions, cursorTokenText);
    } else if (revelantClause === 'SELECT') {
      suggestions = getColumnSuggestions(tables);
      console.log(suggestions)
      console.log('latest Text', cursorTokenText)
      if (cursorTokenType === 'IDENTIFIER') {
        suggestions = filterSuggestions(suggestions, cursorTokenText);
        if (from) {
          sortByIdentifiers(from.columns, suggestions);
        }
      }
    } else if (revelantClause === 'FROM') {
      if (cursorTokenType === 'IDENTIFIER') {
        let filteredTables = filterTables(tables, cursorTokenText);
        if (select) {
          suggestions = getTableSuggestions(filteredTables);
          sortTableSuggestionsByColumns(suggestions, filteredTables, select.columns);
        } else {
          suggestions = getTableSuggestions(filteredTables);  
        }
      } else {
        if (select) {
          suggestions = getTableSuggestions(tables);
          sortTableSuggestionsByColumns(suggestions, tables, select.columns);
        } else {
          suggestions = getTableSuggestions(tables);
        }
      }
    }
    return suggestions;
  }
}

export { Suggester, Suggestion, SuggestionType };
