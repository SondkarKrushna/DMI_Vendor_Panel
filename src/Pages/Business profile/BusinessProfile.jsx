import React from 'react';
import Button from '../../components/buttons/Button';
import { FileText, User, CheckCircle, SquarePen, ArrowDownToLine, X, Eye, Globe, FileSpreadsheet, Briefcase, Upload } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useGetProfileQuery, useEditProfileMutation } from '../../redux/api/profileApi';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal, { FormField, FormInput, FormTextarea, FormImageUpload, ModalSubmitBtn } from '../../components/Model';

const BusinessProfile = () => {
  const { data, isLoading } = useGetProfileQuery();
  const profile = data?.profile;
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [showExportOptions, setShowExportOptions] = React.useState(false);
  const [previewImages, setPreviewImages] = React.useState({
    businessLogo: null,
    coverImage: null,
    avatar: null
  });

  const [editProfile, { isLoading: isUpdating }] = useEditProfileMutation();

  const [editFormData, setEditFormData] = React.useState({
    fullName: "",
    businessName: "",
    businessType: "",
    description: "",
    website: "",
    address: "",
    mobile: "",
    email: "",
    services: [],
    socialLinks: { facebook: "", instagram: "", linkedIn: "", youtube: "" },
    files: {}
  });

  // Sync edit data when modal opens
  React.useEffect(() => {
    if (isEditModalOpen && profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        businessName: profile.businessName || "",
        businessType: profile.businessType || "",
        description: profile.description || "",
        website: profile.website || "",
        address: profile.address || "",
        mobile: profile.mobile || "",
        email: profile.email || "",
        services: [...(profile.services || [])],
        socialLinks: { ...(profile.socialLinks || {}) },
        files: {}
      });
      // Clear previews when opening
      setPreviewImages({ businessLogo: null, coverImage: null, avatar: null });
    }
  }, [isEditModalOpen, profile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setEditFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name.includes("social.")) {
      const field = name.split(".")[1];
      setEditFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const file = files[0];
      setEditFormData(prev => ({
        ...prev,
        files: { ...prev.files, [name]: file }
      }));
      setPreviewImages(prev => ({
        ...prev,
        [name]: URL.createObjectURL(file)
      }));
    }
  };

  const handleServiceChange = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newService = e.target.value.trim();
      if (!editFormData.services.includes(newService)) {
        setEditFormData(prev => ({
          ...prev,
          services: [...prev.services, newService]
        }));
      }
      e.target.value = '';
    }
  };

  const removeService = (service) => {
    setEditFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    const formData = new FormData();

    formData.append("fullName", editFormData.fullName);
    formData.append("mobile", editFormData.mobile);
    formData.append("email", editFormData.email);
    formData.append("businessProfile[businessName]", editFormData.businessName);
    formData.append("businessProfile[businessType]", editFormData.businessType);
    formData.append("businessProfile[description]", editFormData.description);
    formData.append("businessProfile[website]", editFormData.website);
    formData.append("businessProfile[address]", editFormData.address);

    editFormData.services.forEach(service => {
      formData.append("businessProfile[services][]", service);
    });

    Object.entries(editFormData.socialLinks).forEach(([key, value]) => {
      formData.append(`businessProfile[socialLinks][${key}]`, value);
    });

    Object.entries(editFormData.files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    try {
      await editProfile(formData).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const exportToExcel = () => {
    if (!profile) return;
    const header = [["Field", "Value"]];
    const rows = [
      ["Business Name", profile.businessName || "—"],
      ["Business Type", profile.businessType || "—"],
      ["Full Name", profile.fullName || "—"],
      ["Mobile", profile.mobile || "—"],
      ["Email", profile.email || "—"],
      ["Services", (profile.services || []).join(", ") || "—"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BusinessProfile");
    XLSX.writeFile(wb, "BusinessProfile_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!profile) return;
    const doc = new jsPDF();
    doc.text("Business Profile Report", 14, 10);
    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["Business Name", profile.businessName || "—"],
        ["Business Type", profile.businessType || "—"],
        ["Full Name", profile.fullName || "—"],
        ["Mobile", profile.mobile || "—"],
        ["Email", profile.email || "—"],
      ],
      startY: 20,
    });
    doc.save("business_profile.pdf");
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#7E1080] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading Profile...</p>
      </div>
    </div>
  );

  const docList = [
    { label: "Document 1", title: "Business Proof", key: "businessProof" },
    { label: "Document 2", title: "ID Proof", key: "idProof" },
    { label: "Document 3", title: "Address Proof", key: "addressProof" },
    { label: "Document 4", title: "GST Certificate", key: "gstCertificate" },
  ];

  return (
    <Layout>
      <div className="p-1 sm:p-4 md:p-6 space-y-6 bg-white min-h-screen pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Business Profile</h1>
            <p className="text-gray-500 text-sm">Manage Your Business Information And Branding</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              text="Edit Profile"
              icon={SquarePen}
              className="flex-1 sm:flex-none"
              onClick={() => setIsEditModalOpen(true)}
            />
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
                    Excel
                  </button>
                  <button
                    onClick={() => { exportToPDF(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileText size={16} className="text-red-500" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
          style={{ background: "linear-gradient(to right, #7E1080, #1A031A)" }}
        >
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              {profile?.businessLogo ? (
                <img src={profile.businessLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-[#7E1080]" />
              )}
            </div>
            <div className="text-white">
              <h2 className="text-xl sm:text-2xl font-bold">{profile?.businessName || "-"}</h2>
              <p className="text-white/80 text-sm">{profile?.businessType || "-"}</p>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            {profile?.isVerifiedVendor ? (
              <div className="flex items-center gap-2 border border-green-400 bg-green-500/10 px-4 py-2 rounded-full text-green-600 text-sm font-medium">
                <CheckCircle size={16} />
                Verified Vendor
              </div>
            ) : (
              <div className="flex items-center gap-2 border border-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-full text-yellow-600 text-sm font-medium">
                <X size={16} />
                Documents Pending Verification
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Business Information */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-6 space-y-4 shadow-sm">
            <h3 className="text-[#7E1080] font-bold flex items-center gap-2"><Briefcase size={20}/> Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Business Type</label>
                <p className="text-sm text-gray-700 font-medium px-1 mt-1">{profile?.businessType || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Services</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.services?.map((s, i) => (
                    <span key={i} className="bg-purple-50 text-[#7E1080] px-3 py-1 rounded-lg text-xs font-bold border border-purple-100">{s}</span>
                  )) || "-"}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <p className="text-sm text-gray-700 leading-relaxed px-1 mt-1">{profile?.description || "-"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-6 space-y-4 shadow-sm">
            <h3 className="text-[#7E1080] font-bold flex items-center gap-2"><Globe size={20}/> Contact details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Contact No</label>
                <p className="text-sm text-gray-700 font-medium px-1 mt-1">+91 {profile?.mobile || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <p className="text-sm text-gray-700 font-medium px-1 mt-1">{profile?.email || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                <p className="text-sm text-gray-700 font-medium px-1 mt-1">{profile?.address || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-6 shadow-sm">
          <h3 className="text-[#7E1080] font-bold mb-4 flex items-center gap-2"><FileText size={20}/> Verification Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {docList.map((doc, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 hover:border-purple-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">{doc.label}</p>
                    <p className="font-bold text-sm text-gray-800">{doc.title}</p>
                  </div>
                </div>
                {profile?.documents?.[doc.key] && (
                  <button
                    onClick={() => setSelectedDoc({ url: profile.documents[doc.key], title: doc.title })}
                    className="p-2 bg-white shadow-sm hover:shadow-md rounded-full transition-all text-[#7E1080]"
                  >
                    <Eye size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Modals */}
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={selectedDoc?.title || "Document Preview"}
          className="max-w-4xl"
        >
          <div className="flex-1 overflow-auto bg-gray-50/50 flex justify-center items-start min-h-[400px] rounded-2xl border border-gray-100 p-2">
            {selectedDoc?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={selectedDoc.url}
                className="w-full h-[70vh] rounded-xl shadow-lg border-none"
                title="PDF Viewer"
              />
            ) : (
              <img
                src={selectedDoc?.url}
                alt={selectedDoc?.title}
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Business Profile"
          className="max-w-4xl"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                <User size={16} /> Personal Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <FormInput name="fullName" value={editFormData.fullName} onChange={handleEditChange} />
                </FormField>
                <FormField label="Email" required>
                  <FormInput type="email" name="email" value={editFormData.email} onChange={handleEditChange} />
                </FormField>
                <FormField label="Mobile" required>
                  <FormInput name="mobile" value={editFormData.mobile} onChange={handleEditChange} />
                </FormField>
                <FormField label="Website">
                  <FormInput name="website" value={editFormData.website} onChange={handleEditChange} />
                </FormField>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} /> Business Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Business Name" required>
                  <FormInput name="businessName" value={editFormData.businessName} onChange={handleEditChange} />
                </FormField>
                <FormField label="Business Type" required>
                  <FormInput name="businessType" value={editFormData.businessType} onChange={handleEditChange} />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Services (Press Enter)">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editFormData.services.map((s, i) => (
                        <span key={i} className="bg-purple-50 text-[#7E1080] px-3 py-1 rounded-lg text-xs font-bold border border-purple-100 flex items-center gap-2">
                          {s} <X size={14} className="cursor-pointer" onClick={() => removeService(s)} />
                        </span>
                      ))}
                    </div>
                    <FormInput onKeyDown={handleServiceChange} placeholder="Type and press enter" />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Address" required>
                    <FormInput name="address" value={editFormData.address} onChange={handleEditChange} />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="About Business" required>
                    <FormTextarea name="description" value={editFormData.description} onChange={handleEditChange} rows={3} />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                <Upload size={16} /> Branding
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormImageUpload
                  label="Business Logo"
                  name="businessLogo"
                  onChange={handleFileChange}
                  previewUrl={previewImages.businessLogo || profile?.businessLogo}
                />
                <FormImageUpload
                  label="Cover Image"
                  name="coverImage"
                  onChange={handleFileChange}
                  previewUrl={previewImages.coverImage || profile?.coverImage}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} /> Verification Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docList.map(doc => (
                  <div key={doc.key} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">{doc.title}</label>
                    <input 
                      type="file" 
                      name={doc.key} 
                      onChange={handleFileChange} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 text-xs font-bold">!</div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <b>Verification Notice:</b> Uploading new documents will initiate a re-verification process by our team. Your status may temporarily change to "Pending" during this review.
                </p>
              </div>
            </div>

            <ModalSubmitBtn onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Profile Changes"}
            </ModalSubmitBtn>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default BusinessProfile;
