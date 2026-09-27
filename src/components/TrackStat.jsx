import React from "react";
import {
  Check,
  Clock,
  AlertTriangle,
  X,
  FileCheck2,
  Building2,
  Landmark,
  CreditCard,
  UserCheck,
  Send,
} from "lucide-react";

export const MOTA_TRACKER_STAGES = [
  {
    id: 1,
    key: "applicationSubmitted",
    label: "Application Submitted",
    shortLabel: "Submission",
    icon: Send,
    runtimeVerified: true,
    desc: "Candidate application, profile & ST proof submitted",
  },
  {
    id: 2,
    key: "applicantEligibility",
    label: "Applicant Eligibility Verification",
    shortLabel: "Eligibility",
    icon: UserCheck,
    runtimeVerified: true,
    desc: "Automated age, income & ST domicile verification",
  },
  {
    id: 3,
    key: "documentVerification",
    label: "Document Verification",
    shortLabel: "Doc Verify",
    icon: FileCheck2,
    runtimeVerified: true,
    desc: "ST certificate, Aadhaar & degree marksheet validated",
  },
  {
    id: 4,
    key: "instituteVerification",
    label: "Institute Verification",
    shortLabel: "Institute",
    icon: Building2,
    runtimeVerified: false,
    desc: "AISHE college nodal officer enrollment & bonafide check",
  },
  {
    id: 5,
    key: "stateNodalVerification",
    label: "State Nodal Official Verification",
    shortLabel: "State Nodal",
    icon: Landmark,
    runtimeVerified: false,
    desc: "State Nodal / Ministry SAG Scrutiny Board sanction",
  },
  {
    id: 6,
    key: "paymentDistribution",
    label: "Payment Distribution",
    shortLabel: "Disbursement",
    icon: CreditCard,
    runtimeVerified: false,
    desc: "Direct Benefit Transfer (DBT) release via PFMS gateway",
  },
];

const TrackStat = ({ application = null, status = "" }) => {
  // Compute the status of each of the 6 stages
  const getStageStatuses = () => {
    if (!application) {
      // Fallback to numeric status prop (1-6)
      const numericVal = parseInt(status, 10) || 3;
      return MOTA_TRACKER_STAGES.map((s) => ({
        ...s,
        status: s.id <= numericVal ? "completed" : "pending",
      }));
    }

    const duplicate = Boolean(application.duplicateFound);
    const isRejected = application.reviewStatus === "rejected" || duplicate;
    const hasOpenDeficiencies =
      application.reviewStatus === "deficient" ||
      application.deficiencies?.some((d) => d.status === "open");

    // Stage 1: Application Submitted (Runtime Completed)
    const stage1Status = "completed";

    // Stage 2: Applicant Eligibility Verification (Runtime Checked)
    let stage2Status = "completed";
    if (duplicate) {
      stage2Status = "rejected";
    } else if (application.isEligible === false) {
      stage2Status = "rejected";
    }

    // Stage 3: Document Verification (Runtime Checked)
    let stage3Status = "completed";
    if (duplicate) {
      stage3Status = "rejected";
    } else if (hasOpenDeficiencies) {
      stage3Status = "deficient";
    }

    // Stage 4: Institute Verification (Pending by default)
    let stage4Status = "pending";
    if (isRejected) {
      stage4Status = "rejected";
    } else if (hasOpenDeficiencies) {
      stage4Status = "deficient";
    } else if (
      application.instituteVerified === true ||
      application.reviewStages?.instituteVerification?.checked === true ||
      ["institute_approved", "state_approved", "approved", "disbursed"].includes(
        application.reviewStatus
      )
    ) {
      stage4Status = "completed";
    }

    // Stage 5: State Nodal Official Verification (Pending by default)
    let stage5Status = "pending";
    if (isRejected) {
      stage5Status = "rejected";
    } else if (
      application.stateNodalVerified === true ||
      application.reviewStages?.stateNodalVerification?.checked === true ||
      ["state_approved", "approved", "disbursed"].includes(application.reviewStatus)
    ) {
      stage5Status = "completed";
    }

    // Stage 6: Payment Distribution (Pending by default)
    let stage6Status = "pending";
    if (isRejected) {
      stage6Status = "rejected";
    } else if (
      application.reviewStatus === "disbursed" ||
      application.disbursement
    ) {
      stage6Status = "completed";
    }

    const statuses = [
      stage1Status,
      stage2Status,
      stage3Status,
      stage4Status,
      stage5Status,
      stage6Status,
    ];

    return MOTA_TRACKER_STAGES.map((stage, idx) => ({
      ...stage,
      status: statuses[idx],
    }));
  };

  const stagesWithStatus = getStageStatuses();

  // Find current active / next pending stage
  const pendingIndex = stagesWithStatus.findIndex(
    (s) => s.status === "pending" || s.status === "deficient" || s.status === "rejected"
  );
  const activeStage = pendingIndex === -1 ? stagesWithStatus[5] : stagesWithStatus[pendingIndex];

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            6-Stage MoTA Scrutiny & Disbursement Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stages 1–3 are verified automatically at runtime; Stages 4–6 progress through Institutional, State Nodal, and PFMS approvals.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Current Stage: {activeStage?.label} ({activeStage?.status.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Horizontal / Responsive Stepper */}
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
          {stagesWithStatus.map((stage, index) => {
            const isCompleted = stage.status === "completed";
            const isDeficient = stage.status === "deficient";
            const isRejected = stage.status === "rejected";
            const isPending = stage.status === "pending";

            let cardBg = "bg-slate-50 border-slate-200 text-slate-600";
            let iconBg = "bg-slate-200 text-slate-500";
            let statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase">
                Pending
              </span>
            );

            if (isCompleted) {
              cardBg = "bg-emerald-50/70 border-emerald-300 text-emerald-950 ring-1 ring-emerald-500/20";
              iconBg = "bg-emerald-600 text-white shadow-xs";
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  {stage.runtimeVerified ? "Completed (Runtime)" : "Approved"}
                </span>
              );
            } else if (isDeficient) {
              cardBg = "bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400";
              iconBg = "bg-amber-500 text-white";
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400 uppercase">
                  Action Required
                </span>
              );
            } else if (isRejected) {
              cardBg = "bg-red-50 border-red-300 text-red-950";
              iconBg = "bg-red-600 text-white";
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 uppercase">
                  Rejected
                </span>
              );
            }

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      0{stage.id}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                      {isCompleted ? (
                        <Check size={18} strokeWidth={2.5} />
                      ) : isDeficient ? (
                        <AlertTriangle size={16} />
                      ) : isRejected ? (
                        <X size={18} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs leading-snug text-slate-900 line-clamp-2">
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  {statusBadge}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackStat;
