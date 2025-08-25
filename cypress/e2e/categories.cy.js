// Categories E2E test
// Checks categories page and navigation to dashboard

describe('Categories Flow', () => {
  it('should load categories and navigate to dashboard', () => {
    cy.visit('/categories');
    cy.contains(/category|categories/i);
    // Try clicking a category if present
    cy.get('button, a').contains(/category|dashboard/i, { matchCase: false }).first().click({force:true});
    cy.url().should('include', '/dashboard');
  });
});
