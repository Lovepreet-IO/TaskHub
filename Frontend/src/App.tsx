import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

import Tasks from "./pages/tasks/Tasks.tsx";
import OAuthSuccess from "./pages/auth/oauth-success.tsx";
import SetUsername from "./pages/auth/SetUsername.tsx";
import Profile from "./pages/profile/profile.tsx";
import { Toaster } from "react-hot-toast";
import TaskDetails from "./pages/tasks/TaskDetails.tsx"
import CreateTask from "./pages/tasks/createTasks.tsx";
import Logs from "./pages/logs/logs.tsx"
import "./index.css";
import Home from "./pages/home/home.tsx";

function App() {
  return (
      <BrowserRouter>
        {/* Toast system */}
        <Toaster position="top-right" />

        <Routes>
          {/* Default route */}
          <Route path="/" element={<Home/>} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Temporary dashboard (we’ll protect later) */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/set-username" element={<SetUsername />} />
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/tasks" element={<Tasks/>}/>
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/tasks/create" element={<CreateTask />} />
            <Route path="/logs" element={<Logs />} />






          {/* 404 fallback */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;