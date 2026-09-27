import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload } from "lucide-react";

const ScholarshipRegistration = () => {
  // Basic details and document upload states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegeName: "",
    aadharNumber: "",
    aadharCard: null,
    panNumber: "",
    panCard: null,
    income: "",
    incomeCertificate: null,
    collegeRollNumber: "",
    collegeIdCard: null,
  });

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      if (file.size > maxSize) {
        toast.error(`${docType} should be less than 5MB`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, or PDF files are allowed");
        return;
      }

      setFormData({ ...formData, [docType]: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegistration = (e) => {
    e.preventDefault();
    const {
      name,
      email,
      collegeName,
      aadharNumber,
      panNumber,
      income,
      collegeRollNumber,
      aadharCard,
      panCard,
      incomeCertificate,
      collegeIdCard,
    } = formData;

    if (
      !name ||
      !email ||
      !collegeName ||
      !aadharNumber ||
      !panNumber ||
      !income ||
      !collegeRollNumber ||
      !aadharCard ||
      !panCard ||
      !incomeCertificate ||
      !collegeIdCard
    ) {
      toast.error("Please fill out all fields and upload all required documents");
      return;
    }

    // Placeholder for form submission logic
    console.log("Registration Data:", formData);
    toast.success("Registration successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Scholarship Portal Registration
        </h1>

        <form onSubmit={handleRegistration} className="space-y-6">
          {/* Basic Details Section */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <Upload className="mr-2" /> Upload Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="aadharNumber"
                  placeholder="Aadhar Number"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="file"
                  accept=".jpg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, "aadharCard")}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-gray-500 text-sm">Upload Aadhar Card</p>
              </div>
              <div>
                <input
                  type="text"
                  name="panNumber"
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="file"
                  accept=".jpg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, "panCard")}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-gray-500 text-sm">Upload PAN Card</p>
              </div>
              <div>
                <input
                  type="text"
                  name="income"
                  placeholder="Income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="file"
                  accept=".jpg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, "incomeCertificate")}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-gray-500 text-sm">Upload Income Certificate</p>
              </div>
              <div>
                <input
                  type="text"
                  name="collegeRollNumber"
                  placeholder="College Roll Number"
                  value={formData.collegeRollNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="file"
                  accept=".jpg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, "collegeIdCard")}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-gray-500 text-sm">Upload College ID Card</p>
              </div>
            </div>
          </div>

          {/* Submit and Reset Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            >
              Register
            </button>
            <button
              type="reset"
              onClick={() =>
                setFormData({
                  name: "",
                  email: "",
                  collegeName: "",
                  aadharNumber: "",
                  aadharCard: null,
                  panNumber: "",
                  panCard: null,
                  income: "",
                  incomeCertificate: null,
                  collegeRollNumber: "",
                  collegeIdCard: null,
                })
              }
              className="bg-gray-400 text-white py-2 px-6 rounded-lg hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScholarshipRegistration;
