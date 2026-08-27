import apiClient from "./client";
export const addService = async (service) => {
    try {
        const response = await apiClient.post("service/create/", service, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response
    } catch (error) {
        throw error;
    }
};


export const getAllServices = async () => {
    try {
        const response = await apiClient.get("service/");
        return response
    } catch (error) {
        throw error;
    }
};

export const getMyServices = async () => {
    try {
        const response = await apiClient.get("service/personal-services/");
        return response
    } catch (error) {
        throw error;
    }
}



export const getServiceById = async (id) => {
    try {
        const response = await apiClient.get(`service/${id}/`);
        return response
    } catch (error) {
        throw error;
    }
}

export const updateService = async (id, service) => {
    try {
        const response = await apiClient.put(`service/update/${id}/`, service, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response
    } catch (error) {
        throw error;
    }
};

export const getServicesByTag = async (tag) => {
    try {
        const response = await apiClient.get(`service/by-tag/?tag=${tag}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getUserServices = async (userId) => {
    try {
        const response = await apiClient.get(`service/user/${userId}/`);
        return response;
    } catch (error) {
        throw error;
    }
};