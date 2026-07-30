import { createContext, useContext, useEffect, useState } from "react";

import * as authApi from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "waypoint_token";
const USER_KEY = "waypoint_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = useState(Boolean(token));

 
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }

    authApi
      .fetchProfile()
      .then((data) => {
        const normalizedUser = { ...data.user, id: data.user.id || data.user._id };
        setUser(normalizedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setInitializing(false));
    
  }, []);

  const persistSession = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    persistSession(data);
    return data;
  };

  const register = async (details) => {
    const data = await authApi.register(details);
    persistSession(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: Boolean(token), initializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
