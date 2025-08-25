// Welcome/Onboarding E2E test
// Checks welcome page and navigation

describe('Welcome ChatRaj Flow', () => {
  it('should load welcome page and navigate to chat or categories if possible', () => {
    cy.visit('/welcome-chatraj');
    cy.contains('Welcome').should('exist');
    cy.get('button,a').then($els => {
      if ($els.length) {
        cy.wrap($els[0]).click({force:true});
        cy.url().should('match', /chatraj|categories/);
      } else {
        cy.log('No navigation button found on welcome page.');
      }
    });
  });
});
