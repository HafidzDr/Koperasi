import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { canAccessRoute } from "@/lib/rbac";
import { AccessDeniedView } from "./AccessDeniedView";

interface RouteGuardProps {
  children?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { currentRole } = useAuthStore();
  const location = useLocation();

  const accessCheck = canAccessRoute(currentRole, location.pathname);

  if (!accessCheck.allowed) {
    return (
      <AccessDeniedView
        reason={accessCheck.reason}
        currentPath={location.pathname}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
