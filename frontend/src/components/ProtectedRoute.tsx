import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // save this URL so login can redirect back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
