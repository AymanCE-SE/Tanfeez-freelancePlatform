/** @format */

import apiClient from "./client";

// Function to authenticate user
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("user/login/", credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

// Register: Add a new user
export const registerUser = async (newUser) => {
  try {
    const formData = new FormData();
    for (const key in newUser) {
      formData.append(key, newUser[key]);
    }
    const createUserResponse = await apiClient.post(
      "user/register/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return createUserResponse.data;
  } catch (error) {
    throw error;
  }
};

// Function to get update user password
export const updatePassword = async (passwordData) => {
  try {
    // Validate password data before sending
    if (
      !passwordData.old_password ||
      !passwordData.new_password ||
      !passwordData.new_password_confirm
    ) {
      throw new Error("All password fields are required");
    }

    // Validate new passwords match
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      throw new Error("New passwords do not match");
    }

    const response = await apiClient.put(
      "user/password/update/",
      {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.new_password_confirm,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Check if response contains data
    if (response.data) {
      return response.data;
    }

    throw new Error("No response from server");
  } catch (error) {
    // Handle specific API errors
    if (error.response) {
      const errorData = error.response.data;

      // Handle validation errors
      if (error.response.status === 400) {
        throw {
          message:
            errorData.detail ||
            errorData.old_password?.[0] ||
            errorData.new_password?.[0] ||
            errorData.new_password_confirm?.[0] ||
            "Invalid password data",
        };
      }

      // Handle unauthorized errors
      if (error.response.status === 401) {
        throw {
          message: "Please log in again to update your password",
        };
      }

      // Handle other API errors
      throw {
        message:
          errorData.detail || errorData.message || "Password update failed",
      };
    }

    // Handle network or other errors
    throw {
      message: error.message || "Failed to update password. Please try again.",
    };
  }
};

// Function to get user profile data
export const getUserProfile = async (id) => {
  try {
    const response = await apiClient.get(`user/user-profile/${id}/`);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error("User profile not found");
      }
      if (error.response.status === 401) {
        throw new Error("Please login to view this profile");
      }
    }
    throw new Error("Failed to fetch user profile");
  }
};
