import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('cc_token', data.token);
        localStorage.setItem('cc_user', JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      signup: async (name, email, password, interests = []) => {
        const { data } = await api.post('/auth/signup', {
          name, email, password, interests,
        });
        localStorage.setItem('cc_token', data.token);
        localStorage.setItem('cc_user', JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'campuscare-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
