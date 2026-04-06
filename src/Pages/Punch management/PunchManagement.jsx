import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Table from "../../components/table/Table";
import Search from "../../components/search/Search";
import { Users, DollarSign, Calendar, Eye, Printer, ArrowDownToLine } from "lucide-react";

const PunchManagement = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // ✅ Table Data
  const tableData = [
    {
      id: "1",
      name: "John Doe",
      chf: "CHF-1234",
      contact: "+91 8585 454 555\njohn@gmail.com",
      service: "Web Development",
      date: "2 Feb 2026",
      amount: "$50.00",
      discount: "10%",
    },
    {
      id: "2",
      name: "John Doe",
      chf: "CHF-1234",
      contact: "+91 8585 454 555\njohn@gmail.com",
      service: "Web Development",
      date: "2 Feb 2026",
      amount: "$50.00",
      discount: "10%",
    },
  ];

  // ✅ Columns
  const columns = [
    { header: "CARDHOLDER", accessor: "name" },
    { header: "CHF NO", accessor: "chf" },
    {
      header: "CONTACT",
      accessor: "contact",
      Cell: ({ value }) => (
        <div className="whitespace-pre-line text-sm text-gray-600">
          {value}
        </div>
      ),
    },
    { header: "SERVICE", accessor: "service" },
    { header: "DATE", accessor: "date" },
    {
      header: "AMOUNT",
      accessor: "amount",
      Cell: ({ value }) => (
        <span className="text-green-600 font-semibold">{value}</span>
      ),
    },
    { header: "DISCOUNT", accessor: "discount" },
    {
      header: "INVOICE",
      accessor: "invoice",
      Cell: () => (
        <div className="flex items-center gap-3">
          {/* Printer Icon */}
          <Printer size={16} className="text-purple-600 cursor-pointer" />
          {/* Eye Icon */}
          <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#FEF3C7] hover:bg-[#FDE68A] transition cursor-pointer">
            <Eye size={14} className="text-[#F59E0B]" />
          </div>
        </div>
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
            <h1 className="text-2xl font-semibold text-gray-800">Punch History</h1>
            <p className="text-sm text-gray-500">View And Manage All Punch Transactions</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* ✅ Cards (4-grid layout) */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">

            <Card
              title="Total Punches"
              amount="2100"
              percentage={42}
              icon={Users}
            />

            <Card
              title="Total Revenue"
              amount="$12,400"
              percentage={-30}
              isDecrease
              icon={DollarSign}
            />

            <Card
              title="This Month Punches"
              amount="89"
              percentage={42}
              icon={Calendar}
            />

            {/* Placeholder */}
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

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">
                  {item.name}
                </span>

                <div className="flex gap-2">
                  <Printer className="text-purple-600" size={18} />
                  <Eye className="text-yellow-500" size={18} />
                </div>
              </div>

              <p className="text-sm text-gray-500">{item.chf}</p>

              <p className="text-sm whitespace-pre-line text-gray-500">
                {item.contact}
              </p>

              <div className="flex justify-between text-sm">
                <span>{item.service}</span>
                <span className="text-green-600 font-semibold">
                  {item.amount}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>{item.date}</span>
                <span>{item.discount}</span>
              </div>

            </div>
          ))}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
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
    </Layout>
  );
};

export default PunchManagement;