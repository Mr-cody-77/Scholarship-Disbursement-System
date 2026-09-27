import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useFirebase } from "../../firebase/FirebaseContext";
import {
  GraduationCap,
  FileText,
  Check,
  X,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Building,
  RefreshCw,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ScholarshipData = () => {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [scholarshipData, setScholarshipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deficiency Rectification state: { [appId]: { [target]: File } }
  const [reuploadFiles, setReuploadFiles] = useState({});
  const [isResubmitting, setIsResubmitting] = useState({});

  const db = getFirestore();

  const fetchAllScholarshipData = async () => {
    try {
      setLoading(true);
      const scholarshipRef = collection(db, "scholarshipApplications");
      const querySnapshot = await getDocs(scholarshipRef);
      const applications = [];

      const currentUid = user?.uid || localStorage.getItem("uid");
      const currentEmail = (
        user?.email ||
        localStorage.getItem("studentEmail") ||
        ""
      ).toLowerCase().trim();

      querySnapshot.forEach((docItem) => {
        const data = docItem.data();
        const matchesUid = currentUid && data.userId === currentUid;
        const matchesEmail = currentEmail && (
          (data.email && data.email.toLowerCase().trim() === currentEmail) ||
          (data.studentEmail && data.studentEmail.toLowerCase().trim() === currentEmail)
        );

        if (matchesUid || matchesEmail) {
          applications.push({
            id: docItem.id,
            ...data,
          });
        }
      });

      setScholarshipData(applications);
    } catch (err) {
      console.error("Error fetching scholarship documents:", err);
      setError("Failed to fetch scholarship data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllScholarshipData();
  }, [user, db]);

  const handleFileSelect = (appId, targetKey, file) => {
    setReuploadFiles((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        [targetKey]: file,
      },
    }));
  };

  // Handle re-uploading deficient documents and resubmitting
  const handleResubmitApplication = async (app) => {
    const filesToUpload = reuploadFiles[app.id] || {};
    setIsResubmitting((prev) => ({ ...prev, [app.id]: true }));

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5007";
      const updatedDocuments = { ...(app.documents || {}) };
      const updatedDeficiencies = (app.deficiencies || []).map((def) => ({
        ...def,
      }));

      // Upload each replacement file to Cloudinary with FileReader fallback
      for (const [targetKey, file] of Object.entries(filesToUpload)) {
        if (!file) continue;

        let uploadedUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", file);
          const cloudinaryResponse = await axios.post(
            `${apiBase}/upload`,
            formData
          );
          uploadedUrl = cloudinaryResponse.data?.file?.url || "";
        } catch (uploadErr) {
          console.warn("Backend upload offline, using client data URL:", uploadErr);
        }

        // Fallback: convert file to Base64 Data URL so upload never fails
        if (!uploadedUrl) {
          uploadedUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }

        // Clean target document key
        const cleanDocName = targetKey.replace(/^Document:\s*/i, "").trim();

        // Match against existing keys in documents or assign cleanDocName
        const matchingKey =
          Object.keys(updatedDocuments).find(
            (k) =>
              k.toLowerCase() === cleanDocName.toLowerCase() ||
              cleanDocName.toLowerCase().includes(k.toLowerCase()) ||
              k.toLowerCase().includes(cleanDocName.toLowerCase())
          ) || cleanDocName;

        updatedDocuments[matchingKey] = {
          url: uploadedUrl,
          uploadTimestamp: new Date().toISOString(),
          status: "RESUBMITTED",
          rectified: true,
          defectReason: null,
        };

        // Mark corresponding deficiency item as resolved
        const defIndex = updatedDeficiencies.findIndex(
          (d) =>
            d.target === targetKey ||
            d.target.includes(cleanDocName) ||
            d.cleanKey === matchingKey
        );
        if (defIndex !== -1) {
          updatedDeficiencies[defIndex].status = "resolved";
          updatedDeficiencies[defIndex].resolvedAt = new Date().toISOString();
        }
      }

      // Update Firestore document
      const appDocRef = doc(db, "scholarshipApplications", app.id);
      await updateDoc(appDocRef, {
        documents: updatedDocuments,
        deficiencies: updatedDeficiencies,
        reviewStatus: "resubmitted",
        institutionVerificationStatus: "PENDING",
        currentStage: 4, // Returns to Stage 4 (Institution Scrutiny)
        lastRectifiedAt: new Date().toISOString(),
      });

      // Clear local file state for this application
      setReuploadFiles((prev) => ({ ...prev, [app.id]: {} }));

      toast.success(
        "Rectified documents resubmitted to Institutional Nodal Officer!"
      );
      await fetchAllScholarshipData();
    } catch (err) {
      console.error("Resubmission error:", err);
      toast.error("Failed to resubmit. Please try again.");
    } finally {
      setIsResubmitting((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  const getStatusBadge = (status, application = {}) => {
    if (
      status === "pending_institution" ||
      application.institutionVerificationStatus === "PENDING" ||
      application.currentStage === 4 ||
      (status === "pending" && !application.reviewStages?.instituteVerification?.checked)
    ) {
      return {
        icon: <Building className="text-indigo-600" size={18} />,
        text: "Stage 4: Pending Institution Scrutiny",
        className: "bg-indigo-50 text-indigo-800 border-indigo-300",
      };
    }

    switch (status) {
      case "approved":
      case "sanctioned":
        return {
          icon: <Check className="text-emerald-600" size={18} />,
          text: "Ministry Sanctioned & Approved",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "institute_approved":
        return {
          icon: <CheckCircle className="text-blue-600" size={18} />,
          text: "Institution Certified • MoTA Scrutiny",
          className: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "rejected":
        return {
          icon: <X className="text-red-600" size={18} />,
          text: "Rejected",
          className: "bg-red-100 text-red-800 border-red-300",
        };
      case "deficient":
        return {
          icon: <AlertTriangle className="text-amber-600" size={18} />,
          text: "Action Required (Deficiencies Flagged)",
          className: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "resubmitted":
        return {
          icon: <RefreshCw className="text-purple-600" size={18} />,
          text: "Resubmitted (Under Re-Scrutiny)",
          className: "bg-purple-100 text-purple-800 border-purple-300",
        };
      case "disbursed":
        return {
          icon: <CheckCircle className="text-blue-600" size={18} />,
          text: "Scholarship Disbursed",
          className: "bg-blue-100 text-blue-800 border-blue-300",
        };
      default:
        return {
          icon: <Clock className="text-yellow-600" size={18} />,
          text: "Pending Ministry Scrutiny",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
    }
  };

  const renderReviewStages = (reviewStages) => {
    if (!reviewStages) return null;

    const stages = [
      { key: "preliminaryScreening", label: "Preliminary Screening" },
      { key: "duplicateCheck", label: "Duplicate Check" },
      { key: "eligibilityVerification", label: "Eligibility Verification" },
      { key: "academicReview", label: "Academic Review" },
      { key: "documentAuthentication", label: "OCR Document Auth" },
      { key: "finalApproval", label: "Final Sanction & DBT" },
    ];

    return (
      <div className="mt-6 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
          <FileText className="mr-2 text-blue-600" size={16} /> Automated Scrutiny & Verification Pipeline (6 Stages)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stage) => {
            const isComplete = reviewStages[stage.key]?.checked;
            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border text-center transition ${
                  isComplete
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isComplete ? (
                    <Check className="text-emerald-600" size={18} />
                  ) : (
                    <Clock className="text-slate-400" size={18} />
                  )}
                </div>
                <span className="font-semibold text-xs block leading-tight">
                  {stage.label}
                </span>
                <span className="text-[10px] uppercase font-bold mt-1 block text-slate-400">
                  {isComplete ? "Completed" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="bg-white shadow-md rounded-2xl p-8 text-center max-w-md border">
          <X className="mx-auto mb-3 text-red-500" size={40} />
          <h2 className="text-xl font-bold text-gray-800 mb-1">Error</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (scholarshipData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="bg-white shadow-md rounded-2xl p-8 text-center max-w-md border">
          <GraduationCap className="mx-auto mb-3 text-blue-500" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-1">No Applications Found</h2>
          <p className="text-sm text-gray-500 mb-4">
            You haven't applied for any Ministry of Tribal Affairs schemes yet.
          </p>
          <button
            type="button"
            onClick={() => navigate("/viewScholarships")}
            className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            Explore & Apply for Schemes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full mb-2">
            <ShieldCheck size={14} /> Ministry of Tribal Affairs Scholar Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Scholarship & Fellowship Applications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track multi-level scrutiny, respond to deficiency notices, and monitor DBT stipend releases.
          </p>
        </div>

        {/* Applications List */}
        {scholarshipData.map((application) => {
          const statusInfo = getStatusBadge(application.reviewStatus, application);

          // Compile all open deficiencies and rejected documents
          const docDeficiencies = Object.entries(application.documents || {})
            .filter(([_, d]) => d && (d.status === "DEFECTIVE" || d.status === "REJECTED"))
            .map(([k, d]) => ({
              id: `def_doc_${k}`,
              target: `Document: ${k.replace(/([A-Z])/g, " $1").trim()}`,
              cleanKey: k,
              reason: d.defectReason || "Document rejected by Institutional Nodal Officer. Please re-upload a clear copy.",
              status: "open",
            }));

          const rawDeficiencies = (application.deficiencies || []).filter((d) => d.status === "open");
          const mergedDeficiencies = [...rawDeficiencies];
          docDeficiencies.forEach((dd) => {
            if (!mergedDeficiencies.some((md) => md.cleanKey === dd.cleanKey || md.target === dd.target || md.target.includes(dd.cleanKey))) {
              mergedDeficiencies.push(dd);
            }
          });

          const hasOpenDeficiencies =
            (application.reviewStatus === "deficient" ||
             application.institutionVerificationStatus === "DEFICIENT" ||
             docDeficiencies.length > 0) &&
            mergedDeficiencies.length > 0;

          return (
            <div
              key={application.id}
              className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                    {application.schemeType || "ST Fellowship"}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {application.scholarshipName || application.name}
                  </h2>
                  <span className="text-xs text-gray-500">
                    Submitted on: {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusInfo.className}`}
                >
                  {statusInfo.icon}
                  <span>{statusInfo.text}</span>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-6">

                {/* REJECTION REASON BANNER */}
                {(application.reviewStatus === "rejected" || Boolean(application.duplicateFound)) && (
                  <div className="p-5 bg-red-50 border-2 border-red-300 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-base">
                      <XCircle size={22} className="text-red-600 flex-shrink-0" />
                      <span>Application Rejected by Ministry Scrutiny Committee</span>
                    </div>

                    <div className="text-xs text-red-900 leading-relaxed pl-7">
                      <p className="font-semibold">Official Rejection Reason:</p>
                      <p className="mt-0.5 text-red-800 bg-white/70 p-3 rounded-xl border border-red-200">
                        {application.rejectionReason ||
                          (application.duplicateFound
                            ? "Duplicate application detected: A scholarship application for this scheme already exists under your account. Under MoTA guidelines, duplicate applications are rejected."
                            : "Candidate details or submitted academic documents did not satisfy the mandatory scheme requirements.")}
                      </p>
                      {application.reviewNotes && (
                        <p className="text-[11px] text-red-700 mt-2">
                          <strong>Remarks:</strong> {application.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* DEFICIENCY RECTIFICATION ACTION BANNER */}
                {hasOpenDeficiencies && (
                  <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-1">
                      <AlertTriangle size={20} className="text-amber-600" />
                      <span>Action Required: Rectify Deficiencies & Rejected Documents</span>
                    </div>
                    <p className="text-xs text-amber-800 mb-4">
                      The Institutional Scrutiny Board has flagged the following document(s). Please upload clear replacement files and click "Resubmit Rectified Application" below.
                    </p>

                    <div className="space-y-3 mb-5">
                      {mergedDeficiencies.map((def, idx) => (
                        <div
                          key={def.id || idx}
                          className="p-3.5 bg-white border border-amber-300 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="text-xs">
                            <span className="font-bold text-amber-950 block text-sm">
                              {def.target}
                            </span>
                            <span className="text-gray-700 mt-0.5 block">
                              Reason: <strong>{def.reason}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id={`file-${application.id}-${idx}`}
                              className="hidden"
                              onChange={(e) =>
                                handleFileSelect(
                                  application.id,
                                  def.target,
                                  e.target.files[0]
                                )
                              }
                              accept="image/*,application/pdf"
                            />
                            <label
                              htmlFor={`file-${application.id}-${idx}`}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition"
                            >
                              <Upload size={14} />
                              {reuploadFiles[application.id]?.[def.target]
                                ? "Change Replacement"
                                : "Upload Replacement"}
                            </label>

                            {reuploadFiles[application.id]?.[def.target] && (
                              <span className="text-xs text-emerald-700 font-semibold truncate max-w-[150px]">
                                ✓ {reuploadFiles[application.id][def.target].name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleResubmitApplication(application)}
                        disabled={isResubmitting[application.id]}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                      >
                        {isResubmitting[application.id] ? (
                          <>
                            <RefreshCw className="animate-spin" size={14} />
                            Uploading & Resubmitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Resubmit Rectified Application
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Scheduled Tribe Credentials */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-2 flex items-center gap-1">
                      <ShieldCheck size={16} className="text-blue-600" /> Tribal Profile
                    </span>
                    <p><strong>State:</strong> {application.stateOfDomicile || "N/A"}</p>
                    <p><strong>Recognized Tribe:</strong> {application.tribeName || "ST"}</p>
                    <p><strong>Certificate No:</strong> {application.stCertificateNumber || "N/A"}</p>
                    {application.isPVTG && (
                      <span className="inline-block mt-1 font-bold text-indigo-700">
                        ★ PVTG Notified Group
                      </span>
                    )}
                  </div>

                  {/* Academic Profile */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-2 flex items-center gap-1">
                      <GraduationCap size={16} className="text-blue-600" /> Academic Details
                    </span>
                    <p><strong>Institution:</strong> {application.schoolName}</p>
                    <p><strong>Course:</strong> {application.courseOfStudy} ({application.courseLevel})</p>
                    <p><strong>Roll / Reg No:</strong> {application.registrationNumber || application.rollNumber}</p>
                    <p><strong>Qualifying Marks:</strong> {application.previousMarksPercentage ? `${application.previousMarksPercentage}%` : "N/A"}</p>
                  </div>

                  {/* DBT Bank Profile */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-2 flex items-center gap-1">
                      <CreditCard size={16} className="text-blue-600" /> DBT Bank Account
                    </span>
                    <p><strong>Beneficiary:</strong> {application.bankAccountHolder || application.name}</p>
                    <p><strong>Bank:</strong> {application.bankName || "N/A"}</p>
                    <p><strong>Account No:</strong> {application.bankAccountNumber ? `••••${application.bankAccountNumber.slice(-4)}` : "N/A"}</p>
                    <p><strong>IFSC:</strong> {application.bankIFSC || "N/A"}</p>
                  </div>
                </div>

                {/* 5-Stage Verification Pipeline */}
                {renderReviewStages(application.reviewStages)}

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    Application ID: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">{application.id}</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/track")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition shadow-2xs"
                  >
                    <FileText size={14} /> Open Live Pipeline Tracker &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScholarshipData;