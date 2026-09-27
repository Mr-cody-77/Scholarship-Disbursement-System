// NotificationPanel.js
import React from "react";

const NotificationPanel = () => {
  const notifications = [
    "Your document has been verified successfully.",
    "Scholarship disbursement has been processed.",
    "Please upload your ID proof for verification.",
  ];

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index} className="mb-1 text-sm text-gray-700">
            {notification}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;
