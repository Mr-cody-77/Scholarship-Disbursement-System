import React, { useEffect, useState } from "react";
import { useFirebase } from "../firebase/FirebaseContext";
import { useNavigate } from "react-router-dom";

const ScholarshipList = () => {
  const Firebase = useFirebase();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await Firebase.fetchScholarships();
        setScholarships(data);
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      } finally {
        setLoading(false); // Stop loading after fetching
      }
    };
    fetchData();
  }, [Firebase]);

  const handleEdit = (scholarship) => {
    navigate("/editScholarship", { state: { scholarship } });
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-lg transition-all duration-300">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Available Scholarships
      </h2>
      {loading ? ( // Conditional rendering based on loading state
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : (
        scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            className="mb-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-bold">{scholarship.name}</h3>
            <p className="text-gray-700">{scholarship.eligibility}</p>
            <p className="text-gray-600">
              Required Documents: {scholarship.requiredDocuments.join(", ")}
            </p>
            <button
              onClick={() => handleEdit(scholarship)}
              className="mt-2 text-blue-500 hover:underline transition duration-200"
            >
              Edit
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ScholarshipList;
