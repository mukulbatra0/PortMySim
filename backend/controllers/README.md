# Controllers

This directory contains all the controller functions for the PortMySim API.

## Authentication Controllers

The `auth.controller.js` file implements:

- User registration
- User login with JWT token generation
- User profile retrieval
- Password reset functionality (forgot password and reset password)

All authentication endpoints use JWT (JSON Web Tokens) for secure authentication.

## User Controllers

The `users.controller.js` file implements:

- Getting all users (admin only)
- Getting a single user by ID (admin only)
- Updating user information (protected - users can only update their own profile unless they're admin)
- Deleting a user (admin only)

## Authentication Flow

1. User registers or logs in
2. Server issues a JWT token
3. Client includes token in Authorization header for protected routes
4. Server verifies token validity using auth middleware
5. If token is valid, the request is processed; otherwise, an error is returned

## Password Reset Flow

1. User requests password reset by providing email
2. Server generates a reset token and would typically send it via email
3. User submits new password along with the reset token
4. Server verifies token and updates the password

## Authorization Levels

- **Public routes**: No authentication required
- **Protected routes**: Valid JWT token required
- **Admin routes**: Valid JWT token with admin role required 