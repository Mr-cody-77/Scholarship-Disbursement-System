import React from "react";

const ForbiddenPage = () => {
  const handleReturnHome = () => {
    // Basic navigation to home page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Access Forbidden
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Please contact the
          administrator if you believe this is an error.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleReturnHome}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
