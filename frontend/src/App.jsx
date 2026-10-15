import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Login } from "./pages/Login";
import Home from "./pages/Home";
import PostPage from "./pages/Post";
import AdminPage from "./pages/Admin";
import { SettingsPage } from "./pages/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { profileLayout } from "./components/settingsComponents/profileLayout";
import { accountLayout } from "./components/settingsComponents/accountLayout";
import { appearanceLayout } from "./components/settingsComponents/appearanceLayout";
import { notificationsLayout } from "./components/settingsComponents/notificationsLayout";
import { displayLayout } from "./components/settingsComponents/displayLayout";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => {
    document.title = "/Imagine";
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <SettingsPage>{profileLayout()}</SettingsPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/account"
          element={
            <ProtectedRoute>
              <SettingsPage>{accountLayout()}</SettingsPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/appearance"
          element={
            <ProtectedRoute>
              <SettingsPage>{appearanceLayout()}</SettingsPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute>
              <SettingsPage>{notificationsLayout()}</SettingsPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/display"
          element={
            <ProtectedRoute>
              <SettingsPage>{displayLayout()}</SettingsPage>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
