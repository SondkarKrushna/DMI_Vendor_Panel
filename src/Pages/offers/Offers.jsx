import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import { Tag, SquarePen, Trash2, ArrowDownToLine, Clock, FileSpreadsheet, FileText } from "lucide-react";
import offerImg from "../../../public/images/offer.png";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useGetOffersQuery,
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation
} from "../../redux/api/offersApi";
import { useGetVerticalsQuery } from "../../redux/api/verticalApi";
import Modal, { FormField, FormInput, FormTextarea, ModalSubmitBtn, FormImageUpload, FormSelect } from "../../components/Model";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/dateUtils";


const Offers = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("offersTab") || "Active";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    vertical: "",
    startDate: "",
    endDate: "",
    description: "",
    image: null
  });
  const [errors, setErrors] = useState({});


  const { data, isLoading, isFetching } = useGetOffersQuery({
    page: currentPage,
    status: activeTab === "Active" ? "approved" : activeTab.toLowerCase()
  });
  const { data: verticalsData } = useGetVerticalsQuery();
  const verticals = verticalsData?.data || [];

  const [addOffer, { isLoading: isAdding }] = useAddOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const offers = data?.data || (Array.isArray(data) ? data : []);

  // ✅ Dynamic Stats Cards Mapping with Fallback support

  const verticalMap = useMemo(() => {
    const map = {};
    verticals.forEach((v) => {
      map[v._id] = v.name;
    });
    return map;
  }, [verticals]);

  const statsCards = useMemo(() => {
    // 1. If backend provides the array, use it directly (Parsing percent if needed)
    if (data?.statsCards && Array.isArray(data.statsCards)) {
      return data.statsCards.map(stat => {
        let Icon = Tag;
        const title = stat.title.toLowerCase();
        if (title.includes('active')) Icon = Tag; // Keep Tag or use something else
        if (title.includes('pending')) Icon = Clock;
        if (title.includes('expired')) Icon = Trash2;

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
        title: "Total Offers",
        value: s.total || offers.length || 0,
        percent: s.totalPercent || "0.0%",
        parsedPercent: parseFloat(s.totalPercent) || 0,
        trend: s.totalTrend || "neutral",
        subText: "Total offers created",
        icon: Tag
      },
      {
        title: "Active Offers",
        value: s.active || offers.filter(o => o.status?.toLowerCase() === 'active').length || 0,
        percent: s.activePercent || "0.0%",
        parsedPercent: parseFloat(s.activePercent) || 0,
        trend: s.activeTrend || "neutral",
        subText: "Currently running offers",
        icon: Tag
      },
      {
        title: "Pending Offers",
        value: s.pending || offers.filter(o => o.status?.toLowerCase() === 'pending').length || 0,
        percent: s.pendingPercent || "0.0%",
        parsedPercent: parseFloat(s.pendingPercent) || 0,
        trend: s.pendingTrend || "neutral",
        subText: "Awaiting approval",
        icon: Tag
      },
      {
        title: "Expired Offers",
        value: s.expired || offers.filter(o => o.status?.toLowerCase() === 'expired').length || 0,
        percent: s.expiredPercent || "0.0%",
        parsedPercent: parseFloat(s.expiredPercent) || 0,
        trend: s.expiredTrend || "neutral",
        subText: "Past validity date",
        icon: Tag
      }
    ];
  }, [data, offers]);

  const pagination = data?.pagination || { 
    total: 0, 
    page: 1, 
    per_page: 10, 
    total_pages: 1, 
    has_next_page: false, 
    has_prev_page: false 
  };

  // Sync tab changes to page 1
  useEffect(() => {
    localStorage.setItem("offersTab", activeTab);
    setCurrentPage(1);
  }, [activeTab]);

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      discount: offer.discount,
      vertical: typeof offer.businessVertical === 'object' ? offer.businessVertical._id : offer.businessVertical || "",
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
    if (!formData.vertical) newErrors.vertical = "Vertical is required";
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
    offerData.append("businessVertical", formData.vertical);
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
      vertical: "",
      startDate: "",
      endDate: "",
      description: "",
      image: null
    });
    setErrors({});
  };

  const OfferSkeleton = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse"
      >
        <div className="h-40 w-full bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-10"></div>
          </div>
        </div>
      </div>
    ))
  );

  const exportToExcel = () => {
    if (!offers.length) {
      toast.error("No data to export");
      return;
    }

    const header = [
      ["Sr No", "Offer Title", "Discount (%)", "Start Date", "End Date", "Description"]
    ];

    const data = offers.map((offer, index) => ([
      index + 1,
      offer.title,
      offer.discount,
      formatDate(offer.startDate),
      formatDate(offer.endDate),
      offer.description
    ]));

    const ws = XLSX.utils.aoa_to_sheet([...header, ...data]);

    // ✅ Header Styling
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "7E1080" } }, // Purple header
          alignment: { horizontal: "center" }
        };
      }
    }

    // ✅ Column width
    ws["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Offers");

    XLSX.writeFile(wb, "Offers_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!offers.length) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF();

    const tableColumn = ["Title", "Discount", "Start Date", "End Date", "Description"];
    const tableRows = [];

    offers.forEach((offer) => {
      tableRows.push([
        offer.title,
        `${offer.discount}%`,
        formatDate(offer.startDate),
        formatDate(offer.endDate),
        offer.description,
      ]);
    });

    doc.text("Offers List", 14, 10);

    // ✅ FIXED
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("offers.pdf");
  };

  const OfferListSection = ({ status, onEdit, onDelete }) => {
    const { data, isLoading, isFetching } = useGetOffersQuery({
      page: currentPage,
      status: status === "Active" ? "approved" : status.toLowerCase()
    });

    const offers = data?.data || [];

    if (isLoading || isFetching) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OfferSkeleton />
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <div className="col-span-full flex flex-col justify-center items-center py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Tag className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-base font-medium">
            No {status.toLowerCase()} offers available right now
          </p>
        </div>
      );
    }



    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition"
          >
            <div className="h-40 w-full overflow-hidden relative">
              <img
                src={offer.image || offerImg}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase ${
                  offer.status === 'approved' ? 'bg-green-500 text-white' :
                  offer.status === 'pending' ? 'bg-yellow-400 text-black' :
                  offer.status === 'rejected' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {offer.status}
                </span>
              </div>
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
                    {formatDate(offer.endDate)}
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
                  onClick={() => onEdit(offer)}
                  className="border bg-[#FFEAFF] border-[#7E1080] text-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#7E1080] hover:text-white"
                >
                  <SquarePen size={16} />
                  | Edit Offer Details
                </button>

                <button
                  onClick={() => onDelete(offer._id)}
                  className="border bg-[#FFEAFF] border-[#7E1080] px-3 py-1 rounded-lg text-sm flex items-center justify-center transition-colors hover:bg-red-50"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Offers">
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
                    onClick={() => {
                      exportToExcel();
                      setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Export as Excel
                  </button>

                  <button
                    onClick={() => {
                      exportToPDF();
                      setShowExportOptions(false);
                    }}
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

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statsCards.map((stat, idx) => (
            <Card
              key={idx}
              title={stat.title}
              amount={stat.formatted || stat.value.toString()}
              percentage={stat.parsedPercent || 0}
              statusText={stat.subText || `${stat.trend} change`}
              trend={stat.trend}
              icon={stat.icon || Tag}
            />
          ))}
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
          {["Active", "Pending", "Expired"].map((tabStatus) => (
            <div key={tabStatus} className={activeTab === tabStatus ? "block" : "hidden"}>
              <OfferListSection
                status={tabStatus}
                onEdit={handleEdit}
                onDelete={(id) => setConfirmModal({ show: true, id })}
              />
            </div>
          ))}
        </div>

        {/* Pagination UI */}
        <Pagination 
          pagination={pagination}
          onPageChange={setCurrentPage}
        />

      </div>

      {/* Model */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingOffer ? "Edit Offer" : "Add Offer"}
      >
        <div className="flex flex-col gap-4">
          {/* Image Upload */}
          <FormImageUpload
            label="Upload Image"
            name="image"
            required={!editingOffer}
            onChange={handleChange}
            error={errors.image}
            previewUrl={formData.image ? (formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image) : null}
          />

          {/* Title */}
          <FormField label="Offer Title" error={errors.title} required>
            <FormInput
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g 20% off on dev courses"
              error={errors.title}
            />
          </FormField>

          {/* Discount + Vertical */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount (%)" error={errors.discount} required>
              <FormInput
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="e.g 10"
                min="0"
                max="100"
                error={errors.discount}
              />
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" error={errors.startDate} required>
              <FormInput
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
            </FormField>

            <FormField label="Expiry Date" error={errors.endDate} required>
              <FormInput
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Terms & Conditions" error={errors.description} required>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Terms & Conditions"
              rows={2}
              error={errors.description}
            />
          </FormField>

          <ModalSubmitBtn onClick={handleSubmit} disabled={isAdding || isUpdating}>
            {(isAdding || isUpdating) ? "Processing..." : (editingOffer ? "Update Offer" : "Add Offer")}
          </ModalSubmitBtn>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, id: null })}
        title="Delete Offer"
        className="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Do you really want to delete this offer? This action cannot be undone and the record will be permanently removed.
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
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
            >
              {isDeleting ? <PulseLoader size={8} color="#fff" /> : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Offers;