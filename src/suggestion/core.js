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

const sortTableSuggestionsByColumns = (tableSuggestions, tables, columnNames) => {
  let columnSet = new Set();
  for (let columnName of columnNames) {
    columnSet.add(columnName.toUpperCase());
  }
  tableSuggestions.sort((tableSuggestion) => {
    let columns = tables[tableSuggestion.snippet];
    for (let column of columns) {
      if (columnSet.has(column.toUpperCase())) {
        return -1;
      }
    }
    return 1;
  });
}

const sortColumnSuggestionsByTables = (columnSuggestions, reversedTables, tableNames) => {
  let tableSet = new Set();
  for (let tableName of tableNames) {
    tableSet.add(tableName.toUpperCase());
  }
  columnSuggestions.sort((columnSuggestion) => {
    let tables = reversedTables[columnSuggestion.snippet];
    for (let table of tables) {
      if (tableSet.has(table.toUpperCase())) {
        return -1;
      }
    }
    return 1;
  });
  console.log('WEIRD', columnSuggestions)
}

const reverseTablesObject = (tables) => {
  let columnsObj = {};
  for (let tableName in tables) {
    let columns = tables[tableName];
    for (let column of columns) {
      if (columnsObj[column]) {
        columnsObj[column].push(tableName);
      } else {
        columnsObj[column] = [tableName];
      }
    }
  }
  return columnsObj;
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

const findCursorTokenClause = (tokens) => {
  for (let i = tokens.length - 1; i >= 0; i--) {
    let clauseType = tokens[i].clauseType;
    if (clauseType) return clauseType;
  }
  return null;
}

const findLatestRelevantToken = (tokens) => {
  for (let i = tokens.length - 1; i >= 0; i--) {
    let clauseType = tokens[i].clauseType;
    let tokenType = tokens[i].tokenType;
    if (clauseType && tokenType !== 'WHITESPACE') return tokens[i];
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
    console.log('FROM', from)
    console.log('tables', tables);
    let relevantClause = findCursorTokenClause(relevantTokens);
    let relevantToken = findLatestRelevantToken(relevantTokens)
    if (relevantToken) {
      var cursorTokenText = relevantToken.text.toUpperCase();
      var cursorTokenType = relevantToken.tokenType.toUpperCase();
    }
    console.log('relevantTokens', relevantTokens);
    console.log('clause', relevantClause);
    if (!relevantClause) {
      suggestions = StartingKeywords;
      suggestions = filterSuggestions(suggestions, cursorTokenText);
    } else if (relevantClause === 'SELECT') {
      suggestions = getColumnSuggestions(tables);
      console.log(suggestions)
      console.log('latest Text', cursorTokenText)
      if (cursorTokenType === 'IDENTIFIER') {
        suggestions = filterSuggestions(suggestions, cursorTokenText);
        if (from) {
          let reversedTables = reverseTablesObject(tables);
          sortColumnSuggestionsByTables(suggestions, reversedTables, from.columns);
        }
      } else {
        if (from) {
          let reversedTables = reverseTablesObject(tables);
          sortColumnSuggestionsByTables(suggestions, reversedTables, from.columns);
        }
      }
    } else if (relevantClause === 'FROM') {
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
