// Welcome/Onboarding E2E test
// Checks welcome page and navigation

describe('Welcome ChatRaj Flow', () => {
  it('should load welcome page and navigate to chat or categories', () => {
    cy.visit('/welcome-chatraj');
    cy.contains(/welcome|chatraj|get started/i);
    cy.get('button,a').contains(/chat|categories|start/i, { matchCase: false }).first().click({force:true});
    cy.url().should('match', /chatraj|categories/);
  });
});
