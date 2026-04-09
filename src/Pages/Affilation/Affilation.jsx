import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import { useGetAffiliationDashboardQuery } from "../../redux/api/affiliationApi";
import { QRCode } from "react-qr-code";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

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
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const Affilation = () => {
  const { data: apiData, isFetching } = useGetAffiliationDashboardQuery();
//console.log("Affiliation Dashboard Data:", apiData);
  const affiliationStats = useMemo(() => {
    if (!apiData?.stats) return [];
    return [
      {
        title: "Total Referrals",
        value: apiData.stats.totalReferrals,
        percent: "0%",
        trend: "neutral",
        subText: "No daily comparison available",
      },
      {
        title: "Conversions",
        value: apiData.stats.conversions,
        percent: "0%",
        trend: "neutral",
        subText: "No daily comparison available",
      },
      {
        title: "Total Earnings",
        value: apiData.stats.totalEarnings,
        formatted: `₹${apiData.stats.totalEarnings}`,
        percent: "0%",
        trend: "neutral",
        subText: "No daily comparison available",
      },
      {
        title: "Pending Conversions",
        value: apiData.stats.pendingConversions,
        percent: "0%",
        trend: "neutral",
        subText: "No daily comparison available",
      },
    ];
  }, [apiData]);

  const referrals = useMemo(() => {
    if (!apiData?.data) return [];
    return apiData.data;
  }, [apiData]);

  const referralLink = apiData?.referralLink || "https://vendorDMI.com/ref/vEN2026001";
  const [copied, setCopied] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportToExcel = () => {
    if (!referrals.length) { toast.error("No referral data to export"); return; }
    const header = [["Referred User", "Referral Date", "Points Awarded", "Status"]];
    const rows = referrals.map((r) => [
      r.referredUser?.fullName || "Unknown",
      r.referralDate ? new Date(r.referralDate).toLocaleDateString() : "—",
      r.pointsAwarded || 0,
      r.status || "Pending",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 26 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Referrals");
    XLSX.writeFile(wb, "Affiliation_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!referrals.length) { toast.error("No referral data to export"); return; }
    const doc = new jsPDF();
    doc.text("Affiliation - My Referrals", 14, 10);
    autoTable(doc, {
      head: [["Referred User", "Referral Date", "Points Awarded", "Status"]],
      body: referrals.map((r) => [
        r.referredUser?.fullName || "Unknown",
        r.referralDate ? new Date(r.referralDate).toLocaleDateString() : "—",
        r.pointsAwarded || 0,
        r.status || "Pending",
      ]),
      startY: 20,
    });
    doc.save("affiliation_referrals.pdf");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = "Join Vendor DMI - Earn Rewards!";
    const body = `Hi,\n\nI'd like to invite you to join Vendor DMI. Use my referral link to sign up and earn rewards!\n\nReferral Link: ${referralLink}\n\nBest regards,\nYour Friend`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleShareWhatsApp = () => {
    const message = `Hi! Join Vendor DMI and earn rewards. Use my referral link: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareSMS = () => {
    const message = `Join Vendor DMI and earn rewards! Referral link: ${referralLink}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  const downloadQRCode = () => {
    const svg = document.querySelector("#affiliation-qr svg");
    if (!svg) return toast.error("QR Code not found");

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Referral_QR_Code.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success("QR Code downloaded!");
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
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
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(prev => !prev)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
                Export
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => { exportToExcel(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => { exportToPDF(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileText size={16} className="text-red-500" />
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {affiliationStats.length > 0 ? (
            affiliationStats.map((stat, index) => (
              <Card
                key={index}
                title={stat.title}
                amount={stat.formatted || stat.value.toString()}
                percentage={parseFloat(stat.percent) || 0}
                statusText={stat.subText || `${stat.trend} from last month`}
                isDecrease={stat.trend === 'down'}
                icon={index === 0 ? Users : index === 1 ? Repeat : index === 2 ? IndianRupee : Clock}
              />
            ))
          ) : (
            <>
              <Card title="Total Referrals" amount="7" percentage={42} statusText="Increased by last month" icon={Users} />
              <Card title="Conversions" amount="5" percentage={-30} statusText="Decreased by last month" isDecrease icon={Repeat} />
              <Card title="Total Earnings" amount="400" percentage={42} statusText="Increased by last month" icon={IndianRupee} />
              <Card title="Pending Conversions" amount="1" percentage={42} statusText="Increased by last month" icon={Clock} />
            </>
          )}
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* Referral Tools */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-4">

            <h2 className="font-semibold">Your Referral Tools</h2>

            {/* QR Box */}
            <div id="affiliation-qr" className="bg-gray-100 rounded-xl h-44 flex flex-col items-center justify-center p-4">
              {referralLink ? (
                <>
                  <QRCode
                    value={referralLink}
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "120px" }}
                    viewBox={`0 0 256 256`}
                  />
                  <button 
                    onClick={downloadQRCode}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                  >
                    <ArrowDownToLine size={12} />
                    Download QR
                  </button>
                </>
              ) : (
                <div className="w-20 h-20 border-4 border-purple-600 rounded-md flex items-center justify-center text-purple-600 font-bold">
                  QR
                </div>
              )}
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
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-linear-to-b from-[#7E1080] to-[#1A031A]  text-white text-sm"
                >
                  <Copy size={14} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-3">

              {/* Email */}
              <button onClick={handleShareEmail} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm hover:bg-gray-200 transition-colors">
                <Share2 size={14} className="text-purple-600" />
                Email
              </button>

              {/* WhatsApp */}
              <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm hover:bg-gray-200 transition-colors">
                <Share2 size={14} className="text-green-500" />
                WhatsApp
              </button>

              {/* SMS */}
              <button onClick={handleShareSMS} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm hover:bg-gray-200 transition-colors">
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
          <h2 className="font-semibold mb-4">My Referrals ({referrals.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {referrals.length > 0 ? (
              referrals.map((referral, index) => (
                <div key={index} className="border border-gray-200 border-l-4 border-l-amber-500 rounded-xl p-4">
                  <p className="font-medium">{referral.referredUser?.fullName || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{new Date(referral.referralDate).toLocaleDateString()}</p>
                  <p className="text-sm mt-2 font-semibold text-right">
                    {referral.pointsAwarded} Points
                  </p>
                </div>
              ))
            ) : (
              [1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-200 border-l-4 border-l-amber-500 rounded-xl p-4">
                  <p className="font-medium">Amit Sharma</p>
                  <p className="text-xs text-gray-500">25 December 2026</p>
                  <p className="text-sm mt-2 font-semibold text-right">
                    20 Points
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Affilation;