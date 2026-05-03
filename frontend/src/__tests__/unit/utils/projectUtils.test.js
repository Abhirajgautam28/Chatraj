import { describe, test, expect } from 'vitest';
import { groupProjectsByCategory } from '../../../utils/projectUtils';

describe('Project Utilities', () => {
  describe('groupProjectsByCategory', () => {
    test('should group projects by their category', () => {
      const projects = [
        { name: 'P1', category: 'Web' },
        { name: 'P2', category: 'AI' },
        { name: 'P3', category: 'Web' }
      ];
      const result = groupProjectsByCategory(projects);
      expect(result.Web).toHaveLength(2);
      expect(result.AI).toHaveLength(1);
    });

    test('should handle empty or null projects', () => {
      expect(groupProjectsByCategory(null)).toEqual({});
      expect(groupProjectsByCategory([])).toEqual({});
    });
  });

});
