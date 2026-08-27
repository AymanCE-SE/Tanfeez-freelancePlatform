import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../api/auth";


// const access_token = response.data.access_token;
// localStorage.setItem('authToken', access_token);
const saveTokenToLocalStorage = (access_token) => {
    localStorage.setItem('authToken', access_token);
};
const saveRefreshTokenToLocalStorage = (refresh_token) => {
    localStorage.setItem('refreshToken', refresh_token);
};
const saveUserToLocalStorage = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

const removeTokenFromLocalStorage = () => {
    localStorage.removeItem('authToken');
};
const removeRefreshTokenFromLocalStorage = () => {
    localStorage.removeItem('refreshToken');
};
const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
};

const getTokenFromLocalStorage = () => {
    const access_token = localStorage.getItem('authToken');
    return access_token ? access_token : null;
};
const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const initialState = {
    token: getTokenFromLocalStorage(),
    isLoggedIn: getTokenFromLocalStorage() ? true : false,
    user: getUserFromLocalStorage(),
    isLoading: false,
    error: null,
};

// Login action
export const loginAction = createAsyncThunk(
    "auth/loginAction",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginUser(credentials);
            return response.data;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
);

// Register action
export const registerAction = createAsyncThunk(
    "auth/registerAction",
    async (newUser, { rejectWithValue }) => {
        try {
            const response = await registerUser(newUser);
            return response.data;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
);

const authSlice = createSlice(
    {
        name: 'auth',
        initialState,
        reducers: {
            logout: (state) => {
                state.token = null;
                state.isLoggedIn = false;
                removeTokenFromLocalStorage();
                removeRefreshTokenFromLocalStorage();
                removeUserFromLocalStorage();
            },
        },
        extraReducers: (builder) => {
            // Login
            builder.addCase(loginAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            });
            builder.addCase(loginAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                state.isLoggedIn = true;
                saveTokenToLocalStorage(action.payload.access_token);
                saveRefreshTokenToLocalStorage(action.payload.refresh_token);
                saveUserToLocalStorage(action.payload.user);
            });
            builder.addCase(loginAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

            // Register
            builder.addCase(registerAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            });
            builder.addCase(registerAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.token = action.payload;
                // saveTokenToLocalStorage(action.payload);
            });
            builder.addCase(registerAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
        },

    }
);

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;