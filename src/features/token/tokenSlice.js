import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { adaptToken } from '../../api/adapters';

const isMockMode = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true';

const initialState = {
  value: null,
  createdAt: null,
  expiresAt: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  showOnceRevealed: false,
};

/**
 * Thunk: fetchToken
 * Checks/retrieves existing token if available
 */
export const fetchToken = createAsyncThunk(
  'token/fetchToken',
  async (_, { rejectWithValue }) => {
    try {
      if (isMockMode) {
        return adaptToken({ mock: true });
      }
      const data = await request(ENDPOINTS.token.get);
      return adaptToken(data);
    } catch (err) {
      // 404 or 400 when no token exists yet is a normal initial state
      if (err.status === 404 || err.status === 400) {
        return { value: null };
      }
      return rejectWithValue(err.message || 'Failed to retrieve extension token');
    }
  }
);

/**
 * Thunk: generateToken
 * Creates or rotates token. If regenerate is requested and rotate endpoint is defined, uses rotate.
 */
export const generateToken = createAsyncThunk(
  'token/generateToken',
  async (isRegenerating = false, { rejectWithValue }) => {
    try {
      if (isMockMode) {
        const randHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        return {
          value: `lg_live_${randHex}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          showOnce: false,
        };
      }

      const endpoint = isRegenerating && ENDPOINTS.token.rotate
        ? ENDPOINTS.token.rotate
        : ENDPOINTS.token.generate;

      const data = await request(endpoint, { method: 'POST' });
      const adapted = adaptToken(data);
      // If backend explicitly flags that the secret is shown only once
      adapted.showOnce = Boolean(data?.showOnce || data?.revealedOnce);
      return adapted;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to generate token');
    }
  }
);

export const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearTokenError: (state) => {
      state.error = null;
    },
    resetTokenState: (state) => {
      state.value = null;
      state.createdAt = null;
      state.expiresAt = null;
      state.status = 'idle';
      state.error = null;
      state.showOnceRevealed = false;
    },
    markShowOnceSeen: (state) => {
      state.showOnceRevealed = false;
    },
  },
  extraReducers: (builder) => {
    // fetchToken
    builder
      .addCase(fetchToken.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload?.value || null;
        state.createdAt = action.payload?.createdAt || null;
        state.expiresAt = action.payload?.expiresAt || null;
        state.error = null;
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to load token';
      });

    // generateToken
    builder
      .addCase(generateToken.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload?.value || null;
        state.createdAt = action.payload?.createdAt || null;
        state.expiresAt = action.payload?.expiresAt || null;
        state.showOnceRevealed = Boolean(action.payload?.showOnce);
        state.error = null;
      })
      .addCase(generateToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to generate token';
      });
  },
});

export const { clearTokenError, resetTokenState, markShowOnceSeen } = tokenSlice.actions;

export const selectToken = (state) => state.token.value;
export const selectTokenStatus = (state) => state.token.status;
export const selectTokenError = (state) => state.token.error;
export const selectTokenDetails = (state) => state.token;

export default tokenSlice.reducer;
