import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const StatusBadge = ({ status }) => {
  const statusColors = {
    1: "bg-yellow-100 text-yellow-800",   // Pending
    2: "bg-green-100 text-green-800",     // Approved
    3: "bg-red-100 text-red-800"          // Rejected
  };

  const statusLabels = {
    1: "Pending Verification",
    2: "Approved",
    3: "Rejected"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
      {statusLabels[status] || 'Unknown Status'}
    </span>
  );
};

const DocumentDownload = () => {
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();

  useEffect(() => {
    const fetchApprovedDocuments = async (uid) => {
      try {
        const userDocRef = doc(db, "usersDocs", uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const approved = Object.entries(userData)
            .filter(([key, doc]) => doc?.status === 2)
            .map(([key, doc]) => ({ type: key, ...doc }));

          setApprovedDocuments(approved);
        }
      } catch (err) {
        console.error("Error fetching approved documents:", err);
        setError("Failed to fetch approved documents.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchApprovedDocuments(user.uid);
      } else {
        setApprovedDocuments([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [db]);

  const handleDownload = async (documentUrl) => {
    try {
      // For Cloudinary URLs, simply open the URL directly
      window.open(documentUrl, '_blank');
    } catch (error) {
      //console.error("Download error:", error);
      //alert("Failed to download document");
      toast.warning("Failed to download document",  {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Download Approved Documents
      </h1>
      {approvedDocuments.length === 0 ? (
        <div className="text-center text-gray-600">
          No approved documents available for download.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedDocuments.map((doc, index) => (
            <div 
              key={index} 
              className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold capitalize">
                  {doc.type.replace(/_/g, ' ')}
                </h3>
                <StatusBadge status={doc.status} />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Uploaded on: {new Date(doc.uploadTimestamp).toLocaleString()}
              </p>
              <button 
                onClick={() => handleDownload(doc.url)}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Download Document
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentDownload;