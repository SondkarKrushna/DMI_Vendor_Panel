import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useGetInvoicesQuery, useGetActiveServicesQuery } from "../../redux/api/invoiceApi";

const Invoice = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedService, setSelectedService] = useState("All services");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: servicesData } = useGetActiveServicesQuery();
  const { data: invoicesResponse, isLoading } = useGetInvoicesQuery({
    serviceId: selectedServiceId || undefined,
    page: currentPage,
    search: searchValue,
  });

  const activeServices = servicesData?.data || [];
  const invoices = invoicesResponse?.data || (Array.isArray(invoicesResponse) ? invoicesResponse : []);
  const apiStats = invoicesResponse?.stats || {};
  const totalRev = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  
  const stats = {
    totalRevenue: apiStats.totalRevenue || totalRev,
    thisMonthRevenue: apiStats.thisMonthRevenue || totalRev,
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
      setSelectedRows(filteredData.map((row) => row.id));
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
              amount={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
              percentage={42}
              statusText="Increased by Last Month"
              icon={DollarSign}
            />

            <Card
              title="This Month"
              amount={`₹${(stats.thisMonthRevenue || 0).toLocaleString()}`}
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

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#7E1080] border-t-transparent rounded-full animate-spin"></div>
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
            <div className="min-w-[900px]">
              <Table
                columns={columns}
                data={filteredData}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                isLoading={isLoading}
              />

              {/* Pagination UI */}

              {pagination.total > 10 && (
  <div className="flex justify-center items-center gap-4 mt-10 mb-6">

    {/* Previous */}
    <button
      disabled={!pagination.has_prev_page}
      onClick={() => setCurrentPage(prev => prev - 1)}
      className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition
        ${!pagination.has_prev_page
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:scale-95'
        }`}
    >
      Previous
    </button>

    {/* Page Info */}
    <span className="text-sm font-medium text-gray-600">
      Page {pagination.page} of {pagination.total_pages}
    </span>

    {/* Next */}
    <button
      disabled={!pagination.has_next_page}
      onClick={() => setCurrentPage(prev => prev + 1)}
      className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition
        ${!pagination.has_next_page
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:scale-95'
        }`}
    >
      Next
    </button>

  </div>
)}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Invoice;