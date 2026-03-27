# PortMySim - Mobile Number Portability Platform

A comprehensive web application for mobile plan comparison and number portability services.

## 🚀 Features

- **Plan Comparison**: Compare mobile plans from different operators (Jio, Airtel, Vi, BSNL)
- **Network Coverage**: Check network coverage in different locations
- **Porting Requests**: Submit and track mobile number porting requests
- **User Authentication**: Secure login and registration system
- **Real-time Notifications**: SMS and email notifications for porting status
- **FAQ & Support**: Comprehensive help center and FAQ section

## 📋 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with modern UI/UX
- Font Awesome icons
- Google Fonts

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- RESTful API architecture

### Services
- Twilio (SMS notifications)
- Fast2SMS (Indian SMS)
- Nodemailer (Email notifications)
- Node-cron (Scheduled jobs)

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portmysim
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/portmysim
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=30d
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

7. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

8. **Open the application**
   - Open `HTML/index.html` in your browser
   - Or use a local server: `npx http-server -p 8080`
   - Visit: `http://localhost:8080/HTML/index.html`

## 🚂 Railway Deployment

For detailed Railway deployment instructions, see [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)

### Quick Deploy to Railway

1. Push your code to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add MongoDB database
5. Configure environment variables
6. Deploy automatically!

## 📁 Project Structure

```
portmysim/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── data/           # Seed data
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── scripts/        # Database seeding scripts
│   ├── utils/          # Utility functions
│   ├── server.js       # Express server
│   └── package.json
├── CSS/                # Stylesheets
├── HTML/               # HTML pages
├── JS/                 # Frontend JavaScript
├── images/             # Images and assets
├── Procfile           # Railway start command
├── nixpacks.toml      # Railway build config
└── README.md
```

## 🔑 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time

### Optional (for full functionality)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email service
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Twilio SMS
- `FAST2SMS_API_KEY` - Fast2SMS service
- Various telecom provider API keys (see `.env.example`)

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email

### Plans
- `GET /api/plans` - Get all plans (with filters)
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans/compare` - Compare multiple plans

### Porting
- `POST /api/porting/request` - Submit porting request
- `GET /api/porting/status/:id` - Get porting status
- `GET /api/porting/user-requests` - Get user's requests

### Network Coverage
- `GET /api/network-coverage` - Get coverage data
- `GET /api/network-coverage/locations` - Get available locations

For complete API documentation, see [backend/README.md](./backend/README.md)

## 🧪 Testing

```bash
# Test backend API
cd backend
npm test

# Test specific endpoints
curl http://localhost:5000/api/health/check
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### API Not Responding
- Check if backend server is running
- Verify port 5000 is not in use
- Check console for error messages

### Frontend Can't Connect
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API URLs in `JS/config.js`

## 📝 Available Scripts

### Root Level
- `npm start` - Start backend server
- `npm run backend` - Start backend server
- `npm run backend:setup` - Install backend dependencies

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed all data
- `npm run seed:plans` - Seed plans only
- `npm run seed:faqs` - Seed FAQs only
- `npm run seed:circles` - Seed telecom circles

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Railway for hosting platform
- MongoDB Atlas for database hosting

## 📞 Support

For support, email support@portmysim.com or create an issue in the repository.

## 🔗 Links

- [Live Demo](https://your-app.railway.app)
- [Documentation](./RAILWAY_DEPLOYMENT_GUIDE.md)
- [API Docs](./backend/README.md)
- [Railway](https://railway.app)

---

Made with ❤️ by PortMySim Team
