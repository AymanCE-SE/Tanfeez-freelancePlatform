import apiClient from "./client";

export const getChatRooms = async () => {
  const response = await apiClient.get("chatroom/");
  return response.data; // apiClient already unwraps the `results` array for us
};

export const getMessages = async (chatroomId) => {
  const response = await apiClient.get(`chatroom/messages/${chatroomId}/`);
  return response.data;
};

export const getUnreadMessagesCount = async () => {
  const response = await apiClient.get("chatroom/unread-count/");
  return response.data.count;
};