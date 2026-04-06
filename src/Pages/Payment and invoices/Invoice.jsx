import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/table/Table";
import Card from "../../components/cards/Card";
import Search from "../../components/search/Search";
import { DollarSign, Calendar, CreditCard, TrendingUp, Eye, Printer, Download, ArrowDownToLine, } from "lucide-react";

const Invoice = () => {

  const [selectedRows, setSelectedRows] = useState([]);

  // ✅ Table Data
  const tableData = [
    {
      id: "USER-123456",
      name: "John Doe",
      service: "Web Development",
      amount: "₹3.2L",
      payment: "Visa Card ****5050",
      date: "2 Feb 2026",
    },
    {
      id: "USER-123457",
      name: "John Doe",
      service: "Web Development",
      amount: "₹3.2L",
      payment: "Visa Card ****5050",
      date: "2 Feb 2026",
    },
    {
      id: "USER-123458",
      name: "John Doe",
      service: "Web Development",
      amount: "₹3.2L",
      payment: "Visa Card ****5050",
      date: "2 Feb 2026",
    },
  ];

  // ✅ Columns
  const columns = [
    { header: "USER", accessor: "id" },
    { header: "NAME", accessor: "name" },
    { header: "SERVICE", accessor: "service" },
    {
      header: "AMOUNT",
      accessor: "amount",
      Cell: ({ value }) => (
        <span className="text-green-600 font-semibold">{value}</span>
      ),
    },
    { header: "PAYMENT METHOD", accessor: "payment" },
    { header: "DATE", accessor: "date" },
    {
      header: "ACTION",
      accessor: "action",
      Cell: () => (
        <div className="flex gap-3">
          <Eye size={16} className="text-yellow-500 cursor-pointer" />
          <Printer size={16} className="text-purple-600 cursor-pointer" />
          <Download size={16} className="text-orange-500 cursor-pointer" />
        </div>
      ),
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
            <h1 className="text-2xl font-semibold text-gray-800">Payments & Invoices</h1>
            <p className="text-sm text-gray-500">Track all transactions and revenue</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* ✅ CARDS (FORCED 4 GRID) */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">

            <Card
              title="Total Revenue"
              amount="₹24.5L"
              percentage={42}
              statusText="Increased by Last Month"
              icon={DollarSign}
            />

            <Card
              title="This Month"
              amount="₹3.2L"
              percentage={-30}
              statusText="Decreased by Last Month"
              isDecrease
              icon={Calendar}
            />

            {/* Empty placeholders to maintain 4-grid */}
            <div className="hidden lg:block"></div>
            <div className="hidden lg:block"></div>

          </div>
        </div>

        {/* 🔥 Search */}
        <div className="mb-4">
          <Search />
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
                <p className="text-sm text-gray-500">{item.service}</p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="text-green-600 font-semibold">
                  {item.amount}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span>{item.payment}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span>{item.date}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Eye className="text-yellow-500" size={18} />
                <Printer className="text-purple-600" size={18} />
                <Download className="text-orange-500" size={18} />
              </div>

            </div>
          ))}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
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

export default Invoice;