import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellDot,
  LogOut,
  User,
  ChevronDown,
  GraduationCap,
  Home,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { auth } from "../Firebase";
import { signOut } from "firebase/auth";

const TopBar = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleBellDropdown = () => {
    setIsBellDropdownOpen((prev) => !prev);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setIsBellDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.1 } },
  };

  const userInitial = props.user?.fullName?.[0]?.toUpperCase() || "S";
  const userRole = (props.user?.role || localStorage.getItem("userRole") || "student").toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full">
      <div className="flex justify-between items-center px-4 sm:px-6 py-2.5 w-full">
        
        {/* Left Section: Mobile Menu Toggle & Clickable Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Toggle Sidebar Menu"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            title="Return to Home Page"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                MoTA
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline border-l border-slate-300 pl-2">
                Scholarship & Fellowship System
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Navigation Links with Active Indicator */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {userRole === "ADMIN" ? (
            <>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  isActive || location.pathname === "/applications-check"
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                Applications Scrutiny
              </NavLink>
              <NavLink
                to="/admin-history"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                Scrutiny History
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive || location.pathname === "/dashboard"
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/viewScholarships"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                Schemes
              </NavLink>
              <NavLink
                to="/track"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                Tracker
              </NavLink>
              <NavLink
                to="/about-scheme"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5"
                    : "hover:text-blue-700 transition"
                }
              >
                About
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Section: Notification & User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Icon */}
          <div className="relative" ref={bellDropdownRef}>
            <button
              type="button"
              onClick={toggleBellDropdown}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            >
              {props.isNotification ? (
                <>
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
                </>
              ) : (
                <Bell size={18} />
              )}
            </button>

            <AnimatePresence>
              {isBellDropdownOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-xs"
                >
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Notifications</span>
                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer transition">
                      <p className="font-semibold text-slate-800 text-[11px]">
                        NFST 2026 Guidelines Notified
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        MoTA has released updated rules for national fellowships.
                      </p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer transition">
                      <p className="font-semibold text-slate-800 text-[11px]">
                        Biometric e-KYC Active
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Complete your Aadhaar e-KYC to apply for scholarships.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {props.user?.fullName?.split(" ")[0] || "User"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  {userRole}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-0.5" />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-sm"
                >
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {props.user?.fullName || "Student Scholar"}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {props.user?.email || localStorage.getItem("studentEmail") || "scholar@mota.gov.in"}
                    </p>
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {userRole} Portal
                    </span>
                  </div>

                  <div className="p-1">
                    <Link
                      to={userRole === "ADMIN" ? "/admin-dashboard" : "/home"}
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                    >
                      <Home size={14} className="text-slate-400" />
                      Dashboard Home
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                    >
                      <LogOut size={14} className="text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;