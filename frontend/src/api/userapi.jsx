import apiClient from "./client";

const getAllUsers = () => apiClient.get("user/");
const getUserById = (userId) => apiClient.get(`user/${userId}`);
const addNewUser = (user) => apiClient.post("user/", user);
const editUser = (userId, user) => apiClient.put(`user/${userId}`, user);
const deleteUser = (userId) => apiClient.delete(`user/${userId}`);

export { getAllUsers, getUserById, addNewUser, editUser, deleteUser };
