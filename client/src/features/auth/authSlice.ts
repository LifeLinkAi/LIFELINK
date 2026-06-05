import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ── Bootstrap from localStorage so Redux is never stale on page reload ──────
function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, loading: false };
  }
  try {
    const token    = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      const user = JSON.parse(userJson) as AuthUser;
      return { user, isAuthenticated: true, loading: false };
    }
  } catch {
    // Ignore malformed data
  }
  return { user: null, isAuthenticated: false, loading: false };
}

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
