# TaskHub 🗂️

> A full-stack task management platform with JWT authentication, Google OAuth, role-based access control, and real-time task tracking — built with React (TypeScript) + FastAPI + PostgreSQL (Neon).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Author](#author)

---

## Overview

TaskHub is a company-grade task management system that allows admins to create, assign, and track tasks across team members. Employees can view their assigned tasks, update task status, add comments, and track logs — all within a secure, token-protected environment.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Access + Refresh token pair with secure invalidation |
| 🔑 Google OAuth | One-click sign-in via Google |
| 👤 User Profiles | Role-based user management (Admin / Employee) |
| 📊 Dashboard | Overview of tasks, statuses, and priorities |
| ✅ Task Management | Create, assign, update, and soft-delete tasks |
| 💬 Task Comments | Comment threads per task |
| 📝 Task Logs | Full audit log of every task action |
| 🔒 Protected Routes | Route guards based on authentication state |
| 🚪 Logout | Token invalidation + local storage clearing |

---

## 🛠️ Tech Stack

### Frontend
- **React** (TypeScript)
- **React Router** — client-side routing with protected routes
- **Axios** — API communication
- **Context API** — auth state management

### Backend
- **FastAPI** (Python)
- **PostgreSQL** via **Neon** (serverless cloud database)
- **JWT** (Access + Refresh tokens)
- **Google OAuth 2.0**
- **Uvicorn** ASGI server

### Database
- **PostgreSQL** hosted on **Neon**
- Custom ENUMs: `task_status`, `task_priority`
- Tables: `roles`, `users`, `tasks`, `task_comments`, `task_logs`

---

## 📁 Project Structure

```
TaskHub/
├── Frontend/               # React TypeScript application
│   ├── src/
│   │   ├── api/            # api management
│   │   ├── asserts/        # required components
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── context/        # Auth context & providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Axios API service layer
│   │   └── routes/         # TypeScript interfaces
│   ├── public/
│   └── package.json
│
├── Backend/                # FastAPI Python application
│   ├── config/             # settings handlers
│   ├── common/             # response handlers
│   ├── middlewares/        # middlewares and authenticator
│   ├── services/           # Business logic layer
│   ├── utils/              # JWT + OAuth helpers
│   ├── database/           # DB connection & queries
│   │   ├── models/         # Pydantic models & DB schemas
│   └── main.py             # FastAPI app entry point
│
├── .env                    # Environment variables (root level)
└── README.md
```

---

## 🗄️ Database Schema

### Enums
```sql
task_status: pending | in_progress | waiting_for_review | completed
task_priority: low | medium | high
```

### Tables
- **roles** — `admin`, `employee`
- **users** — user accounts with role assignment
- **tasks** — core task entity with soft-delete support
- **task_comments** — per-task comment threads
- **task_logs** — immutable audit log of all task actions

---

## 🔐 Authentication Flow

### Login
```
User → Login Form → POST /auth/login → Verify Credentials
  → Generate Access + Refresh Token → Store in Client → Redirect to Dashboard
```

### Google OAuth
```
User → Click "Login with Google" → Google OAuth Consent
  → Callback with Code → Exchange for Profile → Create/Fetch User → Issue JWT → Dashboard
```

### Logout
```
User → Click Logout → POST /auth/logout → Invalidate Refresh Token (server)
  → Clear localStorage → Redirect to Login Page
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Neon PostgreSQL account

### Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install uv
uv sync
uv run main.py
```

### Frontend Setup
```bash
cd Frontend
npm install --force
npm run dev
```

### Environment Variables
Create a `.env` file at the **project root**:

```env
#Database
DB_PROTOCOL=postgresql
DB_USER=neondb_owner
DB_PASSWORD=password
DB_HOST=host
DB_NAME=neondb
DB_OPTIONS=?sslmode=require&channel_binding=require

#JWT
JWT_SECRET=secret
REFRESH_SECRET=secret
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7


#OAUTH
GOOGLE_CLIENT_ID=id
GOOGLE_CLIENT_SECRET=secret
GOOGLE_REDIRECT_URI=http://localhost:8000/oauth/google/callback
FRONTEND_URL=http://localhost:5173
GOOGLE_LOGIN_PASSWORD=GOOGLE_
```

---

## 🔗 API Endpoints

### OAuth

| Method | Endpoint               | Description     |
| ------ | ---------------------- | --------------- |
| GET    | /oauth/google          | Google Login    |
| GET    | /oauth/google/callback | Google Callback |

### Auth

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | /auth/login          | Login                    |
| POST   | /auth/register       | Register                 |
| POST   | /auth/logout         | Logout                   |
| POST   | /auth/refresh        | Refresh Token            |
| POST   | /auth/set-username   | Set Username             |
| GET    | /auth/check-username | Check if Username Exists |
| GET    | /auth/check-email    | Check if Email Exists    |

### Tasks

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | /tasks/                  | Get all tasks                  |
| POST   | /tasks/                  | Create new task                |
| GET    | /tasks/get-username      | Get users for task assignment  |
| GET    | /tasks/all-logs          | Get all task logs              |
| GET    | /tasks/{task_id}         | Get task by ID                 |
| PUT    | /tasks/{task_id}         | Update task                    |
| DELETE | /tasks/{task_id}         | Delete task                    |
| PUT    | /tasks/restore/{task_id} | Restore deleted task           |
| POST   | /tasks/{task_id}/comment | Add comment to task            |
| PUT    | /tasks/{task_id}/status  | Update task status             |
| GET    | /tasks/{task_id}/logs    | Get logs for task              |
| GET    | /tasks/logs/all          | Get all logs                   |
| GET    | /tasks/page/{page}       | Get tasks by page (pagination) |

### Dashboard

| Method | Endpoint    | Description    |
| ------ | ----------- | -------------- |
| GET    | /dashboard/ | Dashboard data |

### Profile

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | /profile/         | Get user profile |
| PUT    | /profile/username | Update username  |
| PUT    | /profile/password | Update password  |

### Logs

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| GET    | /logs/   | Get all logs |

### Default / Root

| Method | Endpoint | Description   |
| ------ | -------- | ------------- |
| GET    | /        | Root endpoint |

---

## 🧪 Testing

* Unit Testing with Jest
* API testing using Postman

### Example Test Cases

| Test Case        | Description          | Expected Result                |
| ---------------- | -------------------- | ------------------------------ |
| Login Valid      | Correct credentials  | Login success, tokens returned |
| Login Invalid    | Wrong password/email | 401 Unauthorized               |
| Logout           | Valid token          | Logout success, tokens removed |
| Access Dashboard | With token           | Data loads                     |
| Access Dashboard | No token             | 401 Unauthorized               |
| Create Task      | Valid data           | Task created                   |
| Update Task      | Valid data           | Task updated                   |
| Delete Task      | Valid task id        | Task deleted                   |

---


## ⚠️ Challenges Faced

* Handling JWT authentication
* Managing token expiration
* Google OAuth integration
* API authorization (401 errors)

---

## 🔮 Future Improvements

* Role-based access control
* Notifications system
* Real-time updates
* Deployment (Docker, AWS)

---


## 🔍 Code Flow & Pseudocode

Add screenshots of:

* Login Page
* Dashboard!
* [[Dashbaord.png](Screenshots/Dashbaord.png)](https://raw.githubusercontent.com/Lovepreet-IO/TaskHub/refs/heads/main/Screenshots/Dashbaord.png)
<img src="[https://github.com/Lovepreet-IO/TaskHub/blob/main/Screenshots/Dashbaord.png](https://raw.githubusercontent.com/Lovepreet-IO/TaskHub/refs/heads/main/Screenshots/Dashbaord.png)" alt="Dashboard UI" width="600"/>

---

## 👤 Author

**Lovepreet Singh**  
GitHub: [@Lovepreet-IO](https://github.com/Lovepreet-IO)

## 📄 License

This project is for educational purposes.

---
