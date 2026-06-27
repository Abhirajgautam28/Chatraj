import { describe, test, expect } from 'vitest';
import { getThemeClasses } from '../../../utils/themeClasses';

describe('getThemeClasses utility', () => {
  const themes = [
    'default',
    'glassmorphism',
    'claymorphism',
    'liquidglass',
    'minimalist',
    'materialui'
  ];

  const modes = [true, false];

  themes.forEach(theme => {
    modes.forEach(isDarkMode => {
      test(`should return correct classes for theme: ${theme}, isDarkMode: ${isDarkMode}`, () => {
        const classes = getThemeClasses(theme, isDarkMode);

        expect(classes).toBeDefined();
        expect(typeof classes).toBe('object');

        // Verify all required keys are present
        expect(classes).toHaveProperty('container');
        expect(classes).toHaveProperty('textMain');
        expect(classes).toHaveProperty('textMuted');
        expect(classes).toHaveProperty('border');
        expect(classes).toHaveProperty('input');
        expect(classes).toHaveProperty('buttonPrimary');
        expect(classes).toHaveProperty('buttonSecondary');

        // Verify values are strings
        Object.values(classes).forEach(val => {
          expect(typeof val).toBe('string');
          expect(val.length).toBeGreaterThan(0);
        });
      });
    });
  });

  test('should fallback to default theme for unknown theme', () => {
    const unknownTheme = 'non-existent-theme';
    const isDarkMode = false;
    const classes = getThemeClasses(unknownTheme, isDarkMode);
    const defaultClasses = getThemeClasses('default', isDarkMode);

    expect(classes).toEqual(defaultClasses);
  });

  test('should fallback to default theme for null/undefined theme', () => {
    expect(getThemeClasses(null, false)).toEqual(getThemeClasses('default', false));
    expect(getThemeClasses(undefined, false)).toEqual(getThemeClasses('default', false));
  });

  describe('Specific theme content verification', () => {
    test('claymorphism should have specific shadow classes', () => {
      const darkClasses = getThemeClasses('claymorphism', true);
      expect(darkClasses.container).toContain('shadow-[inset_4px_4px_8px_rgba(255,255,255,0.05),_8px_8px_16px_rgba(0,0,0,0.5)]');

      const lightClasses = getThemeClasses('claymorphism', false);
      expect(lightClasses.container).toContain('shadow-[inset_4px_4px_8px_rgba(255,255,255,0.8),_8px_8px_16px_rgba(0,0,0,0.1)]');
    });

    test('glassmorphism should have backdrop-blur and border-white', () => {
      const classes = getThemeClasses('glassmorphism', false);
      expect(classes.container).toContain('backdrop-blur-xl');
      expect(classes.container).toContain('border-white/40');
    });

    test('liquidglass should have gradient classes', () => {
      const classes = getThemeClasses('liquidglass', true);
      expect(classes.container).toContain('bg-gradient-to-br');
      expect(classes.buttonPrimary).toContain('bg-gradient-to-br');
    });

    test('minimalist should have specific hex colors', () => {
      const classes = getThemeClasses('minimalist', true);
      expect(classes.container).toContain('#09090b');
      expect(classes.border).toContain('#27272a');
    });

    test('materialui should have specific hex colors and shadow-md', () => {
      const classes = getThemeClasses('materialui', false);
      expect(classes.container).toContain('#ffffff');
      expect(classes.container).toContain('shadow-md');
    });
  });
});
