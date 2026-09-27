import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  Download,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

/**
 * DigiLocker Sandbox Simulation Modal
 * Provides zero-cost, permissionless digital document pull simulation
 * modeled after the official Government of India DigiLocker / MeriPehchaan interface.
 */
const DigiLockerModal = ({ isOpen, onClose, onDocumentImport }) => {
  const [step, setStep] = useState(1); // 1: Aadhaar Auth, 2: Document Selection, 3: Imported
  const [aadhaarInput, setAadhaarInput] = useState("123456789012");
  const [otpInput, setOtpInput] = useState("123456");
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulated DigiLocker issued documents
  const issuedDocuments = [
    {
      id: "doc_st_cert",
      name: "Scheduled Tribe (ST) Community Certificate",
      issuer: "Revenue Department, Government of India",
      certNumber: "ST/2023/MoTA/782910",
      issueDate: "14/08/2023",
      verified: true,
      url: "https://res.cloudinary.com/dmqzrmtsf/image/upload/v1/samples/caste_cert.pdf",
    },
    {
      id: "doc_income",
      name: "Annual Family Income Certificate",
      issuer: "Tehsildar / Competent Revenue Authority",
      certNumber: "INC/2024/REV/450912",
      issueDate: "10/04/2024",
      verified: true,
      url: "https://res.cloudinary.com/dmqzrmtsf/image/upload/v1/samples/income_cert.pdf",
    },
    {
      id: "doc_aadhaar",
      name: "Aadhaar Card (UIDAI)",
      issuer: "Unique Identification Authority of India",
      certNumber: "XXXXXXXX9012",
      issueDate: "22/01/2022",
      verified: true,
      url: "https://res.cloudinary.com/dmqzrmtsf/image/upload/v1/samples/aadhaar_card.pdf",
    },
    {
      id: "doc_class10",
      name: "Class X Board Passing Certificate (DOB Proof)",
      issuer: "Central Board of Secondary Education (CBSE)",
      certNumber: "CBSE/2019/X/910283",
      issueDate: "28/05/2019",
      verified: true,
      url: "https://res.cloudinary.com/dmqzrmtsf/image/upload/v1/samples/marksheet.pdf",
    },
  ];

  if (!isOpen) return null;

  const handleSimulatedAuth = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(2);
    }, 1000);
  };

  const handleSelectDoc = (doc) => {
    if (onDocumentImport) {
      onDocumentImport(doc);
    }
    setStep(3);
    setTimeout(() => {
      onClose();
      setStep(1);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* DigiLocker Official Header Style */}
        <div className="bg-[#002B49] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/40">
              <ShieldCheck className="text-blue-300" size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold block">
                MeriPehchaan • Digital India
              </span>
              <h3 className="text-base font-bold text-white">
                DigiLocker Document Gateway
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Simulated Aadhaar / MeriPehchaan Login */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <Lock size={16} className="text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Sandbox Simulation:</strong> Click verify below to simulate fetching authentic documents directly from National DigiLocker.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Aadhaar Number (UIDAI)
                </label>
                <input
                  type="text"
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  6-Digit OTP (Simulated: 123456)
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulatedAuth}
                disabled={isVerifying}
                className="w-full py-3 bg-[#002B49] hover:bg-[#003860] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Authenticating with DigiLocker...
                  </>
                ) : (
                  "Authenticate & Fetch Issued Documents"
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Issued Documents List */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Document to Import ({issuedDocuments.length})
                </h4>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Digitally Signed
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {issuedDocuments.map((docItem) => (
                  <div
                    key={docItem.id}
                    onClick={() => handleSelectDoc(docItem)}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {docItem.name}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        Issuer: {docItem.issuer}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        No: {docItem.certNumber} • Issued: {docItem.issueDate}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Document Successfully Imported!
              </h4>
              <p className="text-xs text-slate-500">
                Document pulled and verified via Government of India DigiLocker cryptographic signature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigiLockerModal;
