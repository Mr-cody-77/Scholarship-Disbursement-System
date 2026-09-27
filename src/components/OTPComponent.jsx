import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OTPComponent = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleGenerateOTP = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5007"}/generate-otp-reg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate OTP");
      }

      setSuccessMessage("OTP sent successfully to your email");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5007"}/verify-otp-reg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      setKycKey(data.kycKey);
      setSuccessMessage("OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      await handleGenerateOTP(email);
      toast.success("OTP has been sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to generate OTP.");
      toast.error(err.message || "Failed to generate OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      await handleVerifyOTP(email, otp);
      toast.success("OTP verified successfully.");
      setStep(3); // Proceed to the next step after verification
    } catch (err) {
      setError(err.message || "Failed to verify OTP.");
      toast.error(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">OTP Verification</h1>

        {step === 1 && (
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300"
              required
            />
            <button
              onClick={handleGenerate}
              className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Generate OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <input
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300"
              required
            />
            <button
              onClick={handleVerify}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-4">OTP Verified!</h2>
            <p className="text-gray-600">You may proceed to the next step.</p>
          </div>
        )}

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default OTPComponent;
