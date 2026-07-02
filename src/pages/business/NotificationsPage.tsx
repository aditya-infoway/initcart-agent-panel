import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { Badge } from "../../components/common/Badge";

interface Notification {
  id: number;
  notificationId: string;
  message: string;
  type: "Level" | "Commission" | "Withdrawal";
  date: string;
  status: "Read" | "Unread";
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      notificationId: "NT-102",
      message: "🎉 Your level upgraded to Gold!",
      type: "Level",
      date: "2025-10-07",
      status: "Unread",
    },
    {
      id: 2,
      notificationId: "NT-103",
      message: "💰 Commission for October credited successfully.",
      type: "Commission",
      date: "2025-10-08",
      status: "Read",
    },
    {
      id: 3,
      notificationId: "NT-104",
      message: "🏦 Your withdrawal request has been approved.",
      type: "Withdrawal",
      date: "2025-10-10",
      status: "Read",
    },
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Read" } : n))
    );
  };

  return (
    <div className="p-0 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBell className="text-red-500 text-2xl" />
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl shadow-sm border transition-all ${
              item.status === "Unread"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-800 font-medium mb-1">
                  {item.message}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge
                    className={`${
                      item.type === "Level"
                        ? "bg-blue-500"
                        : item.type === "Commission"
                        ? "bg-green-500"
                        : "bg-purple-500"
                    } text-white text-xs`}
                  >
                    {item.type}
                  </Badge>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>

              {item.status === "Unread" ? (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all"
                >
                  Mark as Read
                </button>
              ) : (
                <Badge className="bg-gray-400 text-white text-xs">
                  Read
                </Badge>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
