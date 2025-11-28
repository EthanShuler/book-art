import { useState, useEffect } from "react";

interface AuthUser {
  userId: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
}

function decodeJWT(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin ?? false,
    };
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      const user = decodeJWT(token);
      setState({
        user,
        isAdmin: user?.isAdmin ?? false,
        isLoading: false,
      });
    } else {
      setState({
        user: null,
        isAdmin: false,
        isLoading: false,
      });
    }
  }, []);

  return state;
}

export function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}
