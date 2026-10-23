
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import { api } from "../utils/api";
type User = {
  userId: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};



export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((userId: string) => {
  setUser({ userId });
  setIsAuthenticated(true);
}, []);

const logout = useCallback(() => {
  setUser(null);
  setIsAuthenticated(false);
}, []);

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const data = await api.get<{ userId: string }>("/shopkeepers/me");

      if (data?.userId) {
        setUser({ userId: data.userId });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider"
    );
  }

  return context;
}
