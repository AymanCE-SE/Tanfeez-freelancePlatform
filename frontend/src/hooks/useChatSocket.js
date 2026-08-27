/*
    useChatSocket.js is a custom React hook that manages a WebSocket connection for a chat application. It connects to a WebSocket server, listens for incoming messages, and allows sending messages to the server. The hook maintains the state of live messages and the connection status.
*/
import { useEffect, useRef, useState, useCallback } from "react";
import { apiOrigin } from "../api/client"; 

export const useChatSocket = (roomId) => {
  const [liveMessages, setLiveMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | connecting | open | closed
  const wsRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("authToken");
    const wsOrigin = apiOrigin.replace(/^http/, "ws"); // http->ws, https->wss
    const ws = new WebSocket(`${wsOrigin}/ws/chat/${roomId}/?token=${token}`);
    wsRef.current = ws;
    setStatus("connecting");
    setLiveMessages([]); // begins empty when roomId changes

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveMessages((prev) => [...prev, data]);
    };

    return () => ws.close(); // cleanup on unmount or roomId change
  }, [roomId]);

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    }
  }, []);

  return { liveMessages, sendMessage, status };
};