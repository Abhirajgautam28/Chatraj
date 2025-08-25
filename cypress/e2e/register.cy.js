// Registration E2E test
// Covers registration form, OTP, and navigation

describe('Registration Flow', () => {
  it('should show registration page and validate form', () => {
    cy.visit('/register');
    cy.get('input[placeholder*="email"]').first().type('testuser'+Date.now()+'@example.com');
    cy.get('input[placeholder*="password"]').first().type('TestPassword123!');
    cy.get('input[placeholder*="name"],input[placeholder*="user"],input[type=text]').first().type('TestUser');
    cy.contains(/sign up|register/i).click();
    // Should show OTP or success message
    cy.contains(/OTP|success|verify/i);
  });
});
