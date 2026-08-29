import { useEffect, useRef, useState, useCallback } from "react";
import { apiOrigin } from "../api/client";

export const useNotificationSocket = (currentUserId) => {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("idle");
  const wsRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) return; // don't connect if nobody's logged in

    const token = localStorage.getItem("authToken");
    const wsOrigin = apiOrigin.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsOrigin}/ws/notifications/?token=${token}`);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [data, ...prev]); // newest first
    };

    return () => ws.close();
  }, [currentUserId]);

  // called once we've fetched the notification history from REST,
  // so the live list starts from there instead of empty
  const seedNotifications = useCallback((history) => {
    setNotifications(history);
  }, []);

  return { notifications, setNotifications, seedNotifications, status };
};