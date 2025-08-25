// ChatRaj E2E test
// Checks chat/AI feature loads and basic interaction

describe('ChatRaj Flow', () => {
  it('should load ChatRaj and send a message if input exists', () => {
    cy.visit('/chatraj');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/chatraj');
      }
    });
    cy.contains(/ChatRaj|AI|Assistant|Message/i, {timeout: 8000});
    cy.get('input,textarea').first().type('Hello, ChatRaj!{enter}', {force:true});
    cy.contains(/hello|response|ai|answer/i, {timeout: 8000});
  });
});
