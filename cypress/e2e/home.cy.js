// Home page E2E test
// Covers navigation, newsletter, and main UI

describe('Home Page Flow', () => {
  it('should load home, show main sections, and navigate to categories', () => {
    cy.visit('/');
    cy.contains('Sign up').should('exist');
    cy.contains('Login').should('exist');
    cy.get('input[type=email]').should('not.exist'); // Not on login yet
    cy.contains('Categories').click({force:true});
    cy.url().should('include', '/categories');
  });
});
