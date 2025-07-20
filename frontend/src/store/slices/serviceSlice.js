import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addService, getAllServices, getMyServices, getServiceById, updateService, getServicesByTag, getUserServices } from "../../api/service";
import axios from 'axios';

const initialState = {
    services: [],
    myServices: [],
    service: null,
    latestServices: [],
    isLoading: false,
    error: null,

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
            console.log(response.data);
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
    async (args, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getAllServices();
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
            console.log(response.data);
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
            console.log(args)
            const response = await updateService(args.id, args.data);
            console.log(response.data);
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
    async (tag, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await getServicesByTag(tag);
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
            const response = await axios.get('http://127.0.0.1:8000/api/service/latest/');
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
                    state.services = action.payload;
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
                    // Map the services to ensure photo URLs are complete
                    state.services = action.payload.map(service => ({
                        ...service,
                        photo: service.photo ?
                            (service.photo.startsWith('http') ?
                                service.photo :
                                `http://127.0.0.1:8000${service.photo}`
                            ) : null
                    }));
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