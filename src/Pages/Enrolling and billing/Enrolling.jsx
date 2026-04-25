import React, { useState, useRef, useEffect, useMemo } from "react";
import useDebounce from "../../hooks/useDebounce";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import SearchBar from "../../components/search/SearchBar";
import CardholderDetailsModal from "../../components/CardholderDetailsModal";
import { Users, Calendar, Eye, ArrowDownToLine, Upload, X, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateEnrollmentMutation, useGetEnrollmentsQuery } from "../../redux/api/enrollmentApi";
import Modal, { FormField, FormInput, FormSelect, ModalSubmitBtn, FormImageUpload } from "../../components/Model";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useGetCardsQuery } from "../../redux/api/cardApi";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/dateUtils";


const Enrolling = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  // ✅ Filter state
  const [activeFilter, setActiveFilter] = useState("month");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Form state
  const initialFormState = {
    cardType: "",
    // chfNumber: "",
    fullName: "",
    mobile: "",
    email: "",
    image: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportToExcel = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const header = [["User ID", "Name", "Contact", "Card Type", "Card Number", "Date"]];
    const rows = tableData.map((item) => [
      item.id, item.name, item.contact, item.cardType, item.cardNumber, item.date
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enrollments");
    XLSX.writeFile(wb, "Enrollments_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("Enrollments List", 14, 10);
    autoTable(doc, {
      head: [["User ID", "Name", "Contact", "Card Type", "Card Number", "Date"]],
      body: tableData.map((item) => [item.id, item.name, item.contact, item.cardType, item.cardNumber, item.date]),
      startY: 20,
    });
    doc.save("enrollments.pdf");
  };

  // ✅ API Hooks
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();

  const queryParams = {
    ...(activeFilter === "custom" && dateRange.startDate && dateRange.endDate
      ? { filter: `custom-${dateRange.startDate},${dateRange.endDate}` }
      : { filter: activeFilter }),
    page: currentPage,
    limit: 10
  };

  const {
    data,
    isFetching,
    refetch,
  } = useGetEnrollmentsQuery(queryParams);

  const { data: cardsResponse, isLoading: cardsLoading } = useGetCardsQuery();

  const cardTypes = cardsResponse?.data || [];

  const enrollments = data?.data || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || {
    total: enrollments.length || 0,
    page: currentPage,
    per_page: 10,
    total_pages: Math.ceil((data?.total || enrollments.length || 0) / 10)
  };

  // ✅ Dynamic Stats Cards Mapping with Fallback support
  const statsCards = useMemo(() => {
    // 1. If backend provides the array, use it directly (Parsing percent)
    const backendStats = data?.statsCards;
    if (backendStats && Array.isArray(backendStats)) {
      return backendStats.map(stat => ({
        ...stat,
        parsedPercent: parseFloat(stat.percent?.replace(/[+%]/g, '')) || 0,
        icon: stat.title.toLowerCase().includes('month') ? Calendar : Users
      }));
    }

    // 2. Otherwise, map from legacy stats object (Fallback)
    const s = data?.stats || {};
    return [
      {
        title: "Total Enrollments",
        value: s.totalEnrollments || s.total || enrollments.length || 0,
        percent: s.totalPercent || "0.0%",
        parsedPercent: parseFloat(s.totalPercent) || 0,
        trend: s.totalTrend || "neutral",
        subText: "All time records",
        icon: Users
      },
      {
        title: "This Month",
        value: s.thisMonthEnrollments || enrollments.length || 0,
        percent: s.monthPercent || "0.0%",
        parsedPercent: parseFloat(s.monthPercent) || 0,
        trend: s.monthTrend || "neutral",
        subText: "New enrollments this month",
        icon: Calendar
      }
    ];
  }, [data, enrollments]);

  // ✅ Filter options
  const filterOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "weekly" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "yearly" },
    { label: "Date Range", value: "custom" },
  ];

  // ✅ Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.cardType.trim()) newErrors.cardType = "Card type is required";

    // ❌ REMOVE THIS BLOCK COMPLETELY
    // if (!formData.chfNumber.trim()) { ... }

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.image) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    if (field === "mobile") {
      const val = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [field]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const data = new FormData();
      data.append("cardType", formData.cardType);
      // data.append("chfNumber", formData.chfNumber.trim());
      data.append("fullName", formData.fullName.trim());
      data.append("mobile", formData.mobile.trim());
      data.append("email", formData.email.trim());
      if (formData.image) data.append("image", formData.image);

      const res = await createEnrollment(data).unwrap();
      toast.success(res?.message || "Enrollment created successfully!");
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to create enrollment");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allTableData = enrollments.map((item) => ({
    id: item.cardId?.chfNo || item.cardId?.chNo || item._id || "—",
    name: item.userId?.fullName || "—",
    contact: `${item.userId?.mobile || "—"}\n${item.userId?.email || "—"}`,
    cardType: item.cardId?.cardType || "—",
    cardNumber: item.cardId?.cardNumber || item.cardId?.chNo || "—",
    status: item.status || "—",
    enrollmentStatus: item.paymentStatus || "—",
    date: formatDate(item.createdAt),
  }));

  const tableData = allTableData.filter(item =>
    item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.cardNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const columns = [
    { header: "CHF Number", accessor: "id" },
    { header: "NAME", accessor: "name" },
    { header: "CONTACT", accessor: "contact", Cell: ({ value }) => <div className="whitespace-pre-line text-sm text-gray-600">{value}</div> },
    { header: "CARD TYPE", accessor: "cardType" },
    { header: "CARD NUMBER", accessor: "cardNumber" },
    { header: "DATE", accessor: "date" },
    {
      header: "ACTION",
      accessor: "action",
      Cell: ({ row }) => (
        <Eye size={16} className="text-yellow-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => setViewTarget({ ...row, viewType: 'enrollment' })} />
      ),
    },
  ];

  const handleRowSelect = (id) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? tableData.map((row) => row.id) : []);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, debouncedSearchQuery, dateRange]);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  return (
    <>
      <Layout title="Enrolling & Billing">
        <div className="p-1 sm:p-2 bg-white min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Enrollment & Billing</h1>
              <p className="text-sm text-gray-500">Manage cardholder enrollment and billing</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button text="Enroll New" className="flex-1 sm:flex-none" onClick={() => setShowModal(true)} />
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(prev => !prev)}
                  className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold flex items-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
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

          <div className="mb-6 flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">
              {statsCards.map((stat, idx) => (
                <Card
                  key={idx}
                  title={stat.title}
                  amount={stat.formatted || stat.value.toString()}
                  percentage={stat.parsedPercent || 0}
                  statusText={stat.subText || `${stat.trend} change`}
                  trend={stat.trend}
                  icon={stat.icon || Users}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, ID or card number..."
              filters={[
                {
                  value: activeFilter,
                  onChange: (val) => {
                    setActiveFilter(val);
                    if (val === "custom") setShowRangePicker(true);
                    else { setShowRangePicker(false); setDateRange({ startDate: "", endDate: "" }); }
                  },
                  options: filterOptions
                },
                ...(showRangePicker ? [{
                  render: () => (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#7E1080] bg-white" />
                      <span className="text-gray-400 text-xs px-1">to</span>
                      <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#7E1080] bg-white" />
                    </div>
                  )
                }] : [])
              ]}
              actions={showRangePicker ? [{ label: "Apply Range", onClick: () => { if (dateRange.startDate && dateRange.endDate) refetch(); else toast.error("Please select both dates"); }, variant: 'primary' }] : []}
            />
          </div>

          <div className="block md:hidden space-y-4">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="w-8 h-8 border-4 border-[#7E1080] border-t-transparent rounded-full animate-spin"></div><span className="text-gray-500 text-sm">Loading...</span></div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-40" /><p className="text-base font-medium">No enrollments found</p></div>
            ) : (
              tableData.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100">
                  <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-400">{item.id}</span><Eye className="text-yellow-500 cursor-pointer" size={18} onClick={() => setViewTarget({ ...item, viewType: 'enrollment' })} /></div>
                  <div><p className="font-bold text-gray-800">{item.name}</p><p className="text-sm text-gray-500 whitespace-pre-line">{item.contact}</p></div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-50">
                    <div className="flex flex-col"> <span className="text-gray-400 uppercase text-[10px]">Type</span> <span className="font-semibold">{item.cardType}</span> </div>
                    <div className="flex flex-col"> <span className="text-gray-400 uppercase text-[10px]">Date</span> <span className="font-semibold">{item.date}</span> </div>
                    <div className="flex flex-col col-span-2"> <span className="text-gray-400 uppercase text-[10px]">Card #</span> <span className="font-semibold">{item.cardNumber}</span> </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <Table columns={columns} data={tableData} selectedRows={selectedRows} onRowSelect={handleRowSelect} onSelectAll={handleSelectAll} isLoading={isFetching} />
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title="Enroll New Cardholder"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Card Type"
                error={errors.cardType}
                required
                className="col-span-2"
              >
                <FormSelect
                  value={formData.cardType}
                  onChange={(e) => handleChange("cardType", e.target.value)}
                  error={errors.cardType}
                >
                  <option value="">Select</option>

                  {cardsLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    cardTypes.map((card) => (
                      <option key={card._id} value={card._id}>
                        {card.name}
                      </option>
                    ))
                  )}
                </FormSelect>
              </FormField>
            </div>

            <FormField label="Full Name" error={errors.fullName} required>
              <FormInput
                type="text"
                placeholder="Enter name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                error={errors.fullName}
              />
            </FormField>

            <FormField label="Mobile" error={errors.mobile} required>
              <FormInput
                type="text"
                maxLength={10}
                placeholder="10-digit mobile"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))}
                error={errors.mobile}
              />
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <FormInput
                type="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
              />
            </FormField>

            <FormImageUpload
              label="User Photograph"
              name="image"
              onChange={handleImageChange}
              error={errors.image}
              required
              previewUrl={imagePreview}
            />

            <ModalSubmitBtn onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? "Processing..." : "Enroll Cardholder"}
            </ModalSubmitBtn>
          </div>
        </Modal>
      </Layout>

      <CardholderDetailsModal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} data={viewTarget} />
    </>
  );
};

export default Enrolling;