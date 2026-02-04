import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { getAuthState } from "../../features/authSlice";
import type { ReactElement } from "react";

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const auth = useSelector(getAuthState);
  if (auth.loading) return <div>Loading...</div>;
  return auth.user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;