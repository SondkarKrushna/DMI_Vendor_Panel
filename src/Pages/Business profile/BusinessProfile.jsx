import React from 'react';
import Button from '../../components/buttons/Button';
import { FileText, Upload, User, CheckCircle, SquarePen, ArrowDownToLine, X, Eye, Globe } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useGetProfileQuery, useEditProfileMutation } from '../../redux/api/profileApi';
import { toast } from 'react-toastify';
import { PulseLoader } from 'react-spinners';

const BusinessProfile = () => {
  const { data, isLoading } = useGetProfileQuery();
  const profile = data?.profile;
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
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
    files: {} // Store new files to upload
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

      // 👇 preview logic (same as offers page)
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
    e.preventDefault();
    const formData = new FormData();

    // Basic fields
    formData.append("fullName", editFormData.fullName);
    formData.append("mobile", editFormData.mobile);
    formData.append("email", editFormData.email);

    // Business Profile
    formData.append("businessProfile[businessName]", editFormData.businessName);
    formData.append("businessProfile[businessType]", editFormData.businessType);
    formData.append("businessProfile[description]", editFormData.description);
    formData.append("businessProfile[website]", editFormData.website);
    formData.append("businessProfile[address]", editFormData.address);

    // Services (ARRAY)
    editFormData.services.forEach(service => {
      formData.append("businessProfile[services][]", service);
    });

    // Social Links
    Object.entries(editFormData.socialLinks).forEach(([key, value]) => {
      formData.append(`businessProfile[socialLinks][${key}]`, value);
    });

    // FILES (flat keys)
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7E1080] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading Profile...</p>
      </div>
    </div>
  );

  const docList = [
    { label: "Document 1", title: "Business Proof", key: "businessProof" },
    { label: "Document 2", title: "ID Proof", key: "idProof" },
    { label: "Document 3", title: "Address Proof", key: "addressProof" },
    { label: "Document 5", title: "GST Certificate", key: "gstCertificate" },
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
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
          style={{ background: "linear-gradient(to right, #7E1080, #1A031A)" }}
        >
          <div className="flex items-center gap-5 relative z-10">
            {/* Vendor Logo Placeholder */}
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
                Documents Are Not Verified Yet
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start">

          {/* Business Information */}
          <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6 space-y-4">
            <h3 className="text-[#7E1080] font-semibold text-lg">Business Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.businessType}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.services?.join(" , ")}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.businessName}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  readOnly
                  rows={1}
                  value={profile?.description || "-"}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default resize-none"
                />
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6 space-y-4">
            <h3 className="text-[#7E1080] font-semibold text-lg">Contact Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="text"
                  readOnly
                  value={`+91 ${profile?.mobile}`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.email}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.address}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.website}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6">
          <h3 className="text-[#7E1080] font-semibold text-lg mb-4">Documents</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docList.map((doc, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-4 flex items-center justify-between border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#7E1080] rounded-lg flex items-center justify-center text-white shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{doc.label}</p>
                    <p className="font-semibold text-sm text-gray-800">{doc.title}</p>
                  </div>
                </div>
                {profile?.documents?.[doc.key] && (
                  <button
                    onClick={() => setSelectedDoc({ url: profile.documents[doc.key], title: doc.title })}
                    className="p-2 hover:bg-amber-100 rounded-full transition-colors text-[#7E1080]"
                    title="View Document"
                  >
                    <Eye size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Images */}
        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6">
          <h3 className="text-[#7E1080] font-semibold text-lg mb-4">Images</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Business Logo</p>
              <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                {profile?.businessLogo ? (
                  <img src={profile.businessLogo} alt="Business Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">No Logo Uploaded</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Cover Image</p>
              <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                {profile?.coverImage ? (
                  <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">No Cover Image Uploaded</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Social Media Links */}
        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6">
          <h3 className="text-[#7E1080] font-semibold text-lg mb-4">Social Media Links</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="text"
                readOnly
                value={profile?.socialLinks?.facebook || "-"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="text"
                readOnly
                value={profile?.socialLinks?.instagram || "-"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                readOnly
                value={profile?.socialLinks?.linkedIn || "-"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Youtube</label>
              <input
                type="text"
                readOnly
                value={profile?.socialLinks?.youtube || "-"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Document Viewing Modal */}
        {selectedDoc && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-xl text-gray-800">{selectedDoc.title}</h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 bg-gray-200/50 flex justify-center items-start min-h-[400px]">
                {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={selectedDoc.url}
                    className="w-full h-[70vh] rounded-xl shadow-lg border-none"
                    title="PDF Viewer"
                  />
                ) : (
                  <img
                    src={selectedDoc.url}
                    alt={selectedDoc.title}
                    className="max-w-full h-auto rounded-xl shadow-2xl border-4 border-white"
                  />
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-8 py-3 bg-[#7E1080] text-white rounded-xl font-bold shadow-lg hover:shadow-purple-200 transition-all"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-2xl text-gray-800">Edit Business Profile</h3>
                  <p className="text-sm text-gray-500">Update your account information and visual assets</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-purple-200">
                <form id="edit-profile-form" onSubmit={handleEditSubmit} className="space-y-8">

                  {/* Section: Personal Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                      <User size={16} /> Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={editFormData.fullName}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Mobile Number</label>
                        <input
                          type="text"
                          name="mobile"
                          value={editFormData.mobile}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Profile Photo (Avatar)</label>
                        <input
                          type="file"
                          name="avatar"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#7E1080]/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Business Details */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} /> Business Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Business Name</label>
                        <input
                          type="text"
                          name="businessName"
                          value={editFormData.businessName}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Business Type</label>
                        <input
                          type="text"
                          name="businessType"
                          value={editFormData.businessType}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Services (Press Enter to add)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editFormData.services.map((s, i) => (
                            <span key={i} className="bg-purple-100 text-[#7E1080] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                              {s} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeService(s)} />
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          onKeyDown={handleServiceChange}
                          placeholder="e.g. Web Development"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Business Address</label>
                        <input
                          type="text"
                          name="address"
                          value={editFormData.address}
                          onChange={handleEditChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Description</label>
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditChange}
                          rows={2}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Visual Branding */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                      <Upload size={16} /> Branding & Media
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Business Logo</label>
                        <input
                          type="file"
                          name="businessLogo"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                        />

                        {(previewImages.businessLogo || profile?.businessLogo) && (
                          <div className="mt-2 h-24 w-full rounded-lg overflow-hidden border">
                            <img
                              src={previewImages.businessLogo || profile?.businessLogo}
                              alt="Logo Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Cover Image</label>
                        <input
                          type="file"
                          name="coverImage"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                        />

                        {(previewImages.coverImage || profile?.coverImage) && (
                          <div className="mt-2 h-24 w-full rounded-lg overflow-hidden border">
                            <img
                              src={previewImages.coverImage || profile?.coverImage}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Social Links */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                      <Globe size={16} /> Social Media Links
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['facebook', 'instagram', 'linkedIn', 'youtube'].map(network => (
                        <div key={network}>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1 capitalize">{network}</label>
                          <input
                            type="text"
                            name={`social.${network}`}
                            value={editFormData.socialLinks[network]}
                            onChange={handleEditChange}
                            placeholder={`https://${network}.com/profile`}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7E1080]/20 focus:border-[#7E1080] outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Documents */}
                  {/* <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[#7E1080] uppercase tracking-wider flex items-center gap-2">
                       <CheckCircle size={16} /> Verification Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { name: 'businessProof', label: 'Business Proof' },
                        { name: 'idProof', label: 'ID Proof' },
                        { name: 'addressProof', label: 'Address Proof' },
                        { name: 'gstCertificate', label: 'GST Cert' }
                      ].map(doc => (
                        <div key={doc.name}>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tight">{doc.label}</label>
                          <input type="file" name={doc.name} onChange={handleFileChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-1.5 text-[10px]" />
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">!</div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        <b>Important:</b> Documents are verified by the administration team. Uploading new files will reset your verification status until they are reviewed.
                      </p>
                    </div>
                  </div> */}

                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-white transition-all order-2 md:order-1"
                >
                  Cancel
                </button>
                <button
                  form="edit-profile-form"
                  type="submit"
                  disabled={isUpdating}
                  className="px-10 py-3 bg-[#7E1080] text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 order-1 md:order-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isUpdating ? (
                    <>
                      <PulseLoader color="#ffffff" size={8} />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BusinessProfile;
