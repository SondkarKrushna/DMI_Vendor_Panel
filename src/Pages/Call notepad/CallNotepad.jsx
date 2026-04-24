import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import SearchBar from "../../components/search/SearchBar";
import { Phone, Clock, CheckCircle, Eye, ArrowDownToLine, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useGetCallNotesQuery,
  useAddCallNoteMutation,
  useUpdateCallNoteStatusMutation,
} from "../../redux/api/callNotesApi";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/dateUtils";


const CallNotepad = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Follow Ups");
  const [selectedStatus, setSelectedStatus] = useState("All status");
  const [searchValue, setSearchValue] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    note: "",
    date: "",
    type: "follow-up",
  });
  const [errors, setErrors] = useState({});

  const typeParam = activeTab === "Follow Ups" ? "follow-up" : "enquiry";
  const statusParam = selectedStatus === "All status" ? "" : selectedStatus.toLowerCase();

  const { data, isLoading, isFetching } = useGetCallNotesQuery({
    status: statusParam,
    type: typeParam,
    page: currentPage,
    search: searchValue,
  });

  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  };

  // ✅ Extract notes from callNotes array
  const notes = data?.callNotes || data?.data || (Array.isArray(data) ? data : []);

  // ✅ Dynamic Stats Cards Mapping with Fallback
  const statsCards = useMemo(() => {
    // If backend provides statsCards array
    if (data?.statsCards && Array.isArray(data.statsCards)) {
      return data.statsCards.map(stat => {
        // Map icons based on title
        let Icon = Phone;
        if (stat.title.toLowerCase().includes('pending')) Icon = Clock;
        if (stat.title.toLowerCase().includes('completed')) Icon = CheckCircle;
        if (stat.title.toLowerCase().includes('enquir')) Icon = Phone;

        return {
          ...stat,
          icon: Icon,
          // Convert "+0%" or "-100.0%" to number
          percentValue: parseFloat(stat.percent?.replace(/[+%]/g, '')) || 0
        };
      });
    }

    // Fallback to manual mapping if stats object exists
    const s = data?.stats || {};
    return [
      { title: "Total Calls", value: s.totalCalls || notes.length || 0, percentValue: 0, trend: "neutral", icon: Phone },
      { title: "Pending Follow Ups", value: s.pendingFollowUps || 0, percentValue: 0, trend: "neutral", icon: Clock },
      { title: "Completed", value: s.totalCompleted || 0, percentValue: 0, trend: "neutral", icon: CheckCircle },
      { title: "Total Enquiries", value: s.totalEnquiries || 0, percentValue: 0, trend: "neutral", icon: Phone }
    ];
  }, [data, notes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedStatus, searchValue]);

  const [addCallNote, { isLoading: isAdding }] = useAddCallNoteMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCallNoteStatusMutation();


  const exportToExcel = () => {
    if (!notes.length) { toast.error("No data to export"); return; }
    const header = [["Call ID", "Name", "Mobile", "Email", "Call Note", "Date", "Status"]];
    const rows = notes.map((n) => [
      n.callId, n.name, n.mobile, n.email, n.note,
      formatDate(n.date),
      n.status
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 26 }, { wch: 30 }, { wch: 16 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CallNotes");
    XLSX.writeFile(wb, "CallNotepad_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!notes.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("CNP - Call Note Pad", 14, 10);
    autoTable(doc, {
      head: [["Call ID", "Name", "Mobile", "Email", "Note", "Date", "Status"]],
      body: notes.map((n) => [
        n.callId, n.name, n.mobile, n.email, n.note,
        formatDate(n.date),
        n.status
      ]),
      startY: 20,
    });
    doc.save("call_notepad.pdf");
  };

  const handleMarkComplete = async () => {
    if (!confirmModal.id) return;
    try {
      await updateStatus({ id: confirmModal.id, status: "completed" }).unwrap();
      toast.success("Call note marked as completed");
      setConfirmModal({ show: false, id: null });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.note.trim()) newErrors.note = "Call Note is required";
    if (!formData.date) newErrors.date = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const submissionData = {
        ...formData,
        type: typeParam,
      };
      await addCallNote(submissionData).unwrap();
      toast.success("Call note added successfully");
      setShowModal(false);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        note: "",
        date: "",
        type: "follow-up",
      });
      setErrors({});
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add call note");
    }
  };

  const columns = [
    { header: "CALL ID", accessor: "callId" },
    { header: "NAME", accessor: "name" },
    {
      header: "CONTACT",
      accessor: "contact",
      Cell: ({ row }) => (
        <div className="whitespace-pre-line text-sm text-gray-600">
          {row.mobile}{"\n"}{row.email}
        </div>
      ),
    },
    { header: "CALL NOTES", accessor: "note" },
    {
      header: "DATE",
      accessor: "date",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#7E1080]">
            <Calendar size={14} className="text-[#FFB800]" />
          </div>
          <span>
            {formatDate(value)}
          </span>
        </div>
      ),
    },
    {
      header: "STATUS",
      accessor: "status",
      Cell: ({ value }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${value === "pending"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-green-100 text-green-600"
            }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "ACTION",
      accessor: "action",
      Cell: ({ row }) => {
        if (row.status === "completed") {
          return <span className="text-gray-400">--</span>;
        }
        return (
          <span
            onClick={() => setConfirmModal({ show: true, id: row._id })}
            className="text-green-600 text-sm cursor-pointer hover:underline"
          >
            Mark as complete
          </span>
        );
      },
    },
  ];

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((row) => row !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(notes.map((row) => row._id));
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <Layout title="Call Notepad">
      <div className="p-1 sm:p-2 bg-white min-h-screen">

        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">CNP - Call Note Pad</h1>
            <p className="text-sm text-gray-500">Track Customer Calls And Follow-Ups</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Add Call Note" className="flex-1 sm:flex-none" onClick={() => setShowModal(true)} />
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

        {/* ✅ Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              title={stat.title}
              amount={stat.value.toString()}
              percentage={stat.percentValue}
              trend={stat.trend}
              isDecrease={stat.trend === "down"}
              statusText={stat.subText || `${stat.trend} change`}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* ✅ Tabs */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setActiveTab("Follow Ups")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "Follow Ups"
              ? "bg-yellow-400 text-black"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
          >
            Follow Ups
          </button>

          <button
            onClick={() => setActiveTab("Enquiries")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "Enquiries"
              ? "bg-yellow-400 text-black"
              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
          >
            Enquiries
          </button>
        </div>

        {/* 🔥 Search & Status Filter */}
        <div className="mb-4">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search by Call ID, Name or Contact..."
            filters={[
              {
                value: selectedStatus,
                onChange: setSelectedStatus,
                options: [
                  { label: "All status", value: "All status" },
                  { label: "Pending", value: "Pending" },
                  { label: "Completed", value: "Completed" }
                ]
              }
            ]}
          />
        </div>

        <div className="block md:hidden space-y-4">
          {isLoading || isFetching ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-4 space-y-4 border border-gray-100 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-4"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
              </div>
            ))
          ) : notes.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100">

              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-500">
                  {item.callId}
                </span>
                <Eye className="text-yellow-500" size={18} />
              </div>

              <p className="font-semibold text-gray-800">{item.name}</p>

              <p className="text-sm text-gray-500 whitespace-pre-line">
                {item.mobile}{"\n"}{item.email}
              </p>

              <p className="text-sm text-gray-600">{item.note}</p>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#7E1080]">
                    <Calendar size={14} className="text-[#FFB800]" />
                  </div>
                  <span>{formatDate(item.date)}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${item.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                    }`}
                >
                  {item.status}
                </span>
              </div>

              {item.status !== "completed" && (
                <button
                  onClick={() => setConfirmModal({ show: true, id: item._id })}
                  className="w-full py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium mt-2"
                >
                  Mark as complete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table
                columns={columns}
                data={notes}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                isLoading={isLoading || isFetching}
              />
            </div>
          </div>
        </div>

        {/* ✅ Pagination */}
        <div className="mt-6">
          <Pagination
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-[90]"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white w-[400px] rounded-2xl p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              Add Call Note
            </h2>

            <div className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={`w-full bg-gray-50 border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Mobile Number"
                  className={`w-full bg-gray-50 border ${errors.mobile ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className={`w-full bg-gray-50 border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Call Note */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Call Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Call Note"
                  className={`w-full bg-gray-50 border ${errors.note ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none`}
                />
                {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 border ${errors.date ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-3 bg-[#7E1080] text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {isAdding ? <PulseLoader size={8} color="#fff" /> : "Add Call Note"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* ✅ Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Are you sure?</h3>
            <p className="text-gray-600 text-center mb-6">
              Do you want to mark this call note as completed? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ show: false, id: null })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                disabled={isUpdating}
              >
                No, Cancel
              </button>
              <button
                onClick={handleMarkComplete}
                className="flex-1 px-4 py-3 bg-[#7E1080] hover:bg-[#6A0D6C] text-white font-semibold rounded-xl transition-colors shadow-lg active:scale-95"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Yes, Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CallNotepad;