import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Lobbies from "./pages/Lobbies";
import LobbyDetail from "./pages/LobbyDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/callback" element={<Callback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lobbies"
        element={
          <ProtectedRoute>
            <Lobbies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lobbies/:lobbyId"
        element={
          <ProtectedRoute>
            <LobbyDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
