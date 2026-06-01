import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMeRequest, loginRequest, registerRequest } from "./services/auth.service";
import { TOKEN_KEY, USER_KEY } from "./services/http";

const AuthContext = createContext(undefined);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setInitializing(false);
  }, []);

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener("queuesense:auth-expired", onExpired);
    return () => window.removeEventListener("queuesense:auth-expired", onExpired);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setInitializing(false);
        return;
      }

      try {
        const me = await getMeRequest();
        if (!cancelled) {
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const { token: nextToken, user: nextUser } = await loginRequest(credentials);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload) => {
    await registerRequest(payload);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      login,
      register,
      logout,
    }),
    [token, user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
