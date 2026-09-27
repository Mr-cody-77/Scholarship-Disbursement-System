import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const cloudName = "dmqzrmtsf";

const CloudinaryUpload = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      //alert("Please select a file first!");
      toast.warning("Please select a file first!", {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5007"}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedUrl = response.data.file.url;
      console.log("File uploaded successfully:", uploadedUrl);
      setFileUrl(uploadedUrl);
    } catch (error) {
      //console.error("Error uploading file:", error);
      //alert("Upload failed.");
      toast.error("Upload failed", {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Cloudinary File Upload</h2>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {fileUrl && (
        <div>
          <h3>Uploaded File URL:</h3>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
