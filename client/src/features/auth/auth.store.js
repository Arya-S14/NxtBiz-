import { create } from 'zustand';
import { http, setAccessToken } from '../../api/http.js';

export const useAuthStore = create((set) => ({
  user: null,
  ready: false,
  async restore() {
    try {
      const { data } = await http.post('/auth/refresh');
      setAccessToken(data.accessToken);
      set({ user: data.user });
    } catch { setAccessToken(null); set({ user: null }); }
    finally { set({ ready: true }); }
  },
  async authenticate(mode, values) {
    const { data } = await http.post(`/auth/${mode}`, values);
    setAccessToken(data.accessToken);
    set({ user: data.user });
  },
  async logout() {
    try { await http.post('/auth/logout'); } finally { setAccessToken(null); set({ user: null }); }
  }
}));
