import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

import Tasks from "./pages/tasks/Tasks";
import OAuthSuccess from "./pages/auth/oauth-success";
import SetUsername from "./pages/auth/SetUsername";
import Profile from "./pages/profile/profile";
import { Toaster } from "react-hot-toast";
import TaskDetails from "./pages/tasks/TaskDetails"
import CreateTask from "./pages/tasks/createTasks";
import Logs from "./pages/logs/logs"
import "./index.css";
import Home from "./pages/home/home";
import ProtectedRoute from "./routes/ProtectedRoute";


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
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/set-username" element={<SetUsername />} />

          {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/tasks" element={<Tasks/>}/>
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/tasks/create" element={<CreateTask />} />
            <Route path="/logs" element={<Logs />} />
            </Route>

          {/* 404 fallback -> HOME */}
          <Route path="*" element={<Home/>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;