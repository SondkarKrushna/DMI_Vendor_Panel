import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import SearchBar from "../../components/search/SearchBar";
import Button from "../../components/buttons/Button";
import advertisementImg from "../../../public/images/advertisement.png";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import { ArrowDownToLine } from "react-icons/fi";

import {
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  SquarePen,
  Trash2,
} from "lucide-react";
import { MdArrowForward } from "react-icons/md";
import {
  useGetAdvertisementsQuery,
  useAddAdvertisementMutation,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation
} from "../../redux/api/advertisementsApi";

const Advertisements = () => {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("Classified");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    type: "classified", // defaults to classified
    businessVertical: "",
    title: "",
    description: "",
    endDate: "",
    imageUrl: null
  });

  const tabs = ["Classified", "Commercial"];

  const { data, isLoading, isError } = useGetAdvertisementsQuery({ type: activeTab.toLowerCase() });
  const [addAdvertisement, { isLoading: isAdding }] = useAddAdvertisementMutation();
  const [updateAdvertisement, { isLoading: isUpdating }] = useUpdateAdvertisementMutation();
  const [deleteAdvertisement] = useDeleteAdvertisementMutation();

  const responseData = data?.data || data || {};
  const ads = responseData.ads || (Array.isArray(responseData) ? responseData : []);
  const stats = responseData.stats || { totalAds: 0, activeAds: 0, expiredAds: 0 };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = search === "" || ad.title?.toLowerCase().includes(search.toLowerCase()) || ad.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = businessFilter === 'all' || ad.businessVertical?.toLowerCase() === businessFilter;
    return matchesSearch && matchesFilter;
  });

  const businessVerticalOptions = [
    { label: 'All Business', value: 'all' },
    ...Array.from(new Set(ads.map(a => a.businessVertical).filter(Boolean))).map(val => ({
       label: val,
       value: val.toLowerCase()
    }))
  ];

  const handleEdit = (ad) => {
    setErrors({});
    setEditingAd(ad);
    setFormData({
      type: ad.type || "classified",
      businessVertical: ad.businessVertical || "",
      title: ad.title || "",
      description: ad.description || "",
      endDate: ad.endDate ? ad.endDate.split('T')[0] : "",
      imageUrl: ad.imageUrl || ad.image
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      try {
        await deleteAdvertisement(id).unwrap();
        toast.success("Advertisement deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete advertisement");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageUrl") {
      setFormData({ ...formData, imageUrl: files[0] });
      setErrors({ ...errors, imageUrl: null });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.businessVertical) newErrors.businessVertical = "Business Vertical is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.endDate) newErrors.endDate = "End Date is required";
    if (!editingAd && !formData.imageUrl) newErrors.imageUrl = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const adData = new FormData();
    adData.append("type", formData.type);
    adData.append("businessVertical", formData.businessVertical);
    adData.append("title", formData.title);
    adData.append("description", formData.description);
    adData.append("endDate", formData.endDate);
    if (formData.imageUrl instanceof File) {
      adData.append("imageUrl", formData.imageUrl);
    }

    try {
      if (editingAd) {
        await updateAdvertisement({ id: editingAd._id, data: adData }).unwrap();
        toast.success("Advertisement updated successfully!");
      } else {
        await addAdvertisement(adData).unwrap();
        toast.success("Advertisement added successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setErrors({});
    setFormData({
      type: "classified",
      businessVertical: "",
      title: "",
      description: "",
      endDate: "",
      imageUrl: null
    });
  };

  return (
    <Layout>
      <div className="p-1 sm:p-2 space-y-5 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Advertisements</h1>
            <p className="text-sm text-gray-500">Manage Classified And Commercial Ads</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              text="Add Ad"
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

        {/* Top Cards (4 column grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Total Ads"
            amount={stats.totalAds.toString()}
            percentage={42}
            statusText="Increased by last month"
            icon={Megaphone}
          />
          <Card
            title="Active Ads"
            amount={stats.activeAds.toString()}
            percentage={-30}
            statusText="Decreased by last month"
            isDecrease
            icon={CheckCircle}
          />
          <Card
            title="Expired Ads"
            amount={stats.expiredAds.toString()}
            percentage={42}
            statusText="Increased by last month"
            icon={XCircle}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search advertisements..."
          filters={[
            {
              value: businessFilter,
              onChange: setBusinessFilter,
              options: businessVerticalOptions
            }
          ]}
          actions={[]}
        />

        {/* Advertisement Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-10">
              <PulseLoader color="#7E1080" />
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Megaphone className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">No Advertisements Found</h3>
              <p className="text-sm text-gray-500 mt-1">There are no {activeTab.toLowerCase()} advertisements matching your search/filters right now.</p>
            </div>
          ) : filteredAds.map((item, index) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-md p-3"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={item.imageUrl || item.image || advertisementImg}
                  alt="ad"
                  className="w-full h-32 object-cover rounded-xl"
                />

                {/* Status Badge */}
                <span
                  className={`absolute top-2 right-2 text-xs px-3 py-1 rounded-full text-white ${item.status?.toLowerCase() === 'pending'
                    ? "bg-yellow-400 text-black"
                    : item.status?.toLowerCase() === 'rejected'
                      ? "bg-red-500"
                      : item.status?.toLowerCase() === 'expired'
                        ? "bg-gray-500"
                        : "bg-green-500"
                    }`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              {/* Content */}
              <div className="mt-3">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.businessVertical}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Valid Till {item.endDate ? new Date(item.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-lg bg-purple-100 text-purple-600"
                >
                  <SquarePen size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {isModalOpen && (
        <div
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur"
        >

          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[500px] rounded-2xl p-6 shadow-xl relative"
          >

            <h2 className="text-lg font-semibold mb-4">
              {editingAd ? "Edit Advertisement" : "Add Advertisement"}
            </h2>

            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-medium">
                    Advertisement Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm border ${errors.type ? 'border-red-500' : 'border-transparent'}`}
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="commercial">Commercial</option>
                    <option value="classified">Classified</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black font-medium">
                    Business Vertical <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessVertical"
                    value={formData.businessVertical}
                    onChange={handleChange}
                    className={`px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm border ${errors.businessVertical ? 'border-red-500' : 'border-transparent'}`}
                  >
                    <option value="" disabled>Select Vertical</option>
                    <option value="Education">Education</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Travel & Tourism">Travel & Tourism</option>
                    <option value="Auto & Transport">Auto & Transport</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Others">Others</option>
                  </select>
                  {errors.businessVertical && <p className="text-red-500 text-xs">{errors.businessVertical}</p>}
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">Title <span className="text-red-500">*</span></label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summer Offer Banner"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm border ${errors.title ? 'border-red-500' : 'border-transparent'}`}
                />
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description details..."
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm resize-none border ${errors.description ? 'border-red-500' : 'border-transparent'}`}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>

              {/* Valid Till */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">Valid Till <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm border ${errors.endDate ? 'border-red-500' : 'border-transparent'}`}
                />
                {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
              </div>

              {/* Image */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">
                  Image {!editingAd && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  name="imageUrl"
                  accept="image/*"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm border ${errors.imageUrl ? 'border-red-500' : 'border-transparent'}`}
                />
                {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl}</p>}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img 
                       src={formData.imageUrl instanceof File ? URL.createObjectURL(formData.imageUrl) : formData.imageUrl} 
                       alt="Preview" 
                       className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isAdding || isUpdating}
                  className="px-10 py-3 rounded-xl bg-gradient-to-b from-[#7E1080] to-[#1A031A] text-white font-semibold flex items-center gap-2"
                >
                  {(isAdding || isUpdating) ? (
                    <PulseLoader size={8} color="#fff" />
                  ) : (
                    editingAd ? "Update Ad" : "+ Add Ad"
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
export default Advertisements;