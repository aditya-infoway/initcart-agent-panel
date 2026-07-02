import { create } from "zustand";
import Swal from "sweetalert2";

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  referral_code?: string;
  referral_link?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isRestoring: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  inactivityTimer: any;

  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  logoutAndRedirect: () => void;
  updateUser: (userData: Partial<User>) => void;
  loadSessionFromStorage: () => void;
  startTimers: () => void;
  clearTimers: () => void;
  resetInactivityTimer: () => void;
}

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

const clearStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("mlm_user");
  localStorage.removeItem("auth-storage");
  sessionStorage.removeItem("mlm_active"); // tab close flag
};

const showSessionAlert = (message: string, onConfirm: () => void) => {
  Swal.fire({
    title: "Session Expired",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
    allowOutsideClick: false,
  }).then(onConfirm);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isRestoring: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  inactivityTimer: null,

  loadSessionFromStorage: () => {
    const isPageRefresh = sessionStorage.getItem("mlm_active");

    if (isPageRefresh) {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("mlm_user");

      if (accessToken && userStr) {
        try {
          set({
            isAuthenticated: true,
            isRestoring: false,
            accessToken,
            refreshToken,
            user: JSON.parse(userStr),
          });
          get().startTimers();
          return;
        } catch (e) {
          console.error("Session restore failed:", e);
        }
      }
    }

    clearStorage();
    set({ isAuthenticated: false, isRestoring: false });
  },

  login: (userData, accessToken, refreshToken) => {
    clearStorage();
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("mlm_user", JSON.stringify(userData));
    sessionStorage.setItem("mlm_active", "true");

    set({
      isAuthenticated: true,
      isRestoring: false,
      user: userData,
      accessToken,
      refreshToken,
    });

    get().startTimers();
  },

  logout: () => {
    get().clearTimers();
    clearStorage();
    set({
      isAuthenticated: false,
      isRestoring: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  logoutAndRedirect: () => {
    get().clearTimers();
    clearStorage();
    set({
      isAuthenticated: false,
      isRestoring: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    window.location.href = "/mlm/login";
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  startTimers: () => {
    get().clearTimers();

    const inactivityTimer = setTimeout(() => {
      if (window.location.pathname !== "/mlm/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer });
  },

  clearTimers: () => {
    const { inactivityTimer } = get();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    set({ inactivityTimer: null });
  },

  resetInactivityTimer: () => {
    if (!get().isAuthenticated) return;
    if (get().inactivityTimer) clearTimeout(get().inactivityTimer);

    const inactivityTimer = setTimeout(() => {
      if (window.location.pathname !== "/mlm/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer });
  },
}));