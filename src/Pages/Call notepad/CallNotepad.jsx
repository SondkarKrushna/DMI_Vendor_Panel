import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import Search from "../../components/search/Search";
import { Phone, Clock, CheckCircle, Eye, ArrowDownToLine } from "lucide-react";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import {
  useGetCallNotesQuery,
  useAddCallNoteMutation,
  useUpdateCallNoteStatusMutation,
} from "../../redux/api/callNotesApi";

const CallNotepad = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Follow Ups"); 
  const [selectedStatus, setSelectedStatus] = useState("All status");
  const [searchValue, setSearchValue] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    note: "",
    date: "",
    type: "follow-up",
  });

  const typeParam = activeTab === "Follow Ups" ? "follow-up" : "enquiry";
  const statusParam = selectedStatus === "All status" ? "" : selectedStatus.toLowerCase();

  const { data, isLoading } = useGetCallNotesQuery({
    status: statusParam,
    type: typeParam,
  });

  const [addCallNote, { isLoading: isAdding }] = useAddCallNoteMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCallNoteStatusMutation();

  const notes = data?.callNotes || [];
  const stats = data?.stats || { totalCalls: 0, pendingFollowUps: 0, totalCompleted: 0, totalEnquiries: 0 };

  // ✅ Search Filtering (Local)
  const filteredNotes = notes.filter(note => {
    const searchLower = searchValue.toLowerCase();
    return (
      note.name?.toLowerCase().includes(searchLower) ||
      note.mobile?.includes(searchValue) ||
      note.email?.toLowerCase().includes(searchLower) ||
      note.note?.toLowerCase().includes(searchLower) ||
      note.callId?.toLowerCase().includes(searchLower)
    );
  });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure type matches the active tab or is follow-up by default as per request
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
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add call note");
    }
  };

  // ✅ Columns
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
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
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

  // ✅ Selection Logic
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((row) => row !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredNotes.map((row) => row._id));
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <Layout>
      <div className="p-1 sm:p-2 bg-white min-h-screen">

        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">CNP - Call Note Pad</h1>
            <p className="text-sm text-gray-500">Track Customer Calls And Follow-Ups</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Add Call Note" className="flex-1 sm:flex-none" onClick={() => setShowModal(true)} />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* ✅ Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <Card title="Total Calls" amount={stats.totalCalls.toString()} percentage={42} icon={Phone} />
          <Card title="Pending Follow Ups" amount={stats.pendingFollowUps.toString()} percentage={-30} isDecrease icon={Clock} />
          <Card title="Completed" amount={stats.totalCompleted.toString()} percentage={42} icon={CheckCircle} />
          <Card title="Total Enquiries" amount={stats.totalEnquiries.toString()} percentage={42} icon={Phone} />
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
          <Search
            status={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />
        </div>

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
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
          ) : filteredNotes.map((item) => (
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
                <span>{new Date(item.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
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
                data={filteredNotes}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                isLoading={isLoading}
              />
            </div>
          </div>
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
                <label className="block text-sm text-black mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Full Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="Mobile Number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Call Note */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Call Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  required
                  placeholder="Call Note"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              {/* Type Selector */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                >
                  <option value="follow-up">Follow-up</option>
                  <option value="enquiry">Enquiry</option>
                </select>
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