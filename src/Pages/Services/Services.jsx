import React, { useState, useEffect, useMemo } from "react";
import useDebounce from "../../hooks/useDebounce";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import SearchBar from "../../components/search/SearchBar";
import Table from "../../components/table/Table";
import CardholderDetailsModal from "../../components/CardholderDetailsModal";
import Modal, { FormField, FormInput, FormSelect, FormTextarea, ModalSubmitBtn, FormImageUpload } from "../../components/Model";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Edit3,
  Eye,
  Trash2,
  ArrowDownToLine,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation
} from "../../redux/api/servicesApi";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Pagination";
import { useGetCardsQuery } from "../../redux/api/cardApi";
import { useGetVerticalsQuery } from "../../redux/api/verticalApi";

const Services = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewedCardholder, setViewedCardholder] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cardType: "",
    vertical: "",
    discount: "",
    description: "",
    image: null
  });
  const [errors, setErrors] = useState({});

  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportToExcel = () => {
    if (!services.length) { toast.error("No data to export"); return; }
    const header = [["Service ID", "Service Name", "Price", "Card Type", "Discount (%)", "Status", "Description"]];
    const rows = services.map((s) => [s.serviceId, s.serviceName, s.price, s.cardType, s.discountRate, s.status, s.description]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 16 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 35 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Services");
    XLSX.writeFile(wb, "Services_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!services.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("Services List", 14, 10);
    autoTable(doc, {
      head: [["Service ID", "Name", "Price", "Card Type", "Discount", "Status"]],
      body: services.map((s) => [s.serviceId, s.serviceName, `$${s.price}`, s.cardType, `${s.discountRate}%`, s.status]),
      startY: 20,
    });
    doc.save("services.pdf");
  };

  const { data, isLoading, isError, isFetching } = useGetServicesQuery({
    page: currentPage,
    per_page: 10,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter
  });
  const [addService, { isLoading: isAdding }] = useAddServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const { data: verticalsResponse } = useGetVerticalsQuery();
  const verticals = verticalsResponse?.data || [];

  const services = data?.data || (Array.isArray(data) ? data : []);

  const { data: cardsResponse, isLoading: cardsLoading } = useGetCardsQuery();

  const cardTypes = cardsResponse?.data || [];

  // ✅ Dynamic Stats Cards Mapping with Fallback support
  const statsCards = useMemo(() => {
    // 1. If backend provides the array, use it directly (Parsing percent if needed)
    if (data?.statsCards && Array.isArray(data.statsCards)) {
      return data.statsCards.map(stat => ({
        ...stat,
        parsedPercent: parseFloat(stat.percent?.replace(/[+%]/g, '')) || 0,
        icon: stat.icon || Briefcase
      }));
    }

    // 2. Otherwise, map from legacy stats object (Fallback)
    const s = data?.stats || {};
    return [
      {
        title: "Total Services",
        value: s.total || services.length || 0,
        percent: s.totalPercent || "0.0%",
        parsedPercent: parseFloat(s.totalPercent) || 0,
        trend: s.totalTrend || "neutral",
        subText: "Combined across all types",
        icon: Briefcase
      },
      {
        title: "Pending Services",
        value: s.pending || services.filter(s => s.status?.toLowerCase() === 'pending').length || 0,
        percent: s.pendingPercent || "0.0%",
        parsedPercent: parseFloat(s.pendingPercent) || 0,
        trend: s.pendingTrend || "neutral",
        subText: "Awaiting verification",
        icon: Clock
      },
      {
        title: "Active Services",
        value: s.active || services.filter(s => s.status?.toLowerCase() === 'active').length || 0,
        percent: s.activePercent || "42%",
        parsedPercent: parseFloat(s.activePercent) || 0,
        trend: s.activeTrend || "up",
        subText: "Visible on customer app",
        icon: CheckCircle
      },
      {
        title: "Inactive Services",
        value: s.inactive || services.filter(s => s.status?.toLowerCase() === 'inactive').length || 0,
        percent: s.inactivePercent || "0%",
        parsedPercent: parseFloat(s.inactivePercent) || 0,
        trend: s.inactiveTrend || "neutral",
        subText: "Currently disabled",
        icon: Clock
      }
    ];
  }, [data, services]);

  const pagination = data?.pagination || { total: 0, page: currentPage, per_page: 10, total_pages: 1, has_next_page: false, has_prev_page: false };

  const filteredServices = services;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    // { label: 'Approved', value: 'approved' },
    // { label: 'Inactive', value: 'inactive' },
  ];

  const handleEdit = (service) => {
    setErrors({});
    setEditingService(service);
    setFormData({
      name: service.serviceName,
      price: service.price,
      cardType: (service.cardType && typeof service.cardType === 'object') ? service.cardType._id : (cardTypes.find(c => c.name === service.cardType)?._id || service.cardType),
      vertical: (service.vertical && typeof service.vertical === 'object') ? service.vertical._id : service.vertical || "",
      discount: service.discountRate,
      description: service.description || "",
      image: service.image
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id).unwrap();
        toast.success("Service deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete service");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
      setErrors({ ...errors, image: null });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Service Name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.cardType) newErrors.cardType = "Card Type is required";
    if (!formData.vertical) newErrors.vertical = "Vertical is required";
    if (formData.discount === "") newErrors.discount = "Discount is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!editingService && !formData.image) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const serviceData = new FormData();
    serviceData.append("serviceName", formData.name);
    serviceData.append("price", formData.price);
    serviceData.append("cardType", formData.cardType);
    serviceData.append("businessVertical", formData.vertical);
    serviceData.append("discountRate", formData.discount);
    serviceData.append("description", formData.description);
    if (formData.image instanceof File) {
      serviceData.append("image", formData.image);
    }

    try {
      if (editingService) {
        await updateService({ id: editingService._id, data: serviceData }).unwrap();
        toast.success("Service updated successfully!");
      } else {
        await addService(serviceData).unwrap();
        toast.success("Service added successfully!");
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setErrors({});
    setFormData({
      name: "",
      price: "",
      cardType: "",
      vertical: "",
      discount: "",
      description: "",
      image: null
    });
  };
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
      accessor: "serviceName",
      Cell: ({ row }) => (
        <div className="flex flex-col">
          <p className="font-semibold text-gray-900">{row.serviceName}</p>
          <p className="text-xs text-gray-400 font-normal truncate max-w-[150px]">{row.description || "N/A"}</p>
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
      Cell: ({ value }) => {
        if (typeof value === 'object' && value?.name) return value.name;
        return cardTypeMap[value] || value || "—";
      },
    },
    {
      header: "DISCOUNT",
      accessor: "discountRate",
      Cell: ({ value }) => <span>{value}%</span>,
    },
    {
      header: "STATUS",
      accessor: "status",
      Cell: ({ value }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${value?.toLowerCase() === 'pending' ? 'bg-[#FFF8E7] text-[#FAB800]' :
          value?.toLowerCase() === 'active' || value?.toLowerCase() === 'approved' ? 'bg-[#E6F9F0] text-[#00C853]' :
            'bg-[#FFEBEB] text-[#FF5252]'
          }`}>
          {value || 'Pending'}
        </span>
      ),
    },
    {
      header: "ACTION",
      accessor: "_id",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          {/* <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-purple-600 transition-colors"
          >
            <Edit3 size={18} />
          </button> */}
          <button
            onClick={() => setViewedCardholder({ ...row, viewType: 'service' })}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-yellow-500 transition-colors"
          >
            <Eye size={18} />
          </button>
          {/* <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button> */}
        </div>
      ),
    },
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = filteredServices.map((row) => row._id);
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

  const cardTypeMap = useMemo(() => {
    const map = {};
    cardTypes.forEach((c) => {
      map[c._id] = c.name;
    });
    return map;
  }, [cardTypes]);

  const verticalMap = useMemo(() => {
    const map = {};
    verticals.forEach((v) => {
      map[v._id] = v.name;
    });
    return map;
  }, [verticals]);

  return (
    <Layout title="Services">
      <div className="p-1 sm:p-2 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Service Management</h1>
            <p className="text-sm text-gray-500">Manage Your Services From Here</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* <Button
              text="Add Service"
              className="flex-1 sm:flex-none"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            /> */}
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

        {/* Dynamic Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <Card
              key={idx}
              title={stat.title}
              amount={stat.formatted || stat.value.toString()}
              percentage={stat.parsedPercent || 0}
              statusText={stat.subText || `${stat.trend} change`}
              trend={stat.trend}
              isDecrease={stat.trend === "down"}
              icon={stat.icon || Briefcase}
            />
          ))}
        </div>

        {/* Search Section */}
        <div className="mb-6 mt-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search services..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: statusOptions
              }
            ]}
            actions={[]}
          />
        </div>

        {/* ✅ MOBILE VIEW */}
        <div className="block md:hidden space-y-4 mb-4">
          {isLoading || isFetching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No Services Found</h3>
            </div>
          ) : filteredServices.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-4 space-y-3 border border-gray-100">

              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <img src={item.image} alt={item.serviceName} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <span className="text-xs text-gray-500">{item.serviceId}</span>
                    <h3 className="font-semibold text-gray-800">{item.serviceName}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{item.description || "N/A"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* <button
                    onClick={() => handleEdit(item)}
                    className="text-purple-600"
                  >
                    <Edit3 size={16} />
                  </button> */}
                  <button
                    onClick={() => setViewedCardholder({ ...item, viewType: 'service' })}
                    className="text-yellow-500"
                  >
                    <Eye size={16} />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button> */}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-gray-900">${item.price}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Card Type</span>
                  <span>
                    {(item.cardType && typeof item.cardType === 'object') ? item.cardType.name : (cardTypeMap[item.cardType] || item.cardType || "—")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status?.toLowerCase() === 'pending' ? 'bg-[#FFF8E7] text-[#FAB800]' :
                    item.status?.toLowerCase() === 'active' || item.status?.toLowerCase() === 'approved' ? 'bg-[#E6F9F0] text-[#00C853]' :
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
                data={filteredServices}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                isLoading={isLoading || isFetching}
              />
            </div>
          </div>
        </div>
        <Pagination
          pagination={pagination}
          onPageChange={setCurrentPage}
        />

      </div>
      {/* Model */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingService ? "Edit Service" : "Add Service"}
      >
        <div className="flex flex-col gap-4">
          {/* Service Name */}
          <FormField label="Service Name" error={errors.name} required>
            <FormInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter service name"
              error={errors.name}
            />
          </FormField>

          {/* Price + Discount */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price" error={errors.price} required>
              <FormInput
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                error={errors.price}
              />
            </FormField>

            <FormField label="Discount (%)" error={errors.discount} required>
              <FormInput
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                error={errors.discount}
              />
            </FormField>
          </div>

          {/* Card Type + Vertical */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Card Type" error={errors.cardType} required>
              <FormSelect
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                error={errors.cardType}
              >
                <option value="">Select Card Type</option>

                {cardsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  cardTypes.map((card) => (
                    <option key={card._id} value={card._id}>
                      {card.name}
                    </option>
                  ))
                )}
              </FormSelect>
            </FormField>

            <FormField label="Vertical" error={errors.vertical} required>
              <FormSelect
                name="vertical"
                value={formData.vertical}
                onChange={handleChange}
                error={errors.vertical}
              >
                <option value="">Select Vertical</option>
                {verticals.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description" error={errors.description} required>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={2}
              error={errors.description}
            />
          </FormField>

          {/* Image Upload */}
          <FormImageUpload
            label="Image"
            name="image"
            onChange={handleChange}
            error={errors.image}
            required={!editingService}
            previewUrl={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
          />

          <ModalSubmitBtn onClick={handleSubmit} disabled={isAdding || isUpdating}>
            {(isAdding || isUpdating) ? "Processing..." : (editingService ? "Update Service" : "Add Service")}
          </ModalSubmitBtn>
        </div>
      </Modal>
      <CardholderDetailsModal
        isOpen={!!viewedCardholder}
        onClose={() => setViewedCardholder(null)}
        data={viewedCardholder}
      />
    </Layout>
  );
};
export default Services;