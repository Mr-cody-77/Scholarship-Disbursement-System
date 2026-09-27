import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Video,
  XCircle,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Building,
  RefreshCw,
  FileText,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScrutinyHistory = () => {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // 1. Fetch from institutionScrutinyHistory
      const historyRef = collection(db, "institutionScrutinyHistory");
      const historySnap = await getDocs(historyRef);
      const logs = [];

      historySnap.forEach((docSnap) => {
        logs.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      // 2. If history collection is empty or minimal, cross-reference scholarshipApplications
      // so past evaluations are immediately visible
      if (logs.length === 0) {
        const appsRef = collection(db, "scholarshipApplications");
        const appsSnap = await getDocs(appsRef);
        appsSnap.forEach((docSnap) => {
          const app = docSnap.data();
          if (app.reviewStages?.instituteVerification?.checked) {
            logs.push({
              id: `hist_${docSnap.id}`,
              applicationId: docSnap.id,
              applicantName: app.name || "ST Scholar",
              email: app.email || "",
              schemeType: app.schemeType || "ST Fellowship",
              scholarshipName: app.scholarshipName || app.name || "Higher Education Grant",
              institution: app.schoolName || "AISHE Registered College",
              decision: "Certified & Forwarded",
              reviewStatus: "institute_approved",
              notes: app.reviewStages.instituteVerification.notes || "Bonafide enrollment, fees & attendance certified.",
              officerRole: "AISHE Institutional Nodal Officer",
              timestamp: app.reviewStages.instituteVerification.verifiedAt || app.submittedAt || new Date().toISOString(),
            });
          } else if (app.reviewStatus === "deficient") {
            logs.push({
              id: `hist_${docSnap.id}`,
              applicationId: docSnap.id,
              applicantName: app.name || "ST Scholar",
              email: app.email || "",
              schemeType: app.schemeType || "ST Fellowship",
              scholarshipName: app.scholarshipName || app.name || "Higher Education Grant",
              institution: app.schoolName || "AISHE Registered College",
              decision: "Flagged Defective",
              reviewStatus: "deficient",
              notes: `${app.deficiencies?.length || 2} deficiency notice(s) dispatched to scholar for certificate re-upload.`,
              officerRole: "AISHE Institutional Nodal Officer",
              timestamp: app.lastRectifiedAt || app.submittedAt || new Date().toISOString(),
            });
          } else if (app.interviewSession) {
            logs.push({
              id: `hist_interview_${docSnap.id}`,
              applicationId: docSnap.id,
              applicantName: app.name || "ST Scholar",
              email: app.email || "",
              schemeType: app.schemeType || "ST Fellowship",
              scholarshipName: app.scholarshipName || app.name || "Higher Education Grant",
              institution: app.schoolName || "AISHE Registered College",
              decision: "Hearing Scheduled",
              reviewStatus: app.reviewStatus || "pending",
              notes: `Video scrutiny hearing set for ${new Date(app.interviewSession.dateTime).toLocaleString()}. Purpose: ${app.interviewSession.purpose}`,
              officerRole: "AISHE Institutional Nodal Officer",
              timestamp: app.interviewSession.scheduledAt || new Date().toISOString(),
            });
          }
        });
      }

      // Sort by newest timestamp first
      logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setHistoryLogs(logs);
    } catch (err) {
      console.error("Error loading scrutiny history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case "Certified & Forwarded":
        return {
          icon: <CheckCircle2 size={14} className="text-emerald-600" />,
          label: "Certified & Forwarded",
          className: "bg-emerald-50 text-emerald-800 border-emerald-300",
        };
      case "Flagged Defective":
        return {
          icon: <AlertTriangle size={14} className="text-amber-600" />,
          label: "Defects Flagged",
          className: "bg-amber-50 text-amber-800 border-amber-300",
        };
      case "Hearing Scheduled":
        return {
          icon: <Video size={14} className="text-indigo-600" />,
          label: "Hearing Scheduled",
          className: "bg-indigo-50 text-indigo-800 border-indigo-300",
        };
      case "Rejected":
        return {
          icon: <XCircle size={14} className="text-red-600" />,
          label: "Rejected",
          className: "bg-red-50 text-red-800 border-red-300",
        };
      default:
        return {
          icon: <History size={14} className="text-slate-600" />,
          label: decision || "Scrutinized",
          className: "bg-slate-100 text-slate-800 border-slate-300",
        };
    }
  };

  const filteredLogs = historyLogs.filter((log) => {
    const matchesSearch =
      (log.applicantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.schemeType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDecision === "all" || log.decision === filterDecision;

    return matchesSearch && matchesFilter;
  });

  const countCertified = historyLogs.filter((l) => l.decision === "Certified & Forwarded").length;
  const countDefective = historyLogs.filter((l) => l.decision === "Flagged Defective").length;
  const countHearings = historyLogs.filter((l) => l.decision === "Hearing Scheduled").length;
  const countRejected = historyLogs.filter((l) => l.decision === "Rejected").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full mb-2 border border-blue-200">
              <ShieldCheck size={14} /> AISHE Institutional Scrutiny Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Scrutiny & Bonafide History
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-3xl">
              Official audit log of bonafide verifications, defect notices dispatched to scholars, video scrutiny hearings scheduled, and applications forwarded to the Ministry of Tribal Affairs (MoTA).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Log
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <GraduationCap size={14} /> Active Scrutiny Gateway
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Certified & Forwarded</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700">{countCertified}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Sent to Central MoTA</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Flagged Defective</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-700">{countDefective}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Awaiting scholar re-upload</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Hearings Scheduled</span>
            <Video size={16} className="text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-700">{countHearings}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Video verification sessions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Rejected Applications</span>
            <XCircle size={16} className="text-red-600" />
          </div>
          <span className="text-2xl font-extrabold text-red-700">{countRejected}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Ineligible bonafide criteria</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, scheme, or app ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="w-full sm:w-auto p-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Decisions ({historyLogs.length})</option>
            <option value="Certified & Forwarded">Certified & Forwarded ({countCertified})</option>
            <option value="Flagged Defective">Flagged Defective ({countDefective})</option>
            <option value="Hearing Scheduled">Hearing Scheduled ({countHearings})</option>
            <option value="Rejected">Rejected ({countRejected})</option>
          </select>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-semibold">Loading institutional scrutiny logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History size={40} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No Scrutiny Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching scrutiny actions recorded yet. Applications processed in the Scrutiny Gateway will be logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Candidate / Scholar</th>
                  <th className="py-3 px-4">Scheme & Institution</th>
                  <th className="py-3 px-4">Decision Taken</th>
                  <th className="py-3 px-4">Officer Remarks & Findings</th>
                  <th className="py-3 px-4">Action Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const badge = getDecisionBadge(log.decision);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.applicantName}</div>
                        <div className="text-[11px] text-slate-500">{log.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {log.applicationId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-blue-700 block">
                          {log.schemeType || "ST Fellowship"}
                        </span>
                        <span className="text-[11px] text-slate-600 truncate max-w-xs block">
                          {log.institution || "Registered AISHE Body"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${badge.className}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-700 leading-snug line-clamp-2">
                          {log.notes || "Bonafide enrollment and eligibility verified."}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Role: {log.officerRole || "AISHE Nodal Officer"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-4.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate("/admin-dashboard")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition border border-slate-200"
                        >
                          <span>Review</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrutinyHistory;
