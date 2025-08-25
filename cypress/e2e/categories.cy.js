// Categories E2E test
// Checks categories page and navigation to dashboard

describe('Categories Flow', () => {
  it('should load categories and navigate to dashboard if category exists', () => {
    cy.visit('/categories');
    cy.contains('Explore Categories').should('exist');
    cy.get('.min-h-[160px],.min-h-[100px],.min-h-[220px]').first().then(card => {
      if (card.length) {
        cy.wrap(card).click();
        cy.url().should('include', '/dashboard');
      } else {
        cy.log('No categories available to test navigation.');
      }
    });
  });
});
