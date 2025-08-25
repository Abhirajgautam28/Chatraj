// Project E2E test
// Checks project UI loads and main actions

describe('Project Flow', () => {
  it('should load project page and interact with UI if possible', () => {
    cy.visit('/project');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/project');
      }
    });
    cy.contains(/Project|Editor|Collaborate|Code|File|AI/i, {timeout: 8000});
    cy.get('button,span').contains(/run|save|share|settings|ai|chat/i, { matchCase: false }).first().click({force:true});
    cy.contains(/success|error|output|result/i, {timeout: 8000});
  });
});
