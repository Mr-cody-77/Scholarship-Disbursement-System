import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  CreditCard,
  Building2,
  Search,
  X,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  PieChart as PieIcon,
  BarChart2,
  ArrowRight,
  Video,
  Calendar,
  Printer,
  FileText,
  Check,
  ExternalLink,
  Clock,
  LogOut,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { db, auth } from "../../Firebase";
import { rankApplications } from "../../utils/meritScoring";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

const SAGHomePage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "merit" | "disbursement"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState("all");

  // Payment Simulation Modal State
  const [paymentModalApp, setPaymentModalApp] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [disbursementAmount, setDisbursementAmount] = useState(37000);
  const [dbtStep, setDbtStep] = useState(0); // 0 = idle, 1 = APB check, 2 = Sanction, 3 = Treasury, 4 = Complete
  const [settledUtr, setSettledUtr] = useState("");
  const [settledSanction, setSettledSanction] = useState("");

  // MoTA DBT Voucher Modal State
  const [voucherModalApp, setVoucherModalApp] = useState(null);

  // Video Conference Hearing Scheduler State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    dateTime: "",
    purpose: "Ministry SAG Scrutiny & Research Proposal Hearing",
    meetingLink: "",
    instructions: "Please keep original admission letter, caste certificate, and presentation ready.",
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "scholarshipApplications"));
      const snap = await getDocs(q);
      const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApplications(apps);
    } catch (err) {
      console.error("Error fetching applications for SAG:", err);
      toast.error("Failed to load ministry applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Helper: has this application been verified & forwarded by the Higher Education Institution?
  const isInstituteVerified = (app) =>
    app.instituteVerified ||
    app.reviewStages?.instituteVerification?.status === "COMPLETED" ||
    ["institute_approved", "state_approved", "dbt_queued", "approved", "disbursed"].includes(
      app.reviewStatus
    );

  // Applications visible to Central Ministry: ONLY those certified by the Institute!
  const instituteVerifiedApps = useMemo(() => {
    return applications.filter((app) => isInstituteVerified(app));
  }, [applications]);

  // Applications currently pending at College/Institution
  const pendingAtCollegeApps = useMemo(() => {
    return applications.filter((app) => !isInstituteVerified(app) && app.reviewStatus !== "rejected");
  }, [applications]);

  // Filtered Applications for Ministry Official Scrutiny & Merit Board
  const filteredApps = useMemo(() => {
    return instituteVerifiedApps.filter((app) => {
      const matchSearch =
        !searchTerm ||
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tribeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.stateOfDomicile?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchScheme =
        selectedSchemeFilter === "all" ||
        app.schemeType === selectedSchemeFilter;

      return matchSearch && matchScheme;
    });
  }, [instituteVerifiedApps, searchTerm, selectedSchemeFilter]);

  // Ranked Applications by Merit Score (Top Priority at Top)
  const rankedApps = useMemo(() => {
    return rankApplications(filteredApps);
  }, [filteredApps]);

  // Ministry KPIs
  const stats = useMemo(() => {
    const total = applications.length;
    const instituteApprovedCount = instituteVerifiedApps.length;
    const pendingCollegeCount = pendingAtCollegeApps.length;
    const approved = applications.filter((a) => a.reviewStatus === "approved" || a.reviewStatus === "dbt_queued").length;
    const disbursed = applications.filter((a) => a.reviewStatus === "disbursed").length;
    const pvtgCount = applications.filter((a) => a.isPVTG).length;
    const femaleCount = applications.filter(
      (a) => a.gender && a.gender.toLowerCase() === "female"
    ).length;

    const totalDisbursedAmt = applications
      .filter((a) => a.reviewStatus === "disbursed")
      .reduce((sum, a) => sum + (Number(a.disbursement?.amount) || 37000), 0);

    return {
      total,
      instituteApprovedCount,
      pendingCollegeCount,
      approved,
      disbursed,
      pvtgCount,
      femaleCount,
      femalePercentage: total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0,
      pvtgPercentage: total > 0 ? ((pvtgCount / total) * 100).toFixed(1) : 0,
      totalDisbursedAmt,
    };
  }, [applications, instituteVerifiedApps, pendingAtCollegeApps]);

  // Chart Data: State-wise ST coverage
  const stateData = useMemo(() => {
    const counts = {};
    applications.forEach((a) => {
      const state = a.stateOfDomicile || "Other";
      counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 states
  }, [applications]);

  // Chart Data: Gender distribution (30% statutory female reservation)
  const genderData = useMemo(() => {
    let female = 0;
    let male = 0;
    let other = 0;
    applications.forEach((a) => {
      const g = (a.gender || "").toLowerCase();
      if (g === "female") female++;
      else if (g === "male") male++;
      else other++;
    });
    return [
      { name: "Female (30% Quota)", value: female },
      { name: "Male", value: male },
      { name: "Other", value: other },
    ].filter((d) => d.value > 0);
  }, [applications]);

  // Chart Data: Scheme distribution
  const schemeData = useMemo(() => {
    const counts = {};
    applications.forEach((a) => {
      const s = a.schemeType || "ST Fellowship";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  // Official Action 1: Sanction Fellowship Grant & Automatically Move to DBT Payment Stage
  const handleSanctionAndAdvanceToDBT = async (app) => {
    try {
      const sanctionOrderNumber = `MOTA/2026/${app.schemeType || "ST"}/${app.id.slice(0, 6).toUpperCase()}`;
      const amount = app.schemeType === "NFST" ? 37000 : app.schemeType === "NOS" ? 65000 : 50000;
      const updatedStages = {
        ...(app.reviewStages || {}),
        stateNodalVerification: {
          checked: true,
          status: "COMPLETED",
          sanctionedAt: new Date().toISOString(),
          sanctionOrderNumber,
          sanctionedBy: "Ministry of Tribal Affairs (SAG Apex Scrutiny Board)",
        },
        paymentDistribution: {
          checked: false,
          status: "DBT_QUEUED",
          queuedAt: new Date().toISOString(),
          sanctionOrderNumber,
          amount,
        },
      };

      await updateDoc(doc(db, "scholarshipApplications", app.id), {
        reviewStages: updatedStages,
        reviewStatus: "dbt_queued",
        stateNodalVerified: true,
        sanctionOrderNumber,
        sanctionedAmount: amount,
      });

      toast.success(`Sanction Order ${sanctionOrderNumber} generated! Candidate moved to DBT Payment Stage.`);
      await fetchApplications();
      setActiveTab("disbursement");
    } catch (err) {
      console.error("Sanction error:", err);
      toast.error("Failed to sanction fellowship.");
    }
  };

  // Official Action 2: Schedule Video Conference / Hearing
  const handleOpenScheduleModal = (app) => {
    setSchedulingApp(app);
    setScheduleData({
      dateTime: "",
      purpose: "Ministry SAG Scrutiny & Research Proposal Hearing",
      meetingLink: `https://meet.jit.si/MoTA-Apex-Hearing-${app.id.slice(-6)}`,
      instructions: "Keep original admission letter, caste certificate, and presentation ready.",
    });
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleData.dateTime) {
      toast.error("Please specify a date and time for the hearing");
      return;
    }

    try {
      setIsSubmittingSchedule(true);
      const session = {
        scheduledBy: "official",
        officerName: "Ministry SAG Scrutiny Board",
        authorityLabel: "Ministry of Tribal Affairs (Apex Committee)",
        dateTime: scheduleData.dateTime,
        purpose: scheduleData.purpose,
        meetingLink: scheduleData.meetingLink,
        instructions: scheduleData.instructions,
        status: "SCHEDULED",
        scheduledAt: new Date().toISOString(),
        rescheduleRequest: null,
      };

      await updateDoc(doc(db, "scholarshipApplications", schedulingApp.id), {
        interviewSession: session,
      });
      toast.success("Ministry hearing scheduled & notification dispatched to scholar!");
      setIsScheduleModalOpen(false);
      setSchedulingApp(null);
      await fetchApplications();
    } catch (err) {
      console.error("Scheduling error:", err);
      toast.error("Failed to schedule hearing.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleAcceptStudentReschedule = async (app) => {
    if (!app.interviewSession?.rescheduleRequest?.preferredDateTime) return;
    const preferred = app.interviewSession.rescheduleRequest.preferredDateTime;
    const updatedSession = {
      ...app.interviewSession,
      dateTime: preferred,
      status: "SCHEDULED",
      rescheduleRequest: null,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, "scholarshipApplications", app.id), {
      interviewSession: updatedSession,
    });
    toast.success("Student requested hearing schedule accepted!");
    await fetchApplications();
  };

  // Multi-Stage Interactive DBT & PFMS Simulator Execution
  const executeDBTPayment = async () => {
    if (!paymentModalApp) return;

    setIsProcessingPayment(true);
    setDbtStep(1); // 1. APB check

    try {
      // Step 1: APB Validation Delay
      await new Promise((r) => setTimeout(r, 700));
      setDbtStep(2); // 2. Sanction Order allocation

      // Step 2: Sanction Order Delay
      await new Promise((r) => setTimeout(r, 700));
      setDbtStep(3); // 3. Treasury Mandate

      // Step 3: Treasury Settlement Delay
      await new Promise((r) => setTimeout(r, 800));

      const sanctionNum =
        paymentModalApp.sanctionOrderNumber ||
        `MOTA/2026/${paymentModalApp.schemeType || "ST"}/${paymentModalApp.id.slice(0, 6).toUpperCase()}`;
      const fakeUtr = `MOTA-DBT-2026-${(paymentModalApp.bankIFSC || "SBIN").slice(0, 4).toUpperCase()}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      const appRef = doc(db, "scholarshipApplications", paymentModalApp.id);
      const disbursementRecord = {
        utrNumber: fakeUtr,
        sanctionOrderNumber: sanctionNum,
        amount: Number(disbursementAmount),
        disbursedAt: new Date().toISOString(),
        paymentGateway: "PFMS-Aadhaar-Payment-Bridge (NPCI)",
        beneficiaryAccount: paymentModalApp.bankAccountNumber || "XXXXXXXX1234",
        bankName: paymentModalApp.bankName || "State Bank of India",
        ifscCode: paymentModalApp.bankIFSC || "SBIN0001234",
        status: "SUCCESS",
      };

      const updatedStages = {
        ...(paymentModalApp.reviewStages || {}),
        paymentDistribution: {
          checked: true,
          status: "COMPLETED",
          utrNumber: fakeUtr,
          sanctionOrderNumber: sanctionNum,
          amount: Number(disbursementAmount),
          disbursedAt: new Date().toISOString(),
        },
      };

      await updateDoc(appRef, {
        reviewStatus: "disbursed",
        reviewStages: updatedStages,
        disbursement: disbursementRecord,
      });

      // Dispatch Email Notification to Candidate
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5007";
      try {
        await axios.post(`${apiBase}/send-application-update-email`, {
          email: paymentModalApp.email,
          subject: "CONFIRMATION: MoTA Fellowship Grant Disbursed via Direct Benefit Transfer (DBT)",
          body: `Dear ${paymentModalApp.name},\n\nWe are pleased to inform you that your fellowship grant of ₹${Number(
            disbursementAmount
          ).toLocaleString()} has been successfully credited via Direct Benefit Transfer (DBT).\n\nTransaction Details:\n- Sanction Order: ${sanctionNum}\n- UTR Reference: ${fakeUtr}\n- Beneficiary Bank: ${paymentModalApp.bankName || "Aadhaar Linked Bank"}\n- Amount: ₹${Number(
            disbursementAmount
          ).toLocaleString()}\n- Date: ${new Date().toLocaleDateString()}\n\nMinistry of Tribal Affairs (MoTA)\nGovernment of India`,
        });
      } catch (mailErr) {
        console.warn("Disbursement email warning:", mailErr.message);
      }

      setSettledUtr(fakeUtr);
      setSettledSanction(sanctionNum);
      setDbtStep(4); // 4. Complete & Voucher ready
      toast.success(`DBT Disbursed! UTR Generated: ${fakeUtr}`);
      await fetchApplications();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Failed to disburse DBT payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Export selection list as CSV
  const handleExportCSV = () => {
    const headers = [
      "Merit Rank",
      "Name",
      "Tribe",
      "PVTG Status",
      "State",
      "Scheme",
      "Merit Score",
      "Annual Income (INR)",
      "Status",
      "Aadhaar Number",
      "Bank Account",
      "IFSC",
    ];

    const rows = rankedApps.map((a) => [
      a.meritRank,
      `"${a.name}"`,
      `"${a.tribeName || "ST"}"`,
      a.isPVTG ? "YES" : "NO",
      `"${a.stateOfDomicile || "N/A"}"`,
      `"${a.schemeType || "ST Scheme"}"`,
      a.meritScore,
      a.annualIncome,
      a.reviewStatus,
      a.aadhaarNumber || "N/A",
      a.bankAccountNumber || "N/A",
      a.bankIFSC || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoTA_ST_Selection_List_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sign out Official and return to login
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Signout error:", e);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Ministry Header */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-700/50 border border-blue-500/40 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck size={14} /> Ministry of Tribal Affairs (MoTA) Apex Oversight
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                National Tribal Scholarship & Fellowship Directorate
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">
                Executive analytics, statutory PVTG coverage, affirmative quotas, and Direct Benefit Transfer (DBT) disbursement gateway.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-xs border border-white/15"
              >
                <Download size={14} /> Export Selection CSV
              </button>
              <button
                onClick={fetchApplications}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <RefreshCw size={14} /> Sync Records
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-sm border border-red-500/40"
                title="Sign out of Ministry Official Portal"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart2 size={16} /> Ministry Analytics & KPIs
            </button>
            <button
              onClick={() => setActiveTab("merit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "merit"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award size={16} /> Merit Ranking & Selection ({rankedApps.length})
            </button>
            <button
              onClick={() => setActiveTab("disbursement")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "disbursement"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard size={16} /> DBT Disbursement Gateway ({stats.approved + stats.disbursed})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              Total Applications
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {stats.total}
            </span>
            <span className="text-[11px] text-blue-600 mt-1 block">
              All MoTA Schemes
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              Approved Scholars
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              {stats.approved + stats.disbursed}
            </span>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              Passed 5-Stage Scrutiny
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              PVTG Inclusion
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">
              {stats.pvtgCount}
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold mt-1 block">
              {stats.pvtgPercentage}% of Total Pool
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              Female Earmarking
            </span>
            <span className="text-2xl font-extrabold text-pink-600 mt-1 block">
              {stats.femaleCount}
            </span>
            <span className="text-[11px] text-pink-700 font-semibold mt-1 block">
              {stats.femalePercentage}% (Target: ≥30%)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              DBT Disbursed (₹)
            </span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
              ₹{(stats.totalDisbursedAmt / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.disbursed} Scholars Funded
            </span>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* State-wise Coverage */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  State-wise Scheduled Tribe Application Coverage
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Geographical dispersion across Indian States & Union Territories
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Representation (30% Quota Tracking) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Users size={18} className="text-pink-600" />
                  Gender Distribution (30% Statutory Female Quota)
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  MoTA affirmative earmarking for female tribal researchers
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Scheme Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Award size={18} className="text-indigo-600" />
                  Scheme Portfolio Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  NFST (Fellowship) vs NOS (Overseas) vs TCE (Premier Institutes)
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={schemeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {schemeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Statutory Affirmative Action Compliance */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Affirmative Action & Inclusion Health Check
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Statutory mandates set by Government of India Gazette
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Female Scholar Representation (Mandate: 30%)</span>
                      <span className="text-blue-700">{stats.femalePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-pink-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, Number(stats.femalePercentage) * 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>PVTG Earmarked Inflow (75 Notified Groups)</span>
                      <span className="text-indigo-700">{stats.pvtgCount} Candidates</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, stats.pvtgCount * 10)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>DBT Direct Settlement Execution</span>
                      <span className="text-emerald-700">{stats.disbursed} / {stats.approved + stats.disbursed} Approved</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full"
                        style={{
                          width: `${
                            stats.approved + stats.disbursed > 0
                              ? (stats.disbursed / (stats.approved + stats.disbursed)) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MERIT RANKING & SELECTION */}
        {activeTab === "merit" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Transparent Merit-Based Selection Board
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithm evaluates: Academic (40%), Income Need (25%), PVTG Bonus (15%), Female Quota (10%), Verified Docs (10%).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48"
                />
                <select
                  value={selectedSchemeFilter}
                  onChange={(e) => setSelectedSchemeFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="all">All Schemes</option>
                  <option value="NFST">NFST</option>
                  <option value="NOS">NOS</option>
                  <option value="TCE">Top Class Education</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Candidate & Tribe</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Scheme</th>
                    <th className="py-3 px-4 text-center">Merit Score</th>
                    <th className="py-3 px-4">Score Breakdown</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{app.meritRank}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{app.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {app.tribeName || "Scheduled Tribe"}
                          {app.isPVTG && (
                            <span className="ml-1 text-indigo-600 font-bold">
                              [PVTG]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {app.stateOfDomicile || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {app.schemeType || "ST Scheme"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-extrabold rounded-lg text-sm">
                          {app.meritScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        Acad: {app.meritBreakdown?.academic?.score} | Need: {app.meritBreakdown?.economic?.score} | PVTG: {app.meritBreakdown?.pvtg?.score}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                          {app.reviewStatus || "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                          {/* Student requested reschedule notice */}
                          {app.interviewSession?.status === "RESCHEDULE_REQUESTED" && (
                            <button
                              onClick={() => handleAcceptStudentReschedule(app)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center gap-1"
                              title="Student requested hearing reschedule. Click to accept proposed time."
                            >
                              <Clock size={12} /> Accept Reschedule
                            </button>
                          )}

                          {/* Hearing button / status */}
                          {app.interviewSession?.status === "SCHEDULED" ? (
                            <a
                              href={app.interviewSession.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Video size={12} /> Join Hearing
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenScheduleModal(app)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Video size={12} /> Hearing
                            </button>
                          )}

                          {/* Sanction / DBT Action */}
                          {app.reviewStatus === "institute_approved" && (
                            <button
                              onClick={() => handleSanctionAndAdvanceToDBT(app)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1"
                            >
                              <Award size={13} /> Sanction Fellowship
                            </button>
                          )}

                          {app.reviewStatus === "dbt_queued" && (
                            <button
                              onClick={() => {
                                setPaymentModalApp(app);
                                setDisbursementAmount(app.sanctionedAmount || (app.schemeType === "NFST" ? 37000 : 65000));
                                setDbtStep(0);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1"
                            >
                              <CreditCard size={13} /> Disburse DBT
                            </button>
                          )}

                          {app.reviewStatus === "disbursed" && (
                            <button
                              onClick={() => setVoucherModalApp(app)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1"
                            >
                              <FileText size={12} /> MoTA Voucher
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DBT DISBURSEMENT GATEWAY */}
        {activeTab === "disbursement" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-600" />
                    Direct Benefit Transfer (DBT) Electronic Payment Batch
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Settlement gateway linked with Public Financial Management System (PFMS) and NPCI Aadhaar Payment Bridge (APB).
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Total Disbursed: ₹{stats.totalDisbursedAmt.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {applications
                  .filter(
                    (a) =>
                      a.reviewStatus === "dbt_queued" ||
                      a.reviewStatus === "approved" ||
                      a.reviewStatus === "disbursed"
                  )
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs hover:border-blue-300 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {app.name}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold text-[10px]">
                            {app.schemeType || "ST Scheme"}
                          </span>
                          {app.isPVTG && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold text-[10px]">
                              PVTG Priority
                            </span>
                          )}
                          {app.sanctionOrderNumber && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-mono text-[10px]">
                              Sanction: {app.sanctionOrderNumber}
                            </span>
                          )}
                        </div>

                        <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                          <span>Bank: <strong>{app.bankName || "State Bank of India"}</strong></span>
                          <span>
                            A/C: <strong>{app.bankAccountNumber ? `••••${app.bankAccountNumber.slice(-4)}` : "Aadhaar Linked"}</strong>
                          </span>
                          <span>IFSC: <strong className="font-mono">{app.bankIFSC || "SBIN0001234"}</strong></span>
                          <span>State: <strong>{app.stateOfDomicile || "N/A"}</strong></span>
                        </div>

                        {app.disbursement && (
                          <div className="flex items-center gap-2 pt-0.5 text-emerald-800 font-mono text-[11px]">
                            <span className="font-bold">UTR: {app.disbursement.utrNumber}</span>
                            <span>•</span>
                            <span>Settled: {new Date(app.disbursement.disbursedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-sans font-bold">₹{Number(app.disbursement.amount).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.reviewStatus === "disbursed" ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl inline-flex items-center gap-1.5 text-xs">
                              <CheckCircle2 size={14} /> Settled
                            </span>
                            <button
                              onClick={() => setVoucherModalApp(app)}
                              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition"
                            >
                              <FileText size={13} /> View MoTA Voucher
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setPaymentModalApp(app);
                              setDisbursementAmount(
                                app.sanctionedAmount ||
                                (app.schemeType === "NFST" ? 37000 : app.schemeType === "NOS" ? 65000 : 50000)
                              );
                              setDbtStep(0);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition"
                          >
                            <CreditCard size={14} /> Execute PFMS Batch & APB Transfer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {applications.filter((a) => a.reviewStatus === "dbt_queued" || a.reviewStatus === "approved" || a.reviewStatus === "disbursed").length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No candidates currently queued for DBT. Sanction verified candidates in the "Merit Board & Prioritized Allocation" tab.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DBT Payment Simulator Modal */}
      {paymentModalApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full mb-1">
                  <CreditCard size={12} /> PFMS-DBT Electronic Payment System
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {dbtStep === 4 ? "Payment Disbursed Successfully" : "Execute Direct Benefit Transfer"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setPaymentModalApp(null);
                  setDbtStep(0);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 0: Beneficiary & Amount Summary */}
            {dbtStep === 0 && (
              <>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Scholar Beneficiary:</span>
                      <strong className="text-slate-900">{paymentModalApp.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sanction Order:</span>
                      <strong className="text-purple-700 font-mono text-[11px]">
                        {paymentModalApp.sanctionOrderNumber ||
                          paymentModalApp.reviewStages?.stateNodalVerification?.sanctionOrderNumber ||
                          `MOTA/2026/${paymentModalApp.schemeType || "ST"}/${paymentModalApp.id.slice(0, 6).toUpperCase()}`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Aadhaar Linked Bank:</span>
                      <strong className="text-slate-900">{paymentModalApp.bankName || "State Bank of India"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Account & IFSC:</span>
                      <strong className="text-slate-900 font-mono">
                        {paymentModalApp.bankAccountNumber ? `••••${paymentModalApp.bankAccountNumber.slice(-4)}` : "Aadhaar Seeded"}{" "}
                        / {paymentModalApp.bankIFSC || "SBIN0001234"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Disbursement Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={disbursementAmount}
                    onChange={(e) => setDisbursementAmount(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Centrally funded stipend according to MoTA scheme norms.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setPaymentModalApp(null)}
                    className="px-4 py-2 bg-gray-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeDBTPayment}
                    disabled={isProcessingPayment}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                  >
                    <CheckCircle2 size={16} />
                    Confirm & Disburse DBT
                  </button>
                </div>
              </>
            )}

            {/* Steps 1-3: Progressing Animation */}
            {dbtStep >= 1 && dbtStep < 4 && (
              <div className="py-6 space-y-4">
                <div className="text-center mb-6">
                  <RefreshCw className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                  <p className="font-bold text-slate-900 text-sm">Processing Direct Benefit Transfer via PFMS...</p>
                  <p className="text-xs text-slate-500">Communicating with RBI e-Kuber and NPCI APB Mapper</p>
                </div>

                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${dbtStep >= 1 ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {dbtStep > 1 ? <Check size={14} /> : "1"}
                    </div>
                    <div>
                      <div className="font-bold">NPCI Aadhaar Payment Bridge (APB) Mapper</div>
                      <div className="text-[11px] text-slate-500">Validating Aadhaar seed status with beneficiary bank</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${dbtStep >= 2 ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs ${dbtStep >= 2 ? "bg-purple-600" : "bg-slate-400"}`}>
                      {dbtStep > 2 ? <Check size={14} /> : "2"}
                    </div>
                    <div>
                      <div className="font-bold">Ministry Sanction Order Allocation</div>
                      <div className="text-[11px] text-slate-500">Reserving treasury grant under MoTA Head of Account 2225</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${dbtStep >= 3 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs ${dbtStep >= 3 ? "bg-emerald-600" : "bg-slate-400"}`}>
                      {dbtStep > 3 ? <Check size={14} /> : "3"}
                    </div>
                    <div>
                      <div className="font-bold">RBI e-Kuber Clearing & UTR Generation</div>
                      <div className="text-[11px] text-slate-500">Final electronic clearance and direct credit settlement</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Disbursed Success State */}
            {dbtStep === 4 && (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-center space-y-1">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">Direct Benefit Transfer Completed!</h4>
                  <p className="text-xs text-emerald-800">
                    Amount of <strong>₹{Number(disbursementAmount).toLocaleString()}</strong> successfully credited to {paymentModalApp.name}'s Aadhaar seeded account.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Unique Transaction Ref (UTR):</span>
                    <strong className="text-emerald-800">{settledUtr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Sanction Order:</span>
                    <strong className="text-purple-800">{settledSanction}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Gateway Protocol:</span>
                    <span className="text-slate-700">PFMS / NPCI APB Gateway</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalApp(null);
                      setDbtStep(0);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const appForVoucher = {
                        ...paymentModalApp,
                        reviewStatus: "disbursed",
                        disbursement: {
                          amount: Number(disbursementAmount),
                          utrNumber: settledUtr,
                          sanctionOrderNumber: settledSanction,
                          disbursedAt: new Date().toISOString(),
                        },
                      };
                      setPaymentModalApp(null);
                      setDbtStep(0);
                      setVoucherModalApp(appForVoucher);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText size={14} /> View / Print MoTA Voucher
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Video Hearing Modal */}
      {isScheduleModalOpen && schedulingApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full mb-1">
                  <Video size={12} /> Ministry Video Hearing
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Schedule Hearing with {schedulingApp.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setSchedulingApp(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date and Time <span className="text-red-500">*</span>
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

      {/* MoTA DBT Payment Voucher Modal */}
      {voucherModalApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-xs font-serif uppercase tracking-widest text-slate-600">
                Government of India • Ministry of Tribal Affairs
              </div>
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight mt-0.5">
                Direct Benefit Transfer (DBT) Electronic Payment Voucher
              </h2>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Public Financial Management System (PFMS) • National Fellowship & Scholarship Management System
              </div>
            </div>

            {/* Voucher Metadata */}
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Sanction Order Number:</span>
                  <strong className="font-mono text-purple-900">
                    {voucherModalApp.sanctionOrderNumber ||
                      voucherModalApp.reviewStages?.stateNodalVerification?.sanctionOrderNumber ||
                      `MOTA/2026/${voucherModalApp.schemeType || "ST"}/${voucherModalApp.id.slice(0, 6).toUpperCase()}`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Bank UTR Reference:</span>
                  <strong className="font-mono text-emerald-800">
                    {voucherModalApp.disbursement?.utrNumber || "MOTA-DBT-2026-SBIN-847291"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Scheme Name:</span>
                  <strong className="text-slate-900">
                    {voucherModalApp.schemeType === "NFST"
                      ? "National Fellowship for ST Students (NFST)"
                      : voucherModalApp.schemeType === "NOS"
                      ? "National Overseas Scholarship for ST (NOS)"
                      : "Top Class Education Scheme for ST Students"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Disbursement Date:</span>
                  <strong className="text-slate-900">
                    {voucherModalApp.disbursement?.disbursedAt
                      ? new Date(voucherModalApp.disbursement.disbursedAt).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">
                  Beneficiary Account & Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block">Candidate Name:</span>
                    <strong className="text-slate-900">{voucherModalApp.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Aadhaar Linked Identity:</span>
                    <strong className="text-slate-900 font-mono">
                      XXXX-XXXX-{voucherModalApp.aadhaarNumber ? voucherModalApp.aadhaarNumber.slice(-4) : "8912"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Recognized Tribe:</span>
                    <strong className="text-slate-900">
                      {voucherModalApp.tribeName || "Scheduled Tribe"}
                      {voucherModalApp.isPVTG && " (PVTG Priority)"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Beneficiary Institution:</span>
                    <strong className="text-slate-900 truncate block">
                      {voucherModalApp.schoolName || "Accredited University"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Beneficiary Bank:</span>
                    <strong className="text-slate-900">{voucherModalApp.bankName || "State Bank of India"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account & IFSC:</span>
                    <strong className="text-slate-900 font-mono">
                      {voucherModalApp.bankAccountNumber ? `••••${voucherModalApp.bankAccountNumber.slice(-4)}` : "Aadhaar Seeded"}{" "}
                      / {voucherModalApp.bankIFSC || "SBIN0001234"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Disbursement Amount */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-center">
                <span className="text-xs uppercase text-emerald-800 font-bold block">
                  Net Amount Transferred via Aadhaar Payment Bridge (APB)
                </span>
                <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">
                  ₹{voucherModalApp.disbursement?.amount ? Number(voucherModalApp.disbursement.amount).toLocaleString() : "37,000"}.00
                </span>
                <span className="text-[11px] text-emerald-800 block mt-0.5 italic">
                  Head of Account: 2225 - Welfare of Scheduled Tribes (Centrally Sponsored)
                </span>
              </div>

              {/* Digital Signature & Seal */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800 uppercase">
                    Authorized Electronic Advice
                  </span>
                  <span>National Informatics Centre (NIC) • PFMS Gateway</span>
                  <div className="mt-1 text-emerald-700 font-mono font-semibold">
                    ✓ NPCI APB VERIFIED & DIRECT CREDITED
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block border border-slate-400 p-2 rounded text-slate-700 font-mono text-[9px] uppercase bg-slate-50">
                    Digitally Authorized<br />
                    Drawing & Disbursing Officer<br />
                    Ministry of Tribal Affairs, GoI
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
              <span className="text-xs text-slate-400">
                Official computer-generated record; no physical signature required.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVoucherModalApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} /> Print / Save Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SAGHomePage;