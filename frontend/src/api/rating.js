import apiClient from "./client";

export const createEngagementRating = async (data) => {
  const response = await apiClient.post("client-ratings/engagement/create/", data);
  return response.data;
};

export const getMyEngagementRating = async ({ project, service }) => {
  const params = project ? { project } : { service };
  const response = await apiClient.get("client-ratings/engagement/mine/", { params });
  return response.data;
};

export const getEngagementRatingSummary = async (userId) => {
  const response = await apiClient.get(`client-ratings/engagement/summary/${userId}/`);
  return response.data;
};

export const getEngagementRatings = async (userId) => {
  const response = await apiClient.get(`client-ratings/engagement/list/${userId}/`);
  return response.data;
};