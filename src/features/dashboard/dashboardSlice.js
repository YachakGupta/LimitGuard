import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import {
  adaptOverview,
  adaptTokenSavings,
  adaptActivity,
  adaptRiskDistribution,
  adaptRecentActivity,
} from '../../api/adapters';

const isMockMode = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true';

// Initial state matching specifications
const initialState = {
  overview: null,
  tokenSavings: [],
  activity: [],
  riskDistribution: [],
  recent: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  errors: {
    overview: null,
    tokenSavings: null,
    activity: null,
    riskDistribution: null,
    recent: null,
  },
};

/**
 * Main dashboard fetch thunk.
 * Uses Promise.allSettled so one failing widget does not break others.
 */
export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    // If mock mode is explicitly enabled
    if (isMockMode) {
      return {
        overview: adaptOverview({ mock: true }),
        tokenSavings: adaptTokenSavings({ mock: true }),
        activity: adaptActivity({ mock: true }),
        riskDistribution: adaptRiskDistribution({ mock: true }),
        recent: adaptRecentActivity({ mock: true }),
        errors: {
          overview: null,
          tokenSavings: null,
          activity: null,
          riskDistribution: null,
          recent: null,
        },
      };
    }

    const results = await Promise.allSettled([
      request(ENDPOINTS.dashboard.overview),
      request(ENDPOINTS.dashboard.tokenSavings),
      request(ENDPOINTS.dashboard.activity),
      request(ENDPOINTS.dashboard.riskDistribution),
      request(ENDPOINTS.dashboard.recent),
    ]);

    const [resOverview, resSavings, resActivity, resRisk, resRecent] = results;

    const errors = {
      overview: resOverview.status === 'rejected' ? (resOverview.reason?.message || 'Failed to load overview') : null,
      tokenSavings: resSavings.status === 'rejected' ? (resSavings.reason?.message || 'Failed to load token savings') : null,
      activity: resActivity.status === 'rejected' ? (resActivity.reason?.message || 'Failed to load activity') : null,
      riskDistribution: resRisk.status === 'rejected' ? (resRisk.reason?.message || 'Failed to load risk distribution') : null,
      recent: resRecent.status === 'rejected' ? (resRecent.reason?.message || 'Failed to load recent activity') : null,
    };

    return {
      overview: resOverview.status === 'fulfilled' ? adaptOverview(resOverview.value) : null,
      tokenSavings: resSavings.status === 'fulfilled' ? adaptTokenSavings(resSavings.value) : [],
      activity: resActivity.status === 'fulfilled' ? adaptActivity(resActivity.value) : [],
      riskDistribution: resRisk.status === 'fulfilled' ? adaptRiskDistribution(resRisk.value) : [],
      recent: resRecent.status === 'fulfilled' ? adaptRecentActivity(resRecent.value) : [],
      errors,
    };
  }
);

/**
 * Individual widget retry thunks
 */
export const retryOverview = createAsyncThunk('dashboard/retryOverview', async () => {
  if (isMockMode) return adaptOverview({ mock: true });
  const data = await request(ENDPOINTS.dashboard.overview);
  return adaptOverview(data);
});

export const retryTokenSavings = createAsyncThunk('dashboard/retryTokenSavings', async () => {
  if (isMockMode) return adaptTokenSavings({ mock: true });
  const data = await request(ENDPOINTS.dashboard.tokenSavings);
  return adaptTokenSavings(data);
});

export const retryActivity = createAsyncThunk('dashboard/retryActivity', async () => {
  if (isMockMode) return adaptActivity({ mock: true });
  const data = await request(ENDPOINTS.dashboard.activity);
  return adaptActivity(data);
});

export const retryRiskDistribution = createAsyncThunk('dashboard/retryRiskDistribution', async () => {
  if (isMockMode) return adaptRiskDistribution({ mock: true });
  const data = await request(ENDPOINTS.dashboard.riskDistribution);
  return adaptRiskDistribution(data);
});

export const retryRecent = createAsyncThunk('dashboard/retryRecent', async () => {
  if (isMockMode) return adaptRecentActivity({ mock: true });
  const data = await request(ENDPOINTS.dashboard.recent);
  return adaptRecentActivity(data);
});

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardErrors: (state) => {
      state.error = null;
      state.errors = {
        overview: null,
        tokenSavings: null,
        activity: null,
        riskDistribution: null,
        recent: null,
      };
    },
  },
  extraReducers: (builder) => {
    // fetchDashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { overview, tokenSavings, activity, riskDistribution, recent, errors } = action.payload;

        if (overview !== null) state.overview = overview;
        if (tokenSavings?.length) state.tokenSavings = tokenSavings;
        if (activity?.length) state.activity = activity;
        if (riskDistribution?.length) state.riskDistribution = riskDistribution;
        if (recent?.length) state.recent = recent;

        state.errors = errors || {};

        // If every single widget failed
        const allFailed = Object.values(errors || {}).every(Boolean);
        if (allFailed && Object.keys(errors || {}).length > 0) {
          state.status = 'failed';
          state.error = 'Failed to load dashboard data. Please try again.';
        }
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Failed to load dashboard data';
      });

    // Individual retries
    builder
      .addCase(retryOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.errors.overview = null;
      })
      .addCase(retryOverview.rejected, (state, action) => {
        state.errors.overview = action.error?.message || 'Failed to load overview';
      })
      .addCase(retryTokenSavings.fulfilled, (state, action) => {
        state.tokenSavings = action.payload;
        state.errors.tokenSavings = null;
      })
      .addCase(retryTokenSavings.rejected, (state, action) => {
        state.errors.tokenSavings = action.error?.message || 'Failed to load token savings';
      })
      .addCase(retryActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
        state.errors.activity = null;
      })
      .addCase(retryActivity.rejected, (state, action) => {
        state.errors.activity = action.error?.message || 'Failed to load activity';
      })
      .addCase(retryRiskDistribution.fulfilled, (state, action) => {
        state.riskDistribution = action.payload;
        state.errors.riskDistribution = null;
      })
      .addCase(retryRiskDistribution.rejected, (state, action) => {
        state.errors.riskDistribution = action.error?.message || 'Failed to load risk distribution';
      })
      .addCase(retryRecent.fulfilled, (state, action) => {
        state.recent = action.payload;
        state.errors.recent = null;
      })
      .addCase(retryRecent.rejected, (state, action) => {
        state.errors.recent = action.error?.message || 'Failed to load recent activity';
      });
  },
});

export const { clearDashboardErrors } = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state) => state.dashboard;
export const selectOverview = (state) => state.dashboard.overview;
export const selectTokenSavings = (state) => state.dashboard.tokenSavings;
export const selectActivity = (state) => state.dashboard.activity;
export const selectRiskDistribution = (state) => state.dashboard.riskDistribution;
export const selectRecentActivity = (state) => state.dashboard.recent;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardErrors = (state) => state.dashboard.errors;

export default dashboardSlice.reducer;
