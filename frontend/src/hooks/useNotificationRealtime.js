// hooks/useNotificationRealtime.js
import { useNotificationSocket } from "./useNotificationSocket";
import { useNotificationPolling } from "./useNotificationPolling";

const MODE = import.meta.env.VITE_REALTIME_MODE || "websocket";

export const useNotificationRealtime = (currentUserId) => {
  if (MODE === "polling") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useNotificationPolling(currentUserId);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useNotificationSocket(currentUserId);
};