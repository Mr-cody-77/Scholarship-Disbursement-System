import React, { useState } from "react";
import { useFirebase } from "../../firebase/FirebaseContext";
import { Plus, Info, CheckCircle, AlertCircle } from "lucide-react";
import {
  SCHEME_CONFIGS,
  getSchemeOptions,
  SCHEME_TYPES,
} from "../../data/schemesData";

const AddScholarshipForm = () => {
  const Firebase = useFirebase();
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSchemeType, setSelectedSchemeType] = useState("");
  const [scholarship, setScholarship] = useState({
    name: "",
    schemeType: "",
    eligibility: "",
    requiredDocuments: [""],
    // New ST-specific fields
    incomeLimit: "",
    ageLimit: "",
    courseLevels: [],
    minimumMarks: "",
    awardSummary: "",
    totalSlots: "",
    pvtgSlots: "",
    femaleSlots: "",
    renewalRequired: false,
    applicationDeadline: "",
    schemePortal: "",
    description: "",
  });

  const predefinedDocuments = [
    "ST Certificate / PVTG Certificate",
    "Income Certificate",
    "Aadhaar Card",
    "Date of Birth Proof (Class 10th Certificate)",
    "Bonafide Student Certificate",
    "Qualifying Examination Marksheet",
    "Admission / Offer Letter",
    "CGPA to Percentage Conversion Certificate",
    "Passport Copy",
    "PAN Card",
    "Bank Passbook / Cancelled Cheque",
    "Recent Passport-size Photograph",
    "Disability Certificate (if applicable)",
    "Fee Structure & Payment Receipts",
    "Research Proposal / SOP",
    "Employer NOC",
  ];

  // When scheme type is selected, auto-fill from official data
  const handleSchemeTypeChange = (schemeType) => {
    setSelectedSchemeType(schemeType);

    if (schemeType && SCHEME_CONFIGS[schemeType]) {
      const config = SCHEME_CONFIGS[schemeType];
      setScholarship({
        name: config.name,
        schemeType: schemeType,
        eligibility: buildEligibilityText(config),
        requiredDocuments: [...config.requiredDocuments],
        incomeLimit: config.eligibility.incomeLimit || "",
        ageLimit: config.eligibility.ageLimit?.max || config.eligibility.ageLimit?.phd?.max || "",
        courseLevels: config.eligibility.courseLevels || [],
        minimumMarks: config.eligibility.minimumMarks || "",
        awardSummary: buildAwardSummary(config),
        totalSlots: config.slots?.total || "",
        pvtgSlots: config.slots?.pvtg || "",
        femaleSlots: config.slots?.female || "",
        renewalRequired: config.renewalRequired || false,
        applicationDeadline: "",
        schemePortal: config.portal || "",
        description: config.description || "",
      });
    } else {
      // Custom scheme — clear form
      setScholarship({
        name: "",
        schemeType: "CUSTOM",
        eligibility: "",
        requiredDocuments: [""],
        incomeLimit: "",
        ageLimit: "",
        courseLevels: [],
        minimumMarks: "",
        awardSummary: "",
        totalSlots: "",
        pvtgSlots: "",
        femaleSlots: "",
        renewalRequired: false,
        applicationDeadline: "",
        schemePortal: "",
        description: "",
      });
    }
  };

  const buildEligibilityText = (config) => {
    const parts = [];
    if (config.eligibility.incomeLimit) {
      parts.push(
        `Family income must not exceed ${config.eligibility.incomeLimitLabel}`
      );
    } else {
      parts.push("No income limit");
    }
    if (config.eligibility.ageLimit) {
      const maxAge = config.eligibility.ageLimit.max || config.eligibility.ageLimit.phd?.max;
      if (maxAge) parts.push(`Maximum age: ${maxAge} years`);
    }
    if (config.eligibility.minimumMarks) {
      parts.push(
        `Minimum ${config.eligibility.minimumMarks}% marks in qualifying exam`
      );
    }
    parts.push(`Category: ${config.eligibility.casteCategory}`);
    parts.push(`Eligible courses: ${config.eligibility.courseLevels.join(", ")}`);
    return parts.join(". ") + ".";
  };

  const buildAwardSummary = (config) => {
    if (config.id === "NFST") {
      return `JRF: ₹${config.award.fellowship.jrf.amount.toLocaleString()}/month (2 years), SRF: ₹${config.award.fellowship.srf.amount.toLocaleString()}/month (3 years). Contingency: ₹10,000-₹25,000/year. HRA as per UGC rules.`;
    }
    if (config.id === "NOS") {
      return `Full tuition at actuals. Maintenance: USD 15,400/year (USA), GBP 9,900/year (UK). Contingency, airfare, visa & insurance covered.`;
    }
    if (config.id === "TCE") {
      return `Tuition: 100% for Govt institutions, up to ₹2.5L/year for Private. Living: ₹3,000/month. Books: ₹5,000/year. Laptop: ₹45,000 one-time.`;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScholarship({
      ...scholarship,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDocumentChange = (index, value) => {
    const updatedDocs = [...scholarship.requiredDocuments];
    updatedDocs[index] = value;
    setScholarship({ ...scholarship, requiredDocuments: updatedDocs });
  };

  const handleCustomDocumentChange = (index, value) => {
    const updatedDocs = [...scholarship.requiredDocuments];
    updatedDocs[index] = value;
    setScholarship({ ...scholarship, requiredDocuments: updatedDocs });
  };

  const addDocumentField = () => {
    setScholarship({
      ...scholarship,
      requiredDocuments: [...scholarship.requiredDocuments, ""],
    });
  };

  const removeDocumentField = (index) => {
    const updatedDocs = scholarship.requiredDocuments.filter(
      (_, i) => i !== index
    );
    setScholarship({ ...scholarship, requiredDocuments: updatedDocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Firebase.createScholarship({
        ...scholarship,
        incomeLimit: scholarship.incomeLimit
          ? Number(scholarship.incomeLimit)
          : null,
        ageLimit: scholarship.ageLimit ? Number(scholarship.ageLimit) : null,
        minimumMarks: scholarship.minimumMarks
          ? Number(scholarship.minimumMarks)
          : null,
        totalSlots: scholarship.totalSlots
          ? Number(scholarship.totalSlots)
          : null,
        pvtgSlots: scholarship.pvtgSlots
          ? Number(scholarship.pvtgSlots)
          : null,
        femaleSlots: scholarship.femaleSlots
          ? Number(scholarship.femaleSlots)
          : null,
      });

      setSuccessMessage(
        `Scholarship "${scholarship.name}" created successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setSelectedSchemeType("");
      setScholarship({
        name: "",
        schemeType: "",
        eligibility: "",
        requiredDocuments: [""],
        incomeLimit: "",
        ageLimit: "",
        courseLevels: [],
        minimumMarks: "",
        awardSummary: "",
        totalSlots: "",
        pvtgSlots: "",
        femaleSlots: "",
        renewalRequired: false,
        applicationDeadline: "",
        schemePortal: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating scholarship:", error);
    }
  };

  const schemeOptions = getSchemeOptions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Add Scholarship / Fellowship Scheme
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Select an official MoTA scheme to auto-fill, or create a custom one
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={20} />
            <span className="text-green-700 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Scheme Type Selector */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-semibold text-blue-800 mb-3">
            <Info className="inline mr-1" size={16} />
            Select Scheme Type (auto-fills official rules)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {schemeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSchemeTypeChange(option.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedSchemeType === option.value
                    ? "border-blue-500 bg-blue-100 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <span className="font-bold text-sm block">
                  {option.shortName}
                </span>
                <span className="text-xs text-gray-600 leading-tight block mt-1">
                  {option.label.replace(
                    `${option.shortName}`,
                    ""
                  ).replace("()", "").replace("  ", " ").trim().replace(/^\(/, "").replace(/\)$/, "")}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleSchemeTypeChange("")}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedSchemeType === ""
                  ? "border-blue-500 bg-blue-100 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <span className="font-bold text-sm block">Custom</span>
              <span className="text-xs text-gray-600 block mt-1">
                Create your own scheme
              </span>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scholarship Name *
            </label>
            <input
              type="text"
              name="name"
              value={scholarship.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              name="applicationDeadline"
              value={scholarship.applicationDeadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={scholarship.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Eligibility */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eligibility Criteria *
          </label>
          <textarea
            name="eligibility"
            value={scholarship.eligibility}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Eligibility Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Income Limit (₹/annum)
            </label>
            <input
              type="number"
              name="incomeLimit"
              value={scholarship.incomeLimit}
              onChange={handleChange}
              placeholder={
                scholarship.schemeType === "NFST" ? "No limit" : "e.g. 600000"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {scholarship.schemeType === "NFST" && (
              <p className="text-xs text-green-600 mt-1">
                ✓ No income limit for NFST
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Age (years)
            </label>
            <input
              type="number"
              name="ageLimit"
              value={scholarship.ageLimit}
              onChange={handleChange}
              placeholder="e.g. 36"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Marks (%)
            </label>
            <input
              type="number"
              name="minimumMarks"
              value={scholarship.minimumMarks}
              onChange={handleChange}
              placeholder="e.g. 55"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Slots (per year)
            </label>
            <input
              type="number"
              name="totalSlots"
              value={scholarship.totalSlots}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PVTG Reserved Slots
            </label>
            <input
              type="number"
              name="pvtgSlots"
              value={scholarship.pvtgSlots}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Female Reserved Slots
            </label>
            <input
              type="number"
              name="femaleSlots"
              value={scholarship.femaleSlots}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Award Summary */}
        {scholarship.awardSummary && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Award Summary (auto-filled from official data)
            </label>
            <p className="text-sm text-green-700">{scholarship.awardSummary}</p>
          </div>
        )}

        {/* Renewal */}
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            name="renewalRequired"
            checked={scholarship.renewalRequired}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
          />
          <label className="text-sm font-medium text-gray-700">
            Annual renewal required
          </label>
        </div>

        {/* Required Documents */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Documents
          </label>
          {scholarship.requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-center mb-2 space-x-2">
              <select
                value={
                  predefinedDocuments.includes(doc) ? doc : doc ? "Other" : ""
                }
                onChange={(e) => {
                  if (e.target.value === "Other") {
                    handleDocumentChange(index, "");
                  } else {
                    handleDocumentChange(index, e.target.value);
                  }
                }}
                className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>
                  Select a document
                </option>
                {predefinedDocuments.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
                <option value="Other">Other (custom)</option>
              </select>

              {!predefinedDocuments.includes(doc) && doc !== "" && (
                <input
                  type="text"
                  placeholder="Custom document name"
                  value={doc}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) =>
                    handleCustomDocumentChange(index, e.target.value)
                  }
                />
              )}

              {scholarship.requiredDocuments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocumentField(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addDocumentField}
            className="mt-2 flex items-center text-indigo-600 hover:text-indigo-900 focus:outline-none"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add another document
          </button>
        </div>

        {/* Scheme Portal Link */}
        {scholarship.schemePortal && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-600">Official Portal: </span>
            <a
              href={scholarship.schemePortal}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {scholarship.schemePortal}
            </a>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 font-semibold text-lg transition-colors"
        >
          Create Scholarship Scheme
        </button>
      </form>
    </div>
  );
};

export default AddScholarshipForm;