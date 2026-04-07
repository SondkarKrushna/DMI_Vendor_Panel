import React from 'react';
import Button from '../../components/buttons/Button';
import { FileText, Upload, User, CheckCircle, SquarePen, ArrowDownToLine } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const BusinessProfile = () => {
  return (
    <Layout>
      <div className="p-1 sm:p-2 space-y-6 bg-white min-h-screen pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Business Profile</h1>
            <p className="text-gray-500 text-sm">Manage Your Business Information And Branding</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Edit Profile" icon={SquarePen} className="flex-1 sm:flex-none" />
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
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <User size={32} className="text-[#7E1080]" />
            </div>
            
            <div className="text-white">
              <h2 className="text-xl sm:text-2xl font-bold">John's Premium Services</h2>
              <p className="text-white/80 text-sm">Training & Placement Center</p>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <div className="flex items-center gap-2 border border-white/40 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              <CheckCircle size={16} className="text-white" />
              Verified Vendor
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Business Information */}
          <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6 space-y-4">
            <h3 className="text-[#7E1080] font-semibold text-lg">Business Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Select" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <input 
                  type="text" 
                  readOnly 
                  value="web development , App Development , digital marketing" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Tech Spark Technologies" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  readOnly 
                  rows={1}
                  value="Professional IT services provider company" 
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
                  value="+91 9585 555 555" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="text" 
                  readOnly 
                  value="tech@gmail.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  readOnly 
                  value="chhatrapati Sambhajinagar" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input 
                  type="text" 
                  readOnly 
                  value="www.tech.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm outline-none cursor-default" 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6">
          <h3 className="text-[#7E1080] font-semibold text-lg mb-4">Documents</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Document 1", title: "Business Proof" },
              { label: "Document 2", title: "ID proof" },
              { label: "Document 3", title: "Address Proof" },
              { label: "Document 5", title: "GST Certificate" },
            ].map((doc, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-4 flex items-center gap-4 border border-amber-100">
                <div className="w-10 h-10 bg-[#7E1080] rounded-lg flex items-center justify-center text-white shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{doc.label}</p>
                  <p className="font-semibold text-sm text-gray-800">{doc.title}</p>
                </div>
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
              <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload size={24} className="mb-2" />
                <span className="text-sm">Upload Logo</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Cover Image</p>
              <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload size={24} className="mb-2" />
                <span className="text-sm">Upload Cover Image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6">
          <h3 className="text-[#7E1080] font-semibold text-lg mb-4">Social Media Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input 
                type="text" 
                readOnly 
                value="https://facebook.com/yourpage" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input 
                type="text" 
                readOnly 
                value="https://instagram.com/yourpage" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input 
                type="text" 
                readOnly 
                value="https://linkedin.com/yourpage" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Youtube</label>
              <input 
                type="text" 
                readOnly 
                value="https://youtube.com/yourpage" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm outline-none cursor-default" 
              />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default BusinessProfile
