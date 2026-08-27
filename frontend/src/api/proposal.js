import apiClient from "./client";

export const addProposal = async (proposal) => {
  return apiClient.post("project-proposal/apply/", proposal);
};

export const getProposalsByProject = async (projectId) => {
  try{
    const response = await apiClient.get(`project-proposal/proposals/${projectId}/`);
    return response;
  }
  catch(error){
    console.error("Error fetching proposals:", error);
    throw error;
  }
};

export const approveProposal = async (proposalId) => {

  return apiClient.post(`project-proposal/approve/${proposalId}/`, {});
};

export const getMyProposals = async () => {
  try{
  const response = apiClient.get("project-proposal/my-proposals/");
  return response;}
  catch(error){
    console.error("Error fetching proposals:", error);
    throw error;
  }
};

export const updateProposalStatus = async (proposalId, status) => {
  return apiClient.patch(`project-proposal/${proposalId}/`, { status });
};