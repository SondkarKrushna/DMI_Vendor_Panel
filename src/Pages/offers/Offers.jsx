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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    startDate: "",
    endDate: "",
    description: "",
    image: null
  });

  const { data, isLoading, isError } = useGetOffersQuery();
  const [addOffer, { isLoading: isAdding }] = useAddOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const offers = data?.data || [];

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteOffer(id).unwrap();
        toast.success("Offer deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete offer");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
            amount={offers.length.toString()}
            percentage={42}
            statusText="Increased by Yesterday"
            icon={Tag}
          />

          <Card
            title="Pending Offers"
            amount="20"
            percentage={30}
            statusText="Decreased by Yesterday"
            isDecrease={true}
            icon={Tag}
          />

          <Card
            title="Active Offers"
            amount={offers.filter(o => o.status === 'active').length.toString()}
            percentage={42}
            statusText="Increased by Last Month"
            icon={Tag}
          />

          <Card
            title="Expired Offers"
            amount={offers.filter(o => o.status === 'expired').length.toString()}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

          {isLoading
            ? Array(6).fill(0).map((_, i) => (
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
            : offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-xl shadow overflow-hidden"
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

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>
                      Discount:{" "}
                      <span className="font-medium">
                        {offer.discount}%
                      </span>
                    </p>

                    <p>
                      Valid Till:{" "}
                      <span className="font-medium">
                        {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </p>

                    <p>
                      Status:{" "}
                      <span className="font-medium capitalize">
                        {offer.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-between mt-4">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="border bg-[#FFEAFF] border-[#7E1080] text-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <SquarePen size={16} />
                      Edit
                    </button>

                    <button 
                      onClick={() => handleDelete(offer._id)}
                      className="border bg-[#FFEAFF] border-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

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
                <label className="block text-sm text-black mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Offer Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g 20% off on dev courses"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  required
                  placeholder="e.g 10"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Start Date + Date */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter offer description"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
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
    </Layout>
  );
};

export default Offers;