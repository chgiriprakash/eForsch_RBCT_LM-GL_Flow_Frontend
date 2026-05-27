import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../../shared/api/axiosClient';

interface User {
  status: string;
  groupName: string;
  role: string;
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  groups: Group[];
  groupNames: string[];
  roles: Role[];
  forgotPasswordSuccess: boolean;
  enterOtp?: string;
  resetPasswordSuccess?: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,
  groups: [],
  groupNames: [],
  roles: [],
  forgotPasswordSuccess: false, 
  enterOtp: undefined,
  resetPasswordSuccess: false,
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface GroupData {
  groupName: string;
}

interface AuthResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

interface GroupResponse {
  data: {
    group: Group;
  };
}

interface RolesResponse {
  roles: Role[];
}

// interface ForgotPasswordResponse {
//   message: string;
// }

interface ApiResponse<T = any> {
  code: number;
  status: string;
  message: string;
  data: T;
  pagination?: any;
  columns?: any;
}

// interface ValidateOtpData {
//   otp: string;
// }

interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  email: string;
}

/* ============================
   AUTH THUNKS
============================ */

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<AuthResponse>('auth/login', credentials);

      const user = response.data.data.user;

      const normalizedRole = (() => {
        const role = user.role?.toLowerCase();
        if (!role) return '';
        if (role === 'administrator' || role === 'admin') return 'admin';
        if (role === 'group leader' || role === 'groupleader') return 'groupleader';
        if (role === 'lab management' || role === 'labmanagement') return 'labMgmt';
        return role;
      })();

      const normalizedUser = { ...user, role: normalizedRole };

      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      return {
        ...response.data,
        data: {
          ...response.data.data,
          user: normalizedUser,
        },
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, any>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<AuthResponse>('auth/createUser', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Registration failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk<null, string>(
  'auth/logout',
  async (token, { rejectWithValue }) => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      await axiosClient.post('auth/logout', { token });
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Logout failed'
      );
    }
  }
);

export const getRoles = createAsyncThunk<RolesResponse>(
  'auth/roles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<RolesResponse>('auth/roles');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch roles'
      );
    }
  }
);

export const createGroup = createAsyncThunk<GroupResponse, GroupData>(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<GroupResponse>('groups/createGroup', groupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Failed to create group'
      );
    }
  }
);

export const getGroupNames = createAsyncThunk<any>(
  'groups/getAllGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>('groups/getAllGroups');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch groups'
      );
    }
  }
);

// 🔹 Send OTP (Verify Email)
export const sendOtp = createAsyncThunk<
  any,
  { email: string }
>(
  "auth/validateEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>(
        "auth/validateEmail",
        { email }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Failed to send OTP"
      );
    }
  }
);

// 🔹 Send OTP (Verify Email)
export const validateOTP = createAsyncThunk<
  any,
   { otp: string, email: string }
>(
  "auth/validateOTP",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>(
        "auth/validateOTP",
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Failed to send OTP"
      );
    }
  }
);

// 🔹 Send OTP (Verify Email)
export const resendOTPForEmail = createAsyncThunk<
  any,
  { email: string }
>(
  "auth/resendOTPForEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>(
        "auth/resendOTPForEmail",
        { email }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Failed to send OTP"
      );
    }
  }
);

// 🔹 Forgot Password API
export const forgotPassword = createAsyncThunk<
  any,
  { email: string }
>(
  "auth/forgot-password",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>('auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Failed to send OTP email"
      );
    }
  }
);

// 🔹 Validate OTP
export const enterOtp = createAsyncThunk<
  any,
  { otp: string, email: string }
>(
  'auth/otp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>(
        'auth/otp',
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Failed to verify OTP'
      );
    }
  }
);

// 🔹 Validate OTP
export const resendOtp = createAsyncThunk<
  any,
  { email: string }
>(
  'auth/resend-otp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        'auth/resend-otp',
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        'Failed to resend OTP'
      );
    }
  }
);

// 🔹 Reset Password
export const resetPassword = createAsyncThunk<
  ApiResponse,
  ResetPasswordRequest
>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<ApiResponse>(
        'auth/reset-password',
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        'Password reset failed'
      );
    }
  }
);

/* ============================
   SLICE
============================ */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.groups = [];
      state.forgotPasswordSuccess = false;
      state.enterOtp = undefined;
      state.resetPasswordSuccess = false;
    },
    resetForgotPasswordState: (state) => {
      state.forgotPasswordSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.forgotPasswordSuccess = false;
      })

      .addCase(enterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.enterOtp = undefined;
      })
      .addCase(enterOtp.fulfilled, (state) => {
        state.loading = false;
        state.enterOtp = "OTP verified successfully";
      })
      .addCase(enterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.enterOtp = undefined;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.resetPasswordSuccess = false;
      })

      // 🔹 VALIDATE OTP (Email Verification)
      .addCase(validateOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOTP.fulfilled, (state) => {
        state.loading = false;
        state.enterOtp = "OTP verified successfully";
      })
      .addCase(validateOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 RESEND OTP (Email Verification)
      .addCase(resendOTPForEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTPForEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOTPForEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

      // 🔹 SEND OTP (Verify Email)
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 RESEND OTP
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GROUPS
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload.data.group);
      })
      .addCase(getGroupNames.fulfilled, (state, action) => {
        state.groupNames = action.payload || [];
      })

      // ROLES
      .addCase(getRoles.fulfilled, (state, action) => {
        state.roles = action.payload.roles;
      });
  },
});

export const {
  setUser,
  clearAuthState,
  resetForgotPasswordState,
} = authSlice.actions;

export default authSlice.reducer;