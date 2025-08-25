// Password Reset E2E test
// Checks forgot password flow

describe('Password Reset Flow', () => {
  it('should show forgot password and handle reset', () => {
    cy.visit('/login');
    cy.contains(/forgot password|reset/i).click({force:true});
    cy.get('input[placeholder*="email"]').first().type('testuser@example.com');
    cy.contains(/send otp|send code|send/i).click({force:true});
    cy.contains(/otp|code|verify/i);
  });
});
