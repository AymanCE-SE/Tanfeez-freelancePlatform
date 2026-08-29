import apiClient from "./client";

export const getNotifications = async () => {
  const response = await apiClient.get("notifications/");
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiClient.post("notifications/mark-read/");
  return response.data;
};