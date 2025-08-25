// Categories E2E test
// Checks categories page and navigation to dashboard

describe('Categories Flow', () => {
  it('should load categories and navigate to dashboard if category exists', () => {
    cy.visit('/categories');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/categories');
      }
    });
    cy.contains('Explore Categories', {timeout: 8000});
    cy.get('button,div').contains(/DSA|Frontend|Backend|Fullstack|category/i, { matchCase: false }).first().click({force:true});
    cy.url().should('include', '/dashboard');
  });
});
