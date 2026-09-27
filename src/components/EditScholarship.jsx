import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFirebase } from "../firebase/FirebaseContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditScholarship = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scholarship } = location.state || {};
  const Firebase = useFirebase();

  const [name, setName] = useState(scholarship.name);
  const [eligibility, setEligibility] = useState(scholarship.eligibility);
  const [requiredDocuments, setRequiredDocuments] = useState(
    scholarship.requiredDocuments.join(";")
  );

  const [loadingUpdate, setLoadingUpdate] = useState(false); // Loading state for update
  const [loadingDelete, setLoadingDelete] = useState(false); // Loading state for delete

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingUpdate(true); // Start loading for update
    try {
      await Firebase.updateScholarship(scholarship.id, {
        name,
        eligibility,
        requiredDocuments: requiredDocuments.split(";"),
      });
      toast.success("Scholarship updated successfully");
      navigate("/admin-scholarship-list");
    } catch (error) {
      toast.error(`Error updating scholarship: ${error.message}`);
    } finally {
      setLoadingUpdate(false); // Stop loading for update
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      setLoadingDelete(true); // Start loading for delete
      try {
        await Firebase.deleteScholarship(scholarship.id);
        toast.success("Scholarship deleted successfully");
        navigate("/admin-scholarship-list");
      } catch (error) {
        toast.error(`Error deleting scholarship: ${error.message}`);
      } finally {
        setLoadingDelete(false); // Stop loading for delete
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg transition-all duration-300">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Edit Scholarship
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Scholarship Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Eligibility:</label>
          <input
            type="text"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Required Documents (separated by ";"):
          </label>
          <input
            type="text"
            value={requiredDocuments}
            onChange={(e) => setRequiredDocuments(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loadingUpdate} // Disable button while updating
          className={`w-full p-2 rounded transition duration-200 ${
            loadingUpdate ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
          } text-white mb-2`}
        >
          {loadingUpdate ? "Updating..." : "Update Scholarship"}
        </button>
      </form>
      <button
        onClick={handleDelete}
        disabled={loadingDelete} // Disable button while deleting
        className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
      >
        {loadingDelete ? "Deleting..." : "Delete Scholarship"}
      </button>
      <ToastContainer />
    </div>
  );
};

export default EditScholarship;
