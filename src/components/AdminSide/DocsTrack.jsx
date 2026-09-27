import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Download, X } from "lucide-react";

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

const UserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userDocRef = doc(db, "usersDocs", uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          setUserData(docSnapshot.data());
          console.log(docSnapshot.data());
        } else {
          setError("No document found for this user.");
        }
      } catch (err) {
        console.error("Error fetching user document:", err);
        setError("Failed to fetch user document.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const handleDownload = (url, documentName) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${documentName}_document.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => console.error('Download failed:', error));
  };

  const renderDocumentInfo = (key, documentInfo) => {
    if (!documentInfo || typeof documentInfo !== 'object') return null;

    return (
      <div 
        key={key} 
        className="mb-4 p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => handleDocumentClick({ key, ...documentInfo })}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold capitalize">
            {key.replace(/_/g, ' ')}
          </h3>
          <StatusBadge status={documentInfo.status} />
        </div>
        {documentInfo.url && (
          <div className="text-sm text-gray-600">
            <p>Uploaded on: {new Date(documentInfo.uploadTimestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  };

  // Modal for document details
  const DocumentDetailModal = ({ document }) => {
    if (!document) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto relative">
          {/* Close button */}
          <button 
            onClick={handleCloseModal} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
          >
            <X size={24} />
          </button>

          {/* Document Details */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold capitalize">
                {document.key.replace(/_/g, ' ')} Details
              </h2>
              <StatusBadge status={document.status} />
            </div>

            {/* Image Preview */}
            {document.url && (
              <div className="mb-4">
                <img 
                  src={document.url} 
                  alt={`${document.key} document`} 
                  className="w-full max-h-[500px] object-contain rounded-lg shadow-md mb-2"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Uploaded on: {new Date(document.uploadTimestamp).toLocaleString()}
                  </p>
                  <button 
                    onClick={() => handleDownload(document.url, document.key)}
                    className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Additional Document Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Document Metadata</h3>
              <div className="space-y-2">
                <p><strong>Upload Timestamp:</strong> {new Date(document.uploadTimestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> {
                  {1: 'Pending Verification', 2: 'Approved', 3: 'Rejected'}[document.status] || 'Unknown'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!userData) return <div className="text-center p-4">No data found for this user.</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        My Documents
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(userData)
          .filter(([key, value]) => typeof value === 'object' && value !== null)
          .map(([key, documentInfo]) => renderDocumentInfo(key, documentInfo))}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && <DocumentDetailModal document={selectedDocument} />}
    </div>
  );
};

export default UserData;