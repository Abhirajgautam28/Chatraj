// Welcome/Onboarding E2E test
// Checks welcome page and navigation

describe('Welcome ChatRaj Flow', () => {
  it('should load welcome page and navigate to chat or categories if possible', () => {
    cy.visit('/welcome-chatraj');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/welcome-chatraj');
      }
    });
    cy.contains(/Welcome to|ChatRaj|Initializing/i, {timeout: 8000});
    // Wait for redirect to /chat or /categories
    cy.wait(4500);
    cy.url().should('match', /chat|categories/);
  });
});
