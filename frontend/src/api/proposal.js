import apiClient from "./client";

export const addProposal = async (proposal) => apiClient.post("project-proposal/apply/", proposal);

export const getProposalsByProject = async (projectId) => {
  try {
    return await apiClient.get(`project-proposal/proposals/${projectId}/`);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    throw error;
  }
};

export const getPublicProposalsByProject = async (projectId) => {
  const response = await apiClient.get(`project-proposal/public/${projectId}/`);
  return response.data;
};

export const approveProposal = async (proposalId) => apiClient.post(`project-proposal/approve/${proposalId}/`, {});

export const finishProject = async (proposalId) => apiClient.post(`project-proposal/finish/${proposalId}/`, {});

export const getMyProposals = async () => {
  try {
    return await apiClient.get("project-proposal/my-proposals/");
  } catch (error) {
    console.error("Error fetching proposals:", error);
    throw error;
  }
};

export const updateProposalStatus = async (proposalId, status) =>
  apiClient.patch(`project-proposal/${proposalId}/`, { status });