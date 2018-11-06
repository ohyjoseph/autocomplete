const ClauseType = Object.freeze({
  SELECT: 'SELECT',
  FROM: 'FROM',
});

const TokenType = Object.freeze({
  KEYWORD: 'KEYWORD',
  LITERAL: 'LITERAL',
  IDENTIFIER: 'IDENTIFIER',
  WHITESPACE: 'WHITESPACE',
  FUNCTION: 'FUNCTION',
  SEPARATOR: 'SEPARATOR',
});

class Token {
  constructor(text, clauseType, tokenType, startPosition) {
    Object.assign(this, {
      text,
      clauseType,
      tokenType,
      startPosition,
    });
  }
}

const stringLiteralMatcher = /^('([^']*)'|"([^"]*)")$/;
const numericLiteralMatcher = /^\d+$/;
const whiteSpaceMatcher = /^\s+$/;

function isWhiteSpace(token) {
  return whiteSpaceMatcher.test(token);
}

function isLiteral(token) {
  return stringLiteralMatcher.test(token) || numericLiteralMatcher.test(token);
}

class Statement {
  constructor(sql) {
    this.sql = sql;
  }

  /**
   * Which clause you're in
   * @param  {Number}      position character index of the statement
   * @return {Triple}      tokens before, tokens after, all tokens
   */
  getTokens(position) {
    const sql = this.sql;

    if (sql.length === 0) {
      return [[], null, []];
    }

    let currentClause = null;
    function makeToken(t, startPosition) {
      const lowerText = t.toLowerCase();
      switch (lowerText) {
        case 'select':
          currentClause = ClauseType.SELECT;
          return new Token(t, currentClause, TokenType.KEYWORD, startPosition);
        case 'from':
          currentClause = ClauseType.FROM;
          return new Token(t, currentClause, TokenType.KEYWORD, startPosition);
        case ',':
          return new Token(
            t,
            currentClause,
            TokenType.SEPARATOR,
            startPosition,
          );
        default:
      }
      let tokenType;
      if (isWhiteSpace(t)) {
        tokenType = TokenType.WHITESPACE;
      } else if (isLiteral(t)) {
        tokenType = TokenType.LITERAL;
      } else {
        tokenType = TokenType.IDENTIFIER;
      }
      return new Token(t, currentClause, tokenType, startPosition);
    }

    let tokens = [];
    let tokensBeforePosition = [];
    let tokenAtPosition = null;
    let tokenText = '';
    let tokenStartPosition = 0;
    let currentlyInWord = /\w/.test(sql[0]);
    let currentlyInWhitespace = /\s/.test(sql[0]);
    for (let i = 0; i < sql.length; i += 1) {
      const c = sql[i];
      const leavingOrEnteringWord = currentlyInWord !== /\w/.test(c);
      const leavingOrEnteringWhitespace =
        currentlyInWhitespace !== /\s/.test(c);
      if (i > 0 && (leavingOrEnteringWord || leavingOrEnteringWhitespace)) {
        const token = makeToken(tokenText, tokenStartPosition);
        if (i > position && tokenStartPosition <= position) {
          tokenAtPosition = token;
        } else {
          tokens.push(token);
        }
        tokenText = '';
        tokenStartPosition = i;
        currentlyInWord = /\w/.test(c);
        currentlyInWhitespace = /\s/.test(c);
      }
      tokenText += c;
      if (i === position) {
        tokensBeforePosition = tokens;
        tokens = [];
      }
    }
    const token = makeToken(tokenText, tokenStartPosition);
    if (tokenStartPosition <= position) {
      tokenAtPosition = token;
    } else {
      tokens.push(token);
    }

    if (sql.length <= position) {
      tokensBeforePosition = tokens;
      tokens = [];
    }

    return [tokensBeforePosition, tokenAtPosition, tokens];
  }

  /**
   * Description of the projection for a select statement.
   * @return {Object}
   *   columns {String[]}  names of columns mentioned between SELECT and FROM
   */
  getSelectClause() {
    const after = this.getTokens(0)[2];
    const selectClauseTokens = after.filter(
      t => t.clauseType === ClauseType.SELECT,
    );

    if (selectClauseTokens.length === 0) {
      return undefined;
    }

    return {
      columns: selectClauseTokens
        .filter(t => t.tokenType === TokenType.IDENTIFIER)
        .map(t => t.text),
    };
  }

  getFromClause() {
    const after = this.getTokens(0)[2];
    const selectClauseTokens = after.filter(
      t => t.clauseType === ClauseType.FROM,
    );

    if (selectClauseTokens.length === 0) {
      return undefined;
    }

    return {
      columns: selectClauseTokens
        .filter(t => t.tokenType === TokenType.IDENTIFIER)
        .map(t => t.text),
    };
  }
}

export { Statement, ClauseType, TokenType, isLiteral };
