import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "./ui/PageLoader";

interface Props {
  children: React.ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // wait until localStorage is loaded
    return <PageLoader />;
  }

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const hasOperatorAccess = !!user?.adminAccess;

  if (!user || (!isAdmin && !hasOperatorAccess)) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && location.pathname === "/admin/no-access") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isAdmin) {
    const allowedTabs: string[] = Array.isArray(user?.adminTabAccess) ? user.adminTabAccess : [];
    const noAccessPath = "/admin/no-access";

    if (allowedTabs.length === 0) {
      if (location.pathname !== noAccessPath) {
        return <Navigate to={noAccessPath} replace />;
      }
      return <>{children}</>;
    }

    if (location.pathname === noAccessPath) {
      return <Navigate to={allowedTabs[0]} replace />;
    }

    const isAllowed = allowedTabs.some(
      (tabPath) => location.pathname === tabPath || location.pathname.startsWith(`${tabPath}/`)
    );
    if (!isAllowed) {
      return <Navigate to={allowedTabs[0]} replace />;
    }
  }

  return <>{children}</>;
};

export default AdminRoute;
