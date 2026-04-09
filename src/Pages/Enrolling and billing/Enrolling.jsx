import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import SearchBar from "../../components/search/SearchBar";
import CardholderDetailsModal from "../../components/CardholderDetailsModal";
import { Users, Calendar, Eye, ArrowDownToLine, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateEnrollmentMutation, useGetEnrollmentsQuery } from "../../redux/api/enrollmentApi";
import Modal, { FormField, FormInput, FormSelect, ModalSubmitBtn, FormImageUpload } from "../../components/Model";
import { exportToCSV, getExportData } from "../../utils/exportUtils";

const Enrolling = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  // ✅ Filter state
  const [activeFilter, setActiveFilter] = useState("month");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Form state
  const initialFormState = {
    cardType: "",
    chfNumber: "",
    fullName: "",
    mobile: "",
    email: "",
    image: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const exportHeaders = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'cardType', label: 'Card Type' },
    { key: 'cardNumber', label: 'Card Number' },
    { key: 'date', label: 'Date' },
  ];

  const handleExport = () => {
    const dataToExport = getExportData(tableData, selectedRows, 'id');
    exportToCSV(dataToExport, exportHeaders, 'enrollments');
  };

  // ✅ API Hooks
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();

  const queryParams =
    activeFilter === "custom" && dateRange.startDate && dateRange.endDate
      ? { filter: `custom-${dateRange.startDate},${dateRange.endDate}` }
      : { filter: activeFilter };

  const {
    data,
    isFetching,
    refetch,
  } = useGetEnrollmentsQuery(queryParams);

  const enrollmentsResponse = data?.data || data || {};
  const enrollments = enrollmentsResponse.enrollments || (Array.isArray(enrollmentsResponse) ? enrollmentsResponse : []);
  const apiStats = data?.stats || enrollmentsResponse.stats || {};

  const stats = {
    totalEnrollments: apiStats.totalEnrollments || apiStats.total || enrollments.length || 0,
    thisMonthEnrollments: apiStats.thisMonthEnrollments || enrollments.length || 0,
  };

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
    if (!formData.chfNumber.trim()) {
      newErrors.chfNumber = "CHF number is required";
    } else if (!/^CHF-/i.test(formData.chfNumber.trim())) {
      newErrors.chfNumber = "Must start with CHF- (e.g. CHF-1234)";
    }
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      data.append("cardType", formData.cardType.trim());
      data.append("chfNumber", formData.chfNumber.trim());
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
    cardNumber: item.cardId?.chfNo || item.cardId?.chNo || "—",
    status: item.status || "—",
    enrollmentStatus: item.paymentStatus || "—",
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
  }));

  const tableData = allTableData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: "USER", accessor: "id" },
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
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const cardTypes = ["Gold", "Silver", "Platinum", "Premium"];

  return (
    <>
      <Layout>
        <div className="p-1 sm:p-2 bg-white min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Enrollment & Billing</h1>
              <p className="text-sm text-gray-500">Manage cardholder enrollment and billing</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button text="Enroll New" className="flex-1 sm:flex-none" onClick={() => setShowModal(true)} />
              <button 
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                onClick={handleExport}
              >
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" /> Export
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">
              <Card title="Total Enrollments" amount={stats?.totalEnrollments ?? allTableData.length ?? "0"} percentage={0} statusText="All Time" icon={Users} />
              <Card title="This Month" amount={stats?.thisMonthEnrollments ?? "0"} percentage={0} statusText="Current Month" icon={Calendar} />
              <div className="hidden lg:block"></div><div className="hidden lg:block"></div>
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
        </div>

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title="Enroll New Cardholder"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Card Type" error={errors.cardType} required>
                <FormSelect
                  value={formData.cardType}
                  onChange={(e) => handleChange("cardType", e.target.value)}
                  className={errors.cardType ? 'border-red-400' : ''}
                >
                  <option value="">Select</option>
                  {cardTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </FormSelect>
                {errors.cardType && <p className="text-red-500 text-xs mt-1">{errors.cardType}</p>}
              </FormField>

              <FormField label="CHF Number" error={errors.chfNumber} required>
                <FormInput
                  type="text"
                  placeholder="CHF-1234"
                  value={formData.chfNumber}
                  onChange={(e) => handleChange("chfNumber", e.target.value)}
                  className={errors.chfNumber ? 'border-red-400' : ''}
                />
                {errors.chfNumber && <p className="text-red-500 text-xs mt-1">{errors.chfNumber}</p>}
              </FormField>
            </div>

            <FormField label="Full Name" error={errors.fullName} required>
              <FormInput
                type="text"
                placeholder="Enter name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={errors.fullName ? 'border-red-400' : ''}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </FormField>

            <FormField label="Mobile" error={errors.mobile} required>
              <FormInput
                type="text"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))}
                className={errors.mobile ? 'border-red-400' : ''}
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <FormInput
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </FormField>

            <FormImageUpload
              label="Image"
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