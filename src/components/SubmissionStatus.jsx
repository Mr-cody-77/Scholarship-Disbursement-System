// SubmissionStatus.js
import React from "react";

const SubmissionStatus = () => {
  const submissionDetails = {
    documents: [
      { name: "ID Proof", status: "Verified" },
      { name: "Academic Records", status: "Pending" },
    ],
    scholarshipStatus: "Approved",
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h2 className="text-lg font-bold mb-2">Submission Status</h2>
      <div className="mb-2">
        <h3 className="font-semibold">Documents:</h3>
        <ul>
          {submissionDetails.documents.map((doc, index) => (
            <li
              key={index}
              className={`mb-1 text-sm ${
                doc.status === "Verified" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {doc.name}: {doc.status}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Scholarship Status:</h3>
        <p
          className={`text-sm ${
            submissionDetails.scholarshipStatus === "Approved"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {submissionDetails.scholarshipStatus}
        </p>
      </div>
    </div>
  );
};

export default SubmissionStatus;
