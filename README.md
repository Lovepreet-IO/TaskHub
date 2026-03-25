# TaskHub 🗂️

> A full-stack task management platform with JWT authentication, Google OAuth, role-based access control, and real-time task tracking — built with React (TypeScript) + FastAPI + PostgreSQL (Neon).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#️-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Route Flow & Pseudocode](#-route-flow--pseudocode)
- [Backend Security Utilities](#-Backend-Security-Utilities)
- [Challenges Faced](#️-challenges-faced)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

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
- Tables: `roles`, `users`, `users_token`, `tasks`, `task_comments`, `task_logs`

---

## 📁 Project Structure

```
TaskHub/
├── Backend/
│   ├── src/
│   │   ├── server.py              # App entry setup
│   │   ├── common/                # Shared utilities (errors, responses)
│   │   ├── config/                # App configuration
│   │   ├── database/
│   │   │   ├── session.py
│   │   │   └── models/            # DB models (user, task, logs, etc.)
│   │   ├── middlewares/           # Auth, logging, error handling
│   │   ├── modules/               # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── logs/
│   │   │   ├── profile/
│   │   │   └── tasks/
│   │   ├── utils/                 # Security, helpers
│   │   └── __init__.py
│   ├── tests/                     # Backend tests
│   └── main.py                    # FastAPI entry point
│
├── Frontend/
│   ├── src/
│   │   ├── api/                   # Axios & API layer
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/               # Global state (User/Auth)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── pages/                 # Route-level pages
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── profile/
│   │   │   └── logs/
│   │   ├── routes/                # Protected routes & redirects
│   │   └── __tests__/             # Frontend tests
│   ├── public/
│   └── package.json
│
├── .env
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
- **users_token** — stores refresh token against user
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
- Python 3.13+
- Neon PostgreSQL account

### Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install .
python main.py
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
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

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

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | /tasks/                   | Get all tasks                  |
| POST   | /tasks/                   | Create new task                |
| GET    | /tasks/get-username       | Get users for task assignment  |
| GET    | /tasks/all-logs           | Get all task logs              |
| GET    | /tasks/deleted            | Get deleted tasks              |
| GET    | /tasks/{task_id}          | Get task by ID                 |
| PUT    | /tasks/{task_id}          | Update task                    |
| DELETE | /tasks/{task_id}          | Delete task                    |
| PUT    | /tasks/restore/{task_id}  | Restore deleted task           |
| POST   | /tasks/{task_id}/comment  | Add comment to task            |
| GET    | /tasks/comment/{task_id}  | Get comments for task          |
| PUT    | /tasks/{task_id}/status   | Update task status             |
| GET    | /tasks/{task_id}/logs     | Get logs for task              |
| GET    | /tasks/logs/all           | Get all logs                   |
| GET    | /tasks/page/{page}        | Get tasks by page (pagination) |

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

---

## 🧪 Testing

* Unit Testing with Jest
* API testing using Postman, Pytest

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

## 📸 Screenshots

* Login Page

<img src="https://github.com/Lovepreet-IO/TaskHub/blob/main/Screenshots/Login.png" alt="Login Page" width="600"/>

* Dashboard

<img src="https://github.com/Lovepreet-IO/TaskHub/blob/main/Screenshots/Dashbaord.png" alt="Dashboard UI" width="600"/>

* Register

<img src="https://github.com/Lovepreet-IO/TaskHub/blob/main/Screenshots/Register.png" alt="Register Page" width="600"/>

---

## 🔍 Route Flow & Pseudocode

This section maps every frontend route to the exact backend APIs it calls, and explains the full request → service → database → response flow for each one.

> **How the auth layer works on every protected route:**
> 
> The Axios instance (in `api/`) attaches `Authorization: Bearer <access_token>` to every request automatically via a request interceptor. On the backend, every protected route has `Depends(get_current_user)` which decodes the token and injects the user. If the token is expired, the Axios response interceptor silently calls `POST /auth/refresh` and retries. If refresh also fails, the user is sent to `/login`.

---

### `/home`

```
Frontend: pages/auth/HomePage.tsx
  renders: "Welcome to TaskHub" + Login / Register / Login with Google buttons
  no API calls made on this page

  if user is already authenticated (token in localStorage):
      ProtectedRoute redirects away from /home , /login and /register → /dashboard
```

---

### `/login`

```
  -- Credential Login --
  user fills: { email, password }
  on submit:
      call POST /auth/login with { email, password }

      -- Backend --
      receive { email, password }
      user = db.query(User).filter(User.email == email).first()
      if not user → raise 401 "Invalid credentials"

      is_valid = verifyPassword(password, user["password"])
      if not is_valid → raise 401 "Invalid credentials"
        
      payload  = {user_id, role_id}
      access_token  = create_access_token(payload)
      refresh_token = create_refresh_token(payload)

      -- store refresh token in users_token table --
      db.query(UserToken).filter(user_id).update(refresh_token)
      -- or insert if first login --

      return { access_token, refresh_token, user: { user_id, name, email, username, role_id } }

  Frontend receives response:
      localStorage.setItem("access_token",  access_token)
      localStorage.setItem("refresh_token", refresh_token)
      localStorage.setItem("user", user)
      navigate("/dashboard")

  -- Google OAuth Login --
  user clicks "Login with Google":
      window.location.href = "/oauth/google"   -- full redirect, not Axios

      -- Backend --
      GET /oauth/google:
          build Google consent URL with client_id, redirect_uri, scope
          return RedirectResponse → Google

      -- user approves on Google --

      GET /oauth/google/callback?code=...:
          exchange code → Google tokens
          fetch Google profile: { email, name }

          user = db.query(User).filter(email).first()
          if not user:
              create new User(name, email, password=GOOGLE_LOGIN_PASSWORD, role=employee)
              db.commit()
          
          payload  = {user_id, role_id}
          access_token  = create_access_token(payload)
          refresh_token = create_refresh_token(payload)
          store refresh_token in users_token

          return RedirectResponse(FRONTEND_URL + "/dashboard?token=" + access_token)

  Frontend (on /dashboard mount):
      reads ?token= from URL params
      stores in localStorage
      removes token from URL
```

---


### `/register`

> **Two-step registration flow:**
> Step 1 collects `first_name, last_name, email, password` → stored temporarily in `localStorage` (not sent to backend yet).
> Step 2 collects `username` → at this point all data is sent together to the backend, user is created, localStorage temp data is cleared.

```
  -- STEP 1: Basic Info --
  form fields: { first_name, last_name, email, password }

  -- Real-time email check --
  GET /auth/check-email?email=xxx
      return { exists: true/false }
  if exists → show "Email already registered"

  -- On step 1 submit --
  localStorage.setItem("pending_register", JSON.stringify({ first_name, last_name, email, password }))
  navigate("/set-username")

  -- STEP 2: Set Username (same page or dedicated page) --
  form fields: { username }

  -- Real-time username check (on blur) --
  GET /auth/check-username?username=xxx
      return { exists: true/false }
  if exists → show "Username already taken"

  -- On step 2 submit --
  pending = JSON.parse(localStorage.getItem("pending_register"))
  -- combine step 1 data + username --
  call POST /auth/register with { first_name, last_name, email, password, username }

      -- Backend: modules/auth/router.py --
      check email uniqueness (server-side guard)
      check username uniqueness (server-side guard)

      hashed = hash_password(password) 
      db.query(
          first_name = data.first_name,
          last_name  = data.last_name,
          email      = data.email,
          username   = data.username,
          password   = hashed,
          role_id    = 2   
      )
 
      db.commit()

      payload       = { user_id, role_id }
      access_token  = create_access_token(payload)
      refresh_token = create_refresh_token(payload)

      -- store refresh token in users_token table --
      db.query(UserToken(user_id, refresh_token))
      db.commit()

      return { access_token, refresh_token, user }

  Frontend:
      localStorage.removeItem("pending_register")   -- clear temp data
      localStorage.setItem("access_token",  access_token)
      localStorage.setItem("refresh_token", refresh_token)
      navigate("/dashboard")
```

---

### `/set-username`

Semi-protected (has a temp token from OAuth callback)
> **This page is also used for Google OAuth first-time login.**
> After Google callback, the backend issues a short-lived `temp_token` containing data (`email, first_name, last_name`). On submit, the `username + temp_token` are sent together.
```
Frontend: pages/auth/SetUsername.tsx

  -- Triggered in two cases --

  CASE 1: Normal registration (coming from /register step 1)
      pending data already in localStorage from step 1
      (handled by /register flow above — POST /auth/register is called here)

  CASE 2: Google OAuth first-time login
      GET /oauth/google/callback on backend:
          exchange code → fetch Google profile: { email, first_name, last_name }

          user = db.query(role_id != 1 and username not likes 'test')

          if user already exists (returning Google user):
              -- skip set-username, issue full tokens directly --
              access_token  = create_access_token({ user_id, role_id })
              refresh_token = create_refresh_token({ user_id, role_id })
              store refresh_token in users_token
              return RedirectResponse(FRONTEND_URL + "/dashboard?token=" + access_token + "&refresh=" + refresh_token)

          if new Google user (no account yet):
              -- issue a temp token containing profile data only, NOT stored in DB --
              temp_token = create_access_token({ email, name})
              return RedirectResponse(FRONTEND_URL + "/set-username?temp_token=" + temp_token)

  Frontend (on /set-username mount for Google OAuth case):
      reads ?temp_token= from URL params
      clears token from URL

  field: { username }

  -- on start --
  GET /auth/check-username?username=xxx → show availability

  -- on submit (Google OAuth case) --
  temp_token = queryParams("temp_token")
  call POST /auth/set-username with { username, temp_token }  

      -- Backend --
      decode temp_token using JWT_SECRET
      payload = { email, name }

      check username not taken

      hashed = hash_password(GOOGLE_LOGIN_PASSWORD + email)
      db.query(
          name       = payload.first_name + payload.last_name
          email      = payload.email,
          username   = username,
          password   = hashed,
          role_id    = 2
      )
 
      db.commit()

      payload       = { user_id, role_id }
      access_token  = create_access_token(payload)
      refresh_token = create_refresh_token(payload)
      store refresh_token in users_token

      return { access_token, refresh_token, user }

  Frontend:
      localStorage.setItem("access_token",  access_token)
      localStorage.setItem("refresh_token", refresh_token)
      navigate("/dashboard")
```

---

### `/dashboard`
```
  on start -
      call GET /dashboard/  [Bearer token in header]

      -- Backend --
      current_user = Depends(get_current_user)

      if role == "admin":
          total     = db.query(Task).filter(is_deleted=False).count()
          pending   = db.query(Task).filter(status="pending", is_deleted=False).count()
          in_prog   = db.query(Task).filter(status="in_progress", is_deleted=False).count()
          review    = db.query(Task).filter(status="waiting_for_review", is_deleted=False).count()
          completed = db.query(Task).filter(status="completed", is_deleted=False).count()
          ----
          my given tasks also count (assigned_by = me)
          

      if role == "employee":
          -- same queries but all filtered by assigned_by = me and assigned_to = me --

      return {
             GivenByMeTasks = { total, pending, in_progress, waiting_for_review, completed },
             other = { total, pending, in_progress, waiting_for_review, completed }
             }

  Frontend renders:
      stat cards: Total / Pending / In Progress / Review / Completed 
```

---

### `/tasks` - get tasks
```
  -- Load task list on mount --
  call GET /tasks/   [ Bearer token]

      -- Backend: modules/tasks/router.py --
      current_user = Depends(get_current_user)

      if role == "admin":
          GivenByMeTasks = db.query(assigned_by = me)
          otherTasks = db.query(all tasks)
      if role == "employee":
          GivenByMeTasks = db.query(assigned_by = me)
          otherTasks = db.query(assigned_to = me)

      return { GivenByMeTasks , otherTasks}

  Frontend renders: table/card list of tasks with status badges and priority colours

 
  -- Admin: Soft Delete Task --
  admin clicks delete icon on a task:
      call DELETE /tasks/{task_id}  [Bearer token]

          -- Backend --
          current_user = Depends(get_current_user)
          if role != "admin" → raise 403
          task.is_deleted = True
          task.deleted_at = datetime.utcnow()
          task.deleted_by = current_user.user_id
          db.commit()
          create_log(task_id, action="Task deleted", performed_by=current_user.user_id)
          return { message: "Task deleted" }

      Frontend: remove from list, show toast

  -- Admin: View & Restore Deleted Tasks --
  admin switches to "Deleted" tab:
      call GET /tasks/deleted  [Bearer token]
          Backend: db.query(is_deleted = true)
          return deleted tasks list

  admin clicks restore:
      call PUT /tasks/restore/{task_id}
          task.is_deleted = False, task.deleted_at = None, task.deleted_by = None
          db.commit()
          create_log(task_id, action="Task restored", performed_by=current_user.user_id)

```

---

### `/tasks` -- create-tasks

```
--  Create Task --
  user clicks "New Task":
      call GET /tasks/get-username   -- fetch employee list for assign dropdown
          Backend: db.query(role_id != 1 and username not likes 'test')
          return [usernames]

      form fields: { title, description, priority, status, assigned_to, due_date }
      on submit → call POST /tasks/ with task data  [Bearer token]

          -- Backend --
          current_user = Depends(get_current_user)
           user_id = current_user["user_id"]
          task = Task(title, description, priority, assigned_to,
                      assigned_by=user_id, status , is_deleted=False)
          db.query(task)
          db.commit()
          create_log(task_id, action="Task created", performed_by=current_user.user_id)
          return task

      Frontend: re-fetch task list, close modal

```

---


### '/task-details`

```
  reads task_id from URL params: /task-details/:task_id

  -- Load everything on mount (3 parallel calls) --

  [1] GET /tasks/{task_id}
      Backend: db.query(Task_id )
      joins: assigned_to user, assigned_by user
      return full task object with user names

  [2] GET /tasks/{task_id}/logs
      Backend: db.query(Task_id )
      return [{ log_id, action, performed_by: { name }, created_at }]

  [3] GET /tasks/comment/{task_id}
      Backend: db.query(Task_id )
      return [{ comment_id, message, user: { name }, created_at }]

  Frontend renders:
      top section: task title, description, status badge, priority badge,
                   assigned to, assigned by, due date, created at
      middle: comments thread (newest first)
      right/bottom: activity logs (newest first)

  -- Post a Comment --
  user types comment and submits:
      call POST /tasks/comment/{task_id} with { message }  [Bearer token]

          -- Backend --
          db.query(message)
          db.commit()
          return comment with user info

      Frontend: append comment to list, clear input

  --  Edit Task --
  admin clicks "Edit":
      shows edit form pre-filled with current values
      on save → call PUT /tasks/{task_id} with changed fields

          -- Backend --
          task.title       = data.title       if provided
          task.description = data.description if provided
          task.priority    = data.priority    if provided
          task.assigned_to = data.assigned_to if provided
          task.due_date    = data.due_date    if provided
          db.query(newData)
          db.commit()
          create_log(task_id, action="Task updated", performed_by=user_id)
          return updated task

      Frontend: update task in state

  -- Update Status --
  employee changes status dropdown:
      call PUT /tasks/{task_id}/status with { status: "in_progress" }

          -- Backend --
          db.query(new_status)
          if new_status == "completed": task.completed_at = datetime.utcnow()
          db.commit()
          create_log(task_id, action=f"Status changed to {new_status}", performed_by=user_id)
          return updated task
```

---

### `/logs`
```
  on start:
      call GET /logs/  [Bearer token]

      -- Backend --
      current_user = Depends(get_current_user)
      if role == "admin" → return all logs
      if role == "user" → return logs of that user(according to user_id)

      logs = db.query(user_id)
      return [{ log_id, task_id, task_title, action, performed_by: { name }, created_at }]

  Frontend renders:
      full audit log table with columns:
        Log ID | Task | Action | Performed By | Date & Time
```

---

### `/profile`
```
  -- Load profile on mount --
  call GET /profile/  [Bearer token]

      -- Backend --
      current_user = Depends(get_current_user)
      user = db.query(user_id)
      signed_in_by = Email & Password
      if password == GOOGLE_LOGIN_PASSWORD -> signed_in_by = GOOGLE
      
      return { user_id, name, email, username, role_id, signed_in_by }

  Frontend renders:
      profile card: name, email, username, signed_in_by 

  -- Update Username --
  user edits username field and submits:
      ( GET /auth/check-username first to validate availability)
      call PUT /profile/username with { username }  [Bearer token]

          -- Backend --
          validate username not taken by another user
          db.query(username=username)
          db.commit()
          return { message: "Username updated", username }


  -- Update Password --
  if not Google loged in user
  user fills: {  new_password }
  if google loged in user
    user fills: { current_password, new_password  }
  on submit:
      call PUT /profile/password with { current_password, new_password }  [Bearer token]

          -- Backend --
          if Not Googe_user:
                if not bcrypt.verify(current_password, user.hashed_password):
                        raise 400 "Current password is incorrect"
                user = db.query(hashPassword(newPassword)) 
          
          user = db.query(hashPassword(newPassword)) 
          db.commit()
          return { message: "Password updated" }

      Frontend: clear form, show success toast
```

---

### Token Refresh — Silent Background Flow

This runs automatically when access_token expires and user have click on any call button. 

```
  every API response is checked:
  if response.status === 401 and this request has not been retried yet:

      refresh_token = localStorage.getItem("refresh_token")
      call POST /auth/refresh with { refresh_token }

          -- Backend --
          decode refresh_token using REFRESH_SECRET
          user_id = payload.get("user_id")

          stored = db.query(user_id)
          if stored.refresh_token != refresh_token:
              raise 401 "Token mismatch"  -- token was already rotated or invalidated

          new_access_token = create_access_token({ user_id, role_id })
          return { access_token: new_access_token }

  Frontend:
      localStorage.setItem("access_token", new_access_token)
      retry original failed request with new token → user never notices anything

  if refresh also returns 401:
      -- refresh token expired or invalidated --
      localStorage.clear()
      navigate("/login")
```

---

### Logout Flow

**Triggered from any page via the navigation bar.**

```
  user clicks Logout:
      refresh_token = localStorage.getItem("refresh_token")
      call POST /auth/logout with { refresh_token }  [Bearer token]

          -- Backend --
          decode refresh_token using REFRESH_SECRET
          user_id = payload.get("user_id")

          stored = db.query(user_id)
          if stored.refresh_token != refresh_token:
              raise 401 "Token mismatch"  -- token was already rotated or invalidated
          db.query(remove - user_id)
          -- or delete the record entirely --
          db.commit()
          return { message: "Logged out successfully" }

  Frontend:
      if backend sends 401 -> show(force logout)
      localStorage.clear()
      navigate("/login")

```

---


## 🔐 Backend Security Utilities (`utils/security.py`)

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

```python
def hash_password(password: str):
    return pwd_context.hash(password)
```
```python
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
```
```python
JWT_SECRET        = settings.JWT_SECRET          # from .env
REFRESH_SECRET    = settings.REFRESH_SECRET      # different key — important
ACCESS_TOKEN_EXPIRE_MINUTES  = settings.ACCESS_TOKEN_EXPIRE_MINUTES   # 15
REFRESH_TOKEN_EXPIRE_DAYS    = settings.REFRESH_TOKEN_EXPIRE_DAYS     # 7
```


```python
def create_access_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
```

```python
def create_refresh_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(payload, REFRESH_SECRET, algorithm="HS256")
```
---

```python
def verify_refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```
```python
def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```

---


## ⚠️ Challenges Faced

* Handling JWT authentication across access and refresh token pairs
* Managing token expiration with silent refresh in Axios interceptor
* Google OAuth integration and callback handling with user auto-creation
* Role-based API authorization and consistent 401 error handling

---

## 🔮 Future Improvements

* Notifications system
* Adding manager role
* Separating the username and password table from user table
* Real-time updates (WebSockets)
* Using http-only cookies for security
* Deployment (Docker, AWS)

---

## 👤 Author

**Lovepreet Singh**  
GitHub: [@Lovepreet-IO](https://github.com/Lovepreet-IO)

---

## 📄 License

This project is for educational purposes.
