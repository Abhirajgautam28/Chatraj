// Blogs E2E test
// Checks blogs list, single blog, and navigation

describe('Blogs Flow', () => {
  it('should load blogs and open a single blog page if available', () => {
    cy.visit('/blogs');
    cy.contains('Blog Posts').should('exist');
    cy.get('.blog-card-animated').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards[0]).click();
        cy.url().should('match', /\/blogs\//);
        cy.get('h2, h1').should('exist');
      } else {
        cy.log('No blogs available to test single blog page.');
      }
    });
  });
});
