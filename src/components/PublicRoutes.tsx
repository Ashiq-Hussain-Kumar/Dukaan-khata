import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/Authcontext";
import type { ReactNode } from "react";
import FullPageLoader from "./FullPageLoader";
type ProtectedRouteProps = {
  children: ReactNode;
};

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

 if (isLoading) return <FullPageLoader />;


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return <>{children}</>;
} 
