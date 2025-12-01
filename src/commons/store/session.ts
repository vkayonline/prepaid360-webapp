import { create } from 'zustand'
import { getMe } from "@/commons/api";

interface User {
  "user-id": number;
  "full-name": string;
  email: string;
  roles: string[];
  permissions: { code: string }[];
}

interface SessionState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  checkSession: async () => {
    try {
      const userData = await getMe();
      set({ user: userData });
    } catch (error) {
      console.log("No active session found.");
    } finally {
      set({ loading: false });
    }
  },
  hasPermission: (permission: string) => {
    const { user } = get();
    return user?.permissions?.some(p => p.code === permission) ?? false;
  },
}));
