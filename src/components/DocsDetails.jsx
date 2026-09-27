import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import axios from 'axios';
import app from "../Firebase";

const DocDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [panCardProcessing, setPanCardProcessing] = useState({});
  const processPanCard = async (docType, url, index = null) => {
    try {
      // Start processing and show loading for this specific document
      setPanCardProcessing(prev => ({
        ...prev,
        [docType]: index !== null ? { ...prev[docType], [index]: true } : true
      }));

      let response;
      // Determine which API to use based on document type
      if (docType === 'pan_card') {
        const ocrPanUrl = import.meta.env.VITE_OCR_PAN_URL || 'http://127.0.0.1:5000';
        response = await axios.post(`${ocrPanUrl}/process_pan_card`, { 
          image_url: url 
        });
      } else if (docType === 'aadhar_card') {
        const ocrAadhaarUrl = import.meta.env.VITE_OCR_AADHAAR_URL || 'http://127.0.0.1:5003';
        response = await axios.post(`${ocrAadhaarUrl}/process-image`, { 
          image_url: url 
        });

        // Transform Aadhar card response to match expected format
        if (response.data.status === 'success') {
          const extractedText = response.data.ocr_results.reduce((acc, result) => {
            acc[result.label.toLowerCase()] = result.ocr_text;
            return acc;
          }, {});

          response.data = {
            extracted_text: extractedText,
            boxed_image_url: response.data.bounding_boxes_image_url,
            cropped_images: response.data.ocr_results.map(result => result.cropped_image_url)
          };
        }
      } else {
        throw new Error('Unsupported document type for processing');
      }

      // Update the document with processed data
      const updatedDocument = { ...document };
      if (index !== null && docType === 'other_docs') {
        updatedDocument[docType][index].processedData = response.data;
      } else {
        updatedDocument[docType].processedData = response.data;
      }

      setDocument(updatedDocument);
    } catch (error) {
      console.error(`Error processing ${docType}:`, error);
      alert(`Failed to process ${docType}`);
    } finally {
      // Remove loading state for this document
      setPanCardProcessing(prev => ({
        ...prev,
        [docType]: index !== null ? { ...prev[docType], [index]: false } : false
      }));
    }
  };
  // const processPanCard = async (docType, url, index = null) => {
  //   try {
  //     // Start processing and show loading for this specific document
  //     setPanCardProcessing(prev => ({
  //       ...prev,
  //       [docType]: index !== null ? { ...prev[docType], [index]: true } : true
  //     }));

  //     // Call the PAN card processing API
  //     const response = await axios.post('http://127.0.0.1:5000/process_pan_card', { 
  //       image_url: url 
  //     });

  //     // Update the document with processed data
  //     const updatedDocument = { ...document };
  //     if (index !== null && docType === 'other_docs') {
  //       updatedDocument[docType][index].processedData = response.data;
  //     } else {
  //       updatedDocument[docType].processedData = response.data;
  //     }

  //     setDocument(updatedDocument);
  //   } catch (error) {
  //     console.error("Error processing PAN card:", error);
  //     alert("Failed to process PAN card");
  //   } finally {
  //     // Remove loading state for this document
  //     setPanCardProcessing(prev => ({
  //       ...prev,
  //       [docType]: index !== null ? { ...prev[docType], [index]: false } : false
  //     }));
  //   }
  // };

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const firestore = getFirestore(app);
        const realtimeDb = getDatabase(app);

        // Fetch document data from Firestore
        const docRef = doc(firestore, "usersDocs", id);
        const docSnapshot = await getDoc(docRef);
        const docData = docSnapshot.exists() ? docSnapshot.data() : null;

        // Fetch user data from Realtime Database
        const userRef = ref(realtimeDb, `users/${id}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.exists() ? userSnapshot.val() : {};

        // Initialize verification status for each document type
        const initialVerificationStatus = {};
        if (docData) {
          Object.keys(docData).forEach(key => {
            if (key !== 'other_docs') {
              initialVerificationStatus[key] = docData[key]?.status || 1;
            } else if (Array.isArray(docData[key])) {
              initialVerificationStatus[key] = docData[key].map(doc => doc.status || 1);
            }
          });
        }

        // Combine the data
        setDocument({
          id,
          ...docData,
          name: userData.fullName || "Unknown",
          email: userData.email || "No Email Provided",
        });
        setVerificationStatus(initialVerificationStatus);
      } catch (error) {
        console.error("Error fetching document details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  const updateDocumentStatus = async (docType, status, index = null) => {
    try {
      const firestore = getFirestore(app);
      const docRef = doc(firestore, "usersDocs", id);

      // Create a copy of the current document data
      const currentDoc = { ...document };
      
      // Update status for single document types
      if (index === null) {
        currentDoc[docType] = {
          ...currentDoc[docType],
          status: status
        };
        verificationStatus[docType] = status;
      } else {
        // Update status for other_docs array
        currentDoc.other_docs[index].status = status;
        verificationStatus.other_docs[index] = status;
      }

      // Update Firestore document
      await updateDoc(docRef, currentDoc);

      // Update local state
      setDocument(currentDoc);
      setVerificationStatus({ ...verificationStatus });

      //alert("Document ${docType} status updated to");
      toast.warning(`Document ${docType} status updated successfully.`, {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
    } catch (error) {
      console.log(error);
      //console.error("Error updating document status:", error);
    // alert("Failed to update document status");
      toast.error("Failed to update document status", {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
    }
  };

  const renderProcessedData = (processedData) => {
    if (!processedData) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Processed Information:</h4>
        {Object.entries(processedData.extracted_text).map(([key, value]) => (
          <p key={key} className="mb-1">
            <span className="font-medium capitalize">{key.replace('-', ' ')}:</span> {value}
          </p>
        ))}
        <div className="mt-2">
          <a 
            href={processedData.boxed_image_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Processed Image
          </a>
        </div>
      </div>
    );
  };

  const renderDocumentStatus = (docType, status, index = null) => {
    const statusLabels = {
      1: "Pending",
      2: "Approved",
      3: "Rejected"
    };

    const statusColors = {
      1: "text-yellow-600",
      2: "text-green-600",
      3: "text-red-600"
    };

    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
          <div className="flex space-x-2">
            <button 
              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
              onClick={() => updateDocumentStatus(docType, 2, index)}
              disabled={status === 2}
            >
              Approve
            </button>
            <button 
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              onClick={() => updateDocumentStatus(docType, 3, index)}
              disabled={status === 3}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    return Object.keys(document)
      .filter(key => 
        key !== 'id' && 
        key !== 'name' && 
        key !== 'email' && 
        document[key]
      )
      .map(docType => {
        // Handle single document types
        
        if ((docType == 'pan_card'||docType == 'aadhar_card' )&& typeof document[docType] === 'object') {
          const isProcessing = panCardProcessing[docType];
          return (
            <div 
              key={docType} 
              className="mb-4 p-4 bg-gray-100 rounded-lg cursor-pointer"
              onClick={() => setSelectedDoc({ type: docType, data: document[docType] })}
            >
              <h3 className="text-lg font-semibold mb-2 capitalize">
                {docType.replace(/_/g, ' ')}
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <a 
                    href={document[docType].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      processPanCard(docType, document[docType].url);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Process Using AI' }
                  </button>
                </div>
                {renderDocumentStatus(docType, verificationStatus[docType])}
              </div>
              {isProcessing && (
                <div className="mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-600">Processing PAN card...</span>
                </div>
              )}
              {document[docType].processedData && renderProcessedData(document[docType].processedData)}
            </div>
          );
        }
        if (docType !== 'other_docs' && typeof document[docType] === 'object') {
          const isProcessing = panCardProcessing[docType];
          return (
            <div 
              key={docType} 
              className="mb-4 p-4 bg-gray-100 rounded-lg cursor-pointer"
              onClick={() => setSelectedDoc({ type: docType, data: document[docType] })}
            >
              <h3 className="text-lg font-semibold mb-2 capitalize">
                {docType.replace(/_/g, ' ')}
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <a 
                    href={document[docType].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                 
                </div>
                {renderDocumentStatus(docType, verificationStatus[docType])}
              </div>
              {isProcessing && (
                <div className="mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-600">Processing PAN card...</span>
                </div>
              )}
              {document[docType].processedData && renderProcessedData(document[docType].processedData)}
            </div>
          );
        }
        
        // Handle other_docs array
        if (docType === 'other_docs' && Array.isArray(document[docType])) {
          return document[docType].map((otherDoc, index) => {
            const isProcessing = panCardProcessing[docType]?.[index];
            return (
              <div 
                key={index} 
                className="mb-4 p-4 bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => setSelectedDoc({ type: 'other_docs', data: otherDoc, index })}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Other Document {index + 1}
                </h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <a 
                      href={otherDoc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        processPanCard(docType, otherDoc.url, index);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Process PAN'}
                    </button>
                  </div>
                  {renderDocumentStatus('other_docs', otherDoc.status, index)}
                </div>
                {isProcessing && (
                  <div className="mt-2 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-600">Processing PAN card...</span>
                  </div>
                )}
                {otherDoc.processedData && renderProcessedData(otherDoc.processedData)}
              </div>
            );
          });
        }
        
        return null;
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Document not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">
          Document Details
        </h1>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-700">
              <strong>UID:</strong> {document.id}
            </p>
            <p className="text-lg font-semibold text-gray-700">
              <strong>Name:</strong> {document.name}
            </p>
          </div>
          <p className="text-lg font-semibold text-gray-700">
            <strong>Email:</strong> {document.email}
          </p>
          
          <h2 className="mt-6 text-xl font-bold text-gray-700">
            Uploaded Documents:
          </h2>
          {renderDocuments()}
        </div>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              {selectedDoc.type.replace(/_/g, ' ')}
            </h3>
            <a  
              href={selectedDoc.data.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Document
            </a>
            {renderDocumentStatus(selectedDoc.type, selectedDoc.data.status, selectedDoc.index)}
            {selectedDoc.data.processedData && renderProcessedData(selectedDoc.data.processedData)}
            <button 
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={() => setSelectedDoc(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocDetails;