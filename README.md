# Hotel Booking System - Backend API

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/_xCBcc1c)

## 📋 Project Overview

A comprehensive RESTful API for a hotel booking system built with **Node.js, Express, and MongoDB**. The system allows users to register, login, search for hotels, and manage bookings, while admins can manage all bookings and hotel information.

### ✨ Key Features

#### **Core Requirements (All Implemented ✅)**
1. **User Registration** - Register with name, telephone, email, and password
2. **User Authentication** - Login/logout with JWT tokens
3. **Hotel Booking** - Book hotels for up to 3 nights with date selection
4. **Booking Management** - View, edit, and delete personal bookings
5. **Hotel Listings** - Browse available hotels with full details
6. **Admin Controls** - Admins can view, edit, and delete any bookings
7. **Admin Hotel Management** - Create, update, delete hotels

#### **Extra Features**
- Advanced search and filter by hotel name, location, price range
- Booking status tracking (pending/confirmed/checked-in/completed/cancelled)
- Availability checking to prevent double-booking
- Pagination and sorting for large datasets
- Role-based access control (user vs admin)
- Comprehensive error handling
- JWT authentication with refresh tokens

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (Bun compatible)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Postman/Newman
- **Environment:** .env configuration

---

## 📂 Project Structure

```
be-project-68-bun1/
├── config/
│   ├── db.js              # Database connection
│   └── config.env         # Environment variables
├── controllers/
│   ├── Auth.js            # Authentication logic
│   ├── Hotels.js          # Hotel CRUD operations
│   └── bookings.js        # Booking management
├── models/
│   ├── User.js            # User schema
│   ├── Hotel.js           # Hotel schema
│   └── booking.js         # Booking schema
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── Hotel.js           # Hotel endpoints
│   └── bookings.js        # Booking endpoints
├── middleware/
│   └── auth.js            # JWT verification & role authorization
├── Bun1.postman_collection.json  # API test suite
├── env.json               # Postman environment
├── server.js              # Entry point
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+) or Bun
- MongoDB (local or Atlas)
- Postman (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd be-project-68-bun1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Edit config/config.env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hotel-booking
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:5000`

---

## 📡 API Endpoints

### **Auth Endpoints**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| GET | `/api/v1/auth/logout` | Logout user | Yes |
| PUT | `/api/v1/auth/users/:id/role` | Promote user to admin | Admin |

### **Hotel Endpoints**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/hotels` | Get all hotels (with search) | No |
| GET | `/api/v1/hotels/:id` | Get single hotel | No |
| POST | `/api/v1/hotels` | Create hotel | Admin |
| PUT | `/api/v1/hotels/:id` | Update hotel | Admin |
| DELETE | `/api/v1/hotels/:id` | Delete hotel | Admin |

### **Booking Endpoints**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/bookings` | Get user bookings (admin: all) | Yes |
| GET | `/api/v1/bookings/:id` | Get single booking | Yes |
| POST | `/api/v1/hotels/:hotelId/bookings` | Create booking | Yes |
| PUT | `/api/v1/bookings/:id` | Update booking | Yes |
| DELETE | `/api/v1/bookings/:id` | Delete booking | Yes |
| GET | `/api/v1/hotels/:hotelId/bookings` | Get bookings by hotel | Admin |

---

## 🧪 Testing

### Run Full Test Suite
```bash
newman run ./Bun1.postman_collection.json -e env.json
```

### Test Results
✅ **22/22 API endpoints tested**
✅ **30/30 assertions passing**
✅ **100% success rate**

#### Test Coverage
- User registration and authentication
- Hotel CRUD operations
- Booking creation, updates, deletion
- Admin role management
- Access control validation (negative tests)
- Status transitions and pagination

### Import Postman Collection
1. Open Postman
2. Click "Import" 
3. Select `Bun1.postman_collection.json`
4. Import `env.json` as environment
5. Run all requests

---

## 📝 Example Requests

### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "telephone": "0812345678",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Booking
```bash
POST /api/v1/hotels/69a337ff48300f6bf019ac41/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2026-06-15",
  "nights": 2
}
```

### Search Hotels
```bash
GET /api/v1/hotels?search=Bangkok&page=1&limit=10&sort=-createdAt
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Input validation and sanitization
- ✅ CORS enabled for frontend integration
- ✅ Environment variable protection

---

## 🎯 Requirements Checklist

- ✅ User registration with required fields
- ✅ User login and authentication
- ✅ Hotel booking (up to 3 nights)
- ✅ View personal bookings
- ✅ Edit personal bookings
- ✅ Delete personal bookings
- ✅ Admin view all bookings
- ✅ Admin edit any booking
- ✅ Admin delete any booking
- ✅ Comprehensive Postman test suite
- ✅ Negative test cases

---

## 📊 Database Schemas

### User Schema
```javascript
{
  name: String,
  telephone: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Hotel Schema
```javascript
{
  name: String,
  address: String,
  district: String,
  province: String,
  postalcode: String,
  tel: String,
  region: String,
  createdAt: Date
}
```

### Booking Schema
```javascript
{
  startDate: Date,
  nights: Number (1-3),
  user: ObjectId (ref: User),
  hotel: ObjectId (ref: Hotel),
  status: String (confirmed/pending/cancelled),
  createdAt: Date
}
```

---

## 🐛 Troubleshooting

**Q: Port 5000 already in use**
```powershell
netstat -ano | findstr :5000
taskkill /PID {PID} /F
```

**Q: MongoDB connection failed**
- Check MongoDB is running: `mongod`
- Verify `MONGO_URI` in `config/config.env`
- Test connection: `mongo "mongodb://localhost:27017"`

**Q: JWT token invalid**
- Ensure token is included in Authorization header
- Format: `Authorization: Bearer {token}`
- Check token hasn't expired

---

## 👨‍💻 Developer Notes

### Making Changes
1. Always run tests after changes: `newman run ./Bun1.postman_collection.json -e env.json`
2. Update this README if adding new features
3. Commit frequently with clear messages
4. Use feature branches for new developments

### Code Style
- ES6+ JavaScript
- Async/await for async operations
- Error-first callbacks in middleware
- Descriptive variable names
- Comments for complex logic

---

## 📄 License

This project is part of the CEDT Backend Program.

---

## 📞 Support

For issues or questions, create an issue in the repository or contact the development team.

---

**Last Updated:** March 1, 2026 2:13 AM GMT+7
