import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../Firebase';

const ProtectedRoute = ({ element: Component, role, ...rest }) => {
  const location = useLocation();
  const uid = localStorage.getItem('uid') || auth.currentUser?.uid;
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

  // If no authenticated user session exists, redirect to login
  if (!uid) {
    console.warn(`Unauthenticated access blocked for ${location.pathname}. Redirecting to /login.`);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If a specific role is required and the user's role does not match
  if (role && userRole && userRole !== role.toLowerCase()) {
    console.warn(`Access forbidden: user role is ${userRole}, required ${role}`);
    return <Navigate to="/forbidden" replace />;
  }

  return Component;
};

export default ProtectedRoute;

