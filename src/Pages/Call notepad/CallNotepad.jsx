import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import Search from "../../components/search/Search";
import { Phone, Clock, CheckCircle, Eye, ArrowDownToLine } from "lucide-react";

const CallNotepad = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Follow Ups");

  // ✅ Table Data
  const tableData = [
    {
      id: "CALL - 123456",
      name: "John doe",
      contact: "+91 8585 454 555\njohn@gmail.com",
      notes: "Interested in web development",
      date: "2 Feb 2026",
      status: "Pending",
    },
    {
      id: "CALL - 123456",
      name: "John doe",
      contact: "+91 8585 454 555\njohn@gmail.com",
      notes: "Interested in web development",
      date: "2 Feb 2026",
      status: "Completed",
    },
  ];

  // ✅ Columns
  const columns = [
    { header: "CALL ID", accessor: "id" },
    { header: "NAME", accessor: "name" },
    {
      header: "CONTACT",
      accessor: "contact",
      Cell: ({ value }) => (
        <div className="whitespace-pre-line text-sm text-gray-600">
          {value}
        </div>
      ),
    },
    { header: "CALL NOTES", accessor: "notes" },
    { header: "DATE", accessor: "date" },
    {
      header: "STATUS",
      accessor: "status",
      Cell: ({ value }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "Pending"
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
      Cell: () => (
        <span className="text-green-600 text-sm cursor-pointer">
          Mark as complete
        </span>
      ),
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
      setSelectedRows(tableData.map((row) => row.id));
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
          <Card title="Total Calls" amount="2100" percentage={42} icon={Phone} />
          <Card title="Pending Follow Ups" amount="20" percentage={-30} isDecrease icon={Clock} />
          <Card title="Completed" amount="04" percentage={42} icon={CheckCircle} />
          <Card title="Total Enquiries" amount="12" percentage={42} icon={Phone} />
        </div>

        {/* ✅ Tabs */}
        <div className="flex gap-3 mb-4">
  <button
    onClick={() => setActiveTab("Follow Ups")}
    className={`px-4 py-2 rounded-lg font-medium ${
      activeTab === "Follow Ups"
        ? "bg-yellow-400 text-black"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    Follow Ups
  </button>

  <button
    onClick={() => setActiveTab("Enquiries")}
    className={`px-4 py-2 rounded-lg font-medium ${
      activeTab === "Enquiries"
        ? "bg-yellow-400 text-black"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    Enquiries
  </button>
</div>

        {/* 🔥 Search */}
        <div className="mb-4">
          <Search />
        </div>

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4">
          {tableData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-4 space-y-3">

              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-500">
                  {item.id}
                </span>
                <Eye className="text-yellow-500" size={18} />
              </div>

              <p className="font-semibold text-gray-800">{item.name}</p>

              <p className="text-sm text-gray-500 whitespace-pre-line">
                {item.contact}
              </p>

              <p className="text-sm">{item.notes}</p>

              <div className="flex justify-between text-sm">
                <span>{item.date}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table
                columns={columns}
                data={tableData}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
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
          <div
            className="bg-white w-[400px] rounded-2xl p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-lg font-semibold mb-4">
              Add Call Note
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />

              <input
                type="text"
                placeholder="Mobile Number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />

              <textarea
                placeholder="Call Note"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />

              <input
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="mt-6 flex justify-center">
              <Button text="Add Call Note" />
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default CallNotepad;