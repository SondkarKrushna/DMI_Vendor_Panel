import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import { useLoginVendorMutation } from '../../redux/api/authapi';
import { toast } from 'react-toastify';



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = "Login | DMI Vendor Panel";
  }, []);

  // Local state for validation errors
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const [loginVendor, { isLoading }] = useLoginVendorMutation();

  // Validation Logic

  const validate = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/; // Adjust regex based on your country requirements

    if (!identifier) {
      errors.identifier = "Mobile number is required";
    } else if (!phoneRegex.test(identifier)) {
      errors.identifier = "Please enter a valid 10-digit mobile number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Client-side Validation
    const errorMsg = validate();

    if (errorMsg !== true) {
      message.error(errorMsg || "Please fill all the details");
      return;
    }
    try {
      // 2. API Call
      const res = await loginVendor({
        identifier,
        password,
        role: "vendor"
      }).unwrap();

      // 3. Success Handling
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user?.role);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success(res.message || "Login successful!");
      navigate('/dashboard');



    } catch (err) {
      // 4. API Error Handling
      console.error("Login failed:", err);

      // Capturing the error message from API response
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
                  onChange={(e) => {
                    // 1. Remove non-numeric characters
                    const val = e.target.value.replace(/\D/g, '');

                    // 2. Limit input to exactly 10 digits
                    if (val.length <= 10) {
                      setIdentifier(val);
                    }

                    // 3. Clear error message when user starts typing again
                    if (formErrors.identifier) {
                      setFormErrors({ ...formErrors, identifier: "" });
                    }
                  }}
                  // Optional: Add blur validation to check length when user leaves the field
                  onBlur={() => {
                    if (identifier.length > 0 && identifier.length < 10) {
                      setFormErrors({ ...formErrors, identifier: "Mobile number must be exactly 10 digits" });
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border transition-all rounded-2xl outline-none ${formErrors.identifier
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-[#7E1080]'
                    }`}
                  placeholder="Enter 10-digit number"
                />

                {/* Success indicator when exactly 10 digits are entered */}
                {identifier.length === 10 && !formErrors.identifier && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">
                    ✓ Valid
                  </span>
                )}
              </div>

              {/* Validation Message Display */}
              {formErrors.identifier && (
                <p className="text-red-500 text-xs mt-1 ml-2 font-medium animate-pulse">
                  {formErrors.identifier}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.password ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${formErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-[#7E1080]'} rounded-2xl outline-none transition-all`}
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1 ml-2">{formErrors.password}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7E1080] hover:bg-[#630d64] transition-colors text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <PulseLoader size={8} color="#fff" /> : (
                <>
                  Sign In <ArrowRight size={18} />
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