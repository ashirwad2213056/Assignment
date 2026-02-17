# Event Management Application - Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Quick Setup
1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment:
   - Backend uses `.env` file (already created)
   - Default MongoDB: `mongodb://localhost:27017/event-management`

4. Start MongoDB (if using local):
   ```bash
   mongod
   ```

5. Start backend (from backend folder):
   ```bash
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

6. Start frontend (from root, new terminal):
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

## 📦 Available Scripts

### Frontend
- `npm run dev` - Start dev server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start server (production)
- `npm run dev` - Start with nodemon (auto-reload)

## 🗂️ Project Structure

```
Event Management Application/
├── backend/              # Express + MongoDB backend
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Main server file
├── src/                 # React frontend
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   └── utils/          # Helper functions
└── public/             # Static assets
```

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Health
- `GET /health` - Server health check

## 💾 Database Models

### Event Schema
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
  status: String (enum: upcoming, ongoing, completed, cancelled)
}
```

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum: user, organizer, admin),
  registeredEvents: [Event],
  createdEvents: [Event]
}
```

## 🎨 Frontend Technologies

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Custom Components** - Button, Card, Input, Loading

### Using Components
```jsx
import Button from './components/Button';
import Card from './components/Card';
import Input from './components/Input';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Card padding="lg" hover={true}>
  Card Content
</Card>

<Input 
  label="Email" 
  type="email" 
  value={email} 
  onChange={handleChange}
  required={true}
/>
```

## 🛠️ Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **API Proxy**: Vite proxies `/api` requests to backend
3. **CORS**: Backend has CORS enabled for development
4. **MongoDB**: Make sure MongoDB is running before starting backend

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists in backend folder
- Check if port 5000 is available

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify proxy settings in `vite.config.js`

### Tailwind styles not working
- Run `npm install` to install dependencies
- Check if PostCSS config exists
- Restart dev server

## 📝 Next Steps

1. Create event listing page
2. Add event creation form
3. Implement user authentication
4. Add event registration functionality
5. Create event detail page
6. Add image upload
7. Implement search and filters
8. Add notifications

## 📚 Useful Resources

- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)
