import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";

import {
  Users,
  Repeat,
  IndianRupee,
  Clock,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  ArrowDownToLine,
} from "lucide-react";

const Affilation = () => {
  const referralLink = "https://vendorDMI.com/ref/vEN2026001";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="p-1 sm:p-2 space-y-5 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Affiliation Program</h1>
            <p className="text-sm text-gray-500">Earn Rewards By Referring New Vendors</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Referrals" amount="7" percentage={42} statusText="Increased by last month" icon={Users} />
          <Card title="Conversions" amount="5" percentage={-30} statusText="Decreased by last month" isDecrease icon={Repeat} />
          <Card title="Total Earnings" amount="400" percentage={42} statusText="Increased by last month" icon={IndianRupee} />
          <Card title="Pending Conversions" amount="1" percentage={42} statusText="Increased by last month" icon={Clock} />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* Referral Tools */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-4">

            <h2 className="font-semibold">Your Referral Tools</h2>

            {/* QR Box */}
            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-purple-600 rounded-md flex items-center justify-center text-purple-600 font-bold">
                QR
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              Scan To Refer Vendors
            </p>

            {/* Link */}
            <div>
              <p className="text-sm font-medium mb-2">Your Referral Link</p>

              <div className="flex gap-2">
                <input
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-sm outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-b from-[#7E1080] to-[#1A031A]  text-white text-sm"
                >
                  <Copy size={14} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-3">

              {/* Email */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm">
                <Share2 size={14} className="text-purple-600" />
                Email
              </button>

              {/* WhatsApp */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm">
                <Share2 size={14} className="text-green-500" />
                WhatsApp
              </button>

              {/* SMS */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm">
                <Share2 size={14} className="text-pink-500" />
                SMS
              </button>

            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-5">

            {/* How it works */}
            <div className="bg-white border border-gray-300 rounded-2xl p-5 shadow-md space-y-4">
              <h2 className="font-semibold">How It Works ?</h2>

              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {step === 1 && "Share Your Link"}
                      {step === 2 && "They Sign Up"}
                      {step === 3 && "Earn Rewards"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {step === 1 && "Share your unique referral link with vendors"}
                      {step === 2 && "New vendors register using your link"}
                      {step === 3 && "Get reward after successful approval"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reward Structure */}
            <div className="bg-yellow-50 border border-yellow-500 rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold">Reward Structure</h2>

              <div className="flex justify-between text-sm">
                <span>Per Successful Referral</span>
                <span className="text-green-600 font-medium">+10 Points</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Bonus (10+ Referrals/Month)</span>
                <span className="text-green-600 font-medium">+$500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Referrals */}
        <div className="bg-white border border-gray-300 rounded-2xl p-5 shadow-md">
          <h2 className="font-semibold mb-4">My Referrals (03)</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border border-gray-200 border-l-4 border-l-amber-500 rounded-xl p-4">
                <p className="font-medium">Amit Sharma</p>
                <p className="text-xs text-gray-500">25 December 2026</p>
                <p className="text-sm mt-2 font-semibold text-right">
                  20 Points
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Affilation;