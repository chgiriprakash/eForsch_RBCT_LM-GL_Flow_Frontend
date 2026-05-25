import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../../shared/api/axiosClient';

interface User {
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
  groups: Group[]; // Store fetched groups
  groupNames: string[]; // Store group names
  roles: Role[]; // ✅ New field to store roles
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
};

interface LoginCredentials {
  email: string;
  password: string;
}

// interface RegisterUserData {
//   name: string;
//   email: string;
//   password: string;
// }

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

// interface GroupListResponse {
//   data: {
//     groups: Group[];
//   };
// }

interface RolesResponse {
  roles: Role[];
}

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<AuthResponse>('auth/login', credentials);

      const user = response.data.data.user;

      // Normalize role
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
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
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
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
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
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const getRoles = createAsyncThunk<RolesResponse>(
  'auth/roles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<RolesResponse>('auth/roles');
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Create a new group
export const createGroup = createAsyncThunk<GroupResponse, GroupData>(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<GroupResponse>('groups/createGroup', groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Fetch group names
export const getGroupNames = createAsyncThunk<any>(
  'groups/getAllGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>('groups/getAllGroups');
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

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
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload.data.group);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(getGroupNames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupNames.fulfilled, (state, action) => {
        state.loading = false;
        state.groupNames = action.payload || [];
      })
      .addCase(getGroupNames.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { setUser, clearAuthState } = authSlice.actions;
export default authSlice.reducer;