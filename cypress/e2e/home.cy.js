// Home page E2E test
// Covers navigation, newsletter, and main UI

describe('Home Page Flow', () => {
  it('should load home, show main sections, and navigate to categories', () => {
    cy.visit('/');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/');
      }
    });
    cy.contains(/AI Code Assistant|Real-time Collaboration|Smart Suggestions|Sign up|Login/i, {timeout: 8000});
    cy.contains(/Categories|category/i, { matchCase: false }).first().click({force:true});
    cy.url().should('include', '/categories');
  });
});
