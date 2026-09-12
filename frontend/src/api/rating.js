import apiClient from "./client";

export const createEngagementRating = async (data) => {
  const response = await apiClient.post("client-ratings/engagement/create/", data);
  return response.data;
};

export const getMyEngagementRating = async ({ project, service, ratee }) => {
  const params = {};
  if (project) params.project = project;
  if (service) params.service = service;
  if (ratee) params.ratee = ratee;
  const response = await apiClient.get("client-ratings/engagement/mine/", { params });
  return response.data;
};

export const getEngagementRatingSummary = async (userId, direction) => {
  const response = await apiClient.get(`client-ratings/engagement/summary/${userId}/`, {
    params: direction ? { direction } : {},
  });
  return response.data;
};

export const getEngagementRatings = async (userId, { direction, service } = {}) => {
  const response = await apiClient.get(`client-ratings/engagement/list/${userId}/`, {
    params: { ...(direction && { direction }), ...(service && { service }) },
  });
  return response.data;
};