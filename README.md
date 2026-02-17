# Event Management Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing events.

## 📁 Folder Structure

```
Event Management Application/
│
├── backend/                      # Backend (Express + MongoDB)
│   ├── models/                   # MongoDB models/schemas
│   │   ├── Event.js             # Event model
│   │   └── User.js              # User model
│   │
│   ├── routes/                   # API routes
│   │   ├── eventRoutes.js       # Event CRUD operations
│   │   └── userRoutes.js        # User CRUD operations
│   │
│   ├── .env                      # Environment variables (not committed)
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Git ignore file
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main Express server
│
├── src/                          # Frontend (React)
│   ├── components/              # Reusable React components
│   ├── pages/                   # Page components
│   ├── services/                # API service functions
│   ├── utils/                   # Utility functions
│   ├── App.jsx                  # Main App component
│   ├── index.css                # Global styles + Tailwind
│   └── main.jsx                 # React entry point
│
├── public/                       # Static assets
│
├── .gitignore                   # Frontend git ignore
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file

```

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
# From root directory
npm install
```

### 3. Configure Environment Variables
```bash
cd backend
# Copy .env.example to .env and update values
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS/Linux
mongod
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### 6. Start Frontend (in a new terminal)
```bash
# From root directory
npm run dev
```
Frontend will run on `http://localhost:3000`

## 🔌 API Endpoints

### Health & Status
- `GET /api` - Welcome message
- `GET /api/health` - Health check

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 Features

- **Event Management**: Create, read, update, and delete events
- **User Management**: Manage users and their profiles
- **Beautiful UI**: Modern design with Tailwind CSS
- **API Integration**: Frontend communicates with backend via REST API
- **MongoDB Integration**: Data persistence with MongoDB
- **Responsive Design**: Works on all device sizes
- **Real-time Status**: Frontend shows backend connection status

## 📝 Models

### Event Model
```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  location: String (required),
  category: String (enum),
  capacity: Number,
  attendees: [User],
  organizer: User (required),
  image: String,
  status: String (enum)
}
```

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum),
  registeredEvents: [Event],
  createdEvents: [Event]
}
```

## 🛠️ Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm start` - Start server (production)
- `npm run dev` - Start server with nodemon (development)

## 📂 Next Steps

1. ✅ Backend setup complete
2. ✅ MongoDB connection configured
3. ✅ Basic API routes created
4. ✅ Frontend setup with React + Tailwind
5. ✅ Folder structure organized

### Recommended Next Steps:
- Add authentication (JWT)
- Create React components for event listing
- Add form validation
- Implement user registration/login
- Add image upload functionality
- Create responsive navigation
- Add error handling and loading states

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🚀 Deployment on Vercel

The project is configured for easy deployment on [Vercel](https://vercel.com).

1.  **Push to GitHub**: Ensure your latest code is on GitHub.
2.  **Import Project**: Go to Vercel Dashboard -> Add New -> Project -> Import from GitHub.
3.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: Add the following (copy values from your `backend/.env`):
        *   `MONGODB_URI`: Your MongoDB connection string.
        *   `JWT_SECRET`: Your secret key.
        *   `NODE_ENV`: `production`
4.  **Deploy**: Click Deploy.

The `vercel.json` file automatically configures the backend as a serverless function available at `/api/...`.
