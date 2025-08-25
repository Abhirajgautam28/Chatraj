// Blogs E2E test
// Checks blogs list, single blog, and navigation

describe('Blogs Flow', () => {
  it('should load blogs and open a single blog page if available', () => {
    cy.visit('/blogs');
    // If redirected to login, login first
    cy.url().then(url => {
      if (url.includes('/login')) {
        cy.get('input[type=email]').first().type('fake@example.com');
        cy.get('input[type=password]').first().type('wrongpass');
        cy.contains('Login').click();
        cy.contains('Login failed').should('exist');
        cy.visit('/blogs');
      }
    });
    cy.contains('Blog Posts', {timeout: 8000});
    cy.get('.blog-card-animated').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards[0]).find('a').first().click({force:true});
        cy.url().should('include', '/blogs/');
        cy.contains(/By|Author|Comment/i);
      } else {
        cy.contains(/No blogs|not found|create/i, { matchCase: false });
      }
    });
  });
});
