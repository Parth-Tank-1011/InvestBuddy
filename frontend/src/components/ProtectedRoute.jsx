import React, { useEffect } from "react";

function ProtectedRoute({ children, onNavigate, user }) {
  useEffect(() => {
    if (!user) {
      onNavigate("login", { replace: true });
    }
  }, [onNavigate, user]);

  if (!user) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
