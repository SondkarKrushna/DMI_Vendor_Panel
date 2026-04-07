import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import { Tag, SquarePen, Trash2, ArrowDownToLine } from "lucide-react";
import offerImg from "../../../public/images/offer.png";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";
import {
  useGetOffersQuery,
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation
} from "../../redux/api/offersApi";

const Offers = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    startDate: "",
    endDate: "",
    description: "",
    image: null
  });
  const [errors, setErrors] = useState({});


  const { data, isLoading, isError } = useGetOffersQuery({
    page: currentPage,
    status: activeTab.toLowerCase()
  });
  const [addOffer, { isLoading: isAdding }] = useAddOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const offers = data?.data || [];
  const stats = data?.stats || { total: 0, pending: 0, active: 0, expired: 0, rejected: 0 };
  const pagination = data?.pagination || { total: 0, has_next_page: false, has_prev_page: false };

  // Sync tab changes to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      discount: offer.discount,
      startDate: offer.startDate ? offer.startDate.split('T')[0] : "",
      endDate: offer.endDate ? offer.endDate.split('T')[0] : "",
      description: offer.description || "",
      image: offer.image
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmModal.id) return;

    try {
      await deleteOffer(confirmModal.id).unwrap();
      toast.success("Offer deleted successfully!");
      setConfirmModal({ show: false, id: null });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete offer");
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
    if (!formData.title) newErrors.title = "Offer Title is required";
    if (!formData.discount) newErrors.discount = "Discount is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.endDate) newErrors.endDate = "Expiry Date is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!editingOffer && !formData.image) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;


    const offerData = new FormData();
    offerData.append("title", formData.title);
    offerData.append("discount", formData.discount);
    offerData.append("startDate", formData.startDate);
    offerData.append("endDate", formData.endDate);
    offerData.append("description", formData.description);
    if (formData.image instanceof File) {
      offerData.append("image", formData.image);
    }

    try {
      if (editingOffer) {
        await updateOffer({ id: editingOffer._id, data: offerData }).unwrap();
        toast.success("Offer updated successfully!");
      } else {
        await addOffer(offerData).unwrap();
        toast.success("Offer added successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      discount: "",
      startDate: "",
      endDate: "",
      description: "",
      image: null
    });
  };

  return (
    <Layout>
      <div className="p-1 md:p-2 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Offers Management</h1>
            <p className="text-sm text-gray-500">Manage All Offers From Here</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              text="Add Offer"
              className="flex-1 sm:flex-none"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <Card
            title="Total Offers"
            amount={stats.total.toString()}
            percentage={42}
            statusText="Increased by Yesterday"
            icon={Tag}
          />

          <Card
            title="Pending Offers"
            amount={stats.pending.toString()}
            percentage={30}
            statusText="Decreased by Yesterday"
            isDecrease={true}
            icon={Tag}
          />

          <Card
            title="Active Offers"
            amount={stats.active.toString()}
            percentage={42}
            statusText="Increased by Last Month"
            icon={Tag}
          />

          <Card
            title="Expired Offers"
            amount={stats.expired.toString()}
            percentage={42}
            statusText="Increased by Last Month"
            icon={Tag}
          />
        </div>


        {/* Tabs */}
        <div className="flex gap-2 mt-6 flex-wrap">
          {["Active", "Pending", "Expired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 rounded-lg transition 
                  ${activeTab === tab
                  ? "bg-yellow-400 text-black font-semibold"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Offer Cards */}
        <div className="mt-6 bg-gray-100 p-4 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {isLoading ? (
              // ✅ LOADING
              Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow overflow-hidden animate-pulse"
                >
                  <div className="h-40 w-full bg-gray-300" />

                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />

                    <div className="flex gap-2 mt-4">
                      <div className="h-8 bg-gray-300 rounded w-full" />
                      <div className="h-8 bg-gray-300 rounded w-10" />
                    </div>
                  </div>
                </div>
              ))
            ) : offers.length === 0 ? (
              // ✅ EMPTY STATE
              <div className="col-span-full flex justify-center items-center py-10">
                <p className="text-gray-500 text-lg font-medium">
                  No {activeTab.toLowerCase()} offers available right now
                </p>
              </div>
            ) : (
              // ✅ OFFERS LIST
              offers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-md">
                      {offer.title}
                    </h3>

                    <div className="mt-3 text-sm text-gray-600 space-y-2">

                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-medium">{offer.discount}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Valid Till</span>
                        <span className="font-medium">
                          {new Date(offer.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Terms</span>
                        <span className="font-medium text-right max-w-[60%]">
                          {offer.description}
                        </span>
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-between mt-4">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="border bg-[#FFEAFF] border-[#7E1080] text-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#7E1080] hover:text-white"
                      >
                        <SquarePen size={16} />
                        | Edit Offer Details
                      </button>

                      <button
                        onClick={() => setConfirmModal({ show: true, id: offer._id })}
                        className="border bg-[#FFEAFF] border-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Pagination UI */}
        {pagination.total > 10 && (
          <div className="flex justify-center items-center gap-4 mt-10 mb-6">
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
            <span className="text-sm font-medium text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </span>
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

      {/* Model */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-[90]"
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white w-[400px] rounded-2xl p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingOffer ? "Edit Offer" : "Add Offer"}
            </h2>

            <div className="space-y-4">

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Upload Image {!editingOffer && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border ${errors.image ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img
                      src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g 20% off on dev courses"
                  className={`w-full bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Discount (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="e.g 10"
                  min="0"
                  max="100"
                  className={`w-full bg-gray-50 border ${errors.discount ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
              </div>

              {/* Start Date + Date */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1 font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.startDate ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1 font-medium">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.endDate ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-black mb-1 font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter offer description"
                  rows={3}
                  className={`w-full bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

            </div>

            {/* Button */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isAdding || isUpdating}
                className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#7E1080] to-[#1A031A] text-white flex items-center gap-2"
              >
                {(isAdding || isUpdating) ? (
                  <PulseLoader size={8} color="#fff" />
                ) : (
                  editingOffer ? "Update Offer" : "+ Add Offer"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete model */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200">

            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Are you sure?
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Do you want to delete this offer? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ show: false, id: null })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <PulseLoader size={8} color="#fff" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Offers;