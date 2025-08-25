// Registration E2E test
// Covers registration form, OTP, and navigation

describe('Registration Flow', () => {
  it('should show registration page and validate form', () => {
    cy.visit('/register');
    cy.get('input[placeholder="John"]').type('TestUser', {force:true});
    cy.get('input[placeholder="Doe"]').type('Test', {force:true});
    cy.get('input[type=email]').first().type('testuser'+Date.now()+'@example.com', {force:true});
    cy.get('input[placeholder*="API Key"]').type('testapikey1234567890', {force:true});
    cy.get('input[type=password]').eq(0).type('TestPassword123!', {force:true});
    cy.get('input[type=password]').eq(1).type('TestPassword123!', {force:true});
    cy.contains('Register').click({force:true});
    cy.contains(/OTP|success|verify/i, {timeout: 8000});
  });
});
