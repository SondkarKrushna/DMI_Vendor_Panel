import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import SearchBar from "../../components/search/SearchBar";
import Button from "../../components/buttons/Button";
import advertisementImg from "../../../public/images/advertisement.png";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/dateUtils";


import {
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  SquarePen,
  Trash2,
  ArrowDownToLine,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import Modal, { FormField, FormInput, FormSelect, FormTextarea, FormImageUpload, ModalSubmitBtn } from "../../components/Model";
import { MdArrowForward } from "react-icons/md";
import {
  useGetAdvertisementsQuery,
  useAddAdvertisementMutation,
  useUpdateAdvertisementMutation,
  /* useDeleteAdvertisementMutation */
} from "../../redux/api/advertisementsApi";
import { useGetVerticalsQuery } from "../../redux/api/verticalApi";

const Advertisements = () => {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("Classified");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  /* const [confirmModal, setConfirmModal] = useState({ show: false, id: null }); */
  const [errors, setErrors] = useState({});
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    type: "classified", // defaults to classified
    businessVertical: "",
    title: "",
    description: "",
    endDate: "",
    imageUrl: null
  });

  const tabs = ["Classified", "Commercial"];

  const { data, isLoading, isError, isFetching } = useGetAdvertisementsQuery({ type: activeTab.toLowerCase(), page: currentPage, limit: 10 });
  const [addAdvertisement, { isLoading: isAdding }] = useAddAdvertisementMutation();
  const [updateAdvertisement, { isLoading: isUpdating }] = useUpdateAdvertisementMutation();
  /* const [deleteAdvertisement] = useDeleteAdvertisementMutation(); */

  const { data: verticalsResponse } = useGetVerticalsQuery();
  const verticals = verticalsResponse?.data || [];

  const ads = data?.ads || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  };

  // ✅ Dynamic Stats Cards Mapping with Fallback support
  const verticalMap = useMemo(() => {
    const map = {};
    verticals.forEach((v) => {
      map[v._id] = v.name;
    });
    return map;
  }, [verticals]);

  const statsCards = useMemo(() => {
    // 1. If backend provides statsCards array
    if (data?.statsCards && Array.isArray(data.statsCards)) {
      return data.statsCards.map(stat => {
        let Icon = Megaphone;
        if (stat.title.toLowerCase().includes('active')) Icon = CheckCircle;
        if (stat.title.toLowerCase().includes('expired')) Icon = XCircle;

        return {
          ...stat,
          parsedPercent: parseFloat(stat.percent?.replace(/[+%]/g, '')) || 0,
          icon: Icon
        };
      });
    }

    // 2. Otherwise, map from legacy stats object (Fallback)
    const s = data?.stats || {};
    return [
      {
        title: "Total Ads",
        value: s.totalAds || s.total || ads.length || 0,
        percent: s.totalPercent || "0.0%",
        parsedPercent: parseFloat(s.totalPercent) || 0,
        trend: s.totalTrend || "neutral",
        subText: "Combined classified & commercial",
        icon: Megaphone
      },
      {
        title: "Active Ads",
        value: data?.stats?.activeAds ?? ads.filter(a => a.status?.toLowerCase() === 'active').length,
        percent: data?.stats?.activePercent || "0.0%",
        parsedPercent: parseFloat(data?.stats?.activePercent) || 0,
        trend: data?.stats?.activeTrend || "neutral",
        subText: "Currently visible to users",
        icon: CheckCircle
      },
      {
        title: "Expired Ads",
        value: s.expiredAds || s.expired || ads.filter(a => a.status?.toLowerCase() === 'expired').length || 0,
        percent: s.expiredPercent || "0.0%",
        parsedPercent: parseFloat(s.expiredPercent) || 0,
        trend: s.expiredTrend || "neutral",
        subText: "Past validity period",
        icon: XCircle
      }
    ];
  }, [data, ads]);

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = search === "" || ad.title?.toLowerCase().includes(search.toLowerCase()) || ad.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = businessFilter === 'all' || ad.businessVertical === businessFilter;
    return matchesSearch && matchesFilter;
  });

  const businessVerticalOptions = [
    { label: 'All Business', value: 'all' },
    ...verticals.map(v => ({
      label: v.name,
      value: v._id
    }))
  ];

  const exportToExcel = () => {
    if (!filteredAds.length) { toast.error("No data to export"); return; }
    const header = [["Title", "Business Vertical", "Type", "Status", "Valid Till"]];
    const rows = filteredAds.map((ad) => [
      ad.title, ad.businessVertical, ad.type,
      ad.status || "Pending",
      formatDate(ad.endDate)
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 28 }, { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advertisements");
    XLSX.writeFile(wb, "Advertisements_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!filteredAds.length) { toast.error("No data to export"); return; }
    const doc = new jsPDF();
    doc.text("Advertisements List", 14, 10);
    autoTable(doc, {
      head: [["Title", "Business Vertical", "Type", "Status", "Valid Till"]],
      body: filteredAds.map((ad) => [
        ad.title, ad.businessVertical, ad.type,
        ad.status || "Pending",
        formatDate(ad.endDate)
      ]),
      startY: 20,
    });
    doc.save("advertisements.pdf");
  };

  const handleEdit = (ad) => {
    setErrors({});
    setEditingAd(ad);
    setFormData({
      type: ad.type || "classified",
      businessVertical: typeof ad.businessVertical === 'object' ? ad.businessVertical._id : ad.businessVertical || "",
      title: ad.title || "",
      description: ad.description || "",
      endDate: ad.endDate ? ad.endDate.split('T')[0] : "",
      imageUrl: ad.imageUrl || ad.image
    });
    setIsModalOpen(true);
  };

  /*
  const handleDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await deleteAdvertisement(confirmModal.id).unwrap();
      toast.success("Advertisement deleted successfully!");
      setConfirmModal({ show: false, id: null });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete advertisement");
    }
  };
  */
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
    <Layout title="Advertisements">
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
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(prev => !prev)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statsCards.map((stat, idx) => (
            <Card
              key={idx}
              title={stat.title}
              amount={stat.formatted || stat.value.toString()}
              percentage={stat.parsedPercent || 0}
              statusText={stat.subText || `${stat.trend} change`}
              trend={stat.trend}
              icon={stat.icon || Megaphone}
            />
          ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-[#F3F4F6] rounded-3xl">
          {isLoading || (data && !ads.length && isLoading) || (data && isFetching) ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[24px] shadow-sm p-4 border border-gray-100 animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="w-full h-44 bg-gray-200 rounded-[18px] mb-4"></div>

                {/* Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

                {/* Subtitle */}
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>

                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredAds.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <Megaphone className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">No Advertisements Found</h3>
            </div>
          ) : filteredAds.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-[24px] shadow-sm p-4 flex flex-col border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative mb-4">
                <img
                  src={item.imageUrl || item.image || advertisementImg}
                  alt="ad"
                  className="w-full h-44 object-cover rounded-[18px]"
                />

                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm min-w-[85px] text-center inline-block ${item.status?.toLowerCase() === 'pending'
                      ? "bg-[#FAB800] text-black"
                      : item.status?.toLowerCase() === 'rejected'
                        ? "bg-[#FF0000] text-white"
                        : "bg-[#00B01D] text-white"
                      }`}
                  >
                    {item.status || "Pending"}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 px-1">
                <h3 className="text-[17px] font-bold text-black leading-tight">
                  {item.title || "Free IT Courses"}
                </h3>
                <p className="text-[14px] text-gray-500 font-medium mt-0.5">
                  {typeof item.businessVertical === 'object' 
                    ? item.businessVertical.name 
                    : (verticalMap[item.businessVertical] || item.businessVertical || "General")}
                </p>

                {/* Footer: Date and Buttons */}
                <div className="flex justify-between items-center mt-6">
                  <p className="text-[13px] font-semibold text-gray-800">
                    Valid Till {formatDate(item.endDate)}
                  </p>

                  <div className="flex gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FBE8FF] border border-[#E9D5FF] transition-transform active:scale-95"
                    >
                      <SquarePen size={18} className="text-[#7E1080]" />
                    </button>
                    {/* Delete Button (Commented)
                    <button
                      onClick={() => setConfirmModal({ show: true, id: item._id })}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FBE8FF] border border-[#E9D5FF] transition-transform active:scale-95"
                    >
                      <Trash2 size={18} className="text-[#FF0000]" />
                    </button>
                    */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination pagination={pagination} onPageChange={setCurrentPage} />
      </div>
      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingAd ? "Edit Advertisement" : "Add Advertisement"}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Advertisement Type" error={errors.type} required>
              <FormSelect
                name="type"
                value={formData.type}
                onChange={handleChange}
                error={errors.type}
              >
                <option value="" disabled>Select Type</option>
                <option value="commercial">Commercial</option>
                <option value="classified">Classified</option>
              </FormSelect>
            </FormField>

            <FormField label="Business Vertical" error={errors.businessVertical} required>
              <FormSelect
                name="businessVertical"
                value={formData.businessVertical}
                onChange={handleChange}
                error={errors.businessVertical}
              >
                <option value="" disabled>Select Vertical</option>
                {verticals.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>

          <FormField label="Title" error={errors.title} required>
            <FormInput
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Summer Offer Banner"
              error={errors.title}
            />
          </FormField>

          <FormField label="Description" error={errors.description} required>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter advertisement details..."
              rows={2}
              error={errors.description}
            />
          </FormField>

          <FormField label="Valid Till" error={errors.endDate} required>
            <FormInput
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
            />
          </FormField>

          <FormImageUpload
            label="Advertisement Banner"
            name="imageUrl"
            onChange={handleChange}
            error={errors.imageUrl}
            required={!editingAd}
            previewUrl={formData.imageUrl ? (formData.imageUrl instanceof File ? URL.createObjectURL(formData.imageUrl) : formData.imageUrl) : null}
          />

          <ModalSubmitBtn onClick={handleSubmit} disabled={isAdding || isUpdating}>
            {(isAdding || isUpdating) ? "Processing..." : (editingAd ? "Update Advertisement" : "Add Advertisement")}
          </ModalSubmitBtn>
        </div>
      </Modal>

      {/* Delete Confirmation Modal (Commented Out)
      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, id: null })}
        title="Delete Advertisement"
        className="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Do you want to delete this advertisement? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ show: false, id: null })}
              className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
      */}

    </Layout>
  );
};
export default Advertisements;