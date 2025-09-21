describe('Login Flow', () => {
	it('should show login page and fail with wrong credentials', () => {
		cy.visit('/login');
		cy.get('input[type=email]').type('fake@example.com');
		cy.get('input[type=password]').type('wrongpass');
		cy.contains('Login').click();
		cy.contains('Login failed. Please check your credentials.');
	});
});
