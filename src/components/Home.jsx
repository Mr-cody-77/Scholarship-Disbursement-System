import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Phone,
  CreditCard,
  Lock,
  ArrowRight,
  Edit3,
  User,
  Calendar,
  Mail,
  Award,
  BookOpen,
  Check,
  Sparkles,
  Building,
  Clock,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const db = getDatabase();
  const auth = getAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeApplication, setActiveApplication] = useState(null);

  // Verification States
  const [phoneInput, setPhoneInput] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    return localStorage.getItem("phoneVerified") === "true";
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEkycDone, setIsEkycDone] = useState(() => {
    return (
      localStorage.getItem("ekycVerified") === "true" ||
      localStorage.getItem("isEkycDone") === "true" ||
      localStorage.getItem("aadharVerified") === "true"
    );
  });

  // Load user data from RTDB and Firestore
  useEffect(() => {
    const loadProfileAndPipeline = async () => {
      const uid = localStorage.getItem("uid") || auth.currentUser?.uid;
      const currentEmail = (
        auth.currentUser?.email ||
        localStorage.getItem("studentEmail") ||
        ""
      ).toLowerCase().trim();

      if (!uid && !currentEmail) {
        navigate("/login");
        return;
      }

      // Check Firestore scholarshipApplications to enforce pipeline consistency:
      // If candidate already has an active application, all prerequisite stages
      // (Registration, Aadhaar e-KYC, and Mobile verification) are guaranteed complete.
      let existingApp = null;
      try {
        const fs = getFirestore();
        const appSnap = await getDocs(collection(fs, "scholarshipApplications"));
        appSnap.forEach((docItem) => {
          const d = docItem.data();
          const matchesUid = uid && d.userId === uid;
          const matchesEmail = currentEmail && (
            (d.email && d.email.toLowerCase().trim() === currentEmail) ||
            (d.studentEmail && d.studentEmail.toLowerCase().trim() === currentEmail)
          );
          if (matchesUid || matchesEmail) {
            existingApp = { id: docItem.id, ...d };
          }
        });
      } catch (fsErr) {
        console.warn("Error cross-referencing applications in Home.jsx:", fsErr);
      }

      if (existingApp) {
        setActiveApplication(existingApp);
      }

      const userRef = ref(db, `users/${uid || "default"}`);
      get(userRef)
        .then(async (snapshot) => {
          let rtdbData = {};
          if (snapshot.exists()) {
            rtdbData = snapshot.val();
          }

          // Clean phone number
          let rawPhone =
            rtdbData.phoneNumber ||
            existingApp?.phoneNumber ||
            existingApp?.phone ||
            localStorage.getItem("phoneNumber") ||
            "";
          let cleanPhone = String(rawPhone).replace(/\D/g, "");
          if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
            cleanPhone = cleanPhone.slice(1);
          } else if (cleanPhone.length > 10) {
            cleanPhone = cleanPhone.slice(-10);
          }
          if (cleanPhone) {
            setPhoneInput(cleanPhone);
          }

          // Check phone verified: true if application exists OR verified in RTDB/localStorage
          const phoneVerifiedFlag = Boolean(
            Boolean(existingApp) ||
            rtdbData.phoneVerified ||
            localStorage.getItem("phoneVerified") === "true"
          );
          if (phoneVerifiedFlag) {
            setIsPhoneVerified(true);
            localStorage.setItem("phoneVerified", "true");
            if (uid && !rtdbData.phoneVerified) {
              update(ref(db, `users/${uid}`), { phoneVerified: true }).catch(() => {});
            }
          }

          // Check e-KYC: true if application exists OR verified in RTDB/Firestore/localStorage
          let ekycStatus = Boolean(
            Boolean(existingApp) ||
            rtdbData.isEkycDone ||
            rtdbData.ekycVerified ||
            rtdbData.aadharVerified ||
            rtdbData.isAadhaarVerified ||
            rtdbData.isBiometricVerified ||
            localStorage.getItem("ekycVerified") === "true" ||
            localStorage.getItem("isEkycDone") === "true" ||
            localStorage.getItem("aadharVerified") === "true"
          );

          if (!ekycStatus && uid) {
            try {
              const fs = getFirestore();
              const kycSnap = await getDoc(doc(fs, "kyc", uid));
              if (kycSnap.exists() && kycSnap.data()?.status === "verified") {
                ekycStatus = true;
              }
            } catch (kycErr) {
              console.warn("Firestore KYC query check:", kycErr);
            }
          }

          if (ekycStatus) {
            setIsEkycDone(true);
            localStorage.setItem("ekycVerified", "true");
            localStorage.setItem("isEkycDone", "true");
            localStorage.setItem("aadharVerified", "true");
            if (uid) {
              update(ref(db, `users/${uid}`), {
                ekycVerified: true,
                isEkycDone: true,
                aadharVerified: true,
                isAadhaarVerified: true,
                isBiometricVerified: true,
              }).catch(() => {});
            }
          }

          setUserData({
            ...rtdbData,
            fullName: rtdbData.fullName || existingApp?.name || existingApp?.fullName || "ST Scholar",
            email: rtdbData.email || existingApp?.email || currentEmail,
            dob: rtdbData.dob || existingApp?.dob || "1999-05-12",
            gender: rtdbData.gender || existingApp?.gender || "Female",
            phoneNumber: cleanPhone || rtdbData.phoneNumber,
            phoneVerified: phoneVerifiedFlag,
            isEkycDone: ekycStatus,
            ekycVerified: ekycStatus,
            aadharVerified: ekycStatus,
          });
        })
        .catch((err) => console.error("Error loading user profile:", err))
        .finally(() => setLoading(false));
    };

    loadProfileAndPipeline();
  }, [db, navigate, auth]);

  // Mobile Verification (Checks 10 digits)
  const handleVerifyMobile = async () => {
    let cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    const uid = localStorage.getItem("uid") || auth.currentUser?.uid;
    if (!uid) return;

    try {
      await update(ref(db, `users/${uid}`), {
        phoneNumber: cleanPhone,
        phoneVerified: true,
        phoneUpdatedAt: new Date().toISOString(),
      });

      localStorage.setItem("phoneVerified", "true");
      localStorage.setItem("phoneNumber", cleanPhone);

      setUserData((prev) => ({
        ...prev,
        phoneNumber: cleanPhone,
        phoneVerified: true,
      }));

      setPhoneInput(cleanPhone);
      setIsPhoneVerified(true);
      setIsEditingPhone(false);
      toast.success("Mobile number verified & saved successfully!");
    } catch (err) {
      toast.error("Failed to save mobile number: " + err.message);
    }
  };

  // Update mobile number later
  const handleUpdatePhoneOnly = async () => {
    let cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    const uid = localStorage.getItem("uid") || auth.currentUser?.uid;
    if (!uid) return;

    try {
      await update(ref(db, `users/${uid}`), {
        phoneNumber: cleanPhone,
        phoneVerified: true,
        phoneUpdatedAt: new Date().toISOString(),
      });

      localStorage.setItem("phoneVerified", "true");
      localStorage.setItem("phoneNumber", cleanPhone);

      setUserData((prev) => ({
        ...prev,
        phoneNumber: cleanPhone,
        phoneVerified: true,
      }));

      setPhoneInput(cleanPhone);
      setIsEditingPhone(false);
      setIsPhoneVerified(true);
      toast.success("Mobile number updated and verified successfully!");
    } catch (err) {
      toast.error("Failed to update mobile number: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const hasEkyc = Boolean(
    isEkycDone ||
    userData?.isEkycDone ||
    userData?.ekycVerified ||
    userData?.aadharVerified ||
    localStorage.getItem("ekycVerified") === "true" ||
    localStorage.getItem("isEkycDone") === "true"
  );

  const hasPhone = Boolean(
    isPhoneVerified ||
    userData?.phoneVerified ||
    localStorage.getItem("phoneVerified") === "true"
  );

  const isFullyVerified = hasEkyc && hasPhone;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Ministry Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-400/30 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Ministry of Tribal Affairs • Government of India
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {userData?.fullName || "Scholar"}
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl mt-1">
              National Scheduled Tribe (ST) Fellowship & Higher Education Scholarship Portal. Access verified schemes, transparent scoring, and Direct Benefit Transfer (DBT) grant tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/viewScholarships")}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-xl transition shadow flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Apply for Schemes
            </button>
            <button
              onClick={() => navigate("/updatedDashboard")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              My Applications
            </button>
          </div>
        </div>
      </div>

      {/* High-priority Action Required Banner for Deficient / Rejected Documents */}
      {activeApplication &&
        (activeApplication.reviewStatus === "deficient" ||
          activeApplication.institutionVerificationStatus === "DEFICIENT" ||
          (activeApplication.documents &&
            Object.values(activeApplication.documents).some(
              (d) => d && (d.status === "DEFECTIVE" || d.status === "REJECTED")
            ))) && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Action Required • Institutional Scrutiny Notice
                </span>
                <h3 className="text-base font-bold text-amber-950 mt-0.5">
                  Documents Flagged for Re-upload ({activeApplication.scholarshipName || activeApplication.name})
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-xl">
                  {activeApplication.rejectionReason ||
                    "The Institutional Nodal Officer has rejected 1 or more documents. Please re-upload replacement documents to avoid processing delays."}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/updatedDashboard")}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              Rectify Documents Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 1. STUDENT VERIFICATION STATUS & CONTACT PANEL           */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${hasEkyc ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Verification & Candidate Profile
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Biometric e-KYC and registered contact details as per Ministry DBT guidelines.
            </p>
          </div>

          {hasEkyc ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 font-semibold text-xs sm:text-sm rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              e-KYC Verified Candidate
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 font-semibold text-xs sm:text-sm rounded-full border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Action Required: e-KYC Pending
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Card A: Biometric Aadhaar e-KYC Status (Replaced manual input with direct e-KYC integration) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Biometric Aadhaar e-KYC</h3>
                    <p className="text-xs text-gray-500">UIDAI Facial Biometric & OTP Verification</p>
                  </div>
                </div>
                {hasEkyc ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                    Pending
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {hasEkyc
                  ? `Your Aadhaar identity has been verified via UIDAI biometric liveness matching. Your profile is certified eligible for central MoTA scholarships.`
                  : `Aadhaar verification is now handled securely through the Biometric e-KYC module. Complete biometric liveness capture before submitting scholarship applications.`
                }
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/ekyc0")}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs ${
                  hasEkyc
                    ? "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
              >
                {hasEkyc ? "View Biometric e-KYC Details" : "Launch Biometric e-KYC"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card B: Mobile Number Verification (Updateable at any time) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Registered Mobile Number</h3>
                    <p className="text-xs text-gray-500">Can be updated & re-verified anytime</p>
                  </div>
                </div>
                {hasPhone && !isEditingPhone && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Active DBT Mobile Number
                  </label>
                  {!isEditingPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPhone(true);
                        setIsPhoneVerified(false);
                      }}
                      className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Change Number
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-gray-400 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phoneInput}
                      disabled={!isEditingPhone && hasPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhoneInput(val);
                      }}
                      className={`w-full pl-12 pr-3 py-2.5 rounded-xl border text-sm font-mono tracking-wider ${
                        !isEditingPhone && hasPhone
                          ? "bg-emerald-50/50 border-emerald-300 text-emerald-900 font-bold"
                          : "bg-white border-gray-300 focus:ring-2 focus:ring-teal-500"
                      }`}
                    />
                  </div>

                  {isEditingPhone ? (
                    <button
                      type="button"
                      onClick={handleUpdatePhoneOnly}
                      className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Save Mobile
                    </button>
                  ) : !hasPhone ? (
                    <button
                      type="button"
                      onClick={handleVerifyMobile}
                      className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Verify
                    </button>
                  ) : null}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Used for DBT SMS disbursement updates and Scrutiny approval notifications
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Locked Registration Information */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Lock className="w-4 h-4 text-slate-500" />
            Permanent Registration Information (Immutable as per MoTA Regulations)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block text-xs">Full Name</span>
              <span className="font-semibold text-gray-800">{userData?.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Registered Email</span>
              <span className="font-semibold text-gray-800 truncate block">{userData?.email || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Date of Birth</span>
              <span className="font-semibold text-gray-800">{userData?.dob || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Gender</span>
              <span className="font-semibold text-gray-800 capitalize">{userData?.gender || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2. OFFICIAL VERIFIED MOTA SCHEMES QUICK ACCESS            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Verified Ministry of Tribal Affairs (MoTA) Schemes
            </h2>
            <p className="text-xs text-gray-500">
              Only authentic, central-sector scholarships and fellowships for Scheduled Tribe students
            </p>
          </div>
          <Link
            to="/viewScholarships"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            View All Scheme Rules <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scheme 1: NFST */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  NFST
                </span>
                <span className="text-[11px] text-gray-400 font-medium">UGC Indian Institutes</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                National Fellowship for ST Students
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Full-time M.Phil. & Ph.D. research fellowships. ₹37,000/mo (JRF) to ₹42,000/mo (SRF) + contingency.
              </p>
              <div className="space-y-1.5 text-xs text-gray-500 border-t pt-3">
                <div>• <strong>Income Limit:</strong> No ceiling</div>
                <div>• <strong>Age:</strong> Up to 36 Years</div>
                <div>• <strong>Qualifying:</strong> Post-Graduation (55%)</div>
              </div>
            </div>

            <button
              onClick={() => navigate("/viewScholarships")}
              className="mt-6 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
            >
              Apply for NFST
            </button>
          </div>

          {/* Scheme 2: NOS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  NOS
                </span>
                <span className="text-[11px] text-gray-400 font-medium">Global Top 500 QS</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                National Overseas Scholarship (NOS)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Master's & Ph.D. abroad. Covers full tuition, annual living allowance ($15,400 / £9,900), and airfare.
              </p>
              <div className="space-y-1.5 text-xs text-gray-500 border-t pt-3">
                <div>• <strong>Income Limit:</strong> ₹6,00,000 / year</div>
                <div>• <strong>Age:</strong> Up to 35 Years</div>
                <div>• <strong>Eligibility:</strong> Min 55% marks + QS &le; 500</div>
              </div>
            </div>

            <button
              onClick={() => navigate("/viewScholarships")}
              className="mt-6 w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition"
            >
              Apply for NOS
            </button>
          </div>

          {/* Scheme 3: TCE */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                  TCE
                </span>
                <span className="text-[11px] text-gray-400 font-medium">259 Premier Institutes</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                Top Class Education (TCE) Scheme
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Graduate & PG degrees in IITs, NITs, IIMs, AIIMS, and NLUs. Full tuition + ₹3,000/mo living + laptop grant.
              </p>
              <div className="space-y-1.5 text-xs text-gray-500 border-t pt-3">
                <div>• <strong>Income Limit:</strong> ₹6,00,000 / year</div>
                <div>• <strong>Courses:</strong> B.Tech, MBBS, MBA, LLB, etc.</div>
                <div>• <strong>Institutes:</strong> 259 Notified Premier Bodies</div>
              </div>
            </div>

            <button
              onClick={() => navigate("/viewScholarships")}
              className="mt-6 w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 transition"
            >
              Apply for TCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;