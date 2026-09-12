import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addService, getAllServices, getMyServices, getServiceById, updateService, getServicesByTag, getUserServices } from "../../api/service";
import apiClient, { apiOrigin } from '../../api/client';

const initialState = {
    services: [],
    myServices: [],
    service: null,
    latestServices: [],
    isLoading: false,
    error: null,
    totalServices: 0,
    totalServicePages: 1,
    currentServicePage: 1,

};

export const addServiceAction = createAsyncThunk(

    "service/addServiceAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await addService(args);
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

export const getMyServicesAction = createAsyncThunk(

    "service/getMyServicesAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getMyServices();
            return response.data;

        } catch (error) {
            const serializedError = {
                status: error.response?.status,
                data: error.response?.data,
            };
            return rejectWithValue(serializedError);
        }
    });

export const getAllServicesAction = createAsyncThunk(

    "service/getAllServicesAction",
    async (pageOrParams = 1, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        const { page = 1, search = "" } = typeof pageOrParams === "number"
            ? { page: pageOrParams }
            : pageOrParams;
        try {
            const response = await getAllServices(page, search);
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

export const getServiceByIdAction = createAsyncThunk(
    "service/getServiceByIdAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getServiceById(args);
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

export const updateServiceAction = createAsyncThunk(
    "service/updateServiceAction",
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await updateService(args.id, args.data);
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

export const getServicesByTagAction = createAsyncThunk(
    "service/getServicesByTagAction",
    async (tagOrParams, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        const { tag, page = 1 } = typeof tagOrParams === "string"
            ? { tag: tagOrParams }
            : tagOrParams;
        try {
            const response = await getServicesByTag(tag, page);
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

export const getUserServicesAction = createAsyncThunk(
    "service/getUserServicesAction",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await getUserServices(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail ||
                (typeof error.response?.data === "string" ? error.response.data : error.message)
            );
        }
    }
);

export const getLatestServicesAction = createAsyncThunk(
    'service/getLatestServices',
    async (_, thunkAPI) => {
        try {
            const response = await apiClient.get('service/latest/');
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const serviceSlice = createSlice(
    {
        name: "services",
        initialState,
        reducers: {
            clearServices: (state) => {
                state.services = [];
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(getAllServicesAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getAllServicesAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    const payload = Array.isArray(action.payload)
                        ? { results: action.payload, count: action.payload.count || action.payload.length }
                        : action.payload;
                    state.services = payload.results || [];
                    state.totalServices = payload.count || 0;
                    state.totalServicePages = Math.max(1, Math.ceil((payload.count || 0) / 20));
                    state.currentServicePage = action.meta.arg || 1;
                })
                .addCase(getAllServicesAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(addServiceAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(addServiceAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.services.push(action.payload);
                })
                .addCase(addServiceAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(getMyServicesAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getMyServicesAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.myServices = action.payload;
                })
                .addCase(getMyServicesAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(getServiceByIdAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getServiceByIdAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.service = action.payload;
                })
                .addCase(getServiceByIdAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(updateServiceAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(updateServiceAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    const index = state.services.findIndex(service => service.id === action.payload.id);
                    if (index !== -1) {
                        state.services[index] = action.payload;
                    }
                })
                .addCase(updateServiceAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(getServicesByTagAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getServicesByTagAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    const payload = Array.isArray(action.payload)
                        ? { results: action.payload, count: action.payload.count || action.payload.length }
                        : action.payload;
                    // Map the services to ensure photo URLs are complete
                    state.services = (payload.results || []).map(service => ({
                        ...service,
                        photo: service.photo ?
                            (service.photo.startsWith('http') ?
                                service.photo :
                                `${apiOrigin}${service.photo}`
                            ) : null
                    }));
                            state.totalServices = payload.count || 0;
                            state.totalServicePages = Math.max(1, Math.ceil((payload.count || 0) / 20));
                            state.currentServicePage = action.meta.arg?.page || 1;
                })
                .addCase(getServicesByTagAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(getUserServicesAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getUserServicesAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.services = action.payload;
                    state.error = null;
                })
                .addCase(getUserServicesAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
            builder
                .addCase(getLatestServicesAction.pending, (state) => {
                    state.isLoading = true;
                    state.error = null;
                })
                .addCase(getLatestServicesAction.fulfilled, (state, action) => {
                    state.isLoading = false;
                    state.latestServices = Array.isArray(action.payload) ? action.payload : [];
                })
                .addCase(getLatestServicesAction.rejected, (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                });
        },
    }
)

export const { clearServices } = serviceSlice.actions;
export const serviceReducer = serviceSlice.reducer;