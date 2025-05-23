# Plans Comparison API

This document provides instructions for setting up and using the Plans Comparison API backend for PortMySim.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Frontend Integration](#frontend-integration)
- [Development](#development)
- [Network Coverage API](#network-coverage-api)

## Overview

The Plans Comparison API provides functionality to:

- Retrieve, filter, and compare mobile plans from different operators
- Calculate value scores and determine the best features for comparison
- Support dynamic filtering by operator, plan type, data usage, price, and validity

## Setup

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas) - Required for all functionality

### Installation

1. Make sure MongoDB is running (required - the application no longer supports in-memory fallbacks)
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
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
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

### Database Configuration

The application requires a MongoDB connection to function. The database connection has been improved with:

- Connection pooling optimization (50 max pool size, 5 min pool size)
- Extended timeouts for better stability
- Exponential backoff for connection retries
- Proper error handling and reporting
- Automatic reconnection handling

If the MongoDB connection fails after multiple retry attempts, the application will exit with an error code instead of falling back to in-memory storage.

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

### SMS and Notification System

The backend includes a robust SMS and notification system that supports multiple delivery channels:

#### SMS Providers

1. **Twilio** - Used for international numbers
   - Fully integrated with scheduling and templating support
   - Requires valid Twilio credentials in the `.env` file
   
2. **Fast2SMS** - Used for Indian numbers
   - Supports DLT-registered templates for regulatory compliance
   - Fallback to direct messaging when templates are unavailable
   
3. **Automated Fallback** - System automatically selects the appropriate provider based on phone number

#### Notification Channels

- **SMS** - Text messages sent to mobile phones
- **Email** - Email notifications with HTML formatting
- **App** - In-app notifications for mobile app users

#### Features

- **Templating** - Uses dynamic templates with variable substitution
- **Scheduling** - Notifications can be scheduled for future delivery
- **Automatic Processing** - Background scheduler processes notifications at regular intervals
- **Error Handling** - Failed notifications are logged and can be retried
- **Queuing** - Notifications are stored in MongoDB until successfully sent
- **Fallback** - If one provider fails, system can use alternative methods

#### Configuration

SMS provider settings must be configured in your `.env` file. See `.env.example` for required fields.

To change the notification processing interval, set the `NOTIFICATION_INTERVAL_MINUTES` environment variable.

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

## Network Coverage API

The Network Coverage API provides data for comparing mobile network operators in different locations across India.

### Endpoints

1. **Get Locations with Coverage Data**
   - `GET /api/network-coverage/locations`
   - Returns a list of locations for which network coverage data is available

2. **Get Network Coverage for a Location**
   - `GET /api/network-coverage?location=Mumbai&operator=jio`
   - Returns coverage data for all operators in the specified location
   - Optional: Filter by operator

3. **Compare Networks for a Location**
   - `GET /api/network-coverage/compare?location=Delhi`
   - Returns comparative data for all operators in the specified location

4. **Get Best Network for a Location**
   - `GET /api/network-coverage/best-network?location=Bangalore&criteria=speed`
   - Returns the best network for the specified location based on criteria
   - Supported criteria: overall, coverage, speed, callQuality, indoorReception

5. **Get Tower Data Near Coordinates**
   - `GET /api/network-coverage/tower-data?lat=28.7041&lng=77.1025&radius=5`
   - Returns tower data for all operators near the specified coordinates
   - radius parameter is in kilometers (default: 5)

### Data Seeding

To populate the database with sample network coverage data:

```bash
# Run from the backend directory
node scripts/seedNetworkCoverage.js
```

This will create sample coverage data for major cities across India with realistic values for each operator.

### Network Coverage Model

The `NetworkCoverage` model stores the following data:

- `location`: Name of the location
- `locationCoordinates`: Geospatial coordinates (longitude, latitude)
- `operator`: Network operator (jio, airtel, vi)
- `technologyType`: Network technology (4g, 5g)
- `signalStrength`: Signal strength (0-100)
- `downloadSpeed`: Download speed in Mbps
- `uploadSpeed`: Upload speed in Mbps
- `callQuality`: Voice call quality rating (1-5)
- `indoorReception`: Indoor signal reception rating (1-5) 