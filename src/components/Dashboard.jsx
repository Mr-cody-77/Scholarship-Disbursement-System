import React, { useState, useEffect } from "react";
import { Users, GraduationCap, FileText, PaperclipIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
import StatButton from "./StatButton";
import PhotoSlider from "./CursorSlider";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  // State for tracking current user and dashboard statistics
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    documentsSubmitted: null,
    documentsVerified: null,
    applicationsSubmitted: null,
    applicationsVerified: null
  });

  function separateByStatus(data) {
    // Initialize an empty object to hold grouped statuses
    const groupedStatus = {};

    // Safely check if data exists and has at least one item
    if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
      return groupedStatus;
    }

    // Get the first (and only) user's documents from the input array
    const userDocuments = data[0];

    // Iterate through the keys of the user's document data
    for (const [key, value] of Object.entries(userDocuments)) {
      // Check if the value is an object and contains a "status" key
      if (value && typeof value === 'object' && 'status' in value) {
        const statusKey = `status_${value.status}`; // Create a dynamic status key (e.g., 'status_1', 'status_2')

        // If this status group does not exist, initialize it
        if (!groupedStatus[statusKey]) {
          groupedStatus[statusKey] = {};
        }

        // Add the document under the respective status group
        groupedStatus[statusKey][key] = value;
      }
    }

    return groupedStatus;
  }
  // Comprehensive data fetching function (same as previous implementation)
  const fetchDashboardStatistics = async (uid) => {
    console.log(uid)
    try {
      // Fetch documents collection
      const documentsRef = collection(db, 'usersDocs');
      const documentsQuery = query(documentsRef, where('id', '==', uid));
      const documentsSnapshot = await getDocs(documentsQuery);

      // Process document statistics
      const allDocuments = documentsSnapshot.docs.map(doc => doc.data());
      const separatedDocuments = separateByStatus(allDocuments);
      const submittedDocumentsCount =
        (Object.keys(separatedDocuments?.status_1 || {}).length) +
        (Object.keys(separatedDocuments?.status_2 || {}).length) +
        (Object.keys(separatedDocuments?.status_3 || {}).length); // Corrected .size() to .length
      const verifiedDocuments = separatedDocuments?.status_2 || {}; // Safely access status_2
      const verifiedDocumentsCount = Object.keys(verifiedDocuments).length; // Count properties in status_2

      // Fetch user collection
      const usersRef = collection(db, 'scholarshipApplications');
      const userQuery = query(usersRef, where('userId', '==', uid));
      const userSnapshot = await getDocs(userQuery);
      const allApplications = userSnapshot.docs.map(doc => doc.data());
      // Process application and passing certificate statistics
      const applicationsSubmitted = allApplications.length;
      const applicationsVerified = allApplications.filter(obj => obj.reviewStatus === "approved").length;
      // Update dashboard statistics
      setDashboardStats({
        documentsSubmitted: submittedDocumentsCount,
        documentsVerified: verifiedDocumentsCount,
        applicationsSubmitted,
        applicationsVerified,
      });

    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);

        // Fetch stats using the current user's UID
        fetchDashboardStatistics(user.uid);
      } else {
        // User is signed out
        navigate('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Redirect if no user
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 -z-10"></div>

      {/* Container with subtle shadow and rounded corners */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Slider Section */}
        <div className="mb-8">
          <PhotoSlider />
        </div>

        {/* Header Section */}
        <div className="px-6 md:px-10 py-6 bg-gray-100/50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              My Dashboard
            </h1>
            {currentUser && (
              <p className="text-gray-600 font-medium">
                Welcome, <span className="text-blue-600">{currentUser.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Documents Submitted */}
            <StatButton
              count={dashboardStats.documentsSubmitted}
              title="Documents Submitted"
              color="red"
              icon={FileText}
              className="hover:scale-105 transition-transform"
            />

            {/* Documents Verified */}
            <StatButton
              count={dashboardStats.documentsVerified}
              title="Documents Verified"
              color="green"
              icon={Users}
              className="hover:scale-105 transition-transform"
            />

            {/* Applications Submitted */}
            <StatButton
              count={dashboardStats.applicationsSubmitted}
              title="Applications Submitted"
              color="blue"
              icon={GraduationCap}
              className="hover:scale-105 transition-transform"
            />

            {/* Applications Verified */}
            <StatButton
              count={dashboardStats.applicationsVerified}
              title="Applications Verified"
              color="purple"
              icon={Users}
              className="hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;