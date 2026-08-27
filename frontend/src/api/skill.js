// api/skill.js
import apiClient from "./client";

// Fetch all skills
export const fetchSkills = async () => {
  try {
    const response = await apiClient.get("skills/all/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new skill
export const createSkill = async (name) => {
  try {
    const response = await apiClient.post("skills/create/", { skill_name: name });
    return response.data;
  } catch (error) {
    throw error;
  }
};