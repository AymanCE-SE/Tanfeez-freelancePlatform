import { useEffect, useRef, useState, useCallback } from "react";
import { getMessages } from "../api/chatroom";
import apiClient from "../api/client";

const POLL_INTERVAL = 4000; // 4 ثواني — كفاية تحس إنها "شبه لايف" من غير ما تحمّل السيرفر

export const useChatPolling = (roomId) => {
  const [liveMessages, setLiveMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (!roomId) return;
    setLiveMessages([]);
    seenIds.current = new Set();
    setStatus("connecting");
    let isFirstPoll = true;

    const poll = async () => {
      try {
        const msgs = await getMessages(roomId);
        setStatus("open");

        if (isFirstPoll) {
          // Chat.jsx already fetches the full history once on its own —
          // هنا بنسجل الرسايل الموجودة أصلاً من غير ما "نطلعها" كأنها جديدة،
          // عشان مانكررهاش مع الـ history الأساسية.
          msgs.forEach((m) => seenIds.current.add(m.id));
          isFirstPoll = false;
          return;
        }

        const newOnes = msgs.filter((m) => !seenIds.current.has(m.id));
        if (newOnes.length > 0) {
          newOnes.forEach((m) => seenIds.current.add(m.id));
          setLiveMessages((prev) => [
            ...prev,
            ...newOnes.map((m) => ({
              type: "chat_message",
              id: m.id,
              message: m.text,
              sender_id: m.sender,
              timestamp: m.timestamp,
            })),
          ]);
        }
      } catch (error) {
        console.error("Polling fetch failed:", error);
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = useCallback(
    async (text) => {
      if (!roomId) return;
      try {
        await apiClient.post(`chatroom/messages/${roomId}/`, { text });
        // الرسالة اللي إنت بعتها هتظهر في أقرب poll تلقائي (لحد 4 ثواني تأخير)
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [roomId]
  );

  // presence وread receipts مفهومين مرتبطين باتصال حي — في وضع الـ polling
  // بنسيبهم قيم افتراضية بسيطة بدل ما نبني نظام تتبع إضافي معقد لحاجة مؤقتة
  const markAsRead = useCallback(() => {}, []);

  return {
    liveMessages,
    presence: { online: false, lastSeen: null },
    readMessageIds: new Set(),
    sendMessage,
    markAsRead,
    status,
  };
};