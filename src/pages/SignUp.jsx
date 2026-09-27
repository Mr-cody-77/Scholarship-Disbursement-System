import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import app from "../Firebase";

const auth = getAuth(app);
const database = getDatabase(app);

const ScholarshipSignup = () => {
  // Personal Information State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);
  const [gender, setGender] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [role] = useState("student");

  // Resend OTP countdown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Address State
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Authentication State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Additional Information State
  const [income, setIncome] = useState("");
  const [collegeInfo, setCollegeInfo] = useState({
    institutionName: "",
    course: "",
    cgpa: "",
  });

  // Terms and Conditions
  const [agreeTerms, setAgreeTerms] = useState(false);

  const navigate = useNavigate();

  // Cooldown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Age Calculation Function
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  // Date of Birth Change Handler
  const handleDobChange = (e) => {
    const selectedDate = e.target.value;
    setDob(selectedDate);
    const calculatedAge = calculateAge(selectedDate);
    setAge(calculatedAge);
  };

  // Strict Form Validation
  const validateForm = () => {
    // 1. Full Name Validation
    if (!fullName || fullName.trim().length < 3) {
      toast.error("Please enter your full legal name (minimum 3 characters)");
      return false;
    }

    // 2. Gender Validation
    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }

    // 3. Date of Birth & Age Validation
    if (!dob) {
      toast.error("Please select your date of birth");
      return false;
    }
    if (age !== null && age < 16) {
      toast.error("You must be at least 16 years old to register for ST Scholarships");
      return false;
    }

    // 4. Strict Email Format Validation
    if (!email || !email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address (e.g. applicant@domain.com)");
      return false;
    }

    // 5. Strict 10-digit Indian Mobile Number Validation
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Mobile number must start with 6, 7, 8, or 9 (standard Indian mobile format)");
      return false;
    }

    // 6. Password Validation
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    // 7. Terms & Conditions
    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Conditions to proceed");
      return false;
    }

    return true;
  };

  // Generate & Dispatch OTP
  const handleGenerateOTP = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);

      const cleanPhone = phoneNumber.replace(/\D/g, "").slice(0, 10);
      const formattedPhone = `+91${cleanPhone}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5007"}/generate-otp-reg`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            phoneNumber: formattedPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate OTP");
      }

      const alertMsg = data.message || "OTP sent successfully to your email!";
      setSuccessMessage(alertMsg);
      toast.success(alertMsg);
      setResendCooldown(60);
      setStep(2); // Advance to OTP entry step
    } catch (err) {
      console.error("Error during OTP generation:", err.message);
      toast.error(err.message || "Failed to generate OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Helper
  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP received on your email");
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5007"}/verify-otp-reg`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP code. Please check and try again.");
      }
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();

    const isVerified = await handleVerifyOTP();
    if (!isVerified) {
      return;
    }

    try {
      setLoading(true);
      const cleanPhone = phoneNumber.replace(/\D/g, "").slice(0, 10);
      const normalizedEmail = email.trim().toLowerCase();

      // Step 1: Create user with email & password (Firebase Authentication)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const user = userCredential.user;

      // Step 2: Store additional user profile in Realtime DB
      await set(ref(database, "users/" + user.uid), {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: cleanPhone,
        dob,
        age: age || calculateAge(dob),
        gender,
        address,
        income,
        collegeInfo,
        createdAt: new Date().toISOString(),
        role: "student",
        phoneVerified: true,
      });

      toast.success("Registration successful! Welcome to MoTA Scholarship Portal.");
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentEmail", normalizedEmail);
      localStorage.setItem("phoneVerified", "true");
      localStorage.setItem("phoneNumber", cleanPhone);

      setTimeout(() => {
        navigate("/home", { state: { uid: user.uid, role: "student" } });
      }, 1500);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please log in or use a different email.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use at least 8 characters.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address format.");
      } else {
        console.error("Firebase signup error:", error.message);
        toast.error("Signup failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setDob("");
    setAge(null);
    setGender("");
    setAddress({ street: "", city: "", state: "", zipCode: "" });
    setPassword("");
    setConfirmPassword("");
    setIncome("");
    setCollegeInfo({ institutionName: "", course: "", cgpa: "" });
    setAgreeTerms(false);
    setOtp("");
    setStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100">
        {/* Back to Home Link */}
        <div className="mb-6 flex items-center justify-between pb-3 border-b border-gray-100">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] text-gray-400 font-medium">
            Candidate Registration Portal
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Ministry of Tribal Affairs
          </h1>
          <p className="text-sm font-medium text-emerald-700">
            ST Scholarship & Fellowship Portal Registration
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            National Fellowship (NFST) • Overseas Scholarship (NOS) • Top Class (TCE)
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 1 ? 'text-emerald-700' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${step === 1 ? 'bg-emerald-600' : 'bg-gray-300'}`}>
              1
            </span>
            Applicant Profile
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 2 ? 'text-emerald-700' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${step === 2 ? 'bg-emerald-600' : 'bg-gray-300'}`}>
              2
            </span>
            OTP Verification
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {step === 1 && (
            <>
              {/* Personal Information Section */}
              <div className="border-b pb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="mr-2 text-emerald-600 w-5 h-5" /> Personal Details
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="As per ST / Aadhaar Certificate"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={handleDobChange}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Calculated Age
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {age !== null ? `${age} years` : "Select Date of Birth"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-b pb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Mail className="mr-2 text-emerald-600 w-5 h-5" /> Contact Information
                  <span className="text-red-500 ml-1">*</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Email Address (for OTP & updates) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="applicant@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Verification OTP will be sent to this email.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Mobile Number (10 digits) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-gray-500 text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneNumber(val);
                        }}
                        className="w-full pl-12 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {phoneNumber.length}/10 digits entered
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-b pb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-emerald-600 w-5 h-5" /> Permanent Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street / Village / Locality"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City / District"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State / UT"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    maxLength={6}
                    value={address.zipCode}
                    onChange={(e) =>
                      setAddress({ ...address, zipCode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* College and Income Information */}
              <div className="border-b pb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Educational & Income Background (Optional at Registration)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="College / Institute Name"
                    value={collegeInfo.institutionName}
                    onChange={(e) =>
                      setCollegeInfo({
                        ...collegeInfo,
                        institutionName: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Degree / Course"
                    value={collegeInfo.course}
                    onChange={(e) =>
                      setCollegeInfo({ ...collegeInfo, course: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="CGPA / Percentage"
                    value={collegeInfo.cgpa}
                    onChange={(e) =>
                      setCollegeInfo({ ...collegeInfo, cgpa: e.target.value })
                    }
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Annual Family Income (in ₹ INR)"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full p-3 mt-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              {/* Authentication Section */}
              <div className="border-b pb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Lock className="mr-2 text-emerald-600 w-5 h-5" /> Account Password
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="password"
                      placeholder="Password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  className="mt-1 mr-3 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                  I hereby declare that all information provided above is true and correct to the best of my knowledge. I understand that false or misleading details will lead to immediate cancellation of scholarship entitlement as per Ministry of Tribal Affairs guidelines.
                </label>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification Section */}
          {step === 2 && (
            <div className="py-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center max-w-lg mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Enter Verification OTP
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  A 6-digit verification code has been dispatched to:
                </p>
                <div className="font-semibold text-emerald-800 bg-white inline-block px-4 py-1 rounded-full border border-emerald-200 text-sm mb-4">
                  {email}
                </div>

                <div className="my-6">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full max-w-xs text-center text-3xl font-mono tracking-widest p-3 rounded-lg border-2 border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none font-bold text-gray-800 bg-white"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Code expires in 10 minutes. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={handleGenerateOTP}
                    disabled={resendCooldown > 0 || loading}
                    className={`flex items-center text-xs font-semibold ${
                      resendCooldown > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-emerald-700 hover:text-emerald-800 underline"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {step === 1 && (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerateOTP}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="mr-2 w-5 h-5" /> Generate & Send OTP
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center"
                >
                  <XCircle className="mr-2 w-4 h-4" /> Reset
                </button>
              </>
            )}

            {step === 2 && (
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 w-5 h-5" /> Verify OTP & Create Account
                  </span>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Existing Account Footer */}
        <div className="mt-8 text-center border-t pt-4">
          <p className="text-sm text-gray-600">
            Already registered on the MoTA Scholarship Portal?{" "}
            <Link
              to="/login"
              className="text-emerald-700 font-bold hover:underline"
            >
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipSignup;