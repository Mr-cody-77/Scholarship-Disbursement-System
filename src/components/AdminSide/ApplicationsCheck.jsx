import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import {
  Camera,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  Eye,
  Check,
  X,
  FileText,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  GraduationCap,
  CreditCard,
  Send,
  Plus,
  Trash2,
  Video,
  Calendar,
  Building2,
  CheckCircle2,
  Award,
  FileCheck,
} from "lucide-react";
import { db } from "../../Firebase";
import axios from "axios";
import { rankApplications } from "../../utils/meritScoring";

const ReviewModal = ({ application, onClose, onReviewComplete, onOpenScheduleModal }) => {
  const [activeDocument, setActiveDocument] = useState(null);
  const [reviewStages, setReviewStages] = useState({});
  const [activeStage, setActiveStage] = useState(null);
  const [activeTab, setActiveTab] = useState("documents"); // "documents", "pipeline", "deficiencies"

  // Per-Document Scrutiny State Helper
  const getCleanDocStates = (app) => {
    const initial = {};
    if (app?.documents && typeof app.documents === "object" && Object.keys(app.documents).length > 0) {
      Object.entries(app.documents).forEach(([key, val]) => {
        if (typeof val === "string") {
          initial[key] = { url: val, status: "PENDING", name: key };
        } else if (typeof val === "object" && val !== null) {
          initial[key] = {
            url: val.url || "",
            status: val.status || (val.rectified ? "RESUBMITTED" : "PENDING"),
            defectReason: val.defectReason || null,
            verifiedAt: val.verifiedAt || null,
            name: key,
          };
        }
      });
    } else {
      // Standard required documents for ST scholarship inspection
      const defaultDocs = [
        { key: "stCasteCertificate", label: "ST Community Caste Certificate" },
        { key: "incomeCertificate", label: "Annual Income Certificate / IT Return" },
        { key: "collegeBonafideCertificate", label: "Institutional Bonafide Enrollment Letter" },
        { key: "previousMarksheet", label: "Qualifying Marksheet & Transcript" },
        { key: "feeReceipt", label: "Current Academic Session Fee Receipt" },
      ];
      defaultDocs.forEach((d) => {
        initial[d.key] = {
          url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60",
          status: "PENDING",
          defectReason: null,
          name: d.label,
        };
      });
    }
    return initial;
  };

  const [docStates, setDocStates] = useState(() => getCleanDocStates(application));
  const [defectPromptKey, setDefectPromptKey] = useState(null);
  const [docDefectReason, setDocDefectReason] = useState("");

  // Rejection State
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Deficiency State
  const [isDeficiencyMode, setIsDeficiencyMode] = useState(false);
  const [deficiencies, setDeficiencies] = useState(application?.deficiencies || []);
  const [newDeficiencyTarget, setNewDeficiencyTarget] = useState("");
  const [newDeficiencyReason, setNewDeficiencyReason] = useState("");

  useEffect(() => {
    if (application?.reviewStages) {
      setReviewStages(application.reviewStages);
    }
    if (application?.deficiencies) {
      setDeficiencies(application.deficiencies);
    }
    setDocStates(getCleanDocStates(application));
  }, [application]);

  // Per-Document Scrutiny Handlers
  const handleApproveDoc = (docKey) => {
    setDocStates((prev) => ({
      ...prev,
      [docKey]: {
        ...(prev[docKey] || {}),
        status: "APPROVED",
        verifiedAt: new Date().toISOString(),
        defectReason: null,
      },
    }));

    // Remove any active deficiency matching this document
    setDeficiencies((prev) =>
      prev.filter((d) => d.cleanKey !== docKey && !d.target.includes(docKey))
    );
    if (defectPromptKey === docKey) setDefectPromptKey(null);
    toast.success(`Document "${docKey}" certified as Approved.`);
  };

  const handleConfirmDocDefect = (docKey) => {
    const reason = docDefectReason.trim();
    if (!reason) {
      toast.warning("Please provide a reason why this document is defective.");
      return;
    }

    setDocStates((prev) => ({
      ...prev,
      [docKey]: {
        ...(prev[docKey] || {}),
        status: "DEFECTIVE",
        defectReason: reason,
        flaggedAt: new Date().toISOString(),
      },
    }));

    const targetLabel = `Document: ${docKey.replace(/([A-Z])/g, " $1").trim()}`;
    const newDef = {
      id: `def_${Date.now()}_${docKey}`,
      target: targetLabel,
      cleanKey: docKey,
      reason: reason,
      status: "open",
      flaggedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    setDeficiencies((prev) => {
      const filtered = prev.filter(
        (d) => d.cleanKey !== docKey && d.target !== targetLabel && !d.target.includes(docKey)
      );
      return [...filtered, newDef];
    });

    setDefectPromptKey(null);
    setDocDefectReason("");
    toast.info(`Document "${docKey}" marked as Defective.`);
  };

  const updateStageStatus = (stage, field, value) => {
    setReviewStages((prev) => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value,
      },
    }));
  };

  // 1. Accept Bonafide & Forward to MoTA Apex Scrutiny
  const handleAcceptBonafide = () => {
    const hasDefectiveDocs = Object.values(docStates).some(
      (d) => d.status === "DEFECTIVE"
    );
    if (hasDefectiveDocs) {
      toast.warning(
        "One or more documents are flagged Defective. Use 'Flag Deficiencies' to request student re-upload."
      );
      return;
    }

    const updatedStages = {
      ...reviewStages,
      instituteVerification: {
        checked: true,
        status: "COMPLETED",
        verifiedAt: new Date().toISOString(),
        verifierRole: "AISHE Institutional Nodal Officer",
        notes: "Bonafide enrollment, fees, and attendance certified. Forwarded to Ministry Scrutiny Board.",
      },
    };

    toast.success("Bonafide Certified! Application forwarded to MoTA Scrutiny Board.");
    onReviewComplete({
      reviewStages: updatedStages,
      reviewStatus: "institute_approved",
      institutionVerificationStatus: "VERIFIED",
      currentStage: 5,
      instituteVerified: true,
      documents: docStates,
      lastUpdated: new Date().toISOString(),
    });
  };

  // 2. Accept Student's Proposed Rescheduled Time
  const handleAcceptReschedule = () => {
    if (!application?.interviewSession?.rescheduleRequest?.preferredDateTime) return;
    const preferred = application.interviewSession.rescheduleRequest.preferredDateTime;
    const updatedSession = {
      ...application.interviewSession,
      dateTime: preferred,
      status: "SCHEDULED",
      rescheduleRequest: null,
      updatedAt: new Date().toISOString(),
    };
    onReviewComplete({
      interviewSession: updatedSession,
    });
    toast.success("Student proposed hearing time accepted!");
  };

  const handleFinalReview = () => {
    const allStagesChecked = Object.values(reviewStages).every(
      (stage) => stage.checked
    );
    toast.success("Application updated successfully");
    onReviewComplete({
      reviewStages,
      reviewStatus: allStagesChecked ? "institute_approved" : "pending",
    });
  };

  // 3. Reject Defective Documents & Return to Student for Resubmission
  const handleRejectAndRequestResubmission = () => {
    const rejectedEntries = Object.entries(docStates).filter(
      ([_, d]) => d?.status === "DEFECTIVE" || d?.status === "REJECTED"
    );

    let activeDefs = [...deficiencies];

    // Auto-create deficiency items for every rejected document
    rejectedEntries.forEach(([key, d]) => {
      const targetLabel = `Document: ${key.replace(/([A-Z])/g, " $1").trim()}`;
      if (!activeDefs.some((def) => def.cleanKey === key || def.target === targetLabel || def.target.includes(key))) {
        activeDefs.push({
          id: `def_${Date.now()}_${key}`,
          target: targetLabel,
          cleanKey: key,
          reason: d.defectReason || "Document rejected by Institutional Nodal Officer. Please re-upload a clear copy.",
          status: "open",
          flaggedAt: new Date().toISOString(),
          source: "institute",
        });
      }
    });

    if (activeDefs.length === 0 && !rejectionReason.trim()) {
      toast.warning("Please flag or reject at least one document or specify a defect reason.");
      return;
    }

    const rejectedNames = rejectedEntries
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
      .join(", ");
    const summaryReason =
      rejectionReason.trim() ||
      `Institutional Nodal Officer rejected ${activeDefs.length} document(s): ${
        rejectedNames || "Document defects noted"
      }. Please re-upload corrected documents.`;

    const updatedStages = {
      ...reviewStages,
      instituteVerification: {
        checked: false,
        status: "DEFICIENT",
        rejectionReason: summaryReason,
        rejectedAt: new Date().toISOString(),
        verifierRole: "AISHE Institutional Nodal Officer",
        notes: `Document defects flagged for scholar rectification: ${rejectedNames || "Deficiencies noted"}`,
      },
    };

    toast.info("Rejected documents dispatched to student for resubmission.");
    onReviewComplete({
      reviewStages: updatedStages,
      reviewStatus: "deficient",
      institutionVerificationStatus: "DEFICIENT",
      currentStage: 3, // Pipeline Stage 3: Deficiencies / Re-upload
      deficiencies: activeDefs,
      documents: docStates,
      rejectionReason: summaryReason,
      reviewNotes: summaryReason,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleReject = () => {
    const rejectedEntries = Object.entries(docStates).filter(
      ([_, d]) => d?.status === "DEFECTIVE" || d?.status === "REJECTED"
    );

    // If documents were marked defective/rejected, route directly to resubmission
    if (rejectedEntries.length > 0) {
      handleRejectAndRequestResubmission();
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting the application");
      return;
    }

    const updatedStages = {
      ...reviewStages,
      instituteVerification: {
        checked: true,
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
        rejectedAt: new Date().toISOString(),
      },
    };

    onReviewComplete({
      reviewStages: updatedStages,
      reviewStatus: "rejected",
      institutionVerificationStatus: "REJECTED",
      currentStage: 4,
      rejectionReason: rejectionReason.trim(),
      documents: docStates,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Add a deficiency item
  const handleAddDeficiency = () => {
    if (!newDeficiencyTarget || !newDeficiencyReason.trim()) {
      toast.warning("Please select a target and provide deficiency details.");
      return;
    }

    const newDef = {
      id: `def_${Date.now()}`,
      target: newDeficiencyTarget,
      reason: newDeficiencyReason.trim(),
      status: "open",
      flaggedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    setDeficiencies((prev) => [...prev, newDef]);
    setNewDeficiencyTarget("");
    setNewDeficiencyReason("");
  };

  const handleRemoveDeficiency = (id) => {
    setDeficiencies((prev) => prev.filter((d) => d.id !== id));
  };

  // Submit Deficiencies to Student
  const handleSubmitDeficiencies = () => {
    if (deficiencies.length === 0) {
      toast.error("Please add at least one deficiency note before notifying.");
      return;
    }

    onReviewComplete({
      reviewStages,
      reviewStatus: "deficient",
      institutionVerificationStatus: "DEFICIENT",
      currentStage: 3,
      deficiencies,
      documents: docStates,
      lastUpdated: new Date().toISOString(),
    });
  };

  const stages = [
    { key: "preliminaryScreening", label: "1. Preliminary Screening (Aadhaar & Contact)" },
    { key: "duplicateCheck", label: "2. Duplicate Application Check" },
    { key: "eligibilityVerification", label: "3. Automated Eligibility Verification" },
    { key: "academicReview", label: "4. Academic Benchmark Review" },
    { key: "documentAuthentication", label: "5. Document AI-OCR Authentication" },
    { key: "finalApproval", label: "6. Committee Final Sanction & DBT Release" },
  ];

  const docOptions = application.documents
    ? Object.keys(application.documents)
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-6xl h-5/6 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Applicant & Tribal Profile */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto bg-slate-50 border-r border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <FileText className="mr-2 text-blue-600" size={22} />
              Applicant Profile
            </h2>
            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold rounded-md">
              {application.schemeType || "ST Scheme"}
            </span>
          </div>

          <div className="space-y-6 text-sm text-gray-700">
            {/* Scheduled Tribe Credentials */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-2">
                <ShieldCheck size={18} />
                <span>Tribal & Caste Identification</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">State of Domicile:</span>
                  <span className="font-semibold text-gray-800">
                    {application.stateOfDomicile || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Recognized Tribe:</span>
                  <span className="font-semibold text-gray-800">
                    {application.tribeName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">ST Certificate No:</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {application.stCertificateNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">PVTG Category:</span>
                  <span
                    className={`font-bold ${
                      application.isPVTG ? "text-indigo-600" : "text-gray-600"
                    }`}
                  >
                    {application.isPVTG ? "✓ Yes (PVTG Quota)" : "Standard ST"}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-gray-800 mb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><strong>Name:</strong> {application.name}</p>
                <p><strong>Gender:</strong> {application.gender || "N/A"}</p>
                <p><strong>Email:</strong> {application.email}</p>
                <p><strong>Contact:</strong> {application.contactNumber || application.phoneNumber}</p>
                <p><strong>Aadhaar:</strong> {application.aadhaarNumber ? `XXXX-XXXX-${String(application.aadhaarNumber).slice(-4)}` : "N/A"}</p>
                <p><strong>Annual Income:</strong> ₹{Number(application.annualIncome || 0).toLocaleString()}</p>
                <p><strong>Father's Name:</strong> {application.fatherName || "N/A"}</p>
                <p><strong>Mother's Name:</strong> {application.motherName || "N/A"}</p>
                <div className="col-span-2">
                  <p><strong>Address:</strong> {application.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-2">
                <GraduationCap size={18} />
                <span>Academic & University Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><strong>Institution:</strong> {application.schoolName}</p>
                <p><strong>Course Level:</strong> {application.courseLevel || "N/A"}</p>
                <p><strong>Course/Dept:</strong> {application.courseOfStudy}</p>
                <p><strong>Registration No:</strong> {application.registrationNumber}</p>
                <p><strong>Roll No:</strong> {application.rollNumber}</p>
                <p><strong>Qualifying Marks:</strong> {application.previousMarksPercentage ? `${application.previousMarksPercentage}%` : "N/A"}</p>
                <p><strong>GPA:</strong> {application.gpa || "N/A"}</p>
              </div>
            </div>

            {/* DBT Bank Account */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-2">
                <CreditCard size={18} />
                <span>Direct Benefit Transfer (DBT) Bank Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><strong>Account Holder:</strong> {application.bankAccountHolder || application.name}</p>
                <p><strong>Bank:</strong> {application.bankName || "N/A"}</p>
                <p><strong>Account No:</strong> {application.bankAccountNumber || "N/A"}</p>
                <p><strong>IFSC Code:</strong> {application.bankIFSC || "N/A"}</p>
              </div>
            </div>

            {/* Automated Eligibility Result */}
            {application.eligibilityResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  application.eligibilityResult.eligible
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <span className="font-bold block mb-1">
                  AI Eligibility Pre-Check: {application.eligibilityResult.eligible ? "PASSED" : "FLAGGED"}
                </span>
                <ul className="space-y-0.5">
                  {application.eligibilityResult.checks?.map((chk, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span>{chk.passed ? "✓" : "⚠"}</span>
                      <span>{chk.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Review Stages, Per-Document Scrutiny & Deficiency Management */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-2 border-b border-slate-200 gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("documents");
                    setIsDeficiencyMode(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "documents"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText size={14} />
                  <span>Document Scrutiny</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded-full font-bold">
                    {Object.keys(docStates).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pipeline");
                    setIsDeficiencyMode(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "pipeline"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList size={14} />
                  <span>Stages</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("deficiencies");
                    setIsDeficiencyMode(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "deficiencies"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  <AlertTriangle size={14} />
                  <span>Deficiencies</span>
                  {deficiencies.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded-full font-bold">
                      {deficiencies.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: INDIVIDUAL PER-DOCUMENT SCRUTINY */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                    <FileCheck size={16} className="text-blue-600" />
                    <span>Institutional Bonafide & Document Decisioning</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Verify each certificate against candidate's Aadhaar profile, tribal community, and college bonafide enrollment. Individually approve or flag each document below.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.keys(docStates).length === 0 ? (
                    <div className="p-4 bg-slate-50 border rounded-xl text-center text-xs text-slate-500">
                      No uploaded documents found for this candidate.
                    </div>
                  ) : (
                    Object.entries(docStates).map(([docKey, docData]) => {
                      const docUrl = typeof docData === "string" ? docData : docData?.url;
                      const status = typeof docData === "object" ? (docData?.status || "PENDING") : "PENDING";
                      const isSelected = activeDocument === docKey;
                      const isDefective = status === "DEFECTIVE";
                      const isApproved = status === "APPROVED";

                      return (
                        <div
                          key={docKey}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isApproved
                              ? "bg-emerald-50/50 border-emerald-300"
                              : isDefective
                              ? "bg-amber-50/60 border-amber-300"
                              : "bg-white border-slate-200 shadow-2xs"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 capitalize">
                                {docKey.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              {isApproved && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <Check size={10} /> Approved
                                </span>
                              )}
                              {isDefective && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                                  <X size={10} /> Rejected / Defective
                                </span>
                              )}
                              {!isApproved && !isDefective && status === "RESUBMITTED" && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                                  <Clock size={10} /> Resubmitted
                                </span>
                              )}
                              {!isApproved && !isDefective && status !== "RESUBMITTED" && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                                  <Clock size={10} /> Pending
                                </span>
                              )}
                            </div>

                            {/* Per-Document Actions */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              {docUrl && (
                                <button
                                  type="button"
                                  onClick={() => setActiveDocument(isSelected ? null : docKey)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                                >
                                  {isSelected ? "Hide Preview" : "Preview"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleApproveDoc(docKey)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                                  isApproved
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                              >
                                <Check size={12} /> {isApproved ? "Approved ✓" : "Approve"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (defectPromptKey === docKey) {
                                    setDefectPromptKey(null);
                                  } else {
                                    setDefectPromptKey(docKey);
                                    setDocDefectReason(docData?.defectReason || "");
                                  }
                                }}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                                  isDefective
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                }`}
                              >
                                <X size={12} /> {isDefective ? "Rejected ✕" : "Reject Document"}
                              </button>
                            </div>
                          </div>

                          {/* Inline Defect Reason Form */}
                          {defectPromptKey === docKey && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl space-y-2">
                              <label className="text-[11px] font-bold text-red-900 block">
                                Specify Rejection Reason for {docKey.replace(/([A-Z])/g, " $1").trim()}:
                              </label>
                              <input
                                type="text"
                                value={docDefectReason}
                                onChange={(e) => setDocDefectReason(e.target.value)}
                                placeholder="e.g. Seal blurred, Name mismatch with Aadhaar, Incomplete stamp"
                                className="w-full p-2 text-xs border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDefectPromptKey(null)}
                                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDocDefect(docKey)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                                >
                                  <X size={12} /> Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Defect note if present */}
                          {isDefective && docData?.defectReason && (
                            <p className="mt-2 text-[11px] text-red-900 bg-red-100/70 p-2 rounded-lg border border-red-200">
                              <strong>Rejection Reason:</strong> {docData.defectReason}
                            </p>
                          )}

                          {/* Image Preview */}
                          {isSelected && docUrl && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-center">
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline font-bold block mb-2"
                              >
                                Open Document in Full Resolution &rarr;
                              </a>
                              <img
                                src={docUrl}
                                alt={docKey}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                                className="max-h-60 mx-auto object-contain rounded-lg border border-slate-100"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DEFICIENCY MANAGEMENT MODE */}
            {activeTab === "deficiencies" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <span>Flag Deficiencies for Candidate Rectification</span>
                  </div>
                  <p className="text-xs text-amber-800 mb-4">
                    MoTA guidelines allow students to rectify illegible documents or missing certificates without rejection.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Select Target Document / Field *
                      </label>
                      <select
                        value={newDeficiencyTarget}
                        onChange={(e) => setNewDeficiencyTarget(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Choose item...</option>
                        <optgroup label="Uploaded Documents">
                          {docOptions.map((docName) => (
                            <option key={docName} value={`Document: ${docName}`}>
                              Document: {docName}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Profile Fields">
                          <option value="Field: ST Certificate Number">
                            Field: ST Certificate Number
                          </option>
                          <option value="Field: Annual Family Income">
                            Field: Annual Family Income
                          </option>
                          <option value="Field: Bank Account / IFSC">
                            Field: Bank Account / IFSC
                          </option>
                          <option value="Field: Domicile / Tribe Record">
                            Field: Domicile / Tribe Record
                          </option>
                          <option value="General Profile">General Profile</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Deficiency Explanation & Guidance for Student *
                      </label>
                      <textarea
                        value={newDeficiencyReason}
                        onChange={(e) => setNewDeficiencyReason(e.target.value)}
                        rows={2}
                        placeholder="e.g. Uploaded ST certificate copy is blurred and stamp is illegible. Please upload a clear 300 DPI scan."
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddDeficiency}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
                    >
                      <Plus size={14} /> Add Deficiency Item
                    </button>
                  </div>
                </div>

                {/* Deficiency Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">
                    Pending Deficiencies ({deficiencies.length})
                  </h4>
                  {deficiencies.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      No deficiency items added yet.
                    </p>
                  ) : (
                    deficiencies.map((def) => (
                      <div
                        key={def.id}
                        className="p-3 bg-white border border-amber-300 rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-amber-900 block">
                            {def.target}
                          </span>
                          <span className="text-gray-700">{def.reason}</span>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            Status: <strong className="uppercase">{def.status}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeficiency(def.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: REGULAR 6-STAGE REVIEW PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="space-y-3">
                {stages.map((stage) => {
                  const stageData = reviewStages[stage.key] || {};
                  return (
                    <div
                      key={stage.key}
                      className={`p-3.5 rounded-xl transition-all border ${
                        activeStage === stage.key
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                          setActiveStage(activeStage === stage.key ? null : stage.key)
                        }
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={stageData.checked || false}
                            onChange={(e) =>
                              updateStageStatus(stage.key, "checked", e.target.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span
                            className={`font-semibold text-sm ${
                              stageData.checked ? "text-emerald-700" : "text-gray-800"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                        {stageData.checked ? (
                          <Check className="text-emerald-500" size={18} />
                        ) : (
                          <Clock className="text-gray-400" size={18} />
                        )}
                      </div>

                      {/* Expanded Section Details */}
                      {activeStage === stage.key && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                            Reviewer Verification Notes
                          </label>
                          <textarea
                            value={stageData.notes || ""}
                            onChange={(e) =>
                              updateStageStatus(stage.key, "notes", e.target.value)
                            }
                            placeholder={`Enter verification findings for ${stage.label}...`}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rejection Section */}
            {isRejecting && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                  <AlertTriangle size={18} />
                  <span>Permanent Rejection Reason</span>
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Detail the official grounds for rejection (e.g. Non-ST candidate, Income exceeds scheme limit)..."
                  className="w-full p-2 border border-red-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t mt-6 flex flex-col gap-3">
            {/* Student Reschedule Request Notice if pending */}
            {application.interviewSession?.status === "RESCHEDULE_REQUESTED" && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold block">⚠ Student Requested Hearing Reschedule:</span>
                  <span>
                    Proposed: <strong>{new Date(application.interviewSession.rescheduleRequest?.preferredDateTime).toLocaleString()}</strong> • Reason: {application.interviewSession.rescheduleRequest?.reason}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptReschedule}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Accept Proposed Time
                </button>
              </div>
            )}

            {/* Document Defect Alert Banner */}
            {Object.values(docStates).some((d) => d?.status === "DEFECTIVE" || d?.status === "REJECTED") && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  <span>
                    <strong>Document Defects Flagged:</strong> Click below to reject the defective documents and notify the student to re-upload.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRejectAndRequestResubmission}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Send size={13} />
                  Reject Docs & Send to Student
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {activeTab === "deficiencies" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("documents")}
                      className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                    >
                      Back to Docs
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitDeficiencies}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Send size={14} /> Send Deficiency Notice ({deficiencies.length})
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenScheduleModal(application)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition"
                    >
                      <Video size={14} /> Schedule Video Hearing
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("deficiencies")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition"
                    >
                      <AlertTriangle size={14} /> Flag Deficiencies {deficiencies.length > 0 && `(${deficiencies.length})`}
                    </button>

                    {Object.values(docStates).some((d) => d?.status === "DEFECTIVE" || d?.status === "REJECTED") ? (
                      <button
                        type="button"
                        onClick={handleRejectAndRequestResubmission}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        <X size={14} /> Reject Defective Documents & Return to Student
                      </button>
                    ) : (
                      <>
                        {!isRejecting ? (
                          <button
                            type="button"
                            onClick={() => setIsRejecting(true)}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition"
                          >
                            Reject Application
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleReject}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Confirm Rejection
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={handleAcceptBonafide}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <CheckCircle2 size={15} /> Accept Bonafide & Forward to MoTA
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Video Conference Hearing Scheduler State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    dateTime: "",
    purpose: "Original ST Certificate & Bonafide Enrollment Scrutiny",
    meetingLink: "",
    instructions: "Please keep original Class 10th certificate, ST community certificate, and college ID card handy.",
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "scholarshipApplications")
        );
        const applicationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort applications transparently by MoTA Merit Priority Score
        const rankedList = rankApplications(applicationsList);
        setApplications(rankedList);
        setFilteredApplications(rankedList);
      } catch (error) {
        toast.error("Failed to fetch applications");
      }
    };

    fetchApplications();
  }, []);

  const handleOpenScheduleModal = (app) => {
    setSchedulingApp(app);
    setScheduleData({
      dateTime: "",
      purpose: "Original ST Certificate & Bonafide Enrollment Scrutiny",
      meetingLink: `https://meet.jit.si/MoTA-Institute-Hearing-${app.id.slice(-6)}`,
      instructions: "Please keep original Class 10th certificate, ST community certificate, and college ID card ready.",
    });
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleData.dateTime) {
      toast.error("Please specify a valid date and time for the video hearing");
      return;
    }

    try {
      setIsSubmittingSchedule(true);
      const session = {
        scheduledBy: "institute",
        officerName: "AISHE Institutional Nodal Officer",
        authorityLabel: "Institutional Nodal Authority",
        dateTime: scheduleData.dateTime,
        purpose: scheduleData.purpose,
        meetingLink: scheduleData.meetingLink,
        instructions: scheduleData.instructions,
        status: "SCHEDULED",
        scheduledAt: new Date().toISOString(),
        rescheduleRequest: null,
      };

      const appRef = doc(db, "scholarshipApplications", schedulingApp.id);
      await updateDoc(appRef, { interviewSession: session });

      try {
        await addDoc(collection(db, "institutionScrutinyHistory"), {
          applicationId: schedulingApp.id,
          applicantName: schedulingApp.name || schedulingApp.fullName || "Scholar",
          email: schedulingApp.email || "",
          schemeType: schedulingApp.schemeType || "ST Scheme",
          scholarshipName: schedulingApp.scholarshipName || schedulingApp.name || "Higher Education Scheme",
          institution: schedulingApp.schoolName || "AISHE Registered College",
          decision: "Hearing Scheduled",
          reviewStatus: schedulingApp.reviewStatus || "hearing_scheduled",
          notes: `Hearing scheduled for ${new Date(scheduleData.dateTime).toLocaleString()}. Purpose: ${scheduleData.purpose}`,
          officerRole: "AISHE Institutional Nodal Officer",
          timestamp: new Date().toISOString(),
        });
      } catch (histErr) {
        console.warn("Audit history log error:", histErr);
      }

      setApplications((prev) =>
        prev.map((a) => (a.id === schedulingApp.id ? { ...a, interviewSession: session } : a))
      );
      toast.success("Video hearing scheduled and invitation sent to scholar!");
      setIsScheduleModalOpen(false);
      setSchedulingApp(null);
    } catch (err) {
      console.error("Hearing scheduling error:", err);
      toast.error("Failed to schedule hearing.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  useEffect(() => {
    let result = applications;

    if (searchTerm) {
      result = result.filter(
        (app) =>
          app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.tribeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.stCertificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((app) => app.reviewStatus === filterStatus);
    }

    setFilteredApplications(result);
  }, [searchTerm, filterStatus, applications]);

  const handleReviewComplete = async (reviewData) => {
    try {
      const applicationRef = doc(db, "scholarshipApplications", selectedApplication.id);

      const emailDetails = prepareEmailDetails(reviewData, selectedApplication);
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5007";

      // Send update email
      try {
        await axios.post(`${apiBase}/send-application-update-email`, {
          email: selectedApplication.email,
          ...emailDetails,
        });
      } catch (emailErr) {
        console.warn("Email dispatch error:", emailErr.message);
      }

      // Update Firestore
      await updateDoc(applicationRef, reviewData);

      // Write immutable audit log to institutionScrutinyHistory
      try {
        const decisionText =
          reviewData.reviewStatus === "institute_approved"
            ? "Certified & Forwarded"
            : reviewData.reviewStatus === "deficient"
            ? "Flagged Defective"
            : reviewData.reviewStatus === "rejected"
            ? "Rejected"
            : "Scrutiny Updated";

        const notesText =
          reviewData.rejectionReason ||
          (reviewData.deficiencies?.length
            ? `${reviewData.deficiencies.length} defect item(s) flagged for scholar rectification`
            : "Bonafide enrollment, fees & attendance certified. Forwarded to MoTA Apex Scrutiny.");

        await addDoc(collection(db, "institutionScrutinyHistory"), {
          applicationId: selectedApplication.id,
          applicantName: selectedApplication.name || selectedApplication.fullName || "Scholar",
          email: selectedApplication.email || "",
          schemeType: selectedApplication.schemeType || "ST Scheme",
          scholarshipName: selectedApplication.scholarshipName || selectedApplication.name || "Higher Education Scheme",
          institution: selectedApplication.schoolName || "AISHE Registered College",
          decision: decisionText,
          reviewStatus: reviewData.reviewStatus || selectedApplication.reviewStatus,
          notes: notesText,
          officerRole: "AISHE Institutional Nodal Officer",
          timestamp: new Date().toISOString(),
        });
      } catch (histErr) {
        console.warn("Audit history log error:", histErr);
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, ...reviewData } : app
        )
      );
      setIsReviewModalOpen(false);
      toast.success("Application review submitted and notified to scholar!");
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application. Please try again.");
    }
  };

  const prepareEmailDetails = (reviewData, application) => {
    let subject = "Ministry of Tribal Affairs: Scholarship Status Update";
    let body = `Dear ${application.name},\n\n`;

    if (reviewData.reviewStatus === "approved") {
      subject = "CONGRATULATIONS: Scholarship Application Approved - MoTA";
      body += `We are pleased to inform you that your application for ${
        application.scholarshipName || "ST Higher Education Scholarship"
      } has been APPROVED by the verification committee.\n\n`;
      body += `Your Direct Benefit Transfer (DBT) details have been queued for disbursement processing.\n\n`;
    } else if (reviewData.reviewStatus === "deficient") {
      subject = "ACTION REQUIRED: Deficiency Noted in Scholarship Application - MoTA";
      body += `During the scrutiny of your application for ${
        application.scholarshipName || "ST Higher Education Scholarship"
      }, the scrutiny committee identified specific deficiencies requiring rectification:\n\n`;

      if (reviewData.deficiencies && reviewData.deficiencies.length > 0) {
        body += "ITEMS REQUIRING RECTIFICATION:\n";
        reviewData.deficiencies.forEach((item, idx) => {
          body += `${idx + 1}. [${item.target}]: ${item.reason}\n`;
        });
        body += "\n";
      }

      body += "Please log in to the portal dashboard and re-upload the required documents to avoid cancellation.\n\n";
    } else if (reviewData.reviewStatus === "rejected") {
      subject = "Update on Your Scholarship Application - MoTA";
      body += `We regret to inform you that your scholarship application has been rejected.\n\n`;
      if (reviewData.rejectionReason) {
        body += `Reason: ${reviewData.rejectionReason}\n\n`;
      }
    } else {
      body += `Your application is currently under review by the Ministry of Tribal Affairs.\n\n`;
    }

    body += `Applicant: ${application.name}\n`;
    body += `Recognized Tribe: ${application.tribeName || "ST"}\n`;
    body += `State: ${application.stateOfDomicile || "India"}\n\n`;
    body += "Best regards,\nMinistry of Tribal Affairs (MoTA)\nScholarship & Fellowship Scrutiny Board";

    return { subject, body };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "deficient":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "resubmitted":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "disbursed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-2">
              <Building2 size={14} /> Institutional Nodal Portal (AISHE)
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Bonafide Verification & Scrutiny
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Certify enrolled ST scholars, review fee/admission records, flag deficiencies, schedule video hearings, and forward certified applications to MoTA Apex Scrutiny.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, tribe, certificate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm w-64 bg-white focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Institute Action</option>
              <option value="institute_approved">Forwarded to Ministry</option>
              <option value="deficient">Deficient (Action Required)</option>
              <option value="resubmitted">Resubmitted by Student</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Application Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app, idx) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-slate-200 transition-all cursor-pointer p-6 flex flex-col justify-between"
              onClick={() => {
                setSelectedApplication(app);
                setIsReviewModalOpen(true);
              }}
            >
              <div>
                {/* Priority Rank & Quota Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-[11px] flex items-center gap-1">
                    <Award size={13} className="text-blue-700" />
                    Priority #{app.meritRank || idx + 1} • Score: {app.meritScore || 85}/100
                  </span>
                  {app.isPVTG && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md text-[10px]">
                      ★ PVTG Quota
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition">
                      {app.name}
                    </h2>
                    <span className="text-xs text-gray-500 block">
                      {app.courseOfStudy} • {app.schoolName}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(
                      app.reviewStatus
                    )}`}
                  >
                    {app.reviewStatus || "Pending"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scheme:</span>
                    <span className="font-semibold text-slate-800">
                      {app.schemeType || "ST Fellowship"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tribe:</span>
                    <span className="font-semibold text-slate-800">
                      {app.tribeName || "ST Candidate"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">State:</span>
                    <span className="font-semibold text-slate-800">
                      {app.stateOfDomicile || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annual Income:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{Number(app.annualIncome || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Video Hearing Status on Card */}
                {app.interviewSession && (
                  <div
                    className={`mt-2.5 p-2 rounded-lg text-[11px] border ${
                      app.interviewSession.status === "RESCHEDULE_REQUESTED"
                        ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                        : "bg-indigo-50 border-indigo-200 text-indigo-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Video size={13} className="text-indigo-600" />
                        <span>
                          {app.interviewSession.status === "RESCHEDULE_REQUESTED"
                            ? "Student Requested Reschedule"
                            : `Hearing: ${new Date(app.interviewSession.dateTime).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}`}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80">
                        {app.interviewSession.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Deficiency Notice if applicable */}
                {app.reviewStatus === "deficient" && app.deficiencies?.length > 0 && (
                  <div className="mt-2.5 p-2 bg-amber-50 text-amber-900 rounded-lg text-xs border border-amber-200">
                    <strong className="block">Deficiency:</strong>
                    <span className="truncate block">
                      {app.deficiencies[0].reason}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>View Full Application &rarr;</span>
                <span className="text-gray-400 font-normal">
                  {new Date(app.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewComplete={handleReviewComplete}
          onOpenScheduleModal={(app) => {
            setIsReviewModalOpen(false);
            handleOpenScheduleModal(app);
          }}
        />
      )}

      {/* SCHEDULE VIDEO HEARING MODAL */}
      {isScheduleModalOpen && schedulingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Video size={18} className="text-indigo-600" />
                  Schedule Online Video Hearing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applicant: <strong>{schedulingApp.name}</strong> • {schedulingApp.schoolName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setSchedulingApp(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hearing Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleData.dateTime}
                  onChange={(e) =>
                    setScheduleData((prev) => ({ ...prev, dateTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hearing Agenda / Purpose
                </label>
                <input
                  type="text"
                  value={scheduleData.purpose}
                  onChange={(e) =>
                    setScheduleData((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Secure Video Meeting Link (NIC / WebRTC)
                </label>
                <input
                  type="url"
                  value={scheduleData.meetingLink}
                  onChange={(e) =>
                    setScheduleData((prev) => ({ ...prev, meetingLink: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instructions for Student
                </label>
                <textarea
                  rows={2}
                  value={scheduleData.instructions}
                  onChange={(e) =>
                    setScheduleData((prev) => ({ ...prev, instructions: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setSchedulingApp(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingSchedule ? "Scheduling..." : "Confirm & Send Hearing Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;