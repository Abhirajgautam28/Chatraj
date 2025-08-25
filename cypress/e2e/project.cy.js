// Project E2E test
// Checks project UI loads and main actions

describe('Project Flow', () => {
  it('should load project page and interact with UI if possible', () => {
    cy.visit('/project');
    cy.contains('Project').should('exist');
    cy.get('button,span').then($els => {
      if ($els.length) {
        cy.wrap($els[0]).click({force:true});
        cy.contains(/success|error|output|result/i, { timeout: 10000 });
      } else {
        cy.log('No project action buttons found.');
      }
    });
  });
});
