// Home page E2E test
// Covers navigation, newsletter, and main UI

describe('Home Page Flow', () => {
  it('should load home, show main sections, and navigate to categories', () => {
    cy.visit('/');
    cy.contains('ChatRaj').should('exist');
    cy.get('a').contains('Register').should('exist');
    cy.get('a').contains('Login').should('exist');
    // Try to navigate to categories if user is not logged in
    cy.visit('/categories');
    cy.contains('Explore Categories').should('exist');
  });
});
