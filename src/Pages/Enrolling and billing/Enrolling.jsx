import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import SearchBar from "../../components/search/SearchBar";
import { Users, Calendar, Eye, ArrowDownToLine, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateEnrollmentMutation, useGetEnrollmentsQuery } from "../../redux/api/enrollmentApi";
import Modal from "../../components/Model";
import { MdRemoveRedEye } from "react-icons/md";

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

  // ✅ API Hooks
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();

  const queryParams =
    activeFilter === "custom" && dateRange.startDate && dateRange.endDate
      ? { filter: `range-${dateRange.startDate},${dateRange.endDate}` }
      : { filter: activeFilter };

  const {
    data: enrollmentsResponse,
    isFetching,
    refetch,
  } = useGetEnrollmentsQuery(queryParams);

  const enrollments = enrollmentsResponse?.data || enrollmentsResponse?.enrollments || [];
  const stats = enrollmentsResponse?.stats || {};

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
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
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
    id: item.chNo || item.chNo || "—",
    name: item.userId?.fullName || item.fullName || "—",
    contact: `${item.userId?.mobile || item.mobile || "—"}\n${item.userId?.email || item.email || "—"}`,
    cardType: item.cardType || "—",
    cardNumber: item.chNo || item.chfNumber || "—",
    status: item.status || "—",
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
        <Eye size={16} className="text-yellow-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => setViewTarget(row)} />
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
              <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" /> Export
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">
              <Card title="Total Cardholders" amount={stats?.totalCardholders ?? allTableData.length ?? "0"} percentage={stats?.totalPercentage ?? 0} statusText="Increased by Last Month" icon={Users} />
              <Card title="This Month" amount={stats?.thisMonthCardholders ?? "0"} percentage={stats?.monthPercentage ?? 0} statusText={stats?.monthPercentage >= 0 ? "Increased by Last Month" : "Decreased by Last Month"} isDecrease={stats?.monthPercentage < 0} icon={Calendar} />
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
              actions={showRangePicker ? [{ label: "Apply Range", onClick: () => { if (dateRange.startDate && dateRange.endDate) { refetch(); } else { toast.error("Please select both dates"); } }, variant: 'primary' }] : []}
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
                  <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-400">{item.id}</span><Eye className="text-yellow-500 cursor-pointer" size={18} onClick={() => setViewTarget(item)} /></div>
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

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={closeModal}>
            <div className="bg-white w-full max-w-[440px] rounded-3xl p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Enroll New Cardholder</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-[10px] font-bold text-gray-700 uppercase">Card Type</label>
                    <select value={formData.cardType} onChange={(e) => handleChange("cardType", e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none ${errors.cardType ? "border-red-400" : "border-gray-200 focus:border-[#7E1080]"}`}>
                      <option value="">Select</option> {cardTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] font-bold text-gray-700 uppercase">CHF Number</label>
                    <input type="text" placeholder="CHF-1234" value={formData.chfNumber} onChange={(e) => handleChange("chfNumber", e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none ${errors.chfNumber ? "border-red-400" : "border-gray-200 focus:border-[#7E1080]"}`} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase">Full Name</label>
                  <input type="text" placeholder="Enter name" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none ${errors.fullName ? "border-red-400" : "border-gray-200 focus:border-[#7E1080]"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase">Mobile</label>
                  <input type="text" maxLength={10} value={formData.mobile} onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none ${errors.mobile ? "border-red-400" : "border-gray-200 focus:border-[#7E1080]"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none ${errors.email ? "border-red-400" : "border-gray-200 focus:border-[#7E1080]"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase">Image</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                  {imagePreview ? (
                    <div className="flex items-center gap-4 border p-3 rounded-xl bg-purple-50/20">
                      <img src={imagePreview} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 overflow-hidden font-medium text-xs"> <p className="truncate">{formData.image?.name}</p> <p className="text-[#7E1080]">{(formData.image?.size / 1024).toFixed(1)} KB</p> </div>
                      <button onClick={removeImage} className="text-red-500"><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-purple-50 group transition-all">
                      <Upload size={24} className="mx-auto text-gray-300 group-hover:text-[#7E1080] mb-2" />
                      <p className="text-xs font-bold text-gray-500">Upload Image</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={isCreating} className="w-full mt-6 py-4 bg-gradient-to-b from-[#7E1080] to-[#1A031A] text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm">
                {isCreating ? "Processing..." : "Enroll Cardholder"}
              </button>
            </div>
          </div>
        )}
      </Layout>

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Cardholder Details" className="max-w-xl w-full">
        {viewTarget && (
          <div className="flex flex-col gap-6 p-2">
            <div className="flex items-center gap-4 border-b pb-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#7E1080] flex items-center justify-center font-bold text-xl uppercase border border-purple-100">{viewTarget.name?.substring(0, 2)}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewTarget.name}</h3>
                <div className="flex gap-2"> <span className="bg-purple-100 text-[#7E1080] text-[10px] font-bold px-2 py-0.5 rounded-full">{viewTarget.cardType}</span> <span className="text-xs text-gray-400">ID: {viewTarget.id}</span> </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-2xl"> <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Mobile</p> <p className="font-bold text-gray-800">{viewTarget.contact.split('\n')[0]}</p> </div>
              <div className="bg-gray-50 p-4 rounded-2xl"> <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">CHF #</p> <p className="font-bold text-gray-800">{viewTarget.cardNumber}</p> </div>
              <div className="bg-gray-50 p-4 rounded-2xl"> <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Email</p> <p className="font-bold text-gray-800 truncate">{viewTarget.contact.split('\n')[1]}</p> </div>
              <div className="bg-gray-50 p-4 rounded-2xl"> <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p> <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div><p className="font-bold text-gray-800 capitalize">{viewTarget.status}</p></div> </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">KYC Documents</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#7E1080] transition-all bg-white group cursor-pointer shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MdRemoveRedEye size={20} /></div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#7E1080]">Aadhar Card</span>
                </div>
                <div className="border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#7E1080] transition-all bg-white group cursor-pointer shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MdRemoveRedEye size={20} /></div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#7E1080]">PAN Card</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Enrolling;