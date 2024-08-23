import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State to store the authentication token, initialized from localStorage if available
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const login = (token) => {
    setToken(token);
    localStorage.setItem("token", token); // Saving the token to localStorage
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  // Providing the token and authentication functions to the rest of the app
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Using Custom hook to use the AuthContext easily in other components
export const useAuth = () => useContext(AuthContext);
