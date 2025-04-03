# Plans Comparison API

This document provides instructions for setting up and using the Plans Comparison API backend for PortMySim.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Frontend Integration](#frontend-integration)
- [Development](#development)

## Overview

The Plans Comparison API provides functionality to:

- Retrieve, filter, and compare mobile plans from different operators
- Calculate value scores and determine the best features for comparison
- Support dynamic filtering by operator, plan type, data usage, price, and validity

## Setup

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Make sure MongoDB is running
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/portmysim
   PORT=5000
   NODE_ENV=development
   ```

4. Run the setup script:
   ```bash
   npm run setup-plans
   ```
   This will:
   - Create necessary directories if they don't exist
   - Seed the database with initial plan data
   - Test the API endpoints

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Plan Operations

- `GET /api/plans` - Get all plans with optional filtering
  - Query params: operator, plan_type, data_category, price_category, validity_category
  - Example: `/api/plans?operator=jio&data_category=high`

- `GET /api/plans/:id` - Get a specific plan by ID

- `GET /api/operators/:operator/plans` - Get all plans for a specific operator

- `GET /api/plans/recommended` - Get recommended plans

- `POST /api/plans/compare` - Compare multiple plans
  - Body: `{ "planIds": ["id1", "id2", "id3"] }`

### Admin Operations

- `POST /api/plans` - Create a new plan
- `PUT /api/plans/:id` - Update an existing plan
- `DELETE /api/plans/:id` - Delete a plan

## Data Model

The Plan schema includes:

```javascript
{
  operator: String,         // jio, airtel, vi, bsnl
  name: String,             // Plan name
  price: Number,            // Plan price
  data: String,             // Data amount (e.g., "2GB/day")
  data_value: Number,       // Numeric value for comparison
  validity: Number,         // Validity in days
  voice_calls: String,      // Voice call details
  sms: String,              // SMS details
  has_5g: Boolean,          // Whether 5G is supported
  subscriptions: [String],  // Bundled subscriptions
  network_coverage: Number, // Coverage percentage
  data_speed: Number,       // Speed in Mbps
  extra_benefits: [String], // Additional benefits
  plan_type: String,        // prepaid/postpaid
  data_category: String,    // low/medium/high
  price_category: String,   // budget/mid/premium
  validity_category: String,// monthly/quarterly/annual
  image: String,            // URL to operator logo
  recommendation: String    // Best Value, Budget Choice, etc.
}
```

## Frontend Integration

The frontend is already integrated with the API in the `../JS/plans.js` file, which:

1. Loads plans from the API
2. Enables filtering based on user selections
3. Supports adding plans to a comparison cart
4. Fetches comparison data when the user clicks "Compare Plans"
5. Dynamically updates the comparison table with API results

## Development

### Seeding the Database

To reset the database with fresh plan data:

```bash
npm run seed
```

### Adding New Plan Features

To add new plan features:

1. Update the Plan schema in `models/Plan.js`
2. Add handling in the controller methods in `controllers/planController.js`
3. Update the comparison logic in the `comparePlans` method of the Plan model
4. Update the frontend to display the new features

### Handling New Operators

To add support for new operators:

1. Update the `operator` enum in the Plan schema
2. Add operator image to the images directory
3. Update the `getOperatorImage` function in `utils/planHelper.js`
4. Add sample plans for the new operator in `scripts/seedPlans.js` 