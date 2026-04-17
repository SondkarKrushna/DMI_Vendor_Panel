import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/table/Table";
import Card from "../../components/cards/Card";
import SearchBar from "../../components/search/SearchBar";
import {
  DollarSign,
  Calendar,
  Eye,
  Printer,
  Download,
  ArrowDownToLine,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useGetInvoicesQuery, useGetActiveServicesQuery } from "../../redux/api/invoiceApi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Pagination";

const Invoice = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedService, setSelectedService] = useState("All services");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: servicesData } = useGetActiveServicesQuery();
  const { data: invoicesResponse, isLoading, isFetching } = useGetInvoicesQuery({
    serviceId: selectedServiceId || undefined,
    page: currentPage,
    search: searchValue,
  });

  const activeServices = servicesData?.data || [];
  const invoices = invoicesResponse?.data || (Array.isArray(invoicesResponse) ? invoicesResponse : []);

  // ✅ Dynamic Stats Cards Mapping with Fallback
  const statsCards = useMemo(() => {
    // 1. If backend provides statsCards array
    if (invoicesResponse?.statsCards && Array.isArray(invoicesResponse.statsCards)) {
      return invoicesResponse.statsCards.map(stat => ({
        ...stat,
        parsedPercent: parseFloat(stat.percent?.replace(/[+%]/g, '')) || 0,
        icon: stat.title.toLowerCase().includes('revenue') ? DollarSign : Calendar
      }));
    }

    // 2. Fallback to legacy stats or computed values
    const s = invoicesResponse?.stats || {};
    const totalRev = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    return [
      {
        title: "Total Revenue",
        value: s.totalRevenue || totalRev,
        formatted: `₹${(s.totalRevenue || totalRev).toLocaleString()}`,
        parsedPercent: parseFloat(s.revenuePercent) || 42,
        trend: s.revenueTrend || "up",
        subText: "Total earnings",
        icon: DollarSign
      },
      {
        title: "This Month",
        value: s.thisMonthRevenue || totalRev,
        formatted: `₹${(s.thisMonthRevenue || totalRev).toLocaleString()}`,
        parsedPercent: parseFloat(s.monthPercent) || -30,
        trend: s.monthTrend || "down",
        subText: "Earnings this month",
        icon: Calendar
      }
    ];
  }, [invoicesResponse, invoices]);


  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportToExcel = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const header = [["Invoice ID", "Name", "Service", "Amount", "Payment Method", "Date"]];
    const rows = tableData.map((item) => [item.id, item.name, item.service, item.amount, item.payment, item.date]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "Invoices_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("Payments & Invoices", 14, 10);
    autoTable(doc, {
      head: [["Invoice ID", "Name", "Service", "Amount", "Payment Method", "Date"]],
      body: tableData.map((item) => [item.id, item.name, item.service, item.amount, item.payment, item.date]),
      startY: 20,
    });
    doc.save("invoices.pdf");
  };

  const serviceOptions = [
    { label: "All services", value: "" },
    ...activeServices.map((s) => ({
      label: s.serviceName,
      value: s._id,
    })),
  ];

  const pagination = invoicesResponse?.pagination || {
    page: 1,
    total_pages: 1,
    has_next_page: false,
    has_prev_page: false,
    total: 0
  };

  const handleServiceChange = (label) => {
    setSelectedService(label);
    const service = serviceOptions.find((opt) => opt.label === label);
    setSelectedServiceId(service ? service.value : "");
  };

  const tableData = invoices.map((inv) => ({
    id: inv.invoiceNumber,
    name: inv.userId?.fullName || "N/A",
    service: inv.items?.[0]?.name || "N/A",
    amount: `₹${inv.amount.toLocaleString()}`,
    payment: inv.paymentMethod || "N/A",
    date: new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    _id: inv._id,
  }));

  const filteredData = tableData.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.id.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.service.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedServiceId, searchValue]);

  // ✅ Columns
  const columns = [
    { header: "INVOICE", accessor: "id" },
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
    {
      header: "DATE",
      accessor: "date",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#7E1080]">
            <Calendar size={14} className="text-[#FFB800]" />
          </div>
          <span>{value}</span>
        </div>
      )
    },
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
      setSelectedRows(filteredData.map((row) => row._id)); // ✅ use _id
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <Layout title="Invoices">
      <div className="p-1 sm:p-2 bg-white min-h-screen">

        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Payments & Invoices</h1>
            <p className="text-sm text-gray-500">Track all transactions and revenue</p>
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

        {/* ✅ CARDS (DRIVEN BY STATSCARDS) */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-7xl">
            {statsCards.map((stat, idx) => (
              <Card
                key={idx}
                title={stat.title}
                amount={stat.formatted || `₹${stat.value.toLocaleString()}`}
                percentage={stat.parsedPercent || 0}
                statusText={stat.subText || `${stat.trend} change`}
                trend={stat.trend}
                isDecrease={stat.trend === "down"}
                icon={stat.icon}
              />
            ))}

            {/* Empty placeholders to maintain 4-grid layout if needed */}
            {statsCards.length < 3 && (
              <>
                <div className="hidden lg:block"></div>
                <div className="hidden lg:block"></div>
              </>
            )}
          </div>
        </div>

        {/* 🔥 Search */}
        <div className="mb-4">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search by ID, Name or Service..."
            filters={[
              {
                value: selectedServiceId,
                onChange: (val) => {
                  setSelectedServiceId(val);
                  const s = serviceOptions.find(o => o.value === val);
                  if (s) setSelectedService(s.label);
                },
                options: serviceOptions
              }
            ]}
          />
        </div>

        <div className="block md:hidden space-y-4">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#7E1080] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 animate-pulse font-medium">Loading Invoices...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No invoices found.</div>
          ) : (
            filteredData.map((item, index) => (
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
                  <span className="capitalize">{item.payment}</span>
                </div>

                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Date</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#7E1080]">
                      <Calendar size={14} className="text-[#FFB800]" />
                    </div>
                    <span>{item.date}</span>
                  </div>
                </div>


                <div className="flex justify-end gap-3 pt-2">
                  <Eye className="text-yellow-500" size={18} />
                  <Printer className="text-purple-600" size={18} />
                  <Download className="text-orange-500" size={18} />
                </div>

              </div>
            ))
          )}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table
                columns={columns}
                data={filteredData}
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
    </Layout>
  );
};

export default Invoice;