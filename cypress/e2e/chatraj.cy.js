// ChatRaj E2E test
// Checks chat/AI feature loads and basic interaction

describe('ChatRaj Flow', () => {
  it('should load ChatRaj and send a message', () => {
    cy.visit('/chatraj');
    cy.contains(/chatraj|ask|ai|message/i);
    cy.get('input,textarea').first().type('Hello, ChatRaj!{enter}');
    cy.contains(/hello|response|ai|answer/i);
  });
});
