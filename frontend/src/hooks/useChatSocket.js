/*
    useChatSocket.js is a custom React hook that manages a WebSocket connection for a chat application. It connects to a WebSocket server, listens for incoming messages, and allows sending messages to the server. The hook maintains the state of live messages and the connection status.
*/
import { useEffect, useRef, useState, useCallback } from "react";
import { apiOrigin } from "../api/client";

export const useChatSocket = (roomId, currentUserId) => {
  const [liveMessages, setLiveMessages] = useState([]);
  const [presence, setPresence] = useState({ online: false, lastSeen: null });
  const [readMessageIds, setReadMessageIds] = useState(new Set());
  const [status, setStatus] = useState("idle");
  const wsRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("authToken");
    const wsOrigin = apiOrigin.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsOrigin}/ws/chat/${roomId}/?token=${token}`);
    wsRef.current = ws;
    setStatus("connecting");
    setLiveMessages([]);
    setReadMessageIds(new Set());

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Route by type — this is the fix. Different event shapes need
      // different handling, they can't all go into the same "messages" list.
      switch (data.type) {
        case "chat_message":
          setLiveMessages((prev) => [...prev, data]);
          break;
        case "presence_event":
          if (data.user_id === currentUserId) return;
          setPresence({
            online: data.status === "online",
            lastSeen: data.last_seen || null,
          });
          break;
        case "read_receipt":
          setReadMessageIds((prev) => {
            const next = new Set(prev);
            data.message_ids.forEach((id) => next.add(id));
            return next;
          });
          break;
        default:
          break; // unknown event type, ignore rather than crash
      }
    };

    return () => ws.close();
  }, [roomId]);

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    }
  }, []);

  const markAsRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "read" }));
    }
  }, []);

  return { liveMessages, presence, readMessageIds, sendMessage, markAsRead, status };
};