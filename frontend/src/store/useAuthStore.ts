import { create } from 'zustand';

interface AuthState {
  user: { email: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: (email) => {
    const user = { email };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
