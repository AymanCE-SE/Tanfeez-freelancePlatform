import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { getUnreadMessagesCount } from "../api/chatroom";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.authSlice.user);
  const { notifications: rawEvents, setNotifications, status } = useNotificationSocket(currentUser?.id);
  const [loaded, setLoaded] = useState(false);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
  const [messageEventTick, setMessageEventTick] = useState(0);

  // Only "kind: notification" events belong in the bell dropdown —
  // "kind: new_message" events pass through the same socket but are
  // handled separately below, never mixed into this list.
  const notifications = rawEvents.filter((n) => n.kind !== "new_message");

  useEffect(() => {
    if (!currentUser?.id || loaded) return;
    getNotifications().then((history) => {
      const normalizedHistory = history.map((n) => ({ ...n, kind: "notification" }));
      setNotifications((liveEvents) => {
        const eventsById = new Map(normalizedHistory.map((notification) => [notification.id, notification]));

        liveEvents.forEach((notification) => {
          eventsById.set(notification.id, notification);
        });

        return [...eventsById.values()].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      });
      setLoaded(true);
    });
  }, [currentUser?.id, loaded]);

  useEffect(() => {
    if (currentUser?.id) {
      getUnreadMessagesCount().then(setMessagesUnreadCount);
    }
  }, [currentUser?.id]);

  // Whenever a "new_message" push arrives, don't try to increment a local
  // counter by hand — just re-ask the server for the true total. Cheap,
  // and avoids the count ever drifting out of sync.
  useEffect(() => {
    const latest = rawEvents[0];
    if (latest?.kind === "new_message") {
      getUnreadMessagesCount().then(setMessagesUnreadCount);
      setMessageEventTick((t) => t + 1);   
    }
  }, [rawEvents.length]);

  const refreshMessagesUnreadCount = useCallback(() => {
    getUnreadMessagesCount().then(setMessagesUnreadCount);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => (n.kind === "new_message" ? n : { ...n, is_read: true })));
  }, [setNotifications]);

  const markOneRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await markNotificationRead(id);
  }, [setNotifications]);

  return (
    <NotificationContext.Provider 
    value={{ notifications, unreadCount, markAllRead, markOneRead, status, messagesUnreadCount, refreshMessagesUnreadCount, messageEventTick }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);