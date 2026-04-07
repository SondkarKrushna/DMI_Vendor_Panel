import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import { useRegisterVendorMutation } from '../../redux/api/authapi';
import { toast } from 'react-toastify';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: ''
  });

  const navigate = useNavigate();

  // ✅ RTK Mutation
  const [registerVendor, { isLoading }] = useRegisterVendorMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.mobile.length !== 10) {
      toast.warning('Mobile number must be 10 digits');
      return;
    }

    try {
      const payload = {
        ...formData,
        role: "vendor" // ✅ static role
      };

      await registerVendor(payload).unwrap();

      toast.success('Registration successful!');
      navigate('/login');

    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Registration failed');
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
            <h2 className="text-4xl font-bold mb-4">Join Us</h2>
            <p className="text-lg opacity-90">
              Start managing your business more effectively today.
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center w-full">
            <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
              <User size={100} className="text-white/80" />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 p-8 md:p-12">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-500">
              Please fill in the details below.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-12 py-3.5 border rounded-2xl"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 py-3.5 border rounded-2xl"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border rounded-2xl"
                placeholder="9876543210"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 border rounded-2xl"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7E1080] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <PulseLoader size={10} color="#fff" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7E1080] font-bold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;