import React from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Award,
  FileText,
  Calendar,
  Target,
  CheckCircle,
  GraduationCap,
  ShieldCheck,
  Building2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import Footer from '../components/Footer';

const AboutSchemes = () => {
  const downloadGuidelines = () => {
    alert("Official MoTA Scheme Guidelines PDF: Downloading gazette notification...");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Public Clean Header                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            title="MoTA Home"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <GraduationCap size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                MoTA
              </span>
              <span className="text-xs text-slate-400 font-normal border-l border-slate-300 pl-2 hidden sm:inline">
                National ST Scholarship & Fellowship Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/about" className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5">
              About Schemes
            </Link>
            <Link to="/contactd" className="hover:text-blue-600 transition">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-xs"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Main Content Area                                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
              <ShieldCheck size={14} />
              Ministry of Tribal Affairs • Government of India
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal tracking-tight mb-4">
              MoTA Central Scholarship & Fellowship Schemes
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              The <strong>Ministry of Tribal Affairs (MoTA)</strong> implements central scholarship and fellowship schemes to provide financial assistance to Scheduled Tribe (ST) students pursuing higher education in India and abroad. These include the <strong>National Fellowship for ST Students (NFST)</strong> for research programmes in India, the <strong>National Overseas Scholarship (NOS)</strong> for Master's and Ph.D. abroad, and the <strong>Top Class Education (TCE) Scheme</strong> across 259 premier notified institutions.
            </p>
          </div>

          {/* Objectives & Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Target size={20} />
                </div>
                <h2 className="font-bold text-base text-slate-900">Core Objectives</h2>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Enhance ST scholars' access to premier higher educational & research institutions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Promote equal learning and advanced research opportunities globally.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Provide direct financial relief for tuition, research contingencies, and living allowances.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Award size={20} />
                </div>
                <h2 className="font-bold text-base text-slate-900">Key Features</h2>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>100% digital verification with Aadhaar biometric e-KYC.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Transparent merit-based screening with automated scrutiny & human oversight.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Direct PFMS transfer straight into student Aadhaar-seeded bank accounts.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Application Workflow */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Standard Process Flow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-xs font-bold text-blue-600 block mb-1">01. REGISTRATION</span>
                <p className="text-slate-600 font-medium">Candidate registers on the MoTA Portal, verifies mobile and biometric e-KYC.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-xs font-bold text-amber-600 block mb-1">02. VERIFICATION</span>
                <p className="text-slate-600 font-medium">Institutes verify bonafide admission, followed by Ministry SAG scrutiny.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-xs font-bold text-emerald-600 block mb-1">03. DISBURSEMENT</span>
                <p className="text-slate-600 font-medium">Approved scholars receive maintenance and fee grants via DBT.</p>
              </div>
            </div>
          </div>

          {/* Download Official Brochure Bar */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Download Official Scheme Guidelines</h3>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Read the gazette criteria, approved institution list, and quota rules.
              </p>
            </div>
            <button
              onClick={downloadGuidelines}
              className="px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-blue-50 transition shadow flex items-center gap-2 flex-shrink-0"
            >
              <Download size={16} />
              Download Guidelines
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutSchemes;
