import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import UploadDocs from "./pages/UploadDocs";
import Layout from "./components/Layout";
import Track from "./components/Track";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminSignup from "./pages/AdminSignup";
import AddScholarshipForm from "./components/AdminSide/AddScholarshipForm";
import ScholarshipList from "./components/ScholarshipList";
import StudentTrack from "./components/StudentTrack";
import ScholarshipApplication from "./components/StudentSite/ScholarshipApplication";
import EditScholarship from "./components/EditScholarship";
import DocsTrack from "./components/AdminSide/DocsTrack";
import DocsVerification from "./components/AdminSide/DocsVerification";
import DocDetails from "./components/DocsDetails";
import ApplicationsCheck from "./components/AdminSide/ApplicationsCheck";
import ScrutinyHistory from "./components/AdminSide/ScrutinyHistory";
import UpdatedDashboard from "./components/StudentSite/UpdatedDashboard";
import EKYC from "./components/EKYC";
import FAQ from "./pages/FAQ";
import DocumentDownload from "./components/DocsDownload";
import AdminPanel from "./components/AdminSide/AdminPanel";
import SAGHomePage from "./components/SAG/SAGHomePage";
import Home_ from "./pages/Home_";
import Registration_ from "./pages/Registration_";
import Contactd from "./pages/contactd";
import "./App.css";
import AboutPage from "./pages/Home_About";
import ProtectedRoute from "./pages/ProtectedRoutes";
import ForbiddenPage from "./pages/forbidden";
import AboutSchemeDashboard from "./components/StudentSite/AboutSchemeDashboard";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Portal Page Recovered</h2>
            <p className="text-xs text-slate-500 mb-6">
              A temporary display error occurred. Click below to continue smoothly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = "/home";
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <Analytics />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home_ />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contactd" element={<Navigate to="/#contact" replace />} />
          <Route path="/contact" element={<Navigate to="/#contact" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminSignup />} />
          <Route path="/registration" element={<Registration_ />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/sag-home-page"
            element={
              <ProtectedRoute element={<SAGHomePage />} role="SAG" />
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route
                    path="/viewScholarships"
                    element={
                      <ProtectedRoute element={<StudentTrack />} role="student" />
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute element={<Dashboard />} role="student" />}
                  />
                  <Route
                    path="/about-scheme"
                    element={<ProtectedRoute element={<AboutSchemeDashboard />} role="student" />}
                  />
                  <Route
                    path="/home"
                    element={<ProtectedRoute element={<Home />} role="student" />}
                  />
                  <Route
                    path="/faq"
                    element={<ProtectedRoute element={<FAQ />} role="student" />}
                  />
                  <Route
                    path="/upload"
                    element={<ProtectedRoute element={<UploadDocs />} role="student" />}
                  />
                  <Route
                    path="/track"
                    element={<ProtectedRoute element={<Track />} role="student" />}
                  />
                  <Route
                    path="/apply"
                    element={
                      <ProtectedRoute element={<ScholarshipApplication />} role="student" />
                    }
                  />
                  <Route
                    path="/updatedDashboard"
                    element={
                      <ProtectedRoute element={<UpdatedDashboard />} role="student" />
                    }
                  />
                  <Route
                    path="/details/:id"
                    element={<ProtectedRoute element={<DocDetails />} role="admin" />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/ekyc0"
                    element={<ProtectedRoute element={<EKYC />} role="student" />}
                  />
                  <Route
                    path="/ekyc1"
                    element={<ProtectedRoute element={<AdminPanel />} role="admin" />}
                  />
                  <Route
                    path="/docs-track"
                    element={<ProtectedRoute element={<DocsTrack />} role="student" />}
                  />
                  <Route
                    path="/docs-verification"
                    element={
                      <ProtectedRoute element={<DocsVerification />} role="admin" />
                    }
                  />
                  <Route
                    path="/download-documents"
                    element={
                      <ProtectedRoute element={<DocumentDownload />} role="student" />
                    }
                  />
                  <Route
                    path="/applications-check"
                    element={
                      <ProtectedRoute element={<ApplicationsCheck />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute element={<ApplicationsCheck />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-history"
                    element={
                      <ProtectedRoute element={<ScrutinyHistory />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-track"
                    element={<ProtectedRoute element={<ScholarshipList />} role="admin" />}
                  />
                  <Route
                    path="/admin-scholarship-list"
                    element={
                      <ProtectedRoute element={<ScholarshipList />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-add-scholarship"
                    element={
                      <ProtectedRoute element={<AddScholarshipForm />} role="admin" />
                    }
                  />
                  <Route
                    path="/editScholarship"
                    element={<ProtectedRoute element={<EditScholarship />} role="admin" />}
                  />
                  <Route path="/FAQ" element={<Navigate to="/faq" replace />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
