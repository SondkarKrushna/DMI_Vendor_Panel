import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Table from "../../components/table/Table";
import Search from "../../components/search/Search";
import { Users, Calendar, Eye } from "lucide-react";

const Enrolling = () => {

  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ Table Data
  const tableData = [
    {
      id: "USER-123456",
      name: "John Doe",
      contact: "+91 8585 454 555\njohn@gmail.com",
      cardType: "Premium Card",
      cardNumber: "CHF-1234567",
      date: "2 Feb 2026",
    },
    {
      id: "USER-123457",
      name: "John Doe",
      contact: "+91 8585 454 555\njohn@gmail.com",
      cardType: "Premium Card",
      cardNumber: "CHF-1234567",
      date: "2 Feb 2026",
    },
    {
      id: "USER-123458",
      name: "John Doe",
      contact: "+91 8585 454 555\njohn@gmail.com",
      cardType: "Premium Card",
      cardNumber: "CHF-1234567",
      date: "2 Feb 2026",
    },
  ];

  // ✅ Columns
  const columns = [
    { header: "USER", accessor: "id" },
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
    { header: "CARD TYPE", accessor: "cardType" },
    { header: "CARD NUMBER", accessor: "cardNumber" },
    {
      header: "DATE",
      accessor: "date",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          {/* <span className="bg-purple-100 text-purple-600 p-1 rounded-md text-xs">
            📅
          </span> */}
          {value}
        </div>
      ),
    },
    {
      header: "ACTION",
      accessor: "action",
      Cell: () => (
        <Eye size={16} className="text-yellow-500 cursor-pointer" />
      ),
    },
  ];

  // ✅ Selection logic
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
      <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">

        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Enrollment & Billing</h1>
            <p className="text-sm text-gray-500">Manage cardholder enrollment and billing</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Enroll New" className="flex-1 sm:flex-none" onClick={() => setShowModal(true)} />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              Export
            </button>
          </div>
        </div>

        {/* ✅ CARDS (FORCED 4 GRID) */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">

            <Card
              title="Total Cardholders"
              amount="20"
              percentage={42}
              statusText="Increased by Last Month"
              icon={Users}
            />

            <Card
              title="This Month"
              amount="2"
              percentage={-30}
              statusText="Decreased by Last Month"
              isDecrease
              icon={Calendar}
            />

            {/* Empty placeholders */}
            <div className="hidden lg:block"></div>
            <div className="hidden lg:block"></div>

          </div>
        </div>

        {/* 🔥 Search */}
        <div className="mb-4">
          <Search showDate={true} />
        </div>

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4">
          {tableData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-4 space-y-3">

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500">
                  {item.id}
                </span>
                <Eye className="text-yellow-500" size={18} />
              </div>

              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {item.contact}
                </p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Card Type</span>
                <span>{item.cardType}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Card Number</span>
                <span>{item.cardNumber}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span>{item.date}</span>
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
      {/* Model */}
      {showModal && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50"
    onClick={() => setShowModal(false)}
  >
    <div
      className="bg-white w-[420px] rounded-2xl p-6 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-5">
        Enroll New Cardholder
      </h2>

      {/* Form */}
      <div className="space-y-4">

        {/* Card Type + CHF */}
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="text-sm text-gray-500 mb-1 block">
              Card Type
            </label>
            <input
              type="text"
              placeholder="Select"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="w-1/2">
            <label className="text-sm text-gray-500 mb-1 block">
              CHF Number
            </label>
            <input
              type="text"
              placeholder="Enter"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">
            Mobile Number
          </label>
          <input
            type="text"
            placeholder="Enter"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">
            Image
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
            Upload
          </div>
        </div>

      </div>

      {/* Button */}
      <div className="mt-6 flex justify-center">
        <Button text="Add Cardholder" />
      </div>

    </div>
  </div>
)}
    </Layout>
  );
};

export default Enrolling;