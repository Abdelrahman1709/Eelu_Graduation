import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, token, loading } = useAuth();

  if (loading) return null;
  if (!user || !token) return <Navigate to="/login" replace />;
  if (user?.gender == null && location.pathname !== "/gender-selection") {
    return <Navigate to="/gender-selection" replace />;
  }

  return children;
}

export default ProtectedRoute;