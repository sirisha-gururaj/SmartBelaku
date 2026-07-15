import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactElement;
  allowedRoles: ("ADMIN" | "MSLVL")[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw);

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong section for their role — send them home instead of to login
    const fallback = user.role === "ADMIN" ? "/admin" : "/mslvl";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;