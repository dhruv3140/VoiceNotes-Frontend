import { useState } from "react";
import "./App.css";

import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Dashboard from "./Components/Dashboard";
import { logout } from "./api/authApi";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser || savedUser === "undefined") {
      return null;
    }

    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(getSavedUser());
  const [authMode, setAuthMode] = useState("login");

  const handleLogout = () => {
    logout();
    setToken(null);
    setUser(null);
    setAuthMode("login");
  };

  if (!token) {
    if (authMode === "register") {
      return (
        <Register
          switchToLogin={() => setAuthMode("login")}
          setToken={setToken}
          setUser={setUser}
        />
      );
    }

    if (authMode === "forgot") {
      return <ForgotPassword switchToLogin={() => setAuthMode("login")} />;
    }

    return (
      <Login
        setToken={setToken}
        setUser={setUser}
        switchToRegister={() => setAuthMode("register")}
        switchToForgotPassword={() => setAuthMode("forgot")}
      />
    );
  }

  return <Dashboard user={user} handleLogout={handleLogout} />;
}

export default App;