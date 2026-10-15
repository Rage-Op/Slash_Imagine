# /Imagine - Image Sharing Social Feed

A modern image-sharing social platform built with React 18 + Vite (frontend) and Node.js/Express + MongoDB (backend).

## Features

- **User Authentication**: Sign up, sign in, and secure JWT-based authentication
- **Post Management**: Create posts with images/videos, like, comment, and share
- **User Profiles**: Customizable profiles with avatar upload
- **Social Features**: Like posts, comment on posts, delete your own content
- **Admin Panel**: User management and role assignment (Admin only)
- **Settings**: Update profile, change password, email, phone, and date of birth

## Prerequisites

- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd slash_imagine
```

### 2. Set up environment variables

**Backend** (`/backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values:
# - MONGO_URL: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL: Initial admin credentials
```

**Frontend** (`/frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed (defaults work for local development)
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start the development servers

**Backend** (runs on port 3001):
```bash
cd backend
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

### 5. Access the application

Open http://localhost:5173 in your browser.

## Project Structure

```
/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Auth and validation middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── public/assets/       # Uploaded files (avatars, post media)
│   └── __tests__/           # Backend tests
│
├── frontend/                # React 18 + Vite application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Shadcn/UI components
│   │   │   ├── form/        # Form components
│   │   │   └── pageComponents/  # Page-specific components
│   │   ├── pages/           # Route pages
│   │   ├── schemas/         # Zod validation schemas
│   │   └── state/           # Redux state management
│   └── public/              # Static assets
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /slash_imagine/api/v1/auth/signup` - Create account
- `POST /slash_imagine/api/v1/auth/signin` - Login
- `POST /slash_imagine/api/v1/auth/change-password` - Change password
- `POST /slash_imagine/api/v1/auth/change-email` - Change email
- `POST /slash_imagine/api/v1/auth/change-contact-number` - Change phone
- `POST /slash_imagine/api/v1/auth/change-name` - Change name
- `POST /slash_imagine/api/v1/auth/change-dob` - Change date of birth

### Posts
- `GET /slash_imagine/api/v1/user/get-home-feed` - Get paginated feed
- `POST /slash_imagine/api/v1/posts/add-post` - Create post (with file upload)
- `GET /slash_imagine/api/v1/posts/get-post/:postId` - Get single post
- `POST /slash_imagine/api/v1/posts/add-like` - Like a post
- `POST /slash_imagine/api/v1/posts/remove-like` - Unlike a post
- `POST /slash_imagine/api/v1/posts/add-comment` - Add comment
- `DELETE /slash_imagine/api/v1/posts/delete-comment` - Delete comment
- `DELETE /slash_imagine/api/v1/posts/delete-post` - Delete post

### Users
- `POST /slash_imagine/api/v1/user/get-user` - Get user profile
- `POST /slash_imagine/api/v1/user/change-avatar` - Upload avatar
- `POST /slash_imagine/api/v1/user/change-country` - Change country
- `GET /slash_imagine/api/v1/user/list-users` - List users (admin only)
- `POST /slash_imagine/api/v1/user/change-role` - Change user role (admin only)

## Running Tests

```bash
cd backend
npm test
```

## Tech Stack

### Frontend
- React 18
- Vite
- Redux Toolkit + Redux Persist
- React Router v6
- Tailwind CSS
- Shadcn/UI components
- Axios
- Zod (validation)
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

## Security Notes

- JWT tokens expire after 30 days
- Passwords are hashed with bcrypt
- Private user data (email, phone, DOB) is only visible to the account owner
- File uploads are restricted by type and size
- Admin-only endpoints are protected by role middleware

## License

ISC
