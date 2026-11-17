import { createContext, useCallback, useContext, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { Role, User } from "@/lib/types";
import { PageLoader } from "@/components/ui/page-loader";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  refresh: () => Promise<unknown>;
}

const AuthContext = createContext<AuthCtx | null>(null);
export const ME_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try { return await api.get<User>("/auth/me"); }
      catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<User>("/auth/login", { email, password });
    qc.setQueryData(ME_KEY, res.data);
    return res.message;
  }, [qc]);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    qc.setQueryData(ME_KEY, null);
    qc.removeQueries({ queryKey: ["admin"] });
  }, [qc]);

  return (
    <AuthContext.Provider value={{ user: me.data ?? null, loading: me.isLoading, login, logout, refresh: me.refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Sends visitors without a session to the login page and remembers where they were going. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}

export function RequireRole({ role, children, fallback }: { role: Role; children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== role) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

export const isAdmin = (u: User | null) => u?.role === "ADMIN";
