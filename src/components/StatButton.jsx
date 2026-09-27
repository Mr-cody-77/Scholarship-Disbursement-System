import React, { useState } from "react";

const StatButton = ({ count, title, color, icon: Icon }) => {
  const [isPressed, setIsPressed] = useState(false);
  const colorClass =
    {
      blue: "bg-blue-500",
      red: "bg-red-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
    }[color] || "bg-gray-500";

  return (
    <button
      className={`${colorClass} text-white p-4 rounded-lg flex items-center justify-between
        transform transition duration-200 ease-in-out
        hover:shadow-lg hover:-translate-y-1
        active:shadow-inner active:translate-y-0.5
        ${isPressed ? "scale-95" : "scale-100"}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div>
        <h2 className="text-3xl font-bold">{count}</h2>
        <p className="text-sm uppercase">{title}</p>
      </div>
      <Icon
        size={40}
        className={`transition-transform duration-200 ${
          isPressed ? "scale-90" : "scale-100"
        }`}
      />
    </button>
  );
};

export default StatButton;
