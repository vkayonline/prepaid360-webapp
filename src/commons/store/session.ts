import { create } from 'zustand'
import { getMe } from "@/commons/api";

export interface Corporate {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

interface User {
  "user-id": number;
  "full-name": string;
  email: string;
  roles: string[];
  permissions: { code: string }[];
  corporates: Corporate[];
}

interface SessionState {
  user: User | null;
  loading: boolean;
  selectedCorporate: Corporate | null;
  setUser: (user: User | null) => void;
  setSelectedCorporate: (corporate: Corporate | null) => void;
  checkSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  loading: true,
  selectedCorporate: null,
  setUser: (user) => set({ user, selectedCorporate: user ? get().selectedCorporate : null }),
  setSelectedCorporate: (corporate) => set({ selectedCorporate: corporate }),
  checkSession: async () => {
    try {
      const userData = await getMe();
      // Auto-select if only one corporate exists
      let selected = null;
      if (userData.corporates && userData.corporates.length === 1) {
        selected = userData.corporates[0];
      }
      set({ user: userData, selectedCorporate: selected });
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
