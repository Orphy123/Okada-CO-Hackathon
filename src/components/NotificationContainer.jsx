import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 text-green-700';
      case 'error':
        return 'border-l-red-500 text-red-700';
      case 'warning':
        return 'border-l-yellow-500 text-yellow-700';
      default:
        return 'border-l-blue-500 text-blue-700';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);
        const colors = getColors(notification.type);

        return (
          <div
            key={notification.id}
            className={`bg-white border border-gray-200 border-l-4 ${colors} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-80 animate-slide-in-right`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-sm">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;