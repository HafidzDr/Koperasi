import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { canAccessRoute } from "@/lib/rbac";
import { AccessDeniedView } from "./AccessDeniedView";

interface RouteGuardProps {
  children?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { currentRole } = useAuthStore();
  const { config } = useConfigStore();
  const location = useLocation();

  const accessCheck = canAccessRoute(
    currentRole,
    location.pathname,
    config.activeModules
  );

  if (!accessCheck.allowed) {
    return (
      <AccessDeniedView
        isModuleInactive={accessCheck.isModuleInactive}
        reason={accessCheck.reason}
        currentPath={location.pathname}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
