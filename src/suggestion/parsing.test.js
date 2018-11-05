/* global describe, expect, it, xit */

import { Statement, ClauseType, TokenType, isLiteral } from './parsing';

describe('Statement', () => {
  describe('getSelectClause', () => {
    it('should return undefined if there is no SELECT keyword', () => {
      const s = new Statement('FROM table');
      expect(s.getSelectClause()).toBeUndefined();
    });
    it('should return empty columns if there is a SELECT keyword and nothing after it', () => {
      const s = new Statement('SELECT FROM table');
      const select = s.getSelectClause();
      expect(select).not.toBeUndefined();
      expect(select.columns).toEqual([]);
    });
    it('should return a list of columns if there is a SELECT with multiple columns', () => {
      const s = new Statement('SELECT id, name FROM table');
      const select = s.getSelectClause();
      expect(select).not.toBeUndefined();
      expect(select.columns).toEqual(['id', 'name']);
    });
  });

  describe('getTokens', () => {
    it('should identify a select clause', () => {
      const s = new Statement('SELECT 1');
      const [before, current, after] = s.getTokens(0);
      expect(before.length).toBe(0);
      const tokens = [current].concat(after);
      expect(tokens.map(t => [t.text, t.tokenType, t.clauseType])).toEqual([
        ['SELECT', TokenType.KEYWORD, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['1', TokenType.LITERAL, ClauseType.SELECT],
      ]);
    });

    it('should identify both select and from clauses', () => {
      const s = new Statement('SELECT * from table1');
      const [before, current, after] = s.getTokens(0);
      expect(before.length).toBe(0);
      const tokens = [current].concat(after);
      expect(tokens.map(t => [t.text, t.tokenType, t.clauseType])).toEqual([
        ['SELECT', TokenType.KEYWORD, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['*', TokenType.IDENTIFIER, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['from', TokenType.KEYWORD, ClauseType.FROM],
        [' ', TokenType.WHITESPACE, ClauseType.FROM],
        ['table1', TokenType.IDENTIFIER, ClauseType.FROM],
      ]);
    });
    it('should identify columns in select clause as identifiers', () => {
      const s = new Statement('SELECT col1, b, col2');
      const [before, current, after] = s.getTokens(0);
      expect(before.length).toBe(0);
      const tokens = [current].concat(after);
      expect(tokens.map(t => [t.text, t.tokenType, t.clauseType])).toEqual([
        ['SELECT', TokenType.KEYWORD, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['col1', TokenType.IDENTIFIER, ClauseType.SELECT],
        [',', TokenType.SEPARATOR, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['b', TokenType.IDENTIFIER, ClauseType.SELECT],
        [',', TokenType.SEPARATOR, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
        ['col2', TokenType.IDENTIFIER, ClauseType.SELECT],
      ]);
    });
    it('should identify a single keyword', () => {
      const s = new Statement('SELECT');
      const [before, current, after] = s.getTokens(0);
      expect(before.length).toBe(0);
      expect(Object.assign({}, current)).toEqual({
        text: 'SELECT',
        tokenType: TokenType.KEYWORD,
        clauseType: ClauseType.SELECT,
        startPosition: 0,
      });
      expect(after.length).toBe(0);
    });
    it('should identify a single literal', () => {
      const s = new Statement('10');
      const [before, current, after] = s.getTokens(0);
      expect(before.length).toBe(0);
      expect(Object.assign({}, current)).toEqual({
        text: '10',
        tokenType: TokenType.LITERAL,
        clauseType: null,
        startPosition: 0,
      });
      expect(after.length).toBe(0);
    });
    it('should split tokens based on the cursor position', () => {
      const s = new Statement('SELECT 1');
      const [before, current, after] = s.getTokens(8);
      expect(before.map(t => [t.text, t.tokenType, t.clauseType])).toEqual([
        ['SELECT', TokenType.KEYWORD, ClauseType.SELECT],
        [' ', TokenType.WHITESPACE, ClauseType.SELECT],
      ]);
      expect(Object.assign({}, current)).toEqual({
        text: '1',
        tokenType: TokenType.LITERAL,
        clauseType: ClauseType.SELECT,
        startPosition: 7,
      });
      expect(after.length).toBe(0);
    });
    xit(
      'should label an identifier as the current token when cursor is at the end',
      () => {
        const s = new Statement('SELECT col1, col2 FROM t');
        const current = s.getTokens(11)[1];
        expect(current.text).toEqual('col1');
      },
    );
    xit('should identify a join clause', () => {
      // const s = new Statement('from a join b on a.id = b.id');
    });
  });
});

describe('isLiteral', () => {
  it('should identify a number as a literal', () => {
    expect(isLiteral('14159')).toBe(true);
  });

  it('should identify a single quoted string as a literal', () => {
    expect(isLiteral("'hello'")).toBe(true);
  });

  it('should identify a double quoted string as a literal', () => {
    expect(isLiteral('"hello"')).toBe(true);
  });

  it('should identify a multi-word string as a literal', () => {
    expect(isLiteral('"hello darkness my old friend"')).toBe(true);
  });
});
