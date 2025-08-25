// Registration E2E test
// Covers registration form, OTP, and navigation

describe('Registration Flow', () => {
  it('should show registration page and validate form', () => {
    cy.visit('/register');
    cy.get('input[type=email]').type('testuser'+Date.now()+'@example.com');
    cy.get('input[type=password]').type('TestPassword123!');
    cy.get('input[type=text]').first().type('TestUser');
    cy.contains('Sign up').click();
    // Should show OTP or success message
    cy.contains(/OTP|success|verify/i);
  });
});
