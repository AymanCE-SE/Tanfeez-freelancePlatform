import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteUser, getAllUsers, getMyClientProfile, getMyFreelancerProfile, getMyProfile, updateClientProfile, updateFreelancerProfile, updateUserImage, updateUserProfile } from "../../api/user";
import { getUserProfile } from "../../api/auth";
import adminService from "../../api/adminService";


const saveUserToLocalStorage = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
};

const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const initialState = {
    user: "",
    profile: null,
    users: null,
    freelancer: "",
    client: "",
    isLoading: false,
    error: null,

};

export const getMyProfileAction = createAsyncThunk(

    "user/getMyProfileAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getMyProfile();
            return response.data;

        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)

export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getUserProfile(args);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getMyFreelancerProfileAction = createAsyncThunk(

    "user/getMyFreelancerProfileAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getMyFreelancerProfile();
            return response.data;

        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)
export const getMyClientProfileAction = createAsyncThunk(

    "user/getMyClientProfileAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getMyClientProfile();
            return response.data;

        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)


export const updateUserImageAction = createAsyncThunk(
    "user/updateUserImageAction",
    async (image, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await updateUserImage(image);
            return response;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)

export const updateUserProfileAction = createAsyncThunk(
    "user/updateUserProfileAction",
    async (formData, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await updateUserProfile(formData);
            return response;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)
export const updateFreelancerProfileAction = createAsyncThunk(
    "user/updateFreelancerProfileAction",
    async (formData, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await updateFreelancerProfile(formData);
            return response;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
)
export const updateClientProfileAction = createAsyncThunk(
    "user/updateClientProfileAction",
    async (formData, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await updateClientProfile(formData);
            return response;
        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    }
);

export const getAllUsersAction = createAsyncThunk(
    "user/getAllUsersAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            console.log("first")
            const response = await getAllUsers();
            console.log(response.data)
            return response.data;

        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    })

    export const deleteUserAction = createAsyncThunk(
        "user/deleteUserAction",
        async (userId, thunkAPI) => {
            const { rejectWithValue } = thunkAPI;
            try {
                const response = await adminService.deleteUser(userId);
                return response.data;
    
            } catch (error) {
                console.log("dd",error)
                const serializedError = {
                    status: error.response?.status,
                    data: error.response?.data,
                };
                return rejectWithValue(serializedError);
            }
        }
    )

const userSlice = createSlice(
    {
        name: "user",
        initialState,
        reducers: {
            clearProfile: (state) => {
                state.profile = null;
                state.error = null;
            }
        },
        reducers: {
            clearProfile: (state) => {
                state.profile = null;
                state.error = null;
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(getMyProfileAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getMyProfileAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.user = action.payload;
                })
                .addCase(getMyProfileAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder.addCase(updateUserImageAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(updateUserImageAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                const photoUrl = `http://127.0.0.1:8000${action.payload.photo}`;
                if (state.user) state.user.photo = photoUrl;
                if (state.profile) state.profile.photo = photoUrl; // <-- Add this line
            }).addCase(updateUserImageAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            }
            );

            builder.addCase(updateUserProfileAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(updateUserProfileAction.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedUser = { ...state.user, ...action.payload };
                state.user = updatedUser;
                saveUserToLocalStorage(updatedUser);
            }).addCase(updateUserProfileAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder.addCase(getMyFreelancerProfileAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(getMyFreelancerProfileAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.freelancer = action.payload;
            }).addCase(getMyFreelancerProfileAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder.addCase(getMyClientProfileAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(getMyClientProfileAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.client = action.payload;
            }).addCase(getMyClientProfileAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder.addCase(updateFreelancerProfileAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(updateFreelancerProfileAction.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedUser = { ...state.freelancer, ...action.payload };
                state.freelancer = updatedUser;
                // saveUserToLocalStorage(updatedUser);
            }).addCase(updateFreelancerProfileAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder
                .addCase(fetchUserProfile.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(fetchUserProfile.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.profile = action.payload;
                })
                .addCase(fetchUserProfile.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder.addCase(updateClientProfileAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(updateClientProfileAction.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedUser = { ...state.client, ...action.payload };
                state.client = updatedUser;
                // saveUserToLocalStorage(updatedUser);
            }).addCase(updateClientProfileAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder.addCase(getAllUsersAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(getAllUsersAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            }).addCase(getAllUsersAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            builder.addCase(deleteUserAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            }).addCase(deleteUserAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter(user => user.id !== action.payload);
            }).addCase(deleteUserAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
        },

    }
)

export const { clearProfile } = userSlice.actions;
export const userReducer = userSlice.reducer;