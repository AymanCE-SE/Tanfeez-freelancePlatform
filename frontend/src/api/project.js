import apiClient from "./client";

export const addProject = async (service) => {
    try {
        const response = await apiClient.post("project/create/", service);
        return response
    } catch (error) {
        throw error;
    }
};


export const getAllProject = async (page = 1) => {
    try {
        const response = await apiClient.get("project/", { params: { page } });
        return response
    } catch (error) {
        throw error;
    }
};

export const getProjectById = async (id) => {
    try {
        const response = await apiClient.get(`project/${id}/`);
        return response
    } catch (error) {
        throw error;
    }
}


export const updateProject = async (id, service) => {
    try {
        const response = await apiClient.put(`project/update/${id}/`, service);
        return response
    } catch (error) {
        throw error;
    }
}

export const getMyProjects = async () => {
    try {
        const response = await apiClient.get("project/my-projects/");
        return response
    } catch (error) {
        throw error;
    }
}