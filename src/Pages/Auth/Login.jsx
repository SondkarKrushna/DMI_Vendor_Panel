import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import { useLoginVendorMutation } from '../../redux/api/authapi';
import { toast } from 'react-toastify';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(''); // ✅ changed
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [loginVendor, { isLoading, error }] = useLoginVendorMutation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginVendor({
        identifier,
        password
      }).unwrap();

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user?.role);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Login successful!");
      navigate('/dashboard');

    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.data?.message || "Login failed");
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

            {/* IDENTIFIER FIELD (UI SAME, ONLY LOGIC CHANGED) */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"   // ✅ changed from number/email
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#7E1080] outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#7E1080] outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7E1080] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {isLoading ? <PulseLoader size={8} color="#fff" /> : "Sign In"}
            </button>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm">
                {error?.data?.message || error?.error || "Login failed"}
              </p>
            )}

          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7E1080] font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;