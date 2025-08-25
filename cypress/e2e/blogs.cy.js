// Blogs E2E test
// Checks blogs list, single blog, and navigation

describe('Blogs Flow', () => {
  it('should load blogs and open a single blog page', () => {
    cy.visit('/blogs');
    cy.contains(/blog/i);
    cy.get('a,button').contains(/read|view|blog/i, { matchCase: false }).first().click({force:true});
    cy.url().should('include', '/blog');
    cy.contains(/comment|like|share/i);
  });
});
