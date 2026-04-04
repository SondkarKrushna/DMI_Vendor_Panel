import React from 'react';
import Button from '../../components/buttons/Button';
import { FileText, Upload, User, PenSquare, Download, CheckCircle, SquarePen } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const BusinessProfile = () => {
  return (
    <Layout>
      <div className="p-4 sm:p-5 space-y-6 bg-white min-h-screen pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Business Profile</h1>
            <p className="text-gray-500 text-sm">Manage Your Business Information And Branding</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Edit Profile" icon={SquarePen} className="flex-1 sm:flex-none" />
            <button className="flex-1 sm:flex-none bg-[#f5c518] hover:bg-[#d4a017] text-black px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              <Download size={18} />
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
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">Select</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm whitespace-nowrap overflow-hidden text-ellipsis">web development , App Development , digital marketing</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">Tech Spark Technologies</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm min-h-[80px]">Professional IT services provider company</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-300 rounded-2xl px-5 py-6 space-y-4">
            <h3 className="text-[#7E1080] font-semibold text-lg">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">+91 9585 555 555</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">tech@gmail.com</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">chhatrapati Sambhajinagar</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-sm">www.tech.com</div>
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
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm">https://facebook.com/yourpage</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm">https://instagram.com/yourpage</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm">https://linkedin.com/yourpage</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Youtube</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400 text-sm">https://youtube.com/yourpage</div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default BusinessProfile
