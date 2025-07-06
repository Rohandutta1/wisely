import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface User {
  uid: string;
  email: string | null;
  firstName?: string;
}

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    }
  }, [user, loading]);

  return { user: user ? { uid: user.uid, email: user.email, firstName: user.displayName || undefined } : null, isAuthenticated, isLoading, error };
}