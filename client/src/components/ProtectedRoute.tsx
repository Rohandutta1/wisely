import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [user, loading] = useAuthState(auth);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/signin");
    }
  }, [user, loading, setLocation]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <Route path={path} component={Component} />;
}