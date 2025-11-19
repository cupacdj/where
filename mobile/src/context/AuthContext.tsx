import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { httpClient } from "../api/httpClient";

type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  surname?: string;
  gender?: "man" | "woman";
  avatarUri?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (payload: {
    email: string;
    username: string;
    name: string;
    surname: string;
    password: string;
    gender: "man" | "woman";
  }) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>; // identifier = email or username
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; surname?: string; password?: { current: string; next: string }; avatarUri?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const rawUser = await AsyncStorage.getItem("currentUser");
      const rawToken = await AsyncStorage.getItem("accessToken");
      if (rawUser) setUser(JSON.parse(rawUser));
      if (rawToken) setToken(rawToken);
      setLoading(false);
    })();
  }, []);

  const signUp: AuthContextValue["signUp"] = async (payload) => {
    try {
      const res = await httpClient.post<{
        user: User;
        accessToken: string;
      }>("/auth/register", payload);
      await AsyncStorage.setItem("currentUser", JSON.stringify(res.user));
      await AsyncStorage.setItem("accessToken", res.accessToken);
      setUser(res.user);
      setToken(res.accessToken);
    } catch (e) {
      throw e;
    }
  };

  const login: AuthContextValue["login"] = async (identifier, password) => {
    try {
      const res = await httpClient.post<{
        user: User;
        accessToken: string;
      }>("/auth/login", { identifier, password });
      await AsyncStorage.setItem("currentUser", JSON.stringify(res.user));
      await AsyncStorage.setItem("accessToken", res.accessToken);
      setUser(res.user);
      setToken(res.accessToken);
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["currentUser", "accessToken"]);
    setUser(null);
    setToken(null);
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (updates) => {
    if (!user) return;
    const newUser: User = {
      ...user,
      name: updates.name !== undefined ? updates.name : user.name,
      surname: updates.surname !== undefined ? updates.surname : user.surname,
      avatarUri: updates.avatarUri !== undefined ? updates.avatarUri : user.avatarUri,
    };
    if (updates.password) {
      await httpClient.post("/auth/change-password", {
        currentPassword: updates.password.current,
        newPassword: updates.password.next,
      }).catch((e: any) => { throw e; });
    }
    await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
