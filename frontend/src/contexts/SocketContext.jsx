import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  notifications: [],
  addNotificationListener: () => {},
  removeNotificationListener: () => {},
});

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [listeners, setListeners] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        // Join with user ID
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle new task notification
      newSocket.on('newTask', (data) => {
        const notification = {
          id: Date.now(),
          type: 'task',
          title: 'New Task',
          message: data.message,
          data: data.task,
          timestamp: new Date(),
          read: false,
        };
        setNotifications(prev => [notification, ...prev]);
        toast.info(data.message, { icon: '📋' });
      });

      // Handle task updates (for Kanban)
      newSocket.on('taskCreated', (data) => {
        if (listeners.onTaskCreated) {
          listeners.onTaskCreated(data.task);
        }
      });

      newSocket.on('taskUpdated', (data) => {
        if (listeners.onTaskUpdated) {
          listeners.onTaskUpdated(data.task);
        }
      });

      // Handle new message notification
      newSocket.on('newMessage', (data) => {
        const notification = {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `${data.senderName}: ${data.message.content?.substring(0, 50)}...`,
          data: data.message,
          timestamp: new Date(),
          read: false,
        };
        setNotifications(prev => [notification, ...prev]);
        toast.info(`New message from ${data.senderName}`, { icon: '💬' });
        
        if (listeners.onNewMessage) {
          listeners.onNewMessage(data.message);
        }
      });

      // Handle role changed
      newSocket.on('roleChanged', (data) => {
        toast.warning(data.message, { icon: '🔐', duration: 5000 });
        // Could force re-login or refresh user data
      });

      // Handle account deactivated
      newSocket.on('accountDeactivated', (data) => {
        toast.error(data.message, { icon: '🚫', duration: 10000 });
        // Could force logout
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user?._id]);

  const addNotificationListener = useCallback((event, callback) => {
    setListeners(prev => ({ ...prev, [event]: callback }));
  }, []);

  const removeNotificationListener = useCallback((event) => {
    setListeners(prev => {
      const newListeners = { ...prev };
      delete newListeners[event];
      return newListeners;
    });
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      notifications,
      addNotificationListener,
      removeNotificationListener,
      markNotificationAsRead,
      clearNotifications,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
