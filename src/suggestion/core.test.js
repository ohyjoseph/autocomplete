/* global beforeEach, describe, expect, it */

import { Suggester, SuggestionType } from './core';
import { Statement } from './parsing';

describe('Suggester', () => {
  let suggester;
  beforeEach(() => {
    suggester = new Suggester();
  });

  describe('getSuggestions', () => {
    it('should suggest SELECT, CREATE, INSERT, UPDATE, and ALTER at the start of a statement', () => {
      const s = new Statement('');
      const suggestions = suggester.getSuggestions(s, 0);
      const types = suggestions.map(sg => sg.type);
      const snippets = suggestions.map(sg => sg.snippet);
      expect(new Set(types)).toEqual(new Set([SuggestionType.KEYWORD]));
      expect(snippets).toEqual(
        expect.arrayContaining([
          'SELECT',
          'CREATE',
          'INSERT',
          'UPDATE',
          'ALTER',
        ]),
      );
    });
    it('should suggest columns after a SELECT', () => {});
    it('should suggest tables after a FROM', () => {});
    it('should suggest columns in mentioned tables first', () => {});
    it('should suggest tables with mentioned columns first', () => {});
  });
});
