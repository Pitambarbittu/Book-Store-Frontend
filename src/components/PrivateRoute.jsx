// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const PrivateRoute = ({ element: Element }) => {
  const { token } = useAuth();

  return token ? <Element /> : <Navigate to="/login" />;
};

export default PrivateRoute;
