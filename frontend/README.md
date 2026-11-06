# Trello Frontend

Frontend for a Trello-inspired project management application built using React and Vite.

This frontend connects to a Node.js, Express.js, and PostgreSQL backend through REST APIs and provides an interactive interface for managing workspaces, boards, lists, cards, backlog tasks, and team assignments.

## 🌐 Live Application

**Frontend:**  
https://react-auth-frontend-liart.vercel.app

**Backend API:**  
https://trello-backend-1dsq.onrender.com

## 🚀 Features

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Workspace management
- Board management
- List management
- Card management
- Backlog management
- Assign cards to team members
- Filter cards by assignee
- Move cards between lists
- Move cards between backlog and lists
- Drag-and-drop card management
- Create, edit, and delete lists
- Create, edit, and delete cards
- Team member display
- Team Lead backlog interface
- Multiple board themes
- Loading and error handling
- REST API integration using `fetch`

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend Integration

- Node.js
- Express.js
- PostgreSQL
- REST APIs
- JWT Authentication

### Tools

- Git
- GitHub
- Postman
- VS Code

## 📁 Project Structure

text
react-auth-frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Board.jsx
│   │   └── BoardDetail.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── public/
├── package.json
├── package-lock.json
└── vite.config.js

The token is sent using the Authorization header:

Authorization: Bearer <token>

🔄 Application Data Flow
Login
   ↓
JWT Token
   ↓
Workspace
   ↓
Boards
   ↓
Board Detail
   ↓
Lists
   ↓
Cards
   ↓
Assignment / Backlog / Drag & Drop
   ↓
REST API
   ↓
Express.js Backend
   ↓
PostgreSQL


📋 Main Application Features
Workspaces

Users can access their workspaces and navigate to the boards associated with them.

Boards

Users can:

View boards belonging to a workspace
Create new boards
Open a board to manage its lists and cards
Lists

Users can:

View lists belonging to a board
Create lists
Edit lists
Delete lists
Cards

Users can:

Create cards
Edit cards
Delete cards
Assign cards to team members
Filter cards by assignee
Move cards between lists
View card descriptions and assignment information
Backlog

The application provides a dedicated backlog for tasks that have not yet been placed into a specific list.

Users can:

Create backlog cards
View backlog cards
Assign backlog cards
Move backlog cards into lists
Move cards from lists back into the backlog

The backlog is integrated with the backend through dedicated REST API endpoints.

Drag & Drop

Cards can be moved between lists using drag-and-drop functionality.

Cards can also be moved:

Backlog → List
List → List
List → Backlog

The frontend updates the card's:

list_id
board_id
is_backlog
position

through the backend API.

Team Members

The board interface retrieves team member information from the backend and allows cards to be assigned to specific users.

Cards can be filtered by:

All tasks
My tasks
Unassigned tasks
Specific team member
Board Themes

The board interface supports multiple visual themes.

Available themes include:

Sunset
Magenta
Ocean
Midnight

The selected theme is stored in localStorage.

🔗 Backend API Integration

The frontend communicates with the deployed backend through REST APIs.

Authentication
POST /api/auth/register
POST /api/auth/login
Workspaces
GET    /api/workspaces
GET    /api/workspaces/:id
POST   /api/workspaces
PUT    /api/workspaces/:id
DELETE /api/workspaces/:id
Boards
GET    /api/boards/workspace/:id
GET    /api/boards/:id
POST   /api/boards
PUT    /api/boards/:id
DELETE /api/boards/:id
Lists
GET    /api/lists/board/:id
POST   /api/lists
PUT    /api/lists/:id
DELETE /api/lists/:id
Cards
GET    /api/cards/lists/:id
GET    /api/cards/:id
POST   /api/cards
PUT    /api/cards/:id
DELETE /api/cards/:id
Backlog
GET /api/cards/board/:boardId/backlog
Card Assignment
PUT /api/cards/:id/assign


⚙️ Local Development
Clone the repository
git clone https://github.com/JuniorTechie-coder/react-auth-frontend.git
cd react-auth-frontend
Install dependencies
npm install
Start the development server
npm run dev

For local development, make sure the backend is also running.

🌐 Deployment

The frontend is deployed using Vercel.

The backend API is deployed using Render.

Live Frontend:
https://react-auth-frontend-liart.vercel.app

Live Backend:
https://trello-backend-1dsq.onrender.com


📌 Current Status
Completed
 React frontend setup
 Login and registration
 JWT token handling
 Workspace integration
 Board integration
 List CRUD
 Card CRUD
 Backlog functionality
 Card assignment
 Assignee filtering
 Drag-and-drop card movement
 Board themes
 Backend API integration
 Frontend deployment
 Backend deployment

 Future Improvements
 Implement React Router
 Improve form validation
 Improve error and notification handling
 Implement server-side role-based authorization
 Improve responsive design
 Add automated frontend testing
 Further improve production UI/UX
