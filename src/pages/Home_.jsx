import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Lock,
  CreditCard,
  Globe,
  CheckCircle2,
  FileText,
  Building2,
  Landmark,
  UserCheck,
  Quote,
  ChevronDown,
  BookOpen,
  Award,
  Sparkles,
  School,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

const Home_ = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleName) => {
    navigate("/login", { state: { name: roleName } });
  };

  const scrollToContent = () => {
    const el = document.getElementById("features-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 font-sans flex flex-col relative selection:bg-blue-100 selection:text-blue-900">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Clean Top Navbar with Login & Sign Up Options              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name (Clickable, redirects to Home) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            title="MoTA Home"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap size={20} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                MoTA
              </span>
              <span className="text-xs text-slate-500 font-medium border-l border-slate-300 pl-2.5 hidden sm:inline">
                National ST Scholarship & Fellowship Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="text-slate-900 font-bold hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-blue-600 transition">
              About Schemes
            </Link>
            <a href="#contact" className="hover:text-blue-600 transition">
              Contact
            </a>
          </nav>

          {/* Right Action Buttons: Sign In & Sign Up */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-xs"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Hero Section with Education Geometric Watermark Pattern     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-slate-200/60">
        
        {/* Subtle Decorative Education & Blueprint Pattern Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-slate-50/50 to-white -z-10 pointer-events-none"></div>
        <div 
          className="absolute inset-0 opacity-[0.035] -z-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f172a' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 5 L45 13 L30 21 L15 13 Z M45 15 L45 22 C45 27 30 32 15 22 L15 15 Z M10 40 L25 40 L25 55 L10 55 Z M35 40 L50 40 L50 55 L35 55 Z' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}
        ></div>

        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto">
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-2xs">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-xs font-bold tracking-wider text-blue-700 uppercase">
              CENTRAL SECTOR SCHEMES • MINISTRY OF TRIBAL AFFAIRS
            </span>
          </div>

          {/* Classic Serif Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 font-normal tracking-tight leading-[1.14] mb-5">
            Your scholarship, <br className="hidden sm:inline" />
            <span className="italic">simplified.</span>
          </h1>

          {/* Clean Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            A transparent, fully digital platform for application, Aadhaar biometric verification, and Direct Benefit Transfer (DBT) disbursement — from submission to release in one unified portal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              type="button"
              onClick={scrollToContent}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              Get Started
              <ChevronDown size={16} />
            </button>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              Register as ST Scholar
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* National Trust & Metrics Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2 px-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xs text-xs font-medium text-slate-600 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <Sparkles size={14} />
              <span>₹500+ Cr Disbursed via DBT</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 size={14} />
              <span>UIDAI Biometric e-KYC</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
              <School size={14} />
              <span>259+ Notified Premier Institutes</span>
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <button
              type="button"
              onClick={() => handleRoleSelect("student")}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600">
                <GraduationCap size={18} className="text-blue-600" />
                ST Student Portal &rarr;
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Apply for NFST, NOS, and Top Class Education schemes
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("admin")}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600">
                <Building2 size={18} className="text-blue-600" />
                Institute Nodal Portal &rarr;
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                AISHE colleges bonafide enrollment & fee verification
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("SAG")}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600">
                <Landmark size={18} className="text-blue-600" />
                Ministry / SAG Officials &rarr;
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Scrutiny Board sanction & DBT PFMS payment release
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Classic, Neat Editorial Kalam Quote                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200/80 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="mx-auto text-slate-300 mb-3" size={32} />
          <blockquote className="font-serif text-xl sm:text-2xl text-slate-800 italic leading-relaxed mb-4 font-normal">
            "Life is the most difficult exam. Many people fail because they try to copy others. Not realizing that everyone has a different question paper."
          </blockquote>
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Dr. A.P.J. Abdul Kalam
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              11th President of India • Renowned Scientist
            </span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Features Section (Matching media_1790429757448.png)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="features-section" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mb-3">
            Built for transparent management
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            A secure, scalable platform that supports students and administrators throughout the entire scholarship lifecycle.
          </p>
        </div>

        {/* 6-Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 01 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Instant Processing
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Digital submission, automated verification, and reduced manual workload across state bodies.
            </p>
          </div>

          {/* 02 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Student-Friendly UI
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Designed for effortless navigation by students, nodal institutions, and government officials.
            </p>
          </div>

          {/* 03 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Secure Documents
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              End-to-end encryption ensures absolute privacy of caste certificates, income, and bank credentials.
            </p>
          </div>

          {/* 04 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              04
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Automated Disbursement
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Eliminate administrative delays with integrated Direct Benefit Transfer (DBT) and PFMS tracking.
            </p>
          </div>

          {/* 05 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              05
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Seamless Integration
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Integrated with AISHE registry, DigiLocker, and UIDAI Aadhaar biometric e-KYC services.
            </p>
          </div>

          {/* 06 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              06
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Accessible Everywhere
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Fully responsive, lightweight design engineered to work smoothly on mobile devices and slow networks.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. 3-Step Lifecycle Workflow (Matching media_1790429700554.png)*/}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="lifecycle" className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">MoTA Scholarship & Fellowship Lifecycle</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-slate-900 font-normal mt-1">How Scholarships Reach You</h3>
        </div>
        
        <div className="space-y-4">
          {/* Step 01 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-mono font-bold text-slate-700 flex-shrink-0">
              01
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Application Submission & Biometric e-KYC
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                ST scholars complete Aadhaar biometric verification with live face match, then submit academic details and ST certificates online.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-mono font-bold text-slate-700 flex-shrink-0">
              02
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-amber-600" />
                Verification & Approval
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Institutes and nodal officers verify bonafide enrollment digitally, followed by Central Scrutiny Board sanction.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-mono font-bold text-slate-700 flex-shrink-0">
              03
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Direct Fund Release & Tracking
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Approved students receive direct scholarship payments into their Aadhaar-seeded bank accounts through PFMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. Contact Us & Official Ministry Helpdesk Section             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
            <MessageSquare size={14} />
            Support & Helpdesk
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal tracking-tight mb-3">
            We're here to help
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Have questions regarding NFST, NOS, Top Class Education schemes, or Aadhaar Biometric e-KYC? Connect directly with the MoTA Scholarship Helpdesk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Official Helpdesk Channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Official Email Support</h3>
                  <p className="text-xs text-slate-500">Fast response within 24 working hours</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-blue-700 pt-1">
                scholarship-mota@nic.in
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">National Helpline</h3>
                  <p className="text-xs text-slate-500">Toll-Free Student Support Line</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-800 pt-1">
                +91 98765 43210 <span className="font-normal text-xs text-slate-500">/ 1800-11-2026 (Toll-Free)</span>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ministry Directorate</h3>
                  <p className="text-xs text-slate-500">Government of India Headquarters</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi, India - 110001
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <Clock size={16} className="text-slate-500 flex-shrink-0" />
              <span>Working Hours: Monday to Friday, 9:00 AM – 5:30 PM IST (Excluding Public Holidays)</span>
            </div>
          </div>

          {/* Column 2: Interactive Query / Helpdesk Message Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Send an Official Inquiry</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Our scrutiny officers and DBT coordinators will review your query and respond directly to your registered email.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Thank you! Your helpdesk ticket has been submitted. Our grievance officer will respond within 24 hours.");
                e.target.reset();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@domain.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Topic / Scheme Name <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="National Fellowship for ST Students (NFST)">National Fellowship for ST Students (NFST)</option>
                  <option value="National Overseas Scholarship (NOS)">National Overseas Scholarship (NOS)</option>
                  <option value="Top Class Education Scheme (TCE)">Top Class Education Scheme (TCE)</option>
                  <option value="Biometric Aadhaar e-KYC Verification">Biometric Aadhaar e-KYC Verification</option>
                  <option value="Direct Benefit Transfer (DBT) & PFMS Status">Direct Benefit Transfer (DBT) & PFMS Status</option>
                  <option value="Institute Bonafide & Scrutiny Inquiry">Institute Bonafide & Scrutiny Inquiry</option>
                  <option value="General Technical Support">General Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Grievance Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your query or problem with relevant application IDs if available..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Submit Helpdesk Ticket
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. Clean Dark Navy Footer                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default Home_;
