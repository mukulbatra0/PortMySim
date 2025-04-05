# PortMySim Backend Setup Guide

This guide will help you set up the PortMySim backend with all the required data.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Clone the repository (if not already done)
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Environment Setup

1. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/portmysim
   NODE_ENV=development
   ```
   
   Adjust the `MONGODB_URI` if you're using a different MongoDB connection string.

## Database Seeding

The application requires initial data for telecom plans, FAQs, and telecom circles. We've provided scripts to seed this data into your database.

### Seed All Data at Once

To seed all data at once, run:

```
npm run seed
```

This command will:
1. Clear existing data in each collection
2. Import all plans from `data/plans.js`
3. Import all FAQs from `data/faqs.js`
4. Import all telecom circles from `data/telecomCircles.js`

### Seed Individual Collections

If you prefer to seed collections individually:

- For plans only:
  ```
  npm run seed:plans
  ```

- For FAQs only:
  ```
  npm run seed:faqs
  ```

- For telecom circles only:
  ```
  npm run seed:circles
  ```

## Starting the Server

1. Start the development server:
   ```
   npm run dev
   ```

2. The server will start on port 5000 (or the port specified in your .env file)

## Verification

To verify that everything is working:

1. Open your browser and navigate to:
   ```
   http://localhost:5000/api/plans
   ```
   You should see a JSON response with all the plans.

2. Check the FAQs endpoint:
   ```
   http://localhost:5000/api/faqs
   ```
   
3. Check the telecom circles endpoint:
   ```
   http://localhost:5000/api/telecom-circles
   ```

## Troubleshooting

- If you encounter any MongoDB connection issues, verify your connection string and make sure MongoDB is running.
- If seeding fails, check the MongoDB connection and ensure there are no validation errors in the data files.
- For any other issues, check the console logs for specific error messages. 