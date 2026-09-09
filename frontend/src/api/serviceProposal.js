import apiClient from "./client";

export const createServiceProposal = async (proposal) => {
  try {
    const response = await apiClient.post("service-proposal/apply/", proposal);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMyServiceProposals = async () => {
  try {
    const response = await apiClient.get("service-proposal/my-proposals/");
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateServiceProposal = async (proposalId, data) =>
  apiClient.patch(`service-proposal/update/${proposalId}/`, data);

export const approveServiceProposal = async (proposalId) =>
  apiClient.post(`service-proposal/approve/${proposalId}/`, {});

export const completeServiceProposal = async (proposalId) =>
  apiClient.post(`service-proposal/complete/${proposalId}/`, {});

export const getServiceProposalsByService = async (serviceId) => {
  try {
    const response = await apiClient.get(`service-proposal/all-proposals-by-serviceId/${serviceId}/`);
    return response;
  } catch (error) {
    throw error;
  }
};