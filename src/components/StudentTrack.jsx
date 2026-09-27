import React, { useEffect, useState } from "react";
import { useFirebase } from "../firebase/FirebaseContext";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  FileText,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  X,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getDatabase, ref as rtdbRef, get as rtdbGet } from "firebase/database";
import app, { auth } from "../Firebase";
import { seedOfficialMoTASchemes } from "../utils/seedMoTASchemes";

const StudentTrack = () => {
  const Firebase = useFirebase();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEkycDone, setIsEkycDone] = useState(false);
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [selectedSchemeToApply, setSelectedSchemeToApply] = useState(null);
  const navigate = useNavigate();

  const firestore = getFirestore(app);
  const rtdb = getDatabase(app);

  // Check e-KYC status
  useEffect(() => {
    const currentUid = Firebase.user?.uid || localStorage.getItem("uid") || auth.currentUser?.uid;
    const localEkyc = localStorage.getItem("ekycVerified") === "true";
    if (localEkyc) {
      setIsEkycDone(true);
      return;
    }

    if (currentUid) {
      // Check Firestore
      getDoc(doc(firestore, "kyc", currentUid))
        .then((docSnap) => {
          if (docSnap.exists() && docSnap.data().status === "verified") {
            setIsEkycDone(true);
            localStorage.setItem("ekycVerified", "true");
          } else {
            // Check RTDB
            return rtdbGet(rtdbRef(rtdb, `users/${currentUid}`)).then((snap) => {
              if (snap.exists() && snap.val().ekycVerified) {
                setIsEkycDone(true);
                localStorage.setItem("ekycVerified", "true");
              }
            });
          }
        })
        .catch((err) => console.error("Error checking KYC status:", err));
    }
  }, [Firebase.user, firestore, rtdb]);

  const loadScholarships = async () => {
    try {
      setLoading(true);
      const data = await Firebase.fetchScholarships();
      
      // Keep strictly ONLY verified official MoTA schemes (NFST, NOS, TCE)
      const verifiedOnly = (data || []).filter((s) => {
        const type = (s.schemeType || "").toUpperCase();
        const name = (s.name || s.scholarshipName || "").toLowerCase();
        return (
          s.isOfficialMoTA === true ||
          type === "NFST" ||
          type === "NOS" ||
          type === "TCE" ||
          name.includes("national fellowship") ||
          name.includes("overseas scholarship") ||
          name.includes("top class education")
        );
      });

      if (!verifiedOnly || verifiedOnly.length === 0) {
        // Auto-seed official MoTA schemes if none found
        await seedOfficialMoTASchemes();
        const refreshed = await Firebase.fetchScholarships();
        const refreshedVerified = (refreshed || []).filter((s) => {
          const type = (s.schemeType || "").toUpperCase();
          const name = (s.name || s.scholarshipName || "").toLowerCase();
          return (
            s.isOfficialMoTA === true ||
            type === "NFST" ||
            type === "NOS" ||
            type === "TCE" ||
            name.includes("national fellowship") ||
            name.includes("overseas scholarship") ||
            name.includes("top class education")
          );
        });
        setScholarships(refreshedVerified);
      } else {
        setScholarships(verifiedOnly);
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, [Firebase]);

  const handleManualSeed = async () => {
    try {
      setIsSeeding(true);
      await seedOfficialMoTASchemes();
      await loadScholarships();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleApply = (scholarship) => {
    const isVerified = isEkycDone || localStorage.getItem("ekycVerified") === "true";
    if (!isVerified) {
      setSelectedSchemeToApply(scholarship);
      setShowEkycModal(true);
      return;
    }
    navigate("/apply", { state: { scholarship } });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* e-KYC Prerequisite Notice Banner (if not verified) */}
        {!isEkycDone && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Mandatory Biometric e-KYC Verification Required
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 max-w-xl">
                  As per Ministry of Tribal Affairs guidelines, all ST candidates must complete Aadhaar Biometric e-KYC before applying for any scholarship or fellowship scheme.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/ekyc0")}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Lock size={14} />
              Complete e-KYC Now
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-2">
                <ShieldCheck size={14} /> Ministry of Tribal Affairs (MoTA) Schemes
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Scheduled Tribe Fellowship & Scholarship Schemes
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Explore central sector schemes offering financial grants, maintenance allowance, and research stipends for ST scholars.
              </p>
            </div>
          </div>
        </div>

        {/* Scholarships List */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm text-gray-500">Loading official scholarship schemes...</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <GraduationCap className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Schemes Available</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click below to load the official Ministry schemes (NFST, NOS, Top Class Education).
            </p>
            <button
              onClick={handleManualSeed}
              disabled={isSeeding}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Load MoTA Official Schemes
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {scholarships.map((scholarship) => {
              const reqDocs = Array.isArray(scholarship.requiredDocuments)
                ? scholarship.requiredDocuments
                : typeof scholarship.requiredDocuments === "string"
                ? scholarship.requiredDocuments.split(";")
                : [];

              return (
                <div
                  key={scholarship.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 overflow-hidden relative"
                >
                  {/* Scheme Type Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {scholarship.schemeType || "SCHEME"}
                      </span>
                      {scholarship.isOfficialMoTA && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-semibold flex items-center gap-1">
                          ✓ MoTA Notified
                        </span>
                      )}
                    </div>

                    {scholarship.totalSlots && (
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        {scholarship.totalSlots} Slots/Year
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {scholarship.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {scholarship.description || scholarship.eligibility}
                  </p>

                  {/* Key Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Income Ceiling</span>
                      <span className="text-gray-800 font-semibold text-sm">
                        {scholarship.incomeLimit
                          ? `≤ ₹${scholarship.incomeLimit.toLocaleString()}/yr`
                          : "No Income Limit"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Age Limit</span>
                      <span className="text-gray-800 font-semibold text-sm">
                        {scholarship.ageLimit ? `Max ${scholarship.ageLimit} Years` : "As per Guidelines"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">PVTG Reservation</span>
                      <span className="text-gray-800 font-semibold text-sm">
                        {scholarship.pvtgSlots ? `${scholarship.pvtgSlots} Slots Earmarked` : "Priority Selection"}
                      </span>
                    </div>
                  </div>

                  {/* Award Highlights */}
                  {scholarship.awardSummary && (
                    <div className="mb-4 text-xs text-blue-900 bg-blue-50/70 border border-blue-200/60 p-3 rounded-lg flex items-start gap-2">
                      <Award size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-blue-950 mb-0.5">Financial Benefits:</strong>
                        <span>{scholarship.awardSummary}</span>
                      </div>
                    </div>
                  )}

                  {/* Required Documents Tags */}
                  {reqDocs.length > 0 && (
                    <div className="mb-5">
                      <span className="text-xs font-semibold text-gray-500 block mb-1.5">
                        Mandatory Documents ({reqDocs.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {reqDocs.slice(0, 5).map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px]"
                          >
                            {typeof doc === "string" ? doc.trim() : ""}
                          </span>
                        ))}
                        {reqDocs.length > 5 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px]">
                            +{reqDocs.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    {scholarship.portal ? (
                      <a
                        href={scholarship.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Official Portal Guidelines &rarr;
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">MoTA Direct Application</span>
                    )}

                    <button
                      onClick={() => handleApply(scholarship)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
                    >
                      Apply Now <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory e-KYC Modal */}
      {showEkycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowEkycModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-inner">
                <Lock size={32} />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-300">
                Prerequisite Step Required
              </span>

              <h3 className="text-xl font-extrabold text-slate-900 mt-3 mb-2">
                Biometric e-KYC Required
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Before applying for <strong>{selectedSchemeToApply?.name || "MoTA Scholarship"}</strong>, you must first complete your <strong>Aadhaar Biometric e-KYC</strong> verification.
                <br /><br />
                This quick 1-minute verification confirms your identity and enables transparent Direct Benefit Transfer (DBT) to your bank account.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEkycModal(false);
                    navigate("/ekyc0");
                  }}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  Complete Biometric e-KYC Now
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEkycModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel & Review Schemes Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTrack;
