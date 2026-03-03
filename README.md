# 🎯 TaskFlow

**Streamlined Task & Project Management Platform**

A modern, full-stack task management application with drag-and-drop interface, built with cutting-edge technologies and deployed on serverless infrastructure.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![Tech Stack](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tech Stack](https://img.shields.io/badge/Node.js-20-green)
![Tech Stack](https://img.shields.io/badge/MongoDB-7-green)
![Tech Stack](https://img.shields.io/badge/AWS-Lambda-orange)

## 🌐 Live Demo

- **Frontend (Live)**: 
- **Demo Account**: 
  - Email: `demo@example.com` 
  - Password: `Demo@123456`

## 💡 Problem Statement

Individuals and teams need a fast, intuitive space to manage tasks and organize projects. Traditional apps are often complex, expensive, or require extensive setup.

## 🎯 Solution

TaskFlow is a Kanban-style task management application that allows users to create boards, organize tasks into lists, and use drag-and-drop to manage their workflow efficiently. Built with modern web technologies and deployed on serverless infrastructure for scalability and cost-effectiveness.

## ✨ Key Features

### Core Functionality
- 📋 **Board Management** - Create unlimited boards with custom colors
- 📝 **List & Task Organization** - Organize tasks into customizable lists
- 🖱️ **Drag & Drop** - Intuitive task reorganization with smooth animations
- 🔍 **Task Details** - Rich task information including descriptions, priorities, and status
- ✅ **Task Completion** - Track progress with completion status

### Advanced Features
- 🔐 **JWT Authentication** - Secure user authentication with encrypted passwords
- 🎨 **Priority Levels** - Mark tasks as low, medium, or high priority
- 💬 **Rich Task Details** - Add descriptions and organize information
- 🎯 **Optimistic UI** - Instant UI updates for better UX
- ☁️ **Serverless Architecture** - Deployed on AWS Lambda for auto-scaling

### ToDo
- 👤 **Role-Based Access** - Admin, Editor, and Viewer roles
- 📅 **Due Dates** - Set deadlines for tasks

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **Styling**: SASS/SCSS with custom design system
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Drag & Drop**: @dnd-kit
- **Notifications**: react-hot-toast
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, CORS
- **Validation**: express-validator
- **Deployment**: AWS Lambda + API Gateway (serverless)

## 🏗️ System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │   Browser   │         │   Browser   │
│   (React)   │         │   (React)   │         │   (React)   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │              HTTP (REST API)                   │
       │                       │                        │
       └───────────────────────┼────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   AWS API Gateway   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    AWS Lambda       │
                    │  (Express Server)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MongoDB Atlas     │
                    │  (Boards/Lists/     │
                    │   Tasks/Users)      │
                    └─────────────────────┘
```

### API Layer
- RESTful APIs for CRUD operations
- JWT-based authentication middleware
- Express-validator for request validation
- Error handling middleware

### Database Schema
```
User → Board (owner) → Lists → Tasks
       ↓
     Members (many-to-many)
```

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5000
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

App will be running at `http://localhost:4000`

## 🚀 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Board**: Click "Create new board" to start
3. **Add Lists**: Create lists to organize your tasks (e.g., "To Do", "In Progress", "Done")
4. **Create Tasks**: Add tasks to your lists with descriptions and priorities
5. **Drag & Drop**: Drag tasks between lists or reorder them
6. **Track Progress**: Mark tasks as complete with the quick-complete button

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board by ID
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add member to board

### Lists
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/reorder` - Reorder lists

### Tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/move` - Move task
- `POST /api/tasks/reorder` - Reorder tasks


## 📝 Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Trello and Notion
- Built with modern web technologies
- Designed for scalability and performance

