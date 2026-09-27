import React, { useState } from "react";
import { loginUser } from "../firebase/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Building2,
  Landmark,
  Lock,
  Mail,
  KeyRound,
  FileCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.name || "student";
  const [activeRole, setActiveRole] = useState(initialRole);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-10 px-4 relative">
      {/* Decorative backdrop elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-teal-500/20 overflow-hidden">
        {/* Back to Home Navigation Bar */}
        <div className="bg-slate-950/80 px-5 sm:px-6 py-2.5 border-b border-emerald-900/60 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] text-emerald-200/70 hidden sm:inline font-medium">
            Ministry of Tribal Affairs • Government of India
          </span>
        </div>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-6 md:p-8 text-center border-b border-emerald-700">
          <div className="inline-flex items-center justify-center p-2.5 bg-white/10 rounded-full mb-3 ring-1 ring-white/20">
            <Landmark className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Ministry of Tribal Affairs
          </h1>
          <p className="text-sm md:text-base text-emerald-200 font-medium mt-1">
            National ST Scholarship & Fellowship Management System
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-emerald-100">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/50 border border-emerald-400/30">
              NFST Fellowship
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/50 border border-emerald-400/30">
              National Overseas (NOS)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/50 border border-emerald-400/30">
              Top Class Education (TCE)
            </span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Select Your Portal Sign-in Type
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Choose your role below. Each portal provides role-specific access and authentication pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {/* Student Tab */}
            <button
              type="button"
              onClick={() => setActiveRole("student")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                activeRole === "student"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${activeRole === "student" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                {activeRole === "student" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">ST Student / Fellow</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Candidates for higher studies & research grants
                </p>
              </div>
            </button>

            {/* Institution Tab */}
            <button
              type="button"
              onClick={() => setActiveRole("admin")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                activeRole === "admin"
                  ? "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${activeRole === "admin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                {activeRole === "admin" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Institution / Nodal</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  AISHE colleges, bonafide & fee verification
                </p>
              </div>
            </button>

            {/* Ministry / SAG Tab */}
            <button
              type="button"
              onClick={() => setActiveRole("SAG")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                activeRole === "SAG"
                  ? "border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-500/20"
                  : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${activeRole === "SAG" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <Shield className="w-5 h-5" />
                </div>
                {activeRole === "SAG" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Ministry / SAG Officials</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  MoTA Scrutiny, Merit Board & DBT PFMS Release
                </p>
              </div>
            </button>
          </div>

          {/* Quick Demo Credentials Info Bar */}
          <div className="mb-4 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Prototype Test Credentials:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                <strong>Student:</strong> student@gmail.com | Password@123
              </span>
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                <strong>Institute:</strong> institute.nodal@tribal.gov.in (AISHE-U-0123) | Password@123
              </span>
              <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                <strong>MoTA Official:</strong> mota.official@gov.in | Password@123
              </span>
            </div>
          </div>

          {/* Active Role Login Component */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-6 md:p-8">
            {activeRole === "student" && <StudentLoginForm />}
            {activeRole === "admin" && <InstituteLoginForm />}
            {activeRole === "SAG" && <MinistryOfficialLoginForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */
/* 1. Student / Fellow Sign-in Component with 5 Demo Scenarios   */
/* ------------------------------------------------------------- */
const DEMO_STUDENTS = [
  {
    id: "deficient",
    name: "Pooja Rameshwar Dhurve",
    email: "student.deficient@tribal.gov.in",
    password: "Password@123",
    statusBadge: "1. Deficient Docs (Re-upload)",
    statusColor: "bg-amber-100 text-amber-900 border-amber-300",
    scheme: "NFST Fellowship (Ph.D.)",
    tribe: "Gond (PVTG)",
    state: "Madhya Pradesh",
    applicationStatus: "Deficient (2 Flagged Documents)",
    scenarioHighlight: "Re-upload Mismatched Docs on /track",
    description: "Application flagged with 2 blurred/expired documents (ST Certificate & Income Certificate). Log in and visit /track to test the live zero-cost OCR document verification & resubmission form.",
  },
  {
    id: "inst1",
    name: "Birsa Kalyan Munda",
    email: "student.institution1@tribal.gov.in",
    password: "Password@123",
    statusBadge: "2. Pending College Approval",
    statusColor: "bg-blue-100 text-blue-900 border-blue-300",
    scheme: "NFST Fellowship (Ph.D.)",
    tribe: "Munda",
    state: "Jharkhand",
    applicationStatus: "Stage 4: Pending College Bonafide",
    scenarioHighlight: "Ready for Institute Certification",
    description: "Stages 1-3 complete. Stage 4 Pending at Birsa Agricultural University (BAU). Appears in the Institutional Nodal Officer Scrutiny queue for bonafide verification.",
  },
  {
    id: "inst2",
    name: "Sunita Marskole Soren",
    email: "student.institution2@tribal.gov.in",
    password: "Password@123",
    statusBadge: "3. Pending College Approval (NOS)",
    statusColor: "bg-purple-100 text-purple-900 border-purple-300",
    scheme: "National Overseas Scholarship (NOS)",
    tribe: "Santhal",
    state: "Odisha",
    applicationStatus: "Stage 4: Pending College Bonafide",
    scenarioHighlight: "Foreign Master's Scheme Scrutiny",
    description: "Stages 1-3 complete. Stage 4 Pending at NIT Rourkela for foreign university master's degree bonafide review. Appears in the Institutional Scrutiny queue.",
  },
  {
    id: "fresh",
    name: "Karan Dev Singh Jamatia",
    email: "student.fresh@tribal.gov.in",
    password: "Password@123",
    statusBadge: "4. Fresh Student (Ready to Apply)",
    statusColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    scheme: "No Applications Submitted Yet",
    tribe: "Jamatia",
    state: "Tripura",
    applicationStatus: "Fresh Profile",
    scenarioHighlight: "Clean Slate for /apply Flow",
    description: "Registered student account with Aadhaar verification. Clean slate ready to fill out and submit a fresh application on /apply.",
  },
  {
    id: "ekyc",
    name: "Ananya Chenchu",
    email: "student.ekyc@tribal.gov.in",
    password: "Password@123",
    statusBadge: "5. Biometric e-KYC Verified",
    statusColor: "bg-teal-100 text-teal-900 border-teal-300",
    scheme: "Pre-verified Candidate",
    tribe: "Chenchu (PVTG)",
    state: "Andhra Pradesh",
    applicationStatus: "e-KYC Complete",
    scenarioHighlight: "PVTG Quota Priority",
    description: "Particularly Vulnerable Tribal Group candidate with biometric liveness and Aadhaar seed verified. Ready to apply with PVTG quota priority.",
  },
];

const StudentLoginForm = () => {
  const [selectedDemo, setSelectedDemo] = useState(DEMO_STUDENTS[0]);
  const [email, setEmail] = useState(DEMO_STUDENTS[0].email);
  const [password, setPassword] = useState(DEMO_STUDENTS[0].password);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectDemo = (student) => {
    setSelectedDemo(student);
    setEmail(student.email);
    setPassword(student.password);
  };

  const handleExecuteLogin = async (loginEmail, loginPassword) => {
    const targetEmail = (loginEmail || email).trim().toLowerCase();
    const targetPass = loginPassword || password;

    if (!targetEmail) {
      toast.error("Please enter your registered student email address");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(targetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!targetPass) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(targetEmail, targetPass, "student");
      toast.success(`Welcome back! Signed in as ${selectedDemo?.name || "Student"}.`);
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentEmail", targetEmail);

      setTimeout(() => {
        navigate("/home", {
          state: { uid: user.uid, role: "student" },
          replace: true,
        });
      }, 700);
    } catch (error) {
      console.error("Student login error:", error);
      toast.error("Invalid student credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleExecuteLogin(email, password);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="mr-2 text-emerald-600 w-6 h-6" />
          ST Student & Fellow Sign-in
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Select one of the 5 demo candidate evaluation scenarios below or sign in with custom credentials.
        </p>
      </div>

      {/* 5 Demo Student Scenarios Selector */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Choose Demo Candidate Evaluation Scenario:
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            5 Demo Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {DEMO_STUDENTS.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => handleSelectDemo(st)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedDemo.id === st.id
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 bg-white"
              }`}
            >
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1.5 ${st.statusColor}`}>
                  {st.statusBadge}
                </span>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {st.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {st.scheme}
                </p>
              </div>
              <div className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span>{st.tribe}</span>
                {selectedDemo.id === st.id && <span className="font-bold text-emerald-800">● Selected</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Scenario Preview Banner with 1-Click Login */}
        {selectedDemo && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{selectedDemo.name}</span>
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border">
                  {selectedDemo.email}
                </span>
              </div>
              <p className="text-slate-600 text-xs">{selectedDemo.description}</p>
              <div className="flex flex-wrap gap-2 text-[10px] text-emerald-800 font-medium pt-0.5">
                <span><strong>Status:</strong> {selectedDemo.applicationStatus}</span>
                <span>•</span>
                <span><strong>Tribe:</strong> {selectedDemo.tribe}</span>
                <span>•</span>
                <span><strong>State:</strong> {selectedDemo.state}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleExecuteLogin(selectedDemo.email, selectedDemo.password)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 disabled:opacity-50"
            >
              <UserCheck size={14} />
              1-Click Sign In as {selectedDemo.name.split(" ")[0]}
            </button>
          </div>
        )}
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto pt-2">
        <div className="text-center text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          — Or sign in with custom / selected credentials —
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Registered Student Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="e.g., student@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Account Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign in to Student Portal"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            to="/signup"
            className="text-emerald-700 font-bold hover:underline"
          >
            New ST Candidate? Register for Scholarships
          </Link>
          <Link
            to="/track"
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Direct Application Tracker &rarr;
          </Link>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------- */
/* 2. Institution / University Nodal Officer Component          */
/* ------------------------------------------------------------- */
const InstituteLoginForm = () => {
  const [aisheCode, setAisheCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!aisheCode || aisheCode.trim().length < 3) {
      toast.error("Please provide a valid AISHE or Institute Code (e.g. AISHE-U-0123)");
      return;
    }
    if (!email || !email.trim()) {
      toast.error("Please enter the institutional nodal officer email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your institute portal password");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(email.trim().toLowerCase(), password, "admin");
      toast.success(`Institute verified! Logged in for ${aisheCode.toUpperCase()}`);
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("instituteAisheCode", aisheCode.trim().toUpperCase());

      setTimeout(() => {
        navigate("/admin-dashboard", {
          state: { uid: user.uid, role: "admin", aisheCode: aisheCode.trim().toUpperCase() },
          replace: true,
        });
      }, 800);
    } catch (error) {
      console.error("Institute login error:", error);
      toast.error("Invalid institution credentials. Please check your AISHE code, email, and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setAisheCode("AISHE-U-0123");
    setEmail("institute.nodal@tribal.gov.in");
    setPassword("Password@123");
    toast.info("Populated demo institute nodal credentials");
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Building2 className="mr-2 text-blue-600 w-6 h-6" />
            Institution / University Nodal Sign-in
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            AISHE Higher Education Institutes Scrutiny & Bonafide Verification Gateway
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 transition"
        >
          Use Demo Institute
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 max-w-xl mx-auto">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            AISHE Code / Institute Identification Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileCheck className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. AISHE-U-0123 / NITD-2024"
              value={aisheCode}
              onChange={(e) => setAisheCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white uppercase font-mono font-medium"
              required
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            All-India Survey on Higher Education (AISHE) or Nodal Code
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Institutional Nodal Officer Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="nodal.officer@institute.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Institute Security Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? "Verifying AISHE & Credentials..." : "Sign in as Institute Nodal Officer"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            Authorized institute admins verify student enrollment, fees, and bonafide records before forwarding to the Ministry.
          </span>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------- */
/* 3. Ministry / SAG Officials Sign-in Component                */
/* ------------------------------------------------------------- */
const MinistryOfficialLoginForm = () => {
  const [division, setDivision] = useState("Special Action Group (SAG) Scrutiny Committee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!division) {
      toast.error("Please select your Ministry Division");
      return;
    }
    if (!email || !email.trim()) {
      toast.error("Please enter your official Ministry email");
      return;
    }
    if (!password) {
      toast.error("Please enter your official security passcode");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(email.trim().toLowerCase(), password, "SAG");
      toast.success(`Ministry official authenticated for: ${division}`);
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userRole", "SAG");
      localStorage.setItem("motaOfficerDivision", division);

      setTimeout(() => {
        navigate("/sag-home-page", {
          state: { uid: user.uid, role: "SAG", division: division },
          replace: true,
        });
      }, 800);
    } catch (error) {
      console.error("Ministry login error:", error);
      toast.error("Invalid Ministry official credentials. Please verify your officer credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("mota.official@gov.in");
    setPassword("Password@123");
    toast.info("Populated demo Ministry official credentials");
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 text-purple-600 w-6 h-6" />
            Ministry of Tribal Affairs (MoTA) Official Sign-in
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Special Action Group (SAG), Scheme Steering Committee & DBT PFMS Disbursers
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 transition"
        >
          Use Demo Official
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 max-w-xl mx-auto">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Ministry Directorate / Official Division <span className="text-red-500">*</span>
          </label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white font-medium"
            required
          >
            <option value="Special Action Group (SAG) Scrutiny Committee">
              Special Action Group (SAG) Scrutiny Committee
            </option>
            <option value="Scholarship Sanctioning Authority (SSA)">
              Scholarship Sanctioning Authority (SSA)
            </option>
            <option value="Direct Benefit Transfer (DBT) & PFMS Release Nodal">
              Direct Benefit Transfer (DBT) & PFMS Release Nodal
            </option>
            <option value="Particularly Vulnerable Tribal Groups (PVTG) Cell">
              Particularly Vulnerable Tribal Groups (PVTG) Directorate
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Officer Government / Official Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="officer@tribal.gov.in or sag@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Officer Security Passcode / 2FA PIN <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? "Authenticating Ministry Official..." : "Sign in to Ministry Executive Portal"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900 flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <span>
            Access is restricted to authorized Government of India officials. Grants access to the Merit Board, Deficiency Flags, Scheme Quota Management, and PFMS-DBT Payment Simulator.
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
