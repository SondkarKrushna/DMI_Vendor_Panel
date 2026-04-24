import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Table from "../../components/table/Table";
import SearchBar from "../../components/search/SearchBar";
import CardholderDetailsModal from "../../components/CardholderDetailsModal";
import Modal, { FormField, FormInput, FormSelect, ModalSubmitBtn } from "../../components/Model";
import { Users, DollarSign, Calendar, Eye, Printer, ArrowDownToLine, Search as SearchIcon, Plus, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "react-toastify";
import {
  useLazySearchCardHolderQuery,
  useCreatePunchMutation,
  useGetPunchesQuery
} from "../../redux/api/punchApi";
import { useGetServicesQuery } from "../../redux/api/servicesApi";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/dateUtils";


const PunchManagement = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewedCardholder, setViewedCardholder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showRangePicker, setShowRangePicker] = useState(false);

  // Form State
  const initialFormState = {
    cardType: "",
    chfNo: "",
    fullName: "",
    mobile: "",
    email: "",
    serviceId: "",
  };
  const [punchForm, setPunchForm] = useState(initialFormState);

  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportToExcel = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const header = [["Cardholder Name", "CHF No", "Contact", "Service", "Date", "Amount", "Discount"]];
    const rows = tableData.map((item) => [item.name, item.chf, item.contact, item.service, item.date, item.amount, item.discount]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 26 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Punches");
    XLSX.writeFile(wb, "PunchManagement_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!tableData.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("Punch Management", 14, 10);
    autoTable(doc, {
      head: [["Cardholder", "CHF No", "Service", "Date", "Amount", "Discount"]],
      body: tableData.map((item) => [item.name, item.chf, item.service, item.date, item.amount, item.discount]),
      startY: 20,
    });
    doc.save("punches.pdf");
  };

  // API Hooks
  const [searchCard, { isFetching: isSearching }] = useLazySearchCardHolderQuery();
  const [createPunch, { isLoading: isPunching }] = useCreatePunchMutation();
  const { data: servicesResponse } = useGetServicesQuery();
  const servicesData = servicesResponse?.data || [];

  const queryParams = {
    page: currentPage,
    per_page: 10,
    ...(activeFilter === "custom" && dateRange.startDate && dateRange.endDate
      ? { dateFilter: "custom", startDate: dateRange.startDate, endDate: dateRange.endDate }
      : { dateFilter: activeFilter }),
  };

  const { data: punchesResponse, isFetching: isLoadingPunches, refetch } = useGetPunchesQuery({
    ...queryParams,
    search: searchTerm
  });

  const punches = punchesResponse?.data || punchesResponse?.punches || (Array.isArray(punchesResponse) ? punchesResponse : []);
  const apiStats = punchesResponse?.stats || {};

  const stats = {
    totalPunches: apiStats.totalPunches || punches.length || 0,
    totalRevenue: apiStats.totalRevenue || punches.reduce((sum, p) => sum + (p.revenue || p.amount || p.serviceId?.price || 0), 0),
    thisMonthPunches: apiStats.thisMonthPunches || punches.length || 0,
  };
  const pagination = punchesResponse?.pagination || { total: punches.length || 0, page: currentPage, per_page: 10, total_pages: 1, has_next_page: false, has_prev_page: false };

  // Handlers
  const handleSearchCard = async () => {
    if (!searchTerm.trim()) return toast.error("Please enter a CHF Number or Mobile");
    try {
      const res = await searchCard(searchTerm.trim()).unwrap();
      const card = res.data || res.card || res;

      if (card) {
        setPunchForm({
          cardType: card.cardType || "",
          chfNo: card.chNo || card.chfNumber || "",
          fullName: card.userId?.fullName || card.fullName || "",
          mobile: card.userId?.mobile || card.mobile || "",
          email: card.userId?.email || card.email || "",
          serviceId: "", // Reset service selection
        });
        toast.success("Cardholder details found!");
      } else {
        toast.error("Cardholder not found");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Cardholder not found");
    }
  };

  const handlePunchSubmit = async () => {
    if (!punchForm.chfNo) return toast.error("Please search and select a cardholder first");
    if (!punchForm.serviceId) return toast.error("Please select a service");

    try {
      await createPunch(punchForm).unwrap();
      toast.success("Punch recorded successfully!");
      setPunchForm(initialFormState);
      setSearchTerm("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record punch");
    }
  };

  const columns = [
    { header: "CARDHOLDER", accessor: "name" },
    { header: "CHF NO", accessor: "chf" },
    {
      header: "CONTACT",
      accessor: "contact",
      Cell: ({ value }) => <div className="whitespace-pre-line text-sm text-gray-600">{value}</div>,
    },
    { header: "SERVICE", accessor: "service" },
    {
      header: "DATE",
      accessor: "date",
      Cell: ({ value }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#7E1080] shadow-sm">
            <Calendar size={14} className="text-[#FFB800]" />
          </div>
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: "AMOUNT",
      accessor: "amount",
      Cell: ({ value }) => <span className="text-sm font-semibold text-emerald-600">{value}</span>,
    },
    {
      header: "DISCOUNT",
      accessor: "discount",
      Cell: ({ value }) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      header: "INVOICE",
      accessor: "id",
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Printer size={18} className="text-purple-600 cursor-pointer hover:scale-110 transition-transform" onClick={() => toast.info("Printing invoice...")} />
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer shadow-sm border border-amber-100" onClick={() => setViewedCardholder({ ...row, viewType: 'cardholder' })}>
            <Eye size={16} className="text-amber-500" />
          </div>
        </div>
      ),
    },
  ];

  const tableData = punches.map((p) => ({
    id: p._id,
    name: p.fullName || p.userId?.fullName || "—",
    chf: p?.cardId?.chfNo || "—",
    contact: `${p.mobile || p.userId?.mobile || "—"}\n${p.email || p.userId?.email || "—"}`,
    service: p.serviceId?.serviceName || p.serviceName || "—",
    date: p.punchDate
      ? formatDate(p.punchDate)
      : p.createdAt
        ? formatDate(p.createdAt)
        : "—",
    amount: p.amount != null ? `₹${p.amount.toLocaleString('en-IN')}` : "—",
    discount: p.discount != null ? `₹${p.discount}` : "—",
  }));

  const filterOptions = [
    { label: "Today", value: "today" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
    { label: "Custom Range", value: "custom" },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, dateRange.startDate, dateRange.endDate, searchTerm]);

  const handleRowSelect = (id) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? tableData.map((row) => row.id) : []);
  };

  return (
    <Layout title="Punch Management">
      <div className="p-1 sm:p-2 bg-white min-h-screen">
        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Punch Management</h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide italic mt-0.5">Track and record service utilization logs</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">

            <div className="relative">
              <button
                onClick={() => setShowExportOptions(prev => !prev)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" /> Export
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

        {/* ✅ Dynamic Stats */}
        <div className="mb-8 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
            <Card title="Total Punches" amount={stats.totalPunches?.toString() ?? "0"} percentage={0} statusText="Total recorded" icon={Users} />
            <Card title="Total Revenue" amount={stats.totalRevenue ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : "₹0"} percentage={0} statusText="Revenue from punches" icon={DollarSign} />
            <Card title="This Month" amount={stats.thisMonthPunches?.toString() ?? "0"} percentage={0} statusText="Current month usage" icon={Calendar} />
          </div>
        </div>

        {/* 🔥 Unified Search & Custom Filters */}
        <div className="mb-4">
          <SearchBar
            placeholder="Quick search history..."
            filters={[
              {
                value: activeFilter,
                onChange: (val) => {
                  setActiveFilter(val);
                  setShowRangePicker(val === "custom");
                },
                options: filterOptions
              },
              ...(showRangePicker ? [{
                render: () => (
                  <div className="flex flex-col sm:flex-row items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                    <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-100 text-xs outline-none focus:border-[#7E1080] bg-gray-50" />
                    <span className="text-gray-300 text-xs">to</span>
                    <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-100 text-xs outline-none focus:border-[#7E1080] bg-gray-50" />
                    <button onClick={refetch} className="p-2 bg-[#7E1080] text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"><SearchIcon size={14} /></button>
                  </div>
                )
              }] : [])
            ]}
          />
        </div>

        {/* ✅ Dynamic History Table */}
        <div className="hidden md:block">
          <Table columns={columns} data={tableData} selectedRows={selectedRows} onRowSelect={handleRowSelect} onSelectAll={handleSelectAll} isLoading={isLoadingPunches} />
        </div>
        <div className="block md:hidden space-y-4">
          {isLoadingPunches ? (
            <div className="py-20 flex justify-center flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#7E1080] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 animate-pulse font-medium">Loading Records...</p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-medium">No punch records found</div>
          ) : (
            tableData.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-sm border border-gray-50 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7E1080] flex items-center justify-center font-bold text-sm uppercase">{item.name?.substring(0, 2)}</div>
                    <div> <p className="font-bold text-gray-900">{item.name}</p> <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.chf}</p> </div>
                  </div>
                  <div className="flex gap-2"> <Printer size={16} className="text-purple-400" /> <Eye size={16} className="text-amber-400" /> </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div> <p className="text-[10px] text-gray-400 font-bold uppercase">Service</p> <p className="text-xs font-bold text-[#7E1080] truncate">{item.service}</p> </div>
                  <div> <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p> <p className="text-xs font-bold text-gray-700">{item.date}</p> </div>
                  <div> <p className="text-[10px] text-gray-400 font-bold uppercase">Amount</p> <p className="text-xs font-bold text-emerald-600">{item.amount}</p> </div>
                  <div> <p className="text-[10px] text-gray-400 font-bold uppercase">Discount</p> <p className="text-xs font-bold text-gray-700">{item.discount}</p> </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Pagination */}
        <div className="mt-6">
          <Pagination
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>


      {/* Cardholder Details Modal */}
      <CardholderDetailsModal isOpen={!!viewedCardholder} onClose={() => setViewedCardholder(null)} cardholder={viewedCardholder} />
    </Layout>
  );
};

export default PunchManagement;