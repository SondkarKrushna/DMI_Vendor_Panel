import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Phone } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import { useSendOtpMutation, useVerifyOtpMutation } from '../../redux/api/authapi';
import { toast } from 'react-toastify';



const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    document.title = "Login | DMI Vendor Panel";
  }, []);

  // Local state for validation errors
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const isLoading = isSendingOtp || isVerifyingOtp;

  // Validation Logic
  const validateMobile = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/;

    if (!identifier) {
      errors.identifier = "Mobile number is required";
    } else if (!phoneRegex.test(identifier)) {
      errors.identifier = "Please enter a valid 10-digit mobile number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    const errors = {};
    if (!otp) {
      errors.otp = "OTP is required";
    } else if (otp.length < 4) {
      errors.otp = "OTP must be at least 4 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateMobile()) return;

    try {
      const res = await sendOtp({
        mobile: identifier,
        role: "vendor"
      }).unwrap();

      toast.success(res.message || "OTP sent successfully!");
      setIsOtpSent(true);
      setFormErrors({});
    } catch (err) {
      console.error("Failed to send OTP:", err);
      const errorMessage = err?.data?.message || err?.error || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isOtpSent) {
      handleSendOtp();
      return;
    }

    if (!validateMobile() || !validateOtp()) return;

    try {
      // 2. API Call
      const res = await verifyOtp({
        mobile: identifier,
        otp: otp,
        role: "vendor"
      }).unwrap();

      // 3. Success Handling
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user?.role || "vendor");
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success(res.message || "Login successful!");
      navigate('/dashboard');

    } catch (err) {
      // 4. API Error Handling
      console.error("Login failed:", err);
      const errorMessage = err?.data?.message || err?.error || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-['DM_Sans']">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side */}
        <div
          className="md:w-1/2 p-8 flex flex-col justify-center items-center text-white"
          style={{ background: "linear-gradient(to right, #7E1080, #1A031A)" }}
        >
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold mb-4">DMI Vendor</h2>
            <p className="text-lg opacity-90">Manage your business with ease and efficiency.</p>
          </div>
          <div className="hidden md:flex items-center justify-center w-full">
            <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
              <Lock size={100} strokeWidth={1} className="text-white/80" />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* IDENTIFIER FIELD */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.identifier ? 'text-red-500' : 'text-gray-400'
                    }`}
                  size={20}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={identifier}
                  disabled={isOtpSent}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setIdentifier(val);
                    }
                    if (formErrors.identifier) {
                      setFormErrors({ ...formErrors, identifier: "" });
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border transition-all rounded-2xl outline-none ${formErrors.identifier
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-[#7E1080]'
                    } ${isOtpSent ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Enter 10-digit number"
                />

                {identifier.length === 10 && !formErrors.identifier && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">
                    ✓ Valid
                  </span>
                )}
              </div>

              {formErrors.identifier && (
                <p className="text-red-500 text-xs mt-1 ml-2 font-medium">
                  {formErrors.identifier}
                </p>
              )}
            </div>

            {/* OTP FIELD */}
            {isOtpSent && (
              <div className="group animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp('');
                    }}
                    className="text-xs text-[#7E1080] font-bold hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.otp ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) {
                        setOtp(val);
                      }
                      if (formErrors.otp) setFormErrors({ ...formErrors, otp: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${formErrors.otp ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-[#7E1080]'} rounded-2xl outline-none transition-all`}
                    placeholder="Enter OTP"
                  />
                </div>
                {formErrors.otp && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.otp}</p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7E1080] hover:bg-[#630d64] transition-colors text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <PulseLoader size={8} color="#fff" /> : (
                <>
                  {isOtpSent ? "Verify & Sign In" : "Send OTP"} <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {/* <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7E1080] font-bold hover:underline">
              Sign up for free
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;