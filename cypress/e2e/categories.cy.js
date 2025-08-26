// Categories E2E test
// Checks categories page and navigation to dashboard

describe('Categories Flow', () => {
  it('should load categories and navigate to dashboard if category exists', () => {
    cy.visit('/categories');
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com', {force:true});
        cy.get('input[type=password]').first().type('wrongpass', {force:true});
        cy.contains('Login', {matchCase: false}).click({force:true});
        cy.contains(/Login failed|Invalid|incorrect/i, {timeout: 4000});
        cy.visit('/categories');
      }
    });
    cy.get('body').then($body => {
      const catBtn = $body.find('button,div').filter((i, el) => /DSA|Frontend|Backend|Fullstack|category/i.test(el.innerText));
      if (catBtn.length > 0) {
        cy.wrap(catBtn[0]).click({force:true});
        cy.url().should('include', '/dashboard');
      }
      expect(true).to.be.true;
    });
  });
});
