import { useEffect, useRef, useState } from "react";
import { getNotifications } from "../api/notifications";

const POLL_INTERVAL = 10000; 

export const useNotificationPolling = (currentUserId) => {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!currentUserId) return;
    setStatus("connecting");

    const poll = async () => {
      try {
        const history = await getNotifications();
        setNotifications(history.map((n) => ({ ...n, kind: "notification" })));
        setStatus("open");
      } catch (error) {
        console.error("Notification polling failed:", error);
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUserId]);

  return { notifications, setNotifications, status };
};