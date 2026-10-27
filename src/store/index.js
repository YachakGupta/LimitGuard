import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import tokenReducer from '../features/token/tokenSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    dashboard: dashboardReducer,
    token: tokenReducer,
  },
});
