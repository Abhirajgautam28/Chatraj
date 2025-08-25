// ChatRaj E2E test
// Checks chat/AI feature loads and basic interaction

describe('ChatRaj Flow', () => {
  it('should load ChatRaj and send a message if input exists', () => {
    cy.visit('/chatraj');
    cy.contains('ChatRaj').should('exist');
    cy.get('input,textarea').first().then($el => {
      if ($el.length) {
        cy.wrap($el).type('Hello, ChatRaj!{enter}');
        cy.contains(/hello|response|ai|answer/i, { timeout: 10000 });
      } else {
        cy.log('No chat input found.');
      }
    });
  });
});
