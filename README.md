# PortMySim

PortMySim is a web application that helps users compare and choose mobile plans from different operators, and facilitates the mobile number portability process.

## Project Structure

- `/HTML` - HTML files for the front-end
- `/CSS` - CSS stylesheets
- `/JS` - JavaScript files for the front-end
- `/images` - Image assets
- `/backend` - Backend API server (Node.js/Express)

## Getting Started

### Frontend

The frontend is a static site that can be opened directly in a browser:

1. Open `HTML/index.html` in your browser
2. Navigate to `HTML/plans.html` to see the plans comparison page

### Backend

The backend requires Node.js and MongoDB:

1. Install MongoDB if not already installed
2. Set up environment variables:
   ```
   cd backend
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

3. Install dependencies and set up the database:
   ```
   npm run backend:setup
   ```

4. Start the backend server:
   ```
   npm run backend
   ```

## Development

### Plans Comparison API

The Plans Comparison backend API lets users:

- Browse mobile plans from different operators
- Filter plans by various criteria
- Compare multiple plans side by side
- See value scores and recommendations

For detailed documentation on the backend, see the [backend README](./backend/README.md).

### Frontend Features

- Responsive design for all device sizes
- Interactive plan comparison interface
- Animated UI elements
- Mobile-friendly navigation

## License

All rights reserved. This project is proprietary.