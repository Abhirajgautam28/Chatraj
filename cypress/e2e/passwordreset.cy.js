// Password Reset E2E test
// Checks forgot password flow

describe('Password Reset Flow', () => {
  it('should show forgot password and handle reset', () => {
    cy.visit('/login');
    cy.contains(/forgot password|reset/i).click({force:true});
    cy.get('input[type=email]').first().type('testuser@example.com', {force:true});
    cy.contains(/send otp|send code|send/i, { matchCase: false }).click({force:true});
    cy.contains(/otp|code|verify/i, {timeout: 8000});
  });
});
