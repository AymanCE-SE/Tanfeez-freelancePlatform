import apiClient from "./client";

export const addService = async (service) => {
    try {
        const response = await apiClient.post("user/create/", service);
        return response
    } catch (error) {
        throw error;
    }
};


export const getMyProfile = async () => {
    try {
        const response = await apiClient.get("user/user-profile/");
        return response
    } catch (error) {
        throw error;
    }
};


export const getMyFreelancerProfile = async () => {
    try {
        const response = await apiClient.get("freelancers/detail/");
        return response
    } catch (error) {
        throw error;
    }
};
export const getMyClientProfile = async () => {
    try {
        const response = await apiClient.get("clients/detail/");
        return response
    } catch (error) {
        throw error;
    }
};



export const updateUserImage = async (formData) => {
    try {
        const response = await apiClient.patch("user/photo/update/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data
    } catch (error) {
        throw error;
    }
}


export const updateUserProfile = async (formData) => {
    try {
        const response = await apiClient.patch("user/update/", formData);
        return response.data
    } catch (error) {
        throw error;
    }
}
export const updateFreelancerProfile = async (formData) => {
    try {
        const response = await apiClient.patch("freelancers/update/", formData);
        return response.data
    } catch (error) {
        throw error;
    }
}
export const updateClientProfile = async (formData) => {
    try {
        const response = await apiClient.patch("clients/update/", formData);
        return response.data
    } catch (error) {
        throw error;
    }
}


export const getAllUsers = async () => {

    try {
        const response = await apiClient.get("user/all/");
        return response
    } catch (error) {
        throw error;
    }
}

export const deleteUser = async () => {
    try {
        const response = await apiClient.delete(`user/delete/`);
        return response
    } catch (error) {
        throw error;
    }
}

export const getUserProfile = async (userId) => {
    try {
        const response = await apiClient.get(`user/user-profile/${userId}/`);
        return response.data
    } catch (error) {
        throw error;
    }
}
