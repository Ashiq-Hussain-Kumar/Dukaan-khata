
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
type userName = {
  userName :string | null;
}

type AuthContextType = {
  user: User | null;
  userName :userName |null;
  userDetails: object | null;
  isAuthenticated: boolean;
  login: (userId: string, userName: string, userDetails: object | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};



export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const  [userName , setUserName] = useState<userName|null>(null);
  const [userDetails, setUserDetails] = useState<object | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  
  const login = useCallback((userId: string, userName :string, userDetails: object | null) => {
  setUser({ userId });
  setUserName({userName});
  setUserDetails(userDetails); 
  setIsAuthenticated(true);
}, []);

const logout = useCallback(() => {
  setUser(null);
  setUserName(null);
  setIsAuthenticated(false);
}, []);

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const data = await api.get<{
        name: string | null;
        userId: string;
        userName: string;
        userDetails?: object | null;
      }>("/shopkeepers/me");
   
   
      if (data?.userId) {
        setUser({ userId: data.userId });
        setUserName({ userName: data.name });
        setUserDetails(data.userDetails ?? null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setUserName(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
        setUserName(null);
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
        userName,
        userDetails,
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
