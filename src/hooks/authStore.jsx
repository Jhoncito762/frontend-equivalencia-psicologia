import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = create((set) => ({
  token: null,
  refreshToken: null,
  decodedToken: null,
  permissions: [],
  isLoading: true,

  setTokens: (access_token, refresh_token) => {
    localStorage.setItem("token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    const decoded = jwtDecode(access_token);

    set({
      token: access_token,
      refreshToken: refresh_token,
      decodedToken: decoded,
      permissions: decoded.permisos || [],
    });
  },

  updateToken: (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);

    set({
      token: newToken,
      decodedToken: decoded,
      permissions: decoded.permisos || [],
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("teacher_cohorte");
    set({
      token: null,
      refreshToken: null,
      decodedToken: null,
      permissions: [],
    });
  },

  initAuth: () => {
    const token = localStorage.getItem("token");
    const refresh_token = localStorage.getItem("refresh_token");

    if (token && refresh_token) {
      try {
        const decoded = jwtDecode(token);
        set({
          token,
          refreshToken: refresh_token,
          decodedToken: decoded,
          permissions: decoded.permisos || [],
        });
      } catch (err) {
        console.warn("Token inválido o modificado. Limpiando sesión.");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        set({
          token: null,
          refreshToken: null,
          decodedToken: null,
          permissions: [],
        });
      }
    } else {
      // Tokens no existen
      set({
        token: null,
        refreshToken: null,
        decodedToken: null,
        permissions: [],
      });
    }

    set({ isLoading: false });
  },
}));
