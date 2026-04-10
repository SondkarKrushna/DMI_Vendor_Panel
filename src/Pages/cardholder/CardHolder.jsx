import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/buttons/Button";
import cardDesign from "../../../public/images/card-design.png";
import logo from "../../../public/logo.png";
import { ArrowDownToLine, Search as SearchIcon, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import DMIPremiumCard from '../../components/DMIPremiumCard';
import { useLazySearchCardHolderQuery, useCreatePunchMutation } from "../../redux/api/punchApi";
import { useGetActiveServicesQuery } from "../../redux/api/servicesApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CardHolder = () => {
  const [activeTab, setActiveTab] = useState("Punch");
  const [chfQuery, setChfQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [cardData, setCardData] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Punch Form State
  const [punchForm, setPunchForm] = useState({
    serviceId: "",
    date: new Date().toISOString().split('T')[0],
    billAmount: "",
    discount: "",
  });

  // API Hooks
  const [searchCard, { isFetching: isSearching }] = useLazySearchCardHolderQuery();
  const navigate = useNavigate();
  const { data: servicesResponse } = useGetActiveServicesQuery();

  const services = servicesResponse?.data || [];

  // Derived: Final Amount Calculation
  const finalAmount = useMemo(() => {
    const bill = parseFloat(punchForm.billAmount) || 0;
    const disc = parseFloat(punchForm.discount) || 0;
    return bill - (bill * disc / 100);
  }, [punchForm.billAmount, punchForm.discount]);

  const selectedService = services.find(s => s._id === punchForm.serviceId);

  const exportToExcel = () => {
    if (!cardData) { toast.error("No cardholder data to export"); return; }
    const header = [["Full Name", "Card Type", "CHF No", "Service", "Bill Amount", "Discount", "Final Amount", "Date"]];
    const rows = [[
      cardData?.userId?.fullName || cardData?.fullName || "—",
      cardData?.cardType || "—",
      cardData?.chfNo || "—",
      selectedService?.serviceName || "—",
      punchForm.billAmount || "—",
      `${punchForm.discount || 0}%`,
      finalAmount.toFixed(2),
      punchForm.date,
    ]];
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CardholderPunch");
    XLSX.writeFile(wb, "CardholderPunch_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!cardData) { toast.error("No cardholder data to export"); return; }
    const doc = new jsPDF();
    doc.text("Cardholder Punch Details", 14, 10);
    autoTable(doc, {
      head: [["Full Name", "Card Type", "CHF No", "Service", "Bill Amount", "Discount", "Final Amount", "Date"]],
      body: [[
        cardData?.userId?.fullName || cardData?.fullName || "—",
        cardData?.cardType || "—",
        cardData?.chfNo || "—",
        selectedService?.serviceName || "—",
        punchForm.billAmount || "—",
        `${punchForm.discount || 0}%`,
        `$${finalAmount.toFixed(2)}`,
        punchForm.date,
      ]],
      startY: 20,
    });
    doc.save("cardholder_punch.pdf");
  };

  // Handlers
  const handleSearch = async () => {
    const query = chfQuery.trim() || mobileQuery.trim();
    if (!query) return toast.error("Please enter a CHF Number or Mobile");
    try {
      const res = await searchCard(query).unwrap();
      // Support multiple response shapes from the API
      const data = res?.data || res?.card || res?.enrollment || res;
      if (data && (data._id || data.userId)) {
        setCardData(data);
        toast.success("Cardholder found!");
      } else {
        toast.error("Cardholder not found");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Cardholder not found");
      setCardData(null);
    }
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleProcessPunch = async () => {
    if (!cardData) return toast.error("Please search and select a cardholder first");
    if (!punchForm.serviceId) return toast.error("Please select a service");
    if (!punchForm.billAmount) return toast.error("Please enter bill amount");
    if (parseFloat(punchForm.billAmount) <= 0) return toast.error("Bill amount must be greater than 0");

    // Navigate to the dedicated payment checkout screen
    navigate("/payment-checkout", {
      state: {
        punchPayload: {
          cardType: cardData.cardType || "",
          chfNo: cardData.chfNo || "",
          fullName: cardData.userId?.fullName || cardData.fullName || "",
          mobile: cardData.userId?.mobile || cardData.mobile || "",
          email: cardData.userId?.email || cardData.email || "",
          serviceId: punchForm.serviceId,
          billAmount: punchForm.billAmount,
          discount: punchForm.discount,
          finalAmount: finalAmount.toFixed(2),
          paymentMethod: "online",
          date: punchForm.date,
        },
        cardData,
        serviceName: selectedService?.serviceName || "",
        finalAmount: finalAmount.toFixed(2),
      },
    });
  };

  // Auto-fill form when service is selected
  const handleServiceChange = (serviceId) => {
    const svc = services.find(s => s._id === serviceId);
    setPunchForm(prev => ({
      ...prev,
      serviceId,
      billAmount: svc?.price ? String(svc.price) : prev.billAmount,
      discount: svc?.discountRate !== undefined ? String(svc.discountRate) : prev.discount,
    }));
  };

  return (
    <Layout>
      <div className="p-1 sm:p-2 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Cardholder Punch</h1>
            <p className="text-sm text-gray-500">Process Service Punches For Cardholders</p>
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

        {/* Search & Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Search Cardholder */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Search Cardholder
            </h2>

            <div className="flex flex-col sm:flex-row items-end gap-4 mb-6">
              {(chfQuery || !mobileQuery) && (
                <div className="flex-1 w-full relative">
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    CHF Number
                  </label>
                  <input
                    type="text"
                    placeholder="Search by CHF"
                    value={chfQuery}
                    onChange={(e) => setChfQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {chfQuery && (
                    <button
                      onClick={() => setChfQuery("")}
                      className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {!chfQuery && !mobileQuery && (
                <div className="flex items-center justify-center py-3 text-gray-400 font-bold px-2">
                  OR
                </div>
              )}

              {(mobileQuery || !chfQuery) && (
                <div className="flex-1 w-full relative">
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Search by Mobile"
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {mobileQuery && (
                    <button
                      onClick={() => setMobileQuery("")}
                      className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-[#581c56] hover:bg-[#4a1848] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-md disabled:opacity-70"
              >
                {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : <SearchIcon size={20} />}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="flex items-center justify-center h-full">
            <DMIPremiumCard
              cardAType={cardData?.cardType || "Premium"}
              cardNumber={cardData?.chfNo || "4545 1456 6766 7871"}
              cardName={(cardData?.userId?.fullName || "John Doe").toUpperCase()}
              validThru={
                cardData?.expiryDate
                  ? new Date(cardData.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " - ")
                  : "20 - 02 - 2026"
              }
              membershipDate={
                cardData?.issueDate || cardData?.createdAt
                  ? new Date(cardData.issueDate || cardData.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "12-09-2026"
              }
            />
          </div>

        </div>

        {/* Punch Details Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Punch Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Select Service
              </label>
              <select
                value={punchForm.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Select</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.serviceName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Date
              </label>
              <input
                type="date"
                value={punchForm.date}
                onChange={(e) => setPunchForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Bill Amount
              </label>
              <input
                type="text"
                placeholder="Enter"
                value={punchForm.billAmount}
                onChange={(e) => setPunchForm(prev => ({ ...prev, billAmount: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Discount
              </label>
              <input
                type="text"
                placeholder="E.g 10%"
                value={punchForm.discount}
                onChange={(e) => setPunchForm(prev => ({ ...prev, discount: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          {/* Punch Summary */}
          <div className="bg-[#FFFDF4] rounded-2xl p-6 border border-[#FEF3C7] mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">
              Punch Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{selectedService?.serviceName || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bill Amount</span>
                <span className="font-semibold">${parseFloat(punchForm.billAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold">{punchForm.discount || "0"}%</span>
              </div>
              <div className="pt-3 border-t border-[#FEF3C7] flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-gray-800">
                  Final Amount
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleProcessPunch}
              disabled={!cardData || !punchForm.serviceId || !punchForm.billAmount}
              className="bg-[#581c56] hover:bg-[#4a1848] text-white px-10 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardHolder;
