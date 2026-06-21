import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnauthorizedHandler } from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  register: (token: string, user: AuthUser) => Promise<void>;
}

const STORAGE_KEY_TOKEN = '@cardapio:token';
const STORAGE_KEY_USER = '@cardapio:user';

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          STORAGE_KEY_TOKEN,
          STORAGE_KEY_USER,
        ]);

        const parsedToken = storedToken[1];
        const parsedUser = storedUser[1] ? (JSON.parse(storedUser[1]) as AuthUser) : null;

        if (parsedToken && parsedUser) {
          setToken(parsedToken);
          setUser(parsedUser);
        }
      } catch {
        await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    });
  }, []);

  const login = useCallback(async (newToken: string, newUser: AuthUser) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_TOKEN, newToken],
      [STORAGE_KEY_USER, JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback(async (newToken: string, newUser: AuthUser) => {
    await login(newToken, newUser);
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
