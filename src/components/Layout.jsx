import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./StudentSite/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import AdminSidebar from "./AdminSide/AdminSidebar";
import { useFirebase } from "../firebase/FirebaseContext";
import { auth } from "../Firebase";

import Footer from "./Footer";

const Layout = ({ children }) => {
  const { user } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getDatabase();

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/login", { replace: true });
      return;
    }

    loadUserData(uid);

    function loadUserData(currentUid) {
      localStorage.setItem("uid", currentUid);

      get(ref(db, "users/" + currentUid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            // Provide sensible fallback for admin, SAG or unsynced student record
            const role = (localStorage.getItem("userRole") || "student").toLowerCase();
            const email = localStorage.getItem("studentEmail") || auth.currentUser?.email || "";
            setUserData({
              fullName: auth.currentUser?.displayName || (role === "admin" ? "Institute Nodal Officer" : role === "sag" ? "Ministry Official" : "ST Candidate"),
              email: email,
              role: role,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          const role = (localStorage.getItem("userRole") || "student").toLowerCase();
          setUserData({
            fullName: "ST Scholar",
            email: auth.currentUser?.email || "",
            role: role,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.pathname, location.state, navigate, db]);

  if (loading || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading MoTA Portal...
        </p>
      </div>
    );
  }

  const isStudent = (userData.role || "").toLowerCase() === "student";

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopBar isNotification={true} />
      <div className="flex flex-1 overflow-hidden">
        {isStudent ? <Sidebar user={userData} /> : <AdminSidebar user={userData} />}
        <div className="flex-1 overflow-auto bg-slate-50 flex flex-col justify-between">
          <div className="flex-1 p-6 lg:p-8">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
