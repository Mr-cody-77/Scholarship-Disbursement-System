import React from "react";
import {
  ShieldCheck,
  Target,
  Award,
  BookOpen,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  School,
} from "lucide-react";

const AboutSchemeDashboard = () => {
  const downloadGuidelines = () => {
    alert("Official MoTA Scheme Guidelines PDF: Downloading gazette notification...");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-3 border border-white/20">
          <ShieldCheck size={14} className="text-blue-300" /> Ministry of Tribal Affairs (MoTA) • Government of India
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          MoTA Central Scholarship & Fellowship Schemes
        </h1>
        <p className="text-sm text-blue-100 max-w-3xl mt-2 leading-relaxed">
          National Central Sector Schemes providing financial assistance, research fellowships (NFST, NOS, Top Class Education), and Direct Benefit Transfer (DBT) to meritorious Scheduled Tribe scholars across India and abroad.
        </p>
      </div>

      {/* Two-Column Cards: Objectives & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Target size={20} />
            </div>
            <h2 className="font-bold text-base text-slate-900">Core Objectives</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Facilitate education and research opportunities for Scheduled Tribe youth.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Provide direct coverage for tuition fees, hostel expenses, and academic allowances.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Ensure 100% transparent fund disbursement via Direct Benefit Transfer (DBT) & PFMS.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={20} />
            </div>
            <h2 className="font-bold text-base text-slate-900">Key Features</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Paperless digital verification with UIDAI Biometric Aadhaar e-KYC.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Recognized in 259+ notified premier institutes (IITs, NITs, IIMs, AIIMS, NLUs).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Dual-channel OTP security with SMS and official email verification.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3-Step Lifecycle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Scholarship Lifecycle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono text-xs font-bold text-blue-600 block mb-1">01. REGISTRATION & E-KYC</span>
            <p className="text-slate-600">Student registers, verifies active mobile number, and completes live face e-KYC.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono text-xs font-bold text-amber-600 block mb-1">02. DUAL VERIFICATION</span>
            <p className="text-slate-600">AISHE institutions verify bonafide admission, followed by Ministry SAG approval.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono text-xs font-bold text-emerald-600 block mb-1">03. DBT PAYMENT</span>
            <p className="text-slate-600">Approved funds are released straight into the scholar's Aadhaar-seeded bank account.</p>
          </div>
        </div>
      </div>

      {/* Official Guidelines Download Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base sm:text-lg">Download Official Scheme Guidelines</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Read the gazette criteria, approved institution quota, and fellowship allowances.
          </p>
        </div>
        <button
          onClick={downloadGuidelines}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition shadow flex items-center gap-2 flex-shrink-0"
        >
          <Download size={16} />
          Download Guidelines
        </button>
      </div>
    </div>
  );
};

export default AboutSchemeDashboard;
