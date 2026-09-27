import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0b1329] text-slate-400 text-xs border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: About */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-white font-bold text-base tracking-tight hover:opacity-90 transition">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <GraduationCap size={18} />
              </div>
              <span className="text-white font-extrabold text-sm tracking-wide">
                MoTA • <span className="font-normal text-slate-300">ST Scholarship Portal</span>
              </span>
            </Link>

            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
              ABOUT MOTA SCHOLARSHIP PORTAL
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              The Ministry of Tribal Affairs (MoTA) Central Sector Schemes provide higher education grants, research fellowships (NFST, NOS, Top Class Education), and Direct Benefit Transfer (DBT) to meritorious Scheduled Tribe scholars across India.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck size={14} />
              <span>Direct Benefit Transfer (DBT) & PFMS Integrated Gateway</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/viewScholarships" className="hover:text-white transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-blue-400" />
                  Available ST Schemes
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-blue-400" />
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/ekyc0" className="hover:text-white transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-blue-400" />
                  Biometric e-KYC
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-blue-400" />
                  Guidelines & FAQ
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-blue-400" />
                  Portal Sign-in
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
              CONTACT US
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">scholarship-mota@nic.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi, India - 110001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400">
          <p>© 2026 Ministry of Tribal Affairs, Government of India. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-slate-300 transition">About Scheme</Link>
            <Link to="/faq" className="hover:text-slate-300 transition">Privacy & Terms</Link>
            <a href="/#contact" className="hover:text-slate-300 transition">Helpdesk</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
