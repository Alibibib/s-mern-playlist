'use client';

import { useUIStore } from '@/lib/store/ui-store';

export function Notifications() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const bgColor = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-blue-500',
          warning: 'bg-yellow-500',
        }[notification.type];

        return (
          <div
            key={notification.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
          >
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
