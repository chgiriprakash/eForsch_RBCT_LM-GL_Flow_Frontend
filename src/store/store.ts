import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/Auth/authSlice';
import dashboardReducer from '../modules/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;