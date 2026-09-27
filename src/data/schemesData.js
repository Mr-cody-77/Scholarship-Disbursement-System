/**
 * Official MoTA Scholarship/Fellowship Scheme Configurations
 * Source: Ministry of Tribal Affairs, Government of India
 * Reference: https://tribal.nic.in, https://fellowship.tribal.gov.in, https://overseas.tribal.gov.in
 *
 * These are the ACTUAL official rules — not made up.
 */

export const SCHEME_TYPES = {
  NFST: "NFST",
  NOS: "NOS",
  TCE: "TCE",
};

export const SCHEME_CONFIGS = {
  // ─────────────────────────────────────────────────────────
  // 1. National Fellowship for Scheduled Tribes (NFST)
  // ─────────────────────────────────────────────────────────
  NFST: {
    id: "NFST",
    name: "National Fellowship for Scheduled Tribes (NFST)",
    shortName: "NFST",
    description:
      "Fellowship for ST scholars pursuing full-time M.Phil./Ph.D. research in UGC-recognized Indian universities and institutes of national importance.",
    implementedBy: "Ministry of Tribal Affairs (MoTA)",
    portal: "https://fellowship.tribal.gov.in",

    // Eligibility Rules
    eligibility: {
      incomeLimit: null, // No income limit for NFST
      incomeLimitLabel: "No Income Limit",
      ageLimit: { max: 36, asOnDate: "1st July of the year of award" },
      courseLevels: ["Ph.D.", "M.Phil.", "Integrated M.Phil.+Ph.D."],
      minimumMarks: 55, // % in Post-Graduation
      institutionType:
        "UGC-recognized Universities, Deemed Universities, or Institutes of National Importance",
      casteCategory: "ST",
      mustBeFullTime: true,
    },

    // Award Amounts (INR)
    award: {
      fellowship: {
        jrf: { amount: 37000, label: "JRF (First 2 Years)", perMonth: true },
        srf: {
          amount: 42000,
          label: "SRF (Remaining 3 Years)",
          perMonth: true,
        },
      },
      contingency: {
        humanities: {
          jrfYears: 10000,
          srfYears: 20500,
          label: "Humanities & Social Sciences",
          perAnnum: true,
        },
        sciences: {
          jrfYears: 12000,
          srfYears: 25000,
          label: "Sciences, Engineering & Technology",
          perAnnum: true,
        },
      },
      hra: "As per Central Government / UGC rules (if hostel not provided)",
      escortAllowance: {
        amount: 2000,
        perMonth: true,
        label: "For Divyangjan (PwD) scholars",
      },
    },

    // Duration
    duration: {
      phd: { years: 5, label: "2 years JRF + 3 years SRF" },
      mphil: { years: 2, label: "Or dissertation submission" },
      integrated: {
        years: 5,
        label: "2 years M.Phil. + 3 years Ph.D.",
      },
    },

    // Slots & Reservation
    slots: {
      total: 750,
      pvtg: 25,
      divyangjan: 38, // 5%
      female: 225, // 30%
      general: 462,
    },

    // Required Documents
    requiredDocuments: [
      "ST Certificate / PVTG Certificate",
      "Date of Birth Proof (Class 10th Certificate)",
      "Post-Graduation Marksheet / Degree Certificate",
      "CGPA to Percentage Conversion Certificate (if applicable)",
      "Admission / Joining / Bonafide Certificate for M.Phil./Ph.D.",
      "Aadhaar Card",
      "Recent Passport-size Photograph",
      "Disability Certificate / UDID Card (if applicable)",
    ],

    renewalRequired: true,
  },

  // ─────────────────────────────────────────────────────────
  // 2. National Overseas Scholarship (NOS)
  // ─────────────────────────────────────────────────────────
  NOS: {
    id: "NOS",
    name: "National Overseas Scholarship for ST (NOS)",
    shortName: "NOS",
    description:
      "Full financial assistance to meritorious ST candidates for pursuing Master's, Ph.D., or Post-Doctoral studies abroad in QS Top 1000 universities.",
    implementedBy: "Ministry of Tribal Affairs (MoTA)",
    portal: "https://overseas.tribal.gov.in",

    // Eligibility Rules
    eligibility: {
      incomeLimit: 600000, // ₹6 Lakh per annum
      incomeLimitLabel: "₹6,00,000 per annum",
      ageLimit: {
        masters: { max: 32 },
        phd: { max: 35 },
        postDoc: { max: 38 },
        asOnDate: "1st July of the selection year",
      },
      courseLevels: [
        "Master's Degree (Abroad)",
        "Ph.D. (Abroad)",
        "Post-Doctoral Research (Abroad)",
      ],
      minimumMarks: 55, // waived if unconditional admission to QS Top 1000
      institutionType: "Foreign university ranked in QS World Top 1000",
      casteCategory: "ST",
      oneChildPerFamily: true,
    },

    // Award Amounts
    award: {
      tuition: "Full tuition and mandatory non-refundable fees at actuals",
      maintenance: {
        usa: { amount: 15400, currency: "USD", perAnnum: true },
        uk: { amount: 9900, currency: "GBP", perAnnum: true },
      },
      contingency: {
        usa: { amount: 1532, currency: "USD", perAnnum: true },
        uk: { amount: 1116, currency: "GBP", perAnnum: true },
      },
      passage: "Economy class return airfare (shortest direct route)",
      visa: "Actual visa fees",
      insurance: "Actual mandatory medical insurance premium",
    },

    // Duration
    duration: {
      masters: { years: 2, label: "Or actual course duration" },
      phd: { years: 4, label: "3 years, extendable to 4" },
      postDoc: { years: 2, label: "1 year, extendable to 2" },
    },

    // Slots & Reservation
    slots: {
      total: 20,
      pvtg: 3, // 15%
      female: 6, // 30%
      general: 11,
    },

    // Required Documents
    requiredDocuments: [
      "Aadhaar Card",
      "Date of Birth Proof (Class 10th Certificate or Birth Certificate)",
      "ST Community Certificate",
      "PVTG Certificate (if applicable)",
      "Income Certificate (family income ≤ ₹6 Lakh)",
      "Qualifying Degree Marksheet & Certificate (min 55%)",
      "CGPA to Percentage Conversion Certificate (if applicable)",
      "Unconditional Admission / Offer Letter from foreign university",
      "QS Ranking Proof of the foreign university",
      "Research Proposal / SOP (for Ph.D./Post-Doc)",
      "Employer NOC (if currently employed)",
      "Passport Copy",
      "Recent Passport-size Photograph",
    ],

    renewalRequired: false,
  },

  // ─────────────────────────────────────────────────────────
  // 3. Top Class Education for ST Students (TCE)
  // ─────────────────────────────────────────────────────────
  TCE: {
    id: "TCE",
    name: "Top Class Education for ST Students",
    shortName: "TCE",
    description:
      "Scholarship for ST students pursuing UG/PG degrees in 265 notified premier Indian institutions (IITs, IIMs, AIIMS, NITs, NLUs, IISc, IISERs, etc.).",
    implementedBy: "Ministry of Tribal Affairs (MoTA)",
    portal: "https://scholarships.gov.in",

    // Eligibility Rules
    eligibility: {
      incomeLimit: 600000, // ₹6 Lakh per annum
      incomeLimitLabel: "₹6,00,000 per annum",
      ageLimit: null, // No specific age limit
      courseLevels: [
        "Bachelor's Degree",
        "Master's Degree",
        "Integrated Programs",
      ],
      minimumMarks: null, // Based on admission to notified institute
      institutionType: "265 Notified Premier Institutions by MoTA",
      casteCategory: "ST",
      institutionCategories: [
        "IITs (Indian Institutes of Technology)",
        "NITs (National Institutes of Technology)",
        "IIITs (Indian Institutes of Information Technology)",
        "IIMs (Indian Institutes of Management)",
        "AIIMS (All India Institute of Medical Sciences)",
        "NLUs (National Law Universities)",
        "IISc Bengaluru",
        "IISERs (Indian Institutes of Science Education and Research)",
        "BITS Pilani",
        "NIFTs (National Institutes of Fashion Technology)",
        "NIDs (National Institutes of Design)",
        "PGIMER Chandigarh",
        "CMC Vellore",
      ],
    },

    // Award Amounts (INR)
    award: {
      tuition: {
        government: {
          amount: null,
          label: "100% of actual tuition & non-refundable fees",
        },
        private: {
          amount: 250000,
          label: "Up to ₹2,50,000 per annum (capped)",
          perAnnum: true,
        },
      },
      livingExpenses: {
        amount: 3000,
        perMonth: true,
        label: "₹3,000/month (for hostellers)",
        perAnnum: 36000,
      },
      booksAllowance: {
        amount: 5000,
        perAnnum: true,
        label: "Books & Stationery Allowance",
      },
      computerGrant: {
        amount: 45000,
        oneTime: true,
        label: "Laptop/Computer & Accessories (one-time)",
      },
    },

    // Duration
    duration: {
      label:
        "Entire course duration (subject to passing annual exams and good conduct)",
      examples: {
        btech: "4 years",
        mbbs: "5.5 years",
        integratedLaw: "5 years",
        mba: "2 years",
        mtech: "2 years",
      },
    },

    // Slots
    slots: {
      total: 1000,
      pvtg: "Priority in merit selection",
    },

    // Required Documents
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate (family income ≤ ₹6 Lakh)",
      "Bonafide Student Certificate from Institution",
      "Admission Allotment Letter / Entrance Rank Card",
      "Fee Structure & Fee Payment Receipts",
      "Qualifying Examination Marksheet (Class 12th or Graduation)",
      "Aadhaar-seeded Bank Passbook / Cancelled Cheque",
      "Aadhaar Card",
      "Recent Passport-size Photograph",
      "Disability Certificate (if applicable)",
    ],

    renewalRequired: true,
  },
};

/**
 * Get scheme config by type
 * @param {string} schemeType - "NFST" | "NOS" | "TCE"
 * @returns {object} scheme configuration
 */
export const getSchemeConfig = (schemeType) => {
  return SCHEME_CONFIGS[schemeType] || null;
};

/**
 * Get all scheme types as options for dropdowns
 * @returns {Array} [{ value, label }]
 */
export const getSchemeOptions = () => {
  return Object.values(SCHEME_CONFIGS).map((scheme) => ({
    value: scheme.id,
    label: scheme.name,
    shortName: scheme.shortName,
  }));
};

/**
 * Check basic eligibility for a scheme
 * @param {string} schemeType
 * @param {object} applicantData - { annualIncome, age, courseLevel }
 * @returns {object} { eligible, checks: [{ rule, passed, message }] }
 */
export const checkBasicEligibility = (schemeType, applicantData) => {
  const scheme = SCHEME_CONFIGS[schemeType];
  if (!scheme) return { eligible: false, checks: [{ rule: "scheme", passed: false, message: "Unknown scheme" }] };

  const checks = [];

  // Income check
  if (scheme.eligibility.incomeLimit) {
    const incomeOk =
      applicantData.annualIncome <= scheme.eligibility.incomeLimit;
    checks.push({
      rule: "Income Limit",
      passed: incomeOk,
      message: incomeOk
        ? `Family income ₹${applicantData.annualIncome.toLocaleString()} is within limit of ${scheme.eligibility.incomeLimitLabel}`
        : `Family income ₹${applicantData.annualIncome.toLocaleString()} exceeds limit of ${scheme.eligibility.incomeLimitLabel}`,
    });
  } else {
    checks.push({
      rule: "Income Limit",
      passed: true,
      message: "No income limit for this scheme",
    });
  }

  // Age check
  if (scheme.eligibility.ageLimit) {
    const maxAge =
      typeof scheme.eligibility.ageLimit.max === "number"
        ? scheme.eligibility.ageLimit.max
        : scheme.eligibility.ageLimit.phd?.max || 36;
    const ageOk = applicantData.age <= maxAge;
    checks.push({
      rule: "Age Limit",
      passed: ageOk,
      message: ageOk
        ? `Age ${applicantData.age} is within maximum of ${maxAge} years`
        : `Age ${applicantData.age} exceeds maximum of ${maxAge} years`,
    });
  } else {
    checks.push({
      rule: "Age Limit",
      passed: true,
      message: "No age limit for this scheme",
    });
  }

  // Course level check
  if (
    scheme.eligibility.courseLevels &&
    applicantData.courseLevel
  ) {
    const courseLevelOk = scheme.eligibility.courseLevels.some(
      (level) =>
        level.toLowerCase().includes(applicantData.courseLevel.toLowerCase()) ||
        applicantData.courseLevel.toLowerCase().includes(level.toLowerCase())
    );
    checks.push({
      rule: "Course Level",
      passed: courseLevelOk,
      message: courseLevelOk
        ? `"${applicantData.courseLevel}" is eligible under this scheme`
        : `"${applicantData.courseLevel}" is not eligible. Eligible levels: ${scheme.eligibility.courseLevels.join(", ")}`,
    });
  }

  // Marks check
  if (scheme.eligibility.minimumMarks && applicantData.previousMarksPercentage) {
    const marksOk =
      applicantData.previousMarksPercentage >= scheme.eligibility.minimumMarks;
    checks.push({
      rule: "Minimum Marks",
      passed: marksOk,
      message: marksOk
        ? `Marks ${applicantData.previousMarksPercentage}% meet minimum ${scheme.eligibility.minimumMarks}%`
        : `Marks ${applicantData.previousMarksPercentage}% below minimum ${scheme.eligibility.minimumMarks}%`,
    });
  }

  const eligible = checks.every((c) => c.passed);
  return { eligible, checks };
};
