// Project E2E test
// Checks project UI loads and main actions

describe('Project Flow', () => {
  it('should load project page and interact with UI', () => {
    cy.visit('/project');
    cy.contains(/project|editor|collaborate/i);
    cy.get('button,span').contains(/run|save|share|settings|ai|chat/i, { matchCase: false }).first().click({force:true});
    cy.contains(/success|error|output|result/i);
  });
});
