import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import { getNotifications, markAllNotificationsRead } from "../api/notifications";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.authSlice.user);
  const { notifications, setNotifications, status } = useNotificationSocket(currentUser?.id);
  const [loaded, setLoaded] = useState(false);

  // Load past notifications ONCE when the user logs in — the socket only
  // carries NEW events from now on, it has no memory of the past.
  useEffect(() => {
    if (!currentUser?.id || loaded) return;
    getNotifications().then((history) => {
      setNotifications(history);
      setLoaded(true);
    });
  }, [currentUser?.id, loaded]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [setNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, status }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);