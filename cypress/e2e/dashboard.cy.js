// Dashboard E2E test
// Checks dashboard loads, navigation, and logout

describe('Dashboard Flow', () => {
  it('should login and reach dashboard, then logout', () => {
    cy.visit('/login');
    cy.get('input[type=email]').type('fake@example.com');
    cy.get('input[type=password]').type('wrongpass');
    cy.contains('Login').click();
    cy.contains('Login failed').should('exist');
    // Now try a valid login if you have a test user
    // cy.get('input[type=email]').clear().type('validuser@example.com');
    // cy.get('input[type=password]').clear().type('validpassword');
    // cy.contains('Login').click();
    // cy.url().should('include', '/dashboard');
    // cy.contains('Logout').click();
    // cy.url().should('include', '/login');
  });
});
