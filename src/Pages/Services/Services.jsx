import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import Search from "../../components/search/Search";
import Table from "../../components/table/Table";
import service from "../../../public/images/service.png";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Edit3,
  Eye,
  Trash2,
  ArrowDownToLine
} from "lucide-react";

const Services = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const columns = [
    {
      header: "SERVICE ID",
      accessor: "serviceId",
    },
    {
      header: "IMAGE",
      accessor: "image",
      Cell: ({ value }) => (
        <div className="w-[82px] h-[52px] bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
          <img
            src={value}
            alt="Service"
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      header: "SERVICE",
      accessor: "name",
      Cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400 font-normal">Static & dynamic sites</p>
        </div>
      ),
    },
    {
      header: "PRICE",
      accessor: "price",
      Cell: ({ value }) => <span className="text-gray-900 font-semibold">${value}</span>,
    },
    {
      header: "CARD TYPE",
      accessor: "cardType",
    },
    {
      header: "DISCOUNT",
      accessor: "discount",
      Cell: ({ value }) => <span>{value}%</span>,
    },
    {
      header: "STATUS",
      accessor: "status",
      Cell: ({ value }) => {
        const styles = {
          Pending: "bg-[#FFF8E7] text-[#FAB800]",
          Approved: "bg-[#E6F9F0] text-[#00C853]",
          Rejected: "bg-[#FFEBEB] text-[#FF5252]",
        };
        return (
          <span className={`px-4 py-1 rounded-full text-xs font-bold ${styles[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: "ACTION",
      accessor: "action",
      Cell: () => (
        <div className="flex items-center gap-3">
          <button className="text-purple-600 hover:text-purple-800 transition">
            <Edit3 size={18} />
          </button>
          <button className="text-yellow-500 hover:text-yellow-700 transition">
            <Eye size={18} />
          </button>
          <button className="text-red-500 hover:text-red-700 transition">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const tableData = [
    {
      id: 1,
      serviceId: "SER-123",
      image: service,
      name: "Web Developement",
      price: "50",
      cardType: "Premium Card",
      discount: "10",
      status: "Pending",
    },
    {
      id: 2,
      serviceId: "SER-123",
      image: service,
      name: "Web Developement",
      price: "50",
      cardType: "Premium Card",
      discount: "10",
      status: "Approved",
    },
    {
      id: 3,
      serviceId: "SER-123",
      image: service,
      name: "Web Developement",
      price: "50",
      cardType: "Premium Card",
      discount: "10",
      status: "Rejected",
    },
    {
      id: 4,
      serviceId: "SER-123",
      image: service,
      name: "Web Developement",
      price: "50",
      cardType: "Premium Card",
      discount: "10",
      status: "Pending",
    },
    {
      id: 5,
      serviceId: "SER-123",
      image: service,
      name: "Web Developement",
      price: "50",
      cardType: "Premium Card",
      discount: "10",
      status: "Pending",
    },
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = tableData.map((row) => row.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

const handleRowSelect = (id) => {
  setSelectedRows((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};

  return (
    <Layout>
      <div className="p-1 sm:p-2 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Service Management</h1>
            <p className="text-sm text-gray-500">Manage Your Services From Here</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              text="Add Service"
              className="flex-1 sm:flex-none"
              onClick={() => setShowModal(true)}
            />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Total Services"
            amount="2100"
            percentage={42}
            statusText="Increased By Yesterday"
            icon={Briefcase}
          />
          <Card
            title="Pending Services"
            amount="20"
            percentage={-30}
            statusText="Decreased By Yesterday"
            isDecrease
            icon={Clock}
          />
          <Card
            title="Active Services"
            amount="04"
            percentage={42}
            statusText="Increased By Last Month"
            icon={CheckCircle}
          />
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <Search />
        </div>

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4 mb-4">
          {tableData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100">

              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <span className="text-xs text-gray-500">{item.serviceId}</span>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-400">Static & dynamic sites</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-purple-600"><Edit3 size={16} /></button>
                  <button className="text-yellow-500"><Eye size={16} /></button>
                  <button className="text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-gray-900">${item.price}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Card Type</span>
                  <span>{item.cardType}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Discount</span>
                  <span>{item.discount}%</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Pending' ? 'bg-[#FFF8E7] text-[#FAB800]' :
                      item.status === 'Approved' ? 'bg-[#E6F9F0] text-[#00C853]' :
                        'bg-[#FFEBEB] text-[#FF5252]'
                    }`}>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ TABLE VIEW */}
        <div className="hidden md:block">
          <div className="overflow-x-auto pb-4">
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
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-[90]">

          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[420px] rounded-2xl p-6 shadow-lg relative">

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Add Service
            </h2>

            {/* Form */}
            <div className="space-y-4">

              {/* Service Name */}
              <div>
                <label className="text-sm text-black mb-1 block">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="Enter"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-black mb-1 block">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Card Type + Discount */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="text-sm text-black mb-1 block">
                    Card Type
                  </label>
                  <input
                    type="text"
                    placeholder="Select"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="w-1/2">
                  <label className="text-sm text-black mb-1 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-black mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="Enter"
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm text-black mb-1 block">
                  Image
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
                  Upload
                </div>
              </div>

            </div>

            {/* Button */}
            <div className="mt-6 flex justify-center">
              <Button text="Add Service" />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Services;