import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/client';

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.me();
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Failed to authenticate session',
        status: err.status || 500,
      });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Login failed',
        status: err.status || 500,
      });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData);
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Registration failed',
        status: err.status || 500,
      });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.logout();
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Logout failed',
        status: err.status || 500,
      });
    }
  }
);

const initialState = {
  user: null,
  initializing: true,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder
      .addCase(fetchMe.pending, (state) => {
        state.initializing = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initializing = false;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.initializing = false;
        // error only if status !== 401
        state.error = action.payload?.status !== 401
          ? (action.payload?.message || 'Authentication error')
          : null;
      });

    // login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      });

    // logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        // on fulfilled OR 401 -> user=null; other errors -> show error
        if (action.payload?.status === 401) {
          state.user = null;
          state.error = null;
        } else {
          state.error = action.payload?.message || 'Logout failed';
        }
      });
  },
});

export const { clearError } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsInitializing = (state) => state.auth.initializing;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
