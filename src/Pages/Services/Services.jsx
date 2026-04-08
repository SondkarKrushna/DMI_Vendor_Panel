import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation
} from "../../redux/api/servicesApi";

const Services = () => {
  const [search, setSearch] = useState("");
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
    discount: "",
    description: "",
    image: null
  });
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError } = useGetServicesQuery({ 
    page: currentPage, 
    per_page: 10,
    search: search,
    status: statusFilter === "all" ? undefined : statusFilter
  });
  const [addService, { isLoading: isAdding }] = useAddServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const services = data?.data || (Array.isArray(data) ? data : []);
  const apiStats = data?.stats || {};
  
  const stats = {
    total: apiStats.total || services.length || 0,
    pending: apiStats.pending || services.filter(s => s.status?.toLowerCase() === 'pending').length || 0,
    active: apiStats.active || services.filter(s => s.status?.toLowerCase() === 'active').length || 0,
    inactive: apiStats.inactive || services.filter(s => s.status?.toLowerCase() === 'inactive').length || 0,
  };

  const pagination = data?.pagination || { total: 0, page: currentPage, per_page: 10, total_pages: 1, has_next_page: false, has_prev_page: false };

  const filteredServices = services;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    ...Array.from(new Set(services.map(s => s.status).filter(Boolean))).map(val => ({
      label: val,
      value: val.toLowerCase()
    }))
  ];

  const handleEdit = (service) => {
    setErrors({});
    setEditingService(service);
    setFormData({
      name: service.serviceName,
      price: service.price,
      cardType: service.cardType,
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
        <div>
          {/* ✅ Changed row.name to row.serviceName */}
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
    },
    {
      header: "DISCOUNT",
      accessor: "discountRate",
      Cell: ({ value }) => <span>{value}%</span>,
    },
    {
      header: "STATUS",
      accessor: "status",
      Cell: ({ value }) => {
        const status = value?.toLowerCase();
        const styles = {
          pending: "bg-[#FFF8E7] text-[#FAB800]",
          active: "bg-[#E6F9F0] text-[#00C853]",
          inactive: "bg-[#FFEBEB] text-[#FF5252]",
        };
        return (
          <span className={`px-4 py-1 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: "ACTION",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="text-purple-600 hover:text-purple-800 transition"
          >
            <Edit3 size={18} />
          </button>

          <button
            onClick={() => setViewedCardholder({ ...row, viewType: 'service' })}
            className="text-yellow-500 hover:text-yellow-700 transition"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-500 hover:text-red-700 transition"
          >
            <Trash2 size={18} />
          </button>
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
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              {/* <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" /> */}
              Export
            </button>
          </div>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Total Services"
            amount={stats.total.toString()}
            percentage={42}
            statusText="Increased By Yesterday"
            icon={Briefcase}
          />
          <Card
            title="Pending Services"
            amount={stats.pending.toString()}
            percentage={-30}
            statusText="Decreased By Yesterday"
            isDecrease
            icon={Clock}
          />
          <Card
            title="Active Services"
            amount={stats.active.toString()}
            percentage={42}
            statusText="Increased By Last Month"
            icon={CheckCircle}
          />
          <Card
            title="Inactive Services"
            amount={stats.inactive.toString()}
            percentage={0}
            statusText="Current count"
            icon={Clock}
          />
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#7E1080] rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 animate-pulse font-medium">Loading Services...</p>
            </div>
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
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-purple-600"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewedCardholder({ ...item, viewType: 'service' })}
                    className="text-yellow-500"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="text-yellow-500"><Eye size={16} /></button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
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
                  <span>{item.discountRate}%</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status?.toLowerCase() === 'pending' ? 'bg-[#FFF8E7] text-[#FAB800]' :
                    item.status?.toLowerCase() === 'active' ? 'bg-[#E6F9F0] text-[#00C853]' :
                      'bg-[#FFEBEB] text-[#FF5252]'
                    }`}>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination.total > pagination.per_page && (
          <div className="flex flex-col gap-3 mt-6 items-center justify-between sm:flex-row">
            <div className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.total_pages} — {pagination.total} records
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.has_prev_page}
                className={`px-4 py-2 rounded-lg border transition ${pagination.has_prev_page ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                disabled={!pagination.has_next_page}
                className={`px-4 py-2 rounded-lg border transition ${pagination.has_next_page ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                Next
              </button>
            </div>
          </div>
        )}

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
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

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
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </FormField>

          {/* Price */}
          <FormField label="Price" error={errors.price} required>
            <FormInput
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </FormField>

          {/* Card Type + Discount */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Card Type" error={errors.cardType} required>
              <FormSelect
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                className={errors.cardType ? 'border-red-500' : ''}
              >
                <option value="" disabled>Select Card Type</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
                <option value="Vip">Vip</option>
              </FormSelect>
              {errors.cardType && <p className="text-red-500 text-xs mt-1">{errors.cardType}</p>}
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
                className={errors.discount ? 'border-red-500' : ''}
              />
              {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
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
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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