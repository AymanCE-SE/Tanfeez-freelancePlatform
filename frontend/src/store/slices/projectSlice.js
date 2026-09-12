/** @format */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addProject, getAllProject, getMyProjects, getProjectById, getUserProjects } from "../../api/project";
import apiClient from '../../api/client';

const initialState = {
  projectList: [],
  createdProject: null,
  myProjectList: [],
  userProjectList: [],
  isLoading: false,
  error: null,
  projectDetails: null,
  latestProjects: [],
  totalProjects: 0,
  totalProjectPages: 1,
  currentProjectPage: 1,
};

const getProjectByIdAction = createAsyncThunk(
  "project/getProjectByIdAction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getProjectById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        (typeof error.response?.data === "string" ? error.response.data : error.message)
      );
    }
  }
);

export const getMyProjectsAction = createAsyncThunk(

  "service/getMyProjectsAction",
  async (args, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await getMyProjects();
      return response.data;

    } catch (error) {
      const serializedError = {
        status: error.response?.status,
        data: error.response?.data,
      };
      return rejectWithValue(serializedError);
    }
  });

export const getUserProjectsAction = createAsyncThunk(
  "project/getUserProjectsAction",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserProjects(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);


const getAllProjectAction = createAsyncThunk(
  "project/getAllProjectAction",
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await getAllProject(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        (typeof error.response?.data === "string" ? error.response.data : error.message)
      );
    }
  }
);

const createProjectAction = createAsyncThunk(
  "project/createProjectAction",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await addProject(projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.message)
      );
    }
  }
);

 const getLatestProjectsAction = createAsyncThunk(
  'project/getLatestProjects',
  async (_, thunkAPI) => {
    try {
    const response = await apiClient.get('project/latest/');      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProjectAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProjectAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = Array.isArray(action.payload)
          ? { results: action.payload, count: action.payload.count || action.payload.length }
          : action.payload;
        state.projectList = (payload.results || []).filter(project => {
          // Check if clientId exists and is not null/undefined
          return project.clientId && project.user_id;
        });
        state.totalProjects = payload.count || 0;
        state.totalProjectPages = Math.max(1, Math.ceil((payload.count || 0) / 20));
        state.currentProjectPage = action.meta.arg || 1;
      })
      .addCase(getAllProjectAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProjectAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createdProject = null;
      })
      .addCase(createProjectAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createdProject = action.payload;
        // state.projectList = [action.payload, ...state.projectList];
      })
      .addCase(createProjectAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    builder
      .addCase(getProjectByIdAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.projectDetails = null;
      })
      .addCase(getProjectByIdAction.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only set projectDetails if the project's client still exists
        if (action.payload.clientId && action.payload.user_id) {
          state.projectDetails = action.payload;
        } else {
          state.error = "Project's client no longer exists";
          state.projectDetails = null;
        }
      })
      .addCase(getProjectByIdAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.projectDetails = null;
      });
    builder
      .addCase(getMyProjectsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyProjectsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProjectList = action.payload;
      })
      .addCase(getMyProjectsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserProjectsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.userProjectList = [];
      })
      .addCase(getUserProjectsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProjectList = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.results || [];
      })
      .addCase(getUserProjectsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getLatestProjectsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLatestProjectsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestProjects = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getLatestProjectsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const projectReducer = projectSlice.reducer;
export { createProjectAction, getAllProjectAction, getProjectByIdAction, getLatestProjectsAction };