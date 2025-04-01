# PortMySim Backend API

Backend API for PortMySim - Mobile number porting service

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/portmysim
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRE=30d
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Start the production server:
   ```
   npm start
   ```

5. Seed the database with sample data:
   ```
   npm run data:import
   ```

6. Delete all data from the database:
   ```
   npm run data:destroy
   ```

## Implementation Steps

1. ✅ Basic Setup: Create the project structure, install dependencies, setup express server
2. ✅ Database Setup: Configure MongoDB connection, create models, seed data
3. ✅ Authentication: Implement JWT authentication, user registration, login, and password reset
4. ⬜ User Management: Implement user profile management, admin features
5. ⬜ Porting Services: Implement porting request submission and tracking
6. ⬜ Plan Management: Implement plan comparison and selection
7. ⬜ Contact & Support: Implement contact forms and FAQ system
8. ⬜ Testing & Documentation: Complete API testing and documentation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get token
- `GET /api/auth/me` - Get current logged in user (Protected)
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:resetToken` - Reset password with token

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Porting
- `POST /api/porting/submit` - Submit a porting request
- `GET /api/porting/requests` - Get all porting requests for a user
- `GET /api/porting/status/:id` - Get status of a specific porting request
- `GET /api/porting/providers` - Get list of service providers
- `GET /api/porting/circles` - Get list of telecom circles

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get a specific plan
- `GET /api/plans/provider/:provider` - Get plans for a specific provider
- `POST /api/plans/compare` - Compare multiple plans

### Contact
- `POST /api/contact/submit` - Submit a contact form
- `POST /api/contact/support` - Create a support ticket
- `GET /api/contact/support` - Get all support tickets for a user
- `GET /api/contact/faqs` - Get all FAQs

## Authentication

The API uses JWT (JSON Web Token) for authentication. When a user registers or logs in, the server returns a token. This token must be included in the Authorization header for protected routes:

```
Authorization: Bearer <token>
```

- Public routes: No authentication required
- Protected routes: Valid JWT token required in Authorization header
- Admin routes: Valid JWT token with admin role required 