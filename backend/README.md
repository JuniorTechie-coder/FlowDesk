# Trello Backend

Backend REST API for a Trello-inspired project management application
built using Node.js, Express.js, and PostgreSQL.

This backend is part of a full-stack PERN application and provides APIs
for users, workspaces, boards, lists, and cards.

## 🚀 Features

- User registration and login
- JWT-based authentication
- Protected routes
- CRUD operations for users
- CRUD operations for workspaces
- CRUD operations for boards
- CRUD operations for lists
- CRUD operations for cards
- PostgreSQL database
- CORS configuration
- API testing with Postman

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- REST APIs
- Postman
- Git & GitHub

## 📁 Project Structure

text
trello-backend/
│
├── controllers/
├── middleware/
├── routes/
├── .env
├── .gitignore
├── app.js
├── db.js
├── package.json
└── package-lock.json

## Architecture:

Client
   ↓
Routes
   ↓
Authentication Middleware
   ↓
Controllers
   ↓
PostgreSQL

## 🔐 Authentication:

Authentication is implemented using JWT.

## Registration:

Client
 ↓
POST /api/auth/register
 ↓
authController
 ↓
Password hashing with bcrypt
 ↓
PostgreSQL

## Login:

Client
 ↓
POST /api/auth/login
 ↓
authController
 ↓
Password verification
 ↓
JWT generation
 ↓
Token returned to client


## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get a user by ID |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

### Workspaces

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | Get all workspaces |
| GET | `/api/workspaces/:id` | Get a workspace by ID |
| POST | `/api/workspaces` | Create a workspace |
| PUT | `/api/workspaces/:id` | Update a workspace |
| DELETE | `/api/workspaces/:id` | Delete a workspace |

### Boards

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards/workspace/:id` | Get boards for a workspace |
| GET | `/api/boards/:id` | Get a board by ID |
| POST | `/api/boards` | Create a board |
| PUT | `/api/boards/:id` | Update a board |
| DELETE | `/api/boards/:id` | Delete a board |

### Lists

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lists/board/:id` | Get lists for a board |
| POST | `/api/lists` | Create a list |
| PUT | `/api/lists/:id` | Update a list |
| DELETE | `/api/lists/:id` | Delete a list |

### Cards

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cards/lists/:id` | Get cards for a list |
| GET | `/api/cards/:id` | Get a card by ID |
| POST | `/api/cards` | Create a card |
| PUT | `/api/cards/:id` | Update a card |
| DELETE | `/api/cards/:id` | Delete a card |



| POST | `/api/cards` | Create a card |
| PUT | `/api/cards/:id` | Update a card |
| DELETE | `/api/cards/:id` | Delete a card |

## 🗄️ Core Data Structure

The application is built around the following core entities:

User
 │
 └── Workspaces
       │
       └── Boards
             │
             └── Lists
                   │
                   └── Cards


## ⚙️ Setup

--> Clone the repository:
git clone https://github.com/JuniorTechie-coder/trello-backend.git
cd trello-backend

--> Install dependencies:
npm install

--> Environment Variables:
Create a .env file:

PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

--> Run the server:
node app.js

## 📌 Current Status

--> Completed
 PostgreSQL database
 CRUD APIs
 User registration
 User login
 JWT authentication
 Protected routes
 Postman testing
 CORS configuration
 Authorization

 ## In Progress:
 React frontend integration
 
## 🔮Future Improvements:

Resource-level authorization
Complete React frontend
Drag-and-drop functionality
Improved validation and error handling
Deployment
Automated testing
