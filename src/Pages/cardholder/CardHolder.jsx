import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/buttons/Button";
import { ArrowDownToLine, Search as SearchIcon, FileSpreadsheet, FileText, QrCode, X, CheckCircle2, XCircle } from "lucide-react";
import { PulseLoader } from "react-spinners";
import DMIPremiumCard from '../../components/DMIPremiumCard';
import { useLazySearchCardHolderQuery, useCreatePunchMutation } from "../../redux/api/punchApi";
import { useGetActiveServicesQuery } from "../../redux/api/servicesApi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../components/Model";

const CardHolder = () => {
  const [chfQuery, setChfQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [cardData, setCardData] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Punch type toggle: "self" or "family"
  const [punchFor, setPunchFor] = useState("self");

  // Punch Form State
  const [punchForm, setPunchForm] = useState({
    serviceId: "",
  });

  // Family Member Details State
  const [familyDetails, setFamilyDetails] = useState({
    memberName: "",
    dob: "",
    age: "",
    gender: "",
    std: "",
    currentInstitute: "",
  });

  // QR Code / Payment State
  const [qrData, setQrData] = useState(null); // Holds the full API response for QR
  const [punchStatus, setPunchStatus] = useState("idle"); // idle | processing | success | failed

  // API Hooks
  const [searchCard, { isFetching: isSearching }] = useLazySearchCardHolderQuery();
  const [createPunch, { isLoading: isCreatingPunch }] = useCreatePunchMutation();
  const { data: servicesResponse } = useGetActiveServicesQuery({ limit: 100 });

  const services = servicesResponse?.data || [];

  const selectedService = services.find(s => s._id === punchForm.serviceId);

  // Derived: payable amount from selected service
  const payableAmount = useMemo(() => {
    if (!selectedService) return 0;
    const price = parseFloat(selectedService.price) || 0;
    const discount = parseFloat(selectedService.discountRate) || 0;
    return price - (price * discount / 100);
  }, [selectedService]);

  // Export functions
  const exportToExcel = () => {
    if (!cardData) { toast.error("No cardholder data to export"); return; }
    const header = [["Full Name", "Card Type", "CHF No", "Service", "Amount", "Punch For"]];
    const rows = [[
      cardData?.userId?.fullName || cardData?.fullName || "—",
      typeof cardData?.cardType === 'object' ? cardData.cardType.name : (cardData?.cardType || "—"),
      cardData?.chfNo || "—",
      selectedService?.serviceName || "—",
      `₹${payableAmount.toFixed(2)}`,
      punchFor,
    ]];
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CardholderPunch");
    XLSX.writeFile(wb, "CardholderPunch_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!cardData) { toast.error("No cardholder data to export"); return; }
    const doc = new jsPDF();
    doc.text("Cardholder Punch Details", 14, 10);
    autoTable(doc, {
      head: [["Full Name", "Card Type", "CHF No", "Service", "Amount", "Punch For"]],
      body: [[
        cardData?.userId?.fullName || cardData?.fullName || "—",
        typeof cardData?.cardType === 'object' ? cardData.cardType.name : (cardData?.cardType || "—"),
        cardData?.chfNo || "—",
        selectedService?.serviceName || "—",
        `₹${payableAmount.toFixed(2)}`,
        punchFor,
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
      const data = res?.data || res?.card || res?.enrollment || res;
      if (data && (data._id || data.userId)) {
        setCardData(data);
        setQrData(null);
        setPunchStatus("idle");
        toast.success("Cardholder found!");
      } else {
        toast.error("Cardholder not found");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Cardholder not found");
      setCardData(null);
    }
  };

  // Auto-fill form when service is selected
  const handleServiceChange = (serviceId) => {
    setPunchForm(prev => ({ ...prev, serviceId }));
    setQrData(null);
    setPunchStatus("idle");
  };

  // Handle family details change
  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "dob") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // Set the calculated age if it's a valid date
      const calculatedAge = !isNaN(birthDate.getTime()) ? (age >= 0 ? age.toString() : "0") : "";
      setFamilyDetails(prev => ({ ...prev, dob: value, age: calculatedAge }));
    } else {
      setFamilyDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  // Create punch & generate QR code
  const handleGenerateQR = async () => {
    if (!cardData) return toast.error("Please search and select a cardholder first");
    if (!punchForm.serviceId) return toast.error("Please select a service");

    // Validate family details if family punch
    if (punchFor === "family") {
      if (!familyDetails.memberName.trim()) return toast.error("Please enter family member name");
      if (!familyDetails.dob) return toast.error("Please enter date of birth");
      if (!familyDetails.age) return toast.error("Please enter age");
      if (!familyDetails.gender) return toast.error("Please select gender");
    }

    setPunchStatus("processing");

    // Build payload
    const payload = {
      chfNo: cardData.chfNo || "",
      serviceId: punchForm.serviceId,
      // service: punchForm.serviceId,
      paymentMethod: "online",
      punchFor: punchFor,
    };

    if (punchFor === "family") {
      payload.familyDetails = {
        memberName: familyDetails.memberName,
        dob: familyDetails.dob,
        age: parseInt(familyDetails.age) || 0,
        gender: familyDetails.gender,
        std: familyDetails.std,
        currentInstitute: familyDetails.currentInstitute,
      };
    }

    try {
      const res = await createPunch(payload).unwrap();
      setQrData(res);
      setPunchStatus("success");
      toast.success("QR Code generated! Ask cardholder to scan and pay.");
    } catch (err) {
      setPunchStatus("failed");
      toast.error(err?.data?.message || "Failed to generate QR code");
    }
  };

  // Reset for new punch
  const handleNewPunch = () => {
    setQrData(null);
    setPunchStatus("idle");
    setPunchForm({ serviceId: "" });
    setFamilyDetails({ memberName: "", dob: "", age: "", gender: "", std: "", currentInstitute: "" });
    setPunchFor("self");
  };

  return (
    <Layout title="Cardholder Punch">
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) setMobileQuery(value);
                    }}
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
                {isSearching ? <PulseLoader size={8} color="#fff" /> : <SearchIcon size={20} />}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="flex items-center justify-center h-full">
            <DMIPremiumCard
              cardAType={cardData?.cardType || "Premium"}
              cardNumber={cardData?.cardNumber || cardData?.cardId?.cardNumber || cardData?.chNo || "0000 0000 0000 0000"}
              cardName={(cardData?.userId?.fullName || "--").toUpperCase()}
              validThru={
                cardData?.expiryDate
                  ? new Date(cardData.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " - ")
                  : "DD - MM - YYYY"
              }
              membershipDate={
                cardData?.issueDate || cardData?.createdAt
                  ? new Date(cardData.issueDate || cardData.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "DD-MM-YYYY"
              }
            />
          </div>

        </div>

        {/* Punch Type Toggle - Radio Buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Punch Type</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="punchFor"
                value="self"
                checked={punchFor === "self"}
                onChange={() => { setPunchFor("self"); setQrData(null); setPunchStatus("idle"); }}
                className="w-5 h-5 accent-[#7E1080]"
              />
              <span className={`text-sm font-semibold transition-colors ${punchFor === "self" ? "text-[#7E1080]" : "text-gray-500 group-hover:text-gray-700"}`}>
                Self Punch
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="punchFor"
                value="family"
                checked={punchFor === "family"}
                onChange={() => { setPunchFor("family"); setQrData(null); setPunchStatus("idle"); }}
                className="w-5 h-5 accent-[#7E1080]"
              />
              <span className={`text-sm font-semibold transition-colors ${punchFor === "family" ? "text-[#7E1080]" : "text-gray-500 group-hover:text-gray-700"}`}>
                Family Member Punch
              </span>
            </label>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SELF PUNCH - Same UI as existing Punch Details */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {punchFor === "self" && (
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
                  Service Price
                </label>
                <div className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                  {selectedService ? `₹${selectedService.price}` : "—"}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Discount
                </label>
                <div className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                  {selectedService ? `${selectedService.discountRate}%` : "—"}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Card Type
                </label>
                <div className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                  {typeof (selectedService?.cardType || cardData?.cardType) === 'object'
                    ? (selectedService?.cardType?.name || cardData?.cardType?.name)
                    : (selectedService?.cardType || cardData?.cardType || "—")}
                </div>
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
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">₹{selectedService?.price || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold">{selectedService?.discountRate || "0"}%</span>
                </div>
                <div className="pt-3 border-t border-[#FEF3C7] flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-gray-800">
                    Payable Amount
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{payableAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateQR}
                disabled={!cardData || !punchForm.serviceId || isCreatingPunch}
                className="bg-[#581c56] hover:bg-[#4a1848] text-white px-10 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingPunch ? (
                  <>
                    <PulseLoader size={8} color="#fff" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Generate Payment QR
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FAMILY MEMBER PUNCH - Different UI with family details */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {punchFor === "family" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Family Member Punch
            </h2>
            <p className="text-sm text-gray-400 mb-6">Enter family member details along with the service to punch</p>

            {/* Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  Card Type
                </label>
                <div className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                  {typeof (selectedService?.cardType || cardData?.cardType) === 'object'
                    ? (selectedService?.cardType?.name || cardData?.cardType?.name)
                    : (selectedService?.cardType || cardData?.cardType || "—")}
                </div>
              </div>
            </div>

            {/* Family Member Details */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 mb-6">
              <h3 className="text-md font-semibold text-[#7E1080] mb-4 flex items-center gap-2">
                Family Member Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Member Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    placeholder="Enter full name"
                    value={familyDetails.memberName}
                    onChange={handleFamilyChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={familyDetails.dob}
                    onChange={handleFamilyChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Enter age"
                    value={familyDetails.age}
                    onChange={handleFamilyChange}
                    min="0"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={familyDetails.gender}
                    onChange={handleFamilyChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Class / Standard
                  </label>
                  <input
                    type="text"
                    name="std"
                    placeholder="E.g. 10th"
                    value={familyDetails.std}
                    onChange={handleFamilyChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Current Institute
                  </label>
                  <input
                    type="text"
                    name="currentInstitute"
                    placeholder="E.g. Delhi Public School"
                    value={familyDetails.currentInstitute}
                    onChange={handleFamilyChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
            </div>

            {/* Punch Summary for Family */}
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
                  <span className="text-gray-600">Punch For</span>
                  <span className="font-semibold text-[#7E1080]">Family — {familyDetails.memberName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">₹{selectedService?.price || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold">{selectedService?.discountRate || "0"}%</span>
                </div>
                <div className="pt-3 border-t border-[#FEF3C7] flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-gray-800">
                    Payable Amount
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{payableAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateQR}
                disabled={!cardData || !punchForm.serviceId || isCreatingPunch}
                className="bg-[#581c56] hover:bg-[#4a1848] text-white px-10 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingPunch ? (
                  <>
                    <PulseLoader size={8} color="#fff" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Generate Payment QR
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* QR CODE PAYMENT MODAL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Modal
          isOpen={!!qrData && punchStatus === "success"}
          onClose={handleNewPunch}
          title="Payment QR Code"
          className="max-w-4xl"
          noScroll={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-2">

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white border-2 border-dashed border-purple-200 rounded-3xl p-6 shadow-inner">
                {qrData?.razorpayOrder?.qrCodeBase64 ? (
                  <img
                    src={qrData.razorpayOrder.qrCodeBase64}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain mx-auto"
                  />
                ) : qrData?.razorpayOrder?.short_url ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-center">
                    <QrCode size={64} className="text-[#7E1080] mb-4" />
                    <a
                      href={qrData.razorpayOrder.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7E1080] font-semibold underline text-sm break-all"
                    >
                      {qrData.razorpayOrder.short_url}
                    </a>
                    <p className="text-xs text-gray-400 mt-2">Click or share this link for payment</p>
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">QR Code not available</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Ask cardholder to scan this QR code to complete payment
                </p>
                {qrData?.razorpayOrder?.short_url && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Link</p>
                    <a
                      href={qrData.razorpayOrder.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm font-medium underline break-all hover:text-blue-800 transition-colors"
                    >
                      {qrData.razorpayOrder.short_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payable Amount</span>
                  <span className="font-bold text-green-600 text-lg">
                    ₹{qrData?.data?.payableAmount || payableAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">{qrData?.data?.paymentMethod || "Online"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${qrData?.data?.paymentStatus === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {qrData?.data?.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cardholder Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name</span>
                  <span className="font-semibold">{cardData?.userId?.fullName || cardData?.fullName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CHF No</span>
                  <span className="font-semibold">{cardData?.chfNo || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Card Type</span>
                  <span className="font-semibold">
                    {typeof cardData?.cardType === 'object' ? cardData.cardType.name : (cardData?.cardType || "—")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{selectedService?.serviceName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Punch For</span>
                  <span className="font-semibold capitalize">{punchFor}{punchFor === "family" ? ` — ${familyDetails.memberName}` : ""}</span>
                </div>
              </div>

              <button
                onClick={handleNewPunch}
                className="w-full bg-[#581c56] hover:bg-[#4a1848] text-white py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>

        {/* Failed State */}
        {punchStatus === "failed" && (
          <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm mb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={36} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">QR Generation Failed</h3>
            <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
              <button
                onClick={handleNewPunch}
                className="w-full px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleGenerateQR}
                className="w-full px-6 py-2.5 bg-[#581c56] hover:bg-[#4a1848] text-white rounded-xl font-bold transition-all shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CardHolder;
